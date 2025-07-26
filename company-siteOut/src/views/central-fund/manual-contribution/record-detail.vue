<template>
  <div class="manual-contribution-record-detail">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>央積金手動供款記錄詳情</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>
      
      <!-- 基本信息 -->
      <el-descriptions title="基本信息" :column="2" border class="mb-4">
        <el-descriptions-item label="清單編號">{{ recordDetail.listNo }}</el-descriptions-item>
        <el-descriptions-item label="計劃編號">{{ recordDetail.planNo }}</el-descriptions-item>
        <el-descriptions-item label="計劃名稱">{{ recordDetail.planName }}</el-descriptions-item>
        <!-- 移除供款類型 -->
        <el-descriptions-item label="供款期間">{{ recordDetail.period }}</el-descriptions-item>
        <el-descriptions-item label="供款總額">
          <span class="amount-text">¥{{ formatMoney(recordDetail.amount) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="繳費日期">{{ recordDetail.paymentDate || '待繳費' }}</el-descriptions-item>
        <el-descriptions-item label="結算日期">{{ recordDetail.settlementDate || '待結算' }}</el-descriptions-item>
        <el-descriptions-item label="狀態">
          <el-tag :type="getStatusType(recordDetail.status)">
            {{ recordDetail.statusText }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="創建時間">{{ recordDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="備註說明" :span="2">
          {{ recordDetail.remark || '無' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <!-- 供款明細 -->
      <div class="detail-section">
        <h3>供款明細</h3>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="員工人數">{{ recordDetail.employeeCount }} 人</el-descriptions-item>
          <el-descriptions-item label="雇主供款">¥{{ formatMoney(recordDetail.employerAmount) }}</el-descriptions-item>
          <el-descriptions-item label="僱員供款">¥{{ formatMoney(recordDetail.employeeAmount) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 上傳附件 -->
      <div class="detail-section">
        <h3>上傳附件</h3>
        <div v-if="recordDetail.attachments && recordDetail.attachments.length > 0">
          <el-table :data="recordDetail.attachments" style="width: 100%">
            <el-table-column prop="fileName" label="文件名稱" width="300">
              <template #default="scope">
                <div class="file-name">
                  <el-icon :size="20" class="file-icon">
                    <Document v-if="scope.row.fileType === 'excel'" />
                    <Picture v-else-if="scope.row.fileType === 'image'" />
                    <Document v-else />
                  </el-icon>
                  <span>{{ scope.row.fileName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="fileType" label="文件類型" width="120">
              <template #default="scope">
                <el-tag size="small">{{ getFileTypeText(scope.row.fileType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="fileSize" label="文件大小" width="120" />
            <el-table-column prop="uploadTime" label="上傳時間" width="180" />
            <el-table-column prop="uploader" label="上傳人" width="120" />
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button type="primary" link size="small" @click="showPreviewFile(scope.row)">
                  預覽
                </el-button>
                <el-button type="success" link size="small" @click="downloadFile(scope.row)">
                  下載
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-empty v-else description="暫無附件" />
      </div>
      
      <!-- 繳費信息 -->
      <div class="detail-section" v-if="recordDetail.paymentInfo">
        <h3>繳費信息</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="實際繳費日期">{{ recordDetail.paymentInfo.paymentDate }}</el-descriptions-item>
          <el-descriptions-item label="實際繳費金額">¥{{ formatMoney(recordDetail.paymentInfo.actualAmount) }}</el-descriptions-item>
          <el-descriptions-item label="繳費方式">{{ recordDetail.paymentInfo.paymentMethod }}</el-descriptions-item>
          <el-descriptions-item label="交易流水號">{{ recordDetail.paymentInfo.transactionNo }}</el-descriptions-item>
          <el-descriptions-item label="支票號碼" v-if="recordDetail.paymentInfo.checkNumber">
            {{ recordDetail.paymentInfo.checkNumber }}
          </el-descriptions-item>
          <el-descriptions-item label="繳費憑證">
            <el-button type="text" @click="viewPaymentVoucher">查看繳費憑證</el-button>
          </el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 審核記錄 -->
      <div class="detail-section">
        <h3>審核記錄</h3>
        <el-timeline>
          <el-timeline-item 
            v-for="(item, index) in recordDetail.auditHistory" 
            :key="index"
            :timestamp="item.time"
            :color="item.color"
          >
            <div class="audit-content">
              <div class="audit-title">{{ item.action }}</div>
              <div class="audit-operator">操作人：{{ item.operator }}</div>
              <div v-if="item.comment" class="audit-comment">
                審核意見：{{ item.comment }}
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
      
      <!-- 操作按鈕 -->
      <div class="action-buttons">
        <el-button v-if="recordDetail.status === 'pending_upload'" type="primary" @click="uploadVoucher">
          上傳憑證
        </el-button>
        <el-button v-if="recordDetail.status === 'rejected'" type="warning" @click="reupload">
          重新上傳
        </el-button>
        <el-button type="success" @click="downloadAll">
          下載所有附件
        </el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
    </el-card>
    
    <!-- 文件預覽對話框 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="previewFile?.fileName"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="file-preview">
        <iframe 
          v-if="previewFile?.fileType === 'pdf'"
          :src="previewFile.url" 
          width="100%" 
          height="600px"
          frameborder="0"
        ></iframe>
        <img 
          v-else-if="previewFile?.fileType === 'image'"
          :src="previewFile.url" 
          style="max-width: 100%;"
        />
        <div v-else class="preview-unsupported">
          <el-empty description="此文件類型不支持預覽，請下載查看" />
        </div>
      </div>
      <template #footer>
        <el-button @click="previewDialogVisible = false">關閉</el-button>
        <el-button type="primary" @click="downloadFile(previewFile)">下載</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document, Picture } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

// 響應式數據
const recordDetail = ref({
  listNo: 'MAN-202503001',
  planNo: 'CPF-PLAN-001',
  planName: '央積金計劃A',
  period: '2025年3月',
  amount: 125000,
  employerAmount: 62500,
  employeeAmount: 62500,
  employeeCount: 50,
  paymentDate: '2025-03-15',
  settlementDate: '2025-03-18',
  status: 'completed',
  statusText: '已完成',
  createTime: '2025-03-12 14:30',
  remark: '2025年3月份供款',
  attachments: [
    {
      id: 1,
      fileName: '供款清單_202503.xlsx',
      fileType: 'excel',
      fileSize: '56.8 KB',
      uploadTime: '2025-03-12 14:35',
      uploader: '營運操作員A',
      url: '/files/contribution-list-202503.xlsx'
    },
    {
      id: 2,
      fileName: '支票憑證_CHK202503150088.jpg',
      fileType: 'image',
      fileSize: '1.2 MB',
      uploadTime: '2025-03-15 10:20',
      uploader: '財務部-張會計',
      url: '/files/check-voucher-202503.jpg'
    },
    {
      id: 3,
      fileName: '銀行轉賬回單.pdf',
      fileType: 'pdf',
      fileSize: '245 KB',
      uploadTime: '2025-03-15 10:22',
      uploader: '財務部-張會計',
      url: '/files/bank-receipt-202503.pdf'
    }
  ],
  paymentInfo: {
    paymentDate: '2025-03-15',
    actualAmount: 34000,
    paymentMethod: '支票',
    transactionNo: 'TRF202503150012',
    checkNumber: 'CHK202503150088'
  },
  auditHistory: [
    { 
      time: '2025-03-12 14:30', 
      action: '創建手動供款清單', 
      operator: '營運操作員A', 
      color: 'primary' 
    },
    { 
      time: '2025-03-12 14:35', 
      action: '上傳供款清單', 
      operator: '營運操作員A', 
      color: 'success' 
    },
    { 
      time: '2025-03-15 10:20', 
      action: '上傳支付憑證', 
      operator: '財務部-張會計', 
      color: 'success' 
    },
    { 
      time: '2025-03-15 15:30', 
      action: '審核通過', 
      operator: '營運主管B', 
      comment: '憑證齊全，金額正確', 
      color: 'success' 
    },
    { 
      time: '2025-03-18 09:00', 
      action: '結算完成', 
      operator: '系統自動', 
      color: 'primary' 
    }
  ]
})

const previewDialogVisible = ref(false)
const previewFile = ref(null)

// 格式化金額
const formatMoney = (amount) => {
  return amount ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// 獲取狀態類型
const getStatusType = (status) => {
  const typeMap = {
    'pending_upload': 'warning',
    'reviewing': 'primary',
    'approved': 'success',
    'rejected': 'danger',
    'completed': 'success'
  }
  return typeMap[status] || 'info'
}

// 獲取文件類型文本
const getFileTypeText = (fileType) => {
  const typeMap = {
    'excel': 'Excel文件',
    'image': '圖片文件',
    'pdf': 'PDF文件',
    'word': 'Word文件'
  }
  return typeMap[fileType] || '其他'
}

// 返回列表
const goBack = () => {
  router.push('/central-fund/manual-contribution/contribution-records')
}

// 上傳憑證
const uploadVoucher = () => {
  router.push({
    path: '/central-fund/manual-contribution/upload',
    query: { listNo: recordDetail.value.listNo }
  })
}

// 重新上傳
const reupload = () => {
  router.push({
    path: '/central-fund/manual-contribution/upload',
    query: { listNo: recordDetail.value.listNo, reupload: true }
  })
}

// 預覽文件
const showPreviewFile = (file) => {
  previewFile.value = file
  previewDialogVisible.value = true
}

// 下載文件
const downloadFile = (file) => {
  ElMessage.success(`正在下載：${file.fileName}`)
  // 實際項目中調用下載API
  // window.open(file.url, '_blank')
}

// 下載所有附件
const downloadAll = () => {
  ElMessage.success('正在打包下載所有附件...')
  // 實際項目中調用批量下載API
}

// 查看繳費憑證
const viewPaymentVoucher = () => {
  const voucherFile = recordDetail.value.attachments.find(f => f.fileName.includes('支票'))
  if (voucherFile) {
    showPreviewFile(voucherFile)
  }
}

// 初始化
onMounted(() => {
  const { id } = route.params
  const { listNo } = route.query
  
  console.log('加載手動供款記錄詳情:', { id, listNo })
  
  // 根據ID或清單編號加載詳情數據
  if (listNo) {
    recordDetail.value.listNo = listNo
  }
})
</script>

<style scoped>
.manual-contribution-record-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-section {
  margin-top: 30px;
}

.detail-section h3 {
  margin-bottom: 16px;
  color: #303133;
  border-bottom: 2px solid #2C8976;
  padding-bottom: 8px;
}

.amount-text {
  font-size: 18px;
  font-weight: bold;
  color: #2C8976;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon {
  color: #909399;
}

.audit-content {
  padding: 8px 0;
}

.audit-title {
  font-weight: 500;
  margin-bottom: 4px;
}

.audit-operator {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.audit-comment {
  font-size: 14px;
  color: #999;
  background: #f5f5f5;
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 8px;
}

.action-buttons {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  text-align: center;
}

.file-preview {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-unsupported {
  text-align: center;
  padding: 40px;
}

.mb-4 {
  margin-bottom: 16px;
}

:deep(.el-timeline-item__wrapper) {
  padding-left: 28px;
}
</style>