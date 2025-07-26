<template>
  <div class="salary-adjustment">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>薪資調整申請記錄</span>
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
          <span class="filter-label">生效日期</span>
          <el-date-picker 
            v-model="searchForm.effectiveDate" 
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
            @click="submitBatchAdjustment"
            :disabled="selectedEmployees.length === 0"
          >
            批量提交
          </el-button>
          <el-button type="primary" @click="showAddAdjustmentModal">添加僱員</el-button>
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
        <el-table-column prop="originalEmployeeId" label="僱員編號" min-width="120" />
        <el-table-column prop="employeeName" label="僱員中文姓名" min-width="120" />
        <el-table-column prop="idCard" label="證件號碼" min-width="140" />
        <el-table-column prop="planCode" label="計劃" min-width="120">
          <template #default="scope">
            <span>{{ scope.row.planCode || selectedPlan.id }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="oldSalary" label="原僱員薪金" min-width="120">
          <template #default="scope">
            <span v-if="scope.row.oldSalary">{{ formatCurrency(scope.row.oldSalary) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="newSalary" label="新僱員薪金" min-width="120">
          <template #default="scope">
            <span v-if="scope.row.newSalary" class="highlight-text">{{ formatCurrency(scope.row.newSalary) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="effectiveDate" label="生效日期" min-width="120" />
        <el-table-column prop="status" label="狀態" min-width="90">
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
                v-if="canSubmit(scope.row.status)"
                type="success"
                size="small"
                @click="submitEmployee(scope.row)"
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

    <!-- 添加薪資調整僱員對話框 -->
    <el-dialog 
      v-model="addAdjustmentDialogVisible" 
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
        :model="adjustmentEmployeeForm" 
        :rules="adjustmentEmployeeFormRules" 
        ref="adjustmentEmployeeFormRef"
        label-width="120px"
        class="employee-form"
      >
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>
          <div class="form-row">
            <el-form-item label="僱員中文姓名" prop="employeeName" class="form-group">
              <el-autocomplete
                v-model="adjustmentEmployeeForm.employeeName"
                :fetch-suggestions="searchEmployeeByName"
                placeholder="請輸入僱員中文姓名"
                @select="onEmployeeSelect"
                :trigger-on-focus="false"
                clearable
              />
            </el-form-item>
            <el-form-item label="原僱員編號" class="form-group">
              <span class="info-display">{{ adjustmentEmployeeForm.originalEmployeeId || '請輸入僱員中文姓名後自動顯示' }}</span>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="證件號碼" class="form-group">
              <span class="info-display">{{ adjustmentEmployeeForm.idCard || '請輸入僱員中文姓名後自動顯示' }}</span>
            </el-form-item>
            <el-form-item label="初始受聘日期" class="form-group">
              <span class="info-display">{{ adjustmentEmployeeForm.hireDate || '請輸入僱員中文姓名後自動顯示' }}</span>
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">薪資調整信息</h4>
          <div class="form-row">
            <el-form-item label="原僱員薪金" class="form-group">
              <span class="info-display">{{ adjustmentEmployeeForm.oldSalary ? formatCurrency(adjustmentEmployeeForm.oldSalary) : '請輸入僱員中文姓名後自動顯示' }}</span>
            </el-form-item>
            <el-form-item label="新僱員薪金" prop="newSalary" class="form-group">
              <el-input 
                v-model="adjustmentEmployeeForm.newSalary" 
                placeholder="請輸入新僱員薪金"
                type="number"
                :min="0"
                :step="100"
                @input="calculateSalaryChange"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="生效日期" prop="effectiveDate" class="form-group">
              <el-date-picker 
                v-model="adjustmentEmployeeForm.effectiveDate" 
                type="date"
                placeholder="請選擇生效日期"
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
          <el-button @click="addAdjustmentDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddAdjustmentEmployee">保存</el-button>
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

      <div class="employee-form">
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">原僱員編號</label>
              <span class="info-display">{{ currentViewEmployee?.originalEmployeeId || '-' }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">僱員中文姓名</label>
              <span class="info-display">{{ currentViewEmployee?.employeeName || '-' }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">證件號碼</label>
              <span class="info-display">{{ currentViewEmployee?.idCard || '-' }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">部門職位</label>
              <span class="info-display">{{ currentViewEmployee?.department && currentViewEmployee?.position ? `${currentViewEmployee.department}/${currentViewEmployee.position}` : '-' }}</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">薪資調整信息</h4>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">原薪資</label>
              <span class="info-display">{{ currentViewEmployee?.oldSalary ? formatCurrency(currentViewEmployee.oldSalary) : '-' }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">新薪資</label>
              <span class="info-display">{{ currentViewEmployee?.newSalary ? formatCurrency(currentViewEmployee.newSalary) : '-' }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">薪資變化</label>
              <span class="info-display" :class="currentViewEmployee?.salaryChange > 0 ? 'increase' : 'decrease'">
                {{ currentViewEmployee?.salaryChange !== null ? 
                  `${currentViewEmployee.salaryChange > 0 ? '+' : ''}${formatCurrency(Math.abs(currentViewEmployee.salaryChange))} (${currentViewEmployee.changePercent}%)` : '-' }}
              </span>
            </div>
            <div class="form-group">
              <label class="form-label">調整原因</label>
              <span class="info-display">{{ currentViewEmployee?.adjustmentReason ? getReasonText(currentViewEmployee.adjustmentReason) : '-' }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">生效日期</label>
              <span class="info-display">{{ currentViewEmployee?.effectiveDate || '-' }}</span>
            </div>
            <div class="form-group">
              <!-- 占位，保持布局平衡 -->
            </div>
          </div>
        </div>
      </div>

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
            <el-form-item label="部門職位" class="form-group">
              <span class="info-display">{{ editEmployeeForm.department && editEmployeeForm.position ? `${editEmployeeForm.department}/${editEmployeeForm.position}` : '-' }}</span>
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">薪資調整信息</h4>
          <div class="form-row">
            <el-form-item label="原僱員薪金" class="form-group">
              <span class="info-display">{{ editEmployeeForm.oldSalary ? formatCurrency(editEmployeeForm.oldSalary) : '-' }}</span>
            </el-form-item>
            <el-form-item label="新僱員薪金" prop="newSalary" class="form-group">
              <el-input 
                v-model="editEmployeeForm.newSalary" 
                placeholder="請輸入新僱員薪金"
                type="number"
                :min="0"
                :step="100"
                @input="calculateEditSalaryChange"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="生效日期" prop="effectiveDate" class="form-group">
              <el-date-picker 
                v-model="editEmployeeForm.effectiveDate" 
                type="date"
                placeholder="請選擇生效日期"
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

    <!-- 批量導入對話框 -->
    <el-dialog 
      v-model="bulkImportDialogVisible" 
      title="批量導入僱員" 
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

      <div class="bulk-import-content">
        <div class="upload-section">
          <h4 class="section-title">上傳檔案</h4>
          <div class="upload-area">
            <el-upload
              ref="uploadRef"
              class="upload-dragger"
              drag
              :auto-upload="false"
              :multiple="false"
              accept=".xlsx,.xls"
              :on-change="handleFileChange"
              :file-list="fileList"
              :limit="1"
              :on-exceed="handleExceed"
            >
              <div class="upload-content">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  將Excel檔案拖到此處，或<em>點擊上傳</em>
                </div>
                <div class="el-upload__tip">
                  只能上傳 xlsx/xls 檔案，且不超過 10MB
                </div>
              </div>
            </el-upload>
          </div>
          
          <div class="template-download">
            <div class="template-info">
              <el-icon><document /></el-icon>
              <span>沒有模板？</span>
              <el-button type="text" @click="downloadImportTemplate">下載導入模板</el-button>
            </div>
          </div>

          <div v-if="importPreview.length > 0" class="preview-section">
            <h4 class="section-title">預覽數據</h4>
            <div class="preview-info">
              <span>共 {{ importPreview.length }} 條記錄</span>
              <span v-if="importErrors.length > 0" class="error-count">
                {{ importErrors.length }} 條錯誤記錄
              </span>
            </div>
            
            <el-table 
              :data="importPreview.slice(0, 5)" 
              style="width: 100%" 
              max-height="300"
              class="preview-table"
            >
              <el-table-column prop="originalEmployeeId" label="僱員編號" width="120" />
              <el-table-column prop="employeeName" label="中文姓名" width="120" />
              <el-table-column prop="oldSalary" label="原薪資" width="100">
                <template #default="scope">
                  {{ formatCurrency(scope.row.oldSalary) }}
                </template>
              </el-table-column>
              <el-table-column prop="newSalary" label="新薪資" width="100">
                <template #default="scope">
                  {{ formatCurrency(scope.row.newSalary) }}
                </template>
              </el-table-column>
              <el-table-column prop="adjustmentReason" label="調整原因" width="100" />
              <el-table-column prop="status" label="狀態" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.hasError ? 'danger' : 'success'">
                    {{ scope.row.hasError ? '錯誤' : '正常' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            
            <div v-if="importPreview.length > 5" class="preview-more">
              僅顯示前5條記錄，共 {{ importPreview.length }} 條
            </div>
          </div>

          <div v-if="importErrors.length > 0" class="error-section">
            <h4 class="section-title error-title">錯誤信息</h4>
            <div class="error-list">
              <div v-for="(error, index) in importErrors.slice(0, 10)" :key="index" class="error-item">
                <span class="error-row">第 {{ error.row }} 行：</span>
                <span class="error-message">{{ error.message }}</span>
              </div>
              <div v-if="importErrors.length > 10" class="error-more">
                還有 {{ importErrors.length - 10 }} 條錯誤...
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="bulkImportDialogVisible = false">取消</el-button>
          <el-button @click="clearImportData">清空</el-button>
          <el-button 
            type="primary" 
            @click="confirmBulkImport"
            :disabled="importPreview.length === 0 || importErrors.length > 0"
          >
            確認導入
          </el-button>
        </div>
      </template>
    </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Document } from '@element-plus/icons-vue'

// 響應式數據
const searchForm = reactive({
  selectedPlan: 'GR001AA',
  employeeId: '',
  employeeName: '',
  idCard: '',
  effectiveDate: ''
})

// 可用計劃列表
const availablePlans = ref([
  {
    id: 'GR001AA',
    name: 'GR001AA 集團統一央積金共同計劃',
    adjustmentEffectiveDate: '2025-04-01',
    adjusting: 8
  },
  {
    id: 'GR002BB',
    name: 'GR002BB 企業央積金計劃',
    adjustmentEffectiveDate: '2025-04-01',
    adjusting: 5
  },
  {
    id: 'GR003CC',
    name: 'GR003CC 專業人士央積金計劃',
    adjustmentEffectiveDate: '2025-04-01',
    adjusting: 3
  }
])

const selectedPlan = reactive({
  id: 'GR001AA',
  name: 'GR001AA 集團統一央積金共同計劃',
  adjustmentEffectiveDate: '2025-04-01',
  adjusting: 8
})

const addAdjustmentDialogVisible = ref(false)
const viewEmployeeDialogVisible = ref(false)
const editEmployeeDialogVisible = ref(false)
const importDialogVisible = ref(false)
const bulkImportDialogVisible = ref(false)
const currentViewEmployee = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const adjustmentEmployeeFormRef = ref()
const editEmployeeFormRef = ref()
const uploadRef = ref()
const selectedEmployees = ref([])

// 批量導入相關數據
const fileList = ref([])
const importPreview = ref([])
const importErrors = ref([])

// 所有薪資調整員工數據，按計劃分組
const allAdjustmentEmployeesData = ref({
  'GR001AA': [
    {
      originalEmployeeId: 'EMP001',
      employeeName: '陳志明',
      idCard: '1234567890',
      department: '人力資源部',
      position: '經理',
      oldSalary: 25000,
      newSalary: 28000,
      salaryChange: 3000,
      changePercent: '12.00',
      adjustmentReason: 'annual',
      effectiveDate: '2025-04-01',
      status: '審核中',
      failureReason: '',
      planId: 'GR001AA'
    },
    {
      originalEmployeeId: 'EMP002',
      employeeName: '李小紅',
      idCard: '2345678901',
      department: '財務部',
      position: '主管',
      oldSalary: 22000,
      newSalary: 25000,
      salaryChange: 3000,
      changePercent: '13.64',
      adjustmentReason: 'promotion',
      effectiveDate: '2025-04-01',
      status: '待提交審核',
      failureReason: '',
      planId: 'GR001AA'
    },
    {
      originalEmployeeId: 'EMP008',
      employeeName: '趙文華',
      idCard: '8901234567',
      department: '市場部',
      position: '主管',
      oldSalary: 23000,
      newSalary: 26000,
      salaryChange: 3000,
      changePercent: '13.04',
      adjustmentReason: 'performance',
      effectiveDate: '2025-04-01',
      status: '已調整',
      failureReason: '',
      planId: 'GR001AA'
    }
  ],
  'GR002BB': [
    {
      originalEmployeeId: 'EMP003',
      employeeName: '王志強',
      idCard: '3456789012',
      department: '技術部',
      position: '工程師',
      oldSalary: 28000,
      newSalary: 32000,
      salaryChange: 4000,
      changePercent: '14.29',
      adjustmentReason: 'performance',
      effectiveDate: '2025-04-01',
      status: '審核中',
      failureReason: '',
      planId: 'GR002BB'
    },
    {
      originalEmployeeId: 'EMP004',
      employeeName: '張美麗',
      idCard: '4567890123',
      department: '行政部',
      position: '經理',
      oldSalary: 24000,
      newSalary: 26000,
      salaryChange: 2000,
      changePercent: '8.33',
      adjustmentReason: 'market',
      effectiveDate: '2025-04-01',
      status: '待提交審核',
      failureReason: '',
      planId: 'GR002BB'
    }
  ],
  'GR003CC': [
    {
      originalEmployeeId: 'EMP005',
      employeeName: '劉建國',
      idCard: '5678901234',
      department: '運營部',
      position: '專員',
      oldSalary: 30000,
      newSalary: 33000,
      salaryChange: 3000,
      changePercent: '10.00',
      adjustmentReason: 'annual',
      effectiveDate: '2025-04-01',
      status: '已調整',
      failureReason: '',
      planId: 'GR003CC'
    }
  ]
})

// 當前計劃下的員工數據
const adjustmentEmployeeList = ref([])

const adjustmentEmployeeForm = reactive({
  originalEmployeeId: '',
  employeeName: '',
  idCard: '',
  department: '',
  position: '',
  hireDate: '',
  oldSalary: '',
  newSalary: '',
  adjustmentReason: '',
  effectiveDate: ''
})

const adjustmentEmployeeFormRules = reactive({
  employeeName: [
    { required: true, message: '請輸入僱員中文姓名', trigger: 'blur' }
  ],
  newSalary: [
    { required: true, message: '請輸入新薪資', trigger: 'blur' }
  ],
  effectiveDate: [
    { required: true, message: '請選擇生效日期', trigger: 'change' }
  ]
})

const filteredEmployees = ref([])

const editEmployeeForm = reactive({
  originalEmployeeId: '',
  employeeName: '',
  idCard: '',
  department: '',
  position: '',
  oldSalary: '',
  newSalary: '',
  adjustmentReason: '',
  effectiveDate: ''
})

const editEmployeeFormRules = reactive({
  employeeName: [
    { required: true, message: '請輸入僱員中文姓名', trigger: 'blur' }
  ],
  newSalary: [
    { required: true, message: '請輸入新薪資', trigger: 'blur' }
  ],
  effectiveDate: [
    { required: true, message: '請選擇生效日期', trigger: 'change' }
  ]
})



// 計算屬性
const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredEmployees.value.slice(start, end)
})

// 方法
function initEmployees() {
  // 加載默認計劃的員工數據
  const defaultPlanId = searchForm.selectedPlan
  if (defaultPlanId) {
    loadEmployeesByPlan(defaultPlanId)
  } else {
    filteredEmployees.value = adjustmentEmployeeList.value
  }
}

// 根據計劃ID加載員工數據
function loadEmployeesByPlan(planId) {
  if (planId && allAdjustmentEmployeesData.value[planId]) {
    adjustmentEmployeeList.value = [...allAdjustmentEmployeesData.value[planId]]
  } else {
    adjustmentEmployeeList.value = []
  }
  filteredEmployees.value = [...adjustmentEmployeeList.value]
  currentPage.value = 1
}

// 更新選中的計劃信息
function updateSelectedPlan(planId) {
  const plan = availablePlans.value.find(p => p.id === planId)
  if (plan) {
    Object.assign(selectedPlan, plan)
  }
}

// 計劃變更處理函數
function onPlanChange(planId) {
  updateSelectedPlan(planId)
  loadEmployeesByPlan(planId)
  
  // 清空其他篩選條件
  searchForm.employeeId = ''
  searchForm.employeeName = ''
  searchForm.idCard = ''
  searchForm.effectiveDate = ''
  
  currentPage.value = 1
}

function searchEmployees() {
  const { employeeId, employeeName, idCard, effectiveDate } = searchForm
  
  filteredEmployees.value = adjustmentEmployeeList.value.filter(employee => {
    const matchEmployeeId = !employeeId || employee.originalEmployeeId.includes(employeeId)
    const matchEmployeeName = !employeeName || employee.employeeName.includes(employeeName)
    const matchIdCard = !idCard || employee.idCard.includes(idCard)
    const matchEffectiveDate = !effectiveDate || employee.effectiveDate === effectiveDate
    
    return matchEmployeeId && matchEmployeeName && matchIdCard && matchEffectiveDate
  })
  
  currentPage.value = 1
}

function resetSearch() {
  // 保持選中的計劃，只清空其他篩選條件
  const currentPlan = searchForm.selectedPlan
  Object.keys(searchForm).forEach(key => {
    if (key !== 'selectedPlan') {
      searchForm[key] = ''
    }
  })
  filteredEmployees.value = adjustmentEmployeeList.value
  currentPage.value = 1
}


function getStatusType(status) {
  const statusMap = {
    '待提交審核': 'warning',
    '審核中': 'primary',
    '已調整': 'success'
  }
  return statusMap[status] || 'info'
}

function getReasonText(reason) {
  const reasonMap = {
    'annual': '年度調薪',
    'promotion': '晉升調薪',
    'performance': '績效調薪',
    'market': '市場調整',
    'other': '其他'
  }
  return reasonMap[reason] || reason
}

function getRowClassName({ row }) {
  switch (row.status) {
    case '確認失敗':
    case '審批失敗':
      return 'error-row'
    case '已調整':
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

// 處理表格選擇變更
function handleSelectionChange(selection) {
  selectedEmployees.value = selection
}

// 批量提交薪資調整申請
function submitBatchAdjustment() {
  if (selectedEmployees.value.length === 0) {
    ElMessage.warning('請先選擇要提交的員工')
    return
  }
  
  ElMessageBox.confirm(
    `確定要提交 ${selectedEmployees.value.length} 位員工的薪資調整申請嗎？`,
    '確認提交',
    {
      confirmButtonText: '確定提交',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 更新選中員工的狀態
    selectedEmployees.value.forEach(employee => {
      const index = adjustmentEmployeeList.value.findIndex(emp => emp.originalEmployeeId === employee.originalEmployeeId)
      if (index !== -1) {
        adjustmentEmployeeList.value[index].status = '審核中'
      }
    })
    
    // 記錄提交數量
    const submittedCount = selectedEmployees.value.length
    
    // 清空選擇
    selectedEmployees.value = []
    
    ElMessage.success(`成功提交 ${submittedCount} 位員工的薪資調整申請`)
  }).catch(() => {
    ElMessage.info('已取消提交')
  })
}

function showAddAdjustmentModal() {
  resetAdjustmentEmployeeForm()
  addAdjustmentDialogVisible.value = true
}

function resetAdjustmentEmployeeForm() {
  if (adjustmentEmployeeFormRef.value) {
    adjustmentEmployeeFormRef.value.resetFields()
  }
  Object.keys(adjustmentEmployeeForm).forEach(key => {
    adjustmentEmployeeForm[key] = ''
  })
}

// 僱員姓名輸入後的反顯邏輯
function onEmployeeNameChange() {
  const employeeName = adjustmentEmployeeForm.employeeName
  if (employeeName && employeeName.trim()) {
    // 模擬根據僱員姓名查詢僱員信息的邏輯
    const mockEmployeeData = getMockEmployeeByName(employeeName)
    if (mockEmployeeData) {
      adjustmentEmployeeForm.originalEmployeeId = mockEmployeeData.originalEmployeeId
      adjustmentEmployeeForm.idCard = mockEmployeeData.idCard
      adjustmentEmployeeForm.department = mockEmployeeData.department
      adjustmentEmployeeForm.position = mockEmployeeData.position
      adjustmentEmployeeForm.hireDate = mockEmployeeData.hireDate
      adjustmentEmployeeForm.oldSalary = mockEmployeeData.oldSalary
    } else {
      // 如果找不到對應僱員，清空其他字段
      adjustmentEmployeeForm.originalEmployeeId = ''
      adjustmentEmployeeForm.idCard = ''
      adjustmentEmployeeForm.department = ''
      adjustmentEmployeeForm.position = ''
      adjustmentEmployeeForm.hireDate = ''
      adjustmentEmployeeForm.oldSalary = ''
    }
  } else {
    // 清空其他字段
    adjustmentEmployeeForm.originalEmployeeId = ''
    adjustmentEmployeeForm.idCard = ''
    adjustmentEmployeeForm.department = ''
    adjustmentEmployeeForm.position = ''
    adjustmentEmployeeForm.hireDate = ''
    adjustmentEmployeeForm.oldSalary = ''
  }
}

// 模擬根據僱員姓名查詢僱員數據
function getMockEmployeeByName(employeeName) {
  // 模擬僱員數據庫
  const mockEmployees = [
    {
      originalEmployeeId: 'EMP001',
      employeeName: '陳志明',
      idCard: '1234567890',
      department: '人力資源部',
      position: '經理',
      hireDate: '2022-01-15',
      oldSalary: 25000
    },
    {
      originalEmployeeId: 'EMP002',
      employeeName: '李小紅',
      idCard: '2345678901',
      department: '財務部',
      position: '主管',
      hireDate: '2023-03-20',
      oldSalary: 22000
    },
    {
      originalEmployeeId: 'EMP003',
      employeeName: '王志強',
      idCard: '3456789012',
      department: '技術部',
      position: '工程師',
      hireDate: '2021-08-10',
      oldSalary: 28000
    },
    {
      originalEmployeeId: 'EMP006',
      employeeName: '吳小華',
      idCard: '6789012345',
      department: '客服部',
      position: '主管',
      hireDate: '2020-12-01',
      oldSalary: 26000
    },
    {
      originalEmployeeId: 'EMP007',
      employeeName: '陳大明',
      idCard: '7890123456',
      department: '法務部',
      position: '律師',
      hireDate: '2019-09-15',
      oldSalary: 45000
    }
  ]
  
  return mockEmployees.find(emp => emp.employeeName === employeeName)
}

// 模擬根據僱員編號查詢僱員數據（保留供其他函数使用）
function getMockEmployeeById(employeeId) {
  // 模擬僱員數據庫
  const mockEmployees = [
    {
      originalEmployeeId: 'EMP001',
      employeeName: '陳志明',
      idCard: '1234567890',
      department: '人力資源部',
      position: '經理',
      hireDate: '2022-01-15',
      oldSalary: 25000
    },
    {
      originalEmployeeId: 'EMP002',
      employeeName: '李小紅',
      idCard: '2345678901',
      department: '財務部',
      position: '主管',
      hireDate: '2023-03-20',
      oldSalary: 22000
    },
    {
      originalEmployeeId: 'EMP003',
      employeeName: '王志強',
      idCard: '3456789012',
      department: '技術部',
      position: '工程師',
      hireDate: '2021-08-10',
      oldSalary: 28000
    },
    {
      originalEmployeeId: 'EMP006',
      employeeName: '吳小華',
      idCard: '6789012345',
      department: '客服部',
      position: '主管',
      hireDate: '2020-12-01',
      oldSalary: 26000
    },
    {
      originalEmployeeId: 'EMP007',
      employeeName: '陳大明',
      idCard: '7890123456',
      department: '法務部',
      position: '律師',
      hireDate: '2019-09-15',
      oldSalary: 45000
    }
  ]
  
  return mockEmployees.find(emp => emp.originalEmployeeId === employeeId)
}

function calculateSalaryChange() {
  if (adjustmentEmployeeForm.oldSalary && adjustmentEmployeeForm.newSalary) {
    const oldSalary = parseFloat(adjustmentEmployeeForm.oldSalary)
    const newSalary = parseFloat(adjustmentEmployeeForm.newSalary)
    const change = newSalary - oldSalary
    const changePercent = oldSalary > 0 ? ((change / oldSalary) * 100).toFixed(2) : '0.00'
  }
}

function confirmAddAdjustmentEmployee() {
  if (!adjustmentEmployeeFormRef.value) return
  
  adjustmentEmployeeFormRef.value.validate((valid) => {
    if (valid) {
      const oldSalary = parseFloat(adjustmentEmployeeForm.oldSalary)
      const newSalary = parseFloat(adjustmentEmployeeForm.newSalary)
      const salaryChange = newSalary - oldSalary
      const changePercent = oldSalary > 0 ? ((salaryChange / oldSalary) * 100).toFixed(2) : '0.00'
      
      const newEmployee = {
        originalEmployeeId: adjustmentEmployeeForm.originalEmployeeId,
        employeeName: adjustmentEmployeeForm.employeeName,
        idCard: adjustmentEmployeeForm.idCard,
        department: adjustmentEmployeeForm.department,
        position: adjustmentEmployeeForm.position,
        oldSalary: oldSalary,
        newSalary: newSalary,
        salaryChange: salaryChange,
        changePercent: changePercent,
        adjustmentReason: adjustmentEmployeeForm.adjustmentReason || 'other',
        effectiveDate: adjustmentEmployeeForm.effectiveDate,
        status: '待提交審核',
        failureReason: ''
      }
      
      adjustmentEmployeeList.value.push(newEmployee)
      filteredEmployees.value = adjustmentEmployeeList.value
      addAdjustmentDialogVisible.value = false
      resetAdjustmentEmployeeForm()
      
      ElMessage.success('僱員添加成功')
    } else {
      ElMessage.error('請完善必填信息')
    }
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
  editEmployeeForm.department = employee.department
  editEmployeeForm.position = employee.position
  editEmployeeForm.oldSalary = employee.oldSalary
  editEmployeeForm.newSalary = employee.newSalary
  editEmployeeForm.adjustmentReason = employee.adjustmentReason
  editEmployeeForm.effectiveDate = employee.effectiveDate
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

function calculateEditSalaryChange() {
  if (editEmployeeForm.oldSalary && editEmployeeForm.newSalary) {
    const oldSalary = parseFloat(editEmployeeForm.oldSalary)
    const newSalary = parseFloat(editEmployeeForm.newSalary)
    const change = newSalary - oldSalary
    const changePercent = oldSalary > 0 ? ((change / oldSalary) * 100).toFixed(2) : '0.00'
  }
}

function confirmEditEmployee() {
  if (!editEmployeeFormRef.value) return
  
  editEmployeeFormRef.value.validate((valid) => {
    if (valid) {
      const oldSalary = parseFloat(editEmployeeForm.oldSalary)
      const newSalary = parseFloat(editEmployeeForm.newSalary)
      const salaryChange = newSalary - oldSalary
      const changePercent = oldSalary > 0 ? ((salaryChange / oldSalary) * 100).toFixed(2) : '0.00'
      
      // 更新僱員数据
      const index = adjustmentEmployeeList.value.findIndex(emp => emp.originalEmployeeId === editEmployeeForm.originalEmployeeId)
      if (index !== -1) {
        adjustmentEmployeeList.value[index] = {
          ...adjustmentEmployeeList.value[index],
          employeeName: editEmployeeForm.employeeName,
          newSalary: newSalary,
          salaryChange: salaryChange,
          changePercent: changePercent,
          adjustmentReason: editEmployeeForm.adjustmentReason,
          effectiveDate: editEmployeeForm.effectiveDate
        }
        
        filteredEmployees.value = adjustmentEmployeeList.value
        editEmployeeDialogVisible.value = false
        ElMessage.success('僱員信息更新成功')
      }
    } else {
      ElMessage.error('請完善必填信息')
    }
  })
}

function submitEmployee(employee) {
  ElMessageBox.confirm(
    `確定要提交 ${employee.employeeName} 的薪資調整申請審核嗎？`,
    '提交審核',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    employee.status = '審核中'
    ElMessage.success('已提交審核，等待審核')
  }).catch(() => {
    ElMessage.info('已取消提交')
  })
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'MOP',
    minimumFractionDigits: 0
  }).format(amount)
}

function showBulkImport() {
  clearImportData()
  bulkImportDialogVisible.value = true
}

// 批量导入相关函数
function handleFileChange(file) {
  const rawFile = file.raw
  if (!rawFile) return
  
  // 验证文件类型
  const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
  if (!allowedTypes.includes(rawFile.type)) {
    ElMessage.error('只能上传 Excel 文件')
    return false
  }
  
  // 验证文件大小 (10MB)
  if (rawFile.size > 10 * 1024 * 1024) {
    ElMessage.error('文件大小不能超过 10MB')
    return false
  }
  
  // 读取并解析Excel文件
  parseExcelFile(rawFile)
}

function handleExceed(files, fileList) {
  ElMessage.warning('只能上传一个文件，请删除当前文件后重新上传')
}

function parseExcelFile(file) {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      // 這裡應該使用Excel解析库如xlsx来解析文件
      // 為了演示，我們模擬解析結果
      const mockData = [
        {
          originalEmployeeId: 'EMP006',
          employeeName: '批量員工1',
          oldSalary: 26000,
          newSalary: 30000,
          adjustmentReason: 'promotion',
          effectiveDate: '2025-04-01',
          hasError: false
        },
        {
          originalEmployeeId: 'EMP007',
          employeeName: '批量員工2',
          oldSalary: 45000,
          newSalary: 50000,
          adjustmentReason: 'annual',
          effectiveDate: '2025-04-01',
          hasError: false
        },
        {
          originalEmployeeId: '',
          employeeName: '错误員工',
          oldSalary: 35000,
          newSalary: 0,
          adjustmentReason: 'performance',
          effectiveDate: '2025-04-01',
          hasError: true
        }
      ]
      
      importPreview.value = mockData
      
      // 检查错误
      const errors = []
      mockData.forEach((row, index) => {
        if (!row.originalEmployeeId) {
          errors.push({
            row: index + 2, // Excel行號從2開始（去除標題行）
            message: '員工編號不能為空'
          })
        }
        if (!row.newSalary || row.newSalary <= 0) {
          errors.push({
            row: index + 2,
            message: '新薪資必須大於0'
          })
        }
      })
      
      importErrors.value = errors
      
      if (errors.length === 0) {
        ElMessage.success(`成功解析 ${mockData.length} 條員工數據`)
      } else {
        ElMessage.warning(`解析完成，發現 ${errors.length} 個錯誤`)
      }
    } catch (error) {
      ElMessage.error('文件解析失敗，請檢查文件格式')
      console.error('Excel解析錯誤:', error)
    }
  }
  reader.readAsArrayBuffer(file)
}

function downloadTemplate() {
  const csvContent = "原僱員編號,僱員姓名,原薪資,新薪資,調整原因,生效日期\n" +
                   "EMP201,周文偉,26000,30000,promotion,2025-04-01"
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', '薪資調整僱員模板.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function downloadImportTemplate() {
  const csvContent = "僱員編號,中文姓名,原薪資,新薪資,調整原因,生效日期\n" +
                   "EMP201,周文偉,26000,30000,年度調薪,2025-04-01\n" +
                   "EMP202,李小華,22000,25000,晉升調薪,2025-04-01"
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', '薪資調整批量導入模板.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function clearImportData() {
  fileList.value = []
  importPreview.value = []
  importErrors.value = []
  
  // 清空上傳組件
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

function confirmBulkImport() {
  if (importPreview.value.length === 0) {
    ElMessage.error('請先上傳文件')
    return
  }
  
  if (importErrors.value.length > 0) {
    ElMessage.error('請先修復所有錯誤')
    return
  }
  
  ElMessageBox.confirm(
    `確定要導入 ${importPreview.value.length} 個薪資調整申請嗎？`,
    '確認導入',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 將導入的數據添加到員工列表
    importPreview.value.forEach(emp => {
      if (!emp.hasError) {
        const newEmployee = {
          originalEmployeeId: emp.originalEmployeeId,
          employeeName: emp.employeeName,
          idCard: emp.idCard || '待完善',
          department: emp.department || '待確認',
          position: emp.position || '待確認',
          oldSalary: emp.oldSalary,
          newSalary: emp.newSalary,
          salaryChange: emp.newSalary - emp.oldSalary,
          changePercent: ((emp.newSalary - emp.oldSalary) / emp.oldSalary * 100).toFixed(2),
          adjustmentReason: emp.adjustmentReason,
          effectiveDate: emp.effectiveDate,
          status: '待提交審核',
          failureReason: '',
          planId: searchForm.selectedPlan
        }
        
        // 添加到當前計劃的員工列表
        adjustmentEmployeeList.value.push(newEmployee)
        
        // 同時添加到總數據中
        const currentPlanId = searchForm.selectedPlan
        if (!allAdjustmentEmployeesData.value[currentPlanId]) {
          allAdjustmentEmployeesData.value[currentPlanId] = []
        }
        allAdjustmentEmployeesData.value[currentPlanId].push(newEmployee)
      }
    })
    
    // 更新篩選後的數據
    filteredEmployees.value = [...adjustmentEmployeeList.value]
    
    // 關閉對話框並清空數據
    bulkImportDialogVisible.value = false
    clearImportData()
    
    ElMessage.success(`成功導入 ${importPreview.value.filter(emp => !emp.hasError).length} 個薪資調整申請`)
  }).catch(() => {
    ElMessage.info('已取消導入')
  })
}

function handleSizeChange(newSize) {
  pageSize.value = newSize
  currentPage.value = 1
}

function handleCurrentChange(newPage) {
  currentPage.value = newPage
}

// 組件掛載時初始化
onMounted(() => {
  // 初始化時設置默認計劃
  if (availablePlans.value.length > 0) {
    const defaultPlan = availablePlans.value[0]
    searchForm.selectedPlan = defaultPlan.id
    updateSelectedPlan(defaultPlan.id)
  }
  
  initEmployees()
})




// 僱員姓名搜索功能
function searchEmployeeByName(queryString, cb) {
  // 模擬僱員數據庫
  const allEmployees = [
    {
      value: '陳大文',
      employeeId: 'EMP001',
      idNumber: '1234567890',
      hireDate: '2022-01-15',
      currentSalary: 25000,
      position: '高級經理'
    },
    {
      value: '李小紅',
      employeeId: 'EMP002', 
      idNumber: '2345678901',
      hireDate: '2023-03-20',
      currentSalary: 22000,
      position: '主管'
    },
    {
      value: '王志強',
      employeeId: 'EMP003',
      idNumber: '3456789012', 
      hireDate: '2021-08-10',
      currentSalary: 28000,
      position: '經理'
    },
    {
      value: '張美麗',
      employeeId: 'EMP004',
      idNumber: '4567890123',
      hireDate: '2022-05-12',
      currentSalary: 24000,
      position: '組長'
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
  adjustmentEmployeeForm.originalEmployeeId = item.employeeId
  adjustmentEmployeeForm.idNumber = item.idNumber
  adjustmentEmployeeForm.hireDate = item.hireDate
  adjustmentEmployeeForm.currentSalary = item.currentSalary
  adjustmentEmployeeForm.position = item.position
}

</script>

<style scoped>
.salary-adjustment {
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

.filter-buttons {
  display: flex;
  gap: 10px;
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

.action-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.employee-table {
  margin-bottom: 20px;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 25px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.highlight-text {
  color: #F39800;
  font-weight: 500;
}

.change-text {
  font-weight: 500;
}

.change-text.increase {
  color: #e6a23c;
}

.change-text.decrease {
  color: #67c23a;
}

.failure-reason {
  color: #f5222d;
  font-size: 12px;
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


.el-table .error-row {
  background-color: #fff2f0;
}

.el-table .success-row {
  background-color: #f6ffed;
}

.el-table .warning-row {
  background-color: #fffbe6;
}

/* 批量導入對話框樣式 */
.bulk-import-content {
  padding: 0;
}

.upload-section {
  margin-bottom: 20px;
}

.upload-content {
  text-align: center;
  padding: 40px 20px;
}

.upload-content .el-icon--upload {
  font-size: 67px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.el-upload__text {
  color: #606266;
  font-size: 14px;
  text-align: center;
}

.el-upload__text em {
  color: #409eff;
  font-style: normal;
}

.el-upload__tip {
  color: #999;
  font-size: 12px;
  margin-top: 7px;
}

.template-download {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
}

.template-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.template-info .el-icon {
  font-size: 16px;
  color: #409eff;
}

.preview-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.preview-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 14px;
  color: #666;
}

.error-count {
  color: #f56c6c;
  font-weight: bold;
}

.preview-table {
  border: 1px solid #e9ecef;
  border-radius: 4px;
}

.preview-more {
  text-align: center;
  padding: 10px;
  color: #999;
  font-size: 12px;
  background: #fafbfc;
  border-top: 1px solid #e9ecef;
}

.error-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.error-title {
  color: #f56c6c !important;
  border-bottom-color: #f56c6c !important;
}

.error-list {
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
  background: #fef5f5;
  border: 1px solid #fbc4c4;
  border-radius: 4px;
}

.error-item {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}

.error-row {
  color: #f56c6c;
  font-weight: bold;
  min-width: 80px;
}

.error-message {
  color: #666;
  flex: 1;
}

.error-more {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e9ecef;
}

:deep(.el-alert__content) {
  line-height: 1.6;
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
</style>