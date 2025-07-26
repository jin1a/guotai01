<template>
  <div class="contribution-adjustment-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>央積金供款調整申請</span>
          <el-button type="info" @click="goBack">返回</el-button>
        </div>
      </template>
      
      <!-- 调整块列表 -->
      <div class="adjustment-blocks">
        <div 
          v-for="(block, blockIndex) in adjustmentBlocks" 
          :key="blockIndex"
          class="adjustment-block"
        >
          <!-- 计划选择头部 -->
          <div class="block-header">
            <div class="plan-selector">
              <span class="block-title">調整計劃 {{ blockIndex + 1 }}</span>
              <el-select 
                v-model="block.selectedPlanNo" 
                placeholder="選擇計劃"
                @change="onPlanChange(blockIndex)"
                style="width: 300px; margin-left: 16px;"
              >
                <el-option 
                  v-for="plan in availablePlans" 
                  :key="plan.planNo"
                  :label="`${plan.planNo} - ${plan.planName}`"
                  :value="plan.planNo"
                />
              </el-select>
            </div>
            <div class="block-actions">
              <el-button 
                v-if="block.selectedPlanNo" 
                type="primary" 
                size="small" 
                @click="addAdjustmentItem(blockIndex)"
              >
                <el-icon><Plus /></el-icon>
                添加調整項
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="removeBlock(blockIndex)"
                v-if="adjustmentBlocks.length > 1"
              >
                <el-icon><Delete /></el-icon>
                刪除計劃
              </el-button>
            </div>
          </div>

          <!-- 计划信息展示 -->
          <div v-if="block.selectedPlan" class="plan-info-bar">
            <el-descriptions :column="4" size="small">
              <el-descriptions-item label="計劃名稱">{{ block.selectedPlan.planName }}</el-descriptions-item>
              <el-descriptions-item label="成員數">{{ block.selectedPlan.memberCount }}人</el-descriptions-item>
              <el-descriptions-item label="月供款">MOP {{ formatMoney(block.selectedPlan.monthlyAmount) }}</el-descriptions-item>
              <el-descriptions-item label="調整項">{{ block.adjustmentItems.length }}項</el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 调整项列表 -->
          <div v-if="block.adjustmentItems.length > 0" class="adjustment-items">
            <el-table :data="block.adjustmentItems" size="small" style="width: 100%">
              <el-table-column type="index" label="序號" width="60" />
              <el-table-column label="調整類型" width="120">
                <template #default="scope">
                  <el-select 
                    v-model="scope.row.type" 
                    size="small"
                    @change="onAdjustmentTypeChange(blockIndex, scope.$index)"
                  >
                    <el-option label="薪資調整" value="salary" />
                    <el-option label="調職" value="transfer" />
                    <el-option label="終止參與" value="terminate" />
                    <el-option label="新加入計劃" value="join" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="僱員" width="200">
                <template #default="scope">
                  <el-select 
                    v-model="scope.row.employeeId" 
                    placeholder="選擇僱員"
                    size="small"
                    filterable
                    @change="onEmployeeChange(blockIndex, scope.$index)"
                  >
                    <el-option 
                      v-for="employee in getAvailableEmployees(block.selectedPlanNo, scope.row.type)" 
                      :key="employee.id"
                      :label="`${employee.employeeName} (${employee.employeeNo})`"
                      :value="employee.id"
                    />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="調整內容" width="300">
                <template #default="scope">
                  <!-- 薪资调整 -->
                  <div v-if="scope.row.type === 'salary'" class="adjustment-content">
                    <el-input-number 
                      v-model="scope.row.newSalary" 
                      :min="0" 
                      size="small" 
                      placeholder="新薪資"
                      @change="calculateAdjustment(blockIndex, scope.$index)"
                    />
                  </div>
                  <!-- 调职 -->
                  <div v-if="scope.row.type === 'transfer'" class="adjustment-content">
                    <el-select v-model="scope.row.newScheme" size="small" placeholder="新方案">
                      <el-option label="方案A" value="A" />
                      <el-option label="方案B" value="B" />
                    </el-select>
                  </div>
                  <!-- 终止参与 -->
                  <div v-if="scope.row.type === 'terminate'" class="adjustment-content">
                    <el-select v-model="scope.row.terminateReason" size="small" placeholder="終止原因">
                      <el-option label="離職" value="resign" />
                      <el-option label="退休" value="retire" />
                      <el-option label="調離" value="transfer" />
                      <el-option label="其他" value="other" />
                    </el-select>
                  </div>
                  <!-- 新加入 -->
                  <div v-if="scope.row.type === 'join'" class="adjustment-content">
                    <el-input-number 
                      v-model="scope.row.newSalary" 
                      :min="0" 
                      size="small" 
                      placeholder="薪資"
                      @change="calculateAdjustment(blockIndex, scope.$index)"
                    />
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="生效日期" width="140">
                <template #default="scope">
                  <el-date-picker
                    v-model="scope.row.effectiveDate"
                    type="date"
                    placeholder="選擇日期"
                    size="small"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                  />
                </template>
              </el-table-column>
              <el-table-column label="供款差額" width="120" align="right">
                <template #default="scope">
                  <span v-if="scope.row.difference !== undefined" :class="['amount-text', scope.row.difference > 0 ? 'increase' : 'decrease']">
                    {{ scope.row.difference > 0 ? '+' : '' }}MOP {{ formatMoney(Math.abs(scope.row.difference)) }}
                  </span>
                  <span v-else>--</span>
                </template>
              </el-table-column>
              <el-table-column label="備註" min-width="150">
                <template #default="scope">
                  <el-input 
                    v-model="scope.row.remark" 
                    size="small" 
                    placeholder="選填"
                  />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="80" fixed="right">
                <template #default="scope">
                  <el-button 
                    type="danger" 
                    link 
                    size="small" 
                    @click="removeAdjustmentItem(blockIndex, scope.$index)"
                  >
                    刪除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 空状态 -->
          <div v-if="!block.selectedPlanNo || block.adjustmentItems.length === 0" class="empty-block">
            <el-empty 
              :description="!block.selectedPlanNo ? '請先選擇一個計劃' : '點擊「添加調整項」開始添加調整內容'" 
              :image-size="60"
            />
          </div>
        </div>
      </div>

      <!-- 添加新块按钮 -->
      <div class="add-block-section">
        <el-button type="dashed" @click="addNewBlock" style="width: 100%;">
          <el-icon><Plus /></el-icon>
          添加新的調整計劃
        </el-button>
      </div>

      <!-- 总览和提交区域 -->
      <div v-if="getTotalAdjustmentCount() > 0" class="summary-section">
        <el-card class="summary-card">
          <template #header>
            <h4>調整匯總</h4>
          </template>
          <div class="summary-content">
            <el-descriptions :column="3" border>
              <el-descriptions-item label="調整計劃數">{{ adjustmentBlocks.filter(block => block.adjustmentItems.length > 0).length }}</el-descriptions-item>
              <el-descriptions-item label="涉及計劃">{{ getInvolvedPlansCount() }}個</el-descriptions-item>
              <el-descriptions-item label="調整項目">{{ getTotalAdjustmentCount() }}項</el-descriptions-item>
              <el-descriptions-item label="總供款差額" :span="3">
                <span :class="['amount-text', getTotalDifference() > 0 ? 'increase' : 'decrease']">
                  {{ getTotalDifference() > 0 ? '+' : '' }}MOP {{ formatMoney(Math.abs(getTotalDifference())) }}
                </span>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
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
            <el-button type="primary" @click="submitAllAdjustments" :disabled="getTotalAdjustmentCount() === 0">
              提交調整審核 ({{ getTotalAdjustmentCount() }}項)
            </el-button>
            <el-button @click="saveAsDraft">暫存草稿</el-button>
            <el-button @click="clearAll" :disabled="getTotalAdjustmentCount() === 0">清空全部</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { Plus, Switch, Delete, UserFilled } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 可用的计划列表
