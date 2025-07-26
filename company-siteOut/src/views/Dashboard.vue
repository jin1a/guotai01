<template>
  <div class="dashboard">
    <!-- 第一行：公司头部 - 满宽度绿色方框 -->
    <div class="company-header">
      <div class="company-info">
        <h2 class="company-name">澳門科技集團有限公司 - 2025年7月16日</h2>
        <div class="company-tags">
          <span class="tag active">集團總公司</span>
          <span class="tag">管理2家子公司</span>
        </div>
        <div class="company-stats">
          <span class="stat-item">企業總資產: <span class="amount">MOP 6,470,000.00</span></span>
          <span class="stat-item">總成員數: <span class="count">83人</span></span>
        </div>
      </div>
    </div>

    <!-- 第二行：左2/3账户总额 + 右1/3最新供款 -->
    <div class="second-row">
      <!-- 左侧2/3：投資組合統計 -->
      <div class="portfolio-section">
        <div class="section-header">
          <el-tabs v-model="activeTab" class="portfolio-tabs" @tab-click="handleTabClick">
            <el-tab-pane label="央積金共同計劃" name="central"></el-tab-pane>
            <el-tab-pane label="私退金共同計劃" name="private"></el-tab-pane>
          </el-tabs>
        </div>
        
        <div class="portfolio-overview">
          <div class="main-stat">
            <div class="stat-header">{{ currentPlanData.title }}賬戶總額</div>
            <div class="main-amount">
              <span class="value">{{ currentPlanData.totalAmount }}</span>
            </div>
            <div class="update-time">截至 2025/07/16</div>
          </div>
          
          <div class="sub-stats">
            <div class="stat-grid">
              <div class="stat-box">
                <div class="stat-label">僱員總數</div>
                <div class="stat-value">{{ currentPlanData.employeeCount }}人</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">抵扣總額</div>
                <div class="stat-value amount">{{ currentPlanData.deductionAmount }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">僱主總供款</div>
                <div class="stat-value amount">{{ currentPlanData.employerContribution }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">僱員總供款</div>
                <div class="stat-value amount">{{ currentPlanData.employeeContribution }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧1/3：最新供款 -->
      <div class="latest-contribution">
        <div class="contribution-header">
          <h3 class="section-title">最新供款 - {{ currentPlanData.title }}</h3>
        </div>
        <div class="contribution-content">
          <div class="contribution-info">
            <div class="contribution-label">總供款</div>
            <div class="contribution-period">供款期 {{ currentPlanData.contributionPeriod }}</div>
          </div>
          <div class="contribution-amount">
            <div class="amount-value">{{ currentPlanData.latestContribution }}</div>
          </div>
          <div class="contribution-details">
            <div class="detail-row">
              <span class="label">僱主供款：</span>
              <span class="value amount">{{ currentPlanData.latestEmployerContribution }}</span>
            </div>
            <div class="detail-row">
              <span class="label">僱員供款：</span>
              <span class="value amount">{{ currentPlanData.latestEmployeeContribution }}</span>
            </div>
            <div class="detail-row">
              <span class="label">僱員總數：</span>
              <span class="value">{{ currentPlanData.employeeCount }}人</span>
            </div>
            <div class="detail-row">
              <span class="label">可抵扣金額：</span>
              <span class="value amount">{{ currentPlanData.deductionAmount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第三行：三个1/3方框 -->
    <div class="third-row">
      <div class="third-row-content">
        <!-- 第一个计划 -->
        <div class="plan-card">
          <div class="plan-header">
            <div class="plan-title">PLAN003-澳門科技分公司A央積金計劃</div>
          </div>
          <div class="plan-amount">
            <span class="value">MOP 3,580,000.00</span>
          </div>
          <div class="plan-stats">
            <div class="stat-grid-plan">
              <div class="stat-item-plan">
                <div class="stat-label-plan">僱主供款</div>
                <div class="stat-value-plan">MOP 12,000.00</div>
              </div>
              <div class="stat-item-plan">
                <div class="stat-label-plan">僱員供款</div>
                <div class="stat-value-plan">MOP 6,000.00</div>
              </div>
              <div class="stat-item-plan">
                <div class="stat-label-plan">參與僱員</div>
                <div class="stat-value-plan">45人</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 第二个计划 -->
        <div class="plan-card">
          <div class="plan-header">
            <div class="plan-title">PLAN004-澳門科技分公司B私退金計劃</div>
          </div>
          <div class="plan-amount">
            <span class="value">MOP 2,890,000.00</span>
          </div>
          <div class="plan-stats">
            <div class="stat-grid-plan">
              <div class="stat-item-plan">
                <div class="stat-label-plan">僱主供款</div>
                <div class="stat-value-plan">MOP 10,000.00</div>
              </div>
              <div class="stat-item-plan">
                <div class="stat-label-plan">僱員供款</div>
                <div class="stat-value-plan">MOP 5,600.00</div>
              </div>
              <div class="stat-item-plan">
                <div class="stat-label-plan">參與僱員</div>
                <div class="stat-value-plan">38人</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷入口 -->
        <div class="quick-access">
          <div class="access-grid">
            <div class="access-item" @click="navigateTo('/central-fund/todo')">
              <div class="access-icon green">
                <el-icon><Calendar /></el-icon>
              </div>
              <span class="access-text">待办任务</span>
            </div>
            <div class="access-item" @click="navigateTo('/central-fund/employee')">
              <div class="access-icon orange">
                <el-icon><User /></el-icon>
              </div>
              <span class="access-text">邀请雇员</span>
            </div>
            <div class="access-item" @click="navigateTo('/central-fund/auto-contribution/submit-voucher')">
              <div class="access-icon red">
                <el-icon><Money /></el-icon>
              </div>
              <span class="access-text">供款</span>
            </div>
            <div class="access-item" @click="navigateTo('/central-fund/contribution-adjustment')">
              <div class="access-icon blue">
                <el-icon><Setting /></el-icon>
              </div>
              <span class="access-text">供款调整</span>
            </div>
            <div class="access-item" @click="navigateTo('/central-fund/online')">
              <div class="access-icon purple">
                <el-icon><Document /></el-icon>
              </div>
              <span class="access-text">线上办理</span>
            </div>
            <div class="access-item" @click="navigateTo('/electronic-notice')">
              <div class="access-icon teal">
                <el-icon><Download /></el-icon>
              </div>
              <span class="access-text">电子通知书</span>
            </div>
            <div class="access-item" @click="navigateTo('/service-progress')">
              <div class="access-icon gray">
                <el-icon><Upload /></el-icon>
              </div>
              <span class="access-text">服务进度</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  User,
  Upload,
  Document,
  Setting,
  Calendar,
  Money
} from '@element-plus/icons-vue'

const router = useRouter()
const activeTab = ref('central')

// 不同计划的数据
const planData = {
  central: {
    title: '央積金',
    totalAmount: 'MOP 3,580,000.00',
    employeeCount: 45,
    deductionAmount: 'MOP 2,100.00',
    employerContribution: 'MOP 12,000.00',
    employeeContribution: 'MOP 6,000.00',
    contributionPeriod: '2024年8月',
    latestContribution: 'MOP 18,000.00',
    latestEmployerContribution: 'MOP 12,000.00',
    latestEmployeeContribution: 'MOP 6,000.00'
  },
  private: {
    title: '私退金',
    totalAmount: 'MOP 2,890,000.00',
    employeeCount: 38,
    deductionAmount: 'MOP 1,400.00',
    employerContribution: 'MOP 10,000.00',
    employeeContribution: 'MOP 5,600.00',
    contributionPeriod: '2024年8月',
    latestContribution: 'MOP 15,600.00',
    latestEmployerContribution: 'MOP 10,000.00',
    latestEmployeeContribution: 'MOP 5,600.00'
  }
}

// 当前选中的计划数据
const currentPlanData = computed(() => {
  return planData[activeTab.value]
})

// 处理tab切换
const handleTabClick = (tab) => {
  console.log('切换到:', tab.props.name)
}

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.dashboard {
  padding: 0;
  background-color: #f5f7fa;
  width: 100%;
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

/* 第一行：公司头部 - 满宽度 */
.company-header {
  background: linear-gradient(135deg, #2C8976 0%, #1e6b5c 100%);
  border-radius: 8px;
  padding: 20px;
  margin: 16px 16px 16px 16px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: calc(100% - 32px);
}

.company-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.company-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.tag.active {
  background: rgba(255, 255, 255, 0.9);
  color: #2C8976;
}

.company-stats {
  display: flex;
  gap: 24px;
  font-size: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.amount {
  font-weight: 600;
  color: #f0f9ff;
}

.count {
  font-weight: 600;
  color: #f0f9ff;
}

.header-action {
  margin-top: 8px;
}

.portfolio-btn {
  background: rgba(255, 255, 255, 0.9);
  color: #2C8976;
  border: none;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.portfolio-btn:hover {
  background: rgba(255, 255, 255, 1);
}

/* 第二行：左2/3 + 右1/3 */
.second-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin: 0 16px 16px 16px;
}

/* 左侧2/3：投资组合统计 */
.portfolio-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.section-header {
  margin-bottom: 20px;
}

.portfolio-tabs {
  margin-bottom: 0;
}

/* 自定义tabs样式 */
:deep(.el-tabs__header) {
  margin: 0;
  border-bottom: 2px solid #e4e7ed;
}

:deep(.el-tabs__nav-wrap::after) {
  display: none;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 600;
  color: #666;
  padding: 0 20px;
  height: 40px;
  line-height: 38px;
}

:deep(.el-tabs__item.is-active) {
  color: #2C8976;
  font-weight: 700;
}

:deep(.el-tabs__active-bar) {
  background-color: #2C8976;
  height: 3px;
}

.portfolio-overview {
  text-align: center;
}

.main-stat {
  margin-bottom: 16px;
}

.stat-header {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  font-weight: bold;
}

.main-amount {
  margin-bottom: 8px;
}

.main-amount .value {
  font-size: 36px;
  font-weight: 700;
  color: #2C8976;
}

.update-time {
  color: #999;
  font-size: 12px;
}

.sub-stats {
  margin-top: 12px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-box {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 12px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-label {
  font-size: 12px;
  color: #666;
  font-weight: bold;
  line-height: 1;
}

.stat-value {
  font-size: 14px;
  color: #f5a623;
  font-weight: bold;
  line-height: 1;
}

.stat-value.amount {
  color: #f5a623;
}

.date-info {
  min-width: 160px;
}

.date-header {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.date-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 16px;
}

.amount-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.amount-row .label {
  color: #666;
}

.amount-row .value.amount {
  color: #f5a623;
  font-weight: 500;
}

/* 右侧1/3：最新供款 */
.latest-contribution {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.contribution-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.contribution-tag {
  background: #fff7e6;
  color: #fa8c16;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.contribution-content {
  padding: 0;
}

.contribution-info {
  margin-bottom: 12px;
}

.contribution-label {
  font-size: 14px;
  color: #333;
  font-weight: 500;
  margin-bottom: 6px;
}

.contribution-period {
  font-size: 12px;
  color: #666;
}

.contribution-amount {
  text-align: center;
  margin-bottom: 12px;
}

.amount-value {
  font-size: 20px;
  color: #2C8976;
  font-weight: bold;
}

.contribution-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}

.detail-row .label {
  color: #666;
  font-weight: bold;
}

.detail-row .value {
  color: #f5a623;
  font-weight: bold;
}

.detail-row .value.amount {
  color: #f5a623;
  font-weight: bold;
}

.contribution-action {
  text-align: center;
}

/* 第三行：三个1/3方框 */
.third-row {
  margin: 0 16px 16px 16px;
  flex: 1;
}

.third-row-content {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  height: 100%;
}

/* 计划卡片 */
.plan-card {
  background: white;
  border-radius: 10px;
  padding: 20px;
  border-left: 4px solid #2C8976;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.plan-title {
  font-size: 14px;
  color: #333;
  font-weight: bold;
  flex: 1;
}

.action-link {
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
}

.action-link.primary {
  color: #409eff;
}

.plan-status {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.status-tag {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-tag.warning {
  background: #fff7e6;
  color: #fa8c16;
}

.status-tag.info {
  background: #e6f7ff;
  color: #1890ff;
}

.plan-amount {
  margin-bottom: 16px;
}

.plan-amount .currency {
  font-size: 14px;
  color: #666;
  margin-right: 4px;
}

.plan-amount {
  text-align: center;
  margin: 16px 0;
}

.plan-amount .value {
  font-size: 22px;
  font-weight: bold;
  color: #2C8976;
}

.stat-grid-plan {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-top: 16px;
}

.stat-item-plan {
  text-align: center;
}

.stat-label-plan {
  font-size: 12px;
  color: #666;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-value-plan {
  font-size: 13px;
  color: #f5a623;
  font-weight: bold;
}

/* 快捷入口 */
.quick-access {
  background: white;
  border-radius: 10px;
  padding: 20px;
}

.access-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.access-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 10px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.access-item:hover {
  background: #f0f9ff;
}

.access-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
}

.access-icon.green {
  background: #52c41a;
}

.access-icon.orange {
  background: #fa8c16;
}

.access-icon.red {
  background: #f5222d;
}

.access-icon.blue {
  background: #1890ff;
}

.access-icon.purple {
  background: #722ed1;
}

.access-icon.teal {
  background: #13c2c2;
}

.access-icon.gray {
  background: #8c8c8c;
}

.access-text {
  font-size: 12px;
  color: #666;
  text-align: center;
  line-height: 1.2;
}
</style>