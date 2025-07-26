<template>
  <div class="app-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>提交供款清单</h2>
      <p class="page-description">上传手动供款清单，系统将根据清单内容生成供款账单</p>
    </div>

    <!-- 提交表单 -->
    <el-card shadow="never" class="form-card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        size="large"
      >
        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="选择计划" prop="planId" required>
              <el-select 
                v-model="formData.planId" 
                placeholder="请选择供款计划"
                style="width: 100%"
                @change="handlePlanChange"
              >
                <el-option 
                  v-for="plan in planOptions" 
                  :key="plan.id" 
                  :label="plan.name" 
                  :value="plan.id"
                >
                  <span style="float: left">{{ plan.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">
                    {{ plan.description }}
                  </span>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="供款月份" prop="contributionMonth" required>
              <el-date-picker
                v-model="formData.contributionMonth"
                type="month"
                placeholder="选择供款月份"
                format="YYYY年MM月"
                value-format="YYYY-MM"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供款类型" prop="contributionType">
              <el-select 
                v-model="formData.contributionType" 
                placeholder="请选择供款类型"
                style="width: 100%"
              >
                <el-option label="正常供款" value="normal" />
                <el-option label="补缴供款" value="makeup" />
                <el-option label="调整供款" value="adjustment" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="清单备注" prop="remarks">
              <el-input
                v-model="formData.remarks"
                type="textarea"
                :rows="3"
                placeholder="请输入供款清单的相关说明或备注信息"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="供款清单" prop="fileList">
              <div class="upload-section">
                <el-upload
                  ref="uploadRef"
                  :file-list="formData.fileList"
                  :before-upload="beforeUpload"
                  :on-change="handleFileChange"
                  :on-remove="handleRemove"
                  :auto-upload="false"
                  accept=".xlsx,.xls,.csv"
                  :limit="1"
                  drag
                >
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传</em>
                  </div>
                  <template #tip>
                    <div class="el-upload__tip">
                      只能上传 Excel 或 CSV 格式文件，且不超过 10MB
                    </div>
                  </template>
                </el-upload>
                
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="附件备注" prop="attachmentRemarks">
              <el-input
                v-model="formData.attachmentRemarks"
                type="textarea"
                :rows="3"
                placeholder="请输入附件的相关说明或备注信息"
                maxlength="200"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="调整附件" prop="attachments">
              <div class="upload-section">
                <el-upload
                  ref="attachmentUploadRef"
                  :file-list="formData.attachments"
                  :before-upload="beforeAttachmentUpload"
                  :on-change="handleAttachmentChange"
                  :on-remove="handleAttachmentRemove"
                  :auto-upload="false"
                  accept=".xlsx,.xls,.csv,.jpg,.jpeg,.png,.gif,.pdf"
                  multiple
                  drag
                >
                  <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                  <div class="el-upload__text">
                    将附件拖到此处，或<em>点击上传</em>
                  </div>
                  <template #tip>
                    <div class="el-upload__tip">
                      本期供款调整内容附件，支持 Excel、图片、PDF 格式，单个文件不超过 10MB
                    </div>
                  </template>
                </el-upload>
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <el-row>
          <el-col :span="24">
            <div class="form-actions">
              <el-button size="large" @click="handleReset">重置</el-button>
              <el-button 
                type="primary" 
                size="large" 
                :loading="submitting"
                @click="handleSubmit"
              >
                {{ submitting ? '提交中...' : '提交供款清单' }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 提交历史 -->
    <el-card shadow="never" class="history-card" v-if="historyList.length > 0">
      <template #header>
        <div class="card-header">
          <span>最近提交记录</span>
        </div>
      </template>
      
      <el-table :data="historyList" stripe>
        <el-table-column prop="planName" label="计划名称" width="200" />
        <el-table-column prop="contributionMonth" label="供款月份" width="120" align="center" />
        <el-table-column prop="contributionType" label="供款类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag size="small">{{ getContributionTypeText(row.contributionType) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="180" align="center" />
        <el-table-column prop="remarks" label="备注" min-width="200" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// 表单引用
const formRef = ref(null)
const uploadRef = ref(null)
const attachmentUploadRef = ref(null)

// 表单数据
const formData = reactive({
  planId: '',
  contributionMonth: '',
  contributionType: 'normal',
  remarks: '',
  attachmentRemarks: '',
  fileList: [],
  attachments: []
})

// 表单校验规则
const formRules = {
  planId: [
    { required: true, message: '请选择供款计划', trigger: 'change' }
  ],
  contributionMonth: [
    { required: true, message: '请选择供款月份', trigger: 'change' }
  ]
}

// 页面状态
const submitting = ref(false)

// 计划选项
const planOptions = ref([
  { 
    id: 1, 
    name: '央积金计划A', 
    description: '企业标准计划' 
  },
  { 
    id: 2, 
    name: '央积金计划B', 
    description: '高级企业计划' 
  },
  { 
    id: 3, 
    name: '央积金计划C', 
    description: '灵活企业计划' 
  }
])

// 提交历史
const historyList = ref([
  {
    planName: '央积金计划A',
    contributionMonth: '2024-01',
    contributionType: 'normal',
    status: 'approved',
    submitTime: '2024-01-10 14:30:00',
    remarks: '正常月度供款'
  },
  {
    planName: '央积金计划B',
    contributionMonth: '2023-12',
    contributionType: 'makeup',
    status: 'pending',
    submitTime: '2024-01-05 09:15:00',
    remarks: '补缴2023年12月供款'
  }
])

// 计划变更处理
const handlePlanChange = (planId) => {
  console.log('选择的计划ID:', planId)
  // TODO: 根据计划获取相关信息
}

// 文件上传前验证
const beforeUpload = (file) => {
  const isValidType = /\.(xlsx?|csv)$/i.test(file.name)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传 Excel 或 CSV 格式的文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过 10MB!')
    return false
  }
  return true
}

// 文件变更处理
const handleFileChange = (file, fileList) => {
  if (file.status === 'ready') {
    // 文件选择成功，添加到表单数据
    formData.fileList = [file]
    ElMessage.success('文件选择成功')
    console.log('选择的文件:', file.name)
  }
}

// 移除文件
const handleRemove = () => {
  formData.fileList = []
}

// 附件上传前验证
const beforeAttachmentUpload = (file) => {
  const isValidType = /\.(xlsx?|csv|jpe?g|png|gif|pdf)$/i.test(file.name)
  const isLt10M = file.size / 1024 / 1024 < 10

  if (!isValidType) {
    ElMessage.error('只能上传 Excel、图片或 PDF 格式的文件!')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('上传文件大小不能超过 10MB!')
    return false
  }
  return true
}

// 附件变更处理
const handleAttachmentChange = (file, fileList) => {
  if (file.status === 'ready') {
    formData.attachments = fileList
    ElMessage.success(`附件"${file.name}"选择成功`)
    console.log('选择的附件:', file.name)
  }
}

// 移除附件
const handleAttachmentRemove = (file, fileList) => {
  formData.attachments = fileList
  ElMessage.info(`已移除附件"${file.name}"`)
}


// 提交表单
const handleSubmit = async () => {
  try {
    // 表单验证
    await formRef.value.validate()
    
    if (formData.fileList.length === 0) {
      ElMessage.error('请上传供款清单文件')
      return
    }

    const confirmMessage = formData.attachments.length > 0 
      ? `确认要提交这个供款清单吗？提交后将等待审核。\n\n包含 ${formData.attachments.length} 个调整附件`
      : '确认要提交这个供款清单吗？提交后将等待审核。'
      
    await ElMessageBox.confirm(
      confirmMessage,
      '确认提交',
      { type: 'warning' }
    )

    submitting.value = true

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 添加到历史记录
    const planName = planOptions.value.find(p => p.id === formData.planId)?.name
    historyList.value.unshift({
      planName,
      contributionMonth: formData.contributionMonth,
      contributionType: formData.contributionType,
      status: 'pending',
      submitTime: new Date().toLocaleString('zh-CN'),
      remarks: formData.remarks || '无'
    })

    ElMessage.success('供款清单提交成功，已进入审核流程')
    handleReset()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交失败:', error)
      ElMessage.error('提交失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    planId: '',
    contributionMonth: '',
    contributionType: 'normal',
    remarks: '',
    attachmentRemarks: '',
    fileList: [],
    attachments: []
  })
  uploadRef.value?.clearFiles()
  attachmentUploadRef.value?.clearFiles()
}

// 获取供款类型文本
const getContributionTypeText = (type) => {
  const textMap = {
    normal: '正常供款',
    makeup: '补缴供款',
    adjustment: '调整供款'
  }
  return textMap[type] || type
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: '',
    approved: 'success',
    rejected: 'danger'
  }
  return typeMap[status]
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status]
}

// 初始化
onMounted(() => {
  // 从路由参数中获取预填信息
  if (route.query.planId) {
    formData.planId = parseInt(route.query.planId)
  }
  if (route.query.contributionMonth) {
    formData.contributionMonth = route.query.contributionMonth
  }
  if (route.query.resubmit) {
    ElMessage.info('重新提交供款清单，请选择新的清单文件')
  }
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;

  h2 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 20px;
    font-weight: 600;
  }

  .page-description {
    margin: 0;
    color: #606266;
    font-size: 14px;
  }
}

.form-card {
  margin-bottom: 24px;
}

.upload-section {
  // 上传区域样式
}

.form-actions {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;

  .el-button {
    min-width: 120px;
    margin: 0 12px;
  }
}

.history-card {
  .card-header {
    font-weight: 600;
    color: #303133;
  }
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 180px;
}

:deep(.el-form-item__label) {
  font-weight: 600;
}

:deep(.el-select .el-input) {
  width: 100%;
}
</style>