const availablePlans = ref([
  {
    planNo: 'ER12345',
    planName: '集團統一央積金共同計劃',
    period: '2025年3月',
    memberCount: 35,
    monthlyAmount: 128500,
    originalAmount: 128500
  },
  {
    planNo: 'ER67890',
    planName: '企業專項央積金計劃',
    period: '2025年3月',
    memberCount: 28,
    monthlyAmount: 95280,
    originalAmount: 95280
  },
  {
    planNo: 'ER11111',
    planName: '子公司A央積金計劃',
    period: '2025年3月',
    memberCount: 42,
    monthlyAmount: 236750,
    originalAmount: 236750
  },
  {
    planNo: 'ER22222',
    planName: '子公司B央積金計劃',
    period: '2025年3月',
    memberCount: 25,
    monthlyAmount: 158420,
    originalAmount: 158420
  },
  {
    planNo: 'ER33333',
    planName: '海外分公司央積金計劃',
    period: '2025年3月',
    memberCount: 31,
    monthlyAmount: 185690,
    originalAmount: 185690
  }
])

// 调整块数组
const adjustmentBlocks = ref([
  {
    selectedPlanNo: '',
    selectedPlan: null,
    adjustmentItems: []
  }
])

// 提交表单
const submitForm = reactive({
  remark: ''
})

