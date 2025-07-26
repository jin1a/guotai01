<template>
  <div class="private-notice-query">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>私退金缴费通知书查询 (E603-1)</span>
        </div>
      </template>
      
      <!-- 查询条件 -->
      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="计划名称">
          <el-select v-model="queryForm.planName" placeholder="请选择计划" clearable>
            <el-option label="全部计划" value="" />
            <el-option label="私退金计划A" value="plan-a" />
            <el-option label="私退金计划B" value="plan-b" />
          </el-select>
        </el-form-item>
        <el-form-item label="缴费期间">
          <el-date-picker
            v-model="queryForm.period"
            type="monthrange"
            range-separator="-"
            start-placeholder="开始月份"
            end-placeholder="结束月份"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部状态" value="" />
            <el-option label="待确认" value="pending" />
            <el-option label="已确认" value="confirmed" />
            <el-option label="已调整" value="adjusted" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryNotices">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 单计划列表页模式 -->
      <div v-if="!isMultiplePlans">
        <el-table :data="noticeList" style="width: 100%">
          <el-table-column prop="noticeNo" label="通知书编号" width="150" />
          <el-table-column prop="planName" label="计划名称" width="150" />
          <el-table-column prop="period" label="缴费期间" width="120" />
          <el-table-column prop="amount" label="应缴金额" width="120" />
          <el-table-column prop="dueDate" label="截止日期" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small" type="primary" @click="viewDetail(scope.row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 多计划卡片页模式 -->
      <div v-else class="plan-cards">
        <el-row :gutter="20">
          <el-col :span="8" v-for="plan in planList" :key="plan.id">
            <el-card class="plan-card" @click="viewPlanNotices(plan)">
              <template #header>
                <div class="plan-header">
                  <span>{{ plan.planName }}</span>
                  <el-tag :type="plan.hasUnconfirmed ? 'warning' : 'success'">
                    {{ plan.hasUnconfirmed ? '有待确认' : '已处理' }}
                  </el-tag>
                </div>
              </template>
              <div class="plan-info">
                <p><strong>待确认通知书：</strong>{{ plan.unconfirmedCount }}份</p>
                <p><strong>本月应缴：</strong>MOP {{ plan.currentAmount }}</p>
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
  name: 'PrivateAutoContributionNotice',
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
          noticeNo: 'PN2024001',
          planName: '私退金计划A',
          period: '2024年1月',
          amount: '50,000.00',
          dueDate: '2024-02-15',
          status: '待确认'
        },
        {
          id: 2,
          noticeNo: 'PN2024002',
          planName: '私退金计划A',
          period: '2023年12月',
          amount: '50,000.00',
          dueDate: '2024-01-15',
          status: '已确认'
        }
      ],
      planList: [
        {
          id: 1,
          planName: '私退金计划A',
          hasUnconfirmed: true,
          unconfirmedCount: 1,
          currentAmount: '50,000.00',
          dueDate: '2024-02-15'
        },
        {
          id: 2,
          planName: '私退金计划B',
          hasUnconfirmed: false,
          unconfirmedCount: 0,
          currentAmount: '40,000.00',
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
    // E603-1 → E603-1-1 (详情页面)
    viewDetail(notice) {
      // 跳转到 E603-1-1 私退金缴费通知书详情页
      this.$router.push({
        name: 'PrivateFundNoticeDetail',
        params: { id: notice.id },
        query: { noticeNo: notice.noticeNo }
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
.private-notice-query {
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