<template>
  <div class="employee-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>僱員管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddEmployee">
              新增僱員
            </el-button>
            <el-button type="success" @click="handleImport">
              批量導入
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="僱員編號">
          <el-input v-model="searchForm.employeeId" placeholder="請輸入僱員編號" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="請輸入姓名" />
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="searchForm.status" placeholder="請選擇狀態">
            <el-option label="全部" value="" />
            <el-option label="在職" value="active" />
            <el-option label="離職" value="resigned" />
            <el-option label="待入職" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 员工列表 -->
      <el-table :data="employeeList" style="width: 100%">
        <el-table-column prop="employeeId" label="僱員編號" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="idNumber" label="身份證號" width="150" />
        <el-table-column prop="department" label="部門" width="120" />
        <el-table-column prop="position" label="職位" width="120" />
        <el-table-column prop="joinDate" label="入職日期" width="120" />
        <el-table-column prop="status" label="狀態" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button type="success" link @click="handleEdit(scope.row)">
              編輯
            </el-button>
            <el-button 
              type="danger" 
              link 
              v-if="scope.row.status === '在職'"
              @click="handleResign(scope.row)"
            >
              離職
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

    <!-- 新增/编辑员工对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增僱員' : '編輯僱員'"
      width="700px"
    >
      <el-form
        ref="employeeFormRef"
        :model="employeeForm"
        :rules="employeeRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="employeeForm.name" placeholder="請輸入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份證號" prop="idNumber">
              <el-input v-model="employeeForm.idNumber" placeholder="請輸入身份證號" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="部門" prop="department">
              <el-input v-model="employeeForm.department" placeholder="請輸入部門" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="職位" prop="position">
              <el-input v-model="employeeForm.position" placeholder="請輸入職位" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入職日期" prop="joinDate">
              <el-date-picker
                v-model="employeeForm.joinDate"
                type="date"
                placeholder="請選擇入職日期"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="薪資" prop="salary">
              <el-input-number
                v-model="employeeForm.salary"
                :min="0"
                :precision="2"
                :step="1000"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="備註" prop="remarks">
          <el-input
            v-model="employeeForm.remarks"
            type="textarea"
            placeholder="請輸入備註"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitEmployee">
            確定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量導入僱員"
      width="500px"
    >
      <el-upload
        class="upload-demo"
        drag
        action="/api/employee/import"
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
  employeeId: '',
  name: '',
  status: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 模拟数据
const employeeList = ref([
  {
    employeeId: 'E202401001',
    name: '張三',
    idNumber: 'A123456(7)',
    department: '市場部',
    position: '經理',
    joinDate: '2024-01-01',
    status: '在職'
  },
  {
    employeeId: 'E202401002',
    name: '李四',
    idNumber: 'B234567(8)',
    department: '技術部',
    position: '工程師',
    joinDate: '2024-02-01',
    status: '待入職'
  },
  {
    employeeId: 'E202401003',
    name: '王五',
    idNumber: 'C345678(9)',
    department: '財務部',
    position: '主管',
    joinDate: '2024-01-15',
    status: '離職'
  }
])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const employeeFormRef = ref(null)
const employeeForm = reactive({
  name: '',
  idNumber: '',
  department: '',
  position: '',
  joinDate: '',
  salary: 0,
  remarks: ''
})

// 导入对话框
const importDialogVisible = ref(false)
const uploadFile = ref(null)

// 表单验证规则
const employeeRules = {
  name: [{ required: true, message: '請輸入姓名', trigger: 'blur' }],
  idNumber: [{ required: true, message: '請輸入身份證號', trigger: 'blur' }],
  department: [{ required: true, message: '請輸入部門', trigger: 'blur' }],
  position: [{ required: true, message: '請輸入職位', trigger: 'blur' }],
  joinDate: [{ required: true, message: '請選擇入職日期', trigger: 'change' }]
}

// 状态标签类型
const getStatusType = (status) => {
  const types = {
    '在職': 'success',
    '待入職': 'warning',
    '離職': 'danger'
  }
  return types[status] || 'info'
}

// 搜索相关
const handleSearch = () => {
  ElMessage.success('執行搜索')
  // 实现搜索逻辑
}

const resetSearch = () => {
  searchForm.employeeId = ''
  searchForm.name = ''
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

// 员工操作相关
const handleAddEmployee = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  // 重置表单
  if (employeeFormRef.value) {
    employeeFormRef.value.resetFields()
  }
}

const handleView = (row) => {
  ElMessage.info(`查看僱員：${row.name}`)
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  // 填充表单数据
  Object.assign(employeeForm, row)
}

const handleResign = (row) => {
  ElMessageBox.confirm(
    `確定要將僱員 ${row.name} 設置為離職狀態嗎？`,
    '警告',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`僱員 ${row.name} 已設置為離職`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleSubmitEmployee = () => {
  if (!employeeFormRef.value) return
  
  employeeFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(
        dialogType.value === 'add' 
          ? '新增僱員成功' 
          : '更新僱員資料成功'
      )
      dialogVisible.value = false
    }
  })
}

// 导入相关
const handleImport = () => {
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