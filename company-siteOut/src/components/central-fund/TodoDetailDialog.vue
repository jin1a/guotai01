<template>
  <el-dialog 
    :model-value="visible" 
    :title="getDialogTitle()" 
    width="90%"
    :close-on-click-modal="false"
    @close="$emit('close')"
  >
    <div v-if="todo" class="todo-detail">
      <!-- 基本信息 -->
      <div class="detail-section">
        <h4 class="detail-title">基本信息</h4>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">計劃編號：</span>
            <span class="detail-value">{{ todo.planCode }}</span>
          </div>
          <!-- 新加入計劃申請特有字段 -->
          <template v-if="tab === 'registration'">
            <div class="detail-item">
              <span class="detail-label">僱員姓名：</span>
              <span class="detail-value">{{ todo.employeeName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">證件號碼：</span>
              <span class="detail-value">{{ todo.idCard }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">受僱日期：</span>
              <span class="detail-value">{{ todo.hireDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">適用對象：</span>
              <span class="detail-value">{{ todo.employeeType }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">參與計劃時間：</span>
              <span class="detail-value">{{ todo.planJoinDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">薪資：</span>
              <span class="detail-value">{{ formatCurrency(todo.salary) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">僱主供款額：</span>
              <span class="detail-value">{{ formatCurrency(todo.salary * 0.05) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">僱員供款額：</span>
              <span class="detail-value">{{ formatCurrency(todo.salary * 0.05) }}</span>
            </div>
          </template>
          <!-- 終止參與計劃申請特有字段 -->
          <template v-if="tab === 'termination'">
            <div class="detail-item">
              <span class="detail-label">僱員姓名：</span>
              <span class="detail-value">{{ todo.employeeName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">證件號碼：</span>
              <span class="detail-value">{{ todo.idCard }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">受僱日期：</span>
              <span class="detail-value">{{ todo.hireDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">僱員類型：</span>
              <span class="detail-value">{{ todo.employeeType }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">參與計劃時間：</span>
              <span class="detail-value">{{ todo.planJoinDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">薪資：</span>
              <span class="detail-value">{{ formatCurrency(todo.salary) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">提出時間：</span>
              <span class="detail-value">{{ todo.submitTime }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">終止時間：</span>
              <span class="detail-value">{{ todo.terminationTime }}</span>
            </div>
          </template>
          <!-- 調職申請特有字段 -->
          <template v-if="tab === 'transfer'">
            <div class="detail-item">
              <span class="detail-label">僱員姓名：</span>
              <span class="detail-value">{{ todo.employeeName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">證件號碼：</span>
              <span class="detail-value">{{ todo.idCard }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">受僱日期：</span>
              <span class="detail-value">{{ todo.hireDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">僱員類型：</span>
              <span class="detail-value">{{ todo.employeeType }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">參與計劃時間：</span>
              <span class="detail-value">{{ todo.planJoinDate }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">當前薪資：</span>
              <span class="detail-value">{{ formatCurrency(todo.salary) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">原計劃方案：</span>
              <span class="detail-value">{{ todo.originalPlan }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">新計劃方案：</span>
              <span class="detail-value">{{ todo.newPlan }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">原薪資：</span>
              <span class="detail-value">{{ formatCurrency(todo.originalSalary) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">新薪資：</span>
              <span class="detail-value">{{ formatCurrency(todo.newSalary) }}</span>
            </div>
          </template>
          <!-- 調薪申請特有字段 -->
          <template v-if="tab === 'review'">
            <div class="detail-item">
              <span class="detail-label">僱員姓名：</span>
              <span class="detail-value">{{ todo.employeeName }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">證件號碼：</span>
              <span class="detail-value">{{ todo.idCard }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">供款週期：</span>
              <span class="detail-value">{{ todo.contributionPeriod }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">原薪資：</span>
              <span class="detail-value">{{ formatCurrency(todo.originalSalary) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">新薪資：</span>
              <span class="detail-value">{{ formatCurrency(todo.newSalary) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">調薪幅度：</span>
              <span class="detail-value">
                <span :class="todo.newSalary >= todo.originalSalary ? 'salary-increase' : 'salary-decrease'">
                  {{ formatCurrency(todo.newSalary - todo.originalSalary) }}
                  ({{ ((todo.newSalary - todo.originalSalary) / todo.originalSalary * 100).toFixed(1) }}%)
                </span>
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">調薪原因：</span>
              <span class="detail-value">{{ todo.adjustmentReason }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">提交人：</span>
              <span class="detail-value">{{ todo.submitter }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">提交時間：</span>
              <span class="detail-value">{{ todo.submitTime }}</span>
            </div>
          </template>
          <!-- 手動供款清單審批特有字段 -->
          <template v-if="tab === 'manual-contribution'">
            <div class="detail-item">
              <span class="detail-label">供款月份：</span>
              <span class="detail-value">{{ todo.contributionMonth }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">供款類型：</span>
              <span class="detail-value">{{ todo.contributionType }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">總金額：</span>
              <span class="detail-value">{{ formatCurrency(todo.totalAmount) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">參與人數：</span>
              <span class="detail-value">{{ todo.employeeCount }}人</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">提交人：</span>
              <span class="detail-value">{{ todo.submitter }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">清單備註：</span>
              <span class="detail-value">{{ todo.remarks || '無' }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">供款清單：</span>
              <span class="detail-value">
                <el-link 
                  type="primary" 
                  @click="$emit('download', todo)"
                  icon="el-icon-download"
                >
                  下載供款清單
                </el-link>
              </span>
            </div>
          </template>
          <!-- 通用字段 -->
          <div class="detail-item">
            <span class="detail-label">狀態：</span>
            <el-tag :type="getStatusType(todo.status)">
              {{ todo.status }}
            </el-tag>
          </div>
          <div class="detail-item" v-if="todo.failureReason">
            <span class="detail-label">失敗原因：</span>
            <span class="detail-value error">{{ todo.failureReason }}</span>
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
      <el-button @click="$emit('close')">關閉</el-button>
      <el-button 
        type="primary" 
        @click="$emit('review', todo)"
      >
        提交審核
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  visible: Boolean,
  todo: Object,
  tab: String
})
const emit = defineEmits(['close', 'review', 'download'])

function getDialogTitle() {
  if (!props.todo) return '詳情'
  const titles = {
    'registration': '新加入計劃申請詳情',
    'termination': '終止參與計劃申請詳情', 
    'transfer': '調職申請詳情',
    'review': '調薪申請詳情',
    'manual-contribution': '手動供款清單審批詳情'
  }
  return titles[props.tab] || '詳情'
}
function getApplicant() {
  if (!props.todo) return '-'
  switch (props.tab) {
    case 'registration':
    case 'termination':
    case 'transfer':
      return props.todo.applicant || props.todo.employeeName || '-'
    case 'review':
    case 'manual-contribution':
      return props.todo.submitter || '-'
    default:
      return '-'
  }
}
function getApplicationTime() {
  if (!props.todo) return '-'
  switch (props.tab) {
    case 'registration':
      return props.todo.applicationTime || props.todo.planJoinDate || '-'
    case 'termination':
    case 'transfer':
    case 'review':
    case 'manual-contribution':
      return props.todo.submitTime || '-'
    default:
      return '-'
  }
}
function formatCurrency(amount) {
  if (typeof amount !== 'number') return '-'
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'MOP',
    minimumFractionDigits: 0
  }).format(amount)
}
function getStatusType(status) {
  const statusMap = {
    '未受邀': 'warning',
    '待確認提交': '',
    '確認失敗': 'danger',
    '審批失敗': 'danger',
    '審核失敗': 'danger',
    '審批中': 'warning',
    '確認中': '',
    '提交中': '',
    '處理中': 'warning',
    '待處理': 'warning',
    '待審批': 'warning',
    '已審批': 'success',
    '已完成': 'success',
    '已通過': 'success',
    '已駁回': 'danger'
  }
  return statusMap[status] || ''
}
</script>

<style scoped>
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
</style> 