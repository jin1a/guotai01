<template>
  <div class="contribution-history">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>私退金供款歷史查詢</span>
          <el-button type="primary" @click="exportHistory">導出歷史</el-button>
        </div>
      </template>
      
      <!-- 高級查詢條件 -->
      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="計劃名稱">
          <el-select v-model="queryForm.planName" placeholder="請選擇計劃" clearable style="width: 180px">
            <el-option label="全部計劃" value="" />
            <el-option label="私退金計劃A" value="plan-a" />
            <el-option label="私退金計劃B" value="plan-b" />
            <el-option label="私退金計劃C" value="plan-c" />
          </el-select>
        </el-form-item>
        <el-form-item label="查詢期間">
          <el-date-picker
            v-model="queryForm.dateRange"
            type="monthrange"
            range-separator="至"
            start-placeholder="開始月份"
            end-placeholder="結束月份"
            format="YYYY年MM月"
            value-format="YYYY-MM"
            :disabled-date="disabledDate"
            style="width: 280px"
          />
        </el-form-item>
        <el-form-item label="供款類型">
          <el-select v-model="queryForm.contributionType" placeholder="請選擇類型" clearable style="width: 150px">
            <el-option label="全部類型" value="" />
            <el-option label="自動供款" value="auto" />
            <el-option label="手動供款" value="manual" />
            <el-option label="調整供款" value="adjustment" />
          </el-select>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="queryForm.status" placeholder="請選擇狀態" clearable style="width: 120px">
            <el-option label="全部狀態" value="" />
            <el-option label="已完成" value="completed" />
            <el-option label="對賬中" value="reconciling" />
            <el-option label="已拒絕" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryHistory">查詢</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 歷史記錄列表 -->
      <div>
        <el-table :data="historyList" style="width: 100%">
          <el-table-column prop="period" label="供款期間" min-width="120" sortable />
          <el-table-column prop="planName" label="計劃名稱" min-width="150" />
          <el-table-column prop="contributionType" label="供款類型" min-width="100">
            <template #default="scope">
              <el-tag :type="getContributionTypeClass(scope.row.contributionType)">
                {{ getContributionTypeText(scope.row.contributionType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="employerAmount" label="僱主供款金額" min-width="140" sortable align="right">
            <template #default="scope">
              MOP {{ scope.row.employerAmount }}
            </template>
          </el-table-column>
          <el-table-column prop="employeeAmount" label="僱員供款金額" min-width="140" sortable align="right">
            <template #default="scope">
              MOP {{ scope.row.employeeAmount }}
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="總供款金額" min-width="130" sortable align="right">
            <template #default="scope">
              MOP {{ scope.row.totalAmount }}
            </template>
          </el-table-column>
          <el-table-column prop="employeeCount" label="僱員數量" min-width="100" />
          <el-table-column prop="paymentDate" label="繳費日期" min-width="120" sortable />
          <el-table-column prop="status" label="狀態" min-width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="viewDetail(scope.row)">
                查看詳情
              </el-button>
              <el-button size="small" type="primary" @click="downloadVoucher(scope.row)">
                下載憑證
              </el-button>
              <el-button size="small" type="success" @click="downloadNotice(scope.row)">
                下載通知書
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分頁 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 响应式数据
const queryForm = ref({
  planName: '',
  dateRange: [], // [開始月份, 結束月份]
  contributionType: '',
  status: ''
})

const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(42)

// 历史记录列表
const historyList = ref([
  {
    id: 1,
    period: '2024年1月',
    planName: '私退金計劃A',
    contributionType: 'auto',
    employerAmount: '110,000.00',
    employeeAmount: '110,000.00',
    totalAmount: '220,000.00',
    employeeCount: 30,
    paymentDate: '2024-01-25',
    status: '已完成',
    recordNo: 'PH2024010001',
    voucherNo: 'PV2024010001',
    processor: '陈大文',
    submitTime: '2024-01-20 14:30:00',
    completeTime: '2024-01-25 16:45:00',
    remark: '正常月度私退金供款，投資組合按計劃配置',
    currentBalance: '168,000.00',
    expectedReturn: '5.8%',
    retirementYear: '2045',
    projectedAmount: '920,000.00',
    employeeDetails: [
      { employeeName: '张三', employeeNo: 'EMP001', employerContribution: '3,200.00', employeeContribution: '3,200.00', totalContribution: '6,400.00', status: '已对账' },
      { employeeName: '李四', employeeNo: 'EMP002', employerContribution: '3,800.00', employeeContribution: '3,800.00', totalContribution: '7,600.00', status: '已对账' },
      { employeeName: '王五', employeeNo: 'EMP003', employerContribution: '3,000.00', employeeContribution: '3,000.00', totalContribution: '6,000.00', status: '已对账' }
    ],
    operationLogs: [
      { id: 1, timestamp: '2024-01-20 14:30:00', operation: '创建私退金供款记录', operator: '陈大文', type: 'primary' },
      { id: 2, timestamp: '2024-01-22 10:15:00', operation: '上传供款凭证', operator: '陈大文', type: 'success' },
      { id: 3, timestamp: '2024-01-23 15:20:00', operation: '投资组合配置更新', operator: '系统自动', type: 'info' },
      { id: 4, timestamp: '2024-01-25 16:45:00', operation: '对账完成，资金已投资', operator: '系统自动', type: 'success' }
    ]
  },
  {
    id: 2,
    period: '2023年12月',
    planName: '私退金計劃A',
    contributionType: 'auto',
    employerAmount: '110,000.00',
    employeeAmount: '110,000.00',
    totalAmount: '220,000.00',
    employeeCount: 30,
    paymentDate: '2023-12-25',
    status: '已完成',
    recordNo: 'PH2023120001',
    voucherNo: 'PV2023120001',
    processor: '陈大文',
    submitTime: '2023-12-20 14:30:00',
    completeTime: '2023-12-25 16:45:00',
    remark: '年末私退金供款，包含年終獎勵供款和投資調整',
    currentBalance: '155,000.00',
    expectedReturn: '5.5%',
    retirementYear: '2045',
    projectedAmount: '890,000.00',
    employeeDetails: [
      { employeeName: '张三', employeeNo: 'EMP001', employerContribution: '3,200.00', employeeContribution: '3,200.00', totalContribution: '6,400.00', status: '已对账' },
      { employeeName: '李四', employeeNo: 'EMP002', employerContribution: '3,800.00', employeeContribution: '3,800.00', totalContribution: '7,600.00', status: '已对账' }
    ],
    operationLogs: [
      { id: 1, timestamp: '2023-12-20 14:30:00', operation: '创建年末私退金供款记录', operator: '陈大文', type: 'primary' },
      { id: 2, timestamp: '2023-12-22 10:15:00', operation: '上传供款凭证', operator: '陈大文', type: 'success' },
      { id: 3, timestamp: '2023-12-23 14:30:00', operation: '年终投资组合重新平衡', operator: '投资管理员', type: 'warning' },
      { id: 4, timestamp: '2023-12-25 16:45:00', operation: '对账完成，资金已投资', operator: '系统自动', type: 'success' }
    ]
  },
  {
    id: 3,
    period: '2023年11月',
    planName: '私退金計劃B',
    contributionType: 'manual',
    employerAmount: '82,500.00',
    employeeAmount: '82,500.00',
    totalAmount: '165,000.00',
    employeeCount: 22,
    paymentDate: '2023-11-25',
    status: '已完成',
    recordNo: 'PH2023110002',
    voucherNo: 'PV2023110002',
    processor: '李小明',
    submitTime: '2023-11-20 09:30:00',
    completeTime: '2023-11-25 14:20:00',
    remark: '手動私退金供款，部分僱員調整投資策略',
    currentBalance: '142,000.00',
    expectedReturn: '4.8%',
    retirementYear: '2048',
    projectedAmount: '780,000.00',
    employeeDetails: [
      { employeeName: '赵六', employeeNo: 'EMP004', employerContribution: '2,800.00', employeeContribution: '2,800.00', totalContribution: '5,600.00', status: '已对账' },
      { employeeName: '孙七', employeeNo: 'EMP005', employerContribution: '3,200.00', employeeContribution: '3,200.00', totalContribution: '6,400.00', status: '已对账' }
    ],
    operationLogs: [
      { id: 1, timestamp: '2023-11-20 09:30:00', operation: '创建手动私退金供款记录', operator: '李小明', type: 'primary' },
      { id: 2, timestamp: '2023-11-22 11:20:00', operation: '审核通过', operator: '陈大文', type: 'success' },
      { id: 3, timestamp: '2023-11-23 10:15:00', operation: '投资策略调整完成', operator: '投资顾问', type: 'info' },
      { id: 4, timestamp: '2023-11-25 14:20:00', operation: '对账完成，资金已重新配置', operator: '系统自动', type: 'success' }
    ]
  }
])

// 计算属性和方法
const getStatusType = (status) => {
  const statusMap = {
    '已完成': 'success',
    '对账中': 'warning',
    '已拒绝': 'danger',
    '待处理': 'info'
  }
  return statusMap[status] || 'info'
}

const getContributionTypeClass = (type) => {
  const typeMap = {
    'auto': 'success',
    'manual': 'warning',
    'adjustment': 'info'
  }
  return typeMap[type] || 'info'
}

const getContributionTypeText = (type) => {
  const typeMap = {
    'auto': '自動供款',
    'manual': '手動供款',
    'adjustment': '調整供款'
  }
  return typeMap[type] || type
}

const queryHistory = () => {
  // 檢查日期範圍是否有效
  if (queryForm.value.dateRange && queryForm.value.dateRange.length === 2) {
    const startDate = new Date(queryForm.value.dateRange[0])
    const endDate = new Date(queryForm.value.dateRange[1])
    const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth())
    
    if (monthDiff > 12) {
      ElMessage.warning('查詢期間不能超過12個月')
      return
    }
  }
  
  ElMessage.success('查詢完成')
  // 實際項目中這裡會調用API
}

const resetQuery = () => {
  queryForm.value = {
    planName: '',
    dateRange: [],
    contributionType: '',
    status: ''
  }
  queryHistory()
}

// 禁用日期函數，只允許最近36個月
const disabledDate = (time) => {
  const currentDate = new Date()
  const threeYearsAgo = new Date()
  threeYearsAgo.setMonth(currentDate.getMonth() - 36)
  
  // 禁用未來月份和36個月以前的月份
  return time.getTime() > currentDate.getTime() || time.getTime() < threeYearsAgo.getTime()
}


const exportHistory = () => {
  ElMessage.success('開始導出私退金歷史數據，請稍候...')
  // 實際項目中這裡會調用導出API
}

const viewDetail = (record) => {
  // 跳轉到詳情頁面，傳遞記錄ID
  router.push({
    name: 'PrivateFundContributionHistoryDetail',
    params: { id: record.id },
    query: { recordNo: record.recordNo }
  })
}

const downloadVoucher = (record) => {
  ElMessage.success(`開始下載${record.period}的私退金供款憑證`)
  // 實際項目中這裡會調用下載API
}

const downloadNotice = (record) => {
  ElMessage.success(`開始下載${record.period}的私退金供款通知書`)
  // 實際項目中這裡會調用下載API
}

const handleSizeChange = (val) => {
  pageSize.value = val
  queryHistory()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  queryHistory()
}
</script>

<style scoped>
.contribution-history {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.query-form {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}



.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.log-operator {
  font-size: 12px;
  color: #999;
  margin: 0;
}



:deep(.el-timeline-item__node--primary) {
  background-color: #2C8976;
}

:deep(.el-timeline-item__node--success) {
  background-color: #67C23A;
}

:deep(.el-timeline-item__node--info) {
  background-color: #909399;
}

:deep(.el-timeline-item__node--warning) {
  background-color: #E6A23C;
}
</style>