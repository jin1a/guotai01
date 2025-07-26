<template>
  <div class="submit-voucher-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>私退金提交供款憑證</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleBatchUpload">
              批量上傳
            </el-button>
            <el-button type="success" @click="handleQuickUpload">
              快速上傳
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="計劃編號">
          <el-input v-model="searchForm.planNo" placeholder="請輸入計劃編號" clearable />
        </el-form-item>
        <el-form-item label="計劃名稱">
          <el-input v-model="searchForm.planName" placeholder="請輸入計劃名稱" clearable />
        </el-form-item>
        <el-form-item label="供款期間">
          <el-date-picker
            v-model="searchForm.contributionPeriod"
            type="monthrange"
            range-separator="至"
            start-placeholder="開始月份"
            end-placeholder="結束月份"
            format="YYYY/MM"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item label="憑證狀態">
          <el-select v-model="searchForm.status" placeholder="請選擇狀態" clearable>
            <el-option label="全部" value="" />
            <el-option label="待上傳" value="pending" />
            <el-option label="已上傳" value="uploaded" />
            <el-option label="審核中" value="reviewing" />
            <el-option label="審核通過" value="approved" />
            <el-option label="審核退回" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 供款憑證列表 -->
      <el-table 
        :data="voucherList" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        row-key="voucherNo"
      >
        <el-table-column 
          type="selection" 
          width="55"
          :selectable="(row) => row.status === 'pending'"
        />
        <el-table-column prop="voucherNo" label="憑證編號" width="180" sortable />
        <el-table-column prop="noticeNo" label="通知書編號" width="180" />
        <el-table-column prop="planNo" label="計劃編號" width="120" />
        <el-table-column prop="planName" label="計劃名稱" min-width="150" show-overflow-tooltip />
        <el-table-column prop="contributionPeriod" label="供款期間" width="140" />
        <el-table-column prop="totalAmount" label="繳費金額" width="120" align="right">
          <template #default="scope">
            <span class="amount-text">{{ formatMoney(scope.row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentDate" label="繳費日期" width="120" />
        <el-table-column prop="uploadDate" label="上傳日期" width="120" />
        <el-table-column prop="fileCount" label="文件數量" width="100" align="center">
          <template #default="scope">
            <span v-if="scope.row.fileCount > 0" class="file-count">{{ scope.row.fileCount }}件</span>
            <span v-else class="no-files">未上傳</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="狀態" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="viewDetail(scope.row)">
              查看詳情
            </el-button>
            <el-button 
              v-if="scope.row.status === 'pending'"
              type="success" 
              link 
              @click="uploadVoucherFiles(scope.row)"
            >
              上傳憑證
            </el-button>
            <el-button 
              v-if="scope.row.status === 'uploaded' || scope.row.status === 'rejected'"
              type="warning" 
              link 
              @click="editVoucher(scope.row)"
            >
              編輯
            </el-button>
            <el-button 
              v-if="scope.row.fileCount > 0"
              type="info" 
              link 
              @click="downloadVoucher(scope.row)"
            >
              下載
            </el-button>
            <el-button 
              v-if="scope.row.status === 'approved'"
              type="primary" 
              link 
              @click="viewReceipt(scope.row)"
            >
              查看收據
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

    <!-- 上傳憑證對話框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      :title="dialogTitle"
      width="800px"
      destroy-on-close
    >
      <div v-if="selectedVoucher" class="voucher-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="通知書編號">{{ selectedVoucher.noticeNo }}</el-descriptions-item>
          <el-descriptions-item label="計劃編號">{{ selectedVoucher.planNo }}</el-descriptions-item>
          <el-descriptions-item label="計劃名稱">{{ selectedVoucher.planName }}</el-descriptions-item>
          <el-descriptions-item label="供款期間">{{ selectedVoucher.contributionPeriod }}</el-descriptions-item>
          <el-descriptions-item label="應繳金額">{{ formatMoney(selectedVoucher.totalAmount) }}</el-descriptions-item>
          <el-descriptions-item label="繳費截止日期">{{ selectedVoucher.dueDate }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <el-form 
        ref="uploadFormRef" 
        :model="uploadForm" 
        :rules="uploadRules" 
        label-width="120px" 
        class="upload-form"
      >
        <el-form-item label="實際繳費金額" prop="actualAmount">
          <el-input-number
            v-model="uploadForm.actualAmount"
            :min="0"
            :precision="2"
            :step="100"
            style="width: 100%"
            placeholder="請輸入實際繳費金額"
          />
        </el-form-item>
        <el-form-item label="繳費日期" prop="paymentDate">
          <el-date-picker
            v-model="uploadForm.paymentDate"
            type="date"
            placeholder="選擇繳費日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="繳費方式" prop="paymentMethod">
          <el-select v-model="uploadForm.paymentMethod" placeholder="請選擇繳費方式" style="width: 100%">
            <el-option label="銀行轉帳" value="bank_transfer" />
            <el-option label="支票" value="check" />
            <el-option label="現金" value="cash" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="憑證文件" prop="files">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :file-list="uploadForm.fileList"
            accept=".pdf,.jpg,.jpeg,.png,.xlsx,.xls"
            multiple
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              將文件拖到此處，或<em>點擊上傳</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 PDF、圖片、Excel 文件，單文件不超過 20MB，可上傳多個文件
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="備註">
          <el-input
            v-model="uploadForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="請輸入相關備註資訊"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmUpload" :loading="uploadLoading">
          {{ uploadLoading ? '上傳中...' : '確認上傳' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 憑證詳情對話框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="供款憑證詳情"
      width="900px"
      destroy-on-close
    >
      <div v-if="selectedVoucher" class="voucher-detail">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="憑證基本資訊" name="basic">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="憑證編號">{{ selectedVoucher.voucherNo }}</el-descriptions-item>
              <el-descriptions-item label="通知書編號">{{ selectedVoucher.noticeNo }}</el-descriptions-item>
              <el-descriptions-item label="計劃編號">{{ selectedVoucher.planNo }}</el-descriptions-item>
              <el-descriptions-item label="計劃名稱">{{ selectedVoucher.planName }}</el-descriptions-item>
              <el-descriptions-item label="供款期間">{{ selectedVoucher.contributionPeriod }}</el-descriptions-item>
              <el-descriptions-item label="應繳金額">{{ formatMoney(selectedVoucher.totalAmount) }}</el-descriptions-item>
              <el-descriptions-item label="實繳金額">{{ formatMoney(selectedVoucher.actualAmount || 0) }}</el-descriptions-item>
              <el-descriptions-item label="繳費日期">{{ selectedVoucher.paymentDate || '未填寫' }}</el-descriptions-item>
              <el-descriptions-item label="上傳日期">{{ selectedVoucher.uploadDate || '未上傳' }}</el-descriptions-item>
              <el-descriptions-item label="狀態">
                <el-tag :type="getStatusType(selectedVoucher.status)" size="large">
                  {{ getStatusText(selectedVoucher.status) }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          <el-tab-pane label="上傳文件" name="files">
            <div v-if="selectedVoucher.files && selectedVoucher.files.length > 0" class="file-list">
              <div v-for="file in selectedVoucher.files" :key="file.name" class="file-item">
                <el-icon class="file-icon"><document /></el-icon>
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <div class="file-actions">
                  <el-button type="primary" link @click="previewFile(file)">預覽</el-button>
                  <el-button type="info" link @click="downloadFile(file)">下載</el-button>
                </div>
              </div>
            </div>
            <el-empty v-else description="尚未上傳任何文件" />
          </el-tab-pane>
          <el-tab-pane label="審核記錄" name="audit">
            <div v-if="selectedVoucher.auditRecords && selectedVoucher.auditRecords.length > 0" class="audit-list">
              <div v-for="record in selectedVoucher.auditRecords" :key="record.id" class="audit-item">
                <div class="audit-header">
                  <span class="audit-action">{{ record.action }}</span>
                  <span class="audit-time">{{ record.time }}</span>
                </div>
                <div class="audit-user">操作人：{{ record.user }}</div>
                <div v-if="record.remarks" class="audit-remarks">備註：{{ record.remarks }}</div>
              </div>
            </div>
            <el-empty v-else description="無審核記錄" />
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">關閉</el-button>
        <el-button 
          v-if="selectedVoucher && selectedVoucher.status === 'pending'"
          type="success" 
          @click="uploadVoucherFiles(selectedVoucher)"
        >
          上傳憑證
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Document } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 搜索表单
const searchForm = reactive({
  planNo: '',
  planName: '',
  contributionPeriod: [],
  status: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(15)

// 对话框相关
const uploadDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const selectedVoucher = ref(null)
const selectedVouchers = ref([])
const activeTab = ref('basic')
const uploadLoading = ref(false)

// 上传表单
const uploadFormRef = ref(null)
const uploadForm = reactive({
  actualAmount: null,
  paymentDate: '',
  paymentMethod: '',
  fileList: [],
  remarks: ''
})

// 表单验证规则
const uploadRules = {
  actualAmount: [{ required: true, message: '請輸入實際繳費金額', trigger: 'blur' }],
  paymentDate: [{ required: true, message: '請選擇繳費日期', trigger: 'change' }],
  paymentMethod: [{ required: true, message: '請選擇繳費方式', trigger: 'change' }],
  files: [{ required: true, message: '請上傳憑證文件', trigger: 'change' }]
}

// 模括数据 - 与营运端数据对应
const voucherList = ref([
  {
    voucherNo: 'PF-VOUCHER-2025030001',
    noticeNo: 'PF-NOTICE-2025030001',
    planNo: 'PFJH8422',
    planName: '私退金A計劃',
    contributionPeriod: '2025/02/25 - 2025/03/25',
    totalAmount: 128500.00,
    actualAmount: 128500.00,
    paymentDate: '2025-03-05',
    uploadDate: '2025-03-05 14:30',
    fileCount: 3,
    status: 'uploaded',
    dueDate: '2025-03-15',
    paymentMethod: 'bank_transfer',
    files: [
      { name: '供款銀行轉帳憑證.pdf', size: 1024000 },
      { name: '供款明細清單.xlsx', size: 512000 },
      { name: '銀行到帳通知書.pdf', size: 768000 }
    ],
    auditRecords: [
      { id: 1, action: '企業端提交憑證', user: '澳門科技大學-財務部', time: '2025-03-05 14:30', remarks: '提交了供款憑證和相關文件' }
    ]
  },
  {
    voucherNo: 'PF-VOUCHER-2025030002', 
    noticeNo: 'PF-NOTICE-2025030002',
    planNo: 'PFJH8423',
    planName: '私退金B計劃',
    contributionPeriod: '2025/01/25 - 2025/02/25',
    totalAmount: 95280.00,
    actualAmount: 95280.00,
    paymentDate: '2025-02-10',
    uploadDate: '2025-02-10 09:15',
    fileCount: 2,
    status: 'reviewing',
    dueDate: '2025-02-15',
    paymentMethod: 'bank_transfer',
    files: [
      { name: '銀行轉帳憑證.pdf', size: 896000 },
      { name: '供款清單.xlsx', size: 445000 }
    ],
    auditRecords: [
      { id: 1, action: '企業端提交憑證', user: '澳門大學-人事部', time: '2025-02-10 09:15', remarks: '' },
      { id: 2, action: '營運中心開始審核', user: '張主管', time: '2025-02-10 10:00', remarks: '正在進行憑證審核和財務對帳' }
    ]
  },
  {
    voucherNo: 'PF-VOUCHER-2025030003',
    noticeNo: 'PF-NOTICE-2025030003', 
    planNo: 'PFJH8424',
    planName: '私退金企業計劃',
    contributionPeriod: '2024/12/25 - 2025/01/25',
    totalAmount: 256750.00,
    actualAmount: null,
    paymentDate: '',
    uploadDate: '',
    fileCount: 0,
    status: 'pending',
    dueDate: '2025-01-15',
    paymentMethod: '',
    files: [],
    auditRecords: []
  },
  {
    voucherNo: 'PF-VOUCHER-2025030004',
    noticeNo: 'PF-NOTICE-2025030004',
    planNo: 'PFJH8425',
    planName: '私退金集團計劃',
    contributionPeriod: '2024/11/25 - 2024/12/25',
    totalAmount: 445920.00,
    actualAmount: 445920.00,
    paymentDate: '2024-12-10',
    uploadDate: '2024-12-10 16:45',
    fileCount: 4,
    status: 'approved',
    dueDate: '2024-12-15',
    paymentMethod: 'bank_transfer',
    files: [
      { name: '供款銀行轉帳憑證.pdf', size: 1536000 },
      { name: '供款明細清單.xlsx', size: 724000 },
      { name: '銀行到帳通知書.pdf', size: 892000 },
      { name: '集團供款註明.pdf', size: 445000 }
    ],
    auditRecords: [
      { id: 1, action: '企業端提交憑證', user: '永利渡假村-財務部', time: '2024-12-10 16:45', remarks: '' },
      { id: 2, action: '營運中心開始審核', user: '王審核員', time: '2024-12-11 09:30', remarks: '' },
      { id: 3, action: '審核通過', user: '王審核員', time: '2024-12-11 14:20', remarks: '憑證完整，金額一致，審核通過' }
    ]
  },
  {
    voucherNo: 'PF-VOUCHER-2025030005',
    noticeNo: 'PF-NOTICE-2025030005',
    planNo: 'PFJH8426',
    planName: '私退金標準計劃',
    contributionPeriod: '2024/10/25 - 2024/11/25',
    totalAmount: 378640.00,
    actualAmount: 375000.00,
    paymentDate: '2024-11-08',
    uploadDate: '2024-11-08 11:20',
    fileCount: 2,
    status: 'rejected',
    dueDate: '2024-11-15',
    paymentMethod: 'bank_transfer',
    files: [
      { name: '銀行轉帳憑證.pdf', size: 667000 },
      { name: '供款清單.xlsx', size: 334000 }
    ],
    auditRecords: [
      { id: 1, action: '企業端提交憑證', user: '新濠天地-財務部', time: '2024-11-08 11:20', remarks: '' },
      { id: 2, action: '營運中心開始審核', user: '李審核員', time: '2024-11-08 15:30', remarks: '' },
      { id: 3, action: '審核退回', user: '李審核員', time: '2024-11-09 10:15', remarks: '實繳金額與應繳金額不符，請重新核對並更新憑證' }
    ]
  }
])

// 计算属性
const dialogTitle = ref('')

// 初始化检查URL参数
if (route.query.noticeNo) {
  searchForm.planNo = route.query.planNo || ''
  // 可以根据通知书编号预填表单
}

// 格式化金额
const formatMoney = (amount) => {
  return amount > 0 ? `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 状态相关
const getStatusType = (status) => {
  const typeMap = {
    'pending': 'info',
    'uploaded': 'warning',
    'reviewing': 'warning',
    'approved': 'success',
    'rejected': 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'pending': '待上傳',
    'uploaded': '已上傳',
    'reviewing': '審核中',
    'approved': '審核通過',
    'rejected': '審核退回'
  }
  return textMap[status] || status
}
// 搜索相关
const handleSearch = () => {
  ElMessage.success('執行搜索操作')
  console.log('搜索条件:', searchForm)
  // 实际查询逻辑
}

const resetSearch = () => {
  searchForm.planNo = ''
  searchForm.planName = ''
  searchForm.contributionPeriod = []
  searchForm.status = ''
  ElMessage.info('重置查詢條件')
  handleSearch()
}

// 表格选择相关
const handleSelectionChange = (selection) => {
  selectedVouchers.value = selection
}

// 憑證操作相关
const viewDetail = (voucher) => {
  selectedVoucher.value = voucher
  activeTab.value = 'basic'
  detailDialogVisible.value = true
  console.log('查看憑證詳情:', voucher.voucherNo)
}

const uploadVoucherFiles = (voucher) => {
  selectedVoucher.value = voucher
  dialogTitle.value = `上傳供款憑證 - ${voucher.planName}`
  
  // 重置表单
  uploadForm.actualAmount = voucher.totalAmount
  uploadForm.paymentDate = ''
  uploadForm.paymentMethod = ''
  uploadForm.fileList = []
  uploadForm.remarks = ''
  
  uploadDialogVisible.value = true
  
  // 关闭详情对话框
  detailDialogVisible.value = false
}

const editVoucher = (voucher) => {
  selectedVoucher.value = voucher
  dialogTitle.value = `編輯供款憑證 - ${voucher.planName}`
  
  // 预填表单数据
  uploadForm.actualAmount = voucher.actualAmount
  uploadForm.paymentDate = voucher.paymentDate
  uploadForm.paymentMethod = voucher.paymentMethod
  uploadForm.fileList = voucher.files ? voucher.files.map(file => ({ name: file.name, size: file.size })) : []
  uploadForm.remarks = voucher.remarks || ''
  
  uploadDialogVisible.value = true
}

const downloadVoucher = (voucher) => {
  ElMessage.success(`正在下載憑證：${voucher.voucherNo}`)
  console.log('下载憑證:', voucher)
}

const viewReceipt = (voucher) => {
  ElMessage.info(`查看收據：${voucher.voucherNo}`)
  // 跳转到收据页面或打开收据对话框
}

// 文件操作相关
const handleFileChange = (file) => {
  if (file.size > 20 * 1024 * 1024) {
    ElMessage.error('文件大小不能超過 20MB')
    return false
  }
  
  // 添加到文件列表
  uploadForm.fileList.push({
    name: file.name,
    size: file.size,
    file: file.raw
  })
  
  console.log('文件添加成功:', file.name)
}

const handleFileRemove = (file) => {
  const index = uploadForm.fileList.findIndex(f => f.name === file.name)
  if (index > -1) {
    uploadForm.fileList.splice(index, 1)
  }
  console.log('文件已移除:', file.name)
}

const previewFile = (file) => {
  ElMessage.info(`預覽文件：${file.name}`)
  // 实际项目中打开文件预览
}

const downloadFile = (file) => {
  ElMessage.success(`正在下載文件：${file.name}`)
  // 实际下载逻辑
}

// 上传相关
const confirmUpload = () => {
  if (!uploadFormRef.value) return
  
  uploadFormRef.value.validate((valid) => {
    if (valid) {
      if (uploadForm.fileList.length === 0) {
        ElMessage.error('請上傳至少一個憑證文件')
        return
      }
      
      uploadLoading.value = true
      
      // 模括上传过程
      setTimeout(() => {
        // 更新数据
        if (selectedVoucher.value) {
          selectedVoucher.value.actualAmount = uploadForm.actualAmount
          selectedVoucher.value.paymentDate = uploadForm.paymentDate
          selectedVoucher.value.paymentMethod = uploadForm.paymentMethod
          selectedVoucher.value.uploadDate = new Date().toLocaleString('zh-CN')
          selectedVoucher.value.fileCount = uploadForm.fileList.length
          selectedVoucher.value.status = 'uploaded'
          selectedVoucher.value.files = uploadForm.fileList.map(f => ({ name: f.name, size: f.size }))
          selectedVoucher.value.remarks = uploadForm.remarks
          
          // 添加审核记录
          if (!selectedVoucher.value.auditRecords) {
            selectedVoucher.value.auditRecords = []
          }
          selectedVoucher.value.auditRecords.push({
            id: selectedVoucher.value.auditRecords.length + 1,
            action: '企業端提交憑證',
            user: '當前企業用戶',
            time: new Date().toLocaleString('zh-CN'),
            remarks: uploadForm.remarks || '提交了供款憑證和相關文件'
          })
        }
        
        uploadLoading.value = false
        uploadDialogVisible.value = false
        
        ElMessage.success('✅ 憑證上傳成功！\n\n憑證已提交至營運中心審核，請留意審核進度。')
      }, 2000)
    }
  })
}

// 批量操作
const handleBatchUpload = () => {
  if (selectedVouchers.value.length === 0) {
    ElMessage.warning('請先選擇要批量上傳的憑證')
    return
  }
  
  ElMessage.info('批量上傳功能開發中...')
}

const handleQuickUpload = () => {
  ElMessage.info('快速上傳功能開發中...')
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // 重新加载数据
}
</script>

</script>

<style scoped>
.submit-voucher-management {
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
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.amount-text {
  color: #2C8976;
  font-weight: 500;
}

.file-count {
  color: #2C8976;
  font-weight: 500;
}

.no-files {
  color: #999;
  font-style: italic;
}

.voucher-info {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.upload-form {
  margin-top: 20px;
}

.upload-demo {
  width: 100%;
}

.voucher-detail {
  margin-bottom: 20px;
}

.file-list {
  max-height: 300px;
  overflow-y: auto;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 8px;
  background-color: #fafafa;
}

.file-icon {
  font-size: 20px;
  color: #2C8976;
  margin-right: 12px;
}

.file-name {
  flex: 1;
  font-weight: 500;
  margin-right: 12px;
}

.file-size {
  color: #666;
  font-size: 12px;
  margin-right: 12px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.audit-list {
  max-height: 400px;
  overflow-y: auto;
}

.audit-item {
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 12px;
  background-color: #fafafa;
}

.audit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.audit-action {
  font-weight: 500;
  color: #2C8976;
}

.audit-time {
  color: #666;
  font-size: 12px;
}

.audit-user {
  color: #666;
  font-size: 14px;
  margin-bottom: 4px;
}

.audit-remarks {
  color: #333;
  font-size: 14px;
}

:deep(.el-descriptions__label) {
  width: 120px;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 140px;
}

:deep(.el-tabs__content) {
  padding-top: 20px;
}
</style>