// 所有计划的成员数据（按计划编号分组）
const allMembers = ref({
  'ER12345': [
    {
      id: 'ER1234500001',
      employeeNo: 'ER1234500001',
      employeeName: '張三',
      department: '市場部',
      position: '經理',
      planScheme: '方案A',
      salary: 25000,
      contribution: 2500,
      status: 'active'
    },
    {
      id: 'ER1234500002',
      employeeNo: 'ER1234500002',
      employeeName: '李四',
      department: '技術部',
      position: '工程師',
      planScheme: '方案A',
      salary: 30000,
      contribution: 3000,
      status: 'active'
    },
    {
      id: 'ER1234500003',
      employeeNo: 'ER1234500003',
      employeeName: '王五',
      department: '財務部',
      position: '主管',
      planScheme: '方案B',
      salary: 28000,
      contribution: 2800,
      status: 'active'
    }
  ],
  'ER67890': [
    {
      id: 'ER6789000001',
      employeeNo: 'ER6789000001',
      employeeName: '趙六',
      department: '人事部',
      position: '主管',
      planScheme: '方案A',
      salary: 32000,
      contribution: 3200,
      status: 'active'
    },
    {
      id: 'ER6789000002',
      employeeNo: 'ER6789000002',
      employeeName: '錢七',
      department: '運營部',
      position: '專員',
      planScheme: '方案B',
      salary: 22000,
      contribution: 2200,
      status: 'active'
    }
  ],
  'ER11111': [
    {
      id: 'ER1111100001',
      employeeNo: 'ER1111100001',
      employeeName: '孫八',
      department: '業務部',
      position: '總監',
      planScheme: '方案A',
      salary: 45000,
      contribution: 4500,
      status: 'active'
    }
  ],
  'ER22222': [
    {
      id: 'ER2222200001',
      employeeNo: 'ER2222200001',
      employeeName: '周九',
      department: '研發部',
      position: '經理',
      planScheme: '方案A',
      salary: 38000,
      contribution: 3800,
      status: 'active'
    }
  ],
  'ER33333': [
    {
      id: 'ER3333300001',
      employeeNo: 'ER3333300001',
      employeeName: '吳十',
      department: '國際部',
      position: '主管',
      planScheme: '方案B',
      salary: 42000,
      contribution: 4200,
      status: 'active'
    }
  ]
})

// 已邀请但未加入的员工列表
const invitedEmployees = ref([
  {
    id: 'INV001',
    employeeNo: 'INV001',
    employeeName: '趙新',
    department: '市場部',
    inviteDate: '2025-03-01'
  },
  {
    id: 'INV002',
    employeeNo: 'INV002',
    employeeName: '錢進',
    department: '技術部',
    inviteDate: '2025-03-05'
  }
])

// 初始化
onMounted(() => {
  // 如果从路由参数中有指定的计划编号，则自动选中该计划到第一个块
  if (route.query.planNo) {
    adjustmentBlocks.value[0].selectedPlanNo = route.query.planNo
    onPlanChange(0)
  }
})

// 块管理方法
const addNewBlock = () => {
  adjustmentBlocks.value.push({
    selectedPlanNo: '',
    selectedPlan: null,
    adjustmentItems: []
  })
}

const removeBlock = (blockIndex) => {
  if (adjustmentBlocks.value.length > 1) {
    adjustmentBlocks.value.splice(blockIndex, 1)
  }
}

