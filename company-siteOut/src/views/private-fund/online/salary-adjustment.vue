<template>
  <div class="salary-adjustment">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>私退金薪資調整申請</span>
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
          請選擇需要進行薪資調整的僱員，填寫新薪資信息。系統將自動計算供款額的變化。提交後將進入企業內部審核流程。
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
          添加薪資調整僱員
        </el-button>
        <el-button type="warning" @click="batchImport" :disabled="!planForm.planId">
          <el-icon><Upload /></el-icon>
          批量導入
        </el-button>
      </div>

      <!-- 薪资调整列表 -->
      <div class="adjustment-list-section">
        <h4>薪資調整列表</h4>
        <el-table :data="adjustmentList" style="width: 100%" show-summary :summary-method="getSummaries">
          <el-table-column type="index" label="序號" width="60" />
          <el-table-column prop="employeeNo" label="僱員編號" width="120" />
          <el-table-column prop="employeeName" label="僱員姓名" width="120" />
          <el-table-column prop="department" label="部門" width="120" />
          <el-table-column prop="position" label="職位" width="120" />
          <el-table-column label="原薪資" width="120" align="right">
            <template #default="scope">
              ¥{{ formatMoney(scope.row.oldSalary) }}
            </template>
          </el-table-column>
          <el-table-column label="新薪資" width="120" align="right">
            <template #default="scope">
              <span class="highlight-text">¥{{ formatMoney(scope.row.newSalary) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="薪資變化" width="120" align="right">
            <template #default="scope">
              <span :class="['change-text', scope.row.salaryChange > 0 ? 'increase' : 'decrease']">
                {{ scope.row.salaryChange > 0 ? '+' : '' }}{{ formatMoney(scope.row.salaryChange) }}
                ({{ scope.row.changePercent }}%)
              </span>
            </template>
          </el-table-column>
          <el-table-column label="供款變化" width="120" align="right">
            <template #default="scope">
              <span :class="['change-text', scope.row.contributionChange > 0 ? 'increase' : 'decrease']">
                {{ scope.row.contributionChange > 0 ? '+' : '' }}¥{{ formatMoney(scope.row.contributionChange) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="adjustmentReason" label="調整原因" width="120">
            <template #default="scope">
              {{ getReasonText(scope.row.adjustmentReason) }}
            </template>
          </el-table-column>
          <el-table-column prop="effectiveDate" label="生效日期" width="120" />
          <el-table-column prop="remark" label="備註" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button type="primary" link size="small" @click="editAdjustment(scope.row)">
                編輯
              </el-button>
              <el-button type="danger" link size="small" @click="removeAdjustment(scope.$index)">
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
            <el-button type="primary" @click="submitApplication" :disabled="adjustmentList.length === 0">
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
      title="選擇薪資調整僱員"
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
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="department" label="部門" width="120" />
        <el-table-column prop="position" label="職位" width="120" />
        <el-table-column prop="joinDate" label="入職日期" width="120" />
        <el-table-column prop="salary" label="當前薪資" width="120" align="right">
          <template #default="scope">
            ¥{{ formatMoney(scope.row.salary) }}
          </template>
        </el-table-column>
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

    <!-- 薪资调整信息对话框 -->
    <el-dialog
      v-model="adjustmentDialogVisible"
      :title="adjustmentForm.isEdit ? '編輯薪資調整信息' : '填寫薪資調整信息'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="adjustmentForm" label-width="120px">
        <el-form-item label="僱員信息">
          <el-input :value="getEmployeeInfo()" readonly />
        </el-form-item>
        <el-form-item label="當前薪資">
          <el-input :value="`¥${formatMoney(adjustmentForm.oldSalary)}`" readonly />
        </el-form-item>
        <el-form-item label="新薪資">
          <el-input-number
            v-model="adjustmentForm.newSalary"
            :min="0"
            :step="1000"
            placeholder="請輸入新薪資"
            @change="calculateChanges"
          />
        </el-form-item>
        <el-form-item label="薪資變化">
          <el-input :value="getSalaryChangeInfo()" readonly>
            <template #suffix>
              <span :class="adjustmentForm.salaryChange > 0 ? 'increase' : 'decrease'">
                {{ adjustmentForm.changePercent }}%
              </span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="供款額變化">
          <el-input :value="getContributionChangeInfo()" readonly />
        </el-form-item>
        <el-form-item label="調整原因">
          <el-select v-model="adjustmentForm.adjustmentReason" placeholder="請選擇原因">
            <el-option label="年度調薪" value="annual" />
            <el-option label="晉升調薪" value="promotion" />
            <el-option label="績效調薪" value="performance" />
            <el-option label="市場調整" value="market" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="生效日期">
          <el-date-picker
            v-model="adjustmentForm.effectiveDate"
            type="date"
            placeholder="選擇日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="備註">
          <el-input
            v-model="adjustmentForm.remark"
            type="textarea"
            :rows="3"
            placeholder="選填"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjustmentDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAdjustment">確定</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量導入薪資調整"
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
            請上傳Excel文件，包含：僱員編號、新薪資、調整原因、生效日期、備註
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
import { ref, reactive } from 'vue'
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

const adjustmentForm = reactive({
  employeeId: '',
  employeeNo: '',
  employeeName: '',
  department: '',
  position: '',
  oldSalary: 0,
  oldContribution: 0,
  newSalary: 0,
  newContribution: 0,
  salaryChange: 0,
  changePercent: 0,
  contributionChange: 0,
  adjustmentReason: '',
  effectiveDate: '',
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
    joinDate: '2020-03-15',
    salary: 25000,
    contribution: 2500
  },
  {
    id: '2',
    employeeNo: 'E202401002',
    name: '李四',
    department: '技術部',
    position: '工程師',
    joinDate: '2021-06-20',
    salary: 30000,
    contribution: 3000
  },
  {
    id: '3',
    employeeNo: 'E202401003',
    name: '王五',
    department: '財務部',
    position: '主管',
    joinDate: '2019-09-10',
    salary: 28000,
    contribution: 2800
  },
  {
    id: '4',
    employeeNo: 'E202401004',
    name: '趙六',
    department: '人事部',
    position: '主任',
    joinDate: '2022-01-05',
    salary: 35000,
    contribution: 3500
  },
  {
    id: '5',
    employeeNo: 'E202401005',
    name: '陳七',
    department: '營運部',
    position: '專員',
    joinDate: '2023-04-15',
    salary: 22000,
    contribution: 2200
  }
])

// 薪资调整列表
const adjustmentList = ref([])

// 选中的员工
const selectedEmployees = ref([])

// 对话框显示状态
const employeeDialogVisible = ref(false)
const adjustmentDialogVisible = ref(false)
const importDialogVisible = ref(false)

// 文件列表
const fileList = ref([])

// 格式化金额
const formatMoney = (amount) => {
  return amount ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// 获取员工信息
const getEmployeeInfo = () => {
  if (adjustmentForm.employeeName) {
    return `${adjustmentForm.employeeName}（${adjustmentForm.employeeNo}）- ${adjustmentForm.department}/${adjustmentForm.position}`
  }
  return ''
}

// 获取薪资变化信息
const getSalaryChangeInfo = () => {
  const change = adjustmentForm.salaryChange
  const prefix = change > 0 ? '+' : ''
  return `${prefix}¥${formatMoney(Math.abs(change))}`
}

// 获取供款变化信息
const getContributionChangeInfo = () => {
  const change = adjustmentForm.contributionChange
  const prefix = change > 0 ? '+' : ''
  return `${prefix}¥${formatMoney(Math.abs(change))}`
}

// 获取原因文本
const getReasonText = (reason) => {
  const reasonMap = {
    'annual': '年度調薪',
    'promotion': '晉升調薪',
    'performance': '績效調薪',
    'market': '市場調整',
    'other': '其他'
  }
  return reasonMap[reason] || reason
}

// 计算变化
const calculateChanges = () => {
  const oldSalary = adjustmentForm.oldSalary
  const newSalary = adjustmentForm.newSalary
  
  // 计算薪资变化
  adjustmentForm.salaryChange = newSalary - oldSalary
  adjustmentForm.changePercent = oldSalary > 0 ? Number(((adjustmentForm.salaryChange / oldSalary) * 100).toFixed(2)) : 0
  
  // 计算供款变化（假设供款率为10%）
  const contributionRate = 0.1
  adjustmentForm.newContribution = Math.round(newSalary * contributionRate)
  adjustmentForm.contributionChange = adjustmentForm.newContribution - adjustmentForm.oldContribution
}

// 计划变更
const onPlanChange = () => {
  // 清空已选择的调整列表
  if (adjustmentList.value.length > 0) {
    ElMessageBox.confirm('切換計劃將清空當前已選擇的薪資調整申請，是否繼續？', '提示', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      adjustmentList.value = []
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
    // 单个员工，直接打开调整信息对话框
    const employee = selectedEmployees.value[0]
    Object.assign(adjustmentForm, {
      employeeId: employee.id,
      employeeNo: employee.employeeNo,
      employeeName: employee.name,
      department: employee.department,
      position: employee.position,
      oldSalary: employee.salary,
      oldContribution: employee.contribution,
      newSalary: employee.salary,
      newContribution: employee.contribution,
      salaryChange: 0,
      changePercent: 0,
      contributionChange: 0,
      adjustmentReason: '',
      effectiveDate: '',
      remark: '',
      isEdit: false
    })
    employeeDialogVisible.value = false
    adjustmentDialogVisible.value = true
  } else {
    // 多个员工，批量添加默认信息
    selectedEmployees.value.forEach(emp => {
      adjustmentList.value.push({
        employeeId: emp.id,
        employeeNo: emp.employeeNo,
        employeeName: emp.name,
        department: emp.department,
        position: emp.position,
        oldSalary: emp.salary,
        oldContribution: emp.contribution,
        newSalary: emp.salary,
        newContribution: emp.contribution,
        salaryChange: 0,
        changePercent: 0,
        contributionChange: 0,
        adjustmentReason: 'annual',
        effectiveDate: '',
        remark: ''
      })
    })
    employeeDialogVisible.value = false
    ElMessage.success(`已添加 ${selectedEmployees.value.length} 名僱員的薪資調整申請`)
  }
}

// 确认调整信息
const confirmAdjustment = () => {
  if (!adjustmentForm.newSalary || !adjustmentForm.adjustmentReason || !adjustmentForm.effectiveDate) {
    ElMessage.error('請填寫必要信息')
    return
  }

  if (adjustmentForm.newSalary === adjustmentForm.oldSalary) {
    ElMessage.warning('新薪資與原薪資相同')
    return
  }

  const data = {
    employeeId: adjustmentForm.employeeId,
    employeeNo: adjustmentForm.employeeNo,
    employeeName: adjustmentForm.employeeName,
    department: adjustmentForm.department,
    position: adjustmentForm.position,
    oldSalary: adjustmentForm.oldSalary,
    oldContribution: adjustmentForm.oldContribution,
    newSalary: adjustmentForm.newSalary,
    newContribution: adjustmentForm.newContribution,
    salaryChange: adjustmentForm.salaryChange,
    changePercent: adjustmentForm.changePercent,
    contributionChange: adjustmentForm.contributionChange,
    adjustmentReason: adjustmentForm.adjustmentReason,
    effectiveDate: adjustmentForm.effectiveDate,
    remark: adjustmentForm.remark
  }

  if (adjustmentForm.isEdit) {
    // 编辑模式
    Object.assign(adjustmentList.value[adjustmentForm.editIndex], data)
    ElMessage.success('已更新薪資調整信息')
  } else {
    // 新增模式
    adjustmentList.value.push(data)
    ElMessage.success('已添加薪資調整申請')
  }

  adjustmentDialogVisible.value = false
}

// 编辑调整信息
const editAdjustment = (row) => {
  const index = adjustmentList.value.indexOf(row)
  Object.assign(adjustmentForm, {
    ...row,
    isEdit: true,
    editIndex: index
  })
  adjustmentDialogVisible.value = true
}

// 删除调整申请
const removeAdjustment = (index) => {
  ElMessageBox.confirm('確定要刪除這條薪資調整申請嗎？', '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    adjustmentList.value.splice(index, 1)
    ElMessage.success('已刪除')
  }).catch(() => {})
}

// 获取汇总数据
const getSummaries = (param) => {
  const { columns, data } = param
  const sums = []
  
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '合計'
      return
    }
    
    if (column.property === 'salaryChange') {
      const total = data.reduce((sum, row) => sum + row.salaryChange, 0)
      sums[index] = `${total > 0 ? '+' : ''}${formatMoney(Math.abs(total))}`
    } else if (column.property === 'contributionChange') {
      const total = data.reduce((sum, row) => sum + row.contributionChange, 0)
      sums[index] = `${total > 0 ? '+' : ''}¥${formatMoney(Math.abs(total))}`
    } else {
      sums[index] = ''
    }
  })
  
  return sums
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
      oldSalary: 26000,
      oldContribution: 2600,
      newSalary: 30000,
      newContribution: 3000,
      salaryChange: 4000,
      changePercent: 15.38,
      contributionChange: 400,
      adjustmentReason: 'promotion',
      effectiveDate: '2025-04-01',
      remark: '晉升為高級主管'
    },
    {
      employeeId: '7',
      employeeNo: 'E202401007',
      employeeName: '吳十',
      department: '法務部',
      position: '律師',
      oldSalary: 45000,
      oldContribution: 4500,
      newSalary: 50000,
      newContribution: 5000,
      salaryChange: 5000,
      changePercent: 11.11,
      contributionChange: 500,
      adjustmentReason: 'annual',
      effectiveDate: '2025-04-01',
      remark: '年度調薪'
    }
  ]

  adjustmentList.value.push(...importData)
  importDialogVisible.value = false
  ElMessage.success(`成功導入 ${importData.length} 條薪資調整申請`)
}

