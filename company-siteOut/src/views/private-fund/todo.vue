<template>
  <div class="private-fund-todo">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>私退金待办列表 (E601)</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <!-- 待确认缴费通知书 -->
        <el-tab-pane 
          label="缴费通知书待确认" 
          name="notice"
        >
          <el-table :data="noticeTodos" style="width: 100%">
            <el-table-column prop="planNo" label="计划编号" width="150" />
            <el-table-column prop="planName" label="计划名称" width="200" />
            <el-table-column prop="period" label="缴费期间" width="120" />
            <el-table-column prop="amount" label="应缴金额" width="120" />
            <el-table-column prop="generateDate" label="生成日期" width="120" />
            <el-table-column prop="dueDate" label="截止日期" width="120" />
            <el-table-column label="操作" width="140">
              <template #default="scope">
                <el-button size="small" @click="handleNoticeView(scope.row)">詳情</el-button>
                <el-button size="small" type="primary" @click="handleNoticeConfirm(scope.row)">確認</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <!-- 手动供款清单审批 -->
        <el-tab-pane 
          label="手动供款清单审批" 
          name="manualContribution"
        >
          <el-table :data="manualContributionTodos" style="width: 100%">
            <el-table-column prop="planNo" label="计划编号" width="150" />
            <el-table-column prop="planName" label="计划名称" width="200" />
            <el-table-column prop="contributionMonth" label="供款月份" width="120" />
            <el-table-column prop="contributionType" label="供款类型" width="120" />
            <el-table-column prop="totalAmount" label="总金额" width="120" />
            <el-table-column prop="employeeCount" label="参与人数" width="100" />
            <el-table-column prop="submitter" label="提交人" width="120" />
            <el-table-column prop="submitTime" label="提交时间" width="150" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140">
              <template #default="scope">
                <el-button size="small" @click="viewDetail(scope.row)">詳情</el-button>
                <el-button size="small" type="primary" @click="handleManualContributionReview(scope.row)">審核</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <!-- 供款调整待申请 -->
        <el-tab-pane 
          label="供款调整待申请" 
          name="adjustment"
        >
          <el-table :data="adjustmentTodos" style="width: 100%">
            <el-table-column prop="planNo" label="计划编号" width="150" />
            <el-table-column prop="planName" label="计划名称" width="200" />
            <el-table-column prop="period" label="调整期间" width="120" />
            <el-table-column prop="adjustType" label="调整类型" width="120" />
            <el-table-column prop="affectedCount" label="影响人数" width="100" />
            <el-table-column prop="discoveryDate" label="发现日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag type="warning">
                  待申请
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140">
              <template #default="scope">
                <el-button size="small" @click="handleAdjustmentView(scope.row)">詳情</el-button>
                <el-button size="small" type="primary" @click="handleAdjustmentApply(scope.row)">申請調整</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        
        <!-- 调整申请待审核 -->
        <el-tab-pane 
          label="调整申请待审核" 
          name="adjustmentReview"
        >
          <el-table :data="adjustmentReviewTodos" style="width: 100%">
            <el-table-column prop="adjustNo" label="申请编号" width="150" />
            <el-table-column prop="planNo" label="计划编号" width="150" />
            <el-table-column prop="planName" label="计划名称" width="150" />
            <el-table-column prop="adjustType" label="调整类型" width="120" />
            <el-table-column prop="adjustPeriod" label="调整期间" width="120" />
            <el-table-column prop="submitter" label="提交人" width="100" />
            <el-table-column prop="submitDate" label="提交日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag type="warning">
                  待审核
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140">
              <template #default="scope">
                <el-button size="small" @click="handleReviewDetail(scope.row)">詳情</el-button>
                <el-button size="small" type="primary" @click="handleAdjustmentReview(scope.row)">審核</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- E601-1 待办详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="待办详情"
      width="600px"
    >
      <div v-if="selectedItem">
        <p><strong>申请类型：</strong>{{ selectedItem.applicationType }}</p>
        <p><strong>雇员姓名：</strong>{{ selectedItem.employeeName }}</p>
        <p><strong>提交日期：</strong>{{ selectedItem.submitDate }}</p>
        <p><strong>当前状态：</strong>{{ selectedItem.status }}</p>
        <p><strong>备注：</strong>{{ selectedItem.remark || '无' }}</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="goToOperationCenter">
            前往营运端审核
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'PrivateFundTodo',
  data() {
    return {
      activeTab: 'notice',
      // 待确认的缴费通知书
      noticeTodos: [
        {
          id: 1,
          planNo: 'PF-PLAN-001',
          planName: '私退金计划A',
          period: '2024年3月',
          amount: '125,000.00',
          generateDate: '2024-03-05',
          dueDate: '2024-03-25'
        },
        {
          id: 2,
          planNo: 'PF-PLAN-002',
          planName: '私退金计划B',
          period: '2024年3月',
          amount: '80,000.00',
          generateDate: '2024-03-05',
          dueDate: '2024-03-25'
        }
      ],
      // 手动供款清单审批
      manualContributionTodos: [
        {
          id: 1,
          planNo: 'PF-PLAN-001',
          planName: '私退金计划A',
          contributionMonth: '2025年1月',
          contributionType: '正常供款',
          totalAmount: '125,000.00',
          employeeCount: 42,
          submitter: '人力资源部陈经理',
          submitTime: '2025-01-20 14:30',
          status: '待审批',
          remarks: '正常月度手动供款清单'
        },
        {
          id: 2,
          planNo: 'PF-PLAN-002', 
          planName: '私退金计划B',
          contributionMonth: '2025年1月',
          contributionType: '补缴供款',
          totalAmount: '85,000.00',
          employeeCount: 28,
          submitter: '财务部李主管',
          submitTime: '2025-01-21 09:15',
          status: '审批中',
          remarks: '补缴12月遗漏的手动供款'
        }
      ],
      // 供款调整待申请（处理人）
      adjustmentTodos: [
        {
          id: 1,
          planNo: 'PF-PLAN-001',
          planName: '私退金计划A',
          period: '2024年3月',
          adjustType: '人员变动',
          affectedCount: 3,
          discoveryDate: '2024-03-10',
          status: 'pending_apply',
          description: '3名员工离职，需要调整供款名单'
        },
        {
          id: 2,
          planNo: 'PF-PLAN-002',
          planName: '私退金计划B',
          period: '2024年3月',
          adjustType: '薪资调整',
          affectedCount: 5,
          discoveryDate: '2024-03-08',
          status: 'pending_apply',
          description: '5名员工薪资调整，需要更新供款基数'
        }
      ],
      // 调整申请待审核
      adjustmentReviewTodos: [
        {
          id: 1,
          adjustNo: 'ADJ-2024030001',
          planNo: 'PF-PLAN-001',
          planName: '私退金计划A',
          adjustType: '薪资调整',
          adjustPeriod: '2024年3月',
          submitter: '李四',
          submitDate: '2024-03-01',
          status: 'pending_review'
        }
      ],
      detailDialogVisible: false,
      selectedItem: null
    }
  },
  methods: {
    handleTabClick(tab) {
      console.log('切换标签:', tab.name)
    },
    getStatusType(status) {
      const statusMap = {
        '审核中': 'warning',
        '审批中': 'warning',
        '已通过': 'success',
        '已拒绝': 'danger',
        '待审核': '',
        '待审批': '',
        '审批失败': 'danger'
      }
      return statusMap[status] || ''
    },
    // 查看通知书详情
    handleNoticeView(item) {
      this.$router.push({
        path: `/private-fund/auto-contribution/notice-detail/${item.planNo}`,
        query: { planNo: item.planNo, period: item.period }
      })
    },
    // 确认通知书
    handleNoticeConfirm(item) {
      this.$confirm('确认接受此缴费通知书？', '确认操作', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('通知书已确认')
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
    // 手动供款清单审批
    handleManualContributionReview(item) {
      this.$message.info(`审核手动供款清单: ${item.planNo} - ${item.contributionMonth}`)
      // TODO: 实现审核逻辑或跳转到审核页面
    },
    // 审核调整申请  
    handleAdjustmentReview(item) {
      this.$message.info(`审核调整申请: ${item.adjustNo}`)
      // TODO: 跳转到调整申请审核页面
    },
    // 查看调整详情
    handleAdjustmentView(item) {
      this.$message.info(`查看调整详情: ${item.planNo} - ${item.period}`)
      // TODO: 实现查看调整详情
    },
    // 申请供款调整（处理人）
    handleAdjustmentApply(item) {
      this.$router.push({
        path: '/private-fund/contribution-adjustment',
        query: { 
          planNo: item.planNo,
          period: item.period,
          type: item.adjustType
        }
      })
    },
    // 查看审核详情
    handleReviewDetail(item) {
      this.$message.info(`查看审核详情: ${item.adjustNo}`)
      // TODO: 实现查看审核详情
    },
    viewDetail(item) {
      this.selectedItem = item
      this.detailDialogVisible = true
    },
    goToOperationCenter() {
      // 前往营运端审核 (P801-8)
      console.log('前往营运端审核')
      this.detailDialogVisible = false
    }
  }
}
</script>

<style scoped>
.todo-list {
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.search-input {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>