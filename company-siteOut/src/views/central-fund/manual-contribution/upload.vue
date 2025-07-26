<template>
  <div class="manual-contribution-upload">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>央積金手動供款 - 提交供款清單</span>
          <el-button v-if="selectedPlan" type="text" @click="backToPlanList">
            返回計劃列表
          </el-button>
        </div>
      </template>
      
      <!-- 计划选择界面 -->
      <div v-if="!selectedPlan" class="plan-selection">
        <div class="section-header">
          <h3>請選擇要進行手動供款的計劃</h3>
          <p class="text-muted">手動供款適用於企業自行提供供款金額的情況</p>
        </div>
        
        <el-row :gutter="20">
          <el-col :span="12" v-for="plan in companyPlans" :key="plan.id">
            <el-card 
              class="plan-card" 
              @click="selectPlan(plan)"
              shadow="hover"
            >
              <template #header>
                <div class="plan-header">
                  <div>
                    <h4>{{ plan.planName }}</h4>
                    <el-tag type="primary" size="small">{{ plan.planNo }}</el-tag>
                  </div>
                  <el-tag :type="plan.status === 'active' ? 'success' : 'info'">
                    {{ plan.status === 'active' ? '生效中' : '待生效' }}
                  </el-tag>
                </div>
              </template>
              
              <div class="plan-details">
                <div class="detail-row">
                  <span class="label">計劃類型：</span>
                  <span class="value">{{ plan.planType }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">參與人數：</span>
                  <span class="value">{{ plan.memberCount }} 人</span>
                </div>
                <div class="detail-row">
                  <span class="label">上月供款：</span>
                  <span class="value amount">¥{{ formatMoney(plan.lastMonthAmount) }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">生效日期：</span>
                  <span class="value">{{ plan.effectiveDate }}</span>
                </div>
              </div>
              
              <div class="plan-footer">
                <el-button type="primary" size="small">
                  選擇此計劃
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <!-- 计划详情和供款表单 -->
      <div v-else>
        <!-- 计划信息摘要 -->
        <div class="plan-summary">
          <el-alert type="info" :closable="false">
            <template #title>
              <div class="summary-content">
                <span>當前選擇計劃：<strong>{{ selectedPlan.planName }}</strong></span>
                <span class="mx-4">|</span>
                <span>計劃編號：{{ selectedPlan.planNo }}</span>
                <span class="mx-4">|</span>
                <span>參與人數：{{ selectedPlan.memberCount }} 人</span>
              </div>
            </template>
          </el-alert>
        </div>
        
        <!-- 供款信息表单 -->
        <el-form 
          :model="contributionForm" 
          :rules="contributionRules" 
          ref="contributionFormRef" 
          label-width="140px"
          class="contribution-form"
        >
          <el-divider content-position="left">供款基本信息</el-divider>
          
          <!-- 移除供款類型，只保留正常供款 -->
          
          <el-form-item label="供款期間" prop="contributionPeriod">
            <el-date-picker
              v-model="contributionForm.contributionPeriod"
              type="month"
              placeholder="選擇供款月份"
              format="YYYY年MM月"
              value-format="YYYY-MM"
            />
          </el-form-item>
          
          <el-form-item label="供款說明" prop="description">
            <el-input
              v-model="contributionForm.description"
              type="textarea"
              :rows="3"
              placeholder="請說明手動供款的原因"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          
          <el-divider content-position="left">上傳供款清單</el-divider>
          
          <el-form-item label="供款清單文件" prop="contributionList">
            <el-upload
              v-model:file-list="contributionListFiles"
              class="upload-demo"
              action="#"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :before-upload="beforeListUpload"
              :auto-upload="false"
              :limit="1"
              accept=".xlsx,.xls,.csv"
            >
              <el-button type="primary">選擇供款清單</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  請上傳Excel格式的供款清單，包含員工姓名、身份證號、供款基數、供款金額等信息
                  <el-button type="text" @click="downloadTemplate">下載模板</el-button>
                </div>
              </template>
            </el-upload>
          </el-form-item>
          
          <!-- 清单预览 -->
          <el-form-item label="清單預覽" v-if="previewData">
            <div class="list-preview">
              <el-table :data="previewData" style="width: 100%" max-height="300">
                <el-table-column prop="employeeName" label="員工姓名" width="120" />
                <el-table-column prop="idNumber" label="身份證號" width="180" />
                <el-table-column prop="contributionBase" label="供款基數" width="120" align="right">
                  <template #default="scope">
                    ¥{{ formatMoney(scope.row.contributionBase) }}
                  </template>
                </el-table-column>
                <el-table-column prop="employerAmount" label="雇主供款" width="120" align="right">
                  <template #default="scope">
                    ¥{{ formatMoney(scope.row.employerAmount) }}
                  </template>
                </el-table-column>
                <el-table-column prop="employeeAmount" label="僱員供款" width="120" align="right">
                  <template #default="scope">
                    ¥{{ formatMoney(scope.row.employeeAmount) }}
                  </template>
                </el-table-column>
              </el-table>
              <div class="preview-summary">
                <span>總人數：{{ previewData.length }} 人</span>
                <span>總金額：¥{{ formatMoney(totalAmount) }}</span>
              </div>
            </div>
          </el-form-item>
          
          <el-divider content-position="left">上傳支付憑證</el-divider>
          
          <el-form-item label="支付方式" prop="paymentMethod">
            <el-select v-model="contributionForm.paymentMethod" placeholder="請選擇支付方式">
              <el-option label="支票" value="check" />
              <el-option label="銀行轉賬" value="transfer" />
              <el-option label="現金" value="cash" />
            </el-select>
          </el-form-item>
          
          <el-form-item 
            v-if="contributionForm.paymentMethod === 'check'" 
            label="支票號碼" 
            prop="checkNumber"
          >
            <el-input v-model="contributionForm.checkNumber" placeholder="請輸入支票號碼" />
          </el-form-item>
          
          <el-form-item label="支付憑證" prop="paymentVoucher">
            <el-upload
              v-model:file-list="voucherFiles"
              class="upload-demo"
              action="#"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :before-upload="beforeVoucherUpload"
              :auto-upload="false"
              multiple
              :limit="5"
              list-type="picture-card"
              accept="image/*,.pdf"
            >
              <el-icon><Plus /></el-icon>
              <template #tip>
                <div class="el-upload__tip">
                  請上傳支票、銀行轉賬憑證等支付證明，支持JPG/PNG/PDF格式
                </div>
              </template>
            </el-upload>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="submitContribution" :loading="submitting">
              提交供款申請
            </el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
    
    <!-- 模板下载对话框 -->
    <el-dialog v-model="templateDialogVisible" title="下載供款清單模板" width="500px">
      <p>請選擇適合您的供款清單模板：</p>
      <div class="template-list">
        <div class="template-item" @click="downloadTemplateFile('normal')">
          <el-icon><Document /></el-icon>
          <span>正常供款模板</span>
        </div>
        <div class="template-item" @click="downloadTemplateFile('adjustment')">
          <el-icon><Document /></el-icon>
          <span>調整供款模板</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { Plus, Document } from '@element-plus/icons-vue'

const router = useRouter()

// 公司计划列表
const companyPlans = ref([
  {
    id: 1,
    planNo: 'CPF-PLAN-001',
    planName: '央積金計劃A',
    planType: '標準計劃',
    status: 'active',
    memberCount: 50,
    lastMonthAmount: 125000,
    effectiveDate: '2023-01-01'
  },
  {
    id: 2,
    planNo: 'CPF-PLAN-002',
    planName: '央積金計劃B',
    planType: '標準計劃',
    status: 'active',
    memberCount: 30,
    lastMonthAmount: 80000,
    effectiveDate: '2023-06-01'
  }
])

// 选中的计划
const selectedPlan = ref(null)

// 供款表单
const contributionForm = reactive({
  contributionPeriod: '',
  description: '',
  paymentMethod: '',
  checkNumber: ''
})

// 文件列表
const contributionListFiles = ref([])
const voucherFiles = ref([])

// 清单预览数据
const previewData = ref(null)

// 其他状态
const submitting = ref(false)
const templateDialogVisible = ref(false)

// 表单验证规则 - 已移除必填项检查
const contributionRules = {
  contributionPeriod: [],
  description: [],
  paymentMethod: [],
  checkNumber: []
}

// 计算总金额
const totalAmount = computed(() => {
  if (!previewData.value) return 0
  return previewData.value.reduce((sum, item) => {
    return sum + item.employerAmount + item.employeeAmount
  }, 0)
})

// 格式化金额
const formatMoney = (amount) => {
  return amount ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// 选择计划
const selectPlan = (plan) => {
  selectedPlan.value = plan
}

// 返回计划列表
const backToPlanList = () => {
  ElMessageBox.confirm('返回將清空當前填寫的內容，是否確認？', '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    selectedPlan.value = null
    resetForm()
  }).catch(() => {})
}

// 文件上传前验证 - 供款清单
const beforeListUpload = (file) => {
  const isValidType = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
                      'application/vnd.ms-excel', 
                      'text/csv'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('供款清單必須是 Excel 或 CSV 格式')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超過 10MB')
    return false
  }
  
  // 模拟解析文件并预览
  setTimeout(() => {
    previewData.value = [
      {
        employeeName: '張三',
        idNumber: 'M1234567(8)',
        contributionBase: 25000,
        employerAmount: 1250,
        employeeAmount: 1250
      },
      {
        employeeName: '李四',
        idNumber: 'M2345678(9)',
        contributionBase: 30000,
        employerAmount: 1500,
        employeeAmount: 1500
      },
      {
        employeeName: '王五',
        idNumber: 'M3456789(0)',
        contributionBase: 28000,
        employerAmount: 1400,
        employeeAmount: 1400
      }
    ]
  }, 500)
  
  return true
}

// 文件上传前验证 - 支付凭证
const beforeVoucherUpload = (file) => {
  const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'].includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isValidType) {
    ElMessage.error('支付憑證必須是圖片或 PDF 格式')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('文件大小不能超過 5MB')
    return false
  }
  return true
}

