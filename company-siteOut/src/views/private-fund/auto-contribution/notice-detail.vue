<template>
  <div class="notice-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>缴费通知书详情 (E603-1-1)</span>
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
        <el-descriptions-item label="缴费通知书">
          <el-button type="primary" text @click="viewPDF">
            查看缴费通知书PDF
          </el-button>
        </el-descriptions-item>
      </el-descriptions>
      
      <!-- PDF查看按钮 - 独立显示 -->
      <div style="margin-top: 20px; margin-bottom: 20px;">
        <el-button type="primary" @click="viewPDF">
          查看缴费通知书PDF
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
      <div class="action-section">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="action-card">
              <h4>确认通知书</h4>
              <p>确认此通知书内容无误，继续后续供款流程</p>
              <el-button type="success" size="large" @click="confirmNotice">
                确认通知书
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
    </el-card>
    
    <!-- 确认对话框 -->
    <el-dialog
      v-model="confirmDialogVisible"
      title="确认通知书"
      width="500px"
    >
      <p>确认此缴费通知书后，将自动进入供款凭证提交流程。</p>
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
  </div>
</template>

<script>
import { Document, Download } from '@element-plus/icons-vue'

export default {
  name: 'PrivateFundNoticeDetail',
  components: {
    Document,
    Download
  },
  data() {
    return {
      noticeDetail: {
        noticeNo: 'PN2024001',  // 保留原字段用于显示兼容
        planNo: 'PF-PLAN-001',
        planName: '私退金计划A',
        period: '2024年3月',
        generateDate: '2024-03-05',
        amount: '125,000.00',
        dueDate: '2024-03-25',
        status: '待确认',
        remark: '正常供款通知书',
        pdfFile: 'notice_202403_PF-PLAN-001.pdf'
      },
      contributionDetails: [
        {
          employeeName: '张三',
          employeeNo: 'EMP001',
          basicSalary: '25,000.00',
          contributionRate: '10%',
          contributionAmount: '2,500.00',
          remarks: '正常供款'
        },
        {
          employeeName: '李四',
          employeeNo: 'EMP002',
          basicSalary: '30,000.00',
          contributionRate: '10%',
          contributionAmount: '3,000.00',
          remarks: '正常供款'
        },
        {
          employeeName: '王五',
          employeeNo: 'EMP003',
          basicSalary: '28,000.00',
          contributionRate: '10%',
          contributionAmount: '2,800.00',
          remarks: '正常供款'
        }
      ],
      confirmDialogVisible: false,
      pdfDialogVisible: false,
      pdfUrl: '/api/pdf/notice_202403_PF-PLAN-001.pdf' // 模拟PDF路径
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
      
      // 根据计划编号和期间加载数据
      if (planNo) {
        this.noticeDetail.planNo = planNo
      }
      if (period) {
        this.noticeDetail.period = period
      }
    },
    getStatusType(status) {
      const statusMap = {
        '待确认': 'warning',
        '已确认': 'success',
        '已调整': 'info'
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
    // 点确认→E603-2 (提交供款凭证)
    confirmNotice() {
      this.confirmDialogVisible = true
    },
    doConfirm() {
      this.confirmDialogVisible = false
      this.$message.success('通知书已确认')
      // 跳转到 E603-2 提交供款凭证页面
      this.$router.push('/private-fund/auto-contribution/submit-voucher')
    },
    // 点调整→E605 (供款调整)
    requestAdjustment() {
      this.$message.info('跳转到供款调整页面')
      // 跳转到 E605 供款调整页面，带上计划信息
      this.$router.push({
        path: '/private-fund/contribution-adjustment',
        query: {
          planNo: this.noticeDetail.planNo,
          planName: this.noticeDetail.planName,
          period: this.noticeDetail.period,
          amount: this.noticeDetail.amount
        }
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

:deep(.el-dialog__body) {
  padding: 20px;
}
</style>