<template>
  <div class="central-fund-todo">
    <!-- 主標籤導航 -->
    <div class="main-tab-container">
      <div class="main-tab-nav">
        <div 
          class="main-tab-item" 
          :class="{ active: activeMainTab === 'registration' }"
          @click="switchMainTab('registration')"
        >
          新加入計劃申請
          <span class="tab-count">{{ filteredRegistrationTodos.length }}</span>
        </div>
        <div 
          class="main-tab-item" 
          :class="{ active: activeMainTab === 'termination' }"
          @click="switchMainTab('termination')"
        >
          終止參與計劃申請
          <span class="tab-count">{{ filteredTerminationTodos.length }}</span>
        </div>
        <div 
          class="main-tab-item" 
          :class="{ active: activeMainTab === 'transfer' }"
          @click="switchMainTab('transfer')"
        >
          調職申請
          <span class="tab-count">{{ filteredTransferTodos.length }}</span>
        </div>
        <div 
          class="main-tab-item" 
          :class="{ active: activeMainTab === 'review' }"
          @click="switchMainTab('review')"
        >
          調薪申請
          <span class="tab-count">{{ filteredReviewTodos.length }}</span>
        </div>
        <div 
          class="main-tab-item" 
          :class="{ active: activeMainTab === 'manual-contribution' }"
          @click="switchMainTab('manual-contribution')"
        >
          手動供款清單審批
          <span class="tab-count">{{ filteredManualContributionTodos.length }}</span>
        </div>
      </div>

      <!-- 標籤內容 -->
      <div class="main-tab-content">
        <!-- 新加入待辦 -->
        <div v-show="activeMainTab === 'registration'" class="tab-panel">
          <!-- 查詢篩選區域 -->
          <div class="query-form">
            <div class="filter-row">
              <div class="filter-group">
                <span class="filter-label">計劃編號</span>
                <el-input 
                  v-model="registrationSearchForm.planCode" 
                  placeholder="請輸入" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">僱員姓名</span>
                <el-input 
                  v-model="registrationSearchForm.employeeName" 
                  placeholder="請輸入" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">證件號碼</span>
                <el-input 
                  v-model="registrationSearchForm.idCard" 
                  placeholder="請輸入" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">適用對象</span>
                <el-select 
                  v-model="registrationSearchForm.employeeType" 
                  placeholder="請選擇"
                  class="filter-select"
                >
                  <el-option label="全部" value="" />
                  <el-option label="A類" value="A類" />
                  <el-option label="B類" value="B類" />
                  <el-option label="C類" value="C類" />
                </el-select>
              </div>
              <div class="filter-group">
                <span class="filter-label">狀態</span>
                <el-select 
                  v-model="registrationSearchForm.status" 
                  placeholder="請選擇"
                  class="filter-select"
                >
                  <el-option label="全部" value="" />
                  <el-option label="不參與" value="不參與" />
                  <el-option label="待提交確認" value="待提交確認" />
                  <el-option label="待提交審核" value="待提交審核" />
                </el-select>
              </div>
            </div>
            <div class="button-row">
              <div class="left-buttons">
                <el-button @click="resetRegistrationSearch" class="btn-reset">重置</el-button>
                <el-button type="primary" @click="searchRegistration" class="btn-search">查詢</el-button>
              </div>
              <div class="right-buttons">
                <el-button 
                  type="primary" 
                  @click="batchSubmitRegistration"
                  :disabled="selectedRegistrationTodos.length === 0"
                >
                  批量提交
                  <span v-if="selectedRegistrationTodos.length > 0">({{ selectedRegistrationTodos.length }})</span>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 員工列表表格 -->
          <div class="employee-table">
            <el-table 
              :data="paginatedRegistrationTodos" 
              style="width: 100%"
              :row-class-name="getRowClassName"
              @selection-change="handleRegistrationSelectionChange"
            >
              <el-table-column 
                type="selection" 
                width="55" 
                :selectable="isRowSelectable"
              />
              <el-table-column prop="planCode" label="計劃編號" min-width="120" />
              <el-table-column prop="employeeName" label="僱員中文姓名" min-width="120" />
              <el-table-column prop="idCard" label="證件號碼" min-width="150" />
              <el-table-column prop="hireDate" label="受聘日期" min-width="120" />
              <el-table-column prop="employeeType" label="適用對象" min-width="100" />
              <el-table-column prop="planJoinDate" label="參加計劃日期" min-width="140" />
              <el-table-column prop="salary" label="僱員薪金" min-width="100">
                <template #default="scope">
                  <span v-if="scope.row.salary">{{ formatCurrency(scope.row.salary) }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="狀態" min-width="120">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)" size="small">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="scope">
                  <div class="table-action-buttons">
                    <el-button size="small" @click="viewTodoDetail(scope.row)">查看</el-button>
                    <el-button 
                      v-if="scope.row.status === '不參與'" 
                      size="small" 
                      type="warning" 
                      @click="downloadStatement(scope.row)"
                    >
                      下載聲明書
                    </el-button>
                    <el-button 
                      v-if="scope.row.status === '待提交確認'" 
                      size="small" 
                      type="primary" 
                      @click="submitConfirmation(scope.row)"
                    >
                      提交確認
                    </el-button>
                    <el-button 
                      v-if="scope.row.status === '待提交審核'" 
                      size="small" 
                      type="success" 
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
                共計 {{ filteredRegistrationTodos.length }} 筆記錄
              </div>
              <el-pagination
                v-model:current-page="registrationCurrentPage"
                v-model:page-size="registrationPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="filteredRegistrationTodos.length"
                layout="sizes, prev, pager, next, jumper"
                background
                @size-change="handleRegistrationSizeChange"
                @current-change="handleRegistrationCurrentChange"
              />
            </div>
          </div>
        </div>

        <!-- 終止參與計劃待辦 -->
        <div v-show="activeMainTab === 'termination'" class="tab-panel">
          <!-- 查詢篩選區域 -->
          <div class="query-form">
            <div class="filter-row">
              <div class="filter-group">
                <span class="filter-label">計劃編號</span>
                <el-input 
                  v-model="terminationSearchForm.planCode" 
                  placeholder="請輸入計劃編號" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">僱員姓名</span>
                <el-input 
                  v-model="terminationSearchForm.employeeName" 
                  placeholder="請輸入僱員姓名" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">證件號碼</span>
                <el-input 
                  v-model="terminationSearchForm.idCard" 
                  placeholder="請輸入證件號碼" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">最後供款月份</span>
                <el-date-picker 
                  v-model="terminationSearchForm.terminationTime" 
                  type="month"
                  placeholder="請選擇月份"
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">狀態</span>
                <el-select 
                  v-model="terminationSearchForm.status" 
                  placeholder="請選擇狀態"
                  class="filter-select"
                >
                  <el-option label="全部" value="" />
                  <el-option label="待提交審核" value="待提交審核" />
                </el-select>
              </div>
            </div>
            <div class="button-row">
              <div class="left-buttons">
                <el-button @click="resetTerminationSearch" class="btn-reset">重置</el-button>
                <el-button type="primary" @click="searchTermination" class="btn-search">查詢</el-button>
              </div>
              <div class="right-buttons">
                <el-button 
                  type="primary" 
                  @click="batchSubmitTermination"
                  :disabled="selectedTerminationTodos.length === 0"
                >
                  批量提交
                  <span v-if="selectedTerminationTodos.length > 0">({{ selectedTerminationTodos.length }})</span>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 終止參與計劃待辦表格 -->
          <div class="employee-table">
            <el-table 
              :data="paginatedTerminationTodos" 
              style="width: 100%"
              :row-class-name="getRowClassName"
              @selection-change="handleTerminationSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="planCode" label="計劃編號" min-width="120" />
              <el-table-column prop="employeeName" label="僱員中文姓名" min-width="120" />
              <el-table-column prop="idCard" label="證件號碼" min-width="150" />
              <el-table-column prop="hireDate" label="受僱日期" min-width="120" />
              <el-table-column prop="lastEmploymentDate" label="最後受僱日期" min-width="120">
                <template #default="scope">
                  <span>{{ scope.row.lastEmploymentDate || scope.row.hireDate }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="lastContributionMonth" label="最後供款月份" min-width="120">
                <template #default="scope">
                  <span>2025/3</span>
                </template>
              </el-table-column>
              <el-table-column prop="effectiveDate" label="生效日期" min-width="100">
                <template #default="scope">
                  <span>2025/4</span>
                </template>
              </el-table-column>
              <el-table-column prop="terminationReason" label="終止原因" min-width="100">
                <template #default="scope">
                  <span>{{ scope.row.terminationReason || '離職' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="狀態" min-width="120">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)" size="small">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" fixed="right">
                <template #default="scope">
                  <div class="table-action-buttons">
                    <el-button size="small" @click="viewTodoDetail(scope.row)">查看</el-button>
                    <el-button size="small" type="primary" @click="submitSingleTodo(scope.row)">提交審核</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分頁 -->
            <div class="pagination-container">
              <div class="pagination-info">
                共計 {{ filteredTerminationTodos.length }} 筆記錄
              </div>
              <el-pagination
                v-model:current-page="terminationCurrentPage"
                v-model:page-size="terminationPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="filteredTerminationTodos.length"
                layout="sizes, prev, pager, next, jumper"
                background
                @size-change="handleTerminationSizeChange"
                @current-change="handleTerminationCurrentChange"
              />
            </div>
          </div>
        </div>

        <!-- 調職待辦 -->
        <div v-show="activeMainTab === 'transfer'" class="tab-panel">
          <!-- 查詢篩選區域 -->
          <div class="query-form">
            <div class="filter-row">
              <div class="filter-group">
                <span class="filter-label">計劃編號</span>
                <el-input 
                  v-model="transferSearchForm.planCode" 
                  placeholder="請輸入計劃編號" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">僱員姓名</span>
                <el-input 
                  v-model="transferSearchForm.employeeName" 
                  placeholder="請輸入僱員姓名" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">原計劃編號</span>
                <el-input 
                  v-model="transferSearchForm.originalPlan" 
                  placeholder="請輸入原計劃編號" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">新計劃編號</span>
                <el-input 
                  v-model="transferSearchForm.newPlan" 
                  placeholder="請輸入新計劃編號" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">狀態</span>
                <el-select 
                  v-model="transferSearchForm.status" 
                  placeholder="請選擇狀態"
                  class="filter-select"
                >
                  <el-option label="全部" value="" />
                  <el-option label="待提交審核" value="待提交審核" />
                </el-select>
              </div>
            </div>
            <div class="button-row">
              <div class="left-buttons">
                <el-button @click="resetTransferSearch" class="btn-reset">重置</el-button>
                <el-button type="primary" @click="searchTransfer" class="btn-search">查詢</el-button>
              </div>
              <div class="right-buttons">
                <el-button 
                  type="primary" 
                  @click="batchSubmitTransfer"
                  :disabled="selectedTransferTodos.length === 0"
                >
                  批量提交
                  <span v-if="selectedTransferTodos.length > 0">({{ selectedTransferTodos.length }})</span>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 調職待辦表格 -->
          <div class="employee-table">
            <el-table 
              :data="paginatedTransferTodos" 
              style="width: 100%"
              :row-class-name="getRowClassName"
              @selection-change="handleTransferSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="planCode" label="計劃編號" min-width="120" />
              <el-table-column prop="employeeName" label="僱員中文姓名" min-width="120" />
              <el-table-column prop="idCard" label="證件號碼" min-width="150" />
              <el-table-column prop="hireDate" label="初始受僱日期" min-width="120" />
              <el-table-column prop="originalPlanTransferDate" label="原計劃轉出日期" min-width="120">
                <template #default="scope">
                  <span>{{ scope.row.originalPlanTransferDate || '2025/3/31' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="newPlanJoinDate" label="新計劃加入日期" min-width="120">
                <template #default="scope">
                  <span>{{ scope.row.newPlanJoinDate || '2025/4/1' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="newPlanCode" label="新計劃編號" min-width="100">
                <template #default="scope">
                  <span>{{ scope.row.newPlanCode || 'ER67890' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="newEmployeeType" label="新適用對象" min-width="100">
                <template #default="scope">
                  <span>{{ scope.row.newEmployeeType || 'B類' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="originalSalary" label="原僱員薪金" min-width="120">
                <template #default="scope">
                  <span v-if="scope.row.originalSalary">{{ formatCurrency(scope.row.originalSalary) }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="newSalary" label="新僱員薪金" min-width="120">
                <template #default="scope">
                  <span v-if="scope.row.newSalary">{{ formatCurrency(scope.row.newSalary) }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="狀態" min-width="120">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)" size="small">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" fixed="right">
                <template #default="scope">
                  <div class="table-action-buttons">
                    <el-button size="small" @click="viewTodoDetail(scope.row)">查看</el-button>
                    <el-button size="small" type="primary" @click="submitSingleTodo(scope.row)">提交審核</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分頁 -->
            <div class="pagination-container">
              <div class="pagination-info">
                共計 {{ filteredTransferTodos.length }} 筆記錄
              </div>
              <el-pagination
                v-model:current-page="transferCurrentPage"
                v-model:page-size="transferPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="filteredTransferTodos.length"
                layout="sizes, prev, pager, next, jumper"
                background
                @size-change="handleTransferSizeChange"
                @current-change="handleTransferCurrentChange"
              />
            </div>
          </div>
        </div>

        <!-- 調薪申請 -->
        <div v-show="activeMainTab === 'review'" class="tab-panel">
          <!-- 查詢篩選區域 -->
          <div class="query-form">
            <div class="filter-row">
              <div class="filter-group">
                <span class="filter-label">計劃編號</span>
                <el-input 
                  v-model="reviewSearchForm.planCode" 
                  placeholder="請輸入計劃編號" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">僱員姓名</span>
                <el-input 
                  v-model="reviewSearchForm.employeeName" 
                  placeholder="請輸入僱員姓名" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">生效日期</span>
                <el-date-picker 
                  v-model="reviewSearchForm.effectiveDate" 
                  type="date"
                  placeholder="請選擇生效日期"
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">狀態</span>
                <el-select 
                  v-model="reviewSearchForm.status" 
                  placeholder="請選擇狀態"
                  class="filter-select"
                >
                  <el-option label="全部" value="" />
                  <el-option label="待提交審核" value="待提交審核" />
                </el-select>
              </div>
            </div>
            <div class="button-row">
              <div class="left-buttons">
                <el-button @click="resetReviewSearch" class="btn-reset">重置</el-button>
                <el-button type="primary" @click="searchReview" class="btn-search">查詢</el-button>
              </div>
              <div class="right-buttons">
                <el-button 
                  type="primary" 
                  @click="batchSubmitReview"
                  :disabled="selectedReviewTodos.length === 0"
                >
                  批量提交
                  <span v-if="selectedReviewTodos.length > 0">({{ selectedReviewTodos.length }})</span>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 調薪申請表格 -->
          <div class="employee-table">
            <el-table 
              :data="paginatedReviewTodos" 
              style="width: 100%"
              :row-class-name="getRowClassName"
              @selection-change="handleReviewSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="planCode" label="計劃編號" min-width="120" />
              <el-table-column prop="employeeName" label="僱員姓名" min-width="120" />
              <el-table-column prop="idCard" label="證件號碼" min-width="150" />
              <el-table-column prop="originalSalary" label="原僱員薪金" min-width="120">
                <template #default="scope">
                  <span v-if="scope.row.originalSalary">{{ formatCurrency(scope.row.originalSalary) }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="newSalary" label="新僱員薪金" min-width="120">
                <template #default="scope">
                  <span v-if="scope.row.newSalary">{{ formatCurrency(scope.row.newSalary) }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="effectiveDate" label="生效日期" min-width="120">
                <template #default="scope">
                  <span>{{ scope.row.effectiveDate || '2025/4/1' }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="狀態" min-width="120">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)" size="small">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" fixed="right">
                <template #default="scope">
                  <div class="table-action-buttons">
                    <el-button size="small" @click="viewTodoDetail(scope.row)">查看</el-button>
                    <el-button size="small" type="primary" @click="submitSingleTodo(scope.row)">提交審核</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分頁 -->
            <div class="pagination-container">
              <div class="pagination-info">
                共計 {{ filteredReviewTodos.length }} 筆記錄
              </div>
              <el-pagination
                v-model:current-page="reviewCurrentPage"
                v-model:page-size="reviewPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="filteredReviewTodos.length"
                layout="sizes, prev, pager, next, jumper"
                background
                @size-change="handleReviewSizeChange"
                @current-change="handleReviewCurrentChange"
              />
            </div>
          </div>
        </div>

        <!-- 手動供款清單審批 -->
        <div v-show="activeMainTab === 'manual-contribution'" class="tab-panel">
          <!-- 查詢篩選區域 -->
          <div class="query-form">
            <div class="filter-row">
              <div class="filter-group">
                <span class="filter-label">計劃編號</span>
                <el-input 
                  v-model="manualContributionSearchForm.planCode" 
                  placeholder="請輸入計劃編號" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">供款月份</span>
                <el-input 
                  v-model="manualContributionSearchForm.contributionMonth" 
                  placeholder="請輸入供款月份" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">供款類型</span>
                <el-select 
                  v-model="manualContributionSearchForm.contributionType" 
                  placeholder="請選擇供款類型"
                  class="filter-select"
                >
                  <el-option label="全部" value="" />
                  <el-option label="正常供款" value="正常供款" />
                  <el-option label="補繳供款" value="補繳供款" />
                  <el-option label="調整供款" value="調整供款" />
                </el-select>
              </div>
              <div class="filter-group">
                <span class="filter-label">提交人</span>
                <el-input 
                  v-model="manualContributionSearchForm.submitter" 
                  placeholder="請輸入提交人" 
                  class="filter-input"
                />
              </div>
              <div class="filter-group">
                <span class="filter-label">狀態</span>
                <el-select 
                  v-model="manualContributionSearchForm.status" 
                  placeholder="請選擇狀態"
                  class="filter-select"
                >
                  <el-option label="全部" value="" />
                  <el-option label="待提交審核" value="待提交審核" />
                </el-select>
              </div>
            </div>
            <div class="button-row">
              <div class="left-buttons">
                <el-button @click="resetManualContributionSearch" class="btn-reset">重置</el-button>
                <el-button type="primary" @click="searchManualContribution" class="btn-search">查詢</el-button>
              </div>
              <div class="right-buttons">
                <el-button 
                  type="primary" 
                  @click="batchSubmitManualContribution"
                  :disabled="selectedManualContributionTodos.length === 0"
                >
                  批量提交
                  <span v-if="selectedManualContributionTodos.length > 0">({{ selectedManualContributionTodos.length }})</span>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 手動供款清單審批表格 -->
          <div class="employee-table">
            <el-table 
              :data="paginatedManualContributionTodos" 
              style="width: 100%"
              :row-class-name="getRowClassName"
              @selection-change="handleManualContributionSelectionChange"
            >
              <el-table-column type="selection" width="55" />
              <el-table-column prop="planCode" label="計劃編號" min-width="120" />
              <el-table-column prop="contributionMonth" label="供款月份" min-width="120" />
              <el-table-column prop="contributionType" label="供款類型" min-width="120" />
              <el-table-column prop="totalAmount" label="總金額" min-width="120">
                <template #default="scope">
                  <span v-if="scope.row.totalAmount">{{ formatCurrency(scope.row.totalAmount) }}</span>
                  <span v-else>-</span>
                </template>
              </el-table-column>
              <el-table-column prop="employeeCount" label="參與人數" min-width="100" />
              <el-table-column prop="submitter" label="提交人" min-width="120" />
              <el-table-column prop="submitTime" label="提交時間" min-width="150" />
              <el-table-column prop="status" label="狀態" min-width="120">
                <template #default="scope">
                  <el-tag :type="getStatusType(scope.row.status)" size="small">
                    {{ scope.row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" fixed="right">
                <template #default="scope">
                  <div class="table-action-buttons">
                    <el-button size="small" @click="viewTodoDetail(scope.row)">查看</el-button>
                    <el-button size="small" type="primary" @click="submitSingleTodo(scope.row)">提交審核</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <!-- 分頁 -->
            <div class="pagination-container">
              <div class="pagination-info">
                共計 {{ filteredManualContributionTodos.length }} 筆記錄
              </div>
              <el-pagination
                v-model:current-page="manualContributionCurrentPage"
                v-model:page-size="manualContributionPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="filteredManualContributionTodos.length"
                layout="sizes, prev, pager, next, jumper"
                background
                @size-change="handleManualContributionSizeChange"
                @current-change="handleManualContributionCurrentChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 待辦詳情對話框 -->
    <el-dialog 
      v-model="todoDetailDialogVisible" 
      :title="getDialogTitle()" 
      width="800px"
      :close-on-click-modal="false"
      class="employee-detail-dialog compact-dialog"
    >
      <div v-if="currentTodo && activeMainTab === 'registration' && currentTodo.status === '不參與'" class="todo-detail">
        <!-- 不參與狀態 - 僅顯示簡化字段 -->
        <div class="detail-section">
          <h4 class="detail-title">基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item" style="grid-column: 1 / -1;">
              <span class="detail-label">計劃編號：</span>
              <span class="detail-value">{{ currentTodo.planCode }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">僱員編號：</span>
              <span class="detail-value">{{ currentTodo.employeeId || 'EMP001' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">僱員中文姓名：</span>
              <span class="detail-value">{{ currentTodo.employeeName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">英文姓氏：</span>
              <span class="detail-value">{{ getEnglishSurname(currentTodo.employeeName) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">英文名字：</span>
              <span class="detail-value">{{ getEnglishGivenName(currentTodo.employeeName) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">證件類型：</span>
              <span class="detail-value">澳門居民身份證</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">證件號碼：</span>
              <span class="detail-value">{{ currentTodo.idCard }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">流動電話：</span>
              <span class="detail-value">13912345123</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">電郵地址：</span>
              <span class="detail-value">123151231@126.com</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">受聘日期：</span>
              <span class="detail-value">{{ currentTodo.hireDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">適用對象：</span>
              <span class="detail-value">{{ currentTodo.employeeType }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">參加計劃日期：</span>
              <span class="detail-value">{{ currentTodo.planJoinDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">僱員薪金：</span>
              <span class="detail-value">{{ formatCurrency(currentTodo.salary) }}</span>
            </div>
          </div>
        </div>

        <!-- 申請人信息 -->
        <div class="detail-section">
          <h4 class="detail-title">申請信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">申請人：</span>
              <span class="detail-value">{{ getApplicant() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">申請時間：</span>
              <span class="detail-value">{{ getApplicationTime() }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="currentTodo && activeMainTab === 'registration'" class="todo-detail">
        <!-- 待提交確認和待提交審核狀態 - 顯示完整信息 -->
        <div class="detail-section">
          <h4 class="detail-title">基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item" style="grid-column: 1 / -1;">
              <span class="detail-label">計劃編號：</span>
              <span class="detail-value">{{ currentTodo.planCode }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">僱員編號：</span>
              <span class="detail-value">{{ currentTodo.employeeId || 'EMP001' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">僱員中文姓名：</span>
              <span class="detail-value">{{ currentTodo.employeeName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">英文姓氏：</span>
              <span class="detail-value">{{ getEnglishSurname(currentTodo.employeeName) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">英文名字：</span>
              <span class="detail-value">{{ getEnglishGivenName(currentTodo.employeeName) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">證件類型：</span>
              <span class="detail-value">澳門居民身份證</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">證件號碼：</span>
              <span class="detail-value">{{ currentTodo.idCard }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">出生日期：</span>
              <span class="detail-value">26/01/1985</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">性別：</span>
              <span class="detail-value">男</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">出生地點：</span>
              <span class="detail-value">澳門/中國</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">國籍/地區：</span>
              <span class="detail-value">中國</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">流動電話：</span>
              <span class="detail-value">13912345123</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">固定電話：</span>
              <span class="detail-value">1234-2341231</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">電郵地址：</span>
              <span class="detail-value">123151231@126.com</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">住址 (永久地址)：</span>
              <span class="detail-value">澳門氹仔公住社會福陽色 澳門 澳門 中國</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">通訊地址：</span>
              <span class="detail-value">澳門氹仔公住社會福陽色 澳門 澳門 中國</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">受聘日期：</span>
              <span class="detail-value">{{ currentTodo.hireDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">適用對象：</span>
              <span class="detail-value">{{ currentTodo.employeeType }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">銜接類別：</span>
              <span class="detail-value">每年僱員</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">參加計劃日期：</span>
              <span class="detail-value">{{ currentTodo.planJoinDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">願參加私退金計劃日期：</span>
              <span class="detail-value">-</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">僱員薪金：</span>
              <span class="detail-value">{{ formatCurrency(currentTodo.salary) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">僱員供款比例：</span>
              <span class="detail-value">僱主預設</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">僱員供款計算基礎上下限：</span>
              <span class="detail-value">不設立</span>
            </div>
          </div>
        </div>

        <!-- 投資分配信息 -->
        <div class="detail-section">
          <h4 class="detail-title">歸屬於僱員的供款投放項目選擇</h4>
          <div class="detail-item">
            <div class="detail-value">
              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: left;">基金名稱</th>
                    <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">僱主供款合計比分</th>
                    <th style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">僱員供款合計比分</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="border: 1px solid #e5e7eb; padding: 8px;">中國人壽保險內分公司國際式平穩基金</td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">50%</td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">30%</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #e5e7eb; padding: 8px;">中國人壽保險內分公司國際式平衡基金</td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">20%</td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">40%</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #e5e7eb; padding: 8px;">中國人壽保險內分公司國際式成長基金</td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">30%</td>
                    <td style="border: 1px solid #e5e7eb; padding: 8px; text-align: center;">30%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 附件信息 -->
        <div class="detail-section">
          <h4 class="detail-title">附件</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">附件：</span>
              <div class="detail-value">
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <span style="background: #f8f9fa; border: 1px solid #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    <i class="el-icon-document" style="margin-right: 4px;"></i>證件正面
                  </span>
                  <span style="background: #f8f9fa; border: 1px solid #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    <i class="el-icon-document" style="margin-right: 4px;"></i>證件反面
                  </span>
                  <span style="background: #f8f9fa; border: 1px solid #e5e7eb; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    <i class="el-icon-document" style="margin-right: 4px;"></i>參加計劃申請表
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 申請人信息 -->
        <div class="detail-section">
          <h4 class="detail-title">申請信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">申請人：</span>
              <span class="detail-value">{{ getApplicant() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">申請時間：</span>
              <span class="detail-value">{{ getApplicationTime() }}</span>
            </div>
            <div class="detail-item" v-if="currentTodo.failureReason">
              <span class="detail-label">失敗原因：</span>
              <span class="detail-value error">{{ currentTodo.failureReason }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 其他切页的内容保持原样 -->
      <div v-else-if="currentTodo" class="todo-detail">
        <!-- 基本信息 -->
        <div class="detail-section">
          <h4 class="detail-title">基本信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">計劃編號：</span>
              <span class="detail-value">{{ currentTodo.planCode }}</span>
            </div>

            <!-- 終止參與計劃申請特有字段 -->
            <template v-if="activeMainTab === 'termination'">
              <div class="detail-item">
                <span class="detail-label">僱員編號：</span>
                <span class="detail-value">{{ currentTodo.employeeId || 'EMP001' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">僱員中文姓名：</span>
                <span class="detail-value">{{ currentTodo.employeeName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">證件號碼：</span>
                <span class="detail-value">{{ currentTodo.idCard }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">受僱日期：</span>
                <span class="detail-value">{{ currentTodo.hireDate }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">最後受僱日期：</span>
                <span class="detail-value">{{ currentTodo.lastEmploymentDate || currentTodo.hireDate }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">最後供款月份：</span>
                <span class="detail-value">2025/3</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">生效日期：</span>
                <span class="detail-value">2025/4</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">終止原因：</span>
                <span class="detail-value">{{ currentTodo.terminationReason || '離職' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">結餘處理表：</span>
                <span class="detail-value">
                  <el-button type="text" size="small" @click="viewBalanceDocument">查看文件</el-button>
                </span>
              </div>
            </template>

            <!-- 調職申請特有字段 -->
            <template v-if="activeMainTab === 'transfer'">
              <div class="detail-item">
                <span class="detail-label">原僱員編號：</span>
                <span class="detail-value">{{ currentTodo.originalEmployeeId || currentTodo.employeeId || 'EMP001' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">僱員中文姓名：</span>
                <span class="detail-value">{{ currentTodo.employeeName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">證件號碼：</span>
                <span class="detail-value">{{ currentTodo.idCard }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">初始受聘日期：</span>
                <span class="detail-value">{{ currentTodo.hireDate }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">原計劃轉出日期：</span>
                <span class="detail-value">{{ currentTodo.originalPlanTransferDate || '2025/3/31' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">新計劃加入日期：</span>
                <span class="detail-value">{{ currentTodo.newPlanJoinDate || '2025/4/1' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">新計劃編號：</span>
                <span class="detail-value">{{ currentTodo.newPlanCode || 'ER67890' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">新適用對象：</span>
                <span class="detail-value">{{ currentTodo.newEmployeeType || 'B類' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">僱員薪金：</span>
                <span class="detail-value">{{ formatCurrency(currentTodo.salary) }}</span>
              </div>
              <div class="detail-item" v-if="currentTodo.failureReason">
                <span class="detail-label">失敗原因：</span>
                <span class="detail-value error">{{ currentTodo.failureReason }}</span>
              </div>
            </template>

            <!-- 調薪申請特有字段 -->
            <template v-if="activeMainTab === 'review'">
              <div class="detail-item">
                <span class="detail-label">僱員編號：</span>
                <span class="detail-value">{{ currentTodo.originalEmployeeId || currentTodo.employeeId || 'EMP001' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">僱員中文姓名：</span>
                <span class="detail-value">{{ currentTodo.employeeName }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">證件號碼：</span>
                <span class="detail-value">{{ currentTodo.idCard }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">原僱員薪金：</span>
                <span class="detail-value">{{ formatCurrency(currentTodo.originalSalary) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">新僱員薪金：</span>
                <span class="detail-value">{{ formatCurrency(currentTodo.newSalary) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">生效日期：</span>
                <span class="detail-value">{{ currentTodo.effectiveDate || '2025/4/1' }}</span>
              </div>
            </template>

            <!-- 手動供款清單審批特有字段 -->
            <template v-if="activeMainTab === 'manual-contribution'">
              <div class="detail-item">
                <span class="detail-label">供款月份：</span>
                <span class="detail-value">{{ currentTodo.contributionMonth }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">供款類型：</span>
                <span class="detail-value">{{ currentTodo.contributionType }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">總金額：</span>
                <span class="detail-value">{{ formatCurrency(currentTodo.totalAmount) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">參與人數：</span>
                <span class="detail-value">{{ currentTodo.employeeCount }}人</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">提交人：</span>
                <span class="detail-value">{{ currentTodo.submitter }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">清單備註：</span>
                <span class="detail-value">{{ currentTodo.remarks || '無' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">供款清單：</span>
                <span class="detail-value">
                  <el-link 
                    type="primary" 
                    @click="downloadContributionList(currentTodo)"
                    icon="el-icon-download"
                  >
                    下載供款清單
                  </el-link>
                </span>
              </div>
            </template>

            <!-- 通用字段 -->
            <div class="detail-item" v-if="currentTodo.failureReason">
              <span class="detail-label">失敗原因：</span>
              <span class="detail-value error">{{ currentTodo.failureReason }}</span>
            </div>
          </div>
        </div>

        <!-- 申請人信息 -->
        <div class="detail-section">
          <h4 class="detail-title">申請信息</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">申請人：</span>
              <span class="detail-value">{{ getApplicant() }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">申請時間：</span>
              <span class="detail-value">{{ getApplicationTime() }}</span>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="todoDetailDialogVisible = false">關閉</el-button>
        <!-- 新加入計劃申請的專門按鈕 -->
        <template v-if="activeMainTab === 'registration'">
          <el-button 
            v-if="currentTodo.status === '不參與'" 
            type="warning" 
            @click="downloadStatement(currentTodo)"
          >
            下載聲明書
          </el-button>
          <el-button 
            v-if="currentTodo.status === '待提交確認'" 
            type="primary" 
            @click="submitConfirmation(currentTodo)"
          >
            提交確認
          </el-button>
          <el-button 
            v-if="currentTodo.status === '待提交審核'" 
            type="success" 
            @click="submitReview(currentTodo)"
          >
            提交審核
          </el-button>
        </template>
        <!-- 其他切頁的通用提交審核按鈕 -->
        <el-button 
          v-else
          type="primary" 
          @click="reviewCurrentTodo"
        >
          提交審核
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TodoDetailDialog from '@/components/central-fund/TodoDetailDialog.vue'

// 響應式數據
const activeMainTab = ref('registration')
const todoDetailDialogVisible = ref(false)
const currentTodo = ref(null)

const selectedPlan = reactive({
  id: 'ER12345',
  name: 'ER12345 集團統一央積金共同計劃',
  lastUpdate: '2025/01/19 14:30'
})




// 分頁數據
const registrationCurrentPage = ref(1)
const registrationPageSize = ref(5)
const terminationCurrentPage = ref(1)
const terminationPageSize = ref(5)
const transferCurrentPage = ref(1)
const transferPageSize = ref(5)
const reviewCurrentPage = ref(1)
const reviewPageSize = ref(5)
const manualContributionCurrentPage = ref(1)
const manualContributionPageSize = ref(5)

// 選中的待辦項
const selectedRegistrationTodos = ref([])
const selectedTerminationTodos = ref([])
const selectedTransferTodos = ref([])
const selectedReviewTodos = ref([])
const selectedManualContributionTodos = ref([])

// 查詢表單數據
const registrationSearchForm = reactive({
  planCode: '',
  employeeName: '',
  idCard: '',
  employeeType: '',
  status: ''
})

const terminationSearchForm = reactive({
  planCode: '',
  employeeName: '',
  idCard: '',
  terminationTime: '',
  status: ''
})

const transferSearchForm = reactive({
  planCode: '',
  employeeName: '',
  originalPlan: '',
  newPlan: '',
  status: ''
})

const reviewSearchForm = reactive({
  planCode: '',
  employeeName: '',
  effectiveDate: '',
  status: ''
})

const manualContributionSearchForm = reactive({
  planCode: '',
  contributionMonth: '',
  contributionType: '',
  submitter: '',
  status: ''
})

// 待辦數據
const todoData = reactive({
  registration: [
    {
      id: 'REG001',
      employeeId: 'EMP001',
      organizationCode: 'ORG001',
      employeeName: '陳大文',
      idCard: '1234567',
      hireDate: '2025/06/15',
      planCode: 'ER12345',
      employeeType: 'A類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/20',
      salary: 25000,
      employerContribution: 2500,
      employeeContribution: 1250,
      status: '不參與',
      failureReason: '',
      month: '2025/07',
      applicant: '人力資源部張經理',
      applicationTime: '2025/01/15 09:30'
    },
    {
      id: 'REG002',
      employeeId: 'EMP002',
      organizationCode: 'ORG002',
      employeeName: '李小紅',
      idCard: '2345678',
      hireDate: '2025/06/10',
      planCode: 'ER67890',
      employeeType: 'B類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/18',
      salary: 22000,
      employerContribution: 2200,
      employeeContribution: 1100,
      status: '確認失敗',
      failureReason: '聯絡方式無效',
      month: '2025/07',
      applicant: '財務部李主管',
      applicationTime: '2025/01/16 14:20'
    },
    {
      id: 'REG003',
      employeeId: 'EMP003',
      organizationCode: 'ORG003',
      employeeName: '王志強',
      idCard: '3456789',
      hireDate: '2025/05/20',
      planCode: 'ER12345',
      employeeType: 'A類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/15',
      salary: 28000,
      employerContribution: 2800,
      employeeContribution: 1400,
      status: '待提交審核',
      failureReason: '',
      month: '2025/07',
      applicant: '行政部王總監',
      applicationTime: '2025/01/17 11:45'
    },
    {
      id: 'REG004',
      employeeId: 'EMP004',
      organizationCode: 'ORG004',
      employeeName: '張美麗',
      idCard: '4567890',
      hireDate: '2025/06/12',
      planCode: 'ER67890',
      employeeType: 'B類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/16',
      salary: 24000,
      employerContribution: 2400,
      employeeContribution: 1200,
      status: '待提交確認',
      failureReason: '',
      month: '2025/07',
      applicant: '人力資源部陳專員',
      applicationTime: '2025/01/18 16:10'
    },
    {
      id: 'REG005',
      organizationCode: 'ORG005',
      employeeName: '劉建華',
      idCard: '5678901',
      hireDate: '2025/06/08',
      planCode: 'ER12345',
      employeeType: 'A類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/22',
      salary: 32000,
      employerContribution: 3200,
      employeeContribution: 1600,
      status: '確認失敗',
      failureReason: '證件號碼格式錯誤',
      month: '2025/07',
      applicant: '財務部劉經理',
      applicationTime: '2025/01/19 13:25'
    },
    {
      id: 'REG006',
      organizationCode: 'ORG006',
      employeeName: '黃大偉',
      idCard: '6789012',
      hireDate: '2025/06/20',
      planCode: 'ER12345',
      employeeType: 'C類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/25',
      salary: 26000,
      employerContribution: 2600,
      employeeContribution: 1300,
      status: '審批失敗',
      failureReason: '薪資證明文件不完整',
      month: '2025/07'
    },
    {
      id: 'REG007',
      organizationCode: 'ORG007',
      employeeName: '林雅婷',
      idCard: '7890123',
      hireDate: '2025/06/18',
      planCode: 'ER12345',
      employeeType: 'B類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/23',
      salary: 23000,
      employerContribution: 2300,
      employeeContribution: 1150,
      status: '待提交確認',
      failureReason: '',
      month: '2025/07',
      applicant: '人力資源部陳專員',
      applicationTime: '2025/01/18 16:10'
    },
    {
      id: 'REG008',
      organizationCode: 'ORG008',
      employeeName: '周文強',
      idCard: '8901234',
      hireDate: '2025/06/14',
      planCode: 'ER12345',
      employeeType: 'A類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/19',
      salary: 29000,
      employerContribution: 2900,
      employeeContribution: 1450,
      status: '確認失敗',
      failureReason: '電話號碼無法接通',
      month: '2025/07'
    },
    {
      id: 'REG009',
      organizationCode: 'ORG009',
      employeeName: '吳小華',
      idCard: '9012345',
      hireDate: '2025/06/16',
      planCode: 'ER12345',
      employeeType: 'C類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/21',
      salary: 21000,
      employerContribution: 2100,
      employeeContribution: 1050,
      status: '審批失敗',
      failureReason: '身份證件過期',
      month: '2025/07'
    },
    {
      id: 'REG010',
      employeeId: 'EMP010',
      organizationCode: 'ORG010',
      employeeName: '楊志明',
      idCard: '0123456',
      hireDate: '2025/06/22',
      planCode: 'ER12345',
      employeeType: 'A類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/26',
      salary: 35000,
      employerContribution: 3500,
      employeeContribution: 1750,
      status: '不參與',
      failureReason: '',
      month: '2025/07',
      applicant: '人力資源部張經理',
      applicationTime: '2025/01/15 09:30'
    },
    {
      id: 'REG011',
      organizationCode: 'ORG011',
      employeeName: '趙雅芳',
      idCard: '1357924',
      hireDate: '2025/06/17',
      planCode: 'ER12345',
      employeeType: 'B類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/24',
      salary: 25500,
      employerContribution: 2550,
      employeeContribution: 1275,
      status: '待提交確認',
      failureReason: '',
      month: '2025/07',
      applicant: '人力資源部陳專員',
      applicationTime: '2025/01/18 16:10'
    },
    {
      id: 'REG012',
      organizationCode: 'ORG012',
      employeeName: '孫建國',
      idCard: '2468135',
      hireDate: '2025/06/11',
      planCode: 'ER12345',
      employeeType: 'A類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/17',
      salary: 31000,
      employerContribution: 3100,
      employeeContribution: 1550,
      status: '已完成',
      failureReason: '',
      month: '2025/07'
    },
    {
      id: 'REG013',
      organizationCode: 'ORG013',
      employeeName: '錢美琳',
      idCard: '3691470',
      hireDate: '2025/06/13',
      planCode: 'ER12345',
      employeeType: 'C類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/18',
      salary: 19000,
      employerContribution: 1900,
      employeeContribution: 950,
      status: '審批失敗',
      failureReason: '入職時間與計劃參加日期不符',
      month: '2025/07'
    },
    {
      id: 'REG014',
      employeeId: 'EMP014',
      organizationCode: 'ORG014',
      employeeName: '許文傑',
      idCard: '4815926',
      hireDate: '2025/06/19',
      planCode: 'ER12345',
      employeeType: 'B類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/27',
      salary: 27500,
      employerContribution: 2750,
      employeeContribution: 1375,
      status: '不參與',
      failureReason: '',
      month: '2025/07',
      applicant: '人力資源部張經理',
      applicationTime: '2025/01/15 09:30'
    },
    {
      id: 'REG015',
      organizationCode: 'ORG015',
      employeeName: '馮小剛',
      idCard: '5927384',
      hireDate: '2025/06/21',
      planCode: 'ER12345',
      employeeType: 'A類',
      planJoinDate: '2025/07/01',
      contractDate: '2025/06/28',
      salary: 33000,
      employerContribution: 3300,
      employeeContribution: 1650,
      status: '確認失敗',
      failureReason: '住址證明文件不清晰',
      month: '2025/07'
    },
    {
      id: 'REG016',
      employeeId: 'EMP016',
      organizationCode: 'ORG016',
      employeeName: '鄭志華',
      idCard: '6174829',
      hireDate: '2024/11/15',
      planCode: 'ER12345',
      employeeType: 'A類',
      planJoinDate: '2025/02/01',
      contractDate: '2024/12/20',
      salary: 34000,
      employerContribution: 3400,
      employeeContribution: 1700,
      status: '不參與',
      failureReason: '',
      month: '2025/02'
    },
    {
      id: 'REG017',
      organizationCode: 'ORG017',
      employeeName: '韓美玲',
      idCard: '7285940',
      hireDate: '2024/10/20',
      planCode: 'ER12345',
      employeeType: 'B類',
      planJoinDate: '2025/03/01',
      contractDate: '2024/11/25',
      salary: 26500,
      employerContribution: 2650,
      employeeContribution: 1325,
      status: '確認失敗',
      failureReason: '資料不完整',
      month: '2025/03'
    },
    {
      id: 'REG018',
      organizationCode: 'ORG018',
      employeeName: '沈建明',
      idCard: '8396051',
      hireDate: '2024/12/05',
      planCode: 'ER12345',
      employeeType: 'C類',
      planJoinDate: '2025/02/01',
      contractDate: '2024/12/28',
      salary: 22500,
      employerContribution: 2250,
      employeeContribution: 1125,
      status: '待提交審核',
      failureReason: '',
      month: '2025/02'
    },
    {
      id: 'REG019',
      organizationCode: 'ORG019',
      employeeName: '馬雅琴',
      idCard: '9407162',
      hireDate: '2024/11/30',
      planCode: 'ER12345',
      employeeType: 'B類',
      planJoinDate: '2025/03/01',
      contractDate: '2024/12/15',
      salary: 28500,
      employerContribution: 2850,
      employeeContribution: 1425,
      status: '已完成',
      failureReason: '',
      month: '2025/03'
    },
    {
      id: 'REG020',
      organizationCode: 'ORG020',
      employeeName: '方志偉',
      idCard: '0518273',
      hireDate: '2024/12/10',
      planCode: 'ER12345',
      employeeType: 'A類',
      planJoinDate: '2025/02/01',
      contractDate: '2025/01/05',
      salary: 31500,
      employerContribution: 3150,
      employeeContribution: 1575,
      status: '審批失敗',
      failureReason: '證件驗證失敗',
      month: '2025/02'
    }
  ],
  termination: [
    {
      id: 'TERM001',
      planCode: 'ER12345',
      employeeName: '王大明',
      idCard: '5678901',
      hireDate: '2023/06/15',
      employeeType: 'A類',
      planJoinDate: '2023/07/01',
      salary: 28000,
      submitTime: '2025/01/18 10:30',
      terminationTime: '2025/03/31',
      status: '確認中',
      failureReason: '',
      applicant: '人力資源部黃經理',
      applicationTime: '2025/01/18 10:30'
    },
    {
      id: 'TERM002',
      planCode: 'ER67890',
      employeeName: '李小華',
      idCard: '6789012',
      hireDate: '2022/08/20',
      employeeType: 'B類',
      planJoinDate: '2022/09/01',
      salary: 25000,
      submitTime: '2025/01/19 14:20',
      terminationTime: '2025/02/28',
      status: '確認失敗',
      failureReason: '員工資料不完整',
      applicant: '財務部周主管',
      applicationTime: '2025/01/19 14:20'
    },
    {
      id: 'TERM003',
      planCode: 'ER12345',
      employeeName: '張志偉',
      idCard: '7890123',
      hireDate: '2021/03/10',
      employeeType: 'A類',
      planJoinDate: '2021/04/01',
      salary: 32000,
      submitTime: '2025/01/20 09:45',
      terminationTime: '2025/04/15',
      status: '待提交審核',
      failureReason: ''
    },
    {
      id: 'TERM004',
      planCode: 'ER12345',
      employeeName: '陳美琳',
      idCard: '8901234',
      hireDate: '2024/01/08',
      employeeType: 'C類',
      planJoinDate: '2024/02/01',
      salary: 22000,
      submitTime: '2025/01/21 11:30',
      terminationTime: '2025/05/31',
      status: '已完成',
      failureReason: ''
    },
    {
      id: 'TERM005',
      planCode: 'ER12345',
      employeeName: '劉建國',
      idCard: '9012345',
      hireDate: '2023/11/12',
      employeeType: 'B類',
      planJoinDate: '2023/12/01',
      salary: 26500,
      submitTime: '2025/01/22 15:20',
      terminationTime: '2025/06/30',
      status: '審批失敗',
      failureReason: '終止原因不充分'
    }
  ],
  transfer: [
    {
      id: 'TRANS001',
      planCode: 'ER12345',
      employeeName: '黃志強',
      idCard: '1357924',
      hireDate: '2022/05/15',
      employeeType: 'A類',
      planJoinDate: '2022/06/01',
      salary: 30000,
      originalPlan: 'ER12345',
      newPlan: 'ER67890',
      originalSalary: 28000,
      newSalary: 30000,
      status: '待提交審核',
      failureReason: '',
      applicant: '行政部馬總監',
      applicationTime: '2025/01/20 09:15'
    },
    {
      id: 'TRANS002',
      planCode: 'ER12345',
      employeeName: '周美玲',
      idCard: '2468135',
      hireDate: '2023/03/20',
      employeeType: 'B類',
      planJoinDate: '2023/04/01',
      salary: 24000,
      originalPlan: 'ER67890',
      newPlan: 'ER12345',
      originalSalary: 22000,
      newSalary: 24000,
      status: '審核失敗',
      failureReason: '調職資料不完整'
    },
    {
      id: 'TRANS003',
      planCode: 'ER12345',
      employeeName: '林建華',
      idCard: '3691470',
      hireDate: '2021/09/10',
      employeeType: 'A類',
      planJoinDate: '2021/10/01',
      salary: 35000,
      originalPlan: 'ER12345',
      newPlan: 'ER67890',
      originalSalary: 32000,
      newSalary: 35000,
      status: '已完成',
      failureReason: ''
    },
    {
      id: 'TRANS004',
      planCode: 'ER67890',
      employeeName: '吳雅琴',
      idCard: '4815926',
      hireDate: '2024/02/05',
      employeeType: 'C類',
      planJoinDate: '2024/03/01',
      salary: 21000,
      originalPlan: 'ER67890',
      newPlan: 'ER12345',
      originalSalary: 20000,
      newSalary: 21000,
      status: '提交中',
      failureReason: ''
    },
    {
      id: 'TRANS005',
      planCode: 'ER67890',
      employeeName: '馬志偉',
      idCard: '5927384',
      hireDate: '2023/07/18',
      employeeType: 'B類',
      planJoinDate: '2023/08/01',
      salary: 27000,
      originalPlan: 'ER12345',
      newPlan: 'ER67890',
      originalSalary: 25000,
      newSalary: 27000,
      status: '審批失敗',
      failureReason: '新計劃方案不符合要求'
    }
  ],
  review: [
    {
      id: 'SALARY001',
      planCode: 'ER12345',
      employeeName: '陳大文',
      idCard: '1234567',
      contributionPeriod: '2025年1月',
      originalSalary: 25000,
      newSalary: 28000,
      submitter: '人力資源部王經理',
      submitTime: '2025/01/18 14:30',
      status: '待審批',
      failureReason: '',
      adjustmentReason: '職位晉升調薪'
    },
    {
      id: 'SALARY002',
      planCode: 'ER67890',
      employeeName: '李小紅',
      idCard: '2345678',
      contributionPeriod: '2025年1月',
      originalSalary: 22000,
      newSalary: 24000,
      submitter: '人力資源部李主管',
      submitTime: '2025/01/19 10:15',
      status: '待提交審核',
      failureReason: '',
      adjustmentReason: '年度調薪'
    },
    {
      id: 'SALARY003',
      planCode: 'ER12345',
      employeeName: '王志強',
      idCard: '3456789',
      contributionPeriod: '2025年1月',
      originalSalary: 30000,
      newSalary: 32000,
      submitter: '財務部張經理',
      submitTime: '2025/01/20 09:30',
      status: '已通過',
      failureReason: '',
      adjustmentReason: '績效調薪'
    },
    {
      id: 'SALARY004',
      planCode: 'ER12345',
      employeeName: '張美麗',
      idCard: '4567890',
      contributionPeriod: '2025年1月',
      originalSalary: 26000,
      newSalary: 25000,
      submitter: '行政部劉主管',
      submitTime: '2025/01/21 16:45',
      status: '審批失敗',
      failureReason: '調薪理由不充分',
      adjustmentReason: '部門調整'
    }
  ],
  manualContribution: [
    {
      id: 'MANUAL001',
      planCode: 'ER12345',
      contributionMonth: '2025年1月',
      contributionType: '正常供款',
      totalAmount: 125000,
      employeeCount: 42,
      submitter: '人力資源部陳經理',
      submitTime: '2025/01/20 14:30',
      status: '待審批',
      failureReason: '',
      remarks: '正常月度手動供款清單',
      applicant: '人力資源部陳經理',
      applicationTime: '2025/01/20 14:30'
    },
    {
      id: 'MANUAL002',
      planCode: 'ER67890',
      contributionMonth: '2025年1月',
      contributionType: '補繳供款',
      totalAmount: 85000,
      employeeCount: 28,
      submitter: '財務部李主管',
      submitTime: '2025/01/21 09:15',
      status: '待提交審核',
      failureReason: '',
      remarks: '補繳12月遺漏的手動供款',
      applicant: '財務部李主管',
      applicationTime: '2025/01/21 09:15'
    },
    {
      id: 'MANUAL003',
      planCode: 'ER12345',
      contributionMonth: '2024年12月',
      contributionType: '調整供款',
      totalAmount: 95000,
      employeeCount: 35,
      submitter: '行政部王總監',
      submitTime: '2025/01/18 16:45',
      status: '已通過',
      failureReason: '',
      remarks: '調整12月薪資變動後的供款',
      applicant: '行政部王總監',
      applicationTime: '2025/01/18 16:45'
    },
    {
      id: 'MANUAL004',
      planCode: 'ER67890',
      contributionMonth: '2024年12月',
      contributionType: '正常供款',
      totalAmount: 110000,
      employeeCount: 38,
      submitter: '人力資源部張專員',
      submitTime: '2025/01/19 11:20',
      status: '審批失敗',
      failureReason: '清單格式不符合要求',
      remarks: '年末正常供款清單',
      applicant: '人力資源部張專員',
      applicationTime: '2025/01/19 11:20'
    }
  ]
})

// 過濾後的數據
const filteredRegistrationTodos = ref([])
const filteredTerminationTodos = ref([])
const filteredTransferTodos = ref([])
const filteredReviewTodos = ref([])
const filteredManualContributionTodos = ref([])

// 計算屬性
const totalTodoCount = computed(() => {
  return filteredRegistrationTodos.value.length + 
         filteredTerminationTodos.value.length + 
         filteredTransferTodos.value.length + 
         filteredReviewTodos.value.length +
         filteredManualContributionTodos.value.length
})


const currentDisplayCount = computed(() => {
  return filteredRegistrationTodos.value.length
})

const paginatedRegistrationTodos = computed(() => {
  const start = (registrationCurrentPage.value - 1) * registrationPageSize.value
  const end = start + registrationPageSize.value
  return filteredRegistrationTodos.value.slice(start, end)
})

const paginatedTerminationTodos = computed(() => {
  const start = (terminationCurrentPage.value - 1) * terminationPageSize.value
  const end = start + terminationPageSize.value
  return filteredTerminationTodos.value.slice(start, end)
})

const paginatedTransferTodos = computed(() => {
  const start = (transferCurrentPage.value - 1) * transferPageSize.value
  const end = start + transferPageSize.value
  return filteredTransferTodos.value.slice(start, end)
})

const paginatedReviewTodos = computed(() => {
  const start = (reviewCurrentPage.value - 1) * reviewPageSize.value
  const end = start + reviewPageSize.value
  return filteredReviewTodos.value.slice(start, end)
})

const paginatedManualContributionTodos = computed(() => {
  const start = (manualContributionCurrentPage.value - 1) * manualContributionPageSize.value
  const end = start + manualContributionPageSize.value
  return filteredManualContributionTodos.value.slice(start, end)
})

// 方法
function switchMainTab(tab) {
  activeMainTab.value = tab
}


function initTodoData() {
  // 新加入計劃申請：顯示指定狀態的數據（不參與、待提交確認、待提交審核）
  const registrationAllowedStatuses = ['不參與', '待提交確認', '待提交審核']
  filteredRegistrationTodos.value = todoData.registration.filter(item => registrationAllowedStatuses.includes(item.status))
  
  // 其他切頁：只顯示待提交審核狀態的數據
  filteredTerminationTodos.value = todoData.termination.filter(item => item.status === '待提交審核')
  filteredTransferTodos.value = todoData.transfer.filter(item => item.status === '待提交審核')
  filteredReviewTodos.value = todoData.review.filter(item => item.status === '待提交審核')
  filteredManualContributionTodos.value = todoData.manualContribution.filter(item => item.status === '待提交審核')
}





function getStatusType(status) {
  const statusMap = {
    '不參與': 'info',
    '待提交確認': 'warning',
    '待提交審核': '',
    '確認失敗': 'danger',
    '審批失敗': 'danger',
    '審核失敗': 'danger',
    '審批中': 'warning',
    '確認中': 'info',
    '提交中': 'info',
    '處理中': 'warning',
    '待處理': 'warning',
    '待審批': 'warning',
    '已審批': 'success',
    '已完成': 'success',
    '已通過': 'success',
    '已駁回': 'danger'
  }
  return statusMap[status] || 'info'
}


function getRowClassName({ row }) {
  switch (row.status) {
    case '確認失敗':
    case '審批失敗':
    case '審核失敗':
      return 'error-row'
    case '已完成':
      return 'success-row'
    case '待提交確認':
    case '待提交審核':
      return 'warning-row'
    case '不參與':
      return 'info-row'
    default:
      return ''
  }
}

// 控制行是否可选择
function isRowSelectable(row) {
  // 状态为"不參與"时不允许勾选
  return row.status !== '不參與'
}


function formatCurrency(amount) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'MOP',
    minimumFractionDigits: 0
  }).format(amount)
}

function viewTodoDetail(todo) {
  currentTodo.value = todo
  todoDetailDialogVisible.value = true
}

function editTodoStatus(todo) {
  const statusOptions = ['未受邀', '待確認提交', '確認失敗', '審批失敗', '審批中', '已完成']
  
  ElMessageBox.prompt(
    '請輸入新狀態',
    '編輯狀態',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      inputType: 'text',
      inputValue: todo.status,
      inputValidator: (value) => {
        return statusOptions.includes(value) ? true : '請輸入有效的狀態'
      }
    }
  ).then(({ value }) => {
    todo.status = value
    ElMessage.success('狀態更新成功')
  }).catch(() => {
    ElMessage.info('已取消編輯')
  })
}

function reviewTodo(todo) {
  ElMessageBox.confirm(
    `確定要審核該待辦項嗎？`,
    '確認審核',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    todo.status = '已完成'
    todo.reviewTime = new Date().toLocaleString()
    ElMessage.success('審核完成')
  }).catch(() => {
    ElMessage.info('已取消審核')
  })
}


function reviewCurrentTodo() {
  todoDetailDialogVisible.value = false
  reviewTodo(currentTodo.value)
}

// 弹出框相关方法
function getDialogTitle() {
  if (!currentTodo.value) return '詳情'
  
  const titles = {
    'registration': '新加入計劃申請詳情',
    'termination': '終止參與計劃申請詳情', 
    'transfer': '調職申請詳情',
    'review': '調薪申請詳情',
    'manual-contribution': '手動供款清單審批詳情'
  }
  
  return titles[activeMainTab.value] || '詳情'
}

function getApplicant() {
  if (!currentTodo.value) return '-'
  
  // 根据不同的tab返回不同的申请人
  switch (activeMainTab.value) {
    case 'registration':
    case 'termination':
    case 'transfer':
      return currentTodo.value.applicant || currentTodo.value.employeeName || '-'
    case 'review':
    case 'manual-contribution':
      return currentTodo.value.submitter || '-'
    default:
      return '-'
  }
}

function getApplicationTime() {
  if (!currentTodo.value) return '-'
  
  // 根据不同的tab返回不同的申请时间
  switch (activeMainTab.value) {
    case 'registration':
      return currentTodo.value.applicationTime || currentTodo.value.planJoinDate || '-'
    case 'termination':
    case 'transfer':
    case 'review':
    case 'manual-contribution':
      return currentTodo.value.submitTime || '-'
    default:
      return '-'
  }
}


function downloadContributionList(todo) {
  // 下载供款清单
  ElMessage.info(`正在下載 ${todo.planCode} - ${todo.contributionMonth} 的供款清單文件...`)
  
  // 这里可以实现真实的文件下载逻辑
  // 例如：window.open(todo.contributionListUrl)
  // 或者通过API下载文件
}

// 查看余额处理表文件
function viewBalanceDocument() {
  ElMessage.info('正在查看結餘處理表文件...')
  // 这里可以实现文件查看逻辑
  // 例如：window.open(balanceDocumentUrl)
}

// 删除同步狀態函数

// 分頁處理函數
function handleRegistrationSizeChange(newSize) {
  registrationPageSize.value = newSize
  registrationCurrentPage.value = 1
}

function handleRegistrationCurrentChange(newPage) {
  registrationCurrentPage.value = newPage
}

function handleTerminationSizeChange(newSize) {
  terminationPageSize.value = newSize
  terminationCurrentPage.value = 1
}

function handleTerminationCurrentChange(newPage) {
  terminationCurrentPage.value = newPage
}

function handleTransferSizeChange(newSize) {
  transferPageSize.value = newSize
  transferCurrentPage.value = 1
}

function handleTransferCurrentChange(newPage) {
  transferCurrentPage.value = newPage
}

function handleReviewSizeChange(newSize) {
  reviewPageSize.value = newSize
  reviewCurrentPage.value = 1
}

function handleReviewCurrentChange(newPage) {
  reviewCurrentPage.value = newPage
}

function handleManualContributionSizeChange(newSize) {
  manualContributionPageSize.value = newSize
  manualContributionCurrentPage.value = 1
}

function handleManualContributionCurrentChange(newPage) {
  manualContributionCurrentPage.value = newPage
}

// 選擇處理函數
function handleRegistrationSelectionChange(selection) {
  selectedRegistrationTodos.value = selection
}

function handleTerminationSelectionChange(selection) {
  selectedTerminationTodos.value = selection
}

function handleTransferSelectionChange(selection) {
  selectedTransferTodos.value = selection
}

function handleReviewSelectionChange(selection) {
  selectedReviewTodos.value = selection
}

function handleManualContributionSelectionChange(selection) {
  selectedManualContributionTodos.value = selection
}

// 下載聲明書
function downloadStatement(todo) {
  ElMessage.info(`正在下載 ${todo.employeeName} 的不參與聲明書...`)
  // 這裡可以實現真實的文件下載邏輯
  // 例如：window.open(todo.statementUrl)
}

// 提交確認
function submitConfirmation(todo) {
  ElMessageBox.confirm(
    `確定要提交「${todo.employeeName}」的確認信息嗎？`,
    '確認提交',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'info'
    }
  ).then(() => {
    // 這裡可以調用API提交確認
    ElMessage.success('已提交確認')
    // 可以更新狀態或刷新數據
  }).catch(() => {
    ElMessage.info('已取消提交')
  })
}

// 提交審核
function submitReview(todo) {
  ElMessageBox.confirm(
    `確定要提交「${todo.employeeName}」進行審核嗎？`,
    '確認提交審核',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 這裡可以調用API提交審核
    ElMessage.success('已提交審核')
    // 可以更新狀態或刷新數據
  }).catch(() => {
    ElMessage.info('已取消提交')
  })
}

// 單個提交審核（保留原有方法以兼容其他功能）
function submitSingleTodo(todo) {
  ElMessageBox.confirm(
    `確定要提交「${todo.employeeName || todo.planCode}」進行審核嗎？`,
    '確認提交',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 這裡可以調用API提交審核
    ElMessage.success('已提交審核')
    // 可以更新狀態或刷新數據
  }).catch(() => {
    ElMessage.info('已取消提交')
  })
}

// 批量提交函數
function batchSubmitRegistration() {
  const count = selectedRegistrationTodos.value.length
  if (count === 0) {
    ElMessage.warning('請先選擇要提交的申請項目')
    return
  }
  ElMessageBox.confirm(
    `確定要批量提交 ${count} 個新加入計劃申請進行審核嗎？`,
    '批量提交確認',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 這裡可以調用API批量提交審核
    ElMessage.success(`已批量提交 ${count} 個申請進行審核`)
    selectedRegistrationTodos.value = []
  }).catch(() => {
    ElMessage.info('已取消批量提交')
  })
}

function batchSubmitTermination() {
  const count = selectedTerminationTodos.value.length
  if (count === 0) {
    ElMessage.warning('請先選擇要提交的申請項目')
    return
  }
  ElMessageBox.confirm(
    `確定要批量提交 ${count} 個終止參與計劃申請進行審核嗎？`,
    '批量提交確認',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`已批量提交 ${count} 個申請進行審核`)
    selectedTerminationTodos.value = []
  }).catch(() => {
    ElMessage.info('已取消批量提交')
  })
}

function batchSubmitTransfer() {
  const count = selectedTransferTodos.value.length
  if (count === 0) {
    ElMessage.warning('請先選擇要提交的申請項目')
    return
  }
  ElMessageBox.confirm(
    `確定要批量提交 ${count} 個調職申請進行審核嗎？`,
    '批量提交確認',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`已批量提交 ${count} 個申請進行審核`)
    selectedTransferTodos.value = []
  }).catch(() => {
    ElMessage.info('已取消批量提交')
  })
}

function batchSubmitReview() {
  const count = selectedReviewTodos.value.length
  if (count === 0) {
    ElMessage.warning('請先選擇要提交的申請項目')
    return
  }
  ElMessageBox.confirm(
    `確定要批量提交 ${count} 個調薪申請進行審核嗎？`,
    '批量提交確認',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`已批量提交 ${count} 個申請進行審核`)
    selectedReviewTodos.value = []
  }).catch(() => {
    ElMessage.info('已取消批量提交')
  })
}

function batchSubmitManualContribution() {
  const count = selectedManualContributionTodos.value.length
  if (count === 0) {
    ElMessage.warning('請先選擇要提交的清單項目')
    return
  }
  ElMessageBox.confirm(
    `確定要批量提交 ${count} 個手動供款清單進行審核嗎？`,
    '批量提交確認',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`已批量提交 ${count} 個清單進行審核`)
    selectedManualContributionTodos.value = []
  }).catch(() => {
    ElMessage.info('已取消批量提交')
  })
}

// 查詢功能
function resetRegistrationSearch() {
  Object.assign(registrationSearchForm, {
    planCode: '',
    employeeName: '',
    idCard: '',
    employeeType: '',
    status: ''
  })
  searchRegistration()
}

function searchRegistration() {
  // 首先只选择允许的状态
  const allowedStatuses = ['不參與', '待提交確認', '待提交審核']
  let filtered = todoData.registration.filter(item => allowedStatuses.includes(item.status))
  
  if (registrationSearchForm.planCode) {
    filtered = filtered.filter(item => 
      item.planCode.toLowerCase().includes(registrationSearchForm.planCode.toLowerCase())
    )
  }
  if (registrationSearchForm.employeeName) {
    filtered = filtered.filter(item => 
      item.employeeName.includes(registrationSearchForm.employeeName)
    )
  }
  if (registrationSearchForm.idCard) {
    filtered = filtered.filter(item => 
      item.idCard.includes(registrationSearchForm.idCard)
    )
  }
  if (registrationSearchForm.employeeType) {
    filtered = filtered.filter(item => 
      item.employeeType === registrationSearchForm.employeeType
    )
  }
  if (registrationSearchForm.status) {
    filtered = filtered.filter(item => 
      item.status === registrationSearchForm.status
    )
  }
  
  filteredRegistrationTodos.value = filtered
  registrationCurrentPage.value = 1
}

function resetTerminationSearch() {
  Object.assign(terminationSearchForm, {
    planCode: '',
    employeeName: '',
    idCard: '',
    terminationTime: '',
    status: ''
  })
  searchTermination()
}

function searchTermination() {
  // 首先只选择待提交審核状态
  let filtered = todoData.termination.filter(item => item.status === '待提交審核')
  
  if (terminationSearchForm.planCode) {
    filtered = filtered.filter(item => 
      item.planCode.toLowerCase().includes(terminationSearchForm.planCode.toLowerCase())
    )
  }
  if (terminationSearchForm.employeeName) {
    filtered = filtered.filter(item => 
      item.employeeName.includes(terminationSearchForm.employeeName)
    )
  }
  if (terminationSearchForm.idCard) {
    filtered = filtered.filter(item => 
      item.idCard.includes(terminationSearchForm.idCard)
    )
  }
  if (terminationSearchForm.terminationTime) {
    filtered = filtered.filter(item => 
      item.terminationTime.includes(terminationSearchForm.terminationTime)
    )
  }
  if (terminationSearchForm.status) {
    filtered = filtered.filter(item => 
      item.status === terminationSearchForm.status
    )
  }
  
  filteredTerminationTodos.value = filtered
  terminationCurrentPage.value = 1
}

function resetTransferSearch() {
  Object.assign(transferSearchForm, {
    planCode: '',
    employeeName: '',
    originalPlan: '',
    newPlan: '',
    status: ''
  })
  searchTransfer()
}

function searchTransfer() {
  // 首先只选择待提交審核状态
  let filtered = todoData.transfer.filter(item => item.status === '待提交審核')
  
  if (transferSearchForm.planCode) {
    filtered = filtered.filter(item => 
      item.planCode.toLowerCase().includes(transferSearchForm.planCode.toLowerCase())
    )
  }
  if (transferSearchForm.employeeName) {
    filtered = filtered.filter(item => 
      item.employeeName.includes(transferSearchForm.employeeName)
    )
  }
  if (transferSearchForm.originalPlan) {
    filtered = filtered.filter(item => 
      item.originalPlan.includes(transferSearchForm.originalPlan)
    )
  }
  if (transferSearchForm.newPlan) {
    filtered = filtered.filter(item => 
      item.newPlan.includes(transferSearchForm.newPlan)
    )
  }
  if (transferSearchForm.status) {
    filtered = filtered.filter(item => 
      item.status === transferSearchForm.status
    )
  }
  
  filteredTransferTodos.value = filtered
  transferCurrentPage.value = 1
}

function resetReviewSearch() {
  Object.assign(reviewSearchForm, {
    planCode: '',
    employeeName: '',
    effectiveDate: '',
    status: ''
  })
  searchReview()
}

function searchReview() {
  // 首先只选择待提交審核状态
  let filtered = todoData.review.filter(item => item.status === '待提交審核')
  
  if (reviewSearchForm.planCode) {
    filtered = filtered.filter(item => 
      item.planCode.toLowerCase().includes(reviewSearchForm.planCode.toLowerCase())
    )
  }
  if (reviewSearchForm.employeeName) {
    filtered = filtered.filter(item => 
      item.employeeName.includes(reviewSearchForm.employeeName)
    )
  }
  if (reviewSearchForm.effectiveDate) {
    filtered = filtered.filter(item => 
      item.effectiveDate && item.effectiveDate.includes(reviewSearchForm.effectiveDate)
    )
  }
  if (reviewSearchForm.status) {
    filtered = filtered.filter(item => 
      item.status === reviewSearchForm.status
    )
  }
  
  filteredReviewTodos.value = filtered
  reviewCurrentPage.value = 1
}

function resetManualContributionSearch() {
  Object.assign(manualContributionSearchForm, {
    planCode: '',
    contributionMonth: '',
    contributionType: '',
    submitter: '',
    status: ''
  })
  searchManualContribution()
}

function searchManualContribution() {
  // 首先只选择待提交審核状态
  let filtered = todoData.manualContribution.filter(item => item.status === '待提交審核')
  
  if (manualContributionSearchForm.planCode) {
    filtered = filtered.filter(item => 
      item.planCode.toLowerCase().includes(manualContributionSearchForm.planCode.toLowerCase())
    )
  }
  if (manualContributionSearchForm.contributionMonth) {
    filtered = filtered.filter(item => 
      item.contributionMonth.includes(manualContributionSearchForm.contributionMonth)
    )
  }
  if (manualContributionSearchForm.contributionType) {
    filtered = filtered.filter(item => 
      item.contributionType === manualContributionSearchForm.contributionType
    )
  }
  if (manualContributionSearchForm.submitter) {
    filtered = filtered.filter(item => 
      item.submitter.includes(manualContributionSearchForm.submitter)
    )
  }
  if (manualContributionSearchForm.status) {
    filtered = filtered.filter(item => 
      item.status === manualContributionSearchForm.status
    )
  }
  
  filteredManualContributionTodos.value = filtered
  manualContributionCurrentPage.value = 1
}

// 獲取英文姓名的輔助函數
function getEnglishName(chineseName) {
  // 這裡可以根據中文姓名生成對應的英文姓名
  // 目前使用簡單的映射邏輯，實際項目中可以從數據庫獲取
  const nameMap = {
    '陳大文': 'CHAN, TAI MAN',
    '李小紅': 'LEE, SIU HUNG', 
    '王志強': 'WONG, CHI KEUNG',
    '張美麗': 'CHEUNG, MEI LAI',
    '劉建華': 'LAU, KIN WAH',
    '黃大偉': 'WONG, TAI WAI',
    '林雅婷': 'LAM, NGA TING',
    '周文強': 'CHAU, MAN KEUNG',
    '吳小華': 'NG, SIU WAH',
    '楊志明': 'YEUNG, CHI MING',
    '趙雅芳': 'CHIU, NGA FONG',
    '孫建國': 'SUN, KIN KWOK',
    '錢美琳': 'CHIN, MEI LUN',
    '許文傑': 'HUI, MAN KIT',
    '馮小剛': 'FUNG, SIU KONG',
    '鄭志華': 'CHENG, CHI WAH',
    '韓美玲': 'HON, MEI LING',
    '沈建明': 'SUM, KIN MING',
    '馬雅琴': 'MA, NGA KAM',
    '方志偉': 'FONG, CHI WAI'
  }
  return nameMap[chineseName] || chineseName.toUpperCase()
}

// 獲取英文姓氏的輔助函數
function getEnglishSurname(chineseName) {
  const fullEnglishName = getEnglishName(chineseName)
  // 英文姓名格式為 "SURNAME, GIVEN NAME"，提取姓氏部分
  if (fullEnglishName.includes(',')) {
    return fullEnglishName.split(',')[0].trim()
  }
  // 如果沒有逗號分隔，返回第一個單詞作為姓氏
  return fullEnglishName.split(' ')[0] || fullEnglishName
}

// 獲取英文名字的輔助函數
function getEnglishGivenName(chineseName) {
  const fullEnglishName = getEnglishName(chineseName)
  // 英文姓名格式為 "SURNAME, GIVEN NAME"，提取名字部分
  if (fullEnglishName.includes(',')) {
    return fullEnglishName.split(',')[1].trim()
  }
  // 如果沒有逗號分隔，返回除第一個單詞外的其餘部分作為名字
  const parts = fullEnglishName.split(' ')
  return parts.slice(1).join(' ') || ''
}

// 組件掛載時初始化
onMounted(() => {
  initTodoData()
  // 初始化時執行一次查詢以顯示所有數據
  searchRegistration()
  searchTermination()
  searchTransfer()
  searchReview()
  searchManualContribution()
})
</script>

<style scoped>
.central-fund-todo {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
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

.main-tab-container {
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
}

.left-buttons,
.right-buttons {
  display: flex;
  gap: 10px;
}

.btn-reset {
  background: #f5f5f5;
  color: #666;
  border: 1px solid #d9d9d9;
}

.btn-search {
  background: #1890ff;
  color: white;
  border: 1px solid #1890ff;
}

.employee-table {
  margin-bottom: 20px;
}

.search-filters {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.btn-sync {
  background: #ff9800;
  color: white;
  border: 1px solid #ff9800;
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

.action-buttons {
  display: flex;
  gap: 12px;
}

.action-buttons .el-button {
  border-radius: 8px;
  font-weight: 500;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
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

/* 國壽橙顏色按鈕樣式 */
.btn-orange {
  color: #ff6600 !important;
  border-color: #ff6600 !important;
}

.btn-orange:hover {
  color: #ff8533 !important;
  border-color: #ff8533 !important;
}

/* 表格操作按鈕一行顯示 */
.table-action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;
  white-space: nowrap;
  justify-content: flex-start;
}

.table-action-buttons .el-button {
  margin: 0 !important;
  padding: 3px 8px !important;
  font-size: 12px !important;
  min-width: auto !important;
  height: 24px !important;
}

/* 發出邀約按鈕樣式 */
.btn-invite {
  background: #ff6600;
  color: white;
  border: 1px solid #ff6600;
}

.btn-invite:hover {
  background: #ff8533;
  border-color: #ff8533;
  color: white;
}

.failure-reason {
  color: #f5222d;
  font-size: 12px;
}

.todo-detail {
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

.detail-section-header {
  margin: 15px 0 10px 0;
}

.section-subtitle {
  color: #40a98f;
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  padding-bottom: 3px;
  border-bottom: 1px solid #40a98f;
  display: inline-block;
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

.salary-increase {
  color: #52c41a;
  font-weight: bold;
}

.salary-decrease {
  color: #f5222d;
  font-weight: bold;
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

.el-table .info-row {
  background-color: #f0f9ff;
}

/* 表格樣式優化 */
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

/* 員工詳情對話框樣式 */
.employee-detail-dialog .el-dialog__body {
  max-height: 75vh;
  overflow-y: auto;
  padding: 12px;
}

.employee-detail-content {
  padding: 0;
  margin: 0;
}

/* 緊湊信息網格樣式 */
.info-grid-compact {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px 8px;
  align-items: start;
  padding: 0;
  line-height: 1.1;
}

/* 内联字段样式 */
.info-field-inline {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 0;
  border-bottom: 1px solid #fafafa;
  min-height: 22px;
}

.info-field-inline.full-width {
  grid-column: 1 / -1;
}

.info-field-inline .field-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
  min-width: 80px;
  flex-shrink: 0;
}

.info-field-inline .field-value {
  font-size: 14px;
  color: #333;
  font-weight: bold;
  flex: 1;
}

.info-field-inline .field-value.error {
  color: #ef4444;
}

/* 保留原有样式以兼容其他地方 */
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

/* 投資分配表格樣式 */
.allocation-table-compact {
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 4px;
  font-size: 10px;
}

.allocation-table-compact .allocation-header-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  background: #f8f9fa;
  border-bottom: 1px solid #40a98f;
}

.allocation-table-compact .fund-name-header,
.allocation-table-compact .allocation-header {
  padding: 3px 4px;
  font-weight: 600;
  color: #374151;
  text-align: center;
  font-size: 9px;
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
  padding: 3px 4px;
  font-size: 9px;
  color: #374151;
  font-weight: 500;
  border-right: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  line-height: 1.1;
}

.allocation-table-compact .allocation-input-cell {
  padding: 2px;
  border-right: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.allocation-table-compact .allocation-input-cell:last-child {
  border-right: none;
}

/* 投资分配区域样式 */
.allocation-section {
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.allocation-section .field-label {
  margin-bottom: 4px;
}

.allocation-value {
  font-size: 11px;
  color: #1f2937;
  font-weight: 500;
}

/* 内联附件样式 */
.attachments-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 2px;
}

.attachment-item-inline {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 1px 4px;
  background: #f8f9fa;
  border: 1px solid #e5e7eb;
  border-radius: 2px;
  font-size: 9px;
  color: #374151;
  transition: all 0.3s ease;
  cursor: pointer;
}

.attachment-item-inline:hover {
  border-color: #40a98f;
  background: #f0f9f7;
  color: #40a98f;
}

.attachment-item-inline i {
  color: #40a98f;
  font-size: 12px;
  flex-shrink: 0;
}

.attachment-item-inline span {
  font-weight: 500;
}

/* 附件樣式 */
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

</style>