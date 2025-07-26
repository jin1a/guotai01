<template>
  <div class="manual-contribution-records">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>央積金手動供款記錄查詢</span>
        </div>
      </template>
      
      <!-- 查询条件 -->
      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="計劃名稱">
          <el-select v-model="queryForm.planName" placeholder="請選擇計劃" clearable>
            <el-option label="全部計劃" value="" />
            <el-option label="央積金計劃A" value="plan-a" />
            <el-option label="央積金計劃B" value="plan-b" />
          </el-select>
        </el-form-item>
        <el-form-item label="供款期間">
          <el-date-picker
            v-model="queryForm.periodRange"
            type="monthrange"
            range-separator="至"
            start-placeholder="開始月份"
            end-placeholder="結束月份"
            format="YYYY-MM"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="queryForm.status" placeholder="請選擇狀態" clearable>
            <el-option label="全部狀態" value="" />
            <el-option label="已完成" value="completed" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查詢</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 记录列表 -->
      <el-table 
        :data="recordsList" 
        style="width: 100%" 
        v-loading="loading"
      >
        <el-table-column prop="planName" label="計劃名稱" width="150" fixed>
          <template #default="scope">
            <span class="link-text">{{ scope.row.planName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="period" label="供款周期" width="100" />
        <el-table-column prop="amount" label="供款額" width="120" align="right">
          <template #default="scope">
            <span class="amount-text">¥{{ formatMoney(scope.row.amount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentDate" label="繳費日期" width="120">
          <template #default="scope">
            {{ scope.row.paymentDate || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="settlementDate" label="結算日期" width="120">
          <template #default="scope">
            {{ scope.row.settlementDate || '--' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="狀態" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)" size="small">
              {{ scope.row.statusText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewDetail(scope.row)">
              查看詳情
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
    </el-card>

    <!-- 供款记录详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="供款記錄詳情"
      width="800px"
    >
      <div v-if="selectedRecord">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="記錄編號">{{ selectedRecord.listNo }}</el-descriptions-item>
          <el-descriptions-item label="計劃名稱">{{ selectedRecord.planName }}</el-descriptions-item>
          <el-descriptions-item label="供款期間">{{ selectedRecord.period }}</el-descriptions-item>
          <el-descriptions-item label="供款金額">¥{{ formatMoney(selectedRecord.amount) }}</el-descriptions-item>
          <el-descriptions-item label="繳費日期">{{ selectedRecord.paymentDate }}</el-descriptions-item>
          <el-descriptions-item label="結算日期">{{ selectedRecord.settlementDate || '未完成' }}</el-descriptions-item>
          <el-descriptions-item label="狀態">
            <el-tag :type="getStatusType(selectedRecord.status)">
              {{ selectedRecord.statusText }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="備註" :span="1">
            {{ selectedRecord.remark || '無' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <!-- 上传附件 -->
        <div class="detail-section">
          <h4>上傳附件</h4>
          <el-table v-if="selectedRecord.attachments && selectedRecord.attachments.length > 0" :data="selectedRecord.attachments" size="small">
            <el-table-column prop="fileName" label="文件名稱" width="200" />
            <el-table-column prop="fileType" label="文件類型" width="120" />
            <el-table-column prop="uploadTime" label="上傳時間" width="160" />
            <el-table-column prop="uploader" label="上傳人" width="120" />
          </el-table>
          <el-empty v-else description="無附件" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(68)
const detailDialogVisible = ref(false)
const selectedRecord = ref(null)

// 查询表单
const queryForm = reactive({
  planName: '',
  periodRange: [],
  status: ''
})

// 记录列表 - 只查询历史记录
const recordsList = ref([
  {
    id: 1,
    listNo: 'MAN-202503001',
    planNo: 'CPF-PLAN-001',
    planName: '央積金計劃A',
    period: '2025年3月',
    amount: 125000,
    paymentDate: '2025-03-15',
    settlementDate: '2025-03-18',
    status: 'completed',
    statusText: '已完成',
    remark: '2025年3月份供款',
    attachments: [
      { fileName: '供款清單_202503.xlsx', fileType: 'Excel', uploadTime: '2025-03-12 14:35', uploader: '營運操作員A' },
      { fileName: '支票憑證_CHK202503.jpg', fileType: '圖片', uploadTime: '2025-03-15 10:20', uploader: '財務部-張會計' }
    ]
  },
  {
    id: 2,
    listNo: 'MAN-202502001',
    planNo: 'CPF-PLAN-002',
    planName: '央積金計劃B',
    period: '2025年2月',
    amount: 80000,
    paymentDate: '2025-02-15',
    settlementDate: '2025-02-18',
    status: 'completed',
    statusText: '已完成',
    remark: '2025年2月份供款',
    attachments: [
      { fileName: '供款清單_202502.xlsx', fileType: 'Excel', uploadTime: '2025-02-10 10:20', uploader: '營運操作員B' },
      { fileName: '支票憑證_CHK202502.jpg', fileType: '圖片', uploadTime: '2025-02-15 14:30', uploader: '財務部-李會計' }
    ]
  },
  {
    id: 3,
    listNo: 'MAN-202501001',
    planNo: 'CPF-PLAN-001',
    planName: '央積金計劃A',
    period: '2025年1月',
    amount: 125000,
    paymentDate: '2025-01-15',
    settlementDate: '2025-01-18',
    status: 'completed',
    statusText: '已完成',
    remark: '2025年1月份供款',
    attachments: [
      { fileName: '供款清單_202501.xlsx', fileType: 'Excel', uploadTime: '2025-01-10 16:25', uploader: '營運操作員C' },
      { fileName: '銀行轉賬回單.pdf', fileType: 'PDF', uploadTime: '2025-01-15 10:30', uploader: '財務部-王會計' }
    ]
  },
  {
    id: 4,
    listNo: 'MAN-202412001',
    planNo: 'CPF-PLAN-001',
    planName: '央積金計劃A',
    period: '2024年12月',
    amount: 125000,
    paymentDate: '2024-12-15',
    settlementDate: '2024-12-18',
    status: 'completed',
    statusText: '已完成',
    remark: '2024年12月份供款',
    attachments: [
      { fileName: '供款清單_202412.xlsx', fileType: 'Excel', uploadTime: '2024-12-10 09:00', uploader: '營運操作員D' },
      { fileName: '支票憑證_CHK202412.jpg', fileType: '圖片', uploadTime: '2024-12-15 11:00', uploader: '財務部-張會計' }
    ]
  }
])


// 格式化金额
const formatMoney = (amount) => {
  return amount ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// 获取状态类型
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

// 查询操作
const handleSearch = () => {
  loading.value = true
  console.log('查询条件:', queryForm)
  // 模拟查询
  setTimeout(() => {
    loading.value = false
    ElMessage.success('查詢完成')
  }, 1000)
}

// 重置查询
const resetQuery = () => {
  queryForm.planName = ''
  queryForm.periodRange = []
  queryForm.status = ''
}


// 查看详情 - 弹窗显示
const viewDetail = (row) => {
  selectedRecord.value = row
  detailDialogVisible.value = true
}


// 分页处理
const handleSizeChange = (val) => {
  console.log(`每页 ${val} 条`)
}

const handleCurrentChange = (val) => {
  console.log(`当前页: ${val}`)
}

// 初始化
onMounted(() => {
  console.log('手动供款记录查询页面初始化')
  
  // 检查是否从其他页面跳转过来
  const route = router.currentRoute.value
  if (route.query.listNo) {
    queryForm.listNo = route.query.listNo
    handleSearch()
  }
})
</script>

<style scoped>
.manual-contribution-records {
  /* 由全局样式处理 */
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