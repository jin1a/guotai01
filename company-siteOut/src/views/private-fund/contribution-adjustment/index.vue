<template>
  <div class="contribution-adjustment-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>私退金供款調整申請</span>
          <el-button type="info" @click="goBack">返回</el-button>
        </div>
      </template>
      
      <!-- 计划基本信息 -->
      <div class="plan-info-section">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="計劃編號">{{ planInfo.planNo }}</el-descriptions-item>
          <el-descriptions-item label="計劃名稱">{{ planInfo.planName }}</el-descriptions-item>
          <el-descriptions-item label="供款週期">{{ planInfo.period }}</el-descriptions-item>
          <el-descriptions-item label="原供款總額">
            <span class="amount-text">¥{{ formatMoney(planInfo.originalAmount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="調整後總額">
            <span class="amount-text adjusted">¥{{ formatMoney(adjustedTotalAmount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="差額">
            <span :class="['amount-text', amountDifference > 0 ? 'increase' : 'decrease']">
              {{ amountDifference > 0 ? '+' : '' }}¥{{ formatMoney(Math.abs(amountDifference)) }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button type="primary" @click="showDialog('salary')">
          <el-icon><Plus /></el-icon>
          薪資調整
        </el-button>
        <el-button type="success" @click="showDialog('transfer')">
          <el-icon><Switch /></el-icon>
          調職
        </el-button>
        <el-button type="danger" @click="showDialog('terminate')">
          <el-icon><Delete /></el-icon>
          終止參與計劃
        </el-button>
        <el-button type="warning" @click="showDialog('join')">
          <el-icon><UserFilled /></el-icon>
          新加入計劃
        </el-button>
      </div>

      <!-- 调整明细表格 -->
      <div class="adjustment-table-section">
        <h4>調整明細</h4>
        <el-table :data="adjustmentList" style="width: 100%" show-summary :summary-method="getSummaries">
          <el-table-column type="index" label="序號" width="60" />
          <el-table-column prop="type" label="調整類型" width="120">
            <template #default="scope">
              <el-tag :type="getTypeTagType(scope.row.type)">
                {{ getTypeText(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="employeeNo" label="僱員編號" width="120" />
          <el-table-column prop="employeeName" label="僱員姓名" width="120" />
          <el-table-column prop="department" label="部門" width="120" />
          <el-table-column prop="originalSalary" label="原薪資" width="120" align="right">
            <template #default="scope">
              <span v-if="scope.row.type !== 'join'">¥{{ formatMoney(scope.row.originalSalary) }}</span>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column prop="newSalary" label="新薪資" width="120" align="right">
            <template #default="scope">
              <span v-if="scope.row.type !== 'terminate'">¥{{ formatMoney(scope.row.newSalary) }}</span>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column prop="originalContribution" label="原供款額" width="120" align="right">
            <template #default="scope">
              <span v-if="scope.row.type !== 'join'">¥{{ formatMoney(scope.row.originalContribution) }}</span>
              <span v-else>--</span>
            </template>
          </el-table-column>
          <el-table-column prop="newContribution" label="新供款額" width="120" align="right">
            <template #default="scope">
              <span v-if="scope.row.type !== 'terminate'">¥{{ formatMoney(scope.row.newContribution) }}</span>
              <span v-else>¥0.00</span>
            </template>
          </el-table-column>
          <el-table-column prop="difference" label="差額" width="120" align="right">
            <template #default="scope">
              <span :class="['amount-text', scope.row.difference > 0 ? 'increase' : 'decrease']">
                {{ scope.row.difference > 0 ? '+' : '' }}¥{{ formatMoney(Math.abs(scope.row.difference)) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="effectiveDate" label="生效日期" width="120" />
          <el-table-column prop="remark" label="備註" min-width="200" show-overflow-tooltip />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="scope">
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
          <el-form-item label="調整說明">
            <el-input
              v-model="submitForm.remark"
              type="textarea"
              :rows="3"
              placeholder="請簡要說明本次調整的原因..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitAdjustment" :disabled="adjustmentList.length === 0">
              提交審核
            </el-button>
            <el-button @click="saveAsDraft">暫存草稿</el-button>
            <el-button @click="clearAll">清空</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <!-- 薪资调整对话框 -->
    <el-dialog
      v-model="salaryDialogVisible"
      title="薪資調整"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="salaryForm" label-width="120px">
        <el-form-item label="選擇僱員">
          <el-select v-model="salaryForm.employeeId" placeholder="請選擇僱員" @change="onEmployeeSelect('salary')">
            <el-option
              v-for="emp in availableEmployees"
              :key="emp.id"
              :label="`${emp.name} (${emp.employeeNo})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="當前薪資">
          <el-input v-model="salaryForm.originalSalary" readonly>
            <template #prefix>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="新薪資">
          <el-input-number
            v-model="salaryForm.newSalary"
            :min="0"
            :step="1000"
            @change="calculateContribution('salary')"
          />
        </el-form-item>
        <el-form-item label="當前供款額">
          <el-input v-model="salaryForm.originalContribution" readonly>
            <template #prefix>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="新供款額">
          <el-input v-model="salaryForm.newContribution" readonly>
            <template #prefix>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="生效日期">
          <el-date-picker
            v-model="salaryForm.effectiveDate"
            type="date"
            placeholder="選擇日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="備註">
          <el-input v-model="salaryForm.remark" placeholder="選填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="salaryDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSalaryAdjustment">確定</el-button>
      </template>
    </el-dialog>

    <!-- 调职对话框 -->
    <el-dialog
      v-model="transferDialogVisible"
      title="調職"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="transferForm" label-width="120px">
        <el-form-item label="選擇僱員">
          <el-select v-model="transferForm.employeeId" placeholder="請選擇僱員" @change="onEmployeeSelect('transfer')">
            <el-option
              v-for="emp in availableEmployees"
              :key="emp.id"
              :label="`${emp.name} (${emp.employeeNo})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="當前方案">
          <el-input v-model="transferForm.currentScheme" readonly />
        </el-form-item>
        <el-form-item label="調整至方案">
          <el-select v-model="transferForm.newScheme" placeholder="請選擇方案">
            <el-option label="方案A" value="A" />
            <el-option label="方案B" value="B" />
          </el-select>
        </el-form-item>
        <el-form-item label="新部門">
          <el-input v-model="transferForm.newDepartment" placeholder="請輸入新部門" />
        </el-form-item>
        <el-form-item label="新職位">
          <el-input v-model="transferForm.newPosition" placeholder="請輸入新職位" />
        </el-form-item>
        <el-form-item label="薪資是否變動">
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
            @change="calculateContribution('transfer')"
          />
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
          <el-input v-model="transferForm.remark" placeholder="選填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTransferAdjustment">確定</el-button>
      </template>
    </el-dialog>

    <!-- 终止参与计划对话框 -->
    <el-dialog
      v-model="terminateDialogVisible"
      title="終止參與計劃"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="terminateForm" label-width="120px">
        <el-form-item label="選擇僱員">
          <el-select v-model="terminateForm.employeeId" placeholder="請選擇僱員" @change="onEmployeeSelect('terminate')">
            <el-option
              v-for="emp in availableEmployees"
              :key="emp.id"
              :label="`${emp.name} (${emp.employeeNo})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="終止原因">
          <el-select v-model="terminateForm.reason" placeholder="請選擇原因">
            <el-option label="離職" value="resign" />
            <el-option label="退休" value="retire" />
            <el-option label="調離" value="transfer" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="最後工作日">
          <el-date-picker
            v-model="terminateForm.lastWorkDate"
            type="date"
            placeholder="選擇日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="當前供款額">
          <el-input v-model="terminateForm.currentContribution" readonly>
            <template #prefix>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="備註">
          <el-input v-model="terminateForm.remark" placeholder="選填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="terminateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmTerminateAdjustment">確定</el-button>
      </template>
    </el-dialog>

    <!-- 新加入计划对话框 -->
    <el-dialog
      v-model="joinDialogVisible"
      title="新加入計劃"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="joinForm" label-width="120px">
        <el-form-item label="選擇僱員">
          <el-select v-model="joinForm.employeeId" placeholder="請選擇已邀請的僱員" @change="onInvitedEmployeeSelect">
            <el-option
              v-for="emp in invitedEmployees"
              :key="emp.id"
              :label="`${emp.name} (${emp.employeeNo})`"
              :value="emp.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="加入方案">
          <el-select v-model="joinForm.scheme" placeholder="請選擇方案">
            <el-option label="方案A" value="A" />
            <el-option label="方案B" value="B" />
          </el-select>
        </el-form-item>
        <el-form-item label="薪資">
          <el-input-number
            v-model="joinForm.salary"
            :min="0"
            :step="1000"
            placeholder="請輸入薪資"
            @change="calculateContribution('join')"
          />
        </el-form-item>
        <el-form-item label="供款基數">
          <el-input v-model="joinForm.contributionBase" readonly>
            <template #prefix>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="月供款額">
          <el-input v-model="joinForm.monthlyContribution" readonly>
            <template #prefix>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="加入日期">
          <el-date-picker
            v-model="joinForm.joinDate"
            type="date"
            placeholder="選擇日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="備註">
          <el-input v-model="joinForm.remark" placeholder="選填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="joinDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmJoinAdjustment">確定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Switch, Delete, UserFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 计划基本信息
const planInfo = ref({
  planNo: '',
  planName: '',
  period: '',
  originalAmount: 0
})

// 调整列表
const adjustmentList = ref([])

// 提交表单
const submitForm = reactive({
  remark: ''
})

// 对话框显示状态
const salaryDialogVisible = ref(false)
const transferDialogVisible = ref(false)
const terminateDialogVisible = ref(false)
const joinDialogVisible = ref(false)

// 各类表单
const salaryForm = reactive({
  employeeId: '',
  employeeNo: '',
  employeeName: '',
  department: '',
  originalSalary: 0,
  newSalary: 0,
  originalContribution: 0,
  newContribution: 0,
  effectiveDate: '',
  remark: ''
})

const transferForm = reactive({
  employeeId: '',
  employeeNo: '',
  employeeName: '',
  currentScheme: '',
  newScheme: '',
  newDepartment: '',
  newPosition: '',
  salaryChanged: false,
  originalSalary: 0,
  newSalary: 0,
  originalContribution: 0,
  newContribution: 0,
  effectiveDate: '',
  remark: ''
})

const terminateForm = reactive({
  employeeId: '',
  employeeNo: '',
  employeeName: '',
  department: '',
  reason: '',
  lastWorkDate: '',
  currentContribution: 0,
  remark: ''
})

const joinForm = reactive({
  employeeId: '',
  employeeNo: '',
  employeeName: '',
  department: '',
  scheme: '',
  salary: 0,
  contributionBase: 0,
  monthlyContribution: 0,
  joinDate: '',
  remark: ''
})

// 可选择的员工列表（当前在职的）
const availableEmployees = ref([
  {
    id: '1',
    employeeNo: 'E202401001',
    name: '張三',
    department: '市場部',
    position: '經理',
    salary: 25000,
    contribution: 2500,
    scheme: 'A'
  },
  {
    id: '2',
    employeeNo: 'E202401002',
    name: '李四',
    department: '技術部',
    position: '工程師',
    salary: 30000,
    contribution: 3000,
    scheme: 'A'
  },
  {
    id: '3',
    employeeNo: 'E202401003',
    name: '王五',
    department: '財務部',
    position: '主管',
    salary: 28000,
    contribution: 2800,
    scheme: 'B'
  }
])

// 已邀请但未加入的员工列表
const invitedEmployees = ref([
  {
    id: '4',
    employeeNo: 'E202401019',
    name: '趙新',
    department: '市場部',
    inviteDate: '2025-03-01'
  },
  {
    id: '5',
    employeeNo: 'E202401020',
    name: '錢進',
    department: '技術部',
    inviteDate: '2025-03-05'
  }
])

// 计算调整后的总金额
const adjustedTotalAmount = computed(() => {
  const original = planInfo.value.originalAmount
  const totalDifference = adjustmentList.value.reduce((sum, item) => sum + item.difference, 0)
  return original + totalDifference
})

// 计算差额
const amountDifference = computed(() => {
  return adjustedTotalAmount.value - planInfo.value.originalAmount
})

// 初始化
onMounted(() => {
  // 从路由参数获取计划信息
  if (route.query.planNo) {
    // 处理金额字符串，去除逗号并转换为数字
    const amountStr = route.query.amount || '125,000.00'
    const amountNum = Number(amountStr.replace(/,/g, ''))
    
    planInfo.value = {
      planNo: route.query.planNo || 'PF-PLAN-001',
      planName: route.query.planName || '私退金計劃A',
      period: route.query.period || '2025年3月',
      originalAmount: amountNum || 125000
    }
  }
})

// 格式化金额
const formatMoney = (amount) => {
  return amount ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// 获取调整类型文本
const getTypeText = (type) => {
  const typeMap = {
    'salary': '薪資調整',
    'transfer': '調職',
    'terminate': '終止參與',
    'join': '新加入'
  }
  return typeMap[type] || type
}

// 获取类型标签样式
const getTypeTagType = (type) => {
  const typeMap = {
    'salary': 'primary',
    'transfer': 'success',
    'terminate': 'danger',
    'join': 'warning'
  }
  return typeMap[type] || 'info'
}

// 显示对话框
const showDialog = (type) => {
  // 重置表单
  switch (type) {
    case 'salary':
      Object.keys(salaryForm).forEach(key => {
        if (typeof salaryForm[key] === 'number') salaryForm[key] = 0
        else salaryForm[key] = ''
      })
      salaryDialogVisible.value = true
      break
    case 'transfer':
      Object.keys(transferForm).forEach(key => {
        if (typeof transferForm[key] === 'number') transferForm[key] = 0
        else if (typeof transferForm[key] === 'boolean') transferForm[key] = false
        else transferForm[key] = ''
      })
      transferDialogVisible.value = true
      break
    case 'terminate':
      Object.keys(terminateForm).forEach(key => {
        if (typeof terminateForm[key] === 'number') terminateForm[key] = 0
        else terminateForm[key] = ''
      })
      terminateDialogVisible.value = true
      break
    case 'join':
      Object.keys(joinForm).forEach(key => {
        if (typeof joinForm[key] === 'number') joinForm[key] = 0
        else joinForm[key] = ''
      })
      joinDialogVisible.value = true
      break
  }
}

// 选择员工
const onEmployeeSelect = (type) => {
  let employee = null
  let form = null
  
  switch (type) {
    case 'salary':
      employee = availableEmployees.value.find(emp => emp.id === salaryForm.employeeId)
      if (employee) {
        salaryForm.employeeNo = employee.employeeNo
        salaryForm.employeeName = employee.name
        salaryForm.department = employee.department
        salaryForm.originalSalary = employee.salary
        salaryForm.originalContribution = employee.contribution
      }
      break
    case 'transfer':
      employee = availableEmployees.value.find(emp => emp.id === transferForm.employeeId)
      if (employee) {
        transferForm.employeeNo = employee.employeeNo
        transferForm.employeeName = employee.name
        transferForm.currentScheme = `方案${employee.scheme}`
        transferForm.originalSalary = employee.salary
        transferForm.originalContribution = employee.contribution
      }
      break
    case 'terminate':
      employee = availableEmployees.value.find(emp => emp.id === terminateForm.employeeId)
      if (employee) {
        terminateForm.employeeNo = employee.employeeNo
        terminateForm.employeeName = employee.name
        terminateForm.department = employee.department
        terminateForm.currentContribution = employee.contribution
      }
      break
  }
}

// 选择已邀请的员工
const onInvitedEmployeeSelect = () => {
  const employee = invitedEmployees.value.find(emp => emp.id === joinForm.employeeId)
  if (employee) {
    joinForm.employeeNo = employee.employeeNo
    joinForm.employeeName = employee.name
    joinForm.department = employee.department
  }
}

// 计算供款额（简化计算：供款额 = 薪资 * 10%）
const calculateContribution = (type) => {
  const rate = 0.1 // 10%供款率
  
  switch (type) {
    case 'salary':
      salaryForm.newContribution = Math.round(salaryForm.newSalary * rate)
      break
    case 'transfer':
      if (transferForm.salaryChanged) {
        transferForm.newContribution = Math.round(transferForm.newSalary * rate)
      }
      break
    case 'join':
      joinForm.contributionBase = joinForm.salary
      joinForm.monthlyContribution = Math.round(joinForm.salary * rate)
      break
  }
}

// 确认薪资调整
const confirmSalaryAdjustment = () => {
  if (!salaryForm.employeeId || !salaryForm.newSalary || !salaryForm.effectiveDate) {
    ElMessage.error('請填寫完整信息')
    return
  }
  
  adjustmentList.value.push({
    type: 'salary',
    employeeId: salaryForm.employeeId,
    employeeNo: salaryForm.employeeNo,
    employeeName: salaryForm.employeeName,
    department: salaryForm.department,
    originalSalary: salaryForm.originalSalary,
    newSalary: salaryForm.newSalary,
    originalContribution: salaryForm.originalContribution,
    newContribution: salaryForm.newContribution,
    difference: salaryForm.newContribution - salaryForm.originalContribution,
    effectiveDate: salaryForm.effectiveDate,
    remark: salaryForm.remark || `薪資從${salaryForm.originalSalary}調整至${salaryForm.newSalary}`
  })
  
  salaryDialogVisible.value = false
  ElMessage.success('已添加薪資調整記錄')
}

// 确认调职
const confirmTransferAdjustment = () => {
  if (!transferForm.employeeId || !transferForm.newScheme || !transferForm.effectiveDate) {
    ElMessage.error('請填寫完整信息')
    return
  }
  
  const newSalary = transferForm.salaryChanged ? transferForm.newSalary : transferForm.originalSalary
  const newContribution = transferForm.salaryChanged ? transferForm.newContribution : transferForm.originalContribution
  
  adjustmentList.value.push({
    type: 'transfer',
    employeeId: transferForm.employeeId,
    employeeNo: transferForm.employeeNo,
    employeeName: transferForm.employeeName,
    department: transferForm.newDepartment,
    originalSalary: transferForm.originalSalary,
    newSalary: newSalary,
    originalContribution: transferForm.originalContribution,
    newContribution: newContribution,
    difference: newContribution - transferForm.originalContribution,
    effectiveDate: transferForm.effectiveDate,
    remark: transferForm.remark || `從${transferForm.currentScheme}調至方案${transferForm.newScheme}`
  })
  
  transferDialogVisible.value = false
  ElMessage.success('已添加調職記錄')
}

// 确认终止参与
const confirmTerminateAdjustment = () => {
  if (!terminateForm.employeeId || !terminateForm.reason || !terminateForm.lastWorkDate) {
    ElMessage.error('請填寫完整信息')
    return
  }
  
  adjustmentList.value.push({
    type: 'terminate',
    employeeId: terminateForm.employeeId,
    employeeNo: terminateForm.employeeNo,
    employeeName: terminateForm.employeeName,
    department: terminateForm.department,
    originalSalary: 0,
    newSalary: 0,
    originalContribution: terminateForm.currentContribution,
    newContribution: 0,
    difference: -terminateForm.currentContribution,
    effectiveDate: terminateForm.lastWorkDate,
    remark: terminateForm.remark || `${terminateForm.reason === 'resign' ? '離職' : terminateForm.reason}`
  })
  
  terminateDialogVisible.value = false
  ElMessage.success('已添加終止參與記錄')
}

// 确认新加入
const confirmJoinAdjustment = () => {
  if (!joinForm.employeeId || !joinForm.scheme || !joinForm.salary || !joinForm.joinDate) {
    ElMessage.error('請填寫完整信息')
    return
  }
  
  adjustmentList.value.push({
    type: 'join',
    employeeId: joinForm.employeeId,
    employeeNo: joinForm.employeeNo,
    employeeName: joinForm.employeeName,
    department: joinForm.department,
    originalSalary: 0,
    newSalary: joinForm.salary,
    originalContribution: 0,
    newContribution: joinForm.monthlyContribution,
    difference: joinForm.monthlyContribution,
    effectiveDate: joinForm.joinDate,
    remark: joinForm.remark || `新加入方案${joinForm.scheme}`
  })
  
  joinDialogVisible.value = false
  ElMessage.success('已添加新加入記錄')
}

// 删除调整记录
const removeAdjustment = (index) => {
  ElMessageBox.confirm('確定要刪除這條調整記錄嗎？', '提示', {
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
    
    if (column.property === 'difference') {
      const total = data.reduce((sum, row) => sum + row.difference, 0)
      sums[index] = `${total > 0 ? '+' : ''}¥${formatMoney(Math.abs(total))}`
    } else {
      sums[index] = ''
    }
  })
  
  return sums
}

// 提交审核
const submitAdjustment = () => {
  if (adjustmentList.value.length === 0) {
    ElMessage.error('請至少添加一條調整記錄')
    return
  }
  
  ElMessageBox.confirm(
    `確定要提交供款調整申請嗎？\n\n共${adjustmentList.value.length}條調整記錄\n調整後總額：¥${formatMoney(adjustedTotalAmount.value)}\n差額：${amountDifference.value > 0 ? '+' : ''}¥${formatMoney(Math.abs(amountDifference.value))}`,
    '確認提交',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    // 模拟提交
    ElMessage.success('供款調整申請已提交，等待企業內部審核')
    
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

// 清空所有
const clearAll = () => {
  ElMessageBox.confirm('確定要清空所有調整記錄嗎？', '提示', {
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
  router.push('/private-fund/auto-contribution/payment-notice')
}
</script>

<style scoped>
.contribution-adjustment-page {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-info-section {
  margin-bottom: 20px;
}

.amount-text {
  font-weight: 600;
  font-size: 16px;
}

.amount-text.adjusted {
  color: #F39800;
}

.amount-text.increase {
  color: #e6a23c;
}

.amount-text.decrease {
  color: #67c23a;
}

.action-buttons {
  margin: 20px 0;
  display: flex;
  gap: 12px;
}

.adjustment-table-section {
  margin-top: 30px;
}

.adjustment-table-section h4 {
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 500;
}

.submit-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

:deep(.el-descriptions__body) {
  background-color: #fafafa;
}

:deep(.el-table__footer-wrapper) {
  font-weight: 600;
}

:deep(.el-dialog__body) {
  padding: 20px 30px;
}
</style>