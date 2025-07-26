<template>
  <div class="termination-application">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>私退金終止參與計劃申請</span>
          <el-button type="info" @click="goBack">返回</el-button>
        </div>
      </template>

      <!-- 操作说明 -->
      <el-alert
        title="操作說明"
        type="info"
        :closable="false"
        show-icon
      >
        <div>
          請選擇需要終止參與計劃的僱員，填寫終止原因和最後工作日期。提交後將進入企業內部審核流程。
        </div>
      </el-alert>

      <!-- 选择计划 -->
      <div class="plan-select-section">
        <el-form :model="planForm" label-width="100px">
          <el-form-item label="選擇計劃">
            <el-select v-model="planForm.planId" placeholder="請選擇計劃" @change="onPlanChange">
              <el-option
                v-for="plan in planList"
                :key="plan.id"
                :label="`${plan.planNo} - ${plan.planName}`"
                :value="plan.id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 添加员工按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="showEmployeeDialog" :disabled="!planForm.planId">
          <el-icon><Plus /></el-icon>
          添加終止僱員
        </el-button>
        <el-button type="warning" @click="batchImport" :disabled="!planForm.planId">
          <el-icon><Upload /></el-icon>
          批量導入
        </el-button>
      </div>

      <!-- 终止申请列表 -->
      <div class="termination-list-section">
        <h4>終止申請列表</h4>
        <el-table :data="terminationList" style="width: 100%">
          <el-table-column type="index" label="序號" width="60" />
          <el-table-column prop="employeeNo" label="僱員編號" width="120" />
          <el-table-column prop="employeeName" label="僱員姓名" width="120" />
          <el-table-column prop="department" label="部門" width="120" />
          <el-table-column prop="position" label="職位" width="120" />
          <el-table-column prop="joinDate" label="加入日期" width="120" />
          <el-table-column prop="reason" label="終止原因" width="120">
            <template #default="scope">
              <el-tag :type="getReasonType(scope.row.reason)">
                {{ getReasonText(scope.row.reason) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lastWorkDate" label="最後工作日" width="120" />
          <el-table-column prop="currentContribution" label="當前供款額" width="120" align="right">
            <template #default="scope">
              ¥{{ formatMoney(scope.row.currentContribution) }}
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="備註" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button type="primary" link size="small" @click="editTermination(scope.row)">
                編輯
              </el-button>
              <el-button type="danger" link size="small" @click="removeTermination(scope.$index)">
                刪除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 提交区域 -->
      <div class="submit-section">
        <el-form :model="submitForm" label-width="100px">
          <el-form-item label="申請說明">
            <el-input
              v-model="submitForm.remark"
              type="textarea"
              :rows="3"
              placeholder="請簡要說明本次申請的原因..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitApplication" :disabled="terminationList.length === 0">
              提交審核
            </el-button>
            <el-button @click="saveAsDraft">暫存草稿</el-button>
            <el-button @click="clearAll">清空</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 选择员工对话框 -->
    <el-dialog
      v-model="employeeDialogVisible"
      title="選擇終止僱員"
      width="900px"
      :close-on-click-modal="false"
    >
      <el-table
        :data="availableEmployees"
        @selection-change="handleEmployeeSelection"
        row-key="id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="employeeNo" label="僱員編號" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="department" label="部門" width="120" />
        <el-table-column prop="position" label="職位" width="120" />
        <el-table-column prop="joinDate" label="加入日期" width="120" />
        <el-table-column prop="contribution" label="當前供款額" width="120" align="right">
          <template #default="scope">
            ¥{{ formatMoney(scope.row.contribution) }}
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="employeeDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEmployeeSelection" :disabled="selectedEmployees.length === 0">
          確認選擇（{{ selectedEmployees.length }}人）
        </el-button>
      </template>
    </el-dialog>

    <!-- 终止信息对话框 -->
    <el-dialog
      v-model="terminationDialogVisible"
      :title="terminationForm.isEdit ? '編輯終止信息' : '填寫終止信息'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="terminationForm" label-width="120px">
        <el-form-item label="僱員信息">
          <el-input :value="getEmployeeInfo()" readonly />
        </el-form-item>
        <el-form-item label="終止原因">
          <el-select v-model="terminationForm.reason" placeholder="請選擇原因">
            <el-option label="離職" value="resign" />
            <el-option label="退休" value="retire" />
            <el-option label="調離" value="transfer" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="最後工作日">
          <el-date-picker
            v-model="terminationForm.lastWorkDate"
            type="date"
            placeholder="選擇日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="備註">
          <el-input
            v-model="terminationForm.remark"
            type="textarea"
            :rows="3"
            placeholder="選填"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="terminationDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTermination">確定</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量導入終止申請"
      width="600px"
    >
      <el-upload
        class="upload-demo"
        drag
        action="#"
        :auto-upload="false"
        :file-list="fileList"
        :on-change="handleFileChange"
        accept=".xlsx,.xls"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          將文件拖到此處，或<em>點擊上傳</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            請上傳Excel文件，包含：僱員編號、終止原因、最後工作日、備註
          </div>
        </template>
      </el-upload>
      <div class="template-download">
        <el-button type="primary" link @click="downloadTemplate">
          下載導入模板
        </el-button>
      </div>
      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmImport" :disabled="!fileList.length">
          確認導入
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { Plus, Upload, UploadFilled } from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const planForm = reactive({
  planId: ''
})

const submitForm = reactive({
  remark: ''
})

const terminationForm = reactive({
  employeeId: '',
  employeeNo: '',
  employeeName: '',
  department: '',
  position: '',
  joinDate: '',
  currentContribution: 0,
  reason: '',
  lastWorkDate: '',
  remark: '',
  isEdit: false,
  editIndex: -1
})

// 计划列表
const planList = ref([
  {
    id: '1',
    planNo: 'PF-PLAN-001',
    planName: '私退金計劃A'
  },
  {
    id: '2',
    planNo: 'PF-PLAN-002',
    planName: '私退金計劃B'
  }
])

// 可选员工列表
const availableEmployees = ref([
  {
    id: '1',
    employeeNo: 'E202401001',
    name: '張三',
    department: '市場部',
    position: '經理',
    joinDate: '2024-01-01',
    contribution: 2500
  },
  {
    id: '2',
    employeeNo: 'E202401002',
    name: '李四',
    department: '技術部',
    position: '工程師',
    joinDate: '2024-02-01',
    contribution: 3000
  },
  {
    id: '3',
    employeeNo: 'E202401003',
    name: '王五',
    department: '財務部',
    position: '主管',
    joinDate: '2024-01-15',
    contribution: 2800
  },
  {
    id: '4',
    employeeNo: 'E202401004',
    name: '趙六',
    department: '人事部',
    position: '主任',
    joinDate: '2023-12-01',
    contribution: 3500
  },
  {
    id: '5',
    employeeNo: 'E202401005',
    name: '陳七',
    department: '營運部',
    position: '專員',
    joinDate: '2024-03-01',
    contribution: 2200
  }
])

// 终止申请列表
const terminationList = ref([])

// 选中的员工
const selectedEmployees = ref([])

// 对话框显示状态
const employeeDialogVisible = ref(false)
const terminationDialogVisible = ref(false)
const importDialogVisible = ref(false)

// 文件列表
const fileList = ref([])

// 格式化金额
const formatMoney = (amount) => {
  return amount ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// 获取终止原因文本
const getReasonText = (reason) => {
  const reasonMap = {
    'resign': '離職',
    'retire': '退休',
    'transfer': '調離',
    'other': '其他'
  }
  return reasonMap[reason] || reason
}

// 获取原因标签类型
const getReasonType = (reason) => {
  const typeMap = {
    'resign': 'danger',
    'retire': 'warning',
    'transfer': 'info',
    'other': 'info'
  }
  return typeMap[reason] || 'info'
}

// 获取员工信息
const getEmployeeInfo = () => {
  if (terminationForm.employeeName) {
    return `${terminationForm.employeeName}（${terminationForm.employeeNo}）`
  }
  return ''
}

// 计划变更
const onPlanChange = () => {
  // 清空已选择的终止列表
  if (terminationList.value.length > 0) {
    ElMessageBox.confirm('切換計劃將清空當前已選擇的終止申請，是否繼續？', '提示', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      terminationList.value = []
    }).catch(() => {
      // 恢复原选择
      planForm.planId = ''
    })
  }
}

// 显示员工选择对话框
const showEmployeeDialog = () => {
  selectedEmployees.value = []
  employeeDialogVisible.value = true
}

// 处理员工选择
const handleEmployeeSelection = (selection) => {
  selectedEmployees.value = selection
}

// 确认员工选择
const confirmEmployeeSelection = () => {
  if (selectedEmployees.value.length === 0) {
    ElMessage.warning('請至少選擇一名僱員')
    return
  }

  if (selectedEmployees.value.length === 1) {
    // 单个员工，直接打开终止信息对话框
    const employee = selectedEmployees.value[0]
    Object.assign(terminationForm, {
      employeeId: employee.id,
      employeeNo: employee.employeeNo,
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
      joinDate: employee.joinDate,
      currentContribution: employee.contribution,
      reason: '',
      lastWorkDate: '',
      remark: '',
      isEdit: false
    })
    employeeDialogVisible.value = false
    terminationDialogVisible.value = true
  } else {
    // 多个员工，批量添加默认信息
    selectedEmployees.value.forEach(emp => {
      terminationList.value.push({
        employeeId: emp.id,
        employeeNo: emp.employeeNo,
        employeeName: emp.name,
        department: emp.department,
        position: emp.position,
        joinDate: emp.joinDate,
        currentContribution: emp.contribution,
        reason: 'resign',
        lastWorkDate: '',
        remark: ''
      })
    })
    employeeDialogVisible.value = false
    ElMessage.success(`已添加 ${selectedEmployees.value.length} 名僱員的終止申請`)
  }
}

// 确认终止信息
const confirmTermination = () => {
  if (!terminationForm.reason || !terminationForm.lastWorkDate) {
    ElMessage.error('請填寫完整信息')
    return
  }

  if (terminationForm.isEdit) {
    // 编辑模式
    Object.assign(terminationList.value[terminationForm.editIndex], {
      reason: terminationForm.reason,
      lastWorkDate: terminationForm.lastWorkDate,
      remark: terminationForm.remark
    })
    ElMessage.success('已更新終止信息')
  } else {
    // 新增模式
    terminationList.value.push({
      employeeId: terminationForm.employeeId,
      employeeNo: terminationForm.employeeNo,
      employeeName: terminationForm.employeeName,
      department: terminationForm.department,
      position: terminationForm.position,
      joinDate: terminationForm.joinDate,
      currentContribution: terminationForm.currentContribution,
      reason: terminationForm.reason,
      lastWorkDate: terminationForm.lastWorkDate,
      remark: terminationForm.remark
    })
    ElMessage.success('已添加終止申請')
  }

  terminationDialogVisible.value = false
}

// 编辑终止信息
const editTermination = (row) => {
  const index = terminationList.value.indexOf(row)
  Object.assign(terminationForm, {
    ...row,
    isEdit: true,
    editIndex: index
  })
  terminationDialogVisible.value = true
}

// 删除终止申请
const removeTermination = (index) => {
  ElMessageBox.confirm('確定要刪除這條終止申請嗎？', '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    terminationList.value.splice(index, 1)
    ElMessage.success('已刪除')
  }).catch(() => {})
}

// 批量导入
const batchImport = () => {
  fileList.value = []
  importDialogVisible.value = true
}

// 处理文件变化
const handleFileChange = (file) => {
  fileList.value = [file]
}

// 下载模板
const downloadTemplate = () => {
  ElMessage.success('正在下載導入模板...')
  // 实际项目中调用下载API
}

// 确认导入
const confirmImport = () => {
  // 模拟导入数据
  const importData = [
    {
      employeeId: '6',
      employeeNo: 'E202401006',
      employeeName: '周九',
      department: '客服部',
      position: '主管',
      joinDate: '2024-01-10',
      currentContribution: 2600,
      reason: 'resign',
      lastWorkDate: '2025-03-31',
      remark: '個人原因離職'
    },
    {
      employeeId: '7',
      employeeNo: 'E202401007',
      employeeName: '吳十',
      department: '法務部',
      position: '律師',
      joinDate: '2024-02-15',
      currentContribution: 4500,
      reason: 'retire',
      lastWorkDate: '2025-04-01',
      remark: '到齡退休'
    }
  ]

  terminationList.value.push(...importData)
  importDialogVisible.value = false
  ElMessage.success(`成功導入 ${importData.length} 條終止申請`)
}

// 提交申请
const submitApplication = () => {
  if (terminationList.value.length === 0) {
    ElMessage.error('請至少添加一條終止申請')
    return
  }

  // 检查所有记录是否填写完整
  const incomplete = terminationList.value.filter(item => !item.lastWorkDate)
  if (incomplete.length > 0) {
    ElMessage.error(`有 ${incomplete.length} 條記錄未填寫最後工作日`)
    return
  }

  ElMessageBox.confirm(
    `確定要提交終止參與計劃申請嗎？\n\n共 ${terminationList.value.length} 名僱員\n\n提交後將進入企業內部審核流程。`,
    '確認提交',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage.success('終止參與計劃申請已提交，等待企業內部審核')
    
    // 跳转到待办列表
    setTimeout(() => {
      router.push('/private-fund/todo')
    }, 1500)
  }).catch(() => {})
}

// 暂存草稿
const saveAsDraft = () => {
  ElMessage.success('草稿已暫存')
}

// 清空
const clearAll = () => {
  ElMessageBox.confirm('確定要清空所有終止申請嗎？', '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    terminationList.value = []
    submitForm.remark = ''
    ElMessage.success('已清空')
  }).catch(() => {})
}

// 返回
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.termination-application {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-select-section {
  margin: 20px 0;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.action-buttons {
  margin: 20px 0;
  display: flex;
  gap: 12px;
}

.termination-list-section {
  margin-top: 30px;
}

.termination-list-section h4 {
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
}

.submit-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.template-download {
  margin-top: 20px;
  text-align: center;
}

:deep(.el-alert__content) {
  line-height: 1.6;
}

.upload-demo {
  width: 100%;
}
</style>