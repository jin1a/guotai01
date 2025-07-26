<template>
  <div class="notice-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>私退金手動供款账单详情 (E603-2-1)</span>
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
      
      <!-- PDF查看按钮 - 独立显示 -->
      <div style="margin-top: 20px; margin-bottom: 20px;">
        <el-button type="primary" @click="viewPDF">
          查看私退金手動供款账单PDF
        </el-button>
      </div>
      
      <!-- 供款明细 -->
      <div class="detail-section">
        <h3>供款明细</h3>
        <el-table :data="contributionDetails" style="width: 100%">
          <el-table-column prop="employeeName" label="雇员姓名" width="120" />
          <el-table-column prop="employeeNo" label="雇员编号" width="120" />
          <el-table-column prop="basicSalary" label="基本工资" width="120" />
          <el-table-column prop="contributionRate" label="供款比例" width="100" />
          <el-table-column prop="contributionAmount" label="供款金额" width="120" />
          <el-table-column prop="remarks" label="备注" />
        </el-table>
      </div>
      
      <!-- 操作按钮区域 -->
      <div class="action-section" v-if="noticeDetail.status === '待確認'">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="action-card">
              <h4>确认账单</h4>
              <p>确认此私退金手動供款账单内容无误，完成供款流程</p>
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
      
      <!-- 状态提示信息 -->
      <div class="status-info" v-if="noticeDetail.status !== '待確認'">
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
      <p>确认此私退金手動供款账单后，您可以进行供款支付。</p>
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
      title="私退金手動供款账单"
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
  </div>
</template>

<script>
import { Document, Download } from '@element-plus/icons-vue'

export default {
  name: 'PrivateFundManualBillDetail',
  components: {
    Document,
    Download
  },
  data() {
    return {
      noticeDetail: {
        noticeNo: 'ORSO-MANUAL-2025030001',
        planNo: 'PF12345',
        planName: 'PF12345 集團私人退休金計劃',
        period: '2025年2月',
        generateDate: '2025-03-01',
        amount: '144,000.00',
        status: '待確認',
        remark: '私退金手動供款账单',
        pdfFile: 'orso_manual_bill_202502_PF12345.pdf'
      },
      contributionDetails: [
        {
          employeeName: '陳大文',
          employeeNo: 'PF1234512345',
          basicSalary: '30,000.00',
          contributionRate: '7.5%',
          contributionAmount: '2,250.00',
          remarks: '正常供款'
        },
        {
          employeeName: '李小紅',
          employeeNo: 'PF1234512346',
          basicSalary: '26,000.00',
          contributionRate: '7.5%',
          contributionAmount: '1,950.00',
          remarks: '正常供款'
        },
        {
          employeeName: '王志強',
          employeeNo: 'PF1234512347',
          basicSalary: '35,000.00',
          contributionRate: '7.5%',
          contributionAmount: '2,625.00',
          remarks: '正常供款'
        }
      ],
      confirmDialogVisible: false,
      pdfDialogVisible: false,
      pdfUrl: ''
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
      console.log('加载私退金手動供款账单详情:', { id, planNo, period })
      
      // 根据计划编号动态设置测试数据
      if (planNo === 'PF12345') {
        this.noticeDetail.planNo = 'PF12345'
        this.noticeDetail.planName = 'PF12345 集團私人退休金計劃'
        this.noticeDetail.status = '待確認'
      } else if (planNo === 'PF67890') {
        this.noticeDetail.planNo = 'PF67890'
        this.noticeDetail.planName = 'PF67890 企業專項私退金計劃'
        this.noticeDetail.status = '調整中'
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
        '已確認': 'success',
        '已撤銷': 'info'
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
        // 跳转到提交供款清单页面
        this.$router.push({
          path: '/private-fund/employer-contribution/submit-list',
          query: {
            planNo: this.noticeDetail.planNo,
            period: this.noticeDetail.period,
            resubmit: true
          }
        })
      }).catch(() => {
        this.$message.info('已取消操作')
      })
    },
    
    viewPDF() {
      // 模拟PDF URL - 实际项目中这里会调用API获取PDF文件URL
      this.pdfUrl = `/pdfs/${this.noticeDetail.pdfFile}`
      this.pdfDialogVisible = true
    },
    
    downloadPDF() {
      this.$message.success(`正在下载账单PDF: ${this.noticeDetail.pdfFile}`)
      // 实际下载逻辑
    },
    
    // 获取状态提示信息
    getStatusMessage(status) {
      const messageMap = {
        '已確認': '此私退金手動供款账单已确认，您可以进行供款支付。',
        '調整中': '此私退金手動供款账单正在调整中，请等待调整完成。',
        '已調整': '此私退金手動供款账单已调整完成。'
      }
      return messageMap[status] || '此私退金手動供款账单处理完成。'
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
  text-align: center;
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