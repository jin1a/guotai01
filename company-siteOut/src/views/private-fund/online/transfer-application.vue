<template>
  <div class="transfer-application">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>私退金調職申請</span>
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
          請選擇需要調職的僱員，填寫新的部門、職位信息。如果調職涉及方案變更或薪資調整，請一並填寫。提交後將進入企業內部審核流程。
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
          添加調職僱員
        </el-button>
        <el-button type="warning" @click="batchImport" :disabled="!planForm.planId">
          <el-icon><Upload /></el-icon>
          批量導入
        </el-button>
      </div>

      <!-- 调职申请列表 -->
      <div class="transfer-list-section">
        <h4>調職申請列表</h4>
        <el-table :data="transferList" style="width: 100%">
          <el-table-column type="index" label="序號" width="60" />
          <el-table-column prop="employeeNo" label="僱員編號" width="120" />
          <el-table-column prop="employeeName" label="僱員姓名" width="120" />
          <el-table-column label="原部門/職位" width="180">
            <template #default="scope">
              {{ scope.row.oldDepartment }} / {{ scope.row.oldPosition }}
            </template>
          </el-table-column>
          <el-table-column label="新部門/職位" width="180">
            <template #default="scope">
              <span class="highlight-text">{{ scope.row.newDepartment }} / {{ scope.row.newPosition }}</span>
            </template>
          </el-table-column>
          <el-table-column label="方案變更" width="150">
            <template #default="scope">
              <span v-if="scope.row.schemeChanged">
                {{ scope.row.oldScheme }} → <span class="highlight-text">{{ scope.row.newScheme }}</span>
              </span>
              <span v-else>無變更</span>
            </template>
          </el-table-column>
          <el-table-column label="薪資變更" width="150">
            <template #default="scope">
              <span v-if="scope.row.salaryChanged">
                ¥{{ formatMoney(scope.row.oldSalary) }} → <span class="highlight-text">¥{{ formatMoney(scope.row.newSalary) }}</span>
              </span>
              <span v-else>無變更</span>
            </template>
          </el-table-column>
          <el-table-column prop="effectiveDate" label="生效日期" width="120" />
          <el-table-column prop="remark" label="備註" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button type="primary" link size="small" @click="editTransfer(scope.row)">
                編輯
              </el-button>
              <el-button type="danger" link size="small" @click="removeTransfer(scope.$index)">
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
            <el-button type="primary" @click="submitApplication" :disabled="transferList.length === 0">
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
      title="選擇調職僱員"
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
        <el-table-column prop="department" label="當前部門" width="120" />
        <el-table-column prop="position" label="當前職位" width="120" />
        <el-table-column prop="scheme" label="當前方案" width="100">
          <template #default="scope">
            方案{{ scope.row.scheme }}
          </template>
        </el-table-column>
        <el-table-column prop="salary" label="當前薪資" width="120" align="right">
          <template #default="scope">
            ¥{{ formatMoney(scope.row.salary) }}
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

    <!-- 调职信息对话框 -->
    <el-dialog
      v-model="transferDialogVisible"
      :title="transferForm.isEdit ? '編輯調職信息' : '填寫調職信息'"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form :model="transferForm" label-width="120px">
        <el-form-item label="僱員信息">
          <el-input :value="getEmployeeInfo()" readonly />
        </el-form-item>
        
        <el-divider content-position="left">部門職位信息</el-divider>
        
        <el-form-item label="新部門">
          <el-input v-model="transferForm.newDepartment" placeholder="請輸入新部門" />
        </el-form-item>
        <el-form-item label="新職位">
          <el-input v-model="transferForm.newPosition" placeholder="請輸入新職位" />
        </el-form-item>
        
        <el-divider content-position="left">方案信息</el-divider>
        
        <el-form-item label="是否變更方案">
          <el-radio-group v-model="transferForm.schemeChanged">
            <el-radio :label="false">否</el-radio>
            <el-radio :label="true">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="transferForm.schemeChanged" label="新方案">
          <el-select v-model="transferForm.newScheme" placeholder="請選擇方案" @change="onSchemeChange">
            <el-option label="方案A" value="A" />
            <el-option label="方案B" value="B" />
          </el-select>
        </el-form-item>
        
        <el-divider content-position="left">薪資信息</el-divider>
        
        <el-form-item label="是否調整薪資">
          <el-radio-group v-model="transferForm.salaryChanged">
            <el-radio :label="false">否</el-radio>
            <el-radio :label="true">是</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="transferForm.salaryChanged" label="新薪資">
          <el-input-number
            v-model="transferForm.newSalary"
            :min="0"
            :step="1000"
            placeholder="請輸入新薪資"
            @change="onSalaryChange"
          />
        </el-form-item>
        
        <el-divider content-position="left">供款信息</el-divider>
        
        <el-form-item label="當前供款額">
          <el-input :value="`¥${formatMoney(transferForm.oldContribution)}`" readonly />
        </el-form-item>
        <el-form-item label="新供款額">
          <el-input :value="`¥${formatMoney(transferForm.newContribution)}`" readonly>
            <template #suffix v-if="transferForm.newContribution !== transferForm.oldContribution">
              <span :class="transferForm.newContribution > transferForm.oldContribution ? 'increase' : 'decrease'">
                {{ transferForm.newContribution > transferForm.oldContribution ? '+' : '' }}¥{{ formatMoney(Math.abs(transferForm.newContribution - transferForm.oldContribution)) }}
              </span>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="生效日期">
          <el-date-picker
            v-model="transferForm.effectiveDate"
            type="date"
            placeholder="選擇日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item label="備註">
          <el-input
            v-model="transferForm.remark"
            type="textarea"
            :rows="3"
            placeholder="選填"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTransfer">確定</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量導入調職申請"
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
            請上傳Excel文件，包含：僱員編號、新部門、新職位、新方案（選填）、新薪資（選填）、生效日期、備註
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

