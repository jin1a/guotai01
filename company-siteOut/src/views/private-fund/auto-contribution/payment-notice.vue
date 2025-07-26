<template>
  <div class="payment-notice-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>私退金繳費通知書查詢</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleExport">
              匯出列表
            </el-button>
            <el-button type="success" @click="handleBatchConfirm" :disabled="selectedNotices.length === 0">
              批量確認
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
        <el-form-item label="通知書狀態">
          <el-select v-model="searchForm.status" placeholder="請選擇狀態" clearable>
            <el-option label="全部" value="" />
            <el-option label="待確認" value="pending" />
            <el-option label="已確認" value="confirmed" />
            <el-option label="已逾期" value="overdue" />
            <el-option label="已撤銷" value="cancelled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 通知书列表 -->
      <el-table 
        :data="noticeList" 
        style="width: 100%"
        @selection-change="handleSelectionChange"
        row-key="noticeNo"
      >
        <el-table-column 
          type="selection" 
          width="55"
          :selectable="(row) => row.status === 'pending'"
        />
        <el-table-column prop="noticeNo" label="通知書編號" width="160" sortable />
        <el-table-column prop="planNo" label="計劃編號" width="120" />
        <el-table-column prop="planName" label="計劃名稱" min-width="150" show-overflow-tooltip />
        <el-table-column prop="contributionPeriod" label="供款期間" width="120" />
        <el-table-column prop="employeeCount" label="參與僱員" width="100" align="center">
          <template #default="scope">
            <span>{{ scope.row.employeeCount }}人</span>
          </template>
        </el-table-column>
        <el-table-column prop="employerAmount" label="雇主供款" width="120" align="right">
          <template #default="scope">
            <span class="amount-text">{{ formatMoney(scope.row.employerAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="employeeAmount" label="僱員供款" width="120" align="right">
          <template #default="scope">
            <span class="amount-text">{{ formatMoney(scope.row.employeeAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalAmount" label="總計金額" width="140" align="right">
          <template #default="scope">
            <span class="total-amount">{{ formatMoney(scope.row.totalAmount) }}</span>
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
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="viewDetail(scope.row)">
              查看詳情
            </el-button>
            <el-button 
              v-if="scope.row.status === 'pending'"
              type="success" 
              link 
              @click="confirmNotice(scope.row)"
            >
              確認
            </el-button>
            <el-button 
              v-if="scope.row.status === 'pending'"
              type="warning" 
              link 
              @click="adjustNotice(scope.row)"
            >
              申請調整
            </el-button>
            <el-button 
              v-if="scope.row.status === 'confirmed'"
              type="info" 
              link 
              @click="uploadVoucher(scope.row)"
            >
              上傳憑證
            </el-button>
            <el-button 
              v-if="scope.row.status !== 'cancelled'"
              type="primary" 
              link 
              @click="downloadNotice(scope.row)"
            >
              下載
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

    <!-- 通知书详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="繳費通知書詳情"
      width="800px"
      destroy-on-close
    >
      <div v-if="selectedNotice" class="notice-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="通知書編號">{{ selectedNotice.noticeNo }}</el-descriptions-item>
          <el-descriptions-item label="計劃編號">{{ selectedNotice.planNo }}</el-descriptions-item>
          <el-descriptions-item label="計劃名稱">{{ selectedNotice.planName }}</el-descriptions-item>
          <el-descriptions-item label="供款期間">{{ selectedNotice.contributionPeriod }}</el-descriptions-item>
          <el-descriptions-item label="參與僱員">{{ selectedNotice.employeeCount }}人</el-descriptions-item>
          <el-descriptions-item label="繳費截止日期">{{ selectedNotice.dueDate }}</el-descriptions-item>
          <el-descriptions-item label="雇主供款">{{ formatMoney(selectedNotice.employerAmount) }}</el-descriptions-item>
          <el-descriptions-item label="僱員供款">{{ formatMoney(selectedNotice.employeeAmount) }}</el-descriptions-item>
          <el-descriptions-item label="總計金額" :span="2">
            <span class="total-amount-large">{{ formatMoney(selectedNotice.totalAmount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="狀態" :span="2">
            <el-tag :type="getStatusType(selectedNotice.status)" size="large">
              {{ getStatusText(selectedNotice.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        
        <div class="notice-actions" v-if="selectedNotice.status === 'pending'">
          <el-button type="success" @click="confirmNotice(selectedNotice)">確認通知書</el-button>
          <el-button type="warning" @click="adjustNotice(selectedNotice)">申請調整</el-button>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">關閉</el-button>
        <el-button type="primary" @click="downloadNotice(selectedNotice)">下載通知書</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

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

// 选中的通知书
const selectedNotices = ref([])
const selectedNotice = ref(null)
const detailDialogVisible = ref(false)

// 模拟数据 - 与营运端P502数据保持一致
const noticeList = ref([
  {
    noticeNo: 'PF-NOTICE-2025030001',
    planNo: 'PFJH8422',
    planName: '私退金A計劃',
    contributionPeriod: '2025/02/25 - 2025/03/25',
    employeeCount: 35,
    employerAmount: 64250.00,
    employeeAmount: 64250.00,
    totalAmount: 128500.00,
    dueDate: '2025-03-15',
    status: 'pending',
    companyName: '澳門科技大學',
    generateDate: '2025-03-01',
    generatedBy: '營運中心系統'
  },
  {
    noticeNo: 'PF-NOTICE-2025030002',
    planNo: 'PFJH8423',
    planName: '私退金B計劃',
    contributionPeriod: '2025/01/25 - 2025/02/25',
    employeeCount: 28,
    employerAmount: 47640.00,
    employeeAmount: 47640.00,
    totalAmount: 95280.00,
    dueDate: '2025-02-15',
    status: 'confirmed',
    companyName: '澳門大學',
    generateDate: '2025-02-01',
    generatedBy: '營運中心系統'
  },
  {
    noticeNo: 'PF-NOTICE-2025030003',
    planNo: 'PFJH8424',
    planName: '私退金企業計劃',
    contributionPeriod: '2024/12/25 - 2025/01/25',
    employeeCount: 45,
    employerAmount: 128375.00,
    employeeAmount: 128375.00,
    totalAmount: 256750.00,
    dueDate: '2025-01-15',
    status: 'overdue',
    companyName: '中國銀行澳門分行',
    generateDate: '2024-12-25',
    generatedBy: '營運中心系統'
  },
  {
    noticeNo: 'PF-NOTICE-2025030004',
    planNo: 'PFJH8425',
    planName: '私退金集團計劃',
    contributionPeriod: '2024/11/25 - 2024/12/25',
    employeeCount: 32,
    employerAmount: 222960.00,
    employeeAmount: 222960.00,
    totalAmount: 445920.00,
    dueDate: '2024-12-15',
    status: 'confirmed',
    companyName: '永利渡假村',
    generateDate: '2024-11-25',
    generatedBy: '營運中心系統'
  },
  {
    noticeNo: 'PF-NOTICE-2025030005',
    planNo: 'PFJH8426',
    planName: '私退金標準計劃',
    contributionPeriod: '2024/10/25 - 2024/11/25',
    employeeCount: 18,
    employerAmount: 189320.00,
    employeeAmount: 189320.00,
    totalAmount: 378640.00,
    dueDate: '2024-11-15',
    status: 'confirmed',
    companyName: '新濠天地',
    generateDate: '2024-10-25',
    generatedBy: '營運中心系統'
  }
])

// 格式化金额
const formatMoney = (amount) => {
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// 状态相关
const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'confirmed': 'success', 
    'overdue': 'danger',
    'cancelled': 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'pending': '待確認',
    'confirmed': '已確認',
    'overdue': '已逾期',
    'cancelled': '已撤銷'
  }
  return textMap[status] || status
}
// 搜索相关
const handleSearch = () => {
  ElMessage.success('執行搜索操作')
  // 实际查询逻辑
  console.log('搜索条件:', searchForm)
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
  selectedNotices.value = selection
}

// 通知书操作相关
const viewDetail = (notice) => {
  selectedNotice.value = notice
  detailDialogVisible.value = true
  console.log('查看通知書詳情:', notice.noticeNo)
}

const confirmNotice = (notice) => {
  ElMessageBox.confirm(
    `確認接受此繳費通知書嗎？\n\n通知書編號：${notice.noticeNo}\n總計金額：${formatMoney(notice.totalAmount)}\n\n確認後將進入繳費流程。`,
    '確認通知書',
    {
      confirmButtonText: '確認',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 更新状态为已确认
    notice.status = 'confirmed'
    ElMessage.success(`✅ 通知書 ${notice.noticeNo} 已確認！\n\n請在截止日期前完成繳費並上傳憑證。`)
    // 关闭详情对话框
    detailDialogVisible.value = false
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const adjustNotice = (notice) => {
  ElMessageBox.confirm(
    `申請調整此繳費通知書嗎？\n\n通知書編號：${notice.noticeNo}\n當前金額：${formatMoney(notice.totalAmount)}\n\n調整申請將提交至營運中心審核。`,
    '申請調整',
    {
      confirmButtonText: '申請調整',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 跳转到供款调整申请页面
    router.push({
      path: '/private-fund/contribution-adjustment',
      query: { noticeNo: notice.noticeNo }
    })
    ElMessage.info('跳轉至供款調整申請頁面...')
    // 关闭详情对话框
    detailDialogVisible.value = false
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const uploadVoucher = (notice) => {
  // 跳转到上传凭证页面
  router.push({
    path: '/private-fund/auto-contribution/submit-voucher',
    query: { noticeNo: notice.noticeNo }
  })
  ElMessage.info('跳轉至上傳供款憑證頁面...')
}

const downloadNotice = (notice) => {
  ElMessage.success(`正在下載通知書：${notice.noticeNo}`)
  // 实际下载逻辑
  console.log('下载通知书:', notice)
}

// 批量操作
const handleBatchConfirm = () => {
  if (selectedNotices.value.length === 0) {
    ElMessage.warning('請先選擇要確認的通知書')
    return
  }
  
  const noticeNos = selectedNotices.value.map(n => n.noticeNo).join('、')
  ElMessageBox.confirm(
    `確認批量接受所選擇的 ${selectedNotices.value.length} 份繳費通知書嗎？\n\n通知書編號：${noticeNos}`,
    '批量確認',
    {
      confirmButtonText: '確認',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 批量更新状态
    selectedNotices.value.forEach(notice => {
      notice.status = 'confirmed'
    })
    ElMessage.success(`✅ 已批量確認 ${selectedNotices.value.length} 份通知書！`)
    selectedNotices.value = []
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleExport = () => {
  ElMessage.success('正在匯出通知書列表...')
  // 实际导出逻辑
  console.log('导出列表')
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
.payment-notice-management {
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

.total-amount {
  color: #2C8976;
  font-weight: 600;
  font-size: 16px;
}

.total-amount-large {
  color: #2C8976;
  font-weight: 700;
  font-size: 20px;
}

.notice-detail {
  margin-bottom: 20px;
}

.notice-actions {
  margin-top: 24px;
  text-align: center;
}

.notice-actions .el-button {
  margin: 0 8px;
}

:deep(.el-descriptions__label) {
  width: 120px;
}

:deep(.el-table .el-table__cell) {
  padding: 12px 0;
}

:deep(.el-tag--large) {
  height: 28px;
  line-height: 26px;
  font-size: 14px;
}
</style>