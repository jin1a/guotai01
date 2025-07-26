<template>
  <div class="transfer-application">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>調職申請記錄</span>
        </div>
      </template>

    <!-- 查詢篩選區域 -->
    <div class="query-form">
      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">選擇計劃</span>
          <el-select 
            v-model="searchForm.selectedPlan" 
            placeholder="請選擇計劃"
            class="filter-select"
            @change="onPlanChange"
          >
            <el-option 
              v-for="plan in availablePlans" 
              :key="plan.id"
              :label="plan.name" 
              :value="plan.id" 
            />
          </el-select>
        </div>
        <div class="filter-group">
          <span class="filter-label">僱員編號</span>
          <el-input 
            v-model="searchForm.employeeId" 
            placeholder="請輸入" 
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <span class="filter-label">僱員中文姓名</span>
          <el-input 
            v-model="searchForm.employeeName" 
            placeholder="請輸入" 
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <span class="filter-label">證件編號</span>
          <el-input 
            v-model="searchForm.idCard" 
            placeholder="請輸入" 
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <span class="filter-label">新計劃加入日期</span>
          <el-date-picker 
            v-model="searchForm.transferInDate" 
            type="date"
            placeholder="請選擇"
            class="filter-input"
          />
        </div>
      </div>
      <div class="button-row">
        <div class="left-buttons">
          <el-button @click="resetSearch" class="btn-reset">重置</el-button>
          <el-button type="primary" @click="searchEmployees" class="btn-search">查詢</el-button>
        </div>
        <div class="right-buttons">
          <el-button 
            class="btn-submit" 
            @click="submitBatchTransfer"
            :disabled="selectedEmployees.length === 0"
          >
            批量提交
          </el-button>
          <el-button type="primary" @click="showAddTransferModal">添加僱員</el-button>
          <el-button @click="showBulkImport">批量導入</el-button>
          <el-button @click="downloadTemplate">下載模板</el-button>
        </div>
      </div>
    </div>

    <!-- 員工列表表格 -->
    <div class="employee-table">
      <el-table 
        :data="paginatedEmployees" 
        style="width: 100%"
        :row-class-name="getRowClassName"
        @selection-change="handleSelectionChange"
      >
        <el-table-column 
          type="selection" 
          width="55"
          :selectable="(row) => canSubmit(row.status)"
        />
        <el-table-column prop="originalEmployeeId" label="原僱員編號" min-width="120" />
        <el-table-column prop="employeeName" label="僱員中文姓名" min-width="120" />
        <el-table-column prop="idCard" label="證件號碼" min-width="140" />
        <el-table-column prop="initialHireDate" label="初始受僱日期" min-width="120" />
        <el-table-column prop="transferOutDate" label="原計劃轉出日期" min-width="130" />
        <el-table-column prop="transferInDate" label="新計劃加入日期" min-width="130" />
        <el-table-column prop="newPlanId" label="新計劃編號" min-width="120" />
        <el-table-column prop="newEmployeeCategory" label="新僱員類別" min-width="120" />
        <el-table-column prop="salary" label="僱員薪金" min-width="120">
          <template #default="scope">
            <span v-if="scope.row.salary">{{ formatCurrency(scope.row.salary) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="狀態" min-width="120">
          <template #default="scope">
            <el-tag 
              :type="getStatusType(scope.row.status)"
              size="small"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <div class="table-actions">
              <el-button 
                size="small"
                @click="viewEmployeeDetails(scope.row)"
              >
                查看
              </el-button>
              <el-button 
                v-if="canEdit(scope.row.status)"
                type="primary"
                size="small"
                @click="editEmployee(scope.row)"
              >
                編輯
              </el-button>
              <el-button 
                v-if="canSubmitReview(scope.row.status)"
                type="success"
                size="small"
                @click="submitReview(scope.row)"
              >
                提交審核
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
      <div class="pagination-container">
        <div class="pagination-info">
          共計 {{ filteredEmployees.length }} 筆記錄
        </div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredEmployees.length"
          layout="sizes, prev, pager, next, jumper"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 添加調職僱員對話框 -->
    <el-dialog 
      v-model="addTransferDialogVisible" 
      title="添加僱員" 
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="dialog-header-info">
        <div class="info-item">
          <span class="info-label">計劃編號：</span>
          <span class="info-value">{{ selectedPlan.id }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">計劃名稱：</span>
          <span class="info-value">{{ selectedPlan.name }}</span>
        </div>
      </div>

      <el-form 
        :model="transferEmployeeForm" 
        :rules="transferEmployeeFormRules" 
        ref="transferEmployeeFormRef"
        label-width="120px"
        class="employee-form"
      >
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>
          <div class="form-row">
            <el-form-item label="僱員中文姓名" prop="employeeName" class="form-group">
              <el-autocomplete
                v-model="transferEmployeeForm.employeeName"
                :fetch-suggestions="searchEmployeeByName"
                placeholder="請輸入僱員中文姓名"
                @select="onEmployeeSelect"
                :trigger-on-focus="false"
                clearable
              />
            </el-form-item>
            <el-form-item label="原僱員編號" class="form-group">
              <span class="info-display">{{ transferEmployeeForm.originalEmployeeId || '請輸入僱員中文姓名後自動顯示' }}</span>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="證件號碼" class="form-group">
              <span class="info-display">{{ transferEmployeeForm.idCard || '請輸入僱員中文姓名後自動顯示' }}</span>
            </el-form-item>
            <el-form-item label="初始受僱日期" class="form-group">
              <span class="info-display">{{ transferEmployeeForm.initialHireDate || '請輸入僱員中文姓名後自動顯示' }}</span>
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">調職信息</h4>
          <div class="form-row">
            <el-form-item label="原計劃轉出日期" prop="transferOutDate" class="form-group">
              <el-date-picker 
                v-model="transferEmployeeForm.transferOutDate" 
                type="date"
                placeholder="請選擇原計劃轉出日期"
              />
            </el-form-item>
            <el-form-item label="新計劃加入日期" prop="transferInDate" class="form-group">
              <el-date-picker 
                v-model="transferEmployeeForm.transferInDate" 
                type="date"
                placeholder="請選擇新計劃加入日期"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="新計劃編號" prop="newPlanId" class="form-group">
              <el-input 
                v-model="transferEmployeeForm.newPlanId" 
                placeholder="請輸入新計劃編號"
              />
            </el-form-item>
            <el-form-item label="新僱員類別" prop="newEmployeeCategory" class="form-group">
              <el-select v-model="transferEmployeeForm.newEmployeeCategory" placeholder="請選擇新僱員類別">
                <el-option label="A類" value="A類" />
                <el-option label="B類" value="B類" />
                <el-option label="C類" value="C類" />
                <el-option label="D類" value="D類" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="僱員薪金" prop="salary" class="form-group">
              <el-input 
                v-model="transferEmployeeForm.salary" 
                placeholder="請輸入僱員薪金"
                type="number"
                :min="0"
                :step="100"
              />
            </el-form-item>
            <div class="form-group">
              <!-- 占位，保持布局平衡 -->
            </div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addTransferDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddTransferEmployee">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 查看僱員對話框 -->
    <el-dialog 
      v-model="viewEmployeeDialogVisible" 
      title="查看僱員" 
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="dialog-header-info">
        <div class="info-item">
          <span class="info-label">計劃編號：</span>
          <span class="info-value">{{ selectedPlan.id }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">計劃名稱：</span>
          <span class="info-value">{{ selectedPlan.name }}</span>
        </div>
      </div>

      <el-form class="employee-form">
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>
          <div class="form-row">
            <el-form-item label="原僱員編號" class="form-group">
              <span class="info-display">{{ currentViewEmployee?.originalEmployeeId || '-' }}</span>
            </el-form-item>
            <el-form-item label="僱員中文姓名" class="form-group">
              <span class="info-display">{{ currentViewEmployee?.employeeName || '-' }}</span>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="證件號碼" class="form-group">
              <span class="info-display">{{ currentViewEmployee?.idCard || '-' }}</span>
            </el-form-item>
            <el-form-item label="初始受僱日期" class="form-group">
              <span class="info-display">{{ currentViewEmployee?.initialHireDate || '-' }}</span>
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">調職信息</h4>
          <div class="form-row">
            <el-form-item label="原計劃轉出日期" class="form-group">
              <span class="info-display">{{ currentViewEmployee?.transferOutDate || '-' }}</span>
            </el-form-item>
            <el-form-item label="新計劃加入日期" class="form-group">
              <span class="info-display">{{ currentViewEmployee?.transferInDate || '-' }}</span>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="新計劃編號" class="form-group">
              <span class="info-display">{{ currentViewEmployee?.newPlanId || '-' }}</span>
            </el-form-item>
            <el-form-item label="新僱員類別" class="form-group">
              <span class="info-display">{{ currentViewEmployee?.newEmployeeCategory || '-' }}</span>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="僱員薪金" class="form-group">
              <span class="info-display">{{ currentViewEmployee?.salary ? formatCurrency(currentViewEmployee.salary) : '-' }}</span>
            </el-form-item>
            <div class="form-group">
              <!-- 占位，保持布局平衡 -->
            </div>
          </div>
          <div class="form-row" v-if="currentViewEmployee?.failureReason">
            <el-form-item label="失敗原因" class="form-group">
              <span class="info-display failure-reason">{{ currentViewEmployee.failureReason }}</span>
            </el-form-item>
            <div class="form-group">
              <!-- 占位，保持布局平衡 -->
            </div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="viewEmployeeDialogVisible = false">關閉</el-button>
          <el-button 
            v-if="canEdit(currentViewEmployee?.status)"
            type="primary" 
            @click="switchToEditMode"
          >
            編輯
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 編輯僱員對話框 -->
    <el-dialog 
      v-model="editEmployeeDialogVisible" 
      title="編輯僱員" 
      width="800px"
      :close-on-click-modal="false"
    >
      <div class="dialog-header-info">
        <div class="info-item">
          <span class="info-label">計劃編號：</span>
          <span class="info-value">{{ selectedPlan.id }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">計劃名稱：</span>
          <span class="info-value">{{ selectedPlan.name }}</span>
        </div>
      </div>

      <el-form 
        :model="editEmployeeForm" 
        :rules="editEmployeeFormRules" 
        ref="editEmployeeFormRef"
        label-width="120px"
        class="employee-form"
      >
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>
          <div class="form-row">
            <el-form-item label="原僱員編號" class="form-group">
              <span class="info-display">{{ editEmployeeForm.originalEmployeeId || '-' }}</span>
            </el-form-item>
            <el-form-item label="僱員中文姓名" prop="employeeName" class="form-group">
              <el-input 
                v-model="editEmployeeForm.employeeName" 
                placeholder="請輸入僱員中文姓名"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="證件號碼" class="form-group">
              <span class="info-display">{{ editEmployeeForm.idCard || '-' }}</span>
            </el-form-item>
            <el-form-item label="初始受僱日期" class="form-group">
              <span class="info-display">{{ editEmployeeForm.initialHireDate || '-' }}</span>
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">調職信息</h4>
          <div class="form-row">
            <el-form-item label="原計劃轉出日期" prop="transferOutDate" class="form-group">
              <el-date-picker 
                v-model="editEmployeeForm.transferOutDate" 
                type="date"
                placeholder="請選擇原計劃轉出日期"
              />
            </el-form-item>
            <el-form-item label="新計劃加入日期" prop="transferInDate" class="form-group">
              <el-date-picker 
                v-model="editEmployeeForm.transferInDate" 
                type="date"
                placeholder="請選擇新計劃加入日期"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="新計劃編號" prop="newPlanId" class="form-group">
              <el-input 
                v-model="editEmployeeForm.newPlanId" 
                placeholder="請輸入新計劃編號"
              />
            </el-form-item>
            <el-form-item label="新適用對象" prop="newEmployeeCategory" class="form-group">
              <el-select v-model="editEmployeeForm.newEmployeeCategory" placeholder="請選擇新適用對象">
                <el-option label="A類" value="A類" />
                <el-option label="B類" value="B類" />
                <el-option label="C類" value="C類" />
                <el-option label="D類" value="D類" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="僱員薪金" prop="salary" class="form-group">
              <el-input 
                v-model="editEmployeeForm.salary" 
                placeholder="請輸入僱員薪金"
                type="number"
                :min="0"
                :step="100"
              />
            </el-form-item>
            <div class="form-group">
              <!-- 占位，保持布局平衡 -->
            </div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editEmployeeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmEditEmployee">保存</el-button>
        </div>
      </template>
    </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 響應式數據
const searchForm = reactive({
  selectedPlan: 'GR001AA', // 默认选中第一个计划
  employeeId: '',
  employeeName: '',
  idCard: '',
  transferInDate: ''
})

// 可用计划列表
const availablePlans = ref([
  {
    id: 'GR001AA',
    name: 'GR001AA 集團統一央積金共同計劃',
    employerName: '中國人壽集團公司',
    activeMembers: 2569,
    transferring: 8
  },
  {
    id: 'GR002BB',
    name: 'GR002BB 企業央積金計劃',
    employerName: '中國人壽集團公司',
    activeMembers: 1850,
    transferring: 6
  },
  {
    id: 'GR003CC',
    name: 'GR003CC 專業人士央積金計劃',
    employerName: '中國人壽集團公司',
    activeMembers: 950,
    transferring: 4
  }
])

const selectedPlan = reactive({
  id: 'GR001AA',
  name: 'GR001AA 集團統一央積金共同計劃',
  employerName: '中國人壽集團公司',
  transferEffectiveDate: '2025-03-01',
  transferring: 8
})

const addTransferDialogVisible = ref(false)
const viewEmployeeDialogVisible = ref(false)
const editEmployeeDialogVisible = ref(false)
const currentViewEmployee = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const editEmployeeFormRef = ref()
const selectedEmployees = ref([])

// 所有员工数据，按计划分组
const allTransferEmployeesData = ref({
  'GR001AA': [
    {
      originalEmployeeId: 'EMP001',
      employeeName: '陳志明',
      idCard: '1234567890',
      initialHireDate: '2022/01/15',
      transferOutDate: '2024/12/31',
      transferInDate: '2025/01/01',
      newPlanId: 'GR002BB',
      newEmployeeCategory: 'B類',
      salary: 25000,
      newEmployeeId: 'EMP301',
      transferReason: '部門調動',
      status: '待提交審核',
      failureReason: ''
    },
    {
      originalEmployeeId: 'EMP002',
      employeeName: '李小紅',
      idCard: '2345678901',
      initialHireDate: '2023/03/20',
      transferOutDate: '2024/12/30',
      transferInDate: '2025/01/02',
      newPlanId: 'GR003CC',
      newEmployeeCategory: 'C類',
      salary: 22000,
      newEmployeeId: 'EMP302',
      transferReason: '職位晉升',
      status: '已調職',
      failureReason: '計劃編號不符'
    },
    {
      originalEmployeeId: 'EMP003',
      employeeName: '王志強',
      idCard: '3456789012',
      initialHireDate: '2021/08/10',
      transferOutDate: '2024/11/15',
      transferInDate: '2025/01/03',
      newPlanId: 'GR004DD',
      newEmployeeCategory: 'A類',
      salary: 28000,
      newEmployeeId: 'EMP303',
      transferReason: '工作需要',
      status: '審核中',
      failureReason: ''
    }
  ],
  'GR002BB': [
    {
      originalEmployeeId: 'EMP004',
      employeeName: '張美麗',
      idCard: '4567890123',
      initialHireDate: '2022/05/12',
      transferOutDate: '2024/10/20',
      transferInDate: '2025/01/04',
      newPlanId: 'GR005EE',
      newEmployeeCategory: 'B類',
      salary: 24000,
      newEmployeeId: 'EMP304',
      transferReason: '其他',
      status: '已調職',
      failureReason: '文件不完整'
    },
    {
      originalEmployeeId: 'EMP005',
      employeeName: '劉建國',
      idCard: '5678901234',
      initialHireDate: '2020/12/01',
      transferOutDate: '2024/09/30',
      transferInDate: '2025/01/05',
      newPlanId: 'GR006FF',
      newEmployeeCategory: 'C類',
      salary: 30000,
      newEmployeeId: 'EMP305',
      transferReason: '部門調動',
      status: '已調職',
      failureReason: ''
    }
  ],
  'GR003CC': [
    {
      originalEmployeeId: 'EMP006',
      employeeName: '周文華',
      idCard: '6789012345',
      initialHireDate: '2023/02/15',
      transferOutDate: '2025/01/15',
      transferInDate: '2025/02/01',
      newPlanId: 'GR001AA',
      newEmployeeCategory: 'A類',
      salary: 35000,
      newEmployeeId: 'EMP306',
      transferReason: '部門重組',
      status: '待提交審核',
      failureReason: ''
    }
  ]
})

// 当前计划下的员工
const transferEmployeeList = ref([])

const transferEmployees = ref([
  {
    originalEmployeeId: '',
    name: '',
    idCard: '',
    initialHireDate: '',
    transferOutDate: '',
    transferInDate: '',
    newPlanId: '',
    newPlan: '',
    newEmployeeId: '',
    transferReason: ''
  }
])

const transferEmployeeForm = reactive({
  originalEmployeeId: '',
  employeeName: '',
  idCard: '',
  initialHireDate: '',
  transferOutDate: '',
  transferInDate: '',
  newPlanId: '',
  newEmployeeCategory: '',
  salary: ''
})

const transferEmployeeFormRef = ref()

const transferEmployeeFormRules = reactive({
  employeeName: [
    { required: true, message: '請輸入僱員中文姓名', trigger: 'blur' }
  ],
  transferOutDate: [
    { required: true, message: '請選擇原計劃轉出日期', trigger: 'change' }
  ],
  transferInDate: [
    { required: true, message: '請選擇新計劃加入日期', trigger: 'change' }
  ],
  newPlanId: [
    { required: true, message: '請輸入新計劃編號', trigger: 'blur' }
  ],
  newEmployeeCategory: [
    { required: true, message: '請選擇新僱員類別', trigger: 'change' }
  ],
  salary: [
    { required: true, message: '請輸入僱員薪金', trigger: 'blur' }
  ]
})

const filteredEmployees = ref([])

const editEmployeeForm = reactive({
  originalEmployeeId: '',
  employeeName: '',
  idCard: '',
  initialHireDate: '',
  transferOutDate: '',
  transferInDate: '',
  newPlanId: '',
  newEmployeeCategory: '',
  newEmployeeId: '',
  transferReason: '',
  salary: ''
})

const editEmployeeFormRules = reactive({
  employeeName: [
    { required: true, message: '請輸入僱員中文姓名', trigger: 'blur' }
  ],
  transferOutDate: [
    { required: true, message: '請選擇原計劃轉出日期', trigger: 'change' }
  ],
  transferInDate: [
    { required: true, message: '請選擇新計劃加入日期', trigger: 'change' }
  ],
  newPlanId: [
    { required: true, message: '請輸入新計劃編號', trigger: 'blur' }
  ],
  newEmployeeCategory: [
    { required: true, message: '請選擇新僱員類別', trigger: 'change' }
  ],
  salary: [
    { required: true, message: '請輸入僱員薪金', trigger: 'blur' }
  ]
})

// 計算屬性
const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredEmployees.value.slice(start, end)
})

// 方法

function searchEmployees() {
  const { employeeId, employeeName, idCard, transferInDate } = searchForm
  
  filteredEmployees.value = transferEmployeeList.value.filter(employee => {
    const matchEmployeeId = !employeeId || employee.originalEmployeeId.includes(employeeId)
    const matchEmployeeName = !employeeName || employee.employeeName.includes(employeeName)
    const matchIdCard = !idCard || employee.idCard.includes(idCard)
    const matchTransferInDate = !transferInDate || employee.transferInDate === transferInDate
    
    return matchEmployeeId && matchEmployeeName && matchIdCard && matchTransferInDate
  })
  
  currentPage.value = 1
}

// 计划变更处理函数
function onPlanChange(planId) {
  updateSelectedPlan(planId)
  loadEmployeesByPlan(planId)
  
  // 清空其他筛选条件
  searchForm.employeeId = ''
  searchForm.employeeName = ''
  searchForm.idCard = ''
  searchForm.transferInDate = ''
}

// 更新选中的计划信息
function updateSelectedPlan(planId) {
  const plan = availablePlans.value.find(p => p.id === planId)
  if (plan) {
    Object.assign(selectedPlan, plan)
  }
}

// 根据计划ID加载员工数据（模拟功能）
function loadEmployeesByPlan(planId) {
  if (planId && allTransferEmployeesData.value[planId]) {
    transferEmployeeList.value = [...allTransferEmployeesData.value[planId]]
  } else {
    transferEmployeeList.value = []
  }
  filteredEmployees.value = [...transferEmployeeList.value]
  currentPage.value = 1
}

function resetSearch() {
  // 保持选中的计划，只清空其他筛选条件
  const currentPlan = searchForm.selectedPlan
  Object.keys(searchForm).forEach(key => {
    if (key !== 'selectedPlan') {
      searchForm[key] = ''
    }
  })
  filteredEmployees.value = transferEmployeeList.value
  currentPage.value = 1
}


function getStatusType(status) {
  const statusMap = {
    '待提交審核': 'warning',
    '審核中': 'primary',
    '已調職': 'success'
  }
  return statusMap[status] || 'info'
}

function getReasonType(reason) {
  const reasonMap = {
    '部門調動': 'primary',
    '職位晉升': 'success',
    '工作需要': 'warning',
    '其他': 'info'
  }
  return reasonMap[reason] || 'info'
}

function getReasonText(reason) {
  return reason || '未設置'
}

function getRowClassName({ row }) {
  switch (row.status) {
    case '已調職':
      return 'success-row'
    case '待提交審核':
      return 'warning-row'
    case '審核中':
      return 'info-row'
    default:
      return ''
  }
}

function canEdit(status) {
  return status === '待提交審核'
}

function canSubmit(status) {
  return status === '待提交審核'
}

function canSubmitReview(status) {
  return status === '待提交審核'
}

// 處理表格選擇變更
function handleSelectionChange(selection) {
  selectedEmployees.value = selection
}

// 批量提交調職申請
function submitBatchTransfer() {
  if (selectedEmployees.value.length === 0) {
    ElMessage.warning('請先選擇要提交的員工')
    return
  }
  
  ElMessageBox.confirm(
    `確定要提交 ${selectedEmployees.value.length} 位員工的調職申請嗎？`,
    '確認提交',
    {
      confirmButtonText: '確定提交',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 更新選中員工的狀態
    selectedEmployees.value.forEach(employee => {
      const index = transferEmployeeList.value.findIndex(emp => emp.originalEmployeeId === employee.originalEmployeeId)
      if (index !== -1) {
        transferEmployeeList.value[index].status = '審核中'
      }
    })
    
    // 記錄提交數量
    const submittedCount = selectedEmployees.value.length
    
    // 清空選擇
    selectedEmployees.value = []
    
    ElMessage.success(`成功提交 ${submittedCount} 位員工的調職申請`)
  }).catch(() => {
    ElMessage.info('已取消提交')
  })
}

function showAddTransferModal() {
  resetTransferEmployeeForm()
  addTransferDialogVisible.value = true
}

function resetTransferEmployeeForm() {
  if (transferEmployeeFormRef.value) {
    transferEmployeeFormRef.value.resetFields()
  }
  Object.keys(transferEmployeeForm).forEach(key => {
    transferEmployeeForm[key] = ''
  })
}

// 僱員中文姓名輸入後的反顯邏輯
function onEmployeeNameChange() {
  const employeeName = transferEmployeeForm.employeeName
  if (employeeName && employeeName.trim()) {
    // 模擬根據僱員中文姓名查詢僱員信息的邏輯
    const mockEmployeeData = getMockEmployeeByName(employeeName)
    if (mockEmployeeData) {
      transferEmployeeForm.originalEmployeeId = mockEmployeeData.originalEmployeeId
      transferEmployeeForm.idCard = mockEmployeeData.idCard
      transferEmployeeForm.initialHireDate = mockEmployeeData.initialHireDate
    } else {
      // 如果找不到對應僱員，清空其他字段
      transferEmployeeForm.originalEmployeeId = ''
      transferEmployeeForm.idCard = ''
      transferEmployeeForm.initialHireDate = ''
    }
  } else {
    // 清空其他字段
    transferEmployeeForm.originalEmployeeId = ''
    transferEmployeeForm.idCard = ''
    transferEmployeeForm.initialHireDate = ''
  }
}

// 模擬根據僱員中文姓名查詢僱員數據
function getMockEmployeeByName(employeeName) {
  // 模擬僱員數據庫
  const mockEmployees = [
    {
      originalEmployeeId: 'EMP001',
      employeeName: '陳志明',
      idCard: '1234567890',
      initialHireDate: '2022-01-15'
    },
    {
      originalEmployeeId: 'EMP002',
      employeeName: '李小紅',
      idCard: '2345678901',
      initialHireDate: '2023-03-20'
    },
    {
      originalEmployeeId: 'EMP003',
      employeeName: '王志強',
      idCard: '3456789012',
      initialHireDate: '2021-08-10'
    },
    {
      originalEmployeeId: 'EMP004',
      employeeName: '張美麗',
      idCard: '4567890123',
      initialHireDate: '2022-05-12'
    },
    {
      originalEmployeeId: 'EMP005',
      employeeName: '劉建國',
      idCard: '5678901234',
      initialHireDate: '2020-12-01'
    }
  ]
  
  return mockEmployees.find(emp => emp.employeeName === employeeName)
}

function confirmAddTransferEmployee() {
  if (!transferEmployeeFormRef.value) return
  
  transferEmployeeFormRef.value.validate((valid) => {
    if (valid) {
      const newEmployee = {
        originalEmployeeId: transferEmployeeForm.originalEmployeeId,
        employeeName: transferEmployeeForm.employeeName,
        idCard: transferEmployeeForm.idCard,
        initialHireDate: transferEmployeeForm.initialHireDate,
        transferOutDate: transferEmployeeForm.transferOutDate,
        transferInDate: transferEmployeeForm.transferInDate,
        newPlanId: transferEmployeeForm.newPlanId,
        newEmployeeCategory: transferEmployeeForm.newEmployeeCategory,
        salary: transferEmployeeForm.salary,
        newEmployeeId: 'AUTO-' + Date.now(), // 自動生成編號
        transferReason: '系統調職', // 設置默認值
        status: '待提交審核',
        failureReason: ''
      }
      
      transferEmployeeList.value.push(newEmployee)
      filteredEmployees.value = transferEmployeeList.value
      addTransferDialogVisible.value = false
      resetTransferEmployeeForm()
      
      ElMessage.success('僱員添加成功')
    } else {
      ElMessage.error('請完善必填信息')
    }
  })
}

function addTransferEmployee() {
  transferEmployees.value.push({
    originalEmployeeId: '',
    name: '',
    idCard: '',
    initialHireDate: '',
    transferOutDate: '',
    transferInDate: '',
    newPlanId: '',
    newPlan: '',
    newEmployeeId: '',
    transferReason: ''
  })
}

function removeEmployee(index) {
  if (transferEmployees.value.length > 1) {
    transferEmployees.value.splice(index, 1)
  } else {
    ElMessage.warning('至少需要保留一個僱員')
  }
}

function updateEmployee(index, field, value) {
  transferEmployees.value[index][field] = value
}

function submitTransferBatch() {
  // 驗證數據
  const validEmployees = transferEmployees.value.filter(emp => 
    emp.originalEmployeeId && emp.name && emp.idCard && 
    emp.transferOutDate && emp.transferInDate && emp.newPlanId
  )
  
  if (validEmployees.length === 0) {
    ElMessage.error('請至少添加一個有效的僱員信息')
    return
  }
  
  ElMessageBox.confirm(
    `確定要提交 ${validEmployees.length} 個僱員的調職申請嗎？`,
    '確認提交',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取洨',
      type: 'warning'
    }
  ).then(() => {
    // 添加到僱員列表
    validEmployees.forEach(emp => {
      const newEmployee = {
        originalEmployeeId: emp.originalEmployeeId,
        employeeName: emp.name,
        idCard: emp.idCard,
        initialHireDate: emp.initialHireDate,
        transferOutDate: emp.transferOutDate,
        transferInDate: emp.transferInDate,
        newPlanId: emp.newPlanId,
        newEmployeeCategory: emp.newEmployeeCategory,
        newEmployeeId: emp.newEmployeeId,
        transferReason: emp.transferReason,
        status: '待提交審核',
        failureReason: ''
      }
      transferEmployeeList.value.push(newEmployee)
    })
    
    filteredEmployees.value = transferEmployeeList.value
    addTransferDialogVisible.value = false
    
    ElMessage.success('調職申請已提交複核')
  }).catch(() => {
    ElMessage.info('已取消提交')
  })
}

function viewEmployeeDetails(employee) {
  currentViewEmployee.value = { ...employee }
  viewEmployeeDialogVisible.value = true
}

function editEmployee(employee) {
  currentViewEmployee.value = { ...employee }
  fillEditEmployeeForm(employee)
  editEmployeeDialogVisible.value = true
}

function fillEditEmployeeForm(employee) {
  editEmployeeForm.originalEmployeeId = employee.originalEmployeeId
  editEmployeeForm.employeeName = employee.employeeName
  editEmployeeForm.idCard = employee.idCard
  editEmployeeForm.initialHireDate = employee.initialHireDate
  editEmployeeForm.transferOutDate = employee.transferOutDate
  editEmployeeForm.transferInDate = employee.transferInDate
  editEmployeeForm.newPlanId = employee.newPlanId
  editEmployeeForm.newEmployeeCategory = employee.newEmployeeCategory
  editEmployeeForm.newEmployeeId = employee.newEmployeeId
  editEmployeeForm.transferReason = employee.transferReason
  editEmployeeForm.salary = employee.salary
}

function switchToEditMode() {
  viewEmployeeDialogVisible.value = false
  fillEditEmployeeForm(currentViewEmployee.value)
  editEmployeeDialogVisible.value = true
}

function resetEditEmployeeForm() {
  if (editEmployeeFormRef.value) {
    editEmployeeFormRef.value.resetFields()
  }
  if (currentViewEmployee.value) {
    fillEditEmployeeForm(currentViewEmployee.value)
  }
}

function confirmEditEmployee() {
  if (!editEmployeeFormRef.value) return
  
  editEmployeeFormRef.value.validate((valid) => {
    if (valid) {
      // 更新僱員數據
      const index = transferEmployeeList.value.findIndex(emp => emp.originalEmployeeId === editEmployeeForm.originalEmployeeId)
      if (index !== -1) {
        transferEmployeeList.value[index] = {
          ...transferEmployeeList.value[index],
          employeeName: editEmployeeForm.employeeName,
          transferOutDate: editEmployeeForm.transferOutDate,
          transferInDate: editEmployeeForm.transferInDate,
          newPlanId: editEmployeeForm.newPlanId,
          newEmployeeCategory: editEmployeeForm.newEmployeeCategory,
          newEmployeeId: editEmployeeForm.newEmployeeId,
          transferReason: editEmployeeForm.transferReason,
          salary: editEmployeeForm.salary
        }
        
        filteredEmployees.value = transferEmployeeList.value
        editEmployeeDialogVisible.value = false
        ElMessage.success('僱員信息更新成功')
      }
    } else {
      ElMessage.error('請完善必填信息')
    }
  })
}

function submitReview(employee) {
  ElMessageBox.confirm(
    `確定要提交 ${employee.employeeName} 的調職申請進行審核嗎？`,
    '提交審核',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    employee.status = '審核中'
    ElMessage.success('已提交審核，等待審核結果')
  }).catch(() => {
    ElMessage.info('已取消提交')
  })
}

function previewSubmission() {
  const validEmployees = transferEmployees.value.filter(emp => 
    emp.originalEmployeeId && emp.name && emp.idCard
  )
  
  let previewText = `調職申請預覽\n\n`
  previewText += `調職人數：${validEmployees.length}\n\n`
  previewText += `僱員列表：\n`
  
  validEmployees.forEach((emp, index) => {
    previewText += `${index + 1}. ${emp.name} (${emp.originalEmployeeId}) → ${emp.newPlan || '未設定'}\n`
  })
  
  ElMessageBox.alert(previewText, '提交預覽', {
    confirmButtonText: '確定'
  })
}

function showBulkImport() {
  ElMessage.info('批量導入功能開發中...')
}

function batchImportEmployees() {
  ElMessage.info('批量導入功能開發中...')
}

function downloadTemplate() {
  downloadEmployeeTemplate()
}

function downloadEmployeeTemplate() {
  const csvContent = "原僱員編號,僱員姓名,證件號碼,初始受僱日期,原計劃轉出日期,新計劃加入日期,新計劃編號,新僱員類別,僱員薪金\n" +
                   "EMP201,周文偉,2345678901,2022/03/15,2025/01/31,2025/02/01,GR002BB,B類,26000"
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', '調職僱員模板.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function exportData() {
  ElMessage.info('匯出功能開發中...')
}

function handleSizeChange(newSize) {
  pageSize.value = newSize
  currentPage.value = 1
}

function handleCurrentChange(newPage) {
  currentPage.value = newPage
}


function formatCurrency(amount) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'MOP',
    minimumFractionDigits: 0
  }).format(amount)
}