// 文件预览
const handlePreview = (file) => {
  console.log('预览文件:', file)
}

// 文件移除
const handleRemove = (file) => {
  console.log('移除文件:', file)
}

// 下载模板
const downloadTemplate = () => {
  templateDialogVisible.value = true
}

// 下载模板文件
const downloadTemplateFile = (type) => {
  ElMessage.success(`正在下載${type === 'normal' ? '正常' : '調整'}供款模板...`)
  templateDialogVisible.value = false
}

// 提交表单
const contributionFormRef = ref()
const submitContribution = async () => {
  // 移除验证，直接提交
  // const valid = await contributionFormRef.value.validate()
  // if (!valid) return
  
  // 移除必填项检查
  // if (contributionListFiles.value.length === 0) {
  //   ElMessage.error('請上傳供款清單')
  //   return
  // }
  
  // if (voucherFiles.value.length === 0) {
  //   ElMessage.error('請上傳支付憑證')
  //   return
  // }
  
  submitting.value = true
  
  // 模拟提交
  setTimeout(() => {
    submitting.value = false
    ElMessage.success('供款申請已提交，請等待內部審核')
    
    // 跳转到待办列表
    router.push('/central-fund/todo')
  }, 1500)
}

// 重置表单
const resetForm = () => {
  contributionFormRef.value?.resetFields()
  contributionListFiles.value = []
  voucherFiles.value = []
  previewData.value = null
}
</script>

