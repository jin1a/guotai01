<template>
  <div class="contribution-request-progress">
    <div class="page-header">
      <h2>供款調整申請進度</h2>
    </div>

    <!-- 三种调整申请场景的卡片列表 -->
    <div class="scenario-cards">
      <!-- 场景1: 薪资调整申请 - 营运审批中 -->
      <el-card class="scenario-card">
        <template #header>
          <div class="card-header">
            <div class="scenario-info">
              <h3>薪資調整申請</h3>
              <el-tag type="primary" size="small">計劃編號: ER12345</el-tag>
            </div>
            <el-tag type="warning" size="large">營運審批中</el-tag>
          </div>
          <div class="scenario-meta">
            <div class="meta-item">
              <span class="label">調整類型：</span>
              <span class="value">薪資調整</span>
            </div>
            <div class="meta-item">
              <span class="label">調整期間：</span>
              <span class="value">2025年1月起</span>
            </div>
            <div class="meta-item">
              <span class="label">影響雇員：</span>
              <span class="value">5 人</span>
            </div>
            <div class="meta-item">
              <span class="label">提交時間：</span>
              <span class="value">2025/01/15 10:30</span>
            </div>
          </div>
          <div class="adjustment-summary">
            <h5>調整概要</h5>
            <p>因公司薪酬調整，5名雇員的月薪由原本的25,000-30,000調整至30,000-35,000，需要更新供款計算基數。</p>
          </div>
        </template>

        <div class="progress-timeline">
          <div 
            v-for="(step, index) in salaryAdjustmentSteps" 
            :key="index"
            class="timeline-step"
            :class="{ 
              'completed': step.status === 'completed',
              'current': step.status === 'current',
              'pending': step.status === 'pending'
            }"
          >
            <div class="step-connector" v-if="index < salaryAdjustmentSteps.length - 1"></div>
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

      <!-- 场景2: 雇员加入申请 - 已审批通过 -->
      <el-card class="scenario-card">
        <template #header>
          <div class="card-header">
            <div class="scenario-info">
              <h3>雇員加入申請</h3>
              <el-tag type="primary" size="small">計劃編號: ER67890</el-tag>
            </div>
            <el-tag type="success" size="large">已審批通過</el-tag>
          </div>
          <div class="scenario-meta">
            <div class="meta-item">
              <span class="label">調整類型：</span>
              <span class="value">雇員加入</span>
            </div>
            <div class="meta-item">
              <span class="label">調整期間：</span>
              <span class="value">2024年12月起</span>
            </div>
            <div class="meta-item">
              <span class="label">影響雇員：</span>
              <span class="value">3 人</span>
            </div>
            <div class="meta-item">
              <span class="label">提交時間：</span>
              <span class="value">2024/12/20 14:20</span>
            </div>
          </div>
          <div class="adjustment-summary">
            <h5>調整概要</h5>
            <p>新加入3名雇員參與計劃，月薪分別為28,000、32,000、30,000，需要補繳本月供款。</p>
          </div>
        </template>

        <div class="progress-timeline">
          <div 
            v-for="(step, index) in employeeAdditionSteps" 
            :key="index"
            class="timeline-step"
            :class="{ 
              'completed': step.status === 'completed',
              'current': step.status === 'current',
              'pending': step.status === 'pending'
            }"
          >
            <div class="step-connector" v-if="index < employeeAdditionSteps.length - 1"></div>
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

      <!-- 场景3: 雇员离职申请 - 审批被驳回 -->
      <el-card class="scenario-card">
        <template #header>
          <div class="card-header">
            <div class="scenario-info">
              <h3>雇員離職申請</h3>
              <el-tag type="warning" size="small">計劃編號: ER12346</el-tag>
            </div>
            <el-tag type="danger" size="large">審批駁回</el-tag>
          </div>
          <div class="scenario-meta">
            <div class="meta-item">
              <span class="label">調整類型：</span>
              <span class="value">終止供款</span>
            </div>
            <div class="meta-item">
              <span class="label">調整期間：</span>
              <span class="value">2025年1月起</span>
            </div>
            <div class="meta-item">
              <span class="label">影響雇員：</span>
              <span class="value">2 人</span>
            </div>
            <div class="meta-item">
              <span class="label">提交時間：</span>
              <span class="value">2025/01/20 09:15</span>
            </div>
          </div>
          <div class="adjustment-summary">
            <h5>調整概要</h5>
            <p>2名雇員將於本月底離職，需要終止其供款資格。申請資料需要補充完整。</p>
          </div>
        </template>

        <div class="progress-timeline">
          <div 
            v-for="(step, index) in employeeTerminationSteps" 
            :key="index"
            class="timeline-step"
            :class="{ 
              'completed': step.status === 'completed',
              'current': step.status === 'current',
              'pending': step.status === 'pending',
              'rejected': step.status === 'rejected'
            }"
          >
            <div class="step-connector" v-if="index < employeeTerminationSteps.length - 1"></div>
            <div class="step-icon">
              <el-icon v-if="step.status === 'completed'"><Check /></el-icon>
              <el-icon v-else-if="step.status === 'current'"><Clock /></el-icon>
              <el-icon v-else-if="step.status === 'rejected'"><Close /></el-icon>
              <span v-else>{{ index + 1 }}</span>
            </div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-description">{{ step.description }}</div>
              <div class="step-time">{{ step.time }}</div>
              <div v-if="step.rejection" class="step-rejection">
                <span class="rejection-reason">駁回原因：{{ step.rejection }}</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { Check, Clock, Close } from '@element-plus/icons-vue'

