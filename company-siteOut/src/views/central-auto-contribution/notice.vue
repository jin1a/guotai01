<template>
  <div class="notice-query">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>央積金繳費通知書查詢 (E503-1)</span>
        </div>
      </template>
      
      <!-- 查詢條件 -->
      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="計劃名稱">
          <el-select v-model="queryForm.planName" placeholder="請選擇計劃" clearable>
            <el-option label="全部計劃" value="" />
            <el-option label="ER12345 集團統一央積金共同計劃" value="ER12345" />
            <el-option label="ER67890 企業專項央積金計劃" value="ER67890" />
          </el-select>
        </el-form-item>
        <el-form-item label="繳費期間">
          <el-date-picker
            v-model="queryForm.period"
            type="monthrange"
            range-separator="-"
            start-placeholder="開始月份"
            end-placeholder="結束月份"
          />
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="queryForm.status" placeholder="請選擇狀態" clearable>
            <el-option label="全部狀態" value="" />
            <el-option label="待確認" value="pending" />
            <el-option label="已確認" value="confirmed" />
            <el-option label="已調整" value="adjusted" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryNotices">查詢</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 單計劃列表頁模式 -->
      <div v-if="!isMultiplePlans">
        <el-table :data="noticeList" style="width: 100%">
          <el-table-column prop="planNo" label="計劃編號" width="150" />
          <el-table-column prop="planName" label="計劃名稱" width="200" />
          <el-table-column prop="period" label="繳費期間" width="120" />
          <el-table-column prop="amount" label="應繳金額" width="120" />
          <el-table-column prop="dueDate" label="截止日期" width="120" />
          <el-table-column prop="status" label="狀態" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small" type="primary" @click="viewDetail(scope.row)">
                查看詳情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 多計劃卡片頁模式 -->
      <div v-else class="plan-cards">
        <el-row :gutter="20">
          <el-col :span="8" v-for="plan in planList" :key="plan.id">
            <el-card class="plan-card" @click="viewPlanNotices(plan)">
              <template #header>
                <div class="plan-header">
                  <span>{{ plan.planName }}</span>
                  <el-tag :type="plan.hasUnconfirmed ? 'warning' : 'success'">
                    {{ plan.hasUnconfirmed ? '有待確認' : '已處理' }}
                  </el-tag>
                </div>
              </template>
              <div class="plan-info">
                <p><strong>待確認通知書：</strong>{{ plan.unconfirmedCount }}份</p>
                <p><strong>本月應繳：</strong>MOP {{ plan.currentAmount }}</p>
                <p><strong>截止日期：</strong>{{ plan.dueDate }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CentralAutoContributionNotice',
  data() {
    return {
      queryForm: {
        planName: '',
        period: '',
        status: ''
      },
      isMultiplePlans: false, // 是否多计划模式
      noticeList: [
        {
          id: 1,
          planNo: 'ER12345',
          planName: 'ER12345 集團統一央積金共同計劃',
          period: '2024年3月',
          amount: '125,000.00',
          dueDate: '2024-03-25',
          status: '待確認'
        },
        {
          id: 2,
          planNo: 'ER67890',
          planName: 'ER67890 企業專項央積金計劃',
          period: '2024年3月',
          amount: '80,000.00',
          dueDate: '2024-03-25',
          status: '待確認'
        }
      ],
      planList: [
        {
          id: 1,
          planName: '央积金计划A',
          hasUnconfirmed: true,
          unconfirmedCount: 2,
          currentAmount: '100,000.00',
          dueDate: '2024-02-15'
        },
        {
          id: 2,
          planName: '央积金计划B',
          hasUnconfirmed: false,
          unconfirmedCount: 0,
          currentAmount: '80,000.00',
          dueDate: '2024-02-15'
        }
      ]
    }
  },
  methods: {
    getStatusType(status) {
      const statusMap = {
        '待确认': 'warning',
        '已确认': 'success',
        '已调整': 'info'
      }
      return statusMap[status] || 'info'
    },
    queryNotices() {
      // 根据状态筛选
      if (this.queryForm.status === 'confirmed') {
        // 已确认的通知书不显示在列表中
        this.noticeList = []
        this.$message.info('已确认的通知书不显示在此列表中')
      } else {
        // 只显示待确认的通知书
        this.noticeList = [
          {
            id: 1,
            planNo: 'CPF-PLAN-001',
            planName: '央积金计划A',
            period: '2024年3月',
            amount: '125,000.00',
            dueDate: '2024-03-25',
            status: '待确认'
          },
          {
            id: 2,
            planNo: 'CPF-PLAN-002',
            planName: '央积金计划B',
            period: '2024年3月',
            amount: '80,000.00',
            dueDate: '2024-03-25',
            status: '待确认'
          }
        ]
      }
      this.$message.success('查询完成')
    },
    resetQuery() {
      this.queryForm = {
        planName: '',
        period: '',
        status: ''
      }
      this.queryNotices()
    },
    // E503-1 → E503-1-1 (详情页面)
    viewDetail(notice) {
      // 跳转到 E503-1-1 缴费通知书详情页
      this.$router.push({
        name: 'CentralFundNoticeDetail',
        params: { id: notice.planNo },
        query: { 
          planNo: notice.planNo,
          period: notice.period 
        }
      })
    },
    viewPlanNotices(plan) {
      // 多计划模式下，点击卡片查看该计划的通知书列表
      this.$message.info(`查看${plan.planName}的通知书`)
      this.isMultiplePlans = false
      this.queryForm.planName = plan.planName
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

.plan-cards {
  margin-top: 20px;
}

.plan-card {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.plan-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-info p {
  margin: 8px 0;
  color: #606266;
}
</style>