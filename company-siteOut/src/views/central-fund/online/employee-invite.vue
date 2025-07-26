<template>
  <div class="employee-invite">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>新加入計劃申請</span>
        </div>
      </template>

    <!-- 查詢篩選區域 -->
    <div class="query-form">
      <div class="filter-row">
        <div class="filter-group">
          <span class="filter-label">選擇計劃</span>
          <el-select 
            v-model="addEmployeeSearchForm.selectedPlan" 
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
            v-model="addEmployeeSearchForm.employeeId" 
            placeholder="請輸入" 
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <span class="filter-label">僱員中文姓名</span>
          <el-input 
            v-model="addEmployeeSearchForm.employeeName" 
            placeholder="請輸入" 
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <span class="filter-label">適用對象</span>
          <el-select 
            v-model="addEmployeeSearchForm.employeeType" 
            placeholder="請選擇"
            class="filter-select"
          >
            <el-option label="全部" value="" />
            <el-option label="普通員工" value="普通員工" />
            <el-option label="管理員工" value="管理員工" />
            <el-option label="高級管理員工" value="高級管理員工" />
          </el-select>
        </div>
        <div class="filter-group">
          <span class="filter-label">參加計劃日期</span>
          <el-date-picker 
            v-model="addEmployeeSearchForm.planJoinDate" 
            type="date"
            placeholder="請選擇"
            class="filter-input"
          />
        </div>
      </div>
      <div class="button-row">
        <div class="left-buttons">
          <el-button @click="resetAddEmployeeSearch" class="btn-reset">重置</el-button>
          <el-button type="primary" @click="searchAddEmployees" class="btn-search">查詢</el-button>
        </div>
        <div class="right-buttons">
          <el-button 
            class="btn-invite" 
            @click="submitRegistration"
            :disabled="selectedEmployees.length === 0"
          >
            發出邀約
          </el-button>
          <el-button type="primary" @click="showAddEmployeeModal">
            添加僱員
          </el-button>
          <el-button @click="showBulkImport">
            批量導入
          </el-button>
          <el-button @click="downloadTemplate">
            下載模板
          </el-button>
        </div>
      </div>
    </div>


    <!-- 員工列表表格 -->
    <div class="employee-table">
      <el-table 
        :data="paginatedNewEmployees" 
        style="width: 100%"
        :row-class-name="getRowClassName"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="employeeId" label="僱員編號" min-width="120" />
        <el-table-column prop="name" label="僱員中文姓名" min-width="120" />
        <el-table-column prop="idCard" label="證件號碼" min-width="150" />
        <el-table-column prop="hireDate" label="受聘日期" min-width="120" />
        <el-table-column prop="planName" label="計劃" min-width="140" show-overflow-tooltip />
        <el-table-column prop="employeeType" label="適用對象" min-width="100" />
        <el-table-column prop="planJoinDate" label="計劃參加日期" min-width="140" />
        <el-table-column prop="salary" label="僱員薪金" min-width="100">
          <template #default="scope">
            <span v-if="scope.row.salary">{{ formatCurrency(scope.row.salary) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="registrationStatus" label="加入狀態" min-width="120">
          <template #default="scope">
            <el-tag 
              :type="getStatusType(scope.row.registrationStatus)"
              size="small"
            >
              {{ scope.row.registrationStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button 
              size="small"
              @click="editEmployee(scope.row)"
            >
              編輯
            </el-button>
            <el-button 
              type="danger"
              size="small"
              @click="deleteEmployee(scope.row)"
            >
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="newEmployeeCurrentPage"
          v-model:page-size="newEmployeePageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="filteredNewEmployees.length"
          layout="total, sizes, prev, pager, next"
          @size-change="handleNewEmployeeSizeChange"
          @current-change="handleNewEmployeeCurrentChange"
        />
      </div>
    </div>

    <!-- 添加僱員對話框 -->
    <el-dialog 
      v-model="addEmployeeDialogVisible" 
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
            <el-form-item label="中文姓名" prop="chineseName" class="form-group">
              <el-autocomplete
                v-model="employeeForm.chineseName"
                :fetch-suggestions="searchEmployeeByName"
                placeholder="請輸入中文姓名"
                @select="onEmployeeSelect"
                @input="validateNameFields"
                :trigger-on-focus="false"
                clearable
              />
            </el-form-item>
            <div class="form-group">
              <!-- 占位，保持布局平衡 -->
            </div>
          </div>
          <div class="form-row">
            <el-form-item label="英文姓氏" prop="englishLastName" class="form-group">
              <el-input 
                v-model="employeeForm.englishLastName" 
                placeholder="請輸入英文姓氏"
                @input="validateNameFields"
              />
            </el-form-item>
            <el-form-item label="英文名字" prop="englishFirstName" class="form-group">
              <el-input 
                v-model="employeeForm.englishFirstName" 
                placeholder="請輸入英文名字"
                @input="validateNameFields"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="證件類型" prop="idType" class="form-group">
              <el-select v-model="employeeForm.idType" placeholder="請選擇證件類型">
                <el-option label="澳門居民身份證" value="澳門居民身份證" />
                <el-option label="香港居民身份證" value="香港居民身份證" />
                <el-option label="護照" value="護照" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
            <el-form-item label="證件號碼" prop="idNumber" class="form-group">
              <el-input 
                v-model="employeeForm.idNumber" 
                placeholder="請輸入證件號碼"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="流動電話" prop="phone" class="form-group">
              <el-input 
                v-model="employeeForm.phone" 
                placeholder="請輸入流動電話"
              />
            </el-form-item>
            <el-form-item label="電郵地址" prop="email" class="form-group">
              <el-input 
                v-model="employeeForm.email" 
                placeholder="請輸入電郵地址"
                type="email"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="適用對象" prop="employeeCategory" class="form-group">
              <el-select v-model="employeeForm.employeeCategory" placeholder="請選擇適用對象">
                <el-option label="普通員工" value="普通員工" />
                <el-option label="管理員工" value="管理員工" />
                <el-option label="高級管理員工" value="高級管理員工" />
              </el-select>
            </el-form-item>
            <div class="form-group">
              <!-- 占位，保持布局平衡 -->
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">僱傭信息</h4>
          <div class="form-row">
            <el-form-item label="受聘日期" prop="hireDate" class="form-group">
              <el-date-picker 
                v-model="employeeForm.hireDate" 
                type="date"
                placeholder="請選擇受聘日期"
                @change="calculatePlanJoinDate"
              />
            </el-form-item>
            <el-form-item label="僱員薪金" prop="salary" class="form-group">
              <el-input 
                v-model="employeeForm.salary" 
                placeholder="請輸入僱員薪金"
                type="number"
                :min="0"
                :step="100"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="參加計劃日期" prop="planJoinDate" class="form-group">
              <el-date-picker 
                v-model="employeeForm.planJoinDate" 
                type="date"
                placeholder="請選擇參加計劃日期"
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
          <el-button @click="addEmployeeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAddEmployee">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 僱員詳情確認對話框 -->
    <el-dialog 
      v-model="employeeDetailDialogVisible" 
      title="僱員登記信息確認" 
      width="90%"
      :close-on-click-modal="false"
      class="employee-detail-dialog"
    >
      <div v-if="currentViewEmployee" class="employee-detail-content">
        <!-- 僱員資料 - 緊湊統一佈局 -->
        <div class="info-grid-compact">
          <div class="info-field">
            <label class="field-label">僱員編號</label>
            <span class="field-value">{{ currentViewEmployee.employeeId }}</span>
          </div>
          <div class="info-field">
            <label class="field-label">適用對象</label>
            <span class="field-value">{{ currentViewEmployee.employeeType }}</span>
          </div>
          <div class="info-field">
            <label class="field-label">僱主名稱</label>
            <span class="field-value">{{ selectedPlan.employerName || '測試僱主' }}</span>
          </div>
          <div class="info-field">
            <label class="field-label">年接納期</label>
            <span class="field-value">每年僱員</span>
          </div>
          <div class="info-field">
            <label class="field-label">中文姓名</label>
            <span class="field-value">{{ currentViewEmployee.name }}</span>
          </div>
          <div class="info-field">
            <label class="field-label">英文姓名</label>
            <span class="field-value">{{ currentViewEmployee.englishName || 'Chan Tai Man' }}</span>
          </div>
          <div class="info-field">
            <label class="field-label">出生日期</label>
            <span class="field-value">26/01/1985</span>
          </div>
          <div class="info-field">
            <label class="field-label">性別</label>
            <span class="field-value">男</span>
          </div>
          <div class="info-field">
            <label class="field-label">出生地點</label>
            <span class="field-value">澳門/中國</span>
          </div>
          <div class="info-field">
            <label class="field-label">國籍/地區</label>
            <span class="field-value">中國</span>
          </div>
          <div class="info-field">
            <label class="field-label">澳門居民身份證件號碼</label>
            <span class="field-value">{{ currentViewEmployee.idCard }}</span>
          </div>
          <div class="info-field">
            <label class="field-label">流動電話</label>
            <span class="field-value">{{ currentViewEmployee.phone || '13912345123' }}</span>
          </div>
          <div class="info-field">
            <label class="field-label">固定電話</label>
            <span class="field-value">1234-2341231</span>
          </div>
          <div class="info-field">
            <label class="field-label">電郵地址</label>
            <span class="field-value">{{ currentViewEmployee.email || '123151231@126.com' }}</span>
          </div>
          <div class="info-field full-width">
            <label class="field-label">住址 (永久地址)</label>
            <span class="field-value">澳門氹仔公住社會福陽色</span>
          </div>
          <div class="info-field full-width">
            <label class="field-label">通訊地址</label>
            <span class="field-value">澳門氹仔公住社會福陽色</span>
          </div>
          <div class="info-field">
            <label class="field-label required">參加計劃日期</label>
            <el-date-picker 
              v-model="currentViewEmployee.planJoinDate" 
              type="date"
              placeholder="請選擇"
              class="field-input"
              size="small"
              :disabled="!canEditEmployee"
            />
          </div>
          <div class="info-field">
            <label class="field-label">歲月日期</label>
            <el-date-picker 
              v-model="retirementDate" 
              type="date"
              placeholder="請選擇"
              class="field-input"
              size="small"
              :disabled="!canEditEmployee"
            />
          </div>
          <div class="info-field">
            <label class="field-label required">僱員薪金</label>
            <el-input 
              v-model="currentViewEmployee.salary" 
              placeholder="請輸入"
              type="number"
              class="field-input"
              size="small"
              :disabled="!canEditEmployee"
            />
          </div>
          <div class="info-field">
            <label class="field-label">僱主補款</label>
            <el-input 
              v-model="employerContribution" 
              placeholder="請輸入"
              type="number"
              class="field-input"
              size="small"
              :disabled="!canEditEmployee"
            />
          </div>
          <div class="info-field">
            <label class="field-label">僱員補款</label>
            <el-input 
              v-model="employeeContribution" 
              placeholder="請輸入"
              type="number"
              class="field-input"
              size="small"
              :disabled="!canEditEmployee"
            />
          </div>
          <div class="info-field">
            <label class="field-label">僱員供款計劃</label>
            <el-select 
              v-model="employeeContributionPlan" 
              placeholder="請選擇"
              size="small"
              :disabled="!canEditEmployee"
            >
              <el-option label="僱主預設" value="僱主預設" />
              <el-option label="其他選項" value="其他選項" />
            </el-select>
          </div>
          <div class="info-field">
            <label class="field-label">僱員供款計劃基金上下限</label>
            <el-select 
              v-model="employeeContributionLimit" 
              placeholder="請選擇"
              size="small"
              :disabled="!canEditEmployee"
            >
              <el-option label="不設立" value="不設立" />
              <el-option label="設立限額" value="設立限額" />
            </el-select>
          </div>
          
          <!-- 投資分配區域 -->
          <div class="info-field full-width">
            <label class="field-label">歸屬於僱員的供款投放項目選擇</label>
            <div class="allocation-table-compact">
              <div class="allocation-header-row">
                <div class="fund-name-header">基金名稱</div>
                <div class="allocation-header">僱主供款合計比分</div>
                <div class="allocation-header">僱員供款合計比分</div>
              </div>
              
              <div class="allocation-data-row">
                <div class="fund-name">中國人壽保險內分公司國際式平穩基金</div>
                <div class="allocation-input-cell">
                  <el-input 
                    v-model="allocations.employer.stable" 
                    placeholder="50%"
                    size="small"
                    :disabled="!canEditEmployee"
                  />
                </div>
                <div class="allocation-input-cell">
                  <el-input 
                    v-model="allocations.employee.stable" 
                    placeholder="30%"
                    size="small"
                    :disabled="!canEditEmployee"
                  />
                </div>
              </div>
              
              <div class="allocation-data-row">
                <div class="fund-name">中國人壽保險內分公司國際式平衡基金</div>
                <div class="allocation-input-cell">
                  <el-input 
                    v-model="allocations.employer.balanced" 
                    placeholder="20%"
                    size="small"
                    :disabled="!canEditEmployee"
                  />
                </div>
                <div class="allocation-input-cell">
                  <el-input 
                    v-model="allocations.employee.balanced" 
                    placeholder="40%"
                    size="small"
                    :disabled="!canEditEmployee"
                  />
                </div>
              </div>
              
              <div class="allocation-data-row">
                <div class="fund-name">中國人壽保險內分公司國際式成長基金</div>
                <div class="allocation-input-cell">
                  <el-input 
                    v-model="allocations.employer.growth" 
                    placeholder="30%"
                    size="small"
                    :disabled="!canEditEmployee"
                  />
                </div>
                <div class="allocation-input-cell">
                  <el-input 
                    v-model="allocations.employee.growth" 
                    placeholder="30%"
                    size="small"
                    :disabled="!canEditEmployee"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <!-- 附件區域 -->
          <div class="info-field full-width">
            <label class="field-label">附件</label>
            <div class="attachments-compact">
              <div class="attachment-item">
                <i class="el-icon-document"></i>
                <span>僱員合同</span>
              </div>
              <div class="attachment-item">
                <i class="el-icon-document"></i>
                <span>身份證面</span>
              </div>
              <div class="attachment-item">
                <i class="el-icon-document"></i>
                <span>僱員確認證明(水電費等)</span>
              </div>
              <div class="attachment-item">
                <i class="el-icon-document"></i>
                <span>參加計劃申請表</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="employeeDetailDialogVisible = false">關閉</el-button>
          <el-button 
            v-if="canEditEmployee"
            type="primary" 
            @click="confirmEmployeeDetails"
          >
            確認修改
          </el-button>
          <el-button 
            v-if="currentViewEmployee?.registrationStatus === '未受邀'"
            type="success" 
            @click="inviteEmployee"
          >
            發出邀約
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
        <div class="info-item">
          <span class="info-label">僱員編號：</span>
          <span class="info-value">{{ currentEditEmployee?.employeeId }}</span>
        </div>
      </div>

      <el-form 
        :model="editEmployeeForm" 
        :rules="employeeFormRules" 
        ref="editEmployeeFormRef"
        label-width="120px"
        class="employee-form"
      >
        <div class="form-section">
          <h4 class="section-title">基本信息</h4>
          <div class="form-row">
            <el-form-item label="中文姓名" prop="chineseName" class="form-group">
              <el-input 
                v-model="editEmployeeForm.chineseName" 
                placeholder="請輸入中文姓名"
                @input="validateEditNameFields"
              />
            </el-form-item>
            <div class="form-group">
              <!-- 占位，保持布局平衡 -->
            </div>
          </div>
          <div class="form-row">
            <el-form-item label="英文姓氏" prop="englishLastName" class="form-group">
              <el-input 
                v-model="editEmployeeForm.englishLastName" 
                placeholder="請輸入英文姓氏"
                @input="validateEditNameFields"
              />
            </el-form-item>
            <el-form-item label="英文名字" prop="englishFirstName" class="form-group">
              <el-input 
                v-model="editEmployeeForm.englishFirstName" 
                placeholder="請輸入英文名字"
                @input="validateEditNameFields"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="證件類型" prop="idType" class="form-group">
              <el-select v-model="editEmployeeForm.idType" placeholder="請選擇證件類型">
                <el-option label="澳門居民身份證" value="澳門居民身份證" />
                <el-option label="香港居民身份證" value="香港居民身份證" />
                <el-option label="護照" value="護照" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>
            <el-form-item label="證件號碼" prop="idNumber" class="form-group">
              <el-input 
                v-model="editEmployeeForm.idNumber" 
                placeholder="請輸入證件號碼"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="流動電話" prop="phone" class="form-group">
              <el-input 
                v-model="editEmployeeForm.phone" 
                placeholder="請輸入流動電話"
              />
            </el-form-item>
            <el-form-item label="電郵地址" prop="email" class="form-group">
              <el-input 
                v-model="editEmployeeForm.email" 
                placeholder="請輸入電郵地址"
                type="email"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="適用對象" prop="employeeCategory" class="form-group">
              <el-select v-model="editEmployeeForm.employeeCategory" placeholder="請選擇適用對象">
                <el-option label="普通員工" value="普通員工" />
                <el-option label="管理員工" value="管理員工" />
                <el-option label="高級管理員工" value="高級管理員工" />
              </el-select>
            </el-form-item>
            <div class="form-group">
              <!-- 占位，保持布局平衡 -->
            </div>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">僱傭信息</h4>
          <div class="form-row">
            <el-form-item label="受聘日期" prop="hireDate" class="form-group">
              <el-date-picker 
                v-model="editEmployeeForm.hireDate" 
                type="date"
                placeholder="請選擇受聘日期"
                @change="calculateEditPlanJoinDate"
              />
            </el-form-item>
            <el-form-item label="僱員薪金" prop="salary" class="form-group">
              <el-input 
                v-model="editEmployeeForm.salary" 
                placeholder="請輸入僱員薪金"
                type="number"
                :min="0"
                :step="100"
              />
            </el-form-item>
          </div>
          <div class="form-row">
            <el-form-item label="參加計劃日期" prop="planJoinDate" class="form-group">
              <el-date-picker 
                v-model="editEmployeeForm.planJoinDate" 
                type="date"
                placeholder="請選擇參加計劃日期"
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
              <el-table-column prop="employeeId" label="僱員編號" width="120" />
              <el-table-column prop="name" label="中文姓名" width="120" />
              <el-table-column prop="idCard" label="證件號碼" width="140" />
              <el-table-column prop="employeeType" label="適用對象" width="100" />
              <el-table-column prop="salary" label="薪資" width="100">
                <template #default="scope">
                  {{ formatCurrency(scope.row.salary) }}
                </template>
              </el-table-column>
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

const selectedEmployees = ref([])
const addEmployeeDialogVisible = ref(false)
const editEmployeeDialogVisible = ref(false)
const employeeDetailDialogVisible = ref(false)
const bulkImportDialogVisible = ref(false)
const employeeFormRef = ref()
const editEmployeeFormRef = ref()
const uploadRef = ref()
const currentEditEmployee = ref(null)
const currentViewEmployee = ref(null)

// 批量导入相关数据
const fileList = ref([])
const importPreview = ref([])
const importErrors = ref([])

// 僱員詳情相關數據
const retirementDate = ref('')
const employerContribution = ref('359')
const employeeContribution = ref('359')
const employeeContributionPlan = ref('僱主預設')
const employeeContributionLimit = ref('不設立')

const allocations = reactive({
  employer: {
    stable: '50%',
    balanced: '20%',
    growth: '30%'
  },
  employee: {
    stable: '30%',
    balanced: '40%',
    growth: '30%'
  }
})

// 可用计划列表
const availablePlans = ref([
  {
    id: 'GR001AA',
    name: 'GR001AA 集團統一央積金共同計劃',
    employerName: '中國人壽集團公司',
    activeMembers: 2569,
    registering: 25
  },
  {
    id: 'GR002BB',
    name: 'GR002BB 企業央積金計劃',
    employerName: '中國人壽集團公司',
    activeMembers: 1850,
    registering: 18
  },
  {
    id: 'GR003CC',
    name: 'GR003CC 專業人士央積金計劃',
    employerName: '中國人壽集團公司',
    activeMembers: 950,
    registering: 12
  }
])

const selectedPlan = reactive({
  id: 'GR001AA',
  name: 'GR001AA 集團統一央積金共同計劃',
  employerName: '中國人壽集團公司',
  activeMembers: 2569,
  registering: 25
})

// 計算屬性：是否可以編輯僱員
const canEditEmployee = computed(() => {
  if (!currentViewEmployee.value) return false
  return ['未受邀', '確認失敗'].includes(currentViewEmployee.value.registrationStatus)
})

// 所有员工数据，按计划分组
const allEmployeesData = ref({
  'GR001AA': [
    {
      employeeId: 'EMP001',
      name: '陳大文',
      englishName: 'CHAN, TAI MAN',
      idCard: '1234567',
      idType: '澳門居民身份證',
      phone: '66123456',
      email: 'chan.taiman@company.com',
      hireDate: '2025/01/15',
      employeeType: '普通員工',
      planJoinDate: '2025/02/01',
      salary: 25000,
      company: '澳門分公司',
      department: '人力資源部',
      employerContribution: 2500,
      employeeContribution: 1250,
      registrationStatus: '新增',
      planId: 'GR001AA',
      planName: 'GR001AA 集團統一央積金共同計劃'
    },
    {
      employeeId: 'EMP002',
      name: '李小紅',
      englishName: 'LEE, SIU HUNG',
      idCard: '2345678',
      idType: '香港居民身份證',
      phone: '98765432',
      email: 'lee.siuhung@company.com',
      hireDate: '2025/01/10',
      employeeType: '管理員工',
      planJoinDate: '2025/02/01',
      salary: 22000,
      company: '香港分公司',
      department: '財務部',
      employerContribution: 2200,
      employeeContribution: 1100,
      registrationStatus: '新增',
      planId: 'GR001AA',
      planName: 'GR001AA 集團統一央積金共同計劃'
    }
  ],
  'GR002BB': [
    {
      employeeId: 'EMP003',
      name: '王志強',
      englishName: 'WANG, ZHI QIANG',
      idCard: '3456789',
      idType: '澳門居民身份證',
      phone: '66234567',
      email: 'wang.zhiqiang@company.com',
      hireDate: '2025/01/12',
      employeeType: '高級管理員工',
      planJoinDate: '2025/02/01',
      salary: 28000,
      company: '澳門分公司',
      department: '技術部',
      employerContribution: 2800,
      employeeContribution: 1400,
      registrationStatus: '新增',
      planId: 'GR002BB',
      planName: 'GR002BB 企業央積金計劃'
    },
    {
      employeeId: 'EMP004',
      name: '張美麗',
      englishName: 'ZHANG, MEI LI',
      idCard: '4567890',
      idType: '香港居民身份證',
      phone: '98876543',
      email: 'zhang.meili@company.com',
      hireDate: '2025/01/08',
      employeeType: '管理員工',
      planJoinDate: '2025/02/01',
      salary: 24000,
      company: '香港分公司',
      department: '市場部',
      employerContribution: 2400,
      employeeContribution: 1200,
      registrationStatus: '新增',
      planId: 'GR002BB',
      planName: 'GR002BB 企業央積金計劃'
    }
  ],
  'GR003CC': [
    {
      employeeId: 'EMP005',
      name: '劉建華',
      englishName: 'LIU, JIAN HUA',
      idCard: '5678901',
      idType: '澳門居民身份證',
      phone: '66345678',
      email: 'liu.jianhua@company.com',
      hireDate: '2025/01/05',
      employeeType: '普通員工',
      planJoinDate: '2025/02/01',
      salary: 32000,
      company: '澳門分公司',
      department: '法務部',
      employerContribution: 3200,
      employeeContribution: 1600,
      registrationStatus: '新增',
      planId: 'GR003CC',
      planName: 'GR003CC 專業人士央積金計劃'
    }
  ]
})

// 当前计划下的员工
const newEmployees = ref([])


const searchForm = reactive({
  employeeId: '',
  employeeName: '',
  idCard: '',
  employeeType: '',
  status: ''
})


const addEmployeeSearchForm = reactive({
  selectedPlan: 'GR001AA', // 默认选中第一个计划
  employeeId: '',
  employeeName: '',
  employeeType: '',
  planJoinDate: ''
})

const filteredNewEmployees = ref([])
const newEmployeeCurrentPage = ref(1)
const newEmployeePageSize = ref(10)



const paginatedNewEmployees = computed(() => {
  const start = (newEmployeeCurrentPage.value - 1) * newEmployeePageSize.value
  const end = start + newEmployeePageSize.value
  return filteredNewEmployees.value.slice(start, end)
})

const employeeForm = reactive({
  chineseName: '',
  englishLastName: '',
  englishFirstName: '',
  idType: '',
  idNumber: '',
  phone: '',
  email: '',
  employeeCategory: '',
  hireDate: '',
  salary: '',
  planJoinDate: ''
})

const editEmployeeForm = reactive({
  employeeId: '',
  chineseName: '',
  englishLastName: '',
  englishFirstName: '',
  idType: '',
  idNumber: '',
  phone: '',
  email: '',
  employeeCategory: '',
  hireDate: '',
  salary: '',
  planJoinDate: ''
})

const employeeFormRules = reactive({
  chineseName: [
    { 
      validator: (rule, value, callback) => {
        const hasChineseName = value && value.trim()
        const hasEnglishName = (employeeForm.englishLastName && employeeForm.englishLastName.trim()) && 
                               (employeeForm.englishFirstName && employeeForm.englishFirstName.trim())
        
        if (!hasChineseName && !hasEnglishName) {
          callback(new Error('請輸入中文姓名或英文姓氏和名字'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  englishLastName: [
    { 
      validator: (rule, value, callback) => {
        const hasChineseName = employeeForm.chineseName && employeeForm.chineseName.trim()
        const hasEnglishLastName = value && value.trim()
        const hasEnglishFirstName = employeeForm.englishFirstName && employeeForm.englishFirstName.trim()
        
        if (!hasChineseName && (!hasEnglishLastName || !hasEnglishFirstName)) {
          callback(new Error('請輸入英文姓氏和名字，或中文姓名'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  englishFirstName: [
    { 
      validator: (rule, value, callback) => {
        const hasChineseName = employeeForm.chineseName && employeeForm.chineseName.trim()
        const hasEnglishLastName = employeeForm.englishLastName && employeeForm.englishLastName.trim()
        const hasEnglishFirstName = value && value.trim()
        
        if (!hasChineseName && (!hasEnglishLastName || !hasEnglishFirstName)) {
          callback(new Error('請輸入英文姓氏和名字，或中文姓名'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  idType: [
    { required: true, message: '請選擇證件類型', trigger: 'change' }
  ],
  idNumber: [
    { required: true, message: '請輸入證件編號', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '請輸入流動電話', trigger: 'blur' },
    { pattern: /^[0-9+\-\s()]+$/, message: '請輸入有效的電話號碼', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入電郵地址', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的電郵地址', trigger: 'blur' }
  ],
  employeeCategory: [
    { required: true, message: '請選擇適用對象', trigger: 'change' }
  ],
  hireDate: [
    { required: true, message: '請選擇受聘日期', trigger: 'change' }
  ],
  salary: [
    { required: true, message: '請輸入僱員薪金', trigger: 'blur' }
  ],
  planJoinDate: [
    { required: true, message: '請選擇參加計劃日期', trigger: 'change' }
  ]
})


function getStatusType(status) {
  const statusMap = {
    '新增': 'info',
    '未受邀': 'warning',
    '已受邀': 'success', 
    '待聯絡': 'warning',
    '聯絡中': 'info',
    '確認中': 'info',
    '已完成': 'success',
    '確認失敗': 'danger',
    '審批失敗': 'danger',
    '失敗': 'danger'
  }
  return statusMap[status] || 'info'
}

function showAddEmployeeModal() {
  addEmployeeDialogVisible.value = true
  resetEmployeeForm()
}

function resetEmployeeForm() {
  if (employeeFormRef.value) {
    employeeFormRef.value.resetFields()
  }
  Object.keys(employeeForm).forEach(key => {
    employeeForm[key] = ''
  })
}

function confirmAddEmployee() {
  if (!employeeFormRef.value) return
  
  employeeFormRef.value.validate((valid) => {
    if (valid) {
      // 生成僱員編號
      const employeeId = generateEmployeeId()
      
      // 構建姓名信息
      const name = employeeForm.chineseName || `${employeeForm.englishLastName}, ${employeeForm.englishFirstName}`
      const englishName = (employeeForm.englishLastName && employeeForm.englishFirstName) 
        ? `${employeeForm.englishLastName}, ${employeeForm.englishFirstName}` 
        : ''
      
      const newEmployee = {
        employeeId: employeeId,
        name: name,
        englishName: englishName,
        idCard: employeeForm.idNumber,
        idType: employeeForm.idType,
        phone: employeeForm.phone,
        email: employeeForm.email,
        hireDate: employeeForm.hireDate,
        employeeType: employeeForm.employeeCategory,
        planJoinDate: employeeForm.planJoinDate,
        salary: employeeForm.salary,
        registrationStatus: '新增'
      }
      
      newEmployees.value.push(newEmployee)
      addEmployeeDialogVisible.value = false
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

function validateNameFields() {
  // 觸發名稱字段的重新驗證
  if (employeeFormRef.value) {
    employeeFormRef.value.validateField(['chineseName', 'englishLastName', 'englishFirstName'])
  }
}

function validateEditNameFields() {
  // 觸發編輯表單名稱字段的重新驗證
  if (editEmployeeFormRef.value) {
    editEmployeeFormRef.value.validateField(['chineseName', 'englishLastName', 'englishFirstName'])
  }
}

function calculatePlanJoinDate() {
  if (employeeForm.hireDate) {
    const hireDate = new Date(employeeForm.hireDate)
    // 計劃參加日期默認為受聘日期的下個月1號
    const planJoinDate = new Date(hireDate.getFullYear(), hireDate.getMonth() + 1, 1)
    employeeForm.planJoinDate = planJoinDate.toISOString().split('T')[0]
  }
}


function editEmployee(employee) {
  currentEditEmployee.value = employee
  fillEditEmployeeForm(employee)
  editEmployeeDialogVisible.value = true
}

function deleteEmployee(employee) {
  const index = newEmployees.value.findIndex(emp => emp.employeeId === employee.employeeId)
  if (index !== -1) {
    newEmployees.value.splice(index, 1)
  }
}

function clearSelection() {
  selectedEmployees.value = []
}

function submitRegistration() {
  if (selectedEmployees.value.length === 0) {
    ElMessage.warning('請先選擇要提交的僱員')
    return
  }
  
  // 生成邀約詳情內容
  const inviteContent = generateInviteContent(selectedEmployees.value)
  
  ElMessageBox.confirm(
    `確定要向 ${selectedEmployees.value.length} 個僱員發出加入計劃的邀約嗎？`,
    '確認發送邀約',
    {
      confirmButtonText: '確定發送',
      cancelButtonText: '取消',
      type: 'info',
      customClass: 'invite-confirm-dialog'
    }
  ).then(() => {
    // 更新選中僱員的狀態
    selectedEmployees.value.forEach(employee => {
      const index = newEmployees.value.findIndex(emp => emp.employeeId === employee.employeeId)
      if (index !== -1) {
        newEmployees.value[index].registrationStatus = '已受邀'
        newEmployees.value[index].inviteTime = new Date().toLocaleString('zh-CN')
      }
    })
    
    // 更新篩選後的數據
    filteredNewEmployees.value = [...newEmployees.value]
    
    // 清空選擇
    selectedEmployees.value = []
    
    // 顯示邀約成功的詳細信息
    showInviteSuccessDialog(inviteContent)
  }).catch(() => {
    ElMessage.info('已取消發送邀約')
  })
}

function generateInviteContent(employees) {
  return {
    planInfo: {
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      employerName: selectedPlan.employerName
    },
    employees: employees.map(emp => ({
      employeeId: emp.employeeId,
      name: emp.name,
      employeeType: emp.employeeType,
      salary: emp.salary,
      planJoinDate: emp.planJoinDate
    })),
    inviteTime: new Date().toLocaleString('zh-CN'),
    totalCount: employees.length
  }
}

function showInviteSuccessDialog(inviteContent) {
  let messageContent = `
    <div style="line-height: 1.6; color: #606266; font-size: 14px;">
      <div style="margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, #f0f9ff 0%, #e1f5fe 100%); border-radius: 8px; border-left: 4px solid #409eff;">
        <div style="font-weight: 600; color: #303133; margin-bottom: 12px; font-size: 16px;">📋 計劃信息</div>
        <div style="margin-bottom: 6px;"><span style="color: #909399; width: 80px; display: inline-block;">計劃編號:</span><span style="font-weight: 500; color: #303133;">${inviteContent.planInfo.planId}</span></div>
        <div style="margin-bottom: 6px;"><span style="color: #909399; width: 80px; display: inline-block;">計劃名稱:</span><span style="font-weight: 500; color: #303133;">${inviteContent.planInfo.planName}</span></div>
        <div><span style="color: #909399; width: 80px; display: inline-block;">僱主名稱:</span><span style="font-weight: 500; color: #303133;">${inviteContent.planInfo.employerName}</span></div>
      </div>
      
      <div style="margin-bottom: 20px; display: flex; gap: 24px;">
        <div style="flex: 1; padding: 12px; background: #f8f9fa; border-radius: 6px; text-align: center;">
          <div style="font-size: 20px; font-weight: 600; color: #409eff; margin-bottom: 4px;">${inviteContent.totalCount}</div>
          <div style="color: #909399; font-size: 12px;">邀約人數</div>
        </div>
        <div style="flex: 2; padding: 12px; background: #f8f9fa; border-radius: 6px;">
          <div style="color: #303133; font-weight: 500; margin-bottom: 4px;">🕰️ 發送時間</div>
          <div style="color: #409eff; font-size: 13px;">${inviteContent.inviteTime}</div>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="font-weight: 600; color: #303133; margin-bottom: 12px; font-size: 15px;">📧 邀約名單</div>
        <div style="max-height: 180px; overflow-y: auto; border: 1px solid #e4e7ed; border-radius: 8px; background: #ffffff;">
  `
  
  inviteContent.employees.forEach((emp, index) => {
    messageContent += `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; ${index > 0 ? 'border-top: 1px solid #f0f0f0;' : ''}">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="font-weight: 500; color: #303133; font-size: 14px;">${emp.name}</span>
            <span style="background: #e1f5fe; color: #409eff; padding: 2px 6px; border-radius: 12px; font-size: 11px;">${emp.employeeId}</span>
          </div>
          <div style="font-size: 12px; color: #909399; display: flex; gap: 12px;">
            <span>👥 ${emp.employeeType}</span>
            <span>💰 ${formatCurrency(emp.salary)}</span>
            <span>📅 ${emp.planJoinDate}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 6px; height: 6px; background: #67c23a; border-radius: 50%;"></div>
          <span style="color: #67c23a; font-size: 12px; font-weight: 500;">已發送</span>
        </div>
      </div>
    `
  })
  
  messageContent += `
        </div>
      </div>
      
      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e8f4fd 100%); padding: 16px; border-radius: 8px; border: 1px solid #d4e9ff;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 16px;">💡</span>
          <span style="color: #303133; font-weight: 600;">溫馨提示</span>
        </div>
        <div style="color: #606266; font-size: 13px; line-height: 1.5;">
          <div style="margin-bottom: 4px;">• 邀約郵件已自動發送至僱員的郵箱地址</div>
          <div style="margin-bottom: 4px;">• 僱員收到郵件後需點擊確認連結來完成加入申請</div>
          <div>• 您可以在<span style="color: #409eff; font-weight: 500;">「待辦列表」</span>中實時查看邀約狀態和僱員回覆情況</div>
        </div>
      </div>
    </div>
  `
  
  ElMessageBox({
    title: '🎉 邀約發送成功！',
    message: messageContent,
    dangerouslyUseHTMLString: true,
    confirmButtonText: '我知道了',
    confirmButtonClass: 'el-button--primary',
    customClass: 'invite-success-dialog',
    showCancelButton: false,
    closeOnClickModal: false,
    closeOnPressEscape: true,
    callback: () => {
      ElMessage({
        message: `🎉 邀約已成功發送給 ${inviteContent.totalCount} 位僱員，請關注待辦列表中的回覆狀態`,
        type: 'success',
        duration: 4000,
        showClose: true
      })
    }
  })
}

function showBulkImport() {
  clearImportData()
  bulkImportDialogVisible.value = true
}

function downloadTemplate() {
  const csvContent = "僱員編號,僱員姓名,證件號碼,受僱日期,適用對象,計劃參加日期,薪金,僱主補款,僱員供款\n" +
                   "EMP001,陳大文,1234567,2025/01/15,普通員工,2025/02/01,25000,2500,1250"
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', '僱員模板.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function resetSearch() {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
}

function searchEmployees() {
  console.log('搜索條件:', searchForm)
}

function viewEmployeeDetail(employee) {
  currentViewEmployee.value = { ...employee }
  
  // 根據狀態決定顯示哪個對話框
  if (['已受邀', '確認中', '已完成', '確認失敗'].includes(employee.registrationStatus)) {
    // 顯示確認僱員信息對話框
    employeeDetailDialogVisible.value = true
  } else if (employee.registrationStatus === '未受邀') {
    // 顯示編輯僱員對話框（復用加入僱員的編輯窗口）
    fillEditEmployeeForm(employee)
    editEmployeeDialogVisible.value = true
  }
}

// 確認僱員詳情修改
function confirmEmployeeDetails() {
  if (!currentViewEmployee.value) return
  
  ElMessageBox.confirm(
    '確定要保存對僱員信息的修改嗎？',
    '確認修改',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    
    employeeDetailDialogVisible.value = false
    ElMessage.success('僱員信息修改成功')
  }).catch(() => {
    ElMessage.info('已取消修改')
  })
}

// 邀請僱員
function inviteEmployee() {
  if (!currentViewEmployee.value) return
  
  ElMessageBox.confirm(
    `確定要邀請僱員 ${currentViewEmployee.value.name} 參加計劃嗎？`,
    '確認邀請',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    currentViewEmployee.value.registrationStatus = '已受邀'
    currentViewEmployee.value.inviteTime = new Date().toLocaleDateString()
    currentViewEmployee.value.contactProgress = '已發送邀約郵件'
    currentViewEmployee.value.failureReason = ''
    
    
    employeeDetailDialogVisible.value = false
    ElMessage.success('邀約已發送')
  }).catch(() => {
    ElMessage.info('已取消邀請')
  })
}

function updateEmployeeStatus(employee) {
  console.log('更新僱員狀態:', employee)
}

function fillEditEmployeeForm(employee) {
  // 將僱員數據填入編輯表單
  editEmployeeForm.employeeId = employee.employeeId
  
  // 處理姓名信息
  if (employee.englishName && employee.englishName.includes(', ')) {
    // 如果有英文姓名
    editEmployeeForm.englishLastName = employee.englishName.split(', ')[0]
    editEmployeeForm.englishFirstName = employee.englishName.split(', ')[1]
    editEmployeeForm.chineseName = employee.name === employee.englishName ? '' : employee.name
  } else {
    // 只有中文姓名
    editEmployeeForm.chineseName = employee.name
    editEmployeeForm.englishLastName = ''
    editEmployeeForm.englishFirstName = ''
  }
  
  editEmployeeForm.idType = employee.idType || '澳門居民身份證'
  editEmployeeForm.idNumber = employee.idCard
  editEmployeeForm.phone = employee.phone || ''
  editEmployeeForm.email = employee.email || ''
  editEmployeeForm.employeeCategory = employee.employeeType
  editEmployeeForm.hireDate = employee.hireDate
  editEmployeeForm.salary = employee.salary
  editEmployeeForm.planJoinDate = employee.planJoinDate
}


function resetEditEmployeeForm() {
  if (editEmployeeFormRef.value) {
    editEmployeeFormRef.value.resetFields()
  }
  if (currentEditEmployee.value) {
    fillEditEmployeeForm(currentEditEmployee.value)
  }
}

function confirmEditEmployee() {
  if (!editEmployeeFormRef.value) return
  
  editEmployeeFormRef.value.validate((valid) => {
    if (valid) {
      // 構建姓名信息
      const name = editEmployeeForm.chineseName || `${editEmployeeForm.englishLastName}, ${editEmployeeForm.englishFirstName}`
      const englishName = (editEmployeeForm.englishLastName && editEmployeeForm.englishFirstName) 
        ? `${editEmployeeForm.englishLastName}, ${editEmployeeForm.englishFirstName}` 
        : ''
      
      // 更新僱員數據
      const updatedEmployee = {
        employeeId: editEmployeeForm.employeeId,
        name: name,
        englishName: englishName,
        idCard: editEmployeeForm.idNumber,
        idType: editEmployeeForm.idType,
        phone: editEmployeeForm.phone,
        email: editEmployeeForm.email,
        hireDate: editEmployeeForm.hireDate,
        employeeType: editEmployeeForm.employeeCategory,
        planJoinDate: editEmployeeForm.planJoinDate,
        salary: editEmployeeForm.salary,
        registrationStatus: currentEditEmployee.value?.registrationStatus || '新增'
      }
      
      // 更新新增僱員列表中的數據
      const index = newEmployees.value.findIndex(emp => emp.employeeId === editEmployeeForm.employeeId)
      if (index !== -1) {
        newEmployees.value[index] = updatedEmployee
      }
      
      
      editEmployeeDialogVisible.value = false
      currentEditEmployee.value = null
      
      ElMessage.success('僱員信息更新成功')
    } else {
      ElMessage.error('請完善必填信息')
    }
  })
}

function calculateEditPlanJoinDate() {
  if (editEmployeeForm.hireDate) {
    const hireDate = new Date(editEmployeeForm.hireDate)
    // 計劃參加日期默認為受聘日期的下個月1號
    const planJoinDate = new Date(hireDate.getFullYear(), hireDate.getMonth() + 1, 1)
    editEmployeeForm.planJoinDate = planJoinDate.toISOString().split('T')[0]
  }
}

// 初始化函數
function initNewEmployees() {
  // 初始化时设置默认计划
  if (availablePlans.value.length > 0) {
    const defaultPlan = availablePlans.value[0]
    addEmployeeSearchForm.selectedPlan = defaultPlan.id
    updateSelectedPlan(defaultPlan.id)
    loadEmployeesByPlan(defaultPlan.id)
  }
  
  filteredNewEmployees.value = [...newEmployees.value]
}

// 根据计划ID加载员工数据
function loadEmployeesByPlan(planId) {
  if (planId && allEmployeesData.value[planId]) {
    newEmployees.value = [...allEmployeesData.value[planId]]
  } else {
    newEmployees.value = []
  }
  filteredNewEmployees.value = [...newEmployees.value]
  newEmployeeCurrentPage.value = 1
}

// 更新选中的计划信息
function updateSelectedPlan(planId) {
  const plan = availablePlans.value.find(p => p.id === planId)
  if (plan) {
    Object.assign(selectedPlan, plan)
  }
}

// 计划变更处理函数
function onPlanChange(planId) {
  updateSelectedPlan(planId)
  loadEmployeesByPlan(planId)
  
  // 清空其他筛选条件
  addEmployeeSearchForm.employeeId = ''
  addEmployeeSearchForm.employeeName = ''
  addEmployeeSearchForm.employeeType = ''
  addEmployeeSearchForm.planJoinDate = ''
}





function formatCurrency(amount) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'MOP',
    minimumFractionDigits: 0
  }).format(amount)
}

function getRowClassName({ row }) {
  switch (row.registrationStatus) {
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
  return ['未受邀', '確認失敗', '審批失敗'].includes(status)
}

function canDelete(status) {
  return ['未受邀', '確認失敗', '審批失敗'].includes(status)
}

function canReinvite(status) {
  return ['未受邀', '確認失敗', '審批失敗'].includes(status)
}

function canView(status) {
  return ['已受邀', '確認中', '審批中', '已完成'].includes(status)
}

function canUpdateStatus(status) {
  return ['確認中', '審批中', '確認失敗', '審批失敗'].includes(status)
}






// 新僱員搜索和分頁函數
function searchAddEmployees() {
  const { employeeId, employeeName, employeeType, planJoinDate } = addEmployeeSearchForm
  
  filteredNewEmployees.value = newEmployees.value.filter(emp => {
    const matchId = !employeeId || emp.employeeId.toLowerCase().includes(employeeId.toLowerCase())
    const matchName = !employeeName || emp.name.toLowerCase().includes(employeeName.toLowerCase())
    const matchType = !employeeType || emp.employeeType === employeeType
    const matchPlanJoinDate = !planJoinDate || emp.planJoinDate === planJoinDate
    
    return matchId && matchName && matchType && matchPlanJoinDate
  })
  
  newEmployeeCurrentPage.value = 1
}

function resetAddEmployeeSearch() {
  // 保持选中的计划，只清空其他筛选条件
  const currentPlan = addEmployeeSearchForm.selectedPlan
  Object.keys(addEmployeeSearchForm).forEach(key => {
    if (key !== 'selectedPlan') {
      addEmployeeSearchForm[key] = ''
    }
  })
  filteredNewEmployees.value = [...newEmployees.value]
  newEmployeeCurrentPage.value = 1
}

function handleNewEmployeeSizeChange(newSize) {
  newEmployeePageSize.value = newSize
  newEmployeeCurrentPage.value = 1
}

function handleNewEmployeeCurrentChange(newPage) {
  newEmployeeCurrentPage.value = newPage
}




// 處理表格選擇變更
function handleSelectionChange(selection) {
  selectedEmployees.value = selection
}

// 文件处理相关函数
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
      // 这里应该使用Excel解析库如xlsx来解析文件
      // 为了演示，我们模拟解析结果
      const mockData = [
        {
          employeeId: 'EMP2001',
          name: '批量员工1',
          idCard: '5555555',
          employeeType: '普通員工',
          salary: 25000,
          hasError: false
        },
        {
          employeeId: 'EMP2002',
          name: '批量员工2',
          idCard: '6666666',
          employeeType: '管理員工',
          salary: 22000,
          hasError: false
        },
        {
          employeeId: '',
          name: '错误员工',
          idCard: '7777777',
          employeeType: '普通員工',
          salary: 0,
          hasError: true
        }
      ]
      
      importPreview.value = mockData
      
      // 检查错误
      const errors = []
      mockData.forEach((row, index) => {
        if (!row.employeeId) {
          errors.push({
            row: index + 2, // Excel行号从2开始（去除标题行）
            message: '员工编号不能为空'
          })
        }
        if (!row.salary || row.salary <= 0) {
          errors.push({
            row: index + 2,
            message: '薪资必须大于0'
          })
        }
      })
      
      importErrors.value = errors
      
      if (errors.length === 0) {
        ElMessage.success(`成功解析 ${mockData.length} 条员工数据`)
      } else {
        ElMessage.warning(`解析完成，发现 ${errors.length} 个错误`)
      }
    } catch (error) {
      ElMessage.error('文件解析失败，请检查文件格式')
      console.error('Excel解析错误:', error)
    }
  }
  reader.readAsArrayBuffer(file)
}

function downloadImportTemplate() {
  const csvContent = "员工编号,中文姓名,证件号码,適用對象,薪资\n" +
                   "EMP2001,张三,1234567890,普通員工,25000\n" +
                   "EMP2002,李四,2345678901,管理員工,22000"
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', '员工批量导入模板.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function clearImportData() {
  fileList.value = []
  importPreview.value = []
  importErrors.value = []
  
  // 清空上传组件
  if (uploadRef.value) {
    uploadRef.value.clearFiles()
  }
}

function confirmBulkImport() {
  if (importPreview.value.length === 0) {
    ElMessage.error('请先上传文件')
    return
  }
  
  if (importErrors.value.length > 0) {
    ElMessage.error('请先修复所有错误')
    return
  }
  
  ElMessageBox.confirm(
    `确定要导入 ${importPreview.value.length} 个员工吗？`,
    '确认导入',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 将导入的数据添加到员工列表
    importPreview.value.forEach(emp => {
      if (!emp.hasError) {
        const newEmployee = {
          employeeId: emp.employeeId,
          name: emp.name,
          englishName: '',
          idCard: emp.idCard,
          idType: '澳门居民身份证',
          phone: '',
          email: '',
          hireDate: new Date().toISOString().split('T')[0],
          employeeType: emp.employeeType,
          planJoinDate: new Date().toISOString().split('T')[0],
          salary: emp.salary,
          registrationStatus: '新增',
          planId: selectedPlan.id
        }
        newEmployees.value.push(newEmployee)
      }
    })
    
    // 更新筛选后的数据
    filteredNewEmployees.value = [...newEmployees.value]
    
    // 关闭对话框并清空数据
    bulkImportDialogVisible.value = false
    clearImportData()
    
    ElMessage.success(`成功导入 ${importPreview.value.filter(emp => !emp.hasError).length} 个员工`)
  }).catch(() => {
    ElMessage.info('已取消导入')
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
      hireDate: '2022-01-15',
      employeeType: '普通員工'
    },
    {
      value: '李小紅',
      employeeId: 'EMP002', 
      idNumber: '2345678901',
      hireDate: '2023-03-20',
      employeeType: '管理員工'
    },
    {
      value: '王志強',
      employeeId: 'EMP003',
      idNumber: '3456789012', 
      hireDate: '2021-08-10',
      employeeType: '高級管理員工'
    },
    {
      value: '張美麗',
      employeeId: 'EMP004',
      idNumber: '4567890123',
      hireDate: '2022-05-12',
      employeeType: '管理員工'
    },
    {
      value: '劉建華',
      employeeId: 'EMP005',
      idNumber: '5678901234',
      hireDate: '2020-12-01',
      employeeType: '普通員工'
    },
    {
      value: '黃大明',
      employeeId: 'EMP006',
      idNumber: '6789012345',
      hireDate: '2021-06-01',
      employeeType: '高級管理員工'
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
  // 自動填入相關信息
  employeeForm.employeeId = item.employeeId || generateEmployeeId()
  employeeForm.idNumber = item.idNumber
  employeeForm.hireDate = item.hireDate
  employeeForm.employeeCategory = item.employeeType
  
  // 觸發驗證
  validateNameFields()
}

// 組件掛載時初始化
onMounted(() => {
  initNewEmployees()
})
</script>

<style scoped>
.employee-invite {
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

/* 計劃信息區域 */
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

/* 頁面標題 */
.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.main-content {
  margin-bottom: 20px;
}

.main-tab-nav {
  display: flex;
  background: #f8f9fa;
  border-radius: 6px 6px 0 0;
  border: 1px solid #e9ecef;
  border-bottom: none;
  width: fit-content;
}

.main-tab-item {
  text-align: center;
  padding: 15px 30px;
  background: #f8f9fa;
  border-right: 1px solid #e9ecef;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  color: #495057;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.main-tab-item:last-child {
  border-right: none;
  border-radius: 0 6px 0 0;
}

.main-tab-item:first-child {
  border-radius: 6px 0 0 0;
}

.main-tab-item.active {
  background: #ffffff;
  color: #40a98f;
  border-bottom: 2px solid #40a98f;
  font-weight: 600;
}

.tab-count {
  background: #40a98f;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 500;
}

.main-tab-item.active .tab-count {
  background: #40a98f;
}

.main-tab-content {
  border: 1px solid #e9ecef;
  border-radius: 0 8px 8px 8px;
  background: white;
}

.tab-panel {
  padding: 20px;
}

.sub-tab-nav {
  display: flex;
  gap: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #e9ecef;
}

.sub-tab-item {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  color: #666;
  font-size: 14px;
  transition: all 0.3s;
}

.sub-tab-item.active {
  color: #40a98f;
  border-bottom-color: #40a98f;
  font-weight: 600;
}

.employee-list-section {
  margin-top: 20px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  align-items: center;
}

.list-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.list-info {
  font-size: 14px;
  color: #6b7280;
}

.employee-section {
  margin-bottom: 24px;
  width: 100%;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  color: #667eea;
}


.action-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.employee-table {
  margin-bottom: 20px;
}

.action-buttons .el-button span {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.action-buttons .el-button i {
  margin-right: 6px;
}

.action-buttons .el-button .el-button__loading {
  margin-right: 6px;
}

.header-right .action-buttons .el-button {
  min-width: auto;
  white-space: nowrap;
}

.header-right .action-buttons .el-button .el-icon {
  margin-right: 4px;
}

/* 強制按鈕內容居中 */
.action-buttons .el-button {
  justify-content: center !important;
}

.action-buttons .el-button > span {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
}

/* Element Plus 圖標樣式調整 */
.action-buttons .el-button [class*="el-icon"] {
  margin-right: 4px !important;
  vertical-align: middle !important;
}

/* 表格容器 */
.employee-table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border: 1px solid #e5e7eb;
  width: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  align-items: center;
}

.table-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.table-info {
  font-size: 14px;
  color: #6b7280;
}

.employee-table {
  overflow-x: auto;
  width: 100%;
  padding: 0;
}

.employee-table .el-table {
  width: 100% !important;
  margin: 0;
}

.employee-table .el-table th,
.employee-table .el-table td {
  padding: 12px 8px !important;
}

.employee-table .el-table th:first-child,
.employee-table .el-table td:first-child {
  padding-left: 16px !important;
}

.employee-table .el-table th:last-child,
.employee-table .el-table td:last-child {
  padding-right: 16px !important;
}

.employee-table .el-table {
  table-layout: fixed !important;
}

.employee-table .el-table .el-table__body-wrapper {
  width: 100% !important;
}

.employee-table .el-table .el-table__header-wrapper {
  width: 100% !important;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.footer-left {
  display: flex;
  align-items: center;
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.selected-info i {
  color: #10b981;
}

.footer-right {
  display: flex;
  align-items: center;
}

.submit-actions {
  display: flex;
  gap: 12px;
}

.submit-actions .el-button {
  border-radius: 8px;
  font-weight: 500;
  padding: 12px 24px;
}


.todo-table {
  margin-bottom: 20px;
}

.employee-list-section .todo-table {
  border: 1px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 8px 8px;
  background: white;
  overflow: hidden;
}

.filter-area {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
}

.filter-actions {
  display: flex;
  gap: 10px;
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

.form-group-full {
  width: 100%;
}

.form-row.single-field {
  grid-template-columns: 1fr;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 20px 25px;
  border-top: 1px solid #e9ecef;
  background: #f8f9fa;
}

.el-form-item {
  margin-bottom: 15px;
}

.el-form-item__label {
  font-weight: 500 !important;
  color: #2d3436 !important;
}

.el-input__inner,
.el-select .el-input__inner {
  border-radius: 6px;
  transition: border-color 0.3s ease;
}

.el-input__inner:focus,
.el-select .el-input__inner:focus {
  border-color: #40a98f;
}

.required-label::before {
  content: '*';
  color: #e74c3c;
  margin-right: 4px;
}

.el-tag--large {
  padding: 8px 16px;
  font-size: 14px;
}

.form-section:last-child {
  border: 1px solid #e6f7ff;
  background: #f6ffed;
}

.form-section:last-child .section-title {
  color: #52c41a;
  border-bottom-color: #52c41a;
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

/* 查詢按鈕組樣式 */
.filter-buttons-group {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.filter-buttons-group .filter-buttons {
  margin-top: auto;
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


.stats-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-label {
  color: #666;
  font-size: 14px;
}

.stats-value {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.stats-value.success {
  color: #52c41a;
}

.stats-value.warning {
  color: #faad14;
}

.stats-value.danger {
  color: #f5222d;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.pagination-info {
  color: #909399;
  font-size: 14px;
  margin-right: 16px;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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


/* 發出邀約按鈕樣式 */
.btn-invite {
  background: #67c23a;
  color: white;
  border: 1px solid #67c23a;
}

.btn-invite:hover {
  background: #85ce61;
  border-color: #85ce61;
  color: white;
}

.btn-invite:disabled {
  background: #c0c4cc;
  border-color: #c0c4cc;
  color: #ffffff;
  cursor: not-allowed;
}

/* 響應式設計 */
@media (max-width: 1200px) {
  .plan-info-row {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .employee-invite {
    padding: 16px;
  }
  
  .page-header-section {
    padding: 16px 20px;
  }
  
  .page-title h1 {
    font-size: 20px;
  }
  
  .plan-info-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-buttons .el-button {
    width: 100%;
  }
  
  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-left,
  .header-right {
    justify-content: center;
  }
  
  .header-left {
    flex-direction: column;
    gap: 8px;
  }
  
  .main-tab-nav {
    width: 100%;
    padding: 4px;
  }
  
  .main-tab-item {
    flex: 1;
    justify-content: center;
    padding: 10px 16px;
  }
  
  .table-footer {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .footer-left,
  .footer-right {
    justify-content: center;
  }
}

/* 加載動畫 */
.employee-invite * {
  transition: all 0.3s ease;
}

/* 表格優化 */
.el-table {
  border-radius: 0;
}

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

/* 卡片陰影動畫 */
.plan-info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.employee-table-container:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.function-toolbar:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 僱員詳情對話框樣式 */
.employee-detail-dialog .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
}

.employee-detail-content {
  padding: 0;
}

.detail-section {
  margin-bottom: 24px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.detail-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  border-bottom: 2px solid #40a98f;
  padding-bottom: 8px;
}

.detail-section-title i {
  color: #40a98f;
  font-size: 18px;
}

/* 計劃信息高亮 */
.plan-info-highlight {
  background: linear-gradient(135deg, #40a98f 0%, #2d7a6a 100%);
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.plan-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.plan-label {
  font-size: 16px;
  font-weight: 500;
}

.plan-value {
  font-size: 18px;
  font-weight: 700;
}

/* 信息區塊樣式 */
.info-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #40a98f;
}

.info-section-header {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: #40a98f;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  align-items: start;
}

/* 緊湊信息網格樣式 */
.info-grid-compact {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px 16px;
  align-items: start;
  padding: 0;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-field.full-width {
  grid-column: 1 / -1;
}

.field-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.field-label.required::after {
  content: '*';
  color: #ef4444;
  margin-left: 4px;
}

.field-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
  padding: 8px 0;
  border-bottom: 1px solid transparent;
}

.field-input {
  width: 100%;
}

/* 供款詳情樣式 */
.contribution-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.contribution-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contribution-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* 投資分配樣式 */
.allocation-table {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.allocation-header-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  background: #f8f9fa;
  border-bottom: 2px solid #40a98f;
}

.fund-name-header,
.allocation-header {
  padding: 12px;
  font-weight: 600;
  color: #374151;
  text-align: center;
  font-size: 14px;
}

.fund-name-header {
  text-align: left;
  border-right: 1px solid #e5e7eb;
}

.allocation-header {
  border-right: 1px solid #e5e7eb;
}

.allocation-header:last-child {
  border-right: none;
}

.allocation-data-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  border-bottom: 1px solid #f3f4f6;
}

.allocation-data-row:last-child {
  border-bottom: none;
}

.fund-name {
  padding: 16px 12px;
  font-size: 14px;
  color: #374151;
  font-weight: 500;
  border-right: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
}

.allocation-input-cell {
  padding: 12px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
}

.allocation-input-cell:last-child {
  border-right: none;
}

.allocation-input-cell .el-input {
  width: 100%;
}

/* 附件樣式 */
.attachments {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 12px;
}

/* 批量导入对話框樣式 */
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

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.attachment-item:hover {
  border-color: #40a98f;
  background: #f0f9f7;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 169, 143, 0.2);
}

.attachment-item i {
  color: #40a98f;
  font-size: 20px;
  flex-shrink: 0;
}

.attachment-item span {
  font-weight: 500;
}

/* 緊湊型投資分配表格 */
.allocation-table-compact {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 8px;
}

.allocation-table-compact .allocation-header-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  background: #f8f9fa;
  border-bottom: 2px solid #40a98f;
}

.allocation-table-compact .fund-name-header,
.allocation-table-compact .allocation-header {
  padding: 8px;
  font-weight: 600;
  color: #374151;
  text-align: center;
  font-size: 12px;
}

.allocation-table-compact .fund-name-header {
  text-align: left;
  border-right: 1px solid #e5e7eb;
}

.allocation-table-compact .allocation-header {
  border-right: 1px solid #e5e7eb;
}

.allocation-table-compact .allocation-header:last-child {
  border-right: none;
}

.allocation-table-compact .allocation-data-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  border-bottom: 1px solid #f3f4f6;
}

.allocation-table-compact .allocation-data-row:last-child {
  border-bottom: none;
}

.allocation-table-compact .fund-name {
  padding: 8px;
  font-size: 12px;
  color: #374151;
  font-weight: 500;
  border-right: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
}

.allocation-table-compact .allocation-input-cell {
  padding: 6px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
}

.allocation-table-compact .allocation-input-cell:last-child {
  border-right: none;
}

.allocation-table-compact .allocation-input-cell .el-input {
  width: 100%;
}

/* 緊湊型附件樣式 */
.attachments-compact {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 8px;
}

.attachments-compact .attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  color: #374151;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.attachments-compact .attachment-item:hover {
  border-color: #40a98f;
  background: #f0f9f7;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(64, 169, 143, 0.2);
}

.attachments-compact .attachment-item i {
  color: #40a98f;
  font-size: 16px;
  flex-shrink: 0;
}

.attachments-compact .attachment-item span {
  font-weight: 500;
  font-size: 12px;
}

/* 邀約成功對話框樣式 */
:deep(.invite-success-dialog) {
  width: 650px !important;
  max-width: 90vw !important;
  border-radius: 12px !important;
  overflow: hidden !important;
}

:deep(.invite-success-dialog .el-message-box__header) {
  padding: 24px 24px 16px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e2e8f0;
}

:deep(.invite-success-dialog .el-message-box__title) {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.invite-success-dialog .el-message-box__content) {
  padding: 24px;
  text-align: left;
  background: #ffffff;
}

:deep(.invite-success-dialog .el-message-box__btns) {
  padding: 16px 24px 24px 24px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  text-align: center;
}

:deep(.invite-success-dialog .el-button--primary) {
  padding: 12px 32px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

:deep(.invite-success-dialog .el-button--primary:hover) {
  background: linear-gradient(135deg, #66b1ff 0%, #85c1ff 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

:deep(.invite-confirm-dialog) {
  width: 480px !important;
  max-width: 90vw !important;
  border-radius: 8px !important;
}

:deep(.invite-confirm-dialog .el-message-box__header) {
  padding: 20px 20px 10px 20px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.invite-confirm-dialog .el-message-box__title) {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 响应式设计 */
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
  
  :deep(.invite-success-dialog),
  :deep(.invite-confirm-dialog) {
    width: 95vw !important;
    margin: 5vh auto !important;
  }
}
</style> 