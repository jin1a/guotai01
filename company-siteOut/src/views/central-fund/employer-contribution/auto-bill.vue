<template>
  <div class="notice-query">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>央積金自動供款账单查詢</span>
        </div>
      </template>
      
      <!-- 查詢條件 -->
      <el-form :model="queryForm" class="query-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="計劃名稱">
              <el-select v-model="queryForm.planName" placeholder="請選擇計劃" clearable style="width: 100%">
                <el-option label="全部計劃" value="" />
                <el-option label="ER12345 集團統一央積金共同計劃" value="ER12345" />
                <el-option label="ER67890 企業專項央積金計劃" value="ER67890" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="供款期間">
              <el-date-picker
                v-model="queryForm.period"
                type="monthrange"
                range-separator="-"
                start-placeholder="開始月份"
                end-placeholder="結束月份"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="狀態">
              <el-select v-model="queryForm.status" placeholder="請選擇狀態" clearable style="width: 100%">
                <el-option label="全部狀態" value="" />
                <el-option label="待確認" value="待確認" />
                <el-option label="調整中" value="調整中" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6" style="text-align: right;">
            <el-form-item>
              <el-button type="primary" @click="queryNotices">
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
      <el-table :data="noticeList" style="width: 100%">
        <el-table-column prop="planNo" label="計劃編號" min-width="150" />
        <el-table-column prop="planName" label="計劃名稱" min-width="200" />
        <el-table-column prop="period" label="供款期間" min-width="120" />
        <el-table-column prop="amount" label="應繳金額" min-width="140" align="right">
          <template #default="scope">
            <span class="amount-text">MOP {{ scope.row.amount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="截止日期" min-width="120" />
        <el-table-column prop="status" label="狀態" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">詳情</el-button>
            
            <!-- 待确认状态的按钮 -->
            <template v-if="scope.row.status === '待確認'">
              <el-button 
                type="success" 
                size="small"
                @click="confirmNotice(scope.row)"
              >
                確認
              </el-button>
              <el-button 
                type="warning" 
                size="small"
                @click="adjustNotice(scope.row)"
              >
                調整
              </el-button>
            </template>
            
            <!-- 调整中状态的按钮 -->
            <template v-if="scope.row.status === '調整中'">
              <el-button 
                type="success" 
                size="small"
                @click="confirmNotice(scope.row)"
              >
                確認
              </el-button>
              <el-button 
                type="primary" 
                size="small"
                @click="regenerateBill(scope.row)"
              >
                重新生成账单
              </el-button>
            </template>
            
            <!-- 已确认状态不显示操作按钮（只有详情） -->
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { Search, Refresh } from '@element-plus/icons-vue'

export default {
  name: 'CentralFundAutoBill',
  components: {
    Search,
    Refresh
  },
  data() {
    return {
      queryForm: {
        planName: '',
        period: '',
        status: ''
      },
      currentPage: 1,
      pageSize: 10,
      total: 2,
      noticeList: [
        {
          id: 1,
          planNo: 'ER12345',
          planName: 'ER12345 集團統一央積金共同計劃',
          period: '2025年3月',
          amount: '128,500.00',
          dueDate: '2025-03-15',
          status: '待確認'
        },
        {
          id: 2,
          planNo: 'ER67890',
          planName: 'ER67890 企業專項央積金計劃',
          period: '2025年2月',
          amount: '95,280.00',
          dueDate: '2025-02-15',
          status: '調整中'
        }
      ]
    }
  },
  methods: {
    getStatusType(status) {
      const statusMap = {
        '待確認': 'warning',
        '調整中': 'info',
        '已確認': 'success'
      }
      return statusMap[status] || 'info'
    },
    queryNotices() {
      this.$message.success('查詢完成')
    },
    resetQuery() {
      this.queryForm = {
        planName: '',
        period: '',
        status: ''
      }
      this.queryNotices()
    },
    viewDetail(notice) {
      // 跳轉到詳情頁面（使用notice-detail.vue結構）
      this.$router.push({
        path: `/central-fund/auto-contribution/notice-detail/${notice.planNo}`,
        query: { 
          planNo: notice.planNo,
          period: notice.period 
        }
      })
    },
    confirmNotice(notice) {
      this.$confirm(
        `確認接受此自動供款账单嗎？\n\n計劃編號：${notice.planNo}\n應繳金額：MOP ${notice.amount}`,
        '確認账单',
        {
          confirmButtonText: '確認',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        notice.status = '已確認'
        this.$message.success('账单已確認！')
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
    adjustNotice(notice) {
      this.$confirm(
        `申請調整此自動供款账单嗎？\n\n計劃編號：${notice.planNo}\n當前金額：MOP ${notice.amount}`,
        '申請調整',
        {
          confirmButtonText: '申請調整',
          cancelButtonText: '取消',
          type: 'warning'  
        }
      ).then(() => {
        // 设置状态为调整中
        notice.status = '調整中'
        this.$message.success('調整申請已提交，账单狀態已更新為調整中')
        // 这里可以调用API更新后端状态
        console.log('调整申请已提交:', notice.planNo)
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
    
    // 重新生成账单
    regenerateBill(notice) {
      this.$confirm(
        `確定要重新生成此账单嗎？\n\n計劃編號：${notice.planNo}\n供款期間：${notice.period}\n\n重新生成后，账单狀態將變為待確認。`,
        '重新生成账单',
        {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 重新生成账单，设置状态为待确认
        notice.status = '待確認'
        this.$message.success('账单已重新生成，狀態已更新為待確認')
        // 这里可以调用API重新生成账单
        console.log('重新生成账单:', notice.planNo)
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
    
    // 分页处理
    handleSizeChange(val) {
      this.pageSize = val
      this.queryNotices()
    },
    
    handleCurrentChange(val) {
      this.currentPage = val
      this.queryNotices()
    }
  }
}
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