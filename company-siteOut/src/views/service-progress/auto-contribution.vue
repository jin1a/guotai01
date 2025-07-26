<template>
  <div class="auto-contribution-progress">
    <div class="page-header">
      <h2>自動供款服務進度</h2>
    </div>

    <!-- 三种业务场景的卡片列表 -->
    <div class="scenario-cards">
      <!-- 场景1: 自动供款调整流程 -->
      <el-card class="scenario-card">
        <template #header>
          <div class="card-header">
            <div class="scenario-info">
              <h3>自動供款調整流程</h3>
              <el-tag type="primary" size="small">計劃編號: ER12345</el-tag>
            </div>
            <el-tag type="warning" size="large">營運審批中</el-tag>
          </div>
          <div class="scenario-meta">
            <div class="meta-item">
              <span class="label">供款期間：</span>
              <span class="value">2025年1月</span>
            </div>
            <div class="meta-item">
              <span class="label">供款金額：</span>
              <span class="value amount">{{ formatCurrency(256750) }}</span>
            </div>
            <div class="meta-item">
              <span class="label">提交時間：</span>
              <span class="value">2025/01/15 09:30</span>
            </div>
          </div>
        </template>

        <div class="progress-timeline">
          <div 
            v-for="(step, index) in scenario1Steps" 
            :key="index"
            class="timeline-step"
            :class="{ 
              'completed': step.status === 'completed',
              'current': step.status === 'current',
              'pending': step.status === 'pending'
            }"
          >
            <div class="step-connector" v-if="index < scenario1Steps.length - 1"></div>
            <div class="step-icon">
              <el-icon v-if="step.status === 'completed'"><Check /></el-icon>
              <el-icon v-else-if="step.status === 'current'"><Clock /></el-icon>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-description">{{ step.description }}</div>
              <div class="step-time">{{ step.time }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 场景2: 自动供款直接确认 -->
      <el-card class="scenario-card">
        <template #header>
          <div class="card-header">
            <div class="scenario-info">
              <h3>自動供款直接確認</h3>
              <el-tag type="primary" size="small">計劃編號: ER67890</el-tag>
            </div>
            <el-tag type="primary" size="large">營運結算中</el-tag>
          </div>
          <div class="scenario-meta">
            <div class="meta-item">
              <span class="label">供款期間：</span>
              <span class="value">2024年12月</span>
            </div>
            <div class="meta-item">
              <span class="label">供款金額：</span>
              <span class="value amount">{{ formatCurrency(185300) }}</span>
            </div>
            <div class="meta-item">
              <span class="label">提交時間：</span>
              <span class="value">2024/12/25 14:20</span>
            </div>
          </div>
        </template>

        <div class="progress-timeline">
          <div 
            v-for="(step, index) in scenario2Steps" 
            :key="index"
            class="timeline-step"
            :class="{ 
              'completed': step.status === 'completed',
              'current': step.status === 'current',
              'pending': step.status === 'pending'
            }"
          >
            <div class="step-connector" v-if="index < scenario2Steps.length - 1"></div>
            <div class="step-icon">
              <el-icon v-if="step.status === 'completed'"><Check /></el-icon>
              <el-icon v-else-if="step.status === 'current'"><Clock /></el-icon>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-description">{{ step.description }}</div>
              <div class="step-time">{{ step.time }}</div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 场景3: 手动供款流程 -->
      <el-card class="scenario-card">
        <template #header>
          <div class="card-header">
            <div class="scenario-info">
              <h3>手動供款流程</h3>
              <el-tag type="warning" size="small">計劃編號: ER12346</el-tag>
            </div>
            <el-tag type="warning" size="large">繳費通知書生成中</el-tag>
          </div>
          <div class="scenario-meta">
            <div class="meta-item">
              <span class="label">供款期間：</span>
              <span class="value">2025年1月</span>
            </div>
            <div class="meta-item">
              <span class="label">供款金額：</span>
              <span class="value amount">{{ formatCurrency(325000) }}</span>
            </div>
            <div class="meta-item">
              <span class="label">提交時間：</span>
              <span class="value">2025/01/20 16:45</span>
            </div>
          </div>
        </template>

        <div class="progress-timeline">
          <div 
            v-for="(step, index) in scenario3Steps" 
            :key="index"
            class="timeline-step"
            :class="{ 
              'completed': step.status === 'completed',
              'current': step.status === 'current',
              'pending': step.status === 'pending'
            }"
          >
            <div class="step-connector" v-if="index < scenario3Steps.length - 1"></div>
            <div class="step-icon">
              <el-icon v-if="step.status === 'completed'"><Check /></el-icon>
              <el-icon v-else-if="step.status === 'current'"><Clock /></el-icon>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-description">{{ step.description }}</div>
              <div class="step-time">{{ step.time }}</div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { Check, Clock } from '@element-plus/icons-vue'