export default {
  name: 'ServiceProgressContributionRequest',
  components: {
    Check,
    Clock,
    Close
  },
  data() {
    return {
      // 场景1: 薪资调整申请 - 营运审批中
      salaryAdjustmentSteps: [
        {
          title: '提交申請',
          description: '企業提交薪資調整申請',
          time: '2025/01/15 10:30',
          status: 'completed'
        },
        {
          title: '營運審批',
          description: '營運端審批處理中',
          time: '進行中',
          status: 'current'
        },
        {
          title: '審批完成',
          description: '審批結果確認並生效',
          time: '待處理',
          status: 'pending'
        }
      ],

      // 场景2: 雇员加入申请 - 已审批通过
      employeeAdditionSteps: [
        {
          title: '提交申請',
          description: '企業提交雇員加入申請',
          time: '2024/12/20 14:20',
          status: 'completed'
        },
        {
          title: '營運審批',
          description: '營運端審批通過',
          time: '2024/12/21 09:45',
          status: 'completed'
        },
        {
          title: '審批完成',
          description: '審批結果已生效，供款開始',
          time: '2024/12/21 16:30',
          status: 'completed'
        }
      ],

      // 场景3: 雇员离职申请 - 审批被驳回
      employeeTerminationSteps: [
        {
          title: '提交申請',
          description: '企業提交雇員離職申請',
          time: '2025/01/20 09:15',
          status: 'completed'
        },
        {
          title: '營運審批',
          description: '營運端審批駁回',
          time: '2025/01/20 15:30',
          status: 'rejected',
          rejection: '離職證明文件不完整，請補充完整資料後重新提交'
        },
        {
          title: '審批完成',
          description: '需重新提交申請',
          time: '待處理',
          status: 'pending'
        }
      ]
    }
  }
}
</script>

<style scoped>
.contribution-request-progress {
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
  margin-bottom: 16px;
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

.adjustment-summary {
  padding: 16px;
  background: #f4f7ff;
  border-radius: 6px;
  border-left: 4px solid #409eff;
  margin-bottom: 24px;
}

.adjustment-summary h5 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.adjustment-summary p {
  margin: 0;
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
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

.timeline-step.rejected .step-connector {
  background: linear-gradient(to bottom, #67c23a 0%, #67c23a 50%, #f56c6c 50%, #f56c6c 100%);
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

.timeline-step.rejected .step-icon {
  background: #f56c6c;
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

.timeline-step.rejected .step-title {
  color: #f56c6c;
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

.step-rejection {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef0f0;
  border-radius: 4px;
  border-left: 3px solid #f56c6c;
}

.rejection-reason {
  font-size: 13px;
  color: #f56c6c;
  font-weight: 500;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .contribution-request-progress {
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