// 初始化函数
function initEmployees() {
  // 初始化时设置默认计划
  if (availablePlans.value.length > 0) {
    const defaultPlan = availablePlans.value[0]
    searchForm.selectedPlan = defaultPlan.id
    updateSelectedPlan(defaultPlan.id)
    loadEmployeesByPlan(defaultPlan.id)
  }
  
  filteredEmployees.value = transferEmployeeList.value
}

// 僱員姓名搜索功能
function searchEmployeeByName(queryString, cb) {
  // 模擬僱員數據庫
  const allEmployees = [
    {
      value: '陳大文',
      employeeId: 'EMP001',
      idNumber: '1234567890',
      hireDate: '2022-01-15',
      currentPosition: '高級經理',
      currentDepartment: '销售部'
    },
    {
      value: '李小紅',
      employeeId: 'EMP002', 
      idNumber: '2345678901',
      hireDate: '2023-03-20',
      currentPosition: '主管',
      currentDepartment: '財務部'
    },
    {
      value: '王志強',
      employeeId: 'EMP003',
      idNumber: '3456789012', 
      hireDate: '2021-08-10',
      currentPosition: '經理',
      currentDepartment: '人事部'
    },
    {
      value: '張美麗',
      employeeId: 'EMP004',
      idNumber: '4567890123',
      hireDate: '2022-05-12',
      currentPosition: '組長',
      currentDepartment: '行政部'
    }
  ]
  
  const results = queryString 
    ? allEmployees.filter(employee => 
        employee.value.toLowerCase().includes(queryString.toLowerCase())
      )
    : allEmployees
  
  cb(results)
}

