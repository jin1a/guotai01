<template>
  <div class="reconciliation-records-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>對賬記錄查詢</span>
          <div class="header-actions">
            <el-badge :value="newCount" class="badge-new" v-if="newCount > 0">
              <el-button type="primary" size="small">
                新對賬報告
              </el-button>
            </el-badge>
            <el-button @click="refreshRecords">
              刷新
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索条件 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="對賬編號">
              <el-input 
                v-model="searchForm.recordNo" 
                placeholder="請輸入對賬編號"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="計劃名稱">
              <el-select 
                v-model="searchForm.planNo" 
                placeholder="請選擇計劃"
                clearable
                style="width: 100%"
              >
                <el-option 
                  v-for="plan in planList" 
                  :key="plan.value"
                  :label="plan.label"
                  :value="plan.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="對賬期間">
              <el-date-picker
                v-model="searchForm.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="狀態">
              <el-select 
                v-model="searchForm.status" 
                placeholder="全部狀態"
                clearable
                style="width: 100%"
              >
                <el-option label="全部" value="" />
                <el-option label="已完成" value="completed" />
                <el-option label="有差異" value="difference" />
                <el-option label="待確認" value="pending" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24" class="text-right">
            <el-button @click="resetSearch">重置</el-button>
            <el-button type="primary" @click="handleSearch">查詢</el-button>
            <el-button type="success" @click="exportRecords">導出記錄</el-button>
          </el-col>
        </el-row>
      </el-form>
      
      <!-- 统计卡片 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-value">{{ totalRecords }}</div>
          <div class="stat-label">總對賬次數</div>
        </div>
        <div class="stat-card success">
          <div class="stat-value">{{ perfectMatchCount }}</div>
          <div class="stat-label">完全匹配</div>
        </div>
        <div class="stat-card warning">
          <div class="stat-value">{{ differenceCount }}</div>
          <div class="stat-label">有差異</div>
        </div>
        <div class="stat-card primary">
          <div class="stat-value">{{ averageMatchRate }}%</div>
          <div class="stat-label">平均匹配率</div>
        </div>
      </div>
      
      <!-- 对账记录表格 -->
      <el-table 
        :data="recordList" 
        style="width: 100%" 
        v-loading="loading"
        @row-click="handleRowClick"
      >
        <el-table-column type="expand">
          <template #default="props">
            <div class="expand-content">
              <div class="expand-info">
                <div class="info-item">
                  <span class="label">系統清單金額：</span>
                  <span class="value">{{ formatMoney(props.row.systemAmount) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">企業憑證金額：</span>
                  <span class="value">{{ formatMoney(props.row.voucherAmount) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">差異金額：</span>
                  <span class="value" :class="getDifferenceClass(props.row.differenceAmount)">
                    {{ formatMoney(props.row.differenceAmount) }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="label">對賬說明：</span>
                  <span class="value">{{ props.row.remark || '無' }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="recordNo" label="對賬編號" width="180" fixed>
          <template #default="scope">
            <span class="link-text">{{ scope.row.recordNo }}</span>
            <el-tag v-if="scope.row.isNew" type="danger" size="small" class="ml-2">新</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="planName" label="計劃名稱" min-width="150" show-overflow-tooltip />
        <el-table-column prop="contributionPeriod" label="供款期間" width="160" />
        <el-table-column prop="reconcileDate" label="對賬日期" width="120" />
        <el-table-column prop="totalAmount" label="對賬金額" width="120" align="right">
          <template #default="scope">
            <span class="amount-text">{{ formatMoney(scope.row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="matchRate" label="匹配率" width="120" align="center">
          <template #default="scope">
            <div class="match-rate-display">
              <el-progress 
                :percentage="scope.row.matchRate" 
                :color="getMatchRateColor(scope.row.matchRate)"
                :stroke-width="6"
                :show-text="false"
              />
              <span class="match-rate-text">{{ scope.row.matchRate }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="狀態" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              link 
              size="small" 
              @click="viewReport(scope.row)"
            >
              查看報告
            </el-button>
            <el-button 
              type="success" 
              link 
              size="small" 
              @click="downloadReport(scope.row)"
            >
              下載
            </el-button>
            <el-button 
              v-if="scope.row.status === 'difference'"
              type="warning" 
              link 
              size="small" 
              @click="handleDifference(scope.row)"
            >
              處理差異
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        class="mt-4"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 差异处理对话框 -->
    <el-dialog
      v-model="differenceDialogVisible"
      title="差異處理"
      width="600px"
      destroy-on-close
    >
      <div v-if="selectedRecord" class="difference-detail">
        <el-alert
          title="對賬差異說明"
          type="warning"
          :closable="false"
          show-icon
          class="mb-4"
        >
          <div class="alert-content">
            <p>對賬編號：{{ selectedRecord.recordNo }}</p>
            <p>差異金額：<span class="amount-warning">{{ formatMoney(selectedRecord.differenceAmount) }}</span></p>
            <p>匹配率：{{ selectedRecord.matchRate }}%</p>
          </div>
        </el-alert>
        
        <el-form :model="differenceForm" label-width="100px">
          <el-form-item label="處理方式">
            <el-radio-group v-model="differenceForm.handleType">
              <el-radio value="accept">接受差異</el-radio>
              <el-radio value="adjust">申請調整</el-radio>
              <el-radio value="query">提出異議</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="處理說明" required>
            <el-input
              v-model="differenceForm.remark"
              type="textarea"
              :rows="4"
              placeholder="請輸入處理說明..."
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
          <el-form-item label="附件" v-if="differenceForm.handleType !== 'accept'">
            <el-upload
              class="upload-demo"
              action="#"
              :on-change="handleFileChange"
              :file-list="fileList"
              :auto-upload="false"
              :limit="3"
            >
              <el-button type="primary">選擇文件</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  支持上傳相關證明文件，最多3個文件
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="differenceDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="submitDifferenceHandle"
          :loading="submitLoading"
        >
          確認提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(68)
const newCount = ref(1)
const differenceDialogVisible = ref(false)
const selectedRecord = ref(null)
const submitLoading = ref(false)

// 搜索表单
const searchForm = reactive({
  recordNo: '',
  planNo: '',
  dateRange: [],
  status: ''
})

// 差异处理表单
const differenceForm = reactive({
  handleType: 'accept',
  remark: ''
})

const fileList = ref([])

// 计划列表
const planList = ref([
  { value: 'JHBH8422', label: '央積金A計劃' },
  { value: 'JHBH8423', label: '央積金B計劃' },
  { value: 'JHBH8424', label: '央積金企業計劃' },
  { value: 'JHBH8425', label: '央積金集團計劃' }
])

// 对账记录数据
const recordList = ref([
  {
    id: 1,
    recordNo: 'REC-2025030001',
    planName: '央積金A計劃',
    contributionPeriod: '2025/02/25 - 2025/03/25',
    reconcileDate: '2025-03-01',
    totalAmount: 128498.50,
    systemAmount: 128500.00,
    voucherAmount: 128498.50,
    differenceAmount: -1.50,
    matchRate: 95.2,
    status: 'completed',
    isNew: true,
    remark: '差異金額在容差範圍內，已接受'
  },
  {
    id: 2,
    recordNo: 'REC-2025020015',
    planName: '央積金B計劃',
    contributionPeriod: '2025/01/25 - 2025/02/25',
    reconcileDate: '2025-02-15',
    totalAmount: 95280.00,
    systemAmount: 95280.00,
    voucherAmount: 95280.00,
    differenceAmount: 0,
    matchRate: 100,
    status: 'completed',
    remark: '完全匹配'
  },
  {
    id: 3,
    recordNo: 'REC-2025020012',
    planName: '央積金A計劃',
    contributionPeriod: '2025/01/25 - 2025/02/25',
    reconcileDate: '2025-02-12',
    totalAmount: 125800.00,
    systemAmount: 126500.00,
    voucherAmount: 125800.00,
    differenceAmount: -700.00,
    matchRate: 88.5,
    status: 'difference',
    remark: '存在較大差異，需要處理'
  }
])

// 计算属性
const totalRecords = computed(() => recordList.value.length)
const perfectMatchCount = computed(() => recordList.value.filter(r => r.matchRate === 100).length)
const differenceCount = computed(() => recordList.value.filter(r => r.status === 'difference').length)
const averageMatchRate = computed(() => {
  const total = recordList.value.reduce((sum, r) => sum + r.matchRate, 0)
  return (total / recordList.value.length).toFixed(1)
})

// 格式化金额
const formatMoney = (amount) => {
  return amount ? `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '¥0.00'
}

// 获取差异金额样式
const getDifferenceClass = (amount) => {
  if (amount === 0) return 'text-green'
  if (Math.abs(amount) < 10) return 'text-orange'
  return 'text-red'
}

// 获取匹配率颜色
const getMatchRateColor = (rate) => {
  if (rate >= 95) return '#52C41A'
  if (rate >= 90) return '#F39800'
  return '#FF4D4F'
}

// 获取状态类型
const getStatusType = (status) => {
  const typeMap = {
    'completed': 'success',
    'difference': 'warning',
    'pending': 'info'
  }
  return typeMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const textMap = {
    'completed': '已完成',
    'difference': '有差異',
    'pending': '待確認'
  }
  return textMap[status] || status
}

// 搜索相关
const handleSearch = () => {
  loading.value = true
  console.log('搜索条件:', searchForm)
  // 模拟搜索
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查詢完成')
  }, 1000)
}

const resetSearch = () => {
  searchForm.recordNo = ''
  searchForm.planNo = ''
  searchForm.dateRange = []
  searchForm.status = ''
}

// 导出记录
const exportRecords = () => {
  ElMessageBox.confirm(
    '確認導出對賬記錄嗎？',
    '導出確認',
    {
      confirmButtonText: '確認',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    ElMessage.success('正在導出對賬記錄...')
    // 实际导出逻辑
  })
}

// 刷新记录
const refreshRecords = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    newCount.value = 0
    ElMessage.success('記錄已刷新')
  }, 1000)
}

// 查看报告
const viewReport = (row) => {
  router.push({
    path: '/central-fund/reconciliation-report',
    query: { recordNo: row.recordNo }
  })
}

// 下载报告
const downloadReport = (row) => {
  ElMessage.success(`正在下載對賬報告 ${row.recordNo}...`)
  // 实际下载逻辑
}

// 处理差异
const handleDifference = (row) => {
  selectedRecord.value = row
  differenceForm.handleType = 'accept'
  differenceForm.remark = ''
  fileList.value = []
  differenceDialogVisible.value = true
}

// 提交差异处理
const submitDifferenceHandle = () => {
  if (!differenceForm.remark.trim()) {
    ElMessage.error('請填寫處理說明')
    return
  }
  
  submitLoading.value = true
  
  setTimeout(() => {
    submitLoading.value = false
    differenceDialogVisible.value = false
    
    // 更新记录状态
    const record = recordList.value.find(r => r.id === selectedRecord.value.id)
    if (record) {
      record.status = 'completed'
      record.remark = `${differenceForm.handleType === 'accept' ? '已接受差異' : '已提交處理'}: ${differenceForm.remark}`
    }
    
    ElMessage.success('差異處理提交成功')
  }, 1500)
}

// 文件处理
const handleFileChange = (file, fileList) => {
  console.log('文件变更:', file, fileList)
}

// 行点击
const handleRowClick = (row) => {
  console.log('点击行:', row)
}

// 分页
const handleSizeChange = (val) => {
  console.log(`每页 ${val} 条`)
}

const handleCurrentChange = (val) => {
  console.log(`当前页: ${val}`)
}

// 初始化
onMounted(() => {
  console.log('对账记录查询页面初始化')
})
</script>

<style scoped>
.reconciliation-records-management {
  /* 基础布局样式由全局样式处理 */
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

.badge-new {
  margin-right: 8px;
}

.search-form {
  margin-bottom: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e5e7eb;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-card.success {
  border-left: 4px solid #52C41A;
}

.stat-card.warning {
  border-left: 4px solid #F39800;
}

.stat-card.primary {
  border-left: 4px solid #2C8976;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.link-text {
  color: #2C8976;
  cursor: pointer;
}

.link-text:hover {
  text-decoration: underline;
}

.amount-text {
  color: #2C8976;
  font-weight: 500;
}

.match-rate-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.match-rate-text {
  font-size: 12px;
  font-weight: 500;
  color: #606266;
}

.expand-content {
  padding: 16px 32px;
  background-color: #f5f7fa;
}

.expand-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-item .label {
  color: #666;
  font-weight: 500;
}

.info-item .value {
  color: #333;
}

.text-green {
  color: #52C41A;
}

.text-orange {
  color: #F39800;
}

.text-red {
  color: #FF4D4F;
}

.difference-detail {
  margin-bottom: 20px;
}

.alert-content p {
  margin: 4px 0;
  font-size: 14px;
}

.amount-warning {
  color: #F39800;
  font-weight: bold;
  font-size: 16px;
}

.upload-demo {
  width: 100%;
}

:deep(.el-progress) {
  flex: 1;
}

:deep(.el-table__row) {
  cursor: pointer;
}

:deep(.el-table__expanded-cell) {
  padding: 0;
}
</style>