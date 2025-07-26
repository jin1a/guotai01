<template>
  <div class="contribution-records">
    <div class="page-header">
      <h1>央积金供款记录查询</h1>
      <p>查询和管理央积金自动供款记录</p>
    </div>

    <div class="filter-section">
      <el-card>
        <el-form :model="queryForm" inline>
          <el-form-item label="计划编号">
            <el-input v-model="queryForm.planNo" placeholder="请输入计划编号" clearable />
          </el-form-item>
          <el-form-item label="供款期间">
            <el-date-picker
              v-model="queryForm.dateRange"
              type="monthrange"
              range-separator="至"
              start-placeholder="开始月份"
              end-placeholder="结束月份"
            />
          </el-form-item>
          <el-form-item label="记录状态">
            <el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
              <el-option label="已完成" value="completed" />
              <el-option label="处理中" value="processing" />
              <el-option label="异常" value="error" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="exportRecords">导出</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <div class="content-wrapper">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>供款记录列表</span>
            <div class="summary-info">
              <el-tag type="info">总记录数: {{ total }}</el-tag>
              <el-tag type="success">总供款金额: {{ formatMoney(totalAmount) }}</el-tag>
            </div>
          </div>
        </template>

        <el-table :data="recordsList" style="width: 100%" :summary-method="getSummaries" show-summary>
          <el-table-column prop="recordNo" label="记录编号" width="160" />
          <el-table-column prop="planNo" label="计划编号" width="120" />
          <el-table-column prop="planName" label="计划名称" min-width="180" />
          <el-table-column prop="period" label="供款期间" width="120" />
          <el-table-column prop="employerAmount" label="雇主供款" width="120">
            <template #default="scope">
              {{ formatMoney(scope.row.employerAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="employeeAmount" label="雇员供款" width="120">
            <template #default="scope">
              {{ formatMoney(scope.row.employeeAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalAmount" label="合计金额" width="120">
            <template #default="scope">
              {{ formatMoney(scope.row.totalAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="processDate" label="处理日期" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <el-button type="primary" size="small" @click="viewDetail(scope.row)">
                查看详情
              </el-button>
              <el-button type="info" size="small" @click="downloadRecord(scope.row)">
                下载
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

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="供款记录详情"
      width="800px"
    >
      <div v-if="selectedRecord" class="record-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="记录编号">{{ selectedRecord.recordNo }}</el-descriptions-item>
          <el-descriptions-item label="计划编号">{{ selectedRecord.planNo }}</el-descriptions-item>
          <el-descriptions-item label="计划名称">{{ selectedRecord.planName }}</el-descriptions-item>
          <el-descriptions-item label="供款期间">{{ selectedRecord.period }}</el-descriptions-item>
          <el-descriptions-item label="雇主供款">{{ formatMoney(selectedRecord.employerAmount) }}</el-descriptions-item>
          <el-descriptions-item label="雇员供款">{{ formatMoney(selectedRecord.employeeAmount) }}</el-descriptions-item>
          <el-descriptions-item label="合计金额">{{ formatMoney(selectedRecord.totalAmount) }}</el-descriptions-item>
          <el-descriptions-item label="处理日期">{{ selectedRecord.processDate }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedRecord.status)">
              {{ getStatusText(selectedRecord.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="备注">{{ selectedRecord.remark || '无' }}</el-descriptions-item>
        </el-descriptions>

        <div class="employee-detail" style="margin-top: 20px;">
          <h4>雇员供款明细</h4>
          <el-table :data="selectedRecord.employees" style="width: 100%">
            <el-table-column prop="employeeNo" label="雇员编号" width="120" />
            <el-table-column prop="employeeName" label="雇员姓名" width="120" />
            <el-table-column prop="employerAmount" label="雇主供款" width="100">
              <template #default="scope">
                {{ formatMoney(scope.row.employerAmount) }}
              </template>
            </el-table-column>
            <el-table-column prop="employeeAmount" label="雇员供款" width="100">
              <template #default="scope">
                {{ formatMoney(scope.row.employeeAmount) }}
              </template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="小计" width="100">
              <template #default="scope">
                {{ formatMoney(scope.row.totalAmount) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ContributionRecords',
  data() {
    return {
      queryForm: {
        planNo: '',
        dateRange: '',
        status: ''
      },
      currentPage: 1,
      pageSize: 10,
      total: 35,
      totalAmount: 1250800.75,
      detailDialogVisible: false,
      selectedRecord: null,
      recordsList: [
        {
          recordNo: 'CR202312001',
          planNo: 'CP001',
          planName: '公司A央积金计划',
          period: '2023-12',
          employerAmount: 63840.25,
          employeeAmount: 61840.25,
          totalAmount: 125680.50,
          processDate: '2024-01-15',
          status: 'completed',
          remark: '正常处理',
          employees: [
            {
              employeeNo: 'E001',
              employeeName: '张三',
              employerAmount: 1500.00,
              employeeAmount: 1500.00,
              totalAmount: 3000.00
            },
            {
              employeeNo: 'E002',
              employeeName: '李四',
              employerAmount: 2000.00,
              employeeAmount: 2000.00,
              totalAmount: 4000.00
            }
          ]
        },
        {
          recordNo: 'CR202312002',
          planNo: 'CP002',
          planName: '公司B央积金计划',
          period: '2023-12',
          employerAmount: 49380.00,
          employeeAmount: 49380.00,
          totalAmount: 98760.00,
          processDate: '2024-01-16',
          status: 'completed',
          remark: '正常处理',
          employees: []
        },
        {
          recordNo: 'CR202401001',
          planNo: 'CP001',
          planName: '公司A央积金计划',
          period: '2024-01',
          employerAmount: 65180.12,
          employeeAmount: 63180.13,
          totalAmount: 128360.25,
          processDate: '2024-02-15',
          status: 'processing',
          remark: '处理中',
          employees: []
        }
      ]
    }
  },
  methods: {
    formatMoney(amount) {
      return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    },
    getStatusType(status) {
      const typeMap = {
        'completed': 'success',
        'processing': 'warning',
        'error': 'danger'
      }
      return typeMap[status] || 'info'
    },
    getStatusText(status) {
      const textMap = {
        'completed': '已完成',
        'processing': '处理中',
        'error': '异常'
      }
      return textMap[status] || status
    },
    getSummaries(param) {
      const { columns, data } = param
      const sums = []
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        if (['employerAmount', 'employeeAmount', 'totalAmount'].includes(column.property)) {
          const values = data.map(item => Number(item[column.property]))
          if (!values.every(value => isNaN(value))) {
            sums[index] = this.formatMoney(values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            }, 0))
          } else {
            sums[index] = '-'
          }
        } else {
          sums[index] = '-'
        }
      })
      return sums
    },
    handleSearch() {
      this.$message.info('执行查询操作')
    },
    handleReset() {
      this.queryForm = {
        planNo: '',
        dateRange: '',
        status: ''
      }
      this.$message.info('重置查询条件')
    },
    exportRecords() {
      this.$message.success('导出供款记录')
    },
    viewDetail(record) {
      this.selectedRecord = record
      this.detailDialogVisible = true
    },
    downloadRecord(record) {
      this.$message.success(`下载供款记录: ${record.recordNo}`)
    },
    handleSizeChange(val) {
      this.pageSize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    }
  }
}
</script>

<style scoped>
.contribution-records {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  color: #303133;
  margin-bottom: 8px;
}

.page-header p {
  color: #606266;
  margin: 0;
}

.filter-section {
  margin-bottom: 20px;
}

.content-wrapper {
  background: #fff;
  border-radius: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-info {
  display: flex;
  gap: 12px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.record-detail .employee-detail h4 {
  color: #303133;
  margin-bottom: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>