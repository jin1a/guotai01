<template>
  <div class="records-query-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>央積金供款記錄查詢</span>
        </div>
      </template>

      <!-- 查询条件 -->
      <el-form :model="queryParams" class="query-form">
        <!-- 第一行 -->
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="計劃名稱">
              <el-select v-model="queryParams.planId" placeholder="請選擇計劃" clearable style="width: 100%">
                <el-option 
                  v-for="plan in planOptions" 
                  :key="plan.id" 
                  :label="plan.name" 
                  :value="plan.id" 
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="賬單類型">
              <el-select v-model="queryParams.contributionType" placeholder="請選擇類型" clearable style="width: 100%">
                <el-option label="自動供款" value="auto" />
                <el-option label="手動供款" value="manual" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="供款月份">
              <el-date-picker
                v-model="queryParams.contributionMonth"
                type="month"
                placeholder="選擇月份"
                format="YYYY年MM月"
                value-format="YYYY-MM"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="記錄狀態">
              <el-select v-model="queryParams.status" placeholder="請選擇狀態" clearable style="width: 100%">
                <el-option label="已完成" value="completed" />
                <el-option label="處理中" value="processing" />
                <el-option label="已取消" value="cancelled" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行 - 高级筛选 -->
        <el-row :gutter="20" v-show="showAdvanced">
          <el-col :span="6">
            <el-form-item label="確認時間">
              <el-date-picker
                v-model="queryParams.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="處理人">
              <el-input v-model="queryParams.processedBy" placeholder="請輸入處理人姓名" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="供款金額範圍">
              <el-input
                v-model="queryParams.amountMin"
                placeholder="最小金額"
                type="number"
                style="width: 48%; margin-right: 4%"
              />
              <el-input
                v-model="queryParams.amountMax"
                placeholder="最大金額"
                type="number"
                style="width: 48%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="參與人數範圍">
              <el-input
                v-model="queryParams.employeeMin"
                placeholder="最小人數"
                type="number"
                style="width: 48%; margin-right: 4%"
              />
              <el-input
                v-model="queryParams.employeeMax"
                placeholder="最大人數"
                type="number"
                style="width: 48%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <el-row>
          <el-col :span="24" style="text-align: right;">
            <el-form-item>
              <el-button type="primary" @click="handleQuery">
                <el-icon><Search /></el-icon>
                查詢
              </el-button>
              <el-button @click="resetQuery">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
              <el-button @click="toggleAdvancedSearch">
                <el-icon><Filter /></el-icon>
                {{ showAdvanced ? '收起篩選' : '高級篩選' }}
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 记录列表 -->
      <el-table
        v-loading="loading"
        :data="recordList"
        style="width: 100%"
      >
        <el-table-column prop="planName" label="計劃名稱" min-width="180" />
        <el-table-column prop="contributionMonth" label="供款月份" width="120" align="center" />
        <el-table-column prop="contributionType" label="賬單類型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.contributionType === 'auto' ? 'primary' : 'success'" size="small">
              {{ row.contributionType === 'auto' ? '自動' : '手動' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="供款金額" width="130" align="right">
          <template #default="{ row }">
            <span class="amount">{{ formatAmount(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="employeeCount" label="參與人數" width="100" align="center" />
        <el-table-column prop="status" label="狀態" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="confirmTime" label="確認時間" width="180" align="center" />
        <el-table-column prop="processedBy" label="處理人" width="120" align="center" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewDetail(row)">詳情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Filter } from '@element-plus/icons-vue'

const router = useRouter()

// 查询参数
const queryParams = reactive({
  planId: '',
  contributionType: '',
  contributionMonth: '',
  status: '',
  dateRange: [],
  processedBy: '',
  amountMin: '',
  amountMax: '',
  employeeMin: '',
  employeeMax: '',
  page: 1,
  pageSize: 10
})

// 页面数据
const loading = ref(false)
const total = ref(0)
const recordList = ref([])
const selectedRecords = ref([])
const showAdvanced = ref(false)


// 计划选项
const planOptions = ref([
  { id: 1, name: '央积金计划A' },
  { id: 2, name: '央积金计划B' },
  { id: 3, name: '央积金计划C' }
])


// 模拟数据
const mockData = [
  {
    id: 1,
    planName: '央积金计划A',
    contributionMonth: '2024-01',
    contributionType: 'auto',
    totalAmount: 150000.00,
    employeeCount: 50,
    status: 'completed',
    confirmTime: '2024-01-15 14:30:00',
    processedBy: '陈经理',
    remarks: '正常月度自动供款'
  },
  {
    id: 2,
    planName: '央积金计划B',
    contributionMonth: '2024-01',
    contributionType: 'manual',
    totalAmount: 280000.00,
    employeeCount: 85,
    status: 'completed',
    confirmTime: '2024-01-20 09:15:00',
    processedBy: '李主管',
    remarks: '手动提交的供款清单'
  },
  {
    id: 3,
    planName: '央积金计划A',
    contributionMonth: '2023-12',
    contributionType: 'auto',
    totalAmount: 145000.00,
    employeeCount: 48,
    status: 'processing',
    confirmTime: '2023-12-28 16:45:00',
    processedBy: '王助理',
    remarks: '年末自动供款处理中'
  },
  {
    id: 4,
    planName: '央积金计划C',
    contributionMonth: '2023-12',
    contributionType: 'manual',
    totalAmount: 95000.00,
    employeeCount: 32,
    status: 'completed',
    confirmTime: '2023-12-30 10:20:00',
    processedBy: '张经理',
    remarks: '补缴的手动供款'
  }
]

// 获取记录列表
const getList = async () => {
  try {
    loading.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟筛选逻辑
    let filteredData = [...mockData]
    
    if (queryParams.planId) {
      filteredData = filteredData.filter(item => 
        planOptions.value.find(plan => plan.id === queryParams.planId)?.name === item.planName
      )
    }
    
    if (queryParams.contributionType) {
      filteredData = filteredData.filter(item => item.contributionType === queryParams.contributionType)
    }
    
    if (queryParams.contributionMonth) {
      filteredData = filteredData.filter(item => 
        item.contributionMonth === queryParams.contributionMonth
      )
    }
    
    if (queryParams.status) {
      filteredData = filteredData.filter(item => item.status === queryParams.status)
    }
    
    recordList.value = filteredData
    total.value = filteredData.length
  } catch (error) {
    console.error('获取记录列表失败:', error)
    ElMessage.error('获取记录列表失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleQuery = () => {
  queryParams.page = 1
  getList()
}

// 重置
const resetQuery = () => {
  Object.assign(queryParams, {
    planId: '',
    contributionType: '',
    contributionMonth: '',
    status: '',
    dateRange: [],
    processedBy: '',
    amountMin: '',
    amountMax: '',
    employeeMin: '',
    employeeMax: '',
    page: 1,
    pageSize: 10
  })
  getList()
}


// 切换高级搜索显示状态
const toggleAdvancedSearch = () => {
  showAdvanced.value = !showAdvanced.value
}

// 选择变更
const handleSelectionChange = (selection) => {
  selectedRecords.value = selection
}

// 查看详情
const handleViewDetail = (row) => {
  console.log('点击详情按钮，行数据:', row)
  console.log('准备跳转到路径:', `/central-fund/employer-contribution/records-detail/${row.id}`)
  
  // 跳转到详情页面
  router.push(`/central-fund/employer-contribution/records-detail/${row.id}`)
    .then(() => {
      console.log('路由跳转成功')
    })
    .catch(error => {
      console.error('路由跳转失败:', error)
      ElMessage.error('页面跳转失败：' + error.message)
    })
}

// 下载凭证
const handleDownloadVoucher = (row) => {
  ElMessage.info(`正在下载 ${row.planName} ${row.contributionMonth} 的供款凭证...`)
  // TODO: 实现下载凭证功能
}

// 格式化金额
const formatAmount = (amount) => {
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

// 初始化
onMounted(() => {
  getList()
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

.search-card {
  margin-bottom: 24px;
}

.query-form {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}


.table-card {
  margin-bottom: 24px;
}

.amount {
  font-weight: 600;
  color: #E6A23C;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-content {
  .amount {
    font-size: 16px;
    font-weight: 600;
  }
}

:deep(.el-table) {
  .el-button {
    padding: 2px 0;
    margin: 0 5px;
  }
}

:deep(.el-descriptions__label) {
  font-weight: 600;
}
</style>