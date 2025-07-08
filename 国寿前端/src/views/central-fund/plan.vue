<template>
  <div class="plan-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>計劃管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleAddPlan">
              新增計劃
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索表单 -->
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="計劃編號">
          <el-input v-model="searchForm.planId" placeholder="請輸入計劃編號" />
        </el-form-item>
        <el-form-item label="計劃狀態">
          <el-select v-model="searchForm.status" placeholder="請選擇狀態">
            <el-option label="全部" value="" />
            <el-option label="生效中" value="active" />
            <el-option label="已終止" value="terminated" />
            <el-option label="待審核" value="pending" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 计划列表 -->
      <el-table :data="planList" style="width: 100%">
        <el-table-column prop="planId" label="計劃編號" width="150" />
        <el-table-column prop="name" label="計劃名稱" />
        <el-table-column prop="type" label="計劃類型" width="180">
          <template #default="scope">
            <el-tag>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="生效日期" width="150" />
        <el-table-column prop="status" label="狀態" width="150">
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
            <el-button type="warning" link @click="handleTerminate(scope.row)">
              終止
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

    <!-- 新增/编辑计划对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增計劃' : '編輯計劃'"
      width="600px"
    >
      <el-form
        ref="planFormRef"
        :model="planForm"
        :rules="planRules"
        label-width="100px"
      >
        <el-form-item label="計劃名稱" prop="name">
          <el-input v-model="planForm.name" placeholder="請輸入計劃名稱" />
        </el-form-item>
        <el-form-item label="計劃類型" prop="type">
          <el-select v-model="planForm.type" placeholder="請選擇計劃類型">
            <el-option label="定額供款" value="fixed" />
            <el-option label="靈活供款" value="flexible" />
          </el-select>
        </el-form-item>
        <el-form-item label="生效日期" prop="startDate">
          <el-date-picker
            v-model="planForm.startDate"
            type="date"
            placeholder="請選擇日期"
          />
        </el-form-item>
        <el-form-item label="備註" prop="remarks">
          <el-input
            v-model="planForm.remarks"
            type="textarea"
            placeholder="請輸入備註"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitPlan">
            確定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索表单
const searchForm = reactive({
  planId: '',
  status: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 模拟数据
const planList = ref([
  {
    planId: 'P202401001',
    name: '標準定額供款計劃A',
    type: '定額供款',
    startDate: '2024-01-01',
    status: '生效中'
  },
  {
    planId: 'P202401002',
    name: '靈活供款計劃B',
    type: '靈活供款',
    startDate: '2024-02-01',
    status: '待審核'
  },
  {
    planId: 'P202401003',
    name: '企業專屬計劃C',
    type: '定額供款',
    startDate: '2024-03-01',
    status: '已終止'
  }
])

// 对话框相关
const dialogVisible = ref(false)
const dialogType = ref('add')
const planFormRef = ref(null)
const planForm = reactive({
  name: '',
  type: '',
  startDate: '',
  remarks: ''
})

// 表单验证规则
const planRules = {
  name: [{ required: true, message: '請輸入計劃名稱', trigger: 'blur' }],
  type: [{ required: true, message: '請選擇計劃類型', trigger: 'change' }],
  startDate: [{ required: true, message: '請選擇生效日期', trigger: 'change' }]
}

// 状态标签类型
const getStatusType = (status) => {
  const types = {
    '生效中': 'success',
    '待審核': 'warning',
    '已終止': 'danger'
  }
  return types[status] || 'info'
}

// 搜索相关
const handleSearch = () => {
  ElMessage.success('執行搜索')
  // 实现搜索逻辑
}

const resetSearch = () => {
  searchForm.planId = ''
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

// 计划操作相关
const handleAddPlan = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  // 重置表单
  if (planFormRef.value) {
    planFormRef.value.resetFields()
  }
}

const handleView = (row) => {
  ElMessage.info(`查看計劃：${row.name}`)
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  // 填充表单数据
  Object.assign(planForm, row)
}

const handleTerminate = (row) => {
  ElMessageBox.confirm(
    '確定要終止該計劃嗎？此操作不可逆。',
    '警告',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`計劃 ${row.name} 已終止`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleSubmitPlan = () => {
  if (!planFormRef.value) return
  
  planFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(
        dialogType.value === 'add' 
          ? '新增計劃成功' 
          : '更新計劃成功'
      )
      dialogVisible.value = false
    }
  })
}
</script>

<style scoped>
.plan-management {
  padding: 20px;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 