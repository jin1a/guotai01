<template>
  <div class="upload-voucher">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>央积金提交供款凭证 (E503-2)</span>
        </div>
      </template>
      
      <!-- 查询条件 -->
      <el-form :model="queryForm" :inline="true" class="query-form">
        <el-form-item label="計劃編號">
          <el-select v-model="queryForm.planName" placeholder="請選擇計劃" clearable>
            <el-option label="全部計劃" value="" />
            <el-option label="ER12345" value="ER12345" />
            <el-option label="ER67890" value="ER67890" />
          </el-select>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
            <el-option label="全部状态" value="" />
            <el-option label="待上传" value="pending" />
            <el-option label="已上传" value="uploaded" />
            <el-option label="审核中" value="reviewing" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="queryVouchers">搜尋</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 单计划列表页模式 -->
      <div v-if="!isMultiplePlans">
        <el-table :data="voucherList" style="width: 100%">
          <el-table-column prop="planNo" label="計劃編號" width="150" />
          <el-table-column prop="planName" label="計劃名稱" width="150" />
          <el-table-column prop="period" label="缴费期间" width="120" />
          <el-table-column prop="amount" label="应缴金额" width="120" />
          <el-table-column prop="dueDate" label="截止日期" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button 
                v-if="scope.row.status === '待上传'"
                size="small" 
                type="primary" 
                @click="uploadVoucher(scope.row)"
              >
                上传凭证
              </el-button>
              <el-button 
                v-else
                size="small" 
                @click="viewVoucherDetail(scope.row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 多计划卡片页模式 -->
      <div v-else class="plan-cards">
        <el-row :gutter="20">
          <el-col :span="8" v-for="plan in planList" :key="plan.id">
            <el-card class="plan-card" @click="viewPlanVouchers(plan)">
              <template #header>
                <div class="plan-header">
                  <span>{{ plan.planName }}</span>
                  <el-tag :type="plan.hasPending ? 'warning' : 'success'">
                    {{ plan.hasPending ? '有待上传' : '已处理' }}
                  </el-tag>
                </div>
              </template>
              <div class="plan-info">
                <p><strong>待上传凭证：</strong>{{ plan.pendingCount }}份</p>
                <p><strong>本月应缴：</strong>MOP {{ plan.currentAmount }}</p>
                <p><strong>截止日期：</strong>{{ plan.dueDate }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CentralAutoContributionUpload',
  data() {
    return {
      queryForm: {
        planName: '',
        status: ''
      },
      isMultiplePlans: false, // 是否多计划模式
      voucherList: [],
      allVoucherData: [
        {
          id: 1,
          planNo: 'ER12345',
          planName: 'ER12345-集團統一央積金共同計劃',
          period: '2024年3月',
          amount: '125,000.00',
          dueDate: '2024-03-25',
          status: '待上传'
        },
        {
          id: 2,
          planNo: 'ER67890',
          planName: 'ER67890-企業專項央積金計劃',
          period: '2024年3月',
          amount: '80,000.00',
          dueDate: '2024-03-25',
          status: '待上传'
        },
        {
          id: 3,
          planNo: 'ER12345',
          planName: 'ER12345-集團統一央積金共同計劃',
          period: '2024年2月',
          amount: '125,000.00',
          dueDate: '2024-02-25',
          status: '已上传'
        },
        {
          id: 4,
          planNo: 'ER67890',
          planName: 'ER67890-企業專項央積金計劃',
          period: '2024年1月',
          amount: '95,000.00',
          dueDate: '2024-01-25',
          status: '审核中'
        }
      ],
      planList: [
        {
          id: 1,
          planName: 'ER12345-集團統一央積金共同計劃',
          hasPending: true,
          pendingCount: 1,
          currentAmount: '125,000.00',
          dueDate: '2024-03-25'
        },
        {
          id: 2,
          planName: 'ER67890-企業專項央積金計劃',
          hasPending: false,
          pendingCount: 0,
          currentAmount: '80,000.00',
          dueDate: '2024-03-25'
        }
      ]
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      // 默认只显示待上传的任务
      if (!this.queryForm.status || this.queryForm.status === 'pending') {
        this.voucherList = this.allVoucherData.filter(item => item.status === '待上传')
      } else if (this.queryForm.status === 'uploaded') {
        this.voucherList = this.allVoucherData.filter(item => item.status === '已上传')
      } else if (this.queryForm.status === 'reviewing') {
        this.voucherList = this.allVoucherData.filter(item => item.status === '审核中')
      } else {
        this.voucherList = this.allVoucherData
      }
      
      // 根据计划名称筛选
      if (this.queryForm.planName) {
        this.voucherList = this.voucherList.filter(item => 
          item.planName.includes(this.queryForm.planName)
        )
      }
    },
    getStatusType(status) {
      const statusMap = {
        '待上传': 'warning',
        '已上传': 'info',
        '审核中': 'primary',
        '已通过': 'success',
        '已拒绝': 'danger'
      }
      return statusMap[status] || 'info'
    },
    queryVouchers() {
      this.loadData()
      this.$message.success('查询完成')
    },
    resetQuery() {
      this.queryForm = {
        planName: '',
        status: ''
      }
      this.queryVouchers()
    },
    // E503-2 → E503-2-1 (上传详情页面)
    uploadVoucher(voucher) {
      // 跳转到 E503-2-1 凭证上传详情页
      this.$router.push({
        name: 'CentralFundUploadDetail',
        params: { id: voucher.planNo },
        query: { 
          planNo: voucher.planNo,
          period: voucher.period 
        }
      })
    },
    viewVoucherDetail(voucher) {
      // 查看已上传凭证的详情
      this.$router.push({
        name: 'CentralFundUploadDetail',
        params: { id: voucher.planNo },
        query: { 
          planNo: voucher.planNo,
          period: voucher.period,
          status: voucher.status 
        }
      })
    },
    viewPlanVouchers(plan) {
      // 多计划模式下，点击卡片查看该计划的凭证列表
      this.$message.info(`查看${plan.planName}的供款凭证`)
      this.isMultiplePlans = false
      this.queryForm.planName = plan.planName
    }
  }
}
</script>

<style scoped>
.upload-voucher {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.query-form {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.plan-cards {
  margin-top: 20px;
}

.plan-card {
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.plan-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-info p {
  margin: 8px 0;
  color: #606266;
}
</style>