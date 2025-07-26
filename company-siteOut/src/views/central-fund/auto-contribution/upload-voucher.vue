<template>
  <div class="upload-voucher">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>上傳供款憑證</span>
          <el-button @click="goBack" type="info" plain size="small">
            返回列表
          </el-button>
        </div>
      </template>

      <!-- 憑證基本信息 -->
      <div v-if="voucherInfo" class="voucher-info">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="憑證編號">{{ voucherInfo.voucherNo }}</el-descriptions-item>
          <el-descriptions-item label="通知書編號">{{ voucherInfo.noticeNo }}</el-descriptions-item>
          <el-descriptions-item label="計劃編號">{{ voucherInfo.planNo }}</el-descriptions-item>
          <el-descriptions-item label="計劃名稱">{{ voucherInfo.planName }}</el-descriptions-item>
          <el-descriptions-item label="供款期間">{{ voucherInfo.contributionPeriod }}</el-descriptions-item>
          <el-descriptions-item label="應繳金額">{{ formatMoney(voucherInfo.totalAmount) }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 上傳表單 -->
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
        <el-form-item label="憑證檔案" prop="files">
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
              將檔案拖到此處，或<em>點擊上傳</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支援 PDF、圖片、Excel 檔案，單檔案不超過 20MB，可上傳多個檔案
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
        <el-form-item>
          <el-button type="primary" @click="submitUpload" :loading="uploading">
            {{ uploading ? '上傳中...' : '確認上傳' }}
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 憑證信息
const voucherInfo = ref(null)
const uploading = ref(false)

// 上傳表單
const uploadFormRef = ref(null)
const uploadForm = reactive({
  actualAmount: null,
  paymentDate: '',
  paymentMethod: '',
  fileList: [],
  remarks: ''
})

// 表單驗證規則
const uploadRules = {
  actualAmount: [{ required: true, message: '請輸入實際繳費金額', trigger: 'blur' }],
  paymentDate: [{ required: true, message: '請選擇繳費日期', trigger: 'change' }],
  paymentMethod: [{ required: true, message: '請選擇繳費方式', trigger: 'change' }]
}

// 初始化數據
onMounted(() => {
  const { voucherNo, noticeNo, planNo } = route.query
  if (voucherNo && noticeNo && planNo) {
    // 根據查詢參數獲取憑證信息
    loadVoucherInfo({ voucherNo, noticeNo, planNo })
  }
})

// 載入憑證信息
const loadVoucherInfo = (params) => {
  // 模擬從後端獲取數據
  const mockData = {
    'CPF-VOUCHER-2025030001': {
      voucherNo: 'CPF-VOUCHER-2025030001',
      noticeNo: 'CPF-NOTICE-2025030001',
      planNo: 'ER12345',
      planName: 'ER12345-集團統一央積金共同計劃',
      contributionPeriod: '2025/02/25 - 2025/03/25',
      totalAmount: 128500.00
    },
    'CPF-VOUCHER-2025030002': {
      voucherNo: 'CPF-VOUCHER-2025030002',
      noticeNo: 'CPF-NOTICE-2025030002',
      planNo: 'ER67890',
      planName: 'ER67890-企業專項央積金計劃',
      contributionPeriod: '2025/01/25 - 2025/02/25',
      totalAmount: 95280.00
    },
    'CPF-VOUCHER-2025030005': {
      voucherNo: 'CPF-VOUCHER-2025030005',
      noticeNo: 'CPF-NOTICE-2025030005',
      planNo: 'ER12345',
      planName: 'ER12345-集團統一央積金共同計劃',
      contributionPeriod: '2024/10/25 - 2024/11/25',
      totalAmount: 318640.00
    }
  }
  
  voucherInfo.value = mockData[params.voucherNo]
  if (voucherInfo.value) {
    uploadForm.actualAmount = voucherInfo.value.totalAmount
  }
}

// 格式化金額
const formatMoney = (amount) => {
  return `MOP ${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// 檔案操作
const handleFileChange = (file) => {
  if (file.size > 20 * 1024 * 1024) {
    ElMessage.error('檔案大小不能超過 20MB')
    return false
  }
  
  uploadForm.fileList.push({
    name: file.name,
    size: file.size,
    file: file.raw
  })
  
  console.log('檔案新增成功:', file.name)
}

const handleFileRemove = (file) => {
  const index = uploadForm.fileList.findIndex(f => f.name === file.name)
  if (index > -1) {
    uploadForm.fileList.splice(index, 1)
  }
  console.log('檔案已移除:', file.name)
}

// 提交上傳
const submitUpload = () => {
  if (!uploadFormRef.value) return
  
  uploadFormRef.value.validate((valid) => {
    if (valid) {
      if (uploadForm.fileList.length === 0) {
        ElMessage.error('請上傳至少一個憑證檔案')
        return
      }
      
      uploading.value = true
      
      // 模擬上傳過程
      setTimeout(() => {
        uploading.value = false
        ElMessage.success('✅ 憑證上傳成功！\n\n憑證已提交至營運中心審核，請留意審核進度。')
        
        // 返回列表頁面
        goBack()
      }, 2000)
    }
  })
}

// 重置表單
const resetForm = () => {
  if (uploadFormRef.value) {
    uploadFormRef.value.resetFields()
  }
  uploadForm.fileList = []
  if (voucherInfo.value) {
    uploadForm.actualAmount = voucherInfo.value.totalAmount
  }
}

// 返回列表
const goBack = () => {
  router.push('/central-fund/auto-contribution/submit-voucher')
}
</script>

<style scoped>
.upload-voucher {
  /* 基础布局样式由全局样式处理 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.voucher-info {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.upload-form {
  max-width: 600px;
  margin: 0 auto;
}

.upload-demo {
  width: 100%;
}

:deep(.el-descriptions__label) {
  width: 120px;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 140px;
}
</style>