// 選擇僱員後的處理
function onEmployeeSelect(item) {
  transferEmployeeForm.originalEmployeeId = item.employeeId
  transferEmployeeForm.idCard = item.idNumber
  transferEmployeeForm.initialHireDate = item.hireDate
  transferEmployeeForm.currentPosition = item.currentPosition
  transferEmployeeForm.currentDepartment = item.currentDepartment
}

// 組件掛載時初始化
onMounted(() => {
  initEmployees()
})
</script>

<style scoped>
.transfer-application {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 卡片容器 */
.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.plan-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.plan-info-item {
  display: flex;
  flex-direction: column;
}

.plan-info-label {
  color: #666;
  font-size: 14px;
  margin-bottom: 5px;
}

.plan-info-value {
  font-weight: bold;
  font-size: 16px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  border-bottom: 2px solid #40a98f;
  padding-bottom: 5px;
  display: inline-block;
}

.action-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-filters {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.query-form {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  margin-bottom: 15px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-label {
  margin-bottom: 5px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.filter-input,
.filter-select {
  width: 100%;
}

.button-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.left-buttons {
  display: flex;
  gap: 10px;
}

.right-buttons {
  display: flex;
  gap: 10px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.employee-table {
  margin-bottom: 20px;
}

.batch-link {
  color: #f39c12;
  font-weight: bold;
}

.failure-reason {
  color: #f5222d;
  font-size: 12px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-top: 1px solid #e9ecef;
}

.pagination-info {
  color: #666;
  font-size: 14px;
}

.dialog-header-info {
  display: flex;
  gap: 40px;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
  align-items: center;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  color: #636e72;
  font-weight: 500;
  font-size: 14px;
}

.info-value {
  color: #2d3436;
  font-weight: bold;
  font-size: 14px;
}

.employee-section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  color: #2d3436;
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  border-bottom: 2px solid #40a98f;
  padding-bottom: 5px;
}

.section-buttons {
  display: flex;
  gap: 10px;
}

.editable-table-container {
  margin-bottom: 20px;
  overflow-x: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.batch-detail {
  margin-bottom: 20px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-title {
  color: #2d3436;
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 15px 0;
  border-bottom: 2px solid #40a98f;
  padding-bottom: 5px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-label {
  color: #666;
  font-weight: 500;
  min-width: 80px;
}

.detail-value {
  color: #333;
  font-weight: bold;
}

.detail-value.error {
  color: #f5222d;
}

.el-table .error-row {
  background-color: #fff2f0;
}

.el-table .success-row {
  background-color: #f6ffed;
}

.el-table .warning-row {
  background-color: #fffbe6;
}

.transfer-dialog .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
}

.btn-reset {
  background: #ffffff;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-reset:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.btn-search {
  background: #409eff;
  color: white;
  border: 1px solid #409eff;
}

.btn-search:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

/* 批量提交按鈕樣式 */
.btn-submit {
  background: #67c23a;
  color: white;
  border: 1px solid #67c23a;
}

.btn-submit:hover {
  background: #85ce61;
  border-color: #85ce61;
  color: white;
}

.btn-submit:disabled {
  background: #c0c4cc;
  border-color: #c0c4cc;
  color: #ffffff;
  cursor: not-allowed;
}


.info-display {
  display: inline-block;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #606266;
  font-size: 14px;
  min-height: 32px;
  line-height: 1.5;
  width: 100%;
  box-sizing: border-box;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  width: 100%;
}

.form-label {
  display: block;
  margin-bottom: 5px;
  color: #333;
  font-size: 14px;
  font-weight: 500;
}

.employee-form {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 10px;
}

.form-section {
  margin-bottom: 25px;
  padding: 20px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fafbfc;
}

.section-title {
  color: #2d3436;
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #40a98f;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 25px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

/* Element Plus 样式优化 */
:deep(.el-table th) {
  background-color: #fafafa !important;
  color: #303133 !important;
  font-weight: 500 !important;
  border-bottom: 1px solid #ebeef5 !important;
}

:deep(.el-table td) {
  border-bottom: 1px solid #ebeef5 !important;
  padding: 12px 0 !important;
}

:deep(.el-table tr:hover > td) {
  background-color: #f5f7fa !important;
}

/* 按鈕優化 */
:deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

:deep(.el-button--primary:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

:deep(.el-button--default) {
  background-color: #ffffff;
  border-color: #dcdfe6;
  color: #606266;
}

:deep(.el-button--default:hover) {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

/* 標籤優化 */
:deep(.el-tag) {
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
}

:deep(.el-tag--success) {
  background-color: #f0f9ff;
  border-color: #e1f5fe;
  color: #67c23a;
}

:deep(.el-tag--warning) {
  background-color: #fdf6ec;
  border-color: #faecd8;
  color: #e6a23c;
}

:deep(.el-tag--danger) {
  background-color: #fef0f0;
  border-color: #fde2e2;
  color: #f56c6c;
}

:deep(.el-tag--info) {
  background-color: #f4f4f5;
  border-color: #e9e9eb;
  color: #909399;
}

:deep(.el-tag--primary) {
  background-color: #e1f3ff;
  border-color: #b8e0ff;
  color: #409eff;
}

/* 批量提交按鈕樣式 */
.btn-submit {
  background: #67c23a;
  color: white;
  border: 1px solid #67c23a;
}

.btn-submit:hover {
  background: #85ce61;
  border-color: #85ce61;
  color: white;
}

.btn-submit:disabled {
  background: #c0c4cc;
  border-color: #c0c4cc;
  color: #ffffff;
  cursor: not-allowed;
}

/* 表格操作按鈕樣式 */
.table-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.table-actions .el-button {
  margin: 0;
  min-width: auto;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .button-row {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .left-buttons,
  .right-buttons {
    justify-content: center;
  }
  
  .right-buttons {
    flex-wrap: wrap;
  }
}
</style>