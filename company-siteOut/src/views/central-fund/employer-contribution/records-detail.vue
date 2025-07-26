<template>
  <div class="records-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <div>
            <el-button @click="goBack" size="small" plain>
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <span style="margin-left: 12px; font-weight: bold;">
              央積金供款記錄詳情 - {{ recordDetail?.planName }}
            </span>
          </div>
          <div class="header-actions">
            <el-button type="primary" @click="handleDownloadVoucher" size="small">
              <el-icon><Download /></el-icon>
              下載憑證
            </el-button>
            <el-button @click="handlePrint" size="small">
              <el-icon><Download /></el-icon>
              下載供款通知書
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="recordDetail">
        <!-- 基本信息 -->
        <el-card class="detail-card" style="margin-bottom: 20px;">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3>基本信息</h3>
              <el-tag :type="getStatusType(recordDetail?.status)" size="large">
                {{ getStatusText(recordDetail?.status) }}
              </el-tag>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="計劃名稱">{{ recordDetail?.planName }}</el-descriptions-item>
            <el-descriptions-item label="供款月份">{{ recordDetail?.contributionMonth }}</el-descriptions-item>
            <el-descriptions-item label="賬單類型">
              <el-tag :type="recordDetail?.contributionType === 'auto' ? 'primary' : 'success'">
                {{ recordDetail?.contributionType === 'auto' ? '自動供款' : '手動供款' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="記錄編號">{{ recordDetail?.recordNumber }}</el-descriptions-item>
            <el-descriptions-item label="總供款金額">
              <span style="font-weight: bold; color: #E6A23C; font-size: 16px;">{{ formatAmount(recordDetail?.totalAmount) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="參與人數">{{ recordDetail?.employeeCount }}人</el-descriptions-item>
            <el-descriptions-item label="平均供款">{{ formatAmount(recordDetail?.totalAmount / recordDetail?.employeeCount) }}</el-descriptions-item>
            <el-descriptions-item label="確認時間">{{ recordDetail?.confirmTime }}</el-descriptions-item>
            <el-descriptions-item label="處理人">{{ recordDetail?.processedBy }}</el-descriptions-item>
            <el-descriptions-item label="備註信息" :span="2">{{ recordDetail?.remarks || '無備註信息' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 供款统计概览 -->
        <el-card class="detail-card statistics-card" style="margin-bottom: 20px;">
          <template #header>
            <div style="display: flex; align-items: center; gap: 8px;">
              <el-icon color="#409EFF"><TrendCharts /></el-icon>
              <h3>央積金供款統計概覽</h3>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="statistic-item employer-contribution">
                <div class="statistic-icon">
                  <el-icon size="24"><OfficeBuilding /></el-icon>
                </div>
                <div class="statistic-content">
                  <div class="statistic-label">僱主總供款</div>
                  <div class="statistic-value">{{ formatAmount(recordDetail?.employerTotal) }}</div>
                  <div class="statistic-desc">企業供款金額</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="statistic-item employee-contribution">
                <div class="statistic-icon">
                  <el-icon size="24"><User /></el-icon>
                </div>
                <div class="statistic-content">
                  <div class="statistic-label">僱員總供款</div>
                  <div class="statistic-value">{{ formatAmount(recordDetail?.employeeTotal) }}</div>
                  <div class="statistic-desc">個人供款金額</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="statistic-item vested-contribution">
                <div class="statistic-icon">
                  <el-icon size="24"><Tickets /></el-icon>
                </div>
                <div class="statistic-content">
                  <div class="statistic-label">可抵扣總額</div>
                  <div class="statistic-value">{{ formatAmount(recordDetail?.deductionTotal) }}</div>
                  <div class="statistic-desc">--</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="6">
              <div class="statistic-item total-contribution">
                <div class="statistic-icon">
                  <el-icon size="24"><Money /></el-icon>
                </div>
                <div class="statistic-content">
                  <div class="statistic-label">供款合計</div>
                  <div class="statistic-value highlight">{{ formatAmount(recordDetail?.totalAmount) }}</div>
                  <div class="statistic-desc">總供款金額</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 雇员供款明细 -->
        <el-card class="detail-card">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3>僱員供款明細</h3>
              <div>
                <el-input
                  v-model="searchKeyword"
                  placeholder="搜索員工姓名或工號"
                  style="width: 200px; margin-right: 12px;"
                  size="small"
                  clearable
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
                <el-button size="small" type="primary" @click="handleExportDetail">
                  <el-icon><Download /></el-icon>
                  導出明細
                </el-button>
              </div>
            </div>
          </template>
          
          <el-table :data="paginatedEmployeeDetails" border style="width: 100%">
            <el-table-column type="index" label="序號" width="60" align="center" />
            <el-table-column prop="employeeNo" label="雇員編號" min-width="140" align="center" />
            <el-table-column prop="employeeName" label="姓名" min-width="120" />
            <el-table-column prop="contributionBase" label="供款基數" min-width="150" align="right">
              <template #default="scope">
                <span>{{ formatAmount(scope.row.contributionBase) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="employerRate" label="僱主比例" width="100" align="center" />
            <el-table-column prop="employerAmount" label="僱主供款" min-width="150" align="right">
              <template #default="scope">
                <span style="font-weight: bold; color: #E6A23C;">{{ formatAmount(scope.row.employerAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="employeeRate" label="僱員比例" width="100" align="center" />
            <el-table-column prop="employeeAmount" label="僱員供款" min-width="150" align="right">
              <template #default="scope">
                <span style="font-weight: bold; color: #E6A23C;">{{ formatAmount(scope.row.employeeAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="供款合計" min-width="150" align="right">
              <template #default="scope">
                <span style="font-weight: bold;">{{ formatAmount(scope.row.totalAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="狀態" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'success' ? 'success' : 'warning'" size="small">
                  {{ scope.row.status === 'success' ? '已確認' : '待確認' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper" style="margin-top: 20px;">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              :total="filteredEmployeeDetails.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
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
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  ArrowLeft, 
  Download, 
  Search, 
  OfficeBuilding, 
  User, 
  Tickets, 
  Money,
  TrendCharts 
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const searchKeyword = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 记录详情数据
const recordDetail = ref(null)
const employeeDetails = ref([])

// 模拟详情数据
const mockRecordDetail = {
  id: 1,
  planName: '央积金计划A',
  contributionMonth: '2024-01',
  contributionType: 'auto',
  totalAmount: 150000.00,
  employeeCount: 50,
  status: 'completed',
  confirmTime: '2024-01-15 14:30:00',
  processedBy: '陈经理',
  remarks: '正常月度自动供款，所有员工均按时缴费',
  recordNumber: 'CF-2024010001',
  employerTotal: 75000.00,
  employeeTotal: 75000.00,
  deductionTotal: 7500.00
}

// 模拟员工明细数据
const mockEmployeeDetails = [
  {
    employeeNo: 'E001',
    employeeName: '张三',
    department: '技术部',
    position: '高级工程师',
    baseSalary: 25000.00,
    contributionBase: 25000.00,
    employerRate: '5%',
    employerAmount: 1250.00,
    employeeRate: '5%',
    employeeAmount: 1250.00,
    deductionAmount: 125.00,
    totalAmount: 2500.00,
    status: 'success'
  },
  {
    employeeNo: 'E002',
    employeeName: '李四',
    department: '销售部',
    position: '销售经理',
    baseSalary: 22000.00,
    contributionBase: 22000.00,
    employerRate: '5%',
    employerAmount: 1100.00,
    employeeRate: '5%',
    employeeAmount: 1100.00,
    deductionAmount: 110.00,
    totalAmount: 2200.00,
    status: 'success'
  },
  {
    employeeNo: 'E003',
    employeeName: '王五',
    department: '财务部',
    position: '会计师',
    baseSalary: 20000.00,
    contributionBase: 20000.00,
    employerRate: '5%',
    employerAmount: 1000.00,
    employeeRate: '5%',
    employeeAmount: 1000.00,
    deductionAmount: 100.00,
    totalAmount: 2000.00,
    status: 'success'
  },
  {
    employeeNo: 'E004',
    employeeName: '赵六',
    department: '人事部',
    position: '人事专员',
    baseSalary: 18000.00,
    contributionBase: 18000.00,
    employerRate: '5%',
    employerAmount: 900.00,
    employeeRate: '5%',
    employeeAmount: 900.00,
    deductionAmount: 90.00,
    totalAmount: 1800.00,
    status: 'pending'
  },
  {
    employeeNo: 'E005',
    employeeName: '孙七',
    department: '市场部',
    position: '市场专员',
    baseSalary: 16000.00,
    contributionBase: 16000.00,
    employerRate: '5%',
    employerAmount: 800.00,
    employeeRate: '5%',
    employeeAmount: 800.00,
    deductionAmount: 80.00,
    totalAmount: 1600.00,
    status: 'success'
  }
]

// 筛选后的员工明细
const filteredEmployeeDetails = computed(() => {
  if (!searchKeyword.value) {
    return employeeDetails.value
  }
  return employeeDetails.value.filter(item => 
    item.employeeName.includes(searchKeyword.value) || 
    item.employeeNo.includes(searchKeyword.value)
  )
})

// 分页后的员工明细
const paginatedEmployeeDetails = computed(() => {
  const filtered = filteredEmployeeDetails.value
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filtered.slice(start, end)
})

// 获取详情数据
const getRecordDetail = async () => {
  try {
    loading.value = true
    const recordId = route.params.id
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // 根据ID获取对应数据 (这里使用模拟数据)
    recordDetail.value = { ...mockRecordDetail, id: recordId }
    employeeDetails.value = mockEmployeeDetails
    
    console.log('记录详情加载完成:', recordDetail.value)
  } catch (error) {
    console.error('获取记录详情失败:', error)
    ElMessage.error('获取记录详情失败')
  } finally {
    loading.value = false
  }
}

// 返回列表
const goBack = () => {
  router.go(-1)
}

// 下载凭证
const handleDownloadVoucher = () => {
  ElMessage.success('正在生成供款凭证，请稍候...')
  // TODO: 实现下载凭证功能
}

// 打印详情
const handlePrint = () => {
  ElMessage.success('正在生成供款通知书，请稍候...')
  // TODO: 实现下载供款通知书功能
}

// 导出明细
const handleExportDetail = () => {
  ElMessage.success('正在导出员工供款明细，请稍候...')
  // TODO: 实现导出明细功能
}

// 格式化金额
const formatAmount = (amount) => {
  if (!amount) return 'MOP 0.00'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'MOP',
    minimumFractionDigits: 2
  }).format(amount)
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    completed: 'success',
    processing: 'warning',
    cancelled: 'danger'
  }
  return typeMap[status]
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    completed: '已完成',
    processing: '处理中',
    cancelled: '已取消'
  }
  return textMap[status]
}

// 分页处理函数
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

// 初始化
onMounted(() => {
  getRecordDetail()
})
</script>

<style scoped>
.records-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.detail-card {
  margin-bottom: 20px;
}

.detail-card h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: bold;
}

.loading-container {
  text-align: center;
  padding: 40px 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}

:deep(.el-descriptions-item__label) {
  font-weight: bold;
  color: #606266;
}

:deep(.el-descriptions-item__content) {
  color: #303133;
}

:deep(.el-table th) {
  background-color: #fafafa;
}

/* 统计卡片样式 */
.statistics-card {
  background: #ffffff;
}

.statistics-card h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: bold;
}

.statistic-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.statistic-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
}

.employee-contribution .statistic-icon {
  background: linear-gradient(135deg, #67C23A, #85ce61);
}

.employer-contribution .statistic-icon {
  background: linear-gradient(135deg, #409EFF, #66b1ff);
}

.vested-contribution .statistic-icon {
  background: linear-gradient(135deg, #E6A23C, #ebb563);
}

.total-contribution .statistic-icon {
  background: linear-gradient(135deg, #F56C6C, #f78989);
}

.statistic-content {
  flex: 1;
}

.statistic-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.statistic-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.statistic-value.highlight {
  color: #E6A23C;
  font-size: 26px;
}

.statistic-desc {
  font-size: 12px;
  color: #C0C4CC;
}
</style>