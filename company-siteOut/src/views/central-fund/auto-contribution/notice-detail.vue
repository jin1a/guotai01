<template>
  <div class="notice-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>缴费通知书详情 (E503-1-1)</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>
      
      <!-- 通知书基本信息 -->
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="通知书编号">{{ noticeDetail.noticeNo }}</el-descriptions-item>
        <el-descriptions-item label="计划编号">{{ noticeDetail.planNo }}</el-descriptions-item>
        <el-descriptions-item label="计划名称">{{ noticeDetail.planName }}</el-descriptions-item>
        <el-descriptions-item label="缴费期间">{{ noticeDetail.period }}</el-descriptions-item>
        <el-descriptions-item label="生成日期">{{ noticeDetail.generateDate }}</el-descriptions-item>
        <el-descriptions-item label="应缴金额">
          <span class="amount-text">MOP {{ noticeDetail.amount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="截止日期">
          <el-tag :type="getDueDateType(noticeDetail.dueDate)">
            {{ noticeDetail.dueDate }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="getStatusType(noticeDetail.status)">
            {{ noticeDetail.status }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="备注">
          {{ noticeDetail.remark || '无' }}
        </el-descriptions-item>
      </el-descriptions>
      
      <!-- 查看按钮区域 -->
      <div style="margin-top: 20px; margin-bottom: 20px;">
        <el-button type="primary" @click="viewPDF">
          查看缴费通知书PDF
        </el-button>
        <el-button type="success" @click="viewContributionList" style="margin-left: 12px;">
          查看供款清单
        </el-button>
      </div>
      
      <!-- 待确认状态的操作按钮区域 -->
      <div class="action-section" v-if="noticeDetail.status === '待確認'">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="action-card">
              <h4>确认账单</h4>
              <p>确认此通知书内容无误，继续后续供款流程</p>
              <el-button type="success" size="large" @click="confirmNotice">
                确认账单
              </el-button>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="action-card">
              <h4>申请调整</h4>
              <p>如发现金额或人员有误，可申请调整</p>
              <el-button type="warning" size="large" @click="requestAdjustment">
                申请调整
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 调整中状态的操作按钮区域 -->
      <div class="action-section" v-if="noticeDetail.status === '調整中'">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="action-card">
              <h4>确认账单</h4>
              <p>调整完成后，确认此通知书继续供款流程</p>
              <el-button type="success" size="large" @click="confirmNotice">
                确认账单
              </el-button>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="action-card">
              <h4>重新生成账单</h4>
              <p>重新生成账单，状态将变为待确认</p>
              <el-button type="primary" size="large" @click="regenerateBill">
                重新生成账单
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <!-- 状态提示信息 -->
      <div class="status-info" v-if="noticeDetail.status !== '待確認' && noticeDetail.status !== '調整中'">
        <el-alert
          :title="getStatusMessage(noticeDetail.status)"
          :type="getStatusAlertType(noticeDetail.status)"
          show-icon
          :closable="false"
        />
      </div>
    </el-card>
    
    <!-- 确认对话框 -->
    <el-dialog
      v-model="confirmDialogVisible"
      title="确认账单"
      width="500px"
    >
      <p>确认此缴费账单后，您可以进行供款支付。</p>
      <p><strong>计划编号：</strong>{{ noticeDetail.planNo }}</p>
      <p><strong>应缴金额：</strong>MOP {{ noticeDetail.amount }}</p>
      <p>是否确认？</p>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="confirmDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="doConfirm">确认</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- PDF查看弹窗 -->
    <el-dialog
      v-model="pdfDialogVisible"
      title="缴费通知书"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="pdf-viewer">
        <iframe 
          :src="pdfUrl" 
          width="100%" 
          height="600px"
          frameborder="0"
        ></iframe>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="pdfDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadPDF">
            <el-icon><Download /></el-icon>
            下载PDF
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 供款清单弹窗 -->
    <el-dialog
      v-model="contributionListDialogVisible"
      title="供款清单"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="contribution-list-viewer">
        <iframe 
          :src="contributionListUrl" 
          width="100%" 
          height="600px"
          frameborder="0"
        ></iframe>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="contributionListDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="downloadContributionList">
            <el-icon><Download /></el-icon>
            下载清单
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { Document, Download } from '@element-plus/icons-vue'

export default {
  name: 'CentralFundNoticeDetail',
  components: {
    Document,
    Download
  },
  data() {
    return {
      noticeDetail: {
        noticeNo: 'CPF-NOTICE-2025030001',
        planNo: 'ER12345',
        planName: 'ER12345 集團統一央積金共同計劃',
        period: '2025年3月',
        generateDate: '2025-03-01',
        amount: '128,500.00',
        dueDate: '2025-03-15',
        status: '待確認',
        remark: '正常供款通知書',
        pdfFile: 'notice_202503_ER12345.pdf'
      },
      contributionDetails: [
        {
          employeeName: '陳大文',
          employeeNo: 'ER1234512345',
          basicSalary: '25,000.00',
          contributionRate: '5%',
          contributionAmount: '1,250.00',
          remarks: '正常供款'
        },
        {
          employeeName: '李小紅',
          employeeNo: 'ER1234512346',
          basicSalary: '22,000.00',
          contributionRate: '5%',
          contributionAmount: '1,100.00',
          remarks: '正常供款'
        },
        {
          employeeName: '王志強',
          employeeNo: 'ER1234512347',
          basicSalary: '28,000.00',
          contributionRate: '5%',
          contributionAmount: '1,400.00',
          remarks: '正常供款'
        },
        {
          employeeName: '張美麗',
          employeeNo: 'ER1234512348',
          basicSalary: '24,000.00',
          contributionRate: '5%',
          contributionAmount: '1,200.00',
          remarks: '正常供款'
        },
        {
          employeeName: '劉建華',
          employeeNo: 'ER1234512349',
          basicSalary: '32,000.00',
          contributionRate: '5%',
          contributionAmount: '1,600.00',
          remarks: '正常供款'
        },
        {
          employeeName: '黃大偉',
          employeeNo: 'ER1234512350',
          basicSalary: '26,000.00',
          contributionRate: '5%',
          contributionAmount: '1,300.00',
          remarks: '正常供款'
        },
        {
          employeeName: '林雅婷',
          employeeNo: 'ER1234512351',
          basicSalary: '23,000.00',
          contributionRate: '5%',
          contributionAmount: '1,150.00',
          remarks: '正常供款'
        }
      ],
      confirmDialogVisible: false,
      pdfDialogVisible: false,
      pdfUrl: '/api/pdf/notice_202503_ER12345.pdf', // 模拟PDF路径
      contributionListDialogVisible: false,
      contributionListUrl: '/api/contribution-list/notice_202503_ER12345.pdf' // 模拟供款清单路径
    }
  },
  mounted() {
    this.loadNoticeDetail()
  },
  methods: {
    loadNoticeDetail() {
      // 根据路由参数加载通知书详情
      const { id } = this.$route.params
      const { planNo, period } = this.$route.query
      console.log('加载通知书详情:', { id, planNo, period })
      
      // 根据计划编号和期间加载数据，统一映射到标准计划编号
      if (planNo) {
        // 将旧的计划编号映射到新的标准编号
        if (planNo.includes('CPF-PLAN-001') || planNo === 'ER12345') {
          this.noticeDetail.planNo = 'ER12345'
          this.noticeDetail.planName = 'ER12345 集團統一央積金共同計劃'
          this.noticeDetail.status = '待確認'
        } else if (planNo.includes('CPF-PLAN-002') || planNo === 'ER67890') {
          this.noticeDetail.planNo = 'ER67890'
          this.noticeDetail.planName = 'ER67890 企業專項央積金計劃'
          this.noticeDetail.status = '調整中'
        } else {
          // 默认使用ER12345
          this.noticeDetail.planNo = 'ER12345'
          this.noticeDetail.planName = 'ER12345 集團統一央積金共同計劃'
          this.noticeDetail.status = '待確認'
        }
      }
      if (period) {
        this.noticeDetail.period = decodeURIComponent(period)
      }
    },
    getStatusType(status) {
      const statusMap = {
        '待確認': 'warning',
        '已確認': 'success',
        '已調整': 'info'
      }
      return statusMap[status] || 'info'
    },
    getDueDateType(dueDate) {
      const today = new Date()
      const due = new Date(dueDate)
      const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'danger'
      if (diffDays <= 7) return 'warning'
      return 'success'
    },
    goBack() {
      this.$router.go(-1)
    },
    // 点确认→E503-2 (提交供款凭证)
    confirmNotice() {
      this.confirmDialogVisible = true
    },
    doConfirm() {
      this.confirmDialogVisible = false
      this.noticeDetail.status = '已確認'
      this.$message.success('账单已确认！您现在可以进行供款支付。')
      
      // 确认后返回列表页面
      setTimeout(() => {
        this.goBack()
      }, 1500)
    },
    // 点调整→E505 (供款调整)
    requestAdjustment() {
      this.$confirm('確定要申請調整此繳費通知書嗎？', '申請調整', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 设置状态为调整中
        this.noticeDetail.status = '調整中'
        this.$message.success('調整申請已提交，通知書狀態已更新為調整中')
        // 这里可以调用API更新后端状态
        console.log('调整申请已提交:', this.noticeDetail.noticeNo)
        
        // 1.5秒后返回列表页面
        setTimeout(() => {
          this.goBack()
        }, 1500)
      }).catch(() => {
        this.$message.info('已取消調整申請')
      })
    },
    // 查看PDF
    viewPDF() {
      this.pdfDialogVisible = true
    },
    // 下载PDF
    downloadPDF() {
      this.$message.success('正在下载缴费通知书PDF...')
      // 实际应用中调用下载API
      // window.open(this.pdfUrl, '_blank')
    },
    // 查看供款清单
    viewContributionList() {
      this.contributionListDialogVisible = true
    },
    // 下载供款清单
    downloadContributionList() {
      this.$message.success('正在下载供款清单...')
      // 实际应用中调用下载API
      // window.open(this.contributionListUrl, '_blank')
    },
    // 重新生成账单
    regenerateBill() {
      this.$confirm('確定要重新生成此繳費通知書嗎？', '重新生成账单', {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 重新生成账单，设置状态为待确认
        this.noticeDetail.status = '待確認'
        this.$message.success('繳費通知書已重新生成，狀態已更新為待確認')
        // 这里可以调用API重新生成账单
        console.log('重新生成账单:', this.noticeDetail.noticeNo)
        
        // 1.5秒后返回列表页面
        setTimeout(() => {
          this.goBack()
        }, 1500)
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
    // 获取状态提示信息
    getStatusMessage(status) {
      const messageMap = {
        '已確認': '此缴费账单已确认，您可以进行供款支付。',
        '調整中': '此缴费通知书正在调整中，请等待调整完成。',
        '已調整': '此缴费通知书已调整完成。'
      }
      return messageMap[status] || '此缴费通知书处理完成。'
    },
    // 获取状态提示类型
    getStatusAlertType(status) {
      const typeMap = {
        '已確認': 'success',
        '調整中': 'warning',
        '已調整': 'info'
      }
      return typeMap[status] || 'info'
    }
  }
}
</script>

<style scoped>
.notice-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-text {
  font-size: 18px;
  font-weight: bold;
  color: #e6a23c;
}

.detail-section {
  margin-top: 30px;
}

.detail-section h3 {
  margin-bottom: 16px;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.action-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.action-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.action-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-card h4 {
  margin-bottom: 12px;
  color: #303133;
}

.action-card p {
  margin-bottom: 16px;
  color: #606266;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.pdf-viewer {
  width: 100%;
  height: 600px;
  background-color: #f5f5f5;
}

.contribution-list-viewer {
  width: 100%;
  height: 600px;
  background-color: #f5f5f5;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

.status-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>