const onPlanChange = (blockIndex) => {
  const block = adjustmentBlocks.value[blockIndex]
  const plan = availablePlans.value.find(p => p.planNo === block.selectedPlanNo)
  block.selectedPlan = plan
  // 清空当前块的调整项
  block.adjustmentItems = []
}

// 调整项管理
const addAdjustmentItem = (blockIndex) => {
  adjustmentBlocks.value[blockIndex].adjustmentItems.push({
    type: '',
    employeeId: '',
    employeeName: '',
    employeeNo: '',
    originalSalary: 0,
    newSalary: 0,
    originalContribution: 0,
    newContribution: 0,
    newScheme: '',
    terminateReason: '',
    effectiveDate: '',
    remark: '',
    difference: undefined
  })
}

const removeAdjustmentItem = (blockIndex, itemIndex) => {
  adjustmentBlocks.value[blockIndex].adjustmentItems.splice(itemIndex, 1)
}

// 获取可用员工列表
const getAvailableEmployees = (planNo, adjustmentType) => {
  if (!planNo) return []
  
  if (adjustmentType === 'join') {
    // 新加入的员工从邀请列表中选择
    return invitedEmployees.value
  } else {
    // 其他调整类型从计划成员中选择
    return allMembers.value[planNo] || []
  }
}

// 调整类型变化处理
const onAdjustmentTypeChange = (blockIndex, itemIndex) => {
  const item = adjustmentBlocks.value[blockIndex].adjustmentItems[itemIndex]
  // 重置相关字段
  item.employeeId = ''
  item.difference = undefined
}

// 员工变化处理
const onEmployeeChange = (blockIndex, itemIndex) => {
  const block = adjustmentBlocks.value[blockIndex]
  const item = block.adjustmentItems[itemIndex]
  
  let employee = null
  if (item.type === 'join') {
    employee = invitedEmployees.value.find(emp => emp.id === item.employeeId)
  } else {
    employee = allMembers.value[block.selectedPlanNo]?.find(emp => emp.id === item.employeeId)
  }
  
  if (employee) {
    item.employeeName = employee.employeeName
    item.employeeNo = employee.employeeNo
    
    if (item.type !== 'join') {
      item.originalSalary = employee.salary
      item.originalContribution = employee.contribution
    }
  }
}

// 格式化金额
const formatMoney = (amount) => {
  return amount ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// 计算调整项的供款差额
const calculateAdjustment = (blockIndex, itemIndex) => {
  const item = adjustmentBlocks.value[blockIndex].adjustmentItems[itemIndex]
  const rate = 0.1 // 10%供款率
  
  if (item.type === 'salary') {
    if (item.newSalary && item.originalContribution) {
      const newContribution = Math.round(item.newSalary * rate)
      item.newContribution = newContribution
      item.difference = newContribution - item.originalContribution
    }
  } else if (item.type === 'join') {
    if (item.newSalary) {
      const contribution = Math.round(item.newSalary * rate)
      item.newContribution = contribution
      item.difference = contribution
    }
  } else if (item.type === 'terminate') {
    item.difference = -item.originalContribution
  }
}

// 统计方法
const getTotalAdjustmentCount = () => {
  return adjustmentBlocks.value.reduce((sum, block) => sum + block.adjustmentItems.length, 0)
}

const getInvolvedPlansCount = () => {
  const planSet = new Set()
  adjustmentBlocks.value.forEach(block => {
    if (block.selectedPlanNo && block.adjustmentItems.length > 0) {
      planSet.add(block.selectedPlanNo)
    }
  })
  return planSet.size
}

const getTotalDifference = () => {
  let total = 0
  adjustmentBlocks.value.forEach(block => {
    block.adjustmentItems.forEach(item => {
      if (item.difference !== undefined) {
        total += item.difference
      }
    })
  })
  return total
}

// 提交所有调整审核
const submitAllAdjustments = () => {
  const totalCount = getTotalAdjustmentCount()
  if (totalCount === 0) {
    ElMessage.error('請至少添加一條調整記錄')
    return
  }
  
  const planCount = getInvolvedPlansCount()
  const planNumbers = []
  
  adjustmentBlocks.value.forEach(block => {
    if (block.selectedPlanNo && block.adjustmentItems.length > 0) {
      planNumbers.push(block.selectedPlanNo)
    }
  })
  
  const planNames = [...new Set(planNumbers)].join('、')
  
  ElMessageBox.confirm(
    `確定要提交供款調整申請嗎？\n\n涉及計劃：${planCount}個\n計劃編號：${planNames}\n調整記錄：共${totalCount}條\n總供款差額：${getTotalDifference() > 0 ? '+' : ''}MOP ${formatMoney(Math.abs(getTotalDifference()))}\n\n提交後將進入企業內部審核流程。`,
    '確認提交',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    // 模拟提交
    ElMessage.success(`供款調整申請已提交！\n\n涉及${planCount}個計劃，共${totalCount}條調整記錄\n總差額：${getTotalDifference() > 0 ? '+' : ''}MOP ${formatMoney(Math.abs(getTotalDifference()))}\n等待企業內部審核`)
    
    // 跳转到待办列表
    setTimeout(() => {
      router.push('/central-fund/todo')
    }, 2000)
  }).catch(() => {})
}

