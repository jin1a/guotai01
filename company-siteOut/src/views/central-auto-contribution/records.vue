<template>
  <div class="contribution-records">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>央积金供款记录查询 (E503-3)</span>
        </div>
      </template>
      
      <!-- 查询条件 -->
      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="计划名称">
          <el-select v-model="queryForm.planName" placeholder="请选择计划" clearable>
            <el-option label="全部计划" value="" />
            <el-option label="央积金计划A" value="plan-a" />
            <el-option label="央积金计划B" value="plan-b" />
          </el-select>
        </el-form-item>
        <el-form-item label="供款期间">
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
            <el-option label="已完成" value="completed" />
            <el-option label="对账中" value="reconciling" />
            <el-option label="已拒绝" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryRecords">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 单计划列表页模式 -->
      <div v-if="!isMultiplePlans">
        <el-table :data="recordsList" style="width: 100%">
          <el-table-column prop="recordNo" label="记录编号" width="150" />
          <el-table-column prop="planName" label="计划名称" width="150" />
          <el-table-column prop="period" label="供款期间" width="120" />
          <el-table-column prop="amount" label="供款金额" width="120" />
          <el-table-column prop="paymentDate" label="缴费日期" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small" @click="viewRecordDetail(scope.row)">
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
      
      <!-- 多计划卡片页模式 -->
      <div v-else class="plan-cards">
        <el-row :gutter="20">
          <el-col :span="8" v-for="plan in planList" :key="plan.id">
            <el-card class="plan-card" @click="viewPlanRecords(plan)">
              <template #header>
                <div class="plan-header">
                  <span>{{ plan.planName }}</span>
                  <el-tag :type="plan.hasCompleted ? 'success' : 'warning'">
                    {{ plan.hasCompleted ? '已完成' : '进行中' }}
                  </el-tag>
                </div>
              </template>
              <div class="plan-info">
                <p><strong>本年度供款记录：</strong>{{ plan.recordCount }}笔</p>
                <p><strong>本年度总供款：</strong>MOP {{ plan.totalAmount }}</p>
                <p><strong>最后供款日期：</strong>{{ plan.lastPaymentDate }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- E503-3-1 供款记录详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="供款记录详情"
      width="800px"
    >
      <div v-if="selectedRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录编号">{{ selectedRecord.recordNo }}</el-descriptions-item>
          <el-descriptions-item label="计划名称">{{ selectedRecord.planName }}</el-descriptions-item>
          <el-descriptions-item label="供款期间">{{ selectedRecord.period }}</el-descriptions-item>
          <el-descriptions-item label="供款金额">MOP {{ selectedRecord.amount }}</el-descriptions-item>
          <el-descriptions-item label="缴费日期">{{ selectedRecord.paymentDate }}</el-descriptions-item>
          <el-descriptions-item label="对账完成日期">{{ selectedRecord.reconcileDate || '未完成' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedRecord.status)">
              {{ selectedRecord.status }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="1">
            {{ selectedRecord.remark || '无' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 供款明细 -->
        <div class="detail-section">
          <h4>供款明细</h4>
          <el-table :data="selectedRecord.details" size="small">
            <el-table-column prop="employeeName" label="雇员姓名" width="120" />
            <el-table-column prop="employeeNo" label="雇员编号" width="120" />
            <el-table-column prop="contributionAmount" label="供款金额" width="120" />
            <el-table-column prop="status" label="状态" width="100" />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'CentralAutoContributionRecords',
  data() {
    return {
      queryForm: {
        planName: '',
        period: '',
        status: ''
      },
      isMultiplePlans: false, // 是否多计划模式
      recordsList: [
        {
          id: 1,
          recordNo: 'CR2024001',
          planName: '央积金计划A',
          period: '2024年1月',
          amount: '100,000.00',
          paymentDate: '2024-01-25',
          reconcileDate: '2024-01-30',
          status: '已完成',
          remark: '正常供款记录',
          details: [
            { employeeName: '张三', employeeNo: 'EMP001', contributionAmount: '2,500.00', status: '已对账' },
            { employeeName: '李四', employeeNo: 'EMP002', contributionAmount: '3,000.00', status: '已对账' }
          ]
        },
        {
          id: 2,
          recordNo: 'CR2023012',
          planName: '央积金计划A',
          period: '2023年12月',
          amount: '100,000.00',
          paymentDate: '2023-12-25',
          reconcileDate: '2023-12-28',
          status: '已完成',
          remark: '年度最后一笔供款',
          details: [
            { employeeName: '张三', employeeNo: 'EMP001', contributionAmount: '2,500.00', status: '已对账' },
            { employeeName: '李四', employeeNo: 'EMP002', contributionAmount: '3,000.00', status: '已对账' }
          ]
        }
      ],
      planList: [
        {
          id: 1,
          planName: '央积金计划A',
          hasCompleted: true,
          recordCount: 12,
          totalAmount: '1,200,000.00',
          lastPaymentDate: '2024-01-25'
        },
        {
          id: 2,
          planName: '央积金计划B',
          hasCompleted: false,
          recordCount: 11,
          totalAmount: '880,000.00',
          lastPaymentDate: '2024-01-20'
        }
      ],
      currentPage: 1,
      pageSize: 10,
      total: 2,
      detailDialogVisible: false,
      selectedRecord: null
    }
  },
  methods: {
    getStatusType(status) {
      const statusMap = {
        '已完成': 'success',
        '对账中': 'warning',
        '已拒绝': 'danger',
        '待处理': 'info'
      }
      return statusMap[status] || 'info'
    },
    queryRecords() {
      this.$message.success('查询完成')
    },
    resetQuery() {
      this.queryForm = {
        planName: '',
        period: '',
        status: ''
      }
      this.queryRecords()
    },
    // E503-3 → E503-3-1 (详情弹窗)
    viewRecordDetail(record) {
      this.selectedRecord = record
      this.detailDialogVisible = true
    },
    viewPlanRecords(plan) {
      // 多计划模式下，点击卡片查看该计划的记录列表
      this.$message.info(`查看${plan.planName}的供款记录`)
      this.isMultiplePlans = false
      this.queryForm.planName = plan.planName
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.queryRecords()
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.queryRecords()
    }
  }
}
</script>

<style scoped>
.contribution-records {
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

.pagination-wrapper {
  margin-top: 20px;
  text-align: right;
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

.detail-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.detail-section h4 {
  margin-bottom: 12px;
  color: #303133;
}
</style>