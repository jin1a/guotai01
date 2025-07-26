<template>
  <div class="electronic-notice">
    <!-- 面包屑导航 -->
    <el-breadcrumb :separator-icon="ArrowRight" class="breadcrumb-nav">
      <el-breadcrumb-item>供款管理</el-breadcrumb-item>
      <el-breadcrumb-item :class="{ active: true }">查看繳費通知書</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- Tab标签页 -->
    <el-tabs v-model="activeTab" class="notice-tabs">
      <el-tab-pane label="共同計劃信息" name="planInfo" />
      <el-tab-pane label="共同計劃繳費通知書" name="paymentNotice" />
      <el-tab-pane label="成員供款表" name="memberContribution" />
      <el-tab-pane label="變動報表" name="changeReport" />
      <el-tab-pane label="未取得利益明細表" name="unpaidBenefit" />
    </el-tabs>
    
    <el-card class="content-card">
      <!-- 共同计划信息标签页 -->
      <div v-if="activeTab === 'planInfo'" class="plan-info-content">
        <div class="download-section">
          <el-button type="success" :icon="Download" @click="downloadPlanInfo">
            下載表單
          </el-button>
        </div>
        
        <el-descriptions :column="3" border class="info-descriptions">
          <el-descriptions-item label="雇主名稱">AAAAA子公司</el-descriptions-item>
          <el-descriptions-item label="雇主編號">QYXX4382382324</el-descriptions-item>
          <el-descriptions-item label="共同計劃名稱">AAAAAAAA共同計劃</el-descriptions-item>
          <el-descriptions-item label="共同計劃編號">
            <span class="plan-number">GS-GTJHBH-00001</span>
            <el-tag type="success" size="small" class="status-tag">查看</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="產品類型">央積金</el-descriptions-item>
          <el-descriptions-item label="供款期">2024/11/25 - 2024/12/25</el-descriptions-item>
          <el-descriptions-item label="簽約方">AAAA子公司</el-descriptions-item>
          <el-descriptions-item label="付款方">AAAA子公司</el-descriptions-item>
          <el-descriptions-item></el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 共同计划缴费通知书标签页 -->
      <div v-if="activeTab === 'paymentNotice'" class="payment-notice-content">
        <!-- 搜索条件区域 -->
        <div class="filter-section">
          <el-form :inline="true" :model="filterForm" class="filter-form">
            <el-form-item label="通知書編號">
              <el-input v-model="filterForm.noticeNo" placeholder="請輸入通知書編號" clearable />
            </el-form-item>
            <el-form-item label="通知書類型">
              <el-select v-model="filterForm.noticeType" placeholder="請選擇" clearable>
                <el-option label="全部" value="" />
                <el-option label="供款通知書" value="contribution" />
                <el-option label="調整通知書" value="adjustment" />
                <el-option label="終止通知書" value="termination" />
              </el-select>
            </el-form-item>
            <el-form-item label="生成日期">
              <el-date-picker
                v-model="filterForm.dateRange"
                type="daterange"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
                range-separator="至"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
                clearable
              />
            </el-form-item>
            <el-form-item label="狀態">
              <el-select v-model="filterForm.status" placeholder="請選擇" clearable>
                <el-option label="全部" value="" />
                <el-option label="待確認" value="pending" />
                <el-option label="已確認" value="confirmed" />
                <el-option label="已發送" value="sent" />
                <el-option label="已過期" value="expired" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查詢</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 数据表格 -->
        <el-table 
          :data="noticeList" 
          style="width: 100%"
          v-loading="loading"
          border
        >
          <el-table-column type="selection" width="55" />
          <el-table-column prop="noticeNo" label="通知書編號" min-width="180" />
          <el-table-column prop="noticeType" label="通知書類型" width="120">
            <template #default="scope">
              <el-tag :type="getNoticeTypeTag(scope.row.noticeType)" size="small">
                {{ getNoticeTypeText(scope.row.noticeType) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="contributionPeriod" label="供款期間" width="200" />
          <el-table-column prop="totalAmount" label="總金額" width="120" align="right">
            <template #default="scope">
              ¥{{ formatAmount(scope.row.totalAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="createDate" label="生成日期" width="120" />
          <el-table-column prop="status" label="狀態" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)" size="small">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button link type="primary" size="small" @click="viewNotice(scope.row)">
                查看
              </el-button>
              <el-button link type="success" size="small" @click="downloadNotice(scope.row)">
                下載
              </el-button>
              <el-button link type="primary" size="small" @click="confirmNotice(scope.row)" 
                v-if="scope.row.status === 'pending'">
                確認
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <span class="total-info">總共 {{ total }} 筆</span>
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 成员供款表标签页 -->
      <div v-if="activeTab === 'memberContribution'" class="member-contribution-content">
        <div class="download-section">
          <el-button type="success" :icon="Download" @click="downloadMemberTable">
            下載成員供款表
          </el-button>
        </div>
        
        <el-table :data="memberList" style="width: 100%" border>
          <el-table-column type="index" label="序號" width="60" align="center" />
          <el-table-column prop="memberName" label="成員姓名" min-width="100" />
          <el-table-column prop="idNo" label="身份證號" min-width="120" />
          <el-table-column prop="baseSalary" label="薪資基數" width="120" align="right">
            <template #default="scope">
              ¥{{ formatAmount(scope.row.baseSalary) }}
            </template>
          </el-table-column>
          <el-table-column prop="employerContribution" label="雇主供款" width="120" align="right">
            <template #default="scope">
              ¥{{ formatAmount(scope.row.employerContribution) }}
            </template>
          </el-table-column>
          <el-table-column prop="employeeContribution" label="僱員供款" width="120" align="right">
            <template #default="scope">
              ¥{{ formatAmount(scope.row.employeeContribution) }}
            </template>
          </el-table-column>
          <el-table-column prop="totalContribution" label="總供款" width="120" align="right">
            <template #default="scope">
              <span class="total-amount">¥{{ formatAmount(scope.row.totalContribution) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="狀態" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getMemberStatusType(scope.row.status)" size="small">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 变动报表标签页 -->
      <div v-if="activeTab === 'changeReport'" class="change-report-content">
        <div class="report-summary">
          <el-alert 
            title="本期變動摘要" 
            type="info" 
            :closable="false"
            show-icon
          >
            <template #default>
              <div class="summary-content">
                <span>新增成員：<strong>3</strong> 人</span>
                <el-divider direction="vertical" />
                <span>調整薪資：<strong>5</strong> 人</span>
                <el-divider direction="vertical" />
                <span>終止供款：<strong>2</strong> 人</span>
                <el-divider direction="vertical" />
                <span>淨變動金額：<strong class="amount-increase">+¥25,680.00</strong></span>
              </div>
            </template>
          </el-alert>
        </div>

        <el-table :data="changeList" style="width: 100%" border class="change-table">
          <el-table-column prop="changeType" label="變動類型" width="120">
            <template #default="scope">
              <el-tag :type="getChangeTypeTag(scope.row.changeType)" size="small">
                {{ scope.row.changeType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="memberName" label="成員姓名" min-width="100" />
          <el-table-column prop="changeDate" label="變動日期" width="120" />
          <el-table-column prop="changeDetail" label="變動詳情" min-width="200" />
          <el-table-column prop="amountChange" label="金額變動" width="150" align="right">
            <template #default="scope">
              <span :class="scope.row.amountChange > 0 ? 'amount-increase' : 'amount-decrease'">
                {{ scope.row.amountChange > 0 ? '+' : '' }}¥{{ formatAmount(Math.abs(scope.row.amountChange)) }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 未取得利益明细表标签页 -->
      <div v-if="activeTab === 'unpaidBenefit'" class="unpaid-benefit-content">
        <div class="filter-section">
          <el-form :inline="true" class="filter-form">
            <el-form-item label="截止日期">
              <el-date-picker
                v-model="unpaidFilterDate"
                type="date"
                format="YYYY/MM/DD"
                value-format="YYYY-MM-DD"
                placeholder="選擇日期"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="queryUnpaidBenefit">查詢</el-button>
              <el-button type="success" :icon="Download" @click="exportUnpaidBenefit">
                導出Excel
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="unpaidList" style="width: 100%" border show-summary>
          <el-table-column prop="memberName" label="成員姓名" min-width="100" />
          <el-table-column prop="terminationDate" label="終止日期" width="120" />
          <el-table-column prop="unpaidMonths" label="未領取月數" width="100" align="center" />
          <el-table-column prop="unpaidAmount" label="未領取金額" width="150" align="right">
            <template #default="scope">
              ¥{{ formatAmount(scope.row.unpaidAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="未領取原因" min-width="150" />
          <el-table-column prop="contactInfo" label="聯繫方式" width="150" />
        </el-table>
      </div>
    </el-card>

    <!-- 查看通知书详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="通知書詳情"
      width="900px"
      class="notice-detail-dialog"
    >
      <div v-if="selectedNotice" class="notice-detail-content">
        <div class="notice-header">
          <h3>{{ selectedNotice.title }}</h3>
          <el-tag :type="getStatusType(selectedNotice.status)">
            {{ getStatusText(selectedNotice.status) }}
          </el-tag>
        </div>
        
        <el-descriptions :column="2" border class="notice-info">
          <el-descriptions-item label="通知書編號">{{ selectedNotice.noticeNo }}</el-descriptions-item>
          <el-descriptions-item label="通知書類型">{{ getNoticeTypeText(selectedNotice.noticeType) }}</el-descriptions-item>
          <el-descriptions-item label="供款期間">{{ selectedNotice.contributionPeriod }}</el-descriptions-item>
          <el-descriptions-item label="生成日期">{{ selectedNotice.createDate }}</el-descriptions-item>
        </el-descriptions>

        <div class="notice-content">
          <h4>供款明細</h4>
          <el-table :data="selectedNotice.details" border>
            <el-table-column prop="item" label="項目" />
            <el-table-column prop="amount" label="金額" align="right">
              <template #default="scope">
                ¥{{ formatAmount(scope.row.amount) }}
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="notice-footer">
          <p class="footer-note">* 請於供款期限前完成繳費，逾期將產生滯納金。</p>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">關閉</el-button>
          <el-button type="success" @click="downloadNoticeDetail">下載PDF</el-button>
          <el-button type="primary" @click="confirmNoticeDetail" v-if="selectedNotice?.status === 'pending'">
            確認通知書
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ArrowRight, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'ElectronicNotice',
  setup() {
    return {
      ArrowRight,
      Download
    }
  },
  data() {
    return {
      loading: false,
      activeTab: 'planInfo',
      // 筛选表单
      filterForm: {
        noticeNo: '',
        noticeType: '',
        dateRange: [],
        status: ''
      },
      // 通知书列表
      noticeList: [],
      // 分页
      currentPage: 1,
      pageSize: 10,
      total: 0,
      // 详情弹窗
      detailDialogVisible: false,
      selectedNotice: null,
      // 成员供款表
      memberList: [],
      // 变动报表
      changeList: [],
      // 未取得利益
      unpaidList: [],
      unpaidFilterDate: ''
    }
  },
  mounted() {
    this.loadNoticeData()
    this.loadMemberData()
    this.loadChangeData()
    this.loadUnpaidData()
  },
  methods: {
    // 加载通知书数据
    async loadNoticeData() {
      this.loading = true
      try {
        await new Promise(resolve => setTimeout(resolve, 800))
        
        const mockData = [
          {
            noticeNo: 'CPF-NOTICE-2025030001',
            noticeType: 'contribution',
            title: '2025年3月份央積金供款通知書',
            contributionPeriod: '2025/02/25 - 2025/03/25',
            totalAmount: 256750.00,
            createDate: '2025-03-01',
            status: 'pending',
            details: [
              { item: '雇主供款', amount: 128375.00 },
              { item: '僱員供款', amount: 128375.00 }
            ]
          },
          {
            noticeNo: 'CPF-NOTICE-2025020001',
            noticeType: 'contribution',
            title: '2025年2月份央積金供款通知書',
            contributionPeriod: '2025/01/25 - 2025/02/25',
            totalAmount: 245680.00,
            createDate: '2025-02-01',
            status: 'confirmed',
            details: [
              { item: '雇主供款', amount: 122840.00 },
              { item: '僱員供款', amount: 122840.00 }
            ]
          },
          {
            noticeNo: 'ADJ-NOTICE-2025010001',
            noticeType: 'adjustment',
            title: '薪資調整補繳通知書',
            contributionPeriod: '2025/01/01 - 2025/01/31',
            totalAmount: 15680.00,
            createDate: '2025-01-15',
            status: 'sent',
            details: [
              { item: '調整補繳額', amount: 15680.00 }
            ]
          },
          {
            noticeNo: 'TER-NOTICE-2024120001',
            noticeType: 'termination',
            title: '僱員終止供款通知書',
            contributionPeriod: '2024/12/01 - 2024/12/31',
            totalAmount: -8400.00,
            createDate: '2024-12-10',
            status: 'confirmed',
            details: [
              { item: '退還供款', amount: -8400.00 }
            ]
          }
        ]
        
        // 应用筛选
        let filteredData = [...mockData]
        
        if (this.filterForm.noticeNo) {
          filteredData = filteredData.filter(item => 
            item.noticeNo.includes(this.filterForm.noticeNo)
          )
        }
        
        if (this.filterForm.noticeType) {
          filteredData = filteredData.filter(item => 
            item.noticeType === this.filterForm.noticeType
          )
        }
        
        if (this.filterForm.status) {
          filteredData = filteredData.filter(item => 
            item.status === this.filterForm.status
          )
        }
        
        this.total = filteredData.length
        this.noticeList = filteredData.slice(
          (this.currentPage - 1) * this.pageSize,
          this.currentPage * this.pageSize
        )
        
      } catch (error) {
        ElMessage.error('加載數據失敗')
      } finally {
        this.loading = false
      }
    },
    
    // 加载成员数据
    loadMemberData() {
      this.memberList = [
        {
          memberName: '張三',
          idNo: 'M1234****',
          baseSalary: 20000,
          employerContribution: 1000,
          employeeContribution: 1000,
          totalContribution: 2000,
          status: '正常'
        },
        {
          memberName: '李四',
          idNo: 'M5678****',
          baseSalary: 25000,
          employerContribution: 1250,
          employeeContribution: 1250,
          totalContribution: 2500,
          status: '正常'
        },
        {
          memberName: '王五',
          idNo: 'M9012****',
          baseSalary: 30000,
          employerContribution: 1500,
          employeeContribution: 1500,
          totalContribution: 3000,
          status: '新增'
        },
        {
          memberName: '趙六',
          idNo: 'M3456****',
          baseSalary: 22000,
          employerContribution: 1100,
          employeeContribution: 1100,
          totalContribution: 2200,
          status: '調整'
        },
        {
          memberName: '陳七',
          idNo: 'M7890****',
          baseSalary: 28000,
          employerContribution: 1400,
          employeeContribution: 1400,
          totalContribution: 2800,
          status: '終止'
        }
      ]
    },
    
    // 加载变动数据
    loadChangeData() {
      this.changeList = [
        {
          changeType: '新增成員',
          memberName: '王五',
          changeDate: '2025-03-01',
          changeDetail: '新員工入職，開始參與央積金計劃',
          amountChange: 3000
        },
        {
          changeType: '薪資調整',
          memberName: '趙六',
          changeDate: '2025-03-05',
          changeDetail: '月薪從20,000調整至22,000',
          amountChange: 200
        },
        {
          changeType: '終止供款',
          memberName: '陳七',
          changeDate: '2025-03-10',
          changeDetail: '員工離職，終止供款計劃',
          amountChange: -2800
        }
      ]
    },
    
    // 加载未取得利益数据
    loadUnpaidData() {
      this.unpaidList = [
        {
          memberName: '周八',
          terminationDate: '2024-06-30',
          unpaidMonths: 8,
          unpaidAmount: 16000,
          reason: '未辦理領取手續',
          contactInfo: '853-12345678'
        },
        {
          memberName: '吳九',
          terminationDate: '2024-09-30',
          unpaidMonths: 5,
          unpaidAmount: 12500,
          reason: '聯繫方式失效',
          contactInfo: '無法聯繫'
        }
      ]
    },
    
    // 获取通知类型标签
    getNoticeTypeTag(type) {
      const typeMap = {
        'contribution': 'primary',
        'adjustment': 'warning',
        'termination': 'danger'
      }
      return typeMap[type] || 'info'
    },
    
    // 获取通知类型文本
    getNoticeTypeText(type) {
      const textMap = {
        'contribution': '供款通知書',
        'adjustment': '調整通知書',
        'termination': '終止通知書'
      }
      return textMap[type] || type
    },
    
    // 获取状态类型
    getStatusType(status) {
      const typeMap = {
        'pending': 'warning',
        'confirmed': 'success',
        'sent': 'info',
        'expired': 'danger'
      }
      return typeMap[status] || 'info'
    },
    
    // 获取状态文本
    getStatusText(status) {
      const textMap = {
        'pending': '待確認',
        'confirmed': '已確認',
        'sent': '已發送',
        'expired': '已過期'
      }
      return textMap[status] || status
    },
    
    // 获取成员状态类型
    getMemberStatusType(status) {
      const typeMap = {
        '正常': 'success',
        '新增': 'primary',
        '調整': 'warning',
        '終止': 'danger'
      }
      return typeMap[status] || 'info'
    },
    
    // 获取变动类型标签
    getChangeTypeTag(type) {
      const typeMap = {
        '新增成員': 'success',
        '薪資調整': 'warning',
        '終止供款': 'danger'
      }
      return typeMap[type] || 'info'
    },
    
    // 格式化金额
    formatAmount(amount) {
      return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    
    // 查询
    handleSearch() {
      this.currentPage = 1
      this.loadNoticeData()
    },
    
    // 重置
    resetForm() {
      this.filterForm = {
        noticeNo: '',
        noticeType: '',
        dateRange: [],
        status: ''
      }
      this.handleSearch()
    },
    
    // 查看通知书
    viewNotice(row) {
      this.selectedNotice = row
      this.detailDialogVisible = true
    },
    
    // 下载通知书
    downloadNotice(row) {
      ElMessage.success(`正在下載：${row.title}`)
    },
    
    // 确认通知书
    async confirmNotice(row) {
      try {
        await ElMessageBox.confirm(
          '確認後將無法修改，是否確認此通知書？',
          '確認提示',
          {
            confirmButtonText: '確認',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        row.status = 'confirmed'
        ElMessage.success('通知書已確認')
        this.loadNoticeData()
        
      } catch {
        ElMessage.info('已取消確認')
      }
    },
    
    // 下载计划信息
    downloadPlanInfo() {
      ElMessage.success('正在下載共同計劃信息表單...')
    },
    
    // 下载成员供款表
    downloadMemberTable() {
      ElMessage.success('正在下載成員供款表...')
    },
    
    // 查询未取得利益
    queryUnpaidBenefit() {
      ElMessage.info('正在查詢未取得利益明細...')
      this.loadUnpaidData()
    },
    
    // 导出未取得利益
    exportUnpaidBenefit() {
      ElMessage.success('正在導出Excel文件...')
    },
    
    // 下载通知书详情
    downloadNoticeDetail() {
      ElMessage.success('正在生成PDF文件...')
    },
    
    // 确认通知书详情
    confirmNoticeDetail() {
      this.selectedNotice.status = 'confirmed'
      this.detailDialogVisible = false
      ElMessage.success('通知書已確認')
      this.loadNoticeData()
    },
    
    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val
      this.loadNoticeData()
    },
    
    // 当前页改变
    handleCurrentChange(val) {
      this.currentPage = val
      this.loadNoticeData()
    }
  }
}
</script>

<style scoped>
.electronic-notice {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.breadcrumb-nav {
  margin-bottom: 20px;
}

.breadcrumb-nav :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #2C8976;
  font-weight: 500;
}

.notice-tabs {
  margin-bottom: 20px;
}

.notice-tabs :deep(.el-tabs__item) {
  font-size: 14px;
}

.notice-tabs :deep(.el-tabs__item.is-active) {
  color: #2C8976;
}

.notice-tabs :deep(.el-tabs__active-bar) {
  background-color: #2C8976;
}

.content-card {
  border-radius: 8px;
}

/* 计划信息 */
.plan-info-content {
  padding: 20px;
}

.download-section {
  margin-bottom: 20px;
  text-align: right;
}

.info-descriptions {
  font-size: 14px;
}

.info-descriptions :deep(.el-descriptions__label) {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: normal;
}

.plan-number {
  color: #2C8976;
  font-weight: 500;
  margin-right: 10px;
}

.status-tag {
  vertical-align: middle;
}

/* 缴费通知书 */
.payment-notice-content {
  padding: 20px;
}

.filter-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filter-form {
  margin-bottom: -18px;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.filter-form :deep(.el-input) {
  width: 200px;
}

.filter-form :deep(.el-select) {
  width: 180px;
}

.filter-form :deep(.el-date-editor) {
  width: 280px;
}

.pagination-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
}

.total-info {
  color: #666;
  font-size: 14px;
}

/* 成员供款表 */
.member-contribution-content {
  padding: 20px;
}

.total-amount {
  font-weight: 500;
  color: #2C8976;
}

/* 变动报表 */
.change-report-content {
  padding: 20px;
}

.report-summary {
  margin-bottom: 20px;
}

.summary-content {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 10px;
}

.summary-content strong {
  color: #303133;
  font-size: 16px;
}

.amount-increase {
  color: #67C23A;
}

.amount-decrease {
  color: #F56C6C;
}

.change-table {
  margin-top: 20px;
}

/* 未取得利益 */
.unpaid-benefit-content {
  padding: 20px;
}

/* 详情弹窗 */
.notice-detail-dialog :deep(.el-dialog__body) {
  padding: 20px 30px;
}

.notice-detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.notice-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

.notice-info {
  margin-bottom: 30px;
}

.notice-content {
  margin-top: 30px;
}

.notice-content h4 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.notice-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.footer-note {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f8f9fa;
  color: #606266;
  font-weight: 500;
}

:deep(.el-tag) {
  border-radius: 4px;
  padding: 0 12px;
  height: 24px;
  line-height: 22px;
}

:deep(.el-alert) {
  border-radius: 8px;
}

:deep(.el-divider--vertical) {
  height: 20px;
  margin: 0;
}
</style>