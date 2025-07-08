<template>
  <div class="contribution-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>供款管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddContribution">
              新增供款
            </el-button>
            <el-button type="success" @click="handleBatchImport">
              批量導入
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="供款期間">
          <el-date-picker
            v-model="searchForm.period"
            type="monthrange"
            range-separator="至"
            start-placeholder="開始月份"
            end-placeholder="結束月份"
            value-format="YYYY-MM"
          />
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="searchForm.status" placeholder="請選擇狀態">
            <el-option label="全部" value="" />
            <el-option label="待提交" value="draft" />
            <el-option label="待審核" value="pending" />
            <el-option label="已通過" value="approved" />
            <el-option label="已拒絕" value="rejected" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 供款列表 -->
      <el-table :data="contributionList" style="width: 100%">
        <el-table-column prop="period" label="供款期間" width="120" />
        <el-table-column prop="planName" label="計劃名稱" width="200" />
        <el-table-column prop="employeeCount" label="僱員人數" width="100" align="right" />
        <el-table-column prop="totalAmount" label="總金額" width="150" align="right">
          <template #default="scope">
            {{ formatCurrency(scope.row.totalAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="submitDate" label="提交日期" width="120" />
        <el-table-column prop="status" label="狀態" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button 
              type="success" 
              link 
              v-if="scope.row.status === '待提交'"
              @click="handleEdit(scope.row)"
            >
              編輯
            </el-button>
            <el-button 
              type="warning" 
              link 
              v-if="scope.row.status === '待提交'"
              @click="handleSubmit(scope.row)"
            >
              提交
            </el-button>
            <el-button type="info" link @click="handleExport(scope.row)">
              導出
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

    <!-- 新增/编辑供款对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增供款' : '編輯供款'"
      width="800px"
    >
      <el-form
        ref="contributionFormRef"
        :model="contributionForm"
        :rules="contributionRules"
        label-width="100px"
      >
        <el-form-item label="供款期間" prop="period">
          <el-date-picker
            v-model="contributionForm.period"
            type="month"
            placeholder="請選擇供款期間"
            value-format="YYYY-MM"
          />
        </el-form-item>
        
        <el-form-item label="計劃選擇" prop="planId">
          <el-select 
            v-model="contributionForm.planId"
            placeholder="請選擇計劃"
            style="width: 100%"
          >
            <el-option
              v-for="plan in planOptions"
              :key="plan.id"
              :label="plan.name"
              :value="plan.id"
            />
          </el-select>
        </el-form-item>

        <!-- 供款明细表格 -->
        <el-table :data="contributionForm.details" style="width: 100%; margin-bottom: 20px;">
          <el-table-column prop="employeeId" label="僱員編號" width="120" />
          <el-table-column prop="employeeName" label="僱員姓名" width="120" />
          <el-table-column prop="salary" label="月薪" width="150" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.salary) }}
            </template>
          </el-table-column>
          <el-table-column prop="employeeContribution" label="僱員供款" width="150" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.employeeContribution) }}
            </template>
          </el-table-column>
          <el-table-column prop="employerContribution" label="僱主供款" width="150" align="right">
            <template #default="scope">
              {{ formatCurrency(scope.row.employerContribution) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button 
                type="danger" 
                link 
                @click="handleRemoveDetail(scope.$index)"
              >
                刪除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-form-item label="備註" prop="remarks">
          <el-input
            v-model="contributionForm.remarks"
            type="textarea"
            placeholder="請輸入備註"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitContribution">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量導入供款記錄"
      width="500px"
    >
      <el-upload
        class="upload-demo"
        drag
        action="/api/contribution/import"
        :auto-upload="false"
        :on-change="handleFileChange"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          將文件拖到此處，或<em>點擊上傳</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            只能上傳 xlsx 文件，且不超過 10MB
          </div>
        </template>
      </el-upload>
      <div class="upload-actions">
        <el-button type="primary" @click="handleUpload">
          開始上傳
        </el-button>
        <el-button type="success" @click="handleDownloadTemplate">
          下載模板
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

// 搜索表单
const searchForm = reactive({
  period: [],
  status: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 模拟数据
const contributionList = ref([
  {
    id: 1,
    period: '2024-03',
    planName: '標準定額供款計劃A',
    employeeCount: 50,
    totalAmount: 150000,
    submitDate: '2024-03-15',
    status: '待審核'
  },
  {
    id: 2,
    period: '2024-02',
    planName: '靈活供款計劃B',
    employeeCount: 30,
    totalAmount: 90000,
    submitDate: '2024-02-28',
    status: '已通過'
  },
  {
    id: 3,
    period: '2024-03',
    planName: '企業專屬計劃C',
    employeeCount: 20,
    totalAmount: 60000,
    submitDate: null,
    status: '待提交'
  }
])

// 计划选项
const planOptions = [
  { id: 1, name: '標準定額供款計劃A' },
  { id: 2, name: '靈活供款計劃B' },
  { id: 3, name: '企業專屬計劃C' }
]

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const contributionFormRef = ref(null)
const contributionForm = reactive({
  period: '',
  planId: '',
  details: [
    {
      employeeId: 'E202401001',
      employeeName: '張三',
      salary: 20000,
      employeeContribution: 1000,
      employerContribution: 1000
    }
  ],
  remarks: ''
})

// 导入对话框
const importDialogVisible = ref(false)
const uploadFile = ref(null)

// 表单验证规则
const contributionRules = {
  period: [{ required: true, message: '請選擇供款期間', trigger: 'change' }],
  planId: [{ required: true, message: '請選擇計劃', trigger: 'change' }]
}

// 状态标签类型
const getStatusType = (status) => {
  const types = {
    '待提交': 'info',
    '待審核': 'warning',
    '已通過': 'success',
    '已拒絕': 'danger'
  }
  return types[status] || 'info'
}

// 格式化货币
const formatCurrency = (value) => {
  return new Intl.NumberFormat('zh-HK', {
    style: 'currency',
    currency: 'MOP'
  }).format(value)
}

// 搜索相关
const handleSearch = () => {
  ElMessage.success('執行搜索')
  // 实现搜索逻辑
}

const resetSearch = () => {
  searchForm.period = []
  searchForm.status = ''
  handleSearch()
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

// 供款操作相关
const handleAddContribution = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  // 重置表单
  if (contributionFormRef.value) {
    contributionFormRef.value.resetFields()
  }
}

const handleView = (row) => {
  ElMessage.info(`查看供款記錄：${row.planName} - ${row.period}`)
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  // 填充表单数据
  Object.assign(contributionForm, row)
}

const handleSubmit = (row) => {
  ElMessageBox.confirm(
    `確定要提交 ${row.planName} ${row.period} 的供款記錄嗎？`,
    '提示',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success('供款記錄已提交')
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleExport = (row) => {
  ElMessage.success(`開始導出 ${row.planName} ${row.period} 的供款記錄`)
}

const handleRemoveDetail = (index) => {
  contributionForm.details.splice(index, 1)
}

const handleSubmitContribution = () => {
  if (!contributionFormRef.value) return
  
  contributionFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(
        dialogType.value === 'add' 
          ? '新增供款記錄成功' 
          : '更新供款記錄成功'
      )
      dialogVisible.value = false
    }
  })
}

// 导入相关
const handleBatchImport = () => {
  importDialogVisible.value = true
}

const handleFileChange = (file) => {
  uploadFile.value = file
}

const handleUpload = () => {
  if (!uploadFile.value) {
    ElMessage.warning('請先選擇文件')
    return
  }
  ElMessage.success('開始上傳文件')
  // 实现上传逻辑
}

const handleDownloadTemplate = () => {
  ElMessage.success('開始下載模板')
  // 实现下载模板逻辑
}
</script>

<style scoped>
.contribution-management {
  padding: 0px;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.upload-demo {
  text-align: center;
}

.upload-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-upload__tip) {
  margin-top: 12px;
  text-align: center;
}
</style> 