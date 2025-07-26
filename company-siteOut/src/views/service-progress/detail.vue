<template>
  <div class="service-progress-detail">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>服務進度詳情</span>
          <el-button @click="goBack">
            <el-icon class="el-icon--left"><ArrowLeft /></el-icon>
            返回列表
          </el-button>
        </div>
      </template>

      <div v-if="taskDetail" class="detail-container">
        <!-- 基本信息 -->
        <div class="info-section">
          <h3>基本信息</h3>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="任務編號">{{ taskDetail.taskNo }}</el-descriptions-item>
            <el-descriptions-item label="計劃名稱">{{ taskDetail.planName }}</el-descriptions-item>
            <el-descriptions-item label="供款期間">{{ taskDetail.contributionPeriod }}</el-descriptions-item>
            <el-descriptions-item label="供款金額">
              <span class="amount-text">{{ formatMoney(taskDetail.amount) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="提交日期">{{ taskDetail.submitDate }}</el-descriptions-item>
            <el-descriptions-item label="當前狀態">
              <el-tag :type="getStatusType(taskDetail.status)" size="large">
                {{ getStatusText(taskDetail.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="完成日期" v-if="taskDetail.completedDate">
              {{ taskDetail.completedDate }}
            </el-descriptions-item>
            <el-descriptions-item label="服務進度">
              <el-progress 
                :percentage="taskDetail.progress" 
                :status="taskDetail.status === 'completed' ? 'success' : ''"
                :stroke-width="8"
                style="width: 200px;"
              />
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 服務進度時間軸 -->
        <div class="timeline-section">
          <h3>服務進度追蹤</h3>
          <el-timeline>
            <el-timeline-item
              v-for="(activity, index) in taskDetail.timeline"
              :key="index"
              :timestamp="activity.timestamp"
              placement="top"
              :type="activity.type"
              :hollow="!activity.completed"
            >
              <div class="timeline-content">
                <div class="timeline-title">{{ activity.title }}</div>
                <div class="timeline-desc">{{ activity.description }}</div>
                <div class="timeline-handler" v-if="activity.operator">
                  操作人：{{ activity.operator }}
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 相關文件 -->
        <div class="documents-section">
          <h3>相關文件</h3>
          <el-table :data="taskDetail.documents || []" border>
            <el-table-column prop="name" label="文件名稱" />
            <el-table-column prop="type" label="文件類型" width="120" />
            <el-table-column prop="uploadTime" label="上傳時間" width="180" />
            <el-table-column prop="uploader" label="上傳人" width="120" />
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button link type="primary" size="small" @click="downloadFile(scope.row)">
                  下載
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 操作按钮 -->
        <div class="action-section">
          <el-button @click="goBack">返回列表</el-button>
          <el-button type="primary" @click="exportReport">
            <el-icon class="el-icon--left"><Download /></el-icon>
            導出報告
          </el-button>
        </div>
      </div>
      
      <div v-else class="loading-container">
        <el-empty description="加載中..." />
      </div>
    </el-card>
  </div>
</template>

<script>
import { ArrowLeft, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'ServiceProgressDetail',
  components: {
    ArrowLeft,
    Download
  },
  data() {
    return {
      taskDetail: null
    }
  },
  mounted() {
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      const taskNo = this.$route.query.taskNo
      if (!taskNo) {
        ElMessage.error('缺少任務編號')
        this.goBack()
        return
      }

      try {
        // 模擬API調用
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // 模擬數據 - 實際應從API獲取
        const mockDetails = {
          'CPF-TASK-2025030001': {
            taskNo: 'CPF-TASK-2025030001',
            planName: '央積金A計劃',
            contributionPeriod: '2025/02/25 - 2025/03/25',
            amount: 256750.00,
            submitDate: '2025-03-01',
            status: 'reviewing',
            currentStep: '營運端審核中',
            progress: 60,
            completedDate: null,
            timeline: [
              {
                timestamp: '2025-03-01 09:00',
                title: '提交供款憑證',
                description: '企業端提交2月份供款憑證',
                operator: '陳大文',
                type: 'success',
                completed: true
              },
              {
                timestamp: '2025-03-01 10:30',
                title: '初步審核',
                description: '營運端開始審核供款憑證',
                operator: '審核員A',
                type: 'primary',
                completed: true
              },
              {
                timestamp: '2025-03-01 14:00',
                title: '財務對賬',
                description: '正在進行財務對賬',
                operator: '財務部',
                type: 'warning',
                completed: false
              },
              {
                timestamp: '預計 2025-03-02',
                title: '審核完成',
                description: '預計完成所有審核流程',
                type: '',
                completed: false
              }
            ],
            documents: [
              {
                name: '2月份供款憑證.pdf',
                type: 'PDF',
                uploadTime: '2025-03-01 09:00',
                uploader: '陳大文'
              },
              {
                name: '銀行轉賬記錄.pdf',
                type: 'PDF',
                uploadTime: '2025-03-01 09:05',
                uploader: '陳大文'
              }
            ]
          },
          'CPF-TASK-2025020002': {
            taskNo: 'CPF-TASK-2025020002',
            planName: '央積金B計劃',
            contributionPeriod: '2025/01/25 - 2025/02/25',
            amount: 198500.00,
            submitDate: '2025-02-25',
            status: 'completed',
            currentStep: '對賬完成',
            progress: 100,
            completedDate: '2025-02-26',
            timeline: [
              {
                timestamp: '2025-02-25 09:00',
                title: '提交供款憑證',
                description: '企業端提交1月份供款憑證',
                operator: '陳大文',
                type: 'success',
                completed: true
              },
              {
                timestamp: '2025-02-25 14:00',
                title: '初步審核',
                description: '營運端完成初步審核',
                operator: '審核員B',
                type: 'success',
                completed: true
              },
              {
                timestamp: '2025-02-26 10:00',
                title: '財務對賬',
                description: '財務對賬完成，金額無誤',
                operator: '財務部',
                type: 'success',
                completed: true
              },
              {
                timestamp: '2025-02-26 15:00',
                title: '審核完成',
                description: '所有審核流程完成',
                operator: '系統',
                type: 'success',
                completed: true
              }
            ],
            documents: [
              {
                name: '1月份供款憑證.pdf',
                type: 'PDF',
                uploadTime: '2025-02-25 09:00',
                uploader: '陳大文'
              },
              {
                name: '對賬報告.pdf',
                type: 'PDF',
                uploadTime: '2025-02-26 15:00',
                uploader: '系統'
              }
            ]
          }
        }
        
        this.taskDetail = mockDetails[taskNo] || this.generateDefaultDetail(taskNo)
        
      } catch (error) {
        ElMessage.error('加載詳情失敗')
        console.error(error)
      }
    },
    
    generateDefaultDetail(taskNo) {
      // 為其他任務生成默認詳情
      return {
        taskNo: taskNo,
        planName: '默認計劃',
        contributionPeriod: '2025/01/01 - 2025/02/01',
        amount: 100000.00,
        submitDate: '2025-01-01',
        status: 'reviewing',
        currentStep: '處理中',
        progress: 50,
        timeline: [
          {
            timestamp: '2025-01-01 09:00',
            title: '提交申請',
            description: '申請已提交',
            type: 'success',
            completed: true
          }
        ],
        documents: []
      }
    },
    
    formatMoney(amount) {
      return amount ? `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'
    },
    
    getStatusType(status) {
      const typeMap = {
        'reviewing': 'warning',
        'completed': 'success'
      }
      return typeMap[status] || 'info'
    },
    
    getStatusText(status) {
      const textMap = {
        'reviewing': '審批中',
        'completed': '對賬完成'
      }
      return textMap[status] || status
    },
    
    goBack() {
      this.$router.back()
    },
    
    exportReport() {
      ElMessage.success('正在生成服務進度報告...')
      // 實際實現中可以導出PDF或Excel報告
    },
    
    downloadFile(file) {
      ElMessage.success(`正在下載: ${file.name}`)
      // 實際實現中調用下載API
    }
  }
}
</script>

<style scoped>
.service-progress-detail {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.main-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-container {
  padding: 20px;
}

.loading-container {
  padding: 60px 0;
}

.info-section,
.timeline-section,
.documents-section {
  margin-bottom: 40px;
}

.info-section h3,
.timeline-section h3,
.documents-section h3 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 500;
}

.amount-text {
  color: #2C8976;
  font-weight: 500;
  font-size: 16px;
}

.timeline-content {
  padding-left: 10px;
}

.timeline-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.timeline-desc {
  color: #606266;
  font-size: 14px;
  margin-bottom: 3px;
}

.timeline-handler {
  color: #999;
  font-size: 12px;
}

.action-section {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

:deep(.el-descriptions__label) {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: normal;
  width: 140px;
}

:deep(.el-timeline-item__timestamp) {
  color: #909399;
  font-size: 13px;
}

:deep(.el-timeline-item__node) {
  left: -4px;
}

:deep(.el-tag) {
  border-radius: 4px;
}

:deep(.el-progress__text) {
  font-size: 12px !important;
}
</style>