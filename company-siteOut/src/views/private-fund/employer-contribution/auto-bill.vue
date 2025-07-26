<template>
  <div class="notice-query">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>私退金自動供款账单查詢</span>
        </div>
      </template>
      
      <!-- 查詢條件 -->
      <el-form :model="queryParams" class="query-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="計劃名稱">
              <el-select v-model="queryParams.planId" placeholder="請選擇計劃" clearable style="width: 100%">
                <el-option label="全部計劃" value="" />
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
            <el-form-item label="供款期間">
              <el-date-picker
                v-model="queryParams.contributionMonth"
                type="month"
                placeholder="选择月份"
                format="YYYY年MM月"
                value-format="YYYY-MM"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="狀態">
              <el-select v-model="queryParams.status" placeholder="請選擇狀態" clearable style="width: 100%">
                <el-option label="全部狀態" value="" />
                <el-option label="待確認" value="pending" />
                <el-option label="調整中" value="adjusting" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" style="text-align: right;">
            <el-form-item>
              <el-button type="primary" @click="handleQuery">
                <el-icon><Search /></el-icon>
                查詢
              </el-button>
              <el-button @click="resetQuery">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 账单列表 -->
      <el-table :data="billList" style="width: 100%">
        <el-table-column prop="planName" label="計劃名稱" min-width="200" />
        <el-table-column prop="contributionMonth" label="供款期間" min-width="120" />
        <el-table-column prop="totalAmount" label="應繳金額" min-width="140" align="right">
          <template #default="scope">
            <span class="amount-text">MOP {{ formatAmount(scope.row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="employeeCount" label="人數" min-width="100" align="center" />
        <el-table-column prop="status" label="狀態" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="生成時間" min-width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">詳情</el-button>
            <el-button 
              v-if="scope.row.status === 'pending'"
              type="success" 
              size="small"
              @click="handleConfirm(scope.row)"
            >
              確認
            </el-button>
            <el-button 
              v-if="scope.row.status === 'pending'"
              type="warning" 
              size="small"
              @click="handleAdjust(scope.row)"
            >
              調整
            </el-button>
          </template>
        </el-table-column>
      </el-table>

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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh } from '@element-plus/icons-vue'

// 查询参数
const queryParams = reactive({
  planId: '',
  contributionMonth: '',
  status: '',
  page: 1,
  pageSize: 10
})

// 页面数据
const loading = ref(false)
const total = ref(0)
const billList = ref([])

// 计划选项
const planOptions = ref([
  { id: 1, name: '私退金计划A' },
  { id: 2, name: '私退金计划B' },
  { id: 3, name: '私退金计划C' }
])

// 模拟数据
const mockData = [
  {
    id: 1,
    planName: '私退金计划A',
    contributionMonth: '2024-01',
    totalAmount: 150000.00,
    employeeCount: 50,
    status: 'pending',
    createTime: '2024-01-15 10:30:00'
  },
  {
    id: 2,
    planName: '私退金计划B',
    contributionMonth: '2024-01',
    totalAmount: 280000.00,
    employeeCount: 85,
    status: 'confirmed',
    createTime: '2024-01-15 11:20:00'
  },
  {
    id: 3,
    planName: '私退金计划A',
    contributionMonth: '2023-12',
    totalAmount: 145000.00,
    employeeCount: 48,
    status: 'adjusting',
    createTime: '2023-12-15 09:45:00'
  }
]

// 获取账单列表
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
    
    if (queryParams.contributionMonth) {
      filteredData = filteredData.filter(item => 
        item.contributionMonth === queryParams.contributionMonth
      )
    }
    
    if (queryParams.status) {
      filteredData = filteredData.filter(item => item.status === queryParams.status)
    }
    
    billList.value = filteredData
    total.value = filteredData.length
  } catch (error) {
    console.error('获取账单列表失败:', error)
    ElMessage.error('获取账单列表失败')
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
    contributionMonth: '',
    status: '',
    page: 1,
    pageSize: 10
  })
  getList()
}

// 查看详情
const handleView = (row) => {
  ElMessage.info(`查看账单详情: ${row.planName} - ${row.contributionMonth}`)
  // TODO: 跳转到详情页面或打开详情弹窗
}

// 确认账单
const handleConfirm = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认要确认 ${row.planName} ${row.contributionMonth} 的供款账单吗？`,
      '确认操作',
      { type: 'warning' }
    )
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    row.status = 'confirmed'
    ElMessage.success('账单确认成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认账单失败:', error)
      ElMessage.error('确认账单失败')
    }
  }
}

// 申请调整
const handleAdjust = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确认要申请调整 ${row.planName} ${row.contributionMonth} 的供款账单吗？`,
      '申请调整',
      { type: 'warning' }
    )
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    row.status = 'adjusting'
    ElMessage.success('申请调整已提交，请等待审核')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('申请调整失败:', error)
      ElMessage.error('申请调整失败')
    }
  }
}

// 格式化金额
const formatAmount = (amount) => {
  return amount ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    pending: '',
    confirmed: 'success',
    adjusting: 'warning'
  }
  return typeMap[status]
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    pending: '待确认',
    confirmed: '已确认',
    adjusting: '调整中'
  }
  return textMap[status]
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style scoped>
.notice-query {
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.amount-text {
  color: #2C8976;
  font-weight: 600;
}
</style>