<style scoped>
.manual-contribution-upload {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-selection {
  padding: 20px 0;
}

.section-header {
  text-align: center;
  margin-bottom: 30px;
}

.section-header h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  color: #303133;
}

.text-muted {
  color: #909399;
  font-size: 14px;
}

.plan-card {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.plan-card:hover {
  transform: translateY(-4px);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.plan-header h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #303133;
}

.plan-details {
  padding: 16px 0;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.detail-row .label {
  color: #909399;
}

.detail-row .value {
  color: #606266;
  font-weight: 500;
}

.detail-row .amount {
  color: #2C8976;
  font-weight: bold;
}

.plan-footer {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid #EBEEF5;
}

.plan-summary {
  margin-bottom: 30px;
}

.summary-content {
  display: flex;
  align-items: center;
}

.contribution-form {
  max-width: 800px;
  margin: 0 auto;
}

.list-preview {
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  padding: 16px;
  background-color: #F5F7FA;
}

.preview-summary {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #E4E7ED;
  font-weight: 500;
}

.template-list {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.template-item {
  flex: 1;
  padding: 20px;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.template-item:hover {
  border-color: #2C8976;
  color: #2C8976;
}

.template-item .el-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

:deep(.el-upload-list--picture-card) {
  display: inline-flex;
  flex-wrap: wrap;
}
</style>