<template>
  <div class="notice-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>手動供款账单详情 (E503-2-1)</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>
      
      <!-- 账单基本信息 -->
      <el-descriptions title="基本信息" :column="2" border>
        <el-descriptions-item label="账单编号">{{ noticeDetail.noticeNo }}</el-descriptions-item>
        <el-descriptions-item label="计划编号">{{ noticeDetail.planNo }}</el-descriptions-item>
        <el-descriptions-item label="计划名称">{{ noticeDetail.planName }}</el-descriptions-item>
        <el-descriptions-item label="供款期间">{{ noticeDetail.period }}</el-descriptions-item>
        <el-descriptions-item label="生成日期">{{ noticeDetail.generateDate }}</el-descriptions-item>
        <el-descriptions-item label="总供款金额">
          <span class="amount-text">MOP {{ noticeDetail.amount }}</span>
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
          查看手動供款账单PDF
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
              <p>确认此手動供款账单内容无误，完成供款流程</p>
              <el-button type="success" size="large" @click="confirmNotice">
                确认账单
              </el-button>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="action-card">
              <h4>重新提交清单</h4>
              <p>如发现金额或人员有误，可重新提交供款清单</p>
              <el-button type="warning" size="large" @click="resubmitList">
                重新提交清单
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 提交中状态的操作按钮区域 -->
      <div class="action-section" v-if="noticeDetail.status === '提交中'">
        <el-row :gutter="20">
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
      <div class="status-info" v-if="noticeDetail.status !== '待確認' && noticeDetail.status !== '提交中'">
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
      <p>确认此手動供款账单后，您可以进行供款支付。</p>
      <p><strong>计划编号：</strong>{{ noticeDetail.planNo }}</p>
      <p><strong>供款金额：</strong>MOP {{ noticeDetail.amount }}</p>
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
      title="手動供款账单"
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
  name: 'CentralFundManualBillDetail',
  components: {
    Document,
    Download
  },
  data() {
    return {
      noticeDetail: {
        noticeNo: 'CPF-MANUAL-2025030001',
        planNo: 'ER12345',
        planName: 'ER12345 集團統一央積金共同計劃',
        period: '2025年2月',
        generateDate: '2025-03-01',
        amount: '128,500.00',
        status: '待確認',
        remark: '手動供款账单',
        pdfFile: 'manual_bill_202502_ER12345.pdf'
      },
      confirmDialogVisible: false,
      pdfDialogVisible: false,
      pdfUrl: '/api/pdf/manual_bill_202502_ER12345.pdf', // 模拟PDF路径
      contributionListDialogVisible: false,
      contributionListUrl: '/api/contribution-list/manual_bill_202502_ER12345.pdf' // 模拟供款清单路径
    }
  },
  mounted() {
    this.loadNoticeDetail()
  },
  methods: {
    loadNoticeDetail() {
      // 从路由参数获取账单编号和查询参数
      const { id } = this.$route.params
      const { planNo, period } = this.$route.query
      console.log('加载手動供款账单详情:', { id, planNo, period })
      
      // 根据计划编号动态设置测试数据
      if (planNo === 'ER12345') {
        this.noticeDetail.planNo = 'ER12345'
        this.noticeDetail.planName = 'ER12345 集團統一央積金共同計劃'
        this.noticeDetail.status = '待確認'
      } else if (planNo === 'ER67890') {
        this.noticeDetail.planNo = 'ER67890'
        this.noticeDetail.planName = 'ER67890 企業專項央積金計劃'
        this.noticeDetail.status = '待確認'
      } else if (planNo === 'ER11111') {
        this.noticeDetail.planNo = 'ER11111'
        this.noticeDetail.planName = 'ER11111 子公司A央積金計劃'
        this.noticeDetail.status = '提交中'
      }
      
      if (period) {
        this.noticeDetail.period = period
      }
    },
    
    goBack() {
      this.$router.go(-1)
    },
    
    getStatusType(status) {
      const typeMap = {
        '待確認': 'warning',
        '提交中': 'info',
        '已確認': 'success'
      }
      return typeMap[status] || 'info'
    },
    
    confirmNotice() {
      this.confirmDialogVisible = true
    },
    
    doConfirm() {
      this.confirmDialogVisible = false
      this.noticeDetail.status = '已確認'
      this.$message.success('账单确认成功！您现在可以进行供款支付。')
      
      // 确认后返回列表页面
      setTimeout(() => {
        this.goBack()
      }, 1500)
    },
    
    resubmitList() {
      this.$confirm(
        '重新提交供款清单将跳转到清单提交页面，是否继续？',
        '重新提交清单',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 设置状态为提交中
        this.noticeDetail.status = '提交中'
        this.$message.success('已设置为提交中状态，正在跳转到清单提交页面...')
        
        // 跳转到提交供款清单页面
        setTimeout(() => {
          this.$router.push({
            path: '/central-fund/employer-contribution/submit-list',
            query: {
              planNo: this.noticeDetail.planNo,
              period: this.noticeDetail.period,
              resubmit: true
            }
          })
        }, 1000)
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
    
    viewPDF() {
      this.pdfDialogVisible = true
    },
    
    downloadPDF() {
      this.$message.success(`正在下载账单PDF: ${this.noticeDetail.pdfFile}`)
      // 实际下载逻辑
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
      this.$confirm(
        `确定要重新生成此账单吗？\n\n计划编号：${this.noticeDetail.planNo}\n供款期间：${this.noticeDetail.period}\n\n重新生成后，账单状态将变为待确认。`,
        '重新生成账单',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 重新生成账单，设置状态为待确认
        this.noticeDetail.status = '待確認'
        this.$message.success('账单已重新生成，状态已更新为待确认')
        
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
        '已確認': '此手動供款账单已确认，您可以进行供款支付。'
      }
      return messageMap[status] || '此手動供款账单处理完成。'
    },
    
    // 获取状态提示类型
    getStatusAlertType(status) {
      const typeMap = {
        '已確認': 'success'
      }
      return typeMap[status] || 'info'
    }
  }
}
</script>

<style scoped>
.notice-detail {
  padding: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-text {
  color: #E6A23C;
  font-weight: 600;
  font-size: 16px;
}

.detail-section {
  margin-top: 30px;
}

.detail-section h3 {
  margin-bottom: 16px;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.action-section {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #EBEEF5;
}

.action-card {
  text-align: center;
  transition: all 0.3s;
}

.action-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-card h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.action-card p {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
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

:deep(.el-descriptions__label) {
  width: 120px;
  font-weight: 600;
}

:deep(.el-descriptions__content) {
  word-break: break-all;
}

.status-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}
</style>