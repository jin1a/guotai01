<template>
  <div class="contribution-history-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <div>
            <el-button @click="goBack" size="small" plain>
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <span style="margin-left: 12px; font-weight: bold;">
              央積金供款歷史詳情 - {{ recordDetail?.recordNo }}
            </span>
          </div>
          <el-button type="primary" @click="downloadVoucher">下載憑證</el-button>
          
        </div>
      </template>

      <div v-if="recordDetail">
        <div class="detail-section">
              <!-- 基本信息 -->
              <div class="section-header">
                <h3>基本信息</h3>
              </div>
              <el-descriptions :column="2" border size="large">
                <el-descriptions-item label="供款期間" label-class-name="desc-label">
                  {{ recordDetail.period }}
                </el-descriptions-item>
                <el-descriptions-item label="計劃名稱" label-class-name="desc-label">
                  {{ recordDetail.planName }}
                </el-descriptions-item>
                <el-descriptions-item label="供款類型" label-class-name="desc-label">
                  <el-tag :type="getContributionTypeClass(recordDetail.contributionType)">
                    {{ getContributionTypeText(recordDetail.contributionType) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="狀態" label-class-name="desc-label">
                  <el-tag :type="getStatusType(recordDetail.status)">
                    {{ recordDetail.status }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="僱主供款金額" label-class-name="desc-label">
                  <span class="amount-text">MOP {{ recordDetail.employerAmount }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="僱員供款金額" label-class-name="desc-label">
                  <span class="amount-text">MOP {{ recordDetail.employeeAmount }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="總供款金額" label-class-name="desc-label">
                  <span class="amount-text total-amount">MOP {{ recordDetail.totalAmount }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="僱員數量" label-class-name="desc-label">
                  {{ recordDetail.employeeCount }}人
                </el-descriptions-item>
                <el-descriptions-item label="繳費日期" label-class-name="desc-label">
                  {{ recordDetail.paymentDate }}
                </el-descriptions-item>
                <el-descriptions-item label="完成時間" label-class-name="desc-label">
                  {{ recordDetail.completeTime || '未完成' }}
                </el-descriptions-item>
              
                <el-descriptions-item label="處理人" label-class-name="desc-label">
                  {{ recordDetail.processor }}
                </el-descriptions-item>
                <el-descriptions-item label="提交時間" label-class-name="desc-label">
                  {{ recordDetail.submitTime }}
                </el-descriptions-item>
              </el-descriptions>
              

              <!-- 僱員明細 -->
              <div class="section-header" style="margin-top: 40px;">
                <h3>僱員供款明細</h3>
              </div>
              
              <el-table :data="paginatedEmployeeDetails" border>
                <el-table-column prop="employeeName" label="僱員姓名" min-width="120" />
                <el-table-column prop="employeeNo" label="僱員編號" min-width="120" />
                <el-table-column prop="subscriptionDate" label="成分基金認購日" min-width="120">
                  <template #default="scope">
                    {{ scope.row.subscriptionDate }}
                  </template>
                </el-table-column>
                <el-table-column prop="relevantIncome" label="有關入息" min-width="130" align="right">
                  <template #default="scope">
                    MOP {{ scope.row.relevantIncome }}
                  </template>
                </el-table-column>
                <el-table-column prop="employmentStatus" label="受僱狀態" min-width="100">
                  <template #default="scope">
                    <el-tag :type="getEmploymentStatusType(scope.row.employmentStatus)" size="small">
                      {{ scope.row.employmentStatus }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="employerContribution" label="僱主供款" min-width="130" align="right">
                  <template #default="scope">
                    MOP {{ scope.row.employerContribution }}
                  </template>
                </el-table-column>
                <el-table-column prop="employeeContribution" label="僱員供款" min-width="130" align="right">
                  <template #default="scope">
                    MOP {{ scope.row.employeeContribution }}
                  </template>
                </el-table-column>
                <el-table-column prop="totalContribution" label="總供款" min-width="140" align="right">
                  <template #default="scope">
                    <span class="font-bold">MOP {{ scope.row.totalContribution }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="對賬狀態" min-width="100">
                  <template #default="scope">
                    <el-tag :type="scope.row.status === '已對賬' ? 'success' : 'warning'" size="small">
                      {{ scope.row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
              
              <!-- 分页 -->
              <div class="pagination-wrapper" v-if="recordDetail.employeeDetails && recordDetail.employeeDetails.length > employeePageSize">
                <el-pagination
                  v-model:current-page="employeeCurrentPage"
                  v-model:page-size="employeePageSize"
                  :page-sizes="[10, 20, 30, 50]"
                  :total="recordDetail.employeeDetails.length"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleEmployeeSizeChange"
                  @current-change="handleEmployeeCurrentChange"
                />
              </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else class="loading-container">
        <el-empty description="正在加載數據..." />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const recordDetail = ref(null)

// 分页相关
const employeeCurrentPage = ref(1)
const employeePageSize = ref(10)

// 分页后的员工数据
const paginatedEmployeeDetails = computed(() => {
  if (!recordDetail.value?.employeeDetails) return []
  const start = (employeeCurrentPage.value - 1) * employeePageSize.value
  const end = start + employeePageSize.value
  return recordDetail.value.employeeDetails.slice(start, end)
})

// 模拟数据 - 实际项目中应该根据ID从API获取
const mockData = {
  1: {
    id: 1,
    period: '2024年1月',
    planName: '央积金计划A',
    contributionType: 'auto',
    employerAmount: '122,500.00',
    employeeAmount: '122,500.00',
    totalAmount: '245,000.00',
    employeeCount: 35,
    paymentDate: '2024-01-25',
    status: '已完成',
    recordNo: 'CH2024010001',
    voucherNo: 'VC2024010001',
    processor: '陈大文',
    submitTime: '2024-01-20 14:30:00',
    completeTime: '2024-01-25 16:45:00',
    remark: '正常月度供款，所有雇员信息已核实，供款金额计算准确无误。本月新增3名员工，调整2名员工薪资。',
    employeeDetails: [
      { employeeName: '张三', employeeNo: 'EMP001', subscriptionDate: '2024-01-22', relevantIncome: '35,000.00', employmentStatus: '在职', employerContribution: '3,500.00', employeeContribution: '3,500.00', totalContribution: '7,000.00', status: '已对账' },
      { employeeName: '李四', employeeNo: 'EMP002', subscriptionDate: '2024-01-22', relevantIncome: '40,000.00', employmentStatus: '在职', employerContribution: '4,000.00', employeeContribution: '4,000.00', totalContribution: '8,000.00', status: '已对账' },
      { employeeName: '王五', employeeNo: 'EMP003', subscriptionDate: '2024-01-22', relevantIncome: '32,000.00', employmentStatus: '在职', employerContribution: '3,200.00', employeeContribution: '3,200.00', totalContribution: '6,400.00', status: '已对账' },
      { employeeName: '赵六', employeeNo: 'EMP004', subscriptionDate: '2024-01-22', relevantIncome: '38,000.00', employmentStatus: '在职', employerContribution: '3,800.00', employeeContribution: '3,800.00', totalContribution: '7,600.00', status: '已对账' },
      { employeeName: '孙七', employeeNo: 'EMP005', subscriptionDate: '2024-01-22', relevantIncome: '36,000.00', employmentStatus: '在职', employerContribution: '3,600.00', employeeContribution: '3,600.00', totalContribution: '7,200.00', status: '已对账' },
      { employeeName: '周八', employeeNo: 'EMP006', subscriptionDate: '2024-01-22', relevantIncome: '33,000.00', employmentStatus: '在职', employerContribution: '3,300.00', employeeContribution: '3,300.00', totalContribution: '6,600.00', status: '已对账' },
      { employeeName: '吴九', employeeNo: 'EMP007', subscriptionDate: '2024-01-22', relevantIncome: '39,000.00', employmentStatus: '在职', employerContribution: '3,900.00', employeeContribution: '3,900.00', totalContribution: '7,800.00', status: '已对账' },
      { employeeName: '郑十', employeeNo: 'EMP008', subscriptionDate: '2024-01-22', relevantIncome: '34,000.00', employmentStatus: '在职', employerContribution: '3,400.00', employeeContribution: '3,400.00', totalContribution: '6,800.00', status: '已对账' },
      { employeeName: '刘十一', employeeNo: 'EMP009', subscriptionDate: '2024-01-22', relevantIncome: '37,000.00', employmentStatus: '在职', employerContribution: '3,700.00', employeeContribution: '3,700.00', totalContribution: '7,400.00', status: '已对账' },
      { employeeName: '陈十二', employeeNo: 'EMP010', subscriptionDate: '2024-01-22', relevantIncome: '41,000.00', employmentStatus: '在职', employerContribution: '4,100.00', employeeContribution: '4,100.00', totalContribution: '8,200.00', status: '已对账' },
      { employeeName: '杨十三', employeeNo: 'EMP011', subscriptionDate: '2024-01-22', relevantIncome: '29,000.00', employmentStatus: '离职', employerContribution: '2,900.00', employeeContribution: '2,900.00', totalContribution: '5,800.00', status: '已对账' },
      { employeeName: '黄十四', employeeNo: 'EMP012', subscriptionDate: '2024-01-22', relevantIncome: '42,000.00', employmentStatus: '在职', employerContribution: '4,200.00', employeeContribution: '4,200.00', totalContribution: '8,400.00', status: '已对账' }
    ]
  },
  2: {
    id: 2,
    period: '2023年12月',
    planName: '央积金计划A',
    contributionType: 'auto',
    employerAmount: '122,500.00',
    employeeAmount: '122,500.00',
    totalAmount: '245,000.00',
    employeeCount: 35,
    paymentDate: '2023-12-25',
    status: '已完成',
    recordNo: 'CH2023120001',
    voucherNo: 'VC2023120001',
    processor: '陈大文',
    submitTime: '2023-12-20 14:30:00',
    completeTime: '2023-12-25 16:45:00',
    remark: '年末供款，包含年终奖励供款部分。所有员工年终考核已完成，奖励供款按比例计算。',
    employeeDetails: [
      { employeeName: '张三', employeeNo: 'EMP001', subscriptionDate: '2023-12-22', relevantIncome: '35,000.00', employmentStatus: '在职', employerContribution: '3,500.00', employeeContribution: '3,500.00', totalContribution: '7,000.00', status: '已对账' },
      { employeeName: '李四', employeeNo: 'EMP002', subscriptionDate: '2023-12-22', relevantIncome: '40,000.00', employmentStatus: '在职', employerContribution: '4,000.00', employeeContribution: '4,000.00', totalContribution: '8,000.00', status: '已对账' }
    ]
  }
}

// 获取详情数据
const fetchDetail = () => {
  const id = parseInt(route.params.id)
  // 模拟API调用
  setTimeout(() => {
    recordDetail.value = mockData[id] || null
    if (!recordDetail.value) {
      ElMessage.error('未找到對應的供款記錄')
      goBack()
    }
  }, 500)
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 下载凭证
const downloadVoucher = () => {
  ElMessage.success(`开始下载${recordDetail.value.period}的央积金供款凭证`)
}

// 工具函数
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
    'auto': '自动供款',
    'manual': '手动供款',
    'adjustment': '调整供款'
  }
  return typeMap[type] || type
}

const getEmploymentStatusType = (status) => {
  const statusMap = {
    '在职': 'success',
    '离职': 'danger'
  }
  return statusMap[status] || 'info'
}

// 分页处理函数
const handleEmployeeSizeChange = (val) => {
  employeePageSize.value = val
  employeeCurrentPage.value = 1
}

const handleEmployeeCurrentChange = (val) => {
  employeeCurrentPage.value = val
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.contribution-history-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-section {
  padding: 20px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: bold;
}

.summary-info {
  color: #606266;
  font-size: 14px;
}

.remark-section {
  margin-top: 30px;
}

.remark-section h4 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
}

.remark-card {
  background: #f8f9fa;
}

.remark-card p {
  margin: 0;
  line-height: 1.6;
  color: #606266;
}

.amount-text {
  font-weight: bold;
  color: #2C8976;
  font-size: 16px;
}

.total-amount {
  color: #E6A23C;
  font-size: 18px;
}

.font-bold {
  font-weight: bold;
}

.operation-timeline {
  margin-top: 20px;
}

.timeline-card {
  margin: 10px 0;
  border: 1px solid #e4e7ed;
}

.timeline-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
}

.operator-info {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.loading-container {
  text-align: center;
  padding: 40px 0;
}

:deep(.desc-label) {
  font-weight: bold;
  color: #606266;
}

:deep(.el-descriptions-item__content) {
  font-weight: normal;
}

:deep(.el-timeline-item__node--primary) {
  background-color: #2C8976;
}

:deep(.el-timeline-item__node--success) {
  background-color: #67C23A;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 13px;
}

:deep(.el-table th) {
  background-color: #fafafa;
}
</style>