<template>
  <div class="notice-query">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>私退金手動供款账单查詢</span>
        </div>
      </template>
      
      <!-- 查詢條件 -->
      <el-form :model="queryForm" class="query-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="計劃名稱">
              <el-select v-model="queryForm.planName" placeholder="請選擇計劃" clearable style="width: 100%">
                <el-option label="全部計劃" value="" />
                <el-option label="PF12345 集團私人退休金計劃" value="PF12345" />
                <el-option label="PF67890 企業專項私退金計劃" value="PF67890" />
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
                <el-option label="待確認" value="pending" />
                <el-option label="調整中" value="adjusting" />
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
        <el-table-column prop="generateTime" label="生成時間" min-width="180" />
        <el-table-column prop="status" label="狀態" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">詳情</el-button>
            <el-button 
              v-if="scope.row.status === '待確認'"
              type="success" 
              size="small"
              @click="confirmNotice(scope.row)"
            >
              確認
            </el-button>
            <el-button 
              v-if="scope.row.status === '待確認'"
              type="warning" 
              size="small"
              @click="resubmitList(scope.row)"
            >
              重新提交清單
            </el-button>
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
  name: 'PrivateFundManualBill',
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
          planNo: 'PF12345',
          planName: 'PF12345 集團私人退休金計劃',
          period: '2025年3月',
          amount: '144,000.00',
          generateTime: '2025-03-01 10:15:00',
          status: '待確認'
        },
        {
          id: 2,
          planNo: 'PF67890',
          planName: 'PF67890 企業專項私退金計劃',
          period: '2025年2月',
          amount: '112,500.00',
          generateTime: '2025-02-01 14:20:00',
          status: '調整中'
        }
      ]
    }
  },
  methods: {
    getStatusType(status) {
      const statusMap = {
        '待確認': 'warning',
        '調整中': 'warning',
        '已撤銷': 'info'
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
        path: `/private-fund/employer-contribution/manual-bill-detail/${notice.planNo}`,
        query: { 
          planNo: notice.planNo,
          period: notice.period 
        }
      })
    },
    confirmNotice(notice) {
      this.$confirm(
        `確認接受此私退金手動供款账单嗎？\n\n計劃編號：${notice.planNo}\n應繳金額：MOP ${notice.amount}`,
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
    resubmitList(notice) {
      this.$confirm(
        '重新提交供款清單將跳轉到清單提交頁面，是否繼續？',
        '重新提交清單',
        {
          confirmButtonText: '確定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 跳轉到提交供款清單頁面
        this.$router.push({
          path: '/private-fund/employer-contribution/submit-list',
          query: {
            planNo: notice.planNo,
            period: notice.period,
            resubmit: true
          }
        })
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