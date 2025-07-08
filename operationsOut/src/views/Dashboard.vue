<template>
  <div class="dashboard">


    <!-- 欢迎信息 -->
    <div class="welcome-section">
      <h2 class="welcome-title">歡迎回來</h2>
      <span class="login-time">最後登入時間2024年06月19日 15:19</span>
    </div>

    <!-- 计划切换 -->
    <div class="plan-tabs">
      <div class="tab-item" :class="{ active: activeTab === 'plan1' }" @click="activeTab = 'plan1'">
        央積金共同計劃
      </div>
      <div class="tab-item disabled" :class="{ active: activeTab === 'plan2' }" @click="activeTab = 'plan2'">
        央積金共同計劃
      </div>
    </div>

    <!-- 计划信息 -->
    <div class="plan-section">
      <h3 class="section-title">央積金共同計劃</h3>
      <div class="plan-info">
        <div class="plan-card">
          <div class="plan-header">
            <span class="plan-id">ER0010A</span>
            <span class="plan-name">非強制央積金共同計劃</span>
          </div>
          <div class="plan-details">
            <div class="detail-row">
              <div class="detail-item">
                <span class="label">機構名稱：</span>
                <span class="value">xxxxxxxx公司</span>
              </div>
              <div class="detail-item">
                <span class="label">計劃生效日期：</span>
                <span class="value">2025/02/25</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="label">生效中成員總人數：</span>
                <span class="value">2198</span>
              </div>
              <div class="detail-item">
                <span class="label">合約：</span>
                <span class="value">2025xxxxxxxx公司PDF</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 账户信息 -->
    <div class="account-section">
      <h3 class="section-title">賬戶信息</h3>
      <div class="account-cards">
        <!-- 供款总额 -->
        <div class="info-card">
          <div class="card-content">
            <div class="card-header">
              <span>供款總額</span>
              <el-tooltip content="更多信息" placement="top">
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="amount">
              <span class="currency">MOP</span>
              <span class="value">11,180,317.81</span>
            </div>
            <div class="update-time">更新於 2025/02/25</div>
          </div>
          <div class="card-icon">
            <el-icon><Money /></el-icon>
          </div>
        </div>

        <!-- 总积分额 -->
        <div class="info-card">
          <div class="card-content">
            <div class="card-header">
              <span>總積分額</span>
              <div class="percentage">
                <span>81</span>
                <el-icon><DataLine /></el-icon>
              </div>
            </div>
            <div class="sub-text">月度繳費與僱員低扣僱主供款部分</div>
            <div class="update-time">更新於 2025/02/25</div>
          </div>
          <div class="card-icon">
            <el-icon><PieChart /></el-icon>
          </div>
        </div>

        <!-- 僱主總供款 -->
        <div class="info-card">
          <div class="card-content">
            <div class="card-header">
              <span>僱主總供款</span>
            </div>
            <div class="amount">
              <span class="currency">MOP</span>
              <span class="value">11,180,317.81</span>
            </div>
            <div class="update-time">更新於 2025/02/25</div>
          </div>
          <div class="card-icon">
            <el-icon><UserFilled /></el-icon>
          </div>
        </div>

        <!-- 僱員總供款 -->
        <div class="info-card">
          <div class="card-content">
            <div class="card-header">
              <span>僱員總供款</span>
            </div>
            <div class="amount">
              <span class="currency">MOP</span>
              <span class="value">11,180,317.81</span>
            </div>
            <div class="update-time">更新於 2025/02/25</div>
          </div>
          <div class="card-icon">
            <el-icon><User /></el-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 最新供款 -->
    <div class="latest-contribution">
      <div class="section-header">
        <h3 class="section-title">最新供款</h3>
        <el-tag type="danger" size="small" effect="plain">
          <el-icon><Warning /></el-icon>
          尚有第 1 個月的待繳付，請及時處理。
        </el-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  Warning, 
  InfoFilled, 
  Money,
  DataLine,
  PieChart,
  User,
  UserFilled
} from '@element-plus/icons-vue'

const activeTab = ref('plan1')
</script>

<style scoped>
.dashboard {
  padding: 24px;
}

/* 顶部通知 */
.top-alert {
  margin-bottom: 24px;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

/* 欢迎区域 */
.welcome-section {
  margin-bottom: 24px;
}

.welcome-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.login-time {
  color: #666;
  font-size: 14px;
}

/* 计划信息 */
.plan-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
}

.plan-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.plan-header {
  margin-bottom: 16px;
}

.plan-id {
  font-size: 16px;
  color: #333;
  margin-right: 12px;
}

.plan-name {
  color: #2C8976;
}

.plan-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
}

.detail-item {
  flex: 1;
}

.detail-item .label {
  color: #666;
  margin-right: 8px;
}

.detail-item .value {
  color: #333;
}

/* 账户信息卡片 */
.account-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.info-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  min-height: 160px;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  color: #666;
  font-size: 16px;
}

.amount {
  margin-bottom: 8px;
}

.currency {
  font-size: 14px;
  color: #666;
  margin-right: 4px;
}

.value {
  font-size: 24px;
  color: #333;
  font-weight: 600;
}

.update-time {
  color: #999;
  font-size: 12px;
}

.card-icon {
  margin-left: 16px;
  font-size: 48px;
  color: rgba(44, 137, 118, 0.1);
}

.card-icon .el-icon {
  font-size: inherit;
}

.percentage {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f5a623;
  font-weight: 600;
}

.sub-text {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

/* 最新供款 */
.latest-contribution {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

:deep(.el-tag) {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 计划切换样式 */
.plan-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 24px;
}

.tab-item {
  padding: 12px 24px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
  background: #fff;
  position: relative;
}

.tab-item:first-child {
  font-weight: 500;
}

.tab-item.disabled {
  background: #F5F7FA;
  color: #999;
  cursor: default;
}

.tab-item:not(.disabled):hover {
  color: #2C8976;
}

.tab-item.active {
  color: #333;
}

.tab-item:first-child::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 16px;
  background-color: #E4E7ED;
}
</style> 