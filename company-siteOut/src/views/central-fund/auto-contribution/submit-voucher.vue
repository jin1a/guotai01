<template>
  <div class="submit-voucher-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>央積金提交供款憑證</span>
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
          <el-button type="primary" @click="handleSearch">搜尋</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 供款憑證列表 -->
      <el-table :data="voucherList" style="width: 100%">
        <el-table-column prop="voucherNo" label="憑證編號" width="160" sortable />
        <el-table-column prop="noticeNo" label="通知書編號" width="160" />
        <el-table-column prop="planNo" label="計劃編號" width="120" />
        <el-table-column prop="planName" label="計劃名稱" min-width="150" show-overflow-tooltip />
        <el-table-column prop="contributionPeriod" label="供款期間" width="140" />
        <el-table-column prop="totalAmount" label="繳費金額" width="120" align="right">
          <template #default="scope">
            <span class="amount-text">{{ formatMoney(scope.row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="dueDate" label="繳費截止日期" width="120" />
        <el-table-column prop="status" label="狀態" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="viewDetail(scope.row)">
              查看詳情
            </el-button>
            <el-button 
              v-if="scope.row.status === 'pending' || scope.row.status === 'rejected'"
              type="success" 
              link 
              @click="uploadVoucher(scope.row)"
            >
              上傳憑證
            </el-button>
            <el-button 
              v-if="scope.row.status === 'approved'"
              type="info" 
              link 
              @click="downloadReceipt(scope.row)"
            >
              下載收據
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
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 搜尋表單
const searchForm = reactive({
  planNo: '',
  planName: '',
  contributionPeriod: [],
  status: ''
})

// 分頁
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(2)

// 模擬資料 - 待上傳憑證的列表（只顯示2個計劃）
const voucherList = ref([
  {
    voucherNo: 'CPF-VOUCHER-2025030001',
    noticeNo: 'CPF-NOTICE-2025030001',
    planNo: 'ER12345',
    planName: 'ER12345-集團統一央積金共同計劃',
    contributionPeriod: '2025/02/25 - 2025/03/25',
    totalAmount: 128500.00,
    dueDate: '2025-03-15',
    status: 'pending'
  },
  {
    voucherNo: 'CPF-VOUCHER-2025030002',
    noticeNo: 'CPF-NOTICE-2025030002',
    planNo: 'ER67890',
    planName: 'ER67890-企業專項央積金計劃',
    contributionPeriod: '2025/01/25 - 2025/02/25',
    totalAmount: 95280.00,
    dueDate: '2025-02-15',
    status: 'pending'
  }
])

// 格式化金額
const formatMoney = (amount) => {
  return `MOP ${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// 狀態相關
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

// 搜尋相關
const handleSearch = () => {
  ElMessage.success('執行搜尋操作')
  console.log('搜尋條件:', searchForm)
}

const resetSearch = () => {
  searchForm.planNo = ''
  searchForm.planName = ''
  searchForm.contributionPeriod = []
  searchForm.status = ''
  ElMessage.info('重置查詢條件')
  handleSearch()
}

// 憑證操作相關
const viewDetail = (voucher) => {
  ElMessage.info(`查看憑證詳情：${voucher.voucherNo}`)
  // 可以跳轉到詳情頁面
}

const uploadVoucher = (voucher) => {
  // 跳轉到上傳憑證頁面，傳遞憑證資訊
  router.push({
    path: '/central-fund/auto-contribution/upload-voucher',
    query: { 
      voucherNo: voucher.voucherNo,
      noticeNo: voucher.noticeNo,
      planNo: voucher.planNo
    }
  })
  ElMessage.info('跳轉至憑證上傳頁面...')
}

const downloadReceipt = (voucher) => {
  ElMessage.success(`正在下載收據：${voucher.voucherNo}`)
  // 實際下載邏輯
}

// 分頁相關
const handleSizeChange = (val) => {
  pageSize.value = val
  // 重新載入資料
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // 重新載入資料
}
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

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}
</style>