// 提交申请
const submitApplication = () => {
  if (adjustmentList.value.length === 0) {
    ElMessage.error('請至少添加一條薪資調整申請')
    return
  }

  // 检查所有记录是否填写完整
  const incomplete = adjustmentList.value.filter(item => !item.effectiveDate || item.newSalary === item.oldSalary)
  if (incomplete.length > 0) {
    ElMessage.error(`有 ${incomplete.length} 條記錄信息不完整或未調整薪資`)
    return
  }

  // 计算总体变化
  const totalSalaryChange = adjustmentList.value.reduce((sum, item) => sum + item.salaryChange, 0)
  const totalContributionChange = adjustmentList.value.reduce((sum, item) => sum + item.contributionChange, 0)

  ElMessageBox.confirm(
    `確定要提交薪資調整申請嗎？\n\n共 ${adjustmentList.value.length} 名僱員\n薪資總變化：${totalSalaryChange > 0 ? '+' : ''}¥${formatMoney(Math.abs(totalSalaryChange))}\n供款總變化：${totalContributionChange > 0 ? '+' : ''}¥${formatMoney(Math.abs(totalContributionChange))}\n\n提交後將進入企業內部審核流程。`,
    '確認提交',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage.success('薪資調整申請已提交，等待企業內部審核')
    
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
  ElMessageBox.confirm('確定要清空所有薪資調整申請嗎？', '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    adjustmentList.value = []
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
.salary-adjustment {
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

.adjustment-list-section {
  margin-top: 30px;
}

.adjustment-list-section h4 {
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
}

.highlight-text {
  color: #F39800;
  font-weight: 500;
}

.change-text {
  font-weight: 500;
}

.change-text.increase {
  color: #e6a23c;
}

.change-text.decrease {
  color: #67c23a;
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

:deep(.el-table__footer-wrapper) {
  font-weight: 600;
}
</style>