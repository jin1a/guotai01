<template>
  <div class="termination-application">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>終止參與計劃申請</span>
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
          <span class="filter-label">最後供款月份</span>
          <el-date-picker 
            v-model="searchForm.lastContributionMonth" 
            type="month"
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
            @click="submitBatchTermination"
            :disabled="selectedEmployees.length === 0"
          >
            批量提交
          </el-button>
          <el-button type="primary" @click="showAddBatchModal">添加僱員</el-button>
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
        <el-table-column prop="employeeId" label="僱員編號" min-width="100" />
        <el-table-column prop="employeeName" label="僱員中文姓名" min-width="120" />
        <el-table-column prop="idCard" label="證件號碼" min-width="140" />
        <el-table-column prop="hireDate" label="受聘日期" min-width="110" />
        <el-table-column prop="planName" label="計劃" min-width="140" show-overflow-tooltip />
        <el-table-column prop="lastEmploymentDate" label="最後受聘日期" min-width="120" />
        <el-table-column prop="lastContributionMonth" label="最後供款月份" min-width="120" />
        <el-table-column prop="terminationEffectiveMonth" label="生效月份" min-width="100">
          <template #default="scope">
            {{ scope.row.terminationEffectiveMonth }}
          </template>
        </el-table-column>
        <el-table-column prop="terminationReason" label="終止原因" min-width="100">
          <template #default="scope">
            <el-tag :type="getReasonType(scope.row.terminationReason)" size="small">
              {{ getReasonText(scope.row.terminationReason) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="balanceDocument" label="結餘處理表" min-width="110">
          <template #default="scope">
            <el-button 
              v-if="scope.row.balanceDocument"
              type="text" 
              size="small"
              @click="viewDocument(scope.row.balanceDocument)"
            >
              查看
            </el-button>
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

    <!-- 添加終止參與計劃僱員對話框 -->
    <el-dialog 
      v-model="addBatchDialogVisible" 
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
        :model="employeeForm" 
        :rules="employeeFormRules" 
        ref="employeeFormRef"
        label-width="120px"
        class="employee-form"
      >
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>
          <div class="form-row">
            <el-form-item label="僱員中文姓名" prop="chineseName" class="form-group">
              <el-autocomplete
                v-model="employeeForm.chineseName"
                :fetch-suggestions="searchEmployeeByName"
                placeholder="請輸入僱員中文姓名"
                @select="onEmployeeSelect"
                :trigger-on-focus="false"
                clearable
              />
            </el-form-item>
            <el-form-item label="僱員編號" class="form-group">
              <span class="info-display">{{ employeeForm.employeeId || '請輸入僱員中文姓名後自動生成' }}</span>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="證件號碼" class="form-group">
              <span class="info-display">{{ employeeForm.idNumber || '請輸入僱員中文姓名後自動顯示' }}</span>
            </el-form-item>
            <el-form-item label="受聘日期" class="form-group">
              <span class="info-display">{{ employeeForm.hireDate || '請輸入僱員中文姓名後自動顯示' }}</span>
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">終止信息</h4>
          <div class="form-row">
            <el-form-item label="最後受聘日期" prop="lastEmploymentDate" class="form-group">
              <el-date-picker 
                v-model="employeeForm.lastEmploymentDate" 
                type="date"
                placeholder="請選擇最後受聘日期"
              />
            </el-form-item>
            <el-form-item label="最後供款月份" prop="lastContributionDate" class="form-group">
              <el-date-picker 
                v-model="employeeForm.lastContributionDate" 
                type="month"
                placeholder="請選擇最後供款月份"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="生效日期" prop="effectiveDate" class="form-group">
              <el-date-picker 
                v-model="employeeForm.effectiveDate" 
                type="date"
                placeholder="請選擇生效日期"
              />
            </el-form-item>
            <el-form-item label="終止原因" prop="terminationReason" class="form-group">
              <el-select v-model="employeeForm.terminationReason" placeholder="請選擇終止原因">
                <el-option label="離職" value="離職" />
                <el-option label="退休" value="退休" />
                <el-option label="死亡" value="死亡" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="結餘處理表" prop="balanceDocument" class="form-group">
              <el-upload
                :show-file-list="false"
                :auto-upload="false"
                @change="handleSingleFileUpload"
                accept=".pdf,.doc,.docx"
              >
                <el-button>
                  {{ employeeForm.balanceDocument ? '已上傳' : '選擇文件' }}
                </el-button>
              </el-upload>
            </el-form-item>
            <div class="form-group">
              <!-- 占位，保持布局平衡 -->
            </div>
          </div>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addBatchDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddEmployee">保存</el-button>
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
              <label class="form-label">僱員編號</label>
              <span class="info-display">{{ currentViewEmployee?.employeeId || '-' }}</span>
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
              <label class="form-label">受聘日期</label>
              <span class="info-display">{{ currentViewEmployee?.hireDate || '-' }}</span>
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">終止信息</h4>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">最後受聘日期</label>
              <span class="info-display">{{ currentViewEmployee?.lastEmploymentDate || '-' }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">最後供款月份</label>
              <span class="info-display">{{ currentViewEmployee?.lastContributionMonth || '-' }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">生效日期</label>
              <span class="info-display">{{ currentViewEmployee?.terminationEffectiveMonth || '-' }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">終止原因</label>
              <span class="info-display">{{ currentViewEmployee?.terminationReason || '-' }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">結餘處理表</label>
              <span class="info-display">
                <el-button 
                  v-if="currentViewEmployee?.balanceDocument"
                  type="text" 
                  size="small"
                  @click="viewDocument(currentViewEmployee.balanceDocument)"
                >
                  查看文件
                </el-button>
                <span v-else>-</span>
              </span>
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
            <el-form-item label="僱員編號" class="form-group">
              <span class="info-display">{{ editEmployeeForm.employeeId || '-' }}</span>
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
            <el-form-item label="受聘日期" class="form-group">
              <span class="info-display">{{ editEmployeeForm.hireDate || '-' }}</span>
            </el-form-item>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">終止信息</h4>
          <div class="form-row">
            <el-form-item label="最後受聘日期" prop="lastEmploymentDate" class="form-group">
              <el-date-picker 
                v-model="editEmployeeForm.lastEmploymentDate" 
                type="date"
                placeholder="請選擇最後受聘日期"
              />
            </el-form-item>
            <el-form-item label="最後供款月份" prop="lastContributionDate" class="form-group">
              <el-date-picker 
                v-model="editEmployeeForm.lastContributionDate" 
                type="month"
                placeholder="請選擇最後供款月份"
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
            <el-form-item label="終止原因" prop="terminationReason" class="form-group">
              <el-select v-model="editEmployeeForm.terminationReason" placeholder="請選擇終止原因">
                <el-option label="離職" value="離職" />
                <el-option label="退休" value="退休" />
                <el-option label="死亡" value="死亡" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="結餘處理表" prop="balanceDocument" class="form-group">
              <el-upload
                :show-file-list="false"
                :auto-upload="false"
                @change="handleEditFileUpload"
                accept=".pdf,.doc,.docx"
              >
                <el-button>
                  {{ editEmployeeForm.balanceDocument ? '已上傳' : '選擇文件' }}
                </el-button>
              </el-upload>
            </el-form-item>
            <div class="form-group">
              <!-- 占位 -->
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
              <el-table-column prop="employeeId" label="僱員編號" width="120" />
              <el-table-column prop="name" label="中文姓名" width="120" />
              <el-table-column prop="idCard" label="證件號碼" width="140" />
              <el-table-column prop="terminationReason" label="終止原因" width="100" />
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

    <!-- 批次詳情對話框 -->
    <el-dialog 
      v-model="batchDetailDialogVisible" 
      :title="`批次詳情 - ${currentBatch?.batchId}`" 
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="currentBatch" class="batch-detail">
        <!-- 批次基本信息 -->
        <div class="detail-section">
          <h4 class="detail-title">批次信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">批次號：</span>
              <span class="detail-value">{{ currentBatch.batchId }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">離職人數：</span>
              <span class="detail-value">{{ currentBatch.employeeCount }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">提交時間：</span>
              <span class="detail-value">{{ currentBatch.submitTime }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">狀態：</span>
              <el-tag :type="getStatusType(currentBatch.status)">
                {{ currentBatch.status }}
              </el-tag>
            </div>
            <div class="detail-item" v-if="currentBatch.failureReason">
              <span class="detail-label">失敗原因：</span>
              <span class="detail-value error">{{ currentBatch.failureReason }}</span>
            </div>
          </div>
        </div>

        <!-- 僱員詳情 -->
        <div class="detail-section">
          <h4 class="detail-title">僱員詳情</h4>
          <el-table :data="currentBatch.employees || []" style="width: 100%">
            <el-table-column prop="employeeId" label="僱員編號" width="120" />
            <el-table-column prop="name" label="中文姓名" width="120" />
            <el-table-column prop="idCard" label="證件號碼" width="150" />
            <el-table-column prop="hireDate" label="受聘日期" width="120" />
            <el-table-column prop="lastSalaryDate" label="最後受薪日期" width="120" />
            <el-table-column prop="lastContributionMonth" label="最後供款月份" width="120" />
            <el-table-column prop="terminationReason" label="終止原因" width="120" />
            <el-table-column label="結餘處理表" width="120">
              <template #default="scope">
                <el-button 
                  v-if="scope.row.balanceDocument"
                  type="text" 
                  size="small"
                  @click="viewDocument(scope.row.balanceDocument)"
                >
                  查看文件
                </el-button>
                <span v-else>-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <template #footer>
        <el-button @click="batchDetailDialogVisible = false">關閉</el-button>
        <el-button 
          v-if="canEdit(currentBatch?.status)"
          type="primary" 
          @click="editCurrentBatch"
        >
          修改
        </el-button>
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
  lastContributionMonth: ''
})

// 可用計劃列表
const availablePlans = ref([
  {
    id: 'GR001AA',
    name: 'GR001AA 集團統一央積金共同計劃',
    activeMembers: 2569,
    terminating: 15
  },
  {
    id: 'GR002BB',
    name: 'GR002BB 企業央積金計劃',
    activeMembers: 1850,
    terminating: 12
  },
  {
    id: 'GR003CC',
    name: 'GR003CC 專業人士央積金計劃',
    activeMembers: 950,
    terminating: 8
  }
])

const selectedPlan = reactive({
  id: 'GR001AA',
  name: 'GR001AA 集團統一央積金共同計劃',
  activeMembers: 2569,
  terminating: 15
})

const addBatchDialogVisible = ref(false)
const batchDetailDialogVisible = ref(false)
const viewEmployeeDialogVisible = ref(false)
const editEmployeeDialogVisible = ref(false)
const bulkImportDialogVisible = ref(false)
const currentBatch = ref(null)
const currentViewEmployee = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const uploadRef = ref()

// 批量導入相關數據
const fileList = ref([])
const importPreview = ref([])
const importErrors = ref([])

// 所有雇员数据，按计划分组
const allTerminationEmployeesData = ref({
  'GR001AA': [
    {
      employeeId: 'EMP001',
      employeeName: '陳志明',
      idCard: '1234567890',
      hireDate: '2022/01/15',
      lastEmploymentDate: '2024/12/31',
      terminationEffectiveMonth: '2025/03',
      terminationReason: '離職',
      balanceDocument: 'balance_001.pdf',
      status: '審核中',
      failureReason: '',
      lastContributionMonth: '2024/12',
      planId: 'GR001AA',
      planName: 'GR001AA 集團統一央積金共同計劃'
    },
    {
      employeeId: 'EMP002',
      employeeName: '李小紅',
      idCard: '2345678901',
      hireDate: '2023/03/20',
      lastEmploymentDate: '2024/12/30',
      terminationEffectiveMonth: '2025/02',
      terminationReason: '退休',
      balanceDocument: 'balance_002.pdf',
      status: '待提交審核',
      failureReason: '',
      lastContributionMonth: '2024/12',
      planId: 'GR001AA',
      planName: 'GR001AA 集團統一央積金共同計劃'
    },
    {
      employeeId: 'EMP006',
      employeeName: '黃大明',
      idCard: '6789012345',
      hireDate: '2021/06/01',
      lastEmploymentDate: '2024/11/30',
      terminationEffectiveMonth: '2024/12',
      terminationReason: '離職',
      balanceDocument: 'balance_006.pdf',
      status: '已終止',
      failureReason: '',
      lastContributionMonth: '2024/11',
      planId: 'GR001AA',
      planName: 'GR001AA 集團統一央積金共同計劃'
    }
  ],
  'GR002BB': [
    {
      employeeId: 'EMP003',
      employeeName: '王志強',
      idCard: '3456789012',
      hireDate: '2021/08/10',
      lastEmploymentDate: '2024/11/15',
      terminationEffectiveMonth: '2025/01',
      terminationReason: '離職',
      balanceDocument: '',
      status: '審核中',
      failureReason: '',
      lastContributionMonth: '2024/11',
      planId: 'GR002BB',
      planName: 'GR002BB 企業央積金計劃'
    },
    {
      employeeId: 'EMP004',
      employeeName: '張美麗',
      idCard: '4567890123',
      hireDate: '2022/05/12',
      lastEmploymentDate: '2024/10/20',
      terminationEffectiveMonth: '2024/12',
      terminationReason: '死亡',
      balanceDocument: 'balance_004.pdf',
      status: '待提交審核',
      failureReason: '',
      lastContributionMonth: '2024/10',
      planId: 'GR002BB',
      planName: 'GR002BB 企業央積金計劃'
    },
    {
      employeeId: 'EMP007',
      employeeName: '吳小華',
      idCard: '7890123456',
      hireDate: '2020/04/15',
      lastEmploymentDate: '2024/08/31',
      terminationEffectiveMonth: '2024/10',
      terminationReason: '退休',
      balanceDocument: 'balance_007.pdf',
      status: '已終止',
      failureReason: '',
      lastContributionMonth: '2024/08',
      planId: 'GR002BB',
      planName: 'GR002BB 企業央積金計劃'
    }
  ],
  'GR003CC': [
    {
      employeeId: 'EMP005',
      employeeName: '劉建國',
      idCard: '5678901234',
      hireDate: '2020/12/01',
      lastEmploymentDate: '2024/09/30',
      terminationEffectiveMonth: '2024/11',
      terminationReason: '離職',
      balanceDocument: 'balance_005.pdf',
      status: '已終止',
      failureReason: '',
      lastContributionMonth: '2024/09',
      planId: 'GR003CC',
      planName: 'GR003CC 專業人士央積金計劃'
    }
  ]
})

// 当前计划下的员工数据
const terminationEmployeeList = ref([])
// 选中的员工列表
const selectedEmployees = ref([])

const terminationEmployees = ref([
  {
    employeeId: '',
    name: '',
    idCard: '',
    hireDate: '',
    lastSalaryDate: '',
    lastContributionMonth: '',
    terminationReason: '',
    balanceDocument: null
  }
])

const employeeForm = reactive({
  employeeId: '',
  chineseName: '',
  idNumber: '',
  hireDate: '',
  lastEmploymentDate: '',
  lastContributionDate: '',
  effectiveDate: '',
  terminationReason: '',
  balanceDocument: null
})

const employeeFormRef = ref()
const editEmployeeFormRef = ref()

const editEmployeeForm = reactive({
  employeeId: '',
  employeeName: '',
  idCard: '',
  hireDate: '',
  lastEmploymentDate: '',
  lastContributionDate: '',
  effectiveDate: '',
  terminationReason: '',
  balanceDocument: null
})

const editEmployeeFormRules = reactive({
  lastEmploymentDate: [
    { required: true, message: '請選擇最後受聘日期', trigger: 'change' }
  ],
  lastContributionDate: [
    { required: true, message: '請選擇最後供款月份', trigger: 'change' }
  ],
  effectiveDate: [
    { required: true, message: '請選擇生效日期', trigger: 'change' }
  ],
  terminationReason: [
    { required: true, message: '請選擇終止原因', trigger: 'change' }
  ]
})

const employeeFormRules = reactive({
  chineseName: [
    { required: true, message: '請輸入僱員中文姓名', trigger: 'blur' }
  ],
  lastEmploymentDate: [
    { required: true, message: '請選擇最後受聘日期', trigger: 'change' }
  ],
  lastContributionDate: [
    { required: true, message: '請選擇最後供款月份', trigger: 'change' }
  ],
  effectiveDate: [
    { required: true, message: '請選擇生效日期', trigger: 'change' }
  ],
  terminationReason: [
    { required: true, message: '請選擇終止原因', trigger: 'change' }
  ]
})

const filteredEmployees = ref([])

// 計算屬性
const paginatedEmployees = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredEmployees.value.slice(start, end)
})

// 方法  
function initEmployees() {
  // 加载默认计划的员工数据
  const defaultPlanId = searchForm.selectedPlan
  if (defaultPlanId) {
    loadEmployeesByPlan(defaultPlanId)
  } else {
    filteredEmployees.value = terminationEmployeeList.value
  }
}

function searchEmployees() {
  const { employeeId, employeeName, idCard, lastContributionMonth } = searchForm
  
  filteredEmployees.value = terminationEmployeeList.value.filter(employee => {
    const matchEmployeeId = !employeeId || employee.employeeId.includes(employeeId)
    const matchEmployeeName = !employeeName || employee.employeeName.includes(employeeName)
    const matchIdCard = !idCard || employee.idCard.includes(idCard)
    const matchLastContributionMonth = !lastContributionMonth || employee.lastContributionMonth === lastContributionMonth
    
    return matchEmployeeId && matchEmployeeName && matchIdCard && matchLastContributionMonth
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
  filteredEmployees.value = terminationEmployeeList.value
  currentPage.value = 1
}

// 處理表格選擇變更
function handleSelectionChange(selection) {
  selectedEmployees.value = selection
}

// 批量提交終止申請
function submitBatchTermination() {
  if (selectedEmployees.value.length === 0) {
    ElMessage.warning('請先選擇要提交的員工')
    return
  }
  
  ElMessageBox.confirm(
    `確定要提交 ${selectedEmployees.value.length} 位員工的終止申請嗎？`,
    '確認提交',
    {
      confirmButtonText: '確定提交',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 更新選中員工的狀態
    selectedEmployees.value.forEach(employee => {
      const index = terminationEmployeeList.value.findIndex(emp => emp.employeeId === employee.employeeId)
      if (index !== -1) {
        terminationEmployeeList.value[index].status = '審核中'
      }
    })
    
    // 記錄提交數量
    const submittedCount = selectedEmployees.value.length
    
    // 清空選擇
    selectedEmployees.value = []
    
    ElMessage.success(`成功提交 ${submittedCount} 位員工的終止申請`)
  }).catch(() => {
    ElMessage.info('已取消提交')
  })
}

// 計劃變更處理函數
function onPlanChange(planId) {
  updateSelectedPlan(planId)
  loadEmployeesByPlan(planId)
  
  // 清空其他篩選條件
  searchForm.employeeId = ''
  searchForm.employeeName = ''
  searchForm.idCard = ''
  searchForm.lastContributionMonth = ''
  
  currentPage.value = 1
}

// 根据计划ID加载员工数据
function loadEmployeesByPlan(planId) {
  if (planId && allTerminationEmployeesData.value[planId]) {
    terminationEmployeeList.value = [...allTerminationEmployeesData.value[planId]]
  } else {
    terminationEmployeeList.value = []
  }
  filteredEmployees.value = [...terminationEmployeeList.value]
}

// 更新選中的計劃信息
function updateSelectedPlan(planId) {
  const plan = availablePlans.value.find(p => p.id === planId)
  if (plan) {
    Object.assign(selectedPlan, plan)
  }
}

function getStatusType(status) {
  const statusMap = {
    '待提交審核': 'warning',
    '審核中': 'primary',
    '已終止': 'success'
  }
  return statusMap[status] || 'info'
}

function getReasonType(reason) {
  const reasonMap = {
    '離職': 'danger',
    '退休': 'warning',
    '死亡': 'info',
    '其他': 'info'
  }
  return reasonMap[reason] || 'info'
}

function getReasonText(reason) {
  return reason || '未設置'
}

function getRowClassName({ row }) {
  switch (row.status) {
    case '確認失敗':
    case '審批失敗':
      return 'error-row'
    case '已完成':
      return 'success-row'
    case '確認中':
    case '審批中':
      return 'warning-row'
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

// 原有的viewEmployeeDetails和editEmployee函数已移至后面，使用新的对话框实现

function submitEmployee(employee) {
  ElMessageBox.confirm(
    `確定要提交 ${employee.employeeName} 的終止參與計劃申請審核嗎？`,
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

function showAddBatchModal() {
  resetEmployeeForm()
  addBatchDialogVisible.value = true
}

function resetEmployeeForm() {
  if (employeeFormRef.value) {
    employeeFormRef.value.resetFields()
  }
  Object.keys(employeeForm).forEach(key => {
    employeeForm[key] = key === 'balanceDocument' ? null : ''
  })
}

// 僱員姓名搜索功能
function searchEmployeeByName(queryString, cb) {
  // 模擬僱員數據庫
  const allEmployees = [
    {
      value: '陳大文',
      employeeId: 'EMP001',
      idNumber: '1234567890',
      hireDate: '2022-01-15'
    },
    {
      value: '李小紅',
      employeeId: 'EMP002', 
      idNumber: '2345678901',
      hireDate: '2023-03-20'
    },
    {
      value: '王志強',
      employeeId: 'EMP003',
      idNumber: '3456789012', 
      hireDate: '2021-08-10'
    },
    {
      value: '張美麗',
      employeeId: 'EMP004',
      idNumber: '4567890123',
      hireDate: '2022-05-12'
    },
    {
      value: '劉建華',
      employeeId: 'EMP005',
      idNumber: '5678901234',
      hireDate: '2020-12-01'
    },
    {
      value: '黃大明',
      employeeId: 'EMP006',
      idNumber: '6789012345',
      hireDate: '2021-06-01'
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
  employeeForm.employeeId = item.employeeId
  employeeForm.idNumber = item.idNumber
  employeeForm.hireDate = item.hireDate
}

// 模擬根據姓名查詢僱員數據
function getMockEmployeeByName(name) {
  // 模擬僱員數據庫
  const mockEmployees = [
    {
      name: '陳志明',
      employeeId: 'EMP001',
      idNumber: '1234567890',
      hireDate: '2022-01-15'
    },
    {
      name: '李小紅',
      employeeId: 'EMP002', 
      idNumber: '2345678901',
      hireDate: '2023-03-20'
    },
    {
      name: '王志強',
      employeeId: 'EMP003',
      idNumber: '3456789012', 
      hireDate: '2021-08-10'
    },
    {
      name: '張美麗',
      employeeId: 'EMP004',
      idNumber: '4567890123',
      hireDate: '2022-05-12'
    },
    {
      name: '劉建國',
      employeeId: 'EMP005',
      idNumber: '5678901234',
      hireDate: '2020-12-01'
    }
  ]
  
  return mockEmployees.find(emp => emp.name === name)
}

function confirmAddEmployee() {
  if (!employeeFormRef.value) return
  
  employeeFormRef.value.validate((valid) => {
    if (valid) {
      const newEmployee = {
        employeeId: employeeForm.employeeId || generateEmployeeId(),
        employeeName: employeeForm.chineseName,
        idCard: employeeForm.idNumber,
        hireDate: employeeForm.hireDate,
        lastEmploymentDate: employeeForm.lastEmploymentDate,
        terminationEffectiveMonth: employeeForm.effectiveDate,
        terminationReason: employeeForm.terminationReason,
        balanceDocument: employeeForm.balanceDocument ? 'uploaded_file.pdf' : '',
        status: '待提交審核',
        failureReason: '',
        lastContributionMonth: employeeForm.lastContributionDate,
        planId: searchForm.selectedPlan
      }
      
      // 添加到当前计划的员工列表
      terminationEmployeeList.value.push(newEmployee)
      
      // 同时添加到总数据中
      const currentPlanId = searchForm.selectedPlan
      if (!allTerminationEmployeesData.value[currentPlanId]) {
        allTerminationEmployeesData.value[currentPlanId] = []
      }
      allTerminationEmployeesData.value[currentPlanId].push(newEmployee)
      
      filteredEmployees.value = terminationEmployeeList.value
      addBatchDialogVisible.value = false
      resetEmployeeForm()
      
      ElMessage.success('僱員添加成功')
    } else {
      ElMessage.error('請完善必填信息')
    }
  })
}

function generateEmployeeId() {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `EMP${timestamp}${random}`
}

function handleSingleFileUpload(file) {
  employeeForm.balanceDocument = file.name
  ElMessage.success('文件上傳成功')
}

// 查看僱員詳情
function viewEmployeeDetails(employee) {
  currentViewEmployee.value = { ...employee }
  viewEmployeeDialogVisible.value = true
}

// 編輯僱員 
function editEmployee(employee) {
  currentViewEmployee.value = { ...employee }
  fillEditEmployeeForm(employee)
  editEmployeeDialogVisible.value = true
}

// 填充編輯表單
function fillEditEmployeeForm(employee) {
  editEmployeeForm.employeeId = employee.employeeId
  editEmployeeForm.employeeName = employee.employeeName
  editEmployeeForm.idCard = employee.idCard
  editEmployeeForm.hireDate = employee.hireDate
  editEmployeeForm.lastEmploymentDate = employee.lastEmploymentDate
  editEmployeeForm.lastContributionDate = employee.lastContributionMonth
  editEmployeeForm.effectiveDate = employee.terminationEffectiveMonth
  editEmployeeForm.terminationReason = employee.terminationReason
  editEmployeeForm.balanceDocument = employee.balanceDocument
}

// 從查看模式切換到編輯模式
function switchToEditMode() {
  viewEmployeeDialogVisible.value = false
  fillEditEmployeeForm(currentViewEmployee.value)
  editEmployeeDialogVisible.value = true
}

// 重置編輯表單
function resetEditEmployeeForm() {
  if (editEmployeeFormRef.value) {
    editEmployeeFormRef.value.resetFields()
  }
  if (currentViewEmployee.value) {
    fillEditEmployeeForm(currentViewEmployee.value)
  }
}

// 確認編輯僱員
function confirmEditEmployee() {
  if (!editEmployeeFormRef.value) return
  
  // 手动验证僱员中文姓名
  if (!editEmployeeForm.employeeName || !editEmployeeForm.employeeName.trim()) {
    ElMessage.error('請輸入僱員中文姓名')
    return
  }
  
  editEmployeeFormRef.value.validate((valid) => {
    if (valid) {
      // 更新僱員數據
      const index = terminationEmployeeList.value.findIndex(emp => emp.employeeId === editEmployeeForm.employeeId)
      if (index !== -1) {
        const updatedEmployee = {
          ...terminationEmployeeList.value[index],
          employeeName: editEmployeeForm.employeeName,
          lastEmploymentDate: editEmployeeForm.lastEmploymentDate,
          lastContributionMonth: editEmployeeForm.lastContributionDate,
          terminationEffectiveMonth: editEmployeeForm.effectiveDate,
          terminationReason: editEmployeeForm.terminationReason,
          balanceDocument: editEmployeeForm.balanceDocument ? 'uploaded_file.pdf' : terminationEmployeeList.value[index].balanceDocument
        }
        
        terminationEmployeeList.value[index] = updatedEmployee
        
        // 同时更新总数据中的员工信息
        const currentPlanId = searchForm.selectedPlan
        if (allTerminationEmployeesData.value[currentPlanId]) {
          const globalIndex = allTerminationEmployeesData.value[currentPlanId].findIndex(emp => emp.employeeId === editEmployeeForm.employeeId)
          if (globalIndex !== -1) {
            allTerminationEmployeesData.value[currentPlanId][globalIndex] = updatedEmployee
          }
        }
        
        filteredEmployees.value = terminationEmployeeList.value
        editEmployeeDialogVisible.value = false
        ElMessage.success('僱員信息更新成功')
      }
    } else {
      ElMessage.error('請完善必填信息')
    }
  })
}

// 處理編輯文件上傳
function handleEditFileUpload(file) {
  editEmployeeForm.balanceDocument = file.name
  ElMessage.success('文件上傳成功')
}

// Remove old table-based employee management functions since we're now using form-based approach

function submitTerminationBatch() {
  if (terminationEmployeeList.value.length === 0) {
    ElMessage.error('請至少添加一個僱員信息')
    return
  }
  
  ElMessageBox.confirm(
    `確定要提交 ${terminationEmployeeList.value.length} 個僱員的終止參與計劃申請嗎？`,
    '確認提交',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 提交所有僱員申請
    terminationEmployeeList.value.forEach(emp => {
      emp.status = '確認中'
    })
    
    ElMessage.success('終止參與計劃申請已提交成功')
  }).catch(() => {
    ElMessage.info('已取消提交')
  })
}

function viewBatchDetails(batch) {
  currentBatch.value = batch
  batchDetailDialogVisible.value = true
}

function editBatch(batch) {
  // 復用添加對話框進行編輯
  currentBatch.value = batch
  terminationEmployees.value = batch.employees || []
  effectiveMonth.value = batch.effectiveMonth
  addBatchDialogVisible.value = true
}

function editCurrentBatch() {
  batchDetailDialogVisible.value = false
  editBatch(currentBatch.value)
}

function previewSubmission() {
  const validEmployees = terminationEmployees.value.filter(emp => 
    emp.employeeId && emp.name && emp.idCard && emp.terminationReason
  )
  
  let previewText = `終止參與計劃申請預覽\n\n`
  previewText += `生效月份：${effectiveMonth.value}\n`
  previewText += `僱員數量：${validEmployees.length}\n\n`
  previewText += `僱員列表：\n`
  
  validEmployees.forEach((emp, index) => {
    previewText += `${index + 1}. ${emp.name} (${emp.employeeId}) - ${emp.terminationReason}\n`
  })
  
  ElMessageBox.alert(previewText, '提交預覽', {
    confirmButtonText: '確定'
  })
}

function showBulkImport() {
  clearImportData()
  bulkImportDialogVisible.value = true
}

function downloadTemplate() {
  const csvContent = "僱員編號,中文姓名,證件號碼,受聘日期,最後受聘日期,最後供款月份,終止參與計劃原因\n" +
                   "EMP101,陳志明,1234567890,2022/01/15,2024/12/31,2024/12,離職"
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', '終止參與計劃僱員模板.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function viewDocument(filename) {
  ElMessage.info(`查看文件：${filename}`)
}

function handleSizeChange(newSize) {
  pageSize.value = newSize
  currentPage.value = 1
}

function handleCurrentChange(newPage) {
  currentPage.value = newPage
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
      // 这里应該使用Excel解析库如xlsx来解析文件
      // 為了演示，我們模擬解析結果
      const mockData = [
        {
          employeeId: 'EMP3001',
          name: '批量員工1',
          idCard: '5555555',
          terminationReason: '離職',
          lastEmploymentDate: '2024/12/31',
          lastContributionMonth: '2024/12',
          hasError: false
        },
        {
          employeeId: 'EMP3002',
          name: '批量員工2',
          idCard: '6666666',
          terminationReason: '退休',
          lastEmploymentDate: '2024/12/30',
          lastContributionMonth: '2024/12',
          hasError: false
        },
        {
          employeeId: '',
          name: '錯誤員工',
          idCard: '7777777',
          terminationReason: '離職',
          lastEmploymentDate: '',
          lastContributionMonth: '2024/12',
          hasError: true
        }
      ]
      
      importPreview.value = mockData
      
      // 检查错误
      const errors = []
      mockData.forEach((row, index) => {
        if (!row.employeeId) {
          errors.push({
            row: index + 2, // Excel行號從2開始（去除標題行）
            message: '員工編號不能為空'
          })
        }
        if (!row.lastEmploymentDate) {
          errors.push({
            row: index + 2,
            message: '最後受聘日期不能為空'
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

function downloadImportTemplate() {
  const csvContent = "僱員編號,中文姓名,證件號碼,最後受聘日期,最後供款月份,終止原因\n" +
                   "EMP3001,陳志明,1234567890,2024/12/31,2024/12,離職\n" +
                   "EMP3002,李小紅,2345678901,2024/12/30,2024/12,退休"
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', '終止參與計劃僱員批量導入模板.csv')
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
    `確定要導入 ${importPreview.value.length} 個員工嗎？`,
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
          employeeId: emp.employeeId,
          employeeName: emp.name,
          idCard: emp.idCard,
          hireDate: new Date().toISOString().split('T')[0], // 使用當前日期作為受聘日期
          lastEmploymentDate: emp.lastEmploymentDate,
          terminationEffectiveMonth: new Date().toISOString().split('T')[0], // 使用當前日期作為生效日期
          terminationReason: emp.terminationReason,
          balanceDocument: '',
          status: '待提交審核',
          failureReason: '',
          lastContributionMonth: emp.lastContributionMonth,
          planId: searchForm.selectedPlan
        }
        
        // 添加到當前計劃的員工列表
        terminationEmployeeList.value.push(newEmployee)
        
        // 同時添加到總數據中
        const currentPlanId = searchForm.selectedPlan
        if (!allTerminationEmployeesData.value[currentPlanId]) {
          allTerminationEmployeesData.value[currentPlanId] = []
        }
        allTerminationEmployeesData.value[currentPlanId].push(newEmployee)
      }
    })
    
    // 更新篩選後的數據
    filteredEmployees.value = [...terminationEmployeeList.value]
    
    // 關閉對話框並清空數據
    bulkImportDialogVisible.value = false
    clearImportData()
    
    ElMessage.success(`成功導入 ${importPreview.value.filter(emp => !emp.hasError).length} 個員工`)
  }).catch(() => {
    ElMessage.info('已取消導入')
  })
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
</script>

<style scoped>
.termination-application {
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



.failure-reason {
  color: #f5222d;
  font-size: 12px;
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

.el-table th {
  background: #f8fafc !important;
  color: #374151 !important;
  font-weight: 600 !important;
  border-bottom: 2px solid #e5e7eb !important;
}

.el-table td {
  border-bottom: 1px solid #f3f4f6 !important;
  padding: 12px 8px !important;
}

.el-table th:first-child,
.el-table td:first-child {
  padding-left: 16px !important;
}

.el-table th:last-child,
.el-table td:last-child {
  padding-right: 16px !important;
}

.el-table tr:hover > td {
  background: #f8fafc !important;
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

.action-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.employee-table {
  margin-bottom: 20px;
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
  margin: 0 0 20px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #40a98f;
}

.section-buttons {
  display: flex;
  gap: 10px;
}

.editable-table-container {
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 25px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
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

.termination-dialog .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
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

.info-display:empty::before {
  content: attr(data-placeholder);
  color: #c0c4cc;
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

/* 批量导入对话框样式 */
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
</style>