// 暂存草稿
const saveAsDraft = () => {
  ElMessage.success('草稿已暫存')
}

// 清空所有
const clearAll = () => {
  const totalCount = getTotalAdjustmentCount()
  if (totalCount === 0) {
    ElMessage.info('沒有調整記錄需要清空')
    return
  }
  
  ElMessageBox.confirm(`確定要清空所有調整記錄嗎？\n\n這將刪除${totalCount}條調整記錄，此操作不可恢復。`, '提示', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 重置所有块
    adjustmentBlocks.value = [
      {
        selectedPlanNo: '',
        selectedPlan: null,
        adjustmentItems: []
      }
    ]
    
    submitForm.remark = ''
    ElMessage.success('已清空所有調整記錄')
  }).catch(() => {})
}

// 返回
const goBack = () => {
  router.push('/central-fund/auto-contribution/payment-notice')
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

/* 调整块样式 */
.adjustment-blocks {
  margin-bottom: 30px;
}

.adjustment-block {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 20px;
  overflow: hidden;
}

.block-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.plan-selector {
  display: flex;
  align-items: center;
}

.block-title {
  font-weight: 600;
  color: #2c3e50;
}

.block-actions {
  display: flex;
  gap: 8px;
}

.plan-info-bar {
  padding: 12px 20px;
  background-color: #f9fafc;
  border-bottom: 1px solid #e4e7ed;
}

.adjustment-items {
  padding: 16px 20px;
}

.adjustment-content {
  display: flex;
  gap: 8px;
  align-items: center;
}

.empty-block {
  padding: 40px 20px;
  text-align: center;
  background-color: #fafbfc;
}

/* 添加块按钮样式 */
.add-block-section {
  margin: 20px 0;
}

:deep(.el-button--dashed) {
  border-style: dashed;
  border-color: #d9d9d9;
  color: #666;
}

:deep(.el-button--dashed:hover) {
  border-color: #409eff;
  color: #409eff;
}

/* 统计汇总样式 */
.summary-section {
  margin: 30px 0;
}

.summary-card {
  border: 1px solid #e1e8ed;
}

.summary-content {
  padding: 0;
}

/* 金额颜色 */
.amount-text {
  font-weight: 600;
}

.amount-text.increase {
  color: #e6a23c;
}

.amount-text.decrease {
  color: #67c23a;
}

/* 提交区域样式 */
.submit-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

/* Element Plus 样式覆盖 */
:deep(.el-descriptions) {
  margin: 0;
}

:deep(.el-descriptions__body) {
  background-color: #fafafa;
}

:deep(.el-descriptions--small .el-descriptions__label) {
  width: 120px;
  font-weight: 500;
}

:deep(.el-table--small) {
  font-size: 12px;
}

:deep(.el-table--small .el-table__cell) {
  padding: 8px 0;
}

:deep(.el-empty) {
  padding: 20px 0;
}

:deep(.el-card__header) {
  padding: 16px 20px;
  background-color: #f8f9fa;
}

:deep(.el-card__header h4) {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

:deep(.el-button--small) {
  font-size: 12px;
  padding: 5px 10px;
}
</style>