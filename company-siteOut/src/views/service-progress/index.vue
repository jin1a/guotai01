<template>
  <div class="service-progress">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>服務進度 (E200)</span>
          <div class="header-actions">
            <el-button type="primary" @click="refreshData">
              <el-icon class="el-icon--left"><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索条件区域 -->
      <div class="filter-section">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="計劃名稱">
            <el-select v-model="filterForm.planName" placeholder="請選擇" clearable>
              <el-option label="全部" value="" />
              <el-option label="央積金A計劃" value="央積金A計劃" />
              <el-option label="央積金B計劃" value="央積金B計劃" />
              <el-option label="央積金企業計劃" value="央積金企業計劃" />
              <el-option label="私退金計劃A" value="私退金計劃A" />
            </el-select>
          </el-form-item>
          <el-form-item label="提交日期">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
              range-separator="至"
              start-placeholder="開始日期"
              end-placeholder="結束日期"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查詢</el-button>
            <el-button @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 数据表格 - 只显示已完成的任务 -->
      <el-table 
        :data="tableData" 
        style="width: 100%"
        v-loading="loading"
        border
      >
        <el-table-column prop="taskNo" label="任務編號" width="180" />
        <el-table-column prop="planName" label="計劃名稱" min-width="150" />
        <el-table-column prop="contributionPeriod" label="供款期間" width="180" />
        <el-table-column prop="amount" label="供款金額" width="140" align="right">
          <template #default="scope">
            <span class="amount-text">{{ formatMoney(scope.row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="submitDate" label="提交日期" width="120" />
        <el-table-column prop="completedDate" label="完成日期" width="120" />
        <el-table-column prop="status" label="狀態" width="120">
          <template #default="scope">
            <el-tag type="success" size="small">
              對賬完成
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="viewDetail(scope.row)">
              查看詳情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <span class="total-info">總共 {{ total }} 筆</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'ServiceProgress',
  components: {
    Refresh
  },
  data() {
    return {
      loading: false,
      // 当前标签
      activeTab: 'ongoing',
      // 筛选表单
      filterForm: {
        planName: '',
        dateRange: []
      },
      // 表格数据
      tableData: [],
      // 分页
      currentPage: 1,
      pageSize: 10,
      total: 0
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    // 加载数据
    async loadData() {
      this.loading = true
      try {
        // 模拟API调用
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 所有数据
        const allData = [
          {
            taskNo: 'CPF-TASK-2025030001',
            planName: '央積金A計劃',
            contributionPeriod: '2025/02/25 - 2025/03/25',
            amount: 256750.00,
            submitDate: '2025-03-01',
            status: 'reviewing',
            currentStep: '營運端審核中',
            progress: 60,
            completedDate: null
          },
          {
            taskNo: 'CPF-TASK-2025020002',
            planName: '央積金B計劃',
            contributionPeriod: '2025/01/25 - 2025/02/25',
            amount: 198500.00,
            submitDate: '2025-02-25',
            status: 'completed',
            currentStep: '對賬完成',
            progress: 100,
            completedDate: '2025-02-26'
          },
          {
            taskNo: 'CPF-TASK-2025030003',
            planName: '央積金企業計劃',
            contributionPeriod: '2025/02/25 - 2025/03/25',
            amount: 512000.00,
            submitDate: '2025-03-02',
            status: 'reviewing',
            currentStep: '初步審核中',
            progress: 30,
            completedDate: null
          },
          {
            taskNo: 'ORSO-TASK-2025030001',
            planName: '私退金計劃A',
            contributionPeriod: '2025/02/25 - 2025/03/25',
            amount: 325000.00,
            submitDate: '2025-03-01',
            status: 'reviewing',
            currentStep: '財務對賬中',
            progress: 75,
            completedDate: null
          },
          {
            taskNo: 'CPF-TASK-2025010001',
            planName: '央積金A計劃',
            contributionPeriod: '2024/12/25 - 2025/01/25',
            amount: 245000.00,
            submitDate: '2025-01-25',
            status: 'completed',
            currentStep: '對賬完成',
            progress: 100,
            completedDate: '2025-01-26'
          },
          {
            taskNo: 'ORSO-TASK-2025020001',
            planName: '私退金計劃B',
            contributionPeriod: '2025/01/25 - 2025/02/25',
            amount: 180000.00,
            submitDate: '2025-02-20',
            status: 'completed',
            currentStep: '對賬完成',
            progress: 100,
            completedDate: '2025-02-22'
          }
        ]
        
        // 只显示已完成的任务
        let filteredData = allData.filter(item => item.status === 'completed')
        
        // 应用筛选条件
        if (this.filterForm.planName) {
          filteredData = filteredData.filter(item => 
            item.planName === this.filterForm.planName
          )
        }
        
        if (this.filterForm.dateRange && this.filterForm.dateRange.length === 2) {
          const [startDate, endDate] = this.filterForm.dateRange
          filteredData = filteredData.filter(item => {
            const submitDate = new Date(item.submitDate)
            return submitDate >= new Date(startDate) && submitDate <= new Date(endDate)
          })
        }
        
        // 分页处理
        this.total = filteredData.length
        const start = (this.currentPage - 1) * this.pageSize
        const end = start + this.pageSize
        this.tableData = filteredData.slice(start, end)
        
      } catch (error) {
        ElMessage.error('加載數據失敗')
        console.error(error)
      } finally {
        this.loading = false
      }
    },


    // 格式化金额
    formatMoney(amount) {
      return amount ? `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'
    },
    
    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        'reviewing': 'warning',
        'completed': 'success'
      }
      return typeMap[status] || 'info'
    },
    
    // 获取状态文本
    getStatusText(status) {
      const textMap = {
        'reviewing': '審批中',
        'completed': '對賬完成'
      }
      return textMap[status] || status
    },
    
    // 查询
    handleSearch() {
      this.currentPage = 1
      this.loadData()
    },
    
    // 重置
    resetForm() {
      this.filterForm = {
        planName: '',
        dateRange: []
      }
      this.handleSearch()
    },

    // 刷新
    refreshData() {
      this.loadData()
      ElMessage.success('數據已刷新')
    },
    
    // 查看详情
    viewDetail(row) {
      // 跳转到详情页面
      this.$router.push({
        path: '/service-progress/detail',
        query: { taskNo: row.taskNo }
      })
    },
    
    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.loadData()
    },
    
    // 当前页改变
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadData()
    }
  }
}
</script>

<style scoped>
.service-progress {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.main-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: -18px;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.filter-form :deep(.el-input) {
  width: 200px;
}

.filter-form :deep(.el-select) {
  width: 200px;
}

.filter-form :deep(.el-date-editor) {
  width: 280px;
}

.amount-text {
  color: #2C8976;
  font-weight: 500;
}

.status-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-text {
  font-size: 12px;
  color: #666;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.total-info {
  color: #666;
  font-size: 14px;
}

.detail-dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
}

.detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.timeline-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.timeline-section h4 {
  margin-bottom: 20px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.timeline-content {
  padding-left: 10px;
}

.timeline-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.timeline-desc {
  color: #666;
  font-size: 14px;
  margin-bottom: 3px;
}

.timeline-handler {
  color: #999;
  font-size: 12px;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: 500;
}

:deep(.el-tag) {
  border-radius: 4px;
  padding: 0 12px;
  height: 24px;
  line-height: 22px;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 13px;
}

:deep(.el-timeline-item__node) {
  left: -4px;
}

:deep(.el-descriptions__label) {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: normal;
  width: 120px;
}

:deep(.el-progress__text) {
  font-size: 12px !important;
}
</style>