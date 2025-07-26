<template>
  <div class="payment-notice-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>央積金繳費通知書查詢</span>
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

// 模拟数据 - 使用统一的计划编号
const noticeList = ref([
  {
    noticeNo: 'CPF-NOTICE-2025030001',
    planNo: 'ER12345',
    planName: 'ER12345 集團統一央積金共同計劃',
    contributionPeriod: '2025/02/25 - 2025/03/25',
    employeeCount: 35,
    employerAmount: 64250.00,
    employeeAmount: 64250.00,
    totalAmount: 128500.00,
    dueDate: '2025-03-15',
    status: 'pending',
    companyName: '澳門科技大學',
    generateDate: '2025-03-01',
    generatedBy: '營運中心系統',
    employees: [
      { employeeId: 'ER1234512345', name: '陳大文', amount: 1836.50 },
      { employeeId: 'ER1234512346', name: '李小紅', amount: 1575.00 },
      { employeeId: 'ER1234512347', name: '王志強', amount: 2012.00 }
    ]
  },
  {
    noticeNo: 'CPF-NOTICE-2025030002',
    planNo: 'ER67890',
    planName: 'ER67890 企業專項央積金計劃',
    contributionPeriod: '2025/01/25 - 2025/02/25',
    employeeCount: 28,
    employerAmount: 47640.00,
    employeeAmount: 47640.00,
    totalAmount: 95280.00,
    dueDate: '2025-02-15',
    status: 'confirmed',
    companyName: '澳門大學',
    generateDate: '2025-02-01',
    generatedBy: '營運中心系統',
    employees: [
      { employeeId: 'ER6789067890', name: '張美麗', amount: 1725.00 },
      { employeeId: 'ER6789067891', name: '劉建華', amount: 2296.00 },
      { employeeId: 'ER6789067892', name: '黃大偉', amount: 1869.00 }
    ]
  },
  {
    noticeNo: 'CPF-NOTICE-2025030003',
    planNo: 'ER12345',
    planName: 'ER12345 集團統一央積金共同計劃',
    contributionPeriod: '2024/12/25 - 2025/01/25',
    employeeCount: 42,
    employerAmount: 118375.00,
    employeeAmount: 118375.00,
    totalAmount: 236750.00,
    dueDate: '2025-01-15',
    status: 'overdue',
    companyName: '中國銀行澳門分行',
    generateDate: '2024-12-25',
    generatedBy: '營運中心系統',
    employees: [
      { employeeId: 'ER1234512348', name: '林雅婷', amount: 1652.50 },
      { employeeId: 'ER1234512349', name: '周文強', amount: 2087.00 },
      { employeeId: 'ER1234512350', name: '吳小華', amount: 1508.00 }
    ]
  },
  {
    noticeNo: 'CPF-NOTICE-2025030004',
    planNo: 'ER67890',
    planName: 'ER67890 企業專項央積金計劃',
    contributionPeriod: '2024/11/25 - 2024/12/25',
    employeeCount: 25,
    employerAmount: 192960.00,
    employeeAmount: 192960.00,
    totalAmount: 385920.00,
    dueDate: '2024-12-15',
    status: 'confirmed',
    companyName: '永利渡假村',
    generateDate: '2024-11-25',
    generatedBy: '營運中心系統',
    employees: [
      { employeeId: 'ER6789067893', name: '楊志明', amount: 2516.00 },
      { employeeId: 'ER6789067894', name: '趙雅芳', amount: 1832.50 },
      { employeeId: 'ER6789067895', name: '孫建國', amount: 2227.00 }
    ]
  },
  {
    noticeNo: 'CPF-NOTICE-2025030005',
    planNo: 'ER12345',
    planName: 'ER12345 集團統一央積金共同計劃',
    contributionPeriod: '2024/10/25 - 2024/11/25',
    employeeCount: 31,
    employerAmount: 159320.00,
    employeeAmount: 159320.00,
    totalAmount: 318640.00,
    dueDate: '2024-11-15',
    status: 'confirmed',
    companyName: '新濠天地',
    generateDate: '2024-10-25',
    generatedBy: '營運中心系統',
    employees: [
      { employeeId: 'ER1234512351', name: '錢美琳', amount: 1365.00 },
      { employeeId: 'ER1234512352', name: '許文傑', amount: 1975.00 },
      { employeeId: 'ER1234512353', name: '馮小剛', amount: 2370.00 }
    ]
  }
])

// 格式化金額
const formatMoney = (amount) => {
  return `MOP ${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// 狀態相關
const getStatusType = (status) => {
  const typeMap = {
    'pending': 'warning',
    'confirmed': 'success',
    'adjusting': 'warning',
    'overdue': 'danger',
    'cancelled': 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'pending': '待確認',
    'confirmed': '已確認',
    'adjusting': '調整中',
    'overdue': '已逾期',
    'cancelled': '已撤銷'
  }
  return textMap[status] || status
}
// 搜尋相關
const handleSearch = () => {
  ElMessage.success('執行搜尋操作')
  // 實際查詢邏輯
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

// 表格選擇相關
const handleSelectionChange = (selection) => {
  selectedNotices.value = selection
}

// 通知書操作相關
const viewDetail = (notice) => {
  // 跳轉到詳情頁面，傳遞標準化的計劃編號和期間
  router.push({
    path: `/central-fund/auto-contribution/notice-detail/${notice.noticeNo}`,
    query: {
      planNo: notice.planNo, // 使用已經標準化的計劃編號
      period: notice.contributionPeriod
    }
  })
  console.log('跳轉至通知書詳情頁面:', notice.noticeNo)
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
    // 更新狀態為已確認
    notice.status = 'confirmed'
    ElMessage.success(`✅ 通知書 ${notice.noticeNo} 已確認！\n\n請在截止日期前完成繳費並上傳憑證。`)
    // 關閉詳情對話框
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
    // 设置状态为调整中
    notice.status = 'adjusting'
    ElMessage.success('調整申請已提交，通知書狀態已更新為調整中')
    // 这里可以调用API更新后端状态
    console.log('调整申请已提交:', notice.noticeNo)
    // 關閉詳情對話框
    detailDialogVisible.value = false
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const uploadVoucher = (notice) => {
  // 跳轉到上傳憑證頁面
  router.push({
    path: '/central-fund/auto-contribution/submit-voucher',
    query: { noticeNo: notice.noticeNo }
  })
  ElMessage.info('跳轉至上傳供款憑證頁面...')
}

const downloadNotice = (notice) => {
  ElMessage.success(`正在下載通知書：${notice.noticeNo}`)
  // 實際下載邏輯
  console.log('下載通知書:', notice)
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
    // 批量更新狀態
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
  // 實際匯出邏輯
  console.log('匯出列表')
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