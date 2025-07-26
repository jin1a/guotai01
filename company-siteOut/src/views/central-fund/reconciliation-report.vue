<template>
  <div class="reconciliation-report-view">
    <!-- 报告头部 -->
    <div class="report-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="report-title">供款對賬報告</h1>
          <div class="report-info">
            <span class="info-item">報告編號：{{ reportData.recordNo }}</span>
            <span class="info-item">生成時間：{{ reportData.generateTime }}</span>
          </div>
        </div>
        <div class="header-actions">
          <el-button type="primary" plain @click="printReport">
            <el-icon><Printer /></el-icon>
            列印報告
          </el-button>
          <el-button type="success" @click="downloadReport">
            <el-icon><Download /></el-icon>
            下載PDF
          </el-button>
          <el-button @click="goBack">
            返回列表
          </el-button>
        </div>
      </div>
    </div>

    <!-- 报告内容 -->
    <div class="report-content">
      <!-- 基本信息 -->
      <el-card class="info-card">
        <template #header>
          <div class="card-header">
            <span>對賬基本信息</span>
            <el-tag :type="getStatusType(reportData.status)" size="large">
              {{ getStatusText(reportData.status) }}
            </el-tag>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="企業名稱">{{ reportData.companyName }}</el-descriptions-item>
          <el-descriptions-item label="計劃編號">{{ reportData.planNo }}</el-descriptions-item>
          <el-descriptions-item label="計劃名稱">{{ reportData.planName }}</el-descriptions-item>
          <el-descriptions-item label="供款期間">{{ reportData.contributionPeriod }}</el-descriptions-item>
          <el-descriptions-item label="通知書編號">{{ reportData.noticeNo }}</el-descriptions-item>
          <el-descriptions-item label="企業憑證編號">{{ reportData.voucherNo }}</el-descriptions-item>
          <el-descriptions-item label="實際繳款日期">{{ reportData.paymentDate }}</el-descriptions-item>
          <el-descriptions-item label="對賬執行時間">{{ reportData.reconcileTime }}</el-descriptions-item>
          <el-descriptions-item label="對賬執行人">{{ reportData.operator }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 对账结果概览 -->
      <el-card class="result-card">
        <template #header>
          <span>對賬結果概覽</span>
        </template>
        <div class="result-overview">
          <div class="result-item">
            <div class="result-chart">
              <el-progress 
                type="circle" 
                :percentage="reportData.matchRate" 
                :color="getProgressColor(reportData.matchRate)"
                :width="120"
              >
                <template #default="{ percentage }">
                  <span class="percentage-value">{{ percentage }}%</span>
                  <span class="percentage-label">匹配率</span>
                </template>
              </el-progress>
            </div>
            <div class="result-label">總體匹配率</div>
          </div>
          <div class="result-item">
            <div class="result-number success">{{ reportData.matchedCount }}</div>
            <div class="result-label">完全匹配記錄</div>
            <div class="result-sub">佔 {{ reportData.matchedPercent }}%</div>
          </div>
          <div class="result-item">
            <div class="result-number warning">{{ reportData.differenceCount }}</div>
            <div class="result-label">金額差異記錄</div>
            <div class="result-sub">佔 {{ reportData.differencePercent }}%</div>
          </div>
          <div class="result-item">
            <div class="result-number error">{{ reportData.unmatchedCount }}</div>
            <div class="result-label">未匹配記錄</div>
            <div class="result-sub">佔 {{ reportData.unmatchedPercent }}%</div>
          </div>
        </div>
      </el-card>

      <!-- 金额对比分析 -->
      <el-card class="amount-card">
        <template #header>
          <span>金額對比分析</span>
        </template>
        <el-table :data="amountComparisonData" style="width: 100%" show-summary>
          <el-table-column prop="item" label="項目" width="150" />
          <el-table-column prop="systemAmount" label="系統清單金額" align="right">
            <template #default="scope">
              <span class="amount-text">{{ formatMoney(scope.row.systemAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="voucherAmount" label="企業憑證金額" align="right">
            <template #default="scope">
              <span class="amount-text">{{ formatMoney(scope.row.voucherAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="difference" label="差異金額" align="right">
            <template #default="scope">
              <span :class="getDifferenceClass(scope.row.difference)">
                {{ formatDifference(scope.row.difference) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="differenceRate" label="差異率" align="center" width="100">
            <template #default="scope">
              <span :class="getDifferenceClass(scope.row.difference)">
                {{ scope.row.differenceRate }}%
              </span>
            </template>
          </el-table-column>
        </el-table>
        
        <el-alert
          v-if="reportData.conclusion"
          :title="reportData.conclusion.title"
          :type="reportData.conclusion.type"
          :description="reportData.conclusion.description"
          show-icon
          class="mt-4"
        />
      </el-card>

      <!-- 差异明细 -->
      <el-card v-if="differenceDetails.length > 0" class="difference-card">
        <template #header>
          <span>差異明細記錄</span>
        </template>
        <div class="difference-list">
          <div 
            v-for="(item, index) in differenceDetails" 
            :key="index"
            class="difference-item"
            :class="item.type"
          >
            <div class="item-header">
              <div class="item-title">
                <span class="employee-name">{{ item.employeeName }}</span>
                <span class="employee-no">({{ item.employeeNo }})</span>
                <el-tag :type="item.type" size="small" class="ml-2">
                  {{ item.typeText }}
                </el-tag>
              </div>
              <div class="item-amount">
                <span class="label">差異：</span>
                <span :class="getDifferenceClass(item.differenceAmount)">
                  {{ formatDifference(item.differenceAmount) }}
                </span>
              </div>
            </div>
            <div class="item-detail">
              <div class="detail-row">
                <span class="detail-label">職位：</span>{{ item.position }}
                <span class="mx-2">|</span>
                <span class="detail-label">部門：</span>{{ item.department }}
              </div>
              <div class="detail-row">
                <span class="detail-label">系統金額：</span>{{ formatMoney(item.systemAmount) }}
                <span class="mx-2">|</span>
                <span class="detail-label">憑證金額：</span>{{ formatMoney(item.voucherAmount) }}
              </div>
              <div class="detail-row">
                <span class="detail-label">可能原因：</span>
                <span class="text-orange-600">{{ item.possibleReason }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 审核信息 -->
      <el-card class="audit-card">
        <template #header>
          <span>審核信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="對賬執行方式">{{ reportData.executeType }}</el-descriptions-item>
          <el-descriptions-item label="審核人">{{ reportData.auditor }}</el-descriptions-item>
          <el-descriptions-item label="審核時間">{{ reportData.auditTime }}</el-descriptions-item>
          <el-descriptions-item label="審核結果">
            <el-tag :type="reportData.auditResult === 'passed' ? 'success' : 'warning'">
              {{ reportData.auditResult === 'passed' ? '審核通過' : '待處理' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="審核意見" :span="2">
            <div class="audit-opinion">
              {{ reportData.auditOpinion }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 操作区域 -->
      <div class="action-area">
        <div class="action-info">
          <span class="text-gray-600">報告有效期至：{{ reportData.validUntil }}</span>
        </div>
        <div class="action-buttons">
          <el-button type="success" @click="exportToExcel">
            導出Excel
          </el-button>
          <el-button 
            v-if="reportData.status === 'difference'" 
            type="warning"
            @click="handleDifference"
          >
            處理差異
          </el-button>
          <el-button 
            v-if="reportData.allowFeedback"
            type="primary"
            @click="submitFeedback"
          >
            提交反饋
          </el-button>
        </div>
      </div>
    </div>

    <!-- 反馈对话框 -->
    <el-dialog
      v-model="feedbackDialogVisible"
      title="提交反饋"
      width="500px"
      destroy-on-close
    >
      <el-form :model="feedbackForm" label-width="80px">
        <el-form-item label="反饋類型">
          <el-select v-model="feedbackForm.type" placeholder="請選擇反饋類型">
            <el-option label="數據錯誤" value="data_error" />
            <el-option label="金額異議" value="amount_dispute" />
            <el-option label="其他問題" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="反饋內容" required>
          <el-input
            v-model="feedbackForm.content"
            type="textarea"
            :rows="5"
            placeholder="請詳細描述您的反饋..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="feedbackDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmFeedback">確認提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { Printer, Download } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const feedbackDialogVisible = ref(false)

// 报告数据
const reportData = ref({
  recordNo: 'REC-2025030001',
  generateTime: '2025-03-01 15:45:00',
  status: 'completed',
  companyName: '澳門科技大學',
  planNo: 'JHBH8422',
  planName: '央積金A計劃',
  contributionPeriod: '2025/02/25 - 2025/03/25',
  noticeNo: 'CPF-NOTICE-2025030001',
  voucherNo: 'VOC-2025030012',
  paymentDate: '2025-03-10',
  reconcileTime: '2025-03-01 15:30',
  operator: '系統自動對賬',
  matchRate: 95.2,
  matchedCount: 18,
  matchedPercent: 85.7,
  differenceCount: 2,
  differencePercent: 9.5,
  unmatchedCount: 1,
  unmatchedPercent: 4.8,
  executeType: '系統自動對賬',
  auditor: '李主管',
  auditTime: '2025-03-01 15:42',
  auditResult: 'passed',
  auditOpinion: '差異金額在容差範圍內，對賬結果無誤。已確認接受此差異並完成對賬。',
  validUntil: '2025-04-01',
  allowFeedback: true,
  conclusion: {
    title: '結論',
    type: 'success',
    description: '總體差異率為 0.0012%，在可接受範圍內（容差：0.01%）。差異主要來自個別員工的供款金額計算誤差。'
  }
})

// 金额对比数据
const amountComparisonData = ref([
  {
    item: '雇主供款',
    systemAmount: 64250.00,
    voucherAmount: 64250.00,
    difference: 0,
    differenceRate: '0.00'
  },
  {
    item: '僱員供款',
    systemAmount: 64250.00,
    voucherAmount: 64248.50,
    difference: -1.50,
    differenceRate: '0.0023'
  }
])

// 差异明细
const differenceDetails = ref([
  {
    employeeName: '李四',
    employeeNo: 'EMP002',
    position: '主管',
    department: '人事部',
    systemAmount: 4500.00,
    voucherAmount: 4498.50,
    differenceAmount: -1.50,
    type: 'warning',
    typeText: '金額差異',
    possibleReason: '金額計算精度差異'
  },
  {
    employeeName: '王五',
    employeeNo: 'EMP003',
    position: '工程師',
    department: '技術部',
    systemAmount: 5000.00,
    voucherAmount: 0,
    differenceAmount: -5000.00,
    type: 'danger',
    typeText: '未匹配',
    possibleReason: '員工本月離職，企業未繳納供款'
  }
])

// 反馈表单
const feedbackForm = reactive({
  type: '',
  content: ''
})

// 格式化金额
const formatMoney = (amount) => {
  return amount ? `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '¥0.00'
}

// 格式化差异金额
const formatDifference = (amount) => {
  if (amount === 0) return '¥0.00'
  const sign = amount > 0 ? '+' : ''
  return `${sign}${formatMoney(amount)}`
}

// 获取差异样式
const getDifferenceClass = (amount) => {
  if (amount === 0) return 'text-green-600'
  if (Math.abs(amount) < 10) return 'text-orange-600'
  return 'text-red-600'
}

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage >= 95) return '#52C41A'
  if (percentage >= 90) return '#F39800'
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

// 操作功能
const printReport = () => {
  window.print()
}

const downloadReport = () => {
  ElMessage.success(`正在生成PDF報告...`)
  // 实际下载逻辑
}

const goBack = () => {
  router.push('/central-fund/reconciliation-records')
}

const exportToExcel = () => {
  ElMessage.success('正在導出Excel報告...')
  // 实际导出逻辑
}

const handleDifference = () => {
  router.push({
    path: '/central-fund/contribution-adjustment',
    query: { source: 'reconciliation', recordNo: reportData.value.recordNo }
  })
}

const submitFeedback = () => {
  feedbackForm.type = ''
  feedbackForm.content = ''
  feedbackDialogVisible.value = true
}

const confirmFeedback = () => {
  if (!feedbackForm.type || !feedbackForm.content.trim()) {
    ElMessage.error('請選擇反饋類型並填寫反饋內容')
    return
  }
  
  ElMessage.success('反饋提交成功，我們會盡快處理')
  feedbackDialogVisible.value = false
}

// 初始化
onMounted(() => {
  const recordNo = route.query.recordNo
  if (recordNo) {
    console.log('加载对账报告:', recordNo)
    // 根据编号加载具体报告数据
  }
})
</script>

<style scoped>
.reconciliation-report-view {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.report-header {
  background: linear-gradient(135deg, #2C8976 0%, #246B5C 100%);
  color: white;
  padding: 24px;
  margin-bottom: 20px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.report-title {
  font-size: 24px;
  margin-bottom: 8px;
}

.report-info {
  display: flex;
  gap: 24px;
  font-size: 14px;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.report-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 20px;
}

.info-card,
.result-card,
.amount-card,
.difference-card,
.audit-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  text-align: center;
}

.result-item {
  padding: 20px;
}

.result-chart {
  margin-bottom: 12px;
}

.percentage-value {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.percentage-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.result-number {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 8px;
}

.result-number.success {
  color: #52C41A;
}

.result-number.warning {
  color: #F39800;
}

.result-number.error {
  color: #FF4D4F;
}

.result-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.result-sub {
  font-size: 12px;
  color: #999;
}

.amount-text {
  color: #2C8976;
  font-weight: 500;
}

.difference-list {
  space-y: 12px;
}

.difference-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  background-color: #fafafa;
}

.difference-item.warning {
  border-left: 4px solid #F39800;
  background-color: #FFF7E6;
}

.difference-item.danger {
  border-left: 4px solid #FF4D4F;
  background-color: #FFF2F0;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.employee-name {
  font-weight: 500;
  color: #303133;
}

.employee-no {
  color: #666;
}

.item-amount {
  font-weight: 500;
}

.item-detail {
  font-size: 14px;
  color: #666;
}

.detail-row {
  margin-bottom: 4px;
}

.detail-label {
  color: #999;
}

.audit-opinion {
  background-color: #f0f9ff;
  padding: 12px;
  border-radius: 4px;
  color: #1890ff;
}

.action-area {
  margin-top: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

@media print {
  .report-header {
    background: #2C8976 !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  
  .header-actions,
  .action-area {
    display: none !important;
  }
  
  .report-content {
    max-width: 100%;
  }
}
</style>