export default {
  name: 'ServiceProgressAutoContribution',
  components: {
    Check,
    Clock
  },
  data() {
    return {
      // 场景1: 自动供款调整流程 - 营运审批中
      scenario1Steps: [
        {
          title: '繳費通知書',
          description: '系統生成繳費通知書',
          time: '2025/01/10 09:00',
          status: 'completed'
        },
        {
          title: '調整申請',
          description: '企業提交供款調整申請',
          time: '2025/01/12 14:30',
          status: 'completed'
        },
        {
          title: '企業審批',
          description: '企業內部審批通過',
          time: '2025/01/13 10:15',
          status: 'completed'
        },
        {
          title: '營運審批',
          description: '營運端審批處理中',
          time: '進行中',
          status: 'current'
        },
        {
          title: '繳費通知書',
          description: '生成調整後繳費通知書',
          time: '待處理',
          status: 'pending'
        },
        {
          title: '確認繳費通知書',
          description: '企業確認繳費通知書',
          time: '待處理',
          status: 'pending'
        }
      ],

      // 场景2: 自动供款直接确认 - 营运结算中
      scenario2Steps: [
        {
          title: '繳費通知書',
          description: '系統生成繳費通知書',
          time: '2024/12/25 14:20',
          status: 'completed'
        },
        {
          title: '確認繳費通知書',
          description: '企業確認繳費通知書',
          time: '2024/12/26 09:30',
          status: 'completed'
        },
        {
          title: '營運結算',
          description: '營運端結算處理中',
          time: '進行中',
          status: 'current'
        }
      ],

      // 场景3: 手动供款流程 - 缴费通知书待生成
      scenario3Steps: [
        {
          title: '提交供款清單',
          description: '企業提交手動供款清單',
          time: '2025/01/18 16:45',
          status: 'completed'
        },
        {
          title: '雇主審批',
          description: '雇主內部審批通過',
          time: '2025/01/19 10:30',
          status: 'completed'
        },
        {
          title: '繳費通知書',
          description: '生成繳費通知書中',
          time: '進行中',
          status: 'current'
        },
        {
          title: '確認繳費通知書',
          description: '企業確認繳費通知書',
          time: '待處理',
          status: 'pending'
        },
        {
          title: '營運結算',
          description: '營運端結算處理',
          time: '待處理',
          status: 'pending'
        }
      ]
    }
  },
  methods: {
    formatCurrency(amount) {
      return new Intl.NumberFormat('zh-CN', {
        style: 'currency',
        currency: 'MOP',
        minimumFractionDigits: 0
      }).format(amount)
    }
  }
}
</script>

<style scoped>
.auto-contribution-progress {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  color: #333;
  border-bottom: 2px solid #40a98f;
  padding-bottom: 5px;
  display: inline-block;
}

.scenario-cards {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.scenario-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.scenario-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scenario-info h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.scenario-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-item .label {
  color: #909399;
  margin-right: 8px;
  font-size: 14px;
  min-width: 70px;
}

.meta-item .value {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.meta-item .amount {
  color: #2C8976;
  font-weight: 600;
}

.progress-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.timeline-step {
  display: flex;
  align-items: flex-start;
  position: relative;
  padding: 16px 0;
}

.timeline-step:not(:last-child) {
  border-bottom: 1px solid #f0f0f0;
}

.step-connector {
  position: absolute;
  left: 11px;
  top: 40px;
  bottom: -16px;
  width: 2px;
  background: #e4e7ed;
}

.timeline-step.completed .step-connector {
  background: #67c23a;
}

.timeline-step.current .step-connector {
  background: linear-gradient(to bottom, #67c23a 0%, #67c23a 50%, #e4e7ed 50%, #e4e7ed 100%);
}

.step-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e4e7ed;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-right: 16px;
  flex-shrink: 0;
  z-index: 1;
}

.timeline-step.completed .step-icon {
  background: #67c23a;
}

.timeline-step.current .step-icon {
  background: #409eff;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(64, 158, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
  }
}

.step-content {
  flex: 1;
  min-width: 0;
}

.step-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.timeline-step.completed .step-title {
  color: #67c23a;
}

.timeline-step.current .step-title {
  color: #409eff;
}

.step-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 6px;
  line-height: 1.4;
}

.step-time {
  font-size: 13px;
  color: #909399;
}

.timeline-step.current .step-time {
  color: #409eff;
  font-weight: 500;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .auto-contribution-progress {
    padding: 16px;
  }
  
  .scenario-meta {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .step-content {
    margin-left: 8px;
  }
  
  .step-title {
    font-size: 15px;
  }
  
  .step-description {
    font-size: 13px;
  }
}

/* Element Plus 标签样式优化 */
:deep(.el-tag) {
  border-radius: 4px;
  font-weight: 500;
}

:deep(.el-tag--large) {
  padding: 8px 16px;
  font-size: 14px;
}

:deep(.el-card__header) {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #f0f2f5;
}

:deep(.el-card__body) {
  padding: 24px;
}
</style>