const transferForm = reactive({
  employeeId: '',
  employeeNo: '',
  employeeName: '',
  oldDepartment: '',
  oldPosition: '',
  oldScheme: '',
  oldSalary: 0,
  oldContribution: 0,
  newDepartment: '',
  newPosition: '',
  schemeChanged: false,
  newScheme: '',
  salaryChanged: false,
  newSalary: 0,
  newContribution: 0,
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
    scheme: 'A',
    salary: 25000
  },
  {
    id: '2',
    employeeNo: 'E202401002',
    name: '李四',
    department: '技術部',
    position: '工程師',
    scheme: 'A',
    salary: 30000
  },
  {
    id: '3',
    employeeNo: 'E202401003',
    name: '王五',
    department: '財務部',
    position: '主管',
    scheme: 'B',
    salary: 28000
  },
  {
    id: '4',
    employeeNo: 'E202401004',
    name: '趙六',
    department: '人事部',
    position: '主任',
    scheme: 'A',
    salary: 35000
  },
  {
    id: '5',
    employeeNo: 'E202401005',
    name: '陳七',
    department: '營運部',
    position: '專員',
    scheme: 'B',
    salary: 22000
  }
])

// 调职申请列表
const transferList = ref([])

// 选中的员工
const selectedEmployees = ref([])

// 对话框显示状态
const employeeDialogVisible = ref(false)
const transferDialogVisible = ref(false)
const importDialogVisible = ref(false)

// 文件列表
const fileList = ref([])

// 格式化金额
const formatMoney = (amount) => {
  return amount ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// 获取员工信息
const getEmployeeInfo = () => {
  if (transferForm.employeeName) {
    return `${transferForm.employeeName}（${transferForm.employeeNo}）- ${transferForm.oldDepartment}/${transferForm.oldPosition}`
  }
  return ''
}

// 计划变更
const onPlanChange = () => {
  // 清空已选择的调职列表
  if (transferList.value.length > 0) {
    ElMessageBox.confirm('切換計劃將清空當前已選擇的調職申請，是否繼續？', '提示', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      transferList.value = []
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
    // 单个员工，直接打开调职信息对话框
    const employee = selectedEmployees.value[0]
    const contribution = employee.salary * 0.1 // 默认10%供款率
    Object.assign(transferForm, {
      employeeId: employee.id,
      employeeNo: employee.employeeNo,
      employeeName: employee.name,
      oldDepartment: employee.department,
      oldPosition: employee.position,
      oldScheme: employee.scheme,
      oldSalary: employee.salary,
      oldContribution: contribution,
      newDepartment: '',
      newPosition: '',
      schemeChanged: false,
      newScheme: employee.scheme,
      salaryChanged: false,
      newSalary: employee.salary,
      newContribution: contribution,
      effectiveDate: '',
      remark: '',
      isEdit: false
    })
    employeeDialogVisible.value = false
    transferDialogVisible.value = true
  } else {
    // 多个员工，批量添加默认信息
    selectedEmployees.value.forEach(emp => {
      transferList.value.push({
        employeeId: emp.id,
        employeeNo: emp.employeeNo,
        employeeName: emp.name,
        oldDepartment: emp.department,
        oldPosition: emp.position,
        oldScheme: emp.scheme,
        oldSalary: emp.salary,
        newDepartment: '',
        newPosition: '',
        schemeChanged: false,
        newScheme: emp.scheme,
        salaryChanged: false,
        newSalary: emp.salary,
        effectiveDate: '',
        remark: ''
      })
    })
    employeeDialogVisible.value = false
    ElMessage.success(`已添加 ${selectedEmployees.value.length} 名僱員的調職申請`)
  }
}

// 方案变更时重新计算供款
const onSchemeChange = () => {
  calculateNewContribution()
}

// 薪资变更时重新计算供款
const onSalaryChange = () => {
  calculateNewContribution()
}

// 计算新的供款额
const calculateNewContribution = () => {
  // 根据新方案和新薪资计算供款额
  const scheme = transferForm.schemeChanged ? transferForm.newScheme : transferForm.oldScheme
  const salary = transferForm.salaryChanged ? transferForm.newSalary : transferForm.oldSalary
  const baseRate = scheme === 'A' ? 0.1 : 0.12 // 方案A 10%，方案B 12%
  transferForm.newContribution = Math.round(salary * baseRate)
}

// 确认调职信息
const confirmTransfer = () => {
  if (!transferForm.newDepartment || !transferForm.newPosition || !transferForm.effectiveDate) {
    ElMessage.error('請填寫必要信息')
    return
  }

  if (transferForm.schemeChanged && !transferForm.newScheme) {
    ElMessage.error('請選擇新方案')
    return
  }

  if (transferForm.salaryChanged && !transferForm.newSalary) {
    ElMessage.error('請輸入新薪資')
    return
  }

  const data = {
    employeeId: transferForm.employeeId,
    employeeNo: transferForm.employeeNo,
    employeeName: transferForm.employeeName,
    oldDepartment: transferForm.oldDepartment,
    oldPosition: transferForm.oldPosition,
    oldScheme: transferForm.oldScheme,
    oldSalary: transferForm.oldSalary,
    newDepartment: transferForm.newDepartment,
    newPosition: transferForm.newPosition,
    schemeChanged: transferForm.schemeChanged,
    newScheme: transferForm.schemeChanged ? transferForm.newScheme : transferForm.oldScheme,
    salaryChanged: transferForm.salaryChanged,
    newSalary: transferForm.salaryChanged ? transferForm.newSalary : transferForm.oldSalary,
    effectiveDate: transferForm.effectiveDate,
    remark: transferForm.remark
  }

  if (transferForm.isEdit) {
    // 编辑模式
    Object.assign(transferList.value[transferForm.editIndex], data)
    ElMessage.success('已更新調職信息')
  } else {
    // 新增模式
    transferList.value.push(data)
    ElMessage.success('已添加調職申請')
  }

  transferDialogVisible.value = false
}

// 编辑调职信息
const editTransfer = (row) => {
  const index = transferList.value.indexOf(row)
  Object.assign(transferForm, {
    ...row,
    isEdit: true,
    editIndex: index
  })
  transferDialogVisible.value = true
}

// 删除调职申请
const removeTransfer = (index) => {
  ElMessageBox.confirm('確定要刪除這條調職申請嗎？', '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    transferList.value.splice(index, 1)
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
      oldDepartment: '客服部',
      oldPosition: '主管',
      oldScheme: 'A',
      oldSalary: 26000,
      newDepartment: '營運部',
      newPosition: '經理',
      schemeChanged: true,
      newScheme: 'B',
      salaryChanged: true,
      newSalary: 32000,
      effectiveDate: '2025-04-01',
      remark: '晉升調職'
    },
    {
      employeeId: '7',
      employeeNo: 'E202401007',
      employeeName: '吳十',
      oldDepartment: '法務部',
      oldPosition: '律師',
      oldScheme: 'B',
      oldSalary: 45000,
      newDepartment: '法務部',
      newPosition: '高級律師',
      schemeChanged: false,
      newScheme: 'B',
      salaryChanged: true,
      newSalary: 52000,
      effectiveDate: '2025-04-01',
      remark: '職級晉升'
    }
  ]

  transferList.value.push(...importData)
  importDialogVisible.value = false
  ElMessage.success(`成功導入 ${importData.length} 條調職申請`)
}

// 提交申请
const submitApplication = () => {
  if (transferList.value.length === 0) {
    ElMessage.error('請至少添加一條調職申請')
    return
  }

  // 检查所有记录是否填写完整
  const incomplete = transferList.value.filter(item => !item.newDepartment || !item.newPosition || !item.effectiveDate)
  if (incomplete.length > 0) {
    ElMessage.error(`有 ${incomplete.length} 條記錄信息不完整`)
    return
  }

  ElMessageBox.confirm(
    `確定要提交調職申請嗎？\n\n共 ${transferList.value.length} 名僱員\n\n提交後將進入企業內部審核流程。`,
    '確認提交',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage.success('調職申請已提交，等待企業內部審核')
    
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
  ElMessageBox.confirm('確定要清空所有調職申請嗎？', '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    transferList.value = []
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
.transfer-application {
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

.transfer-list-section {
  margin-top: 30px;
}

.transfer-list-section h4 {
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
}

.highlight-text {
  color: #F39800;
  font-weight: 500;
}

.increase {
  color: #e6a23c;
}

.decrease {
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

:deep(.el-divider__text) {
  background-color: #fff;
  font-weight: 500;
}

.upload-demo {
  width: 100%;
}
</style>