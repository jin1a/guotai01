<template>
  <div class="employee-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <div>
            <el-button @click="goBack" size="small" plain>
              <el-icon><ArrowLeft /></el-icon>
              返回
            </el-button>
            <span style="margin-left: 12px; font-weight: bold;">
              僱員詳情 - {{ employeeDetail?.name }}
            </span>
          </div>
        </div>
      </template>

      <div v-if="employeeDetail">
        <!-- 基本信息 -->
        <el-card class="detail-card" style="margin-bottom: 20px;">
          <template #header>
            <h3>基本信息</h3>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="僱員編號">{{ employeeDetail.employeeId }}</el-descriptions-item>
            <el-descriptions-item label="中文姓名">{{ employeeDetail.name }}</el-descriptions-item>
            <el-descriptions-item label="英文姓氏">{{ employeeDetail.englishSurname || '未提供' }}</el-descriptions-item>
            <el-descriptions-item label="英文名字">{{ employeeDetail.englishGivenName || '未提供' }}</el-descriptions-item>
            <el-descriptions-item label="性別">
              <el-tag :type="employeeDetail.gender === '男' ? 'primary' : 'success'" size="small">
                {{ employeeDetail.gender || '未提供' }}
              </el-tag>
            </el-descriptions-item>
           
            <el-descriptions-item label="狀態">
              <el-tag :type="getStatusType(employeeDetail.status)">
                {{ employeeDetail.status }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="聯繫電話">{{ employeeDetail.phone || '未提供' }}</el-descriptions-item>
            <el-descriptions-item label="電子郵箱">{{ employeeDetail.email || '未提供' }}</el-descriptions-item>
            <el-descriptions-item label="受僱日期">{{ employeeDetail.employmentDate || '未提供' }}</el-descriptions-item>
            <el-descriptions-item label="最後受僱日期">{{ employeeDetail.lastEmploymentDate || '未提供' }}</el-descriptions-item>
            <el-descriptions-item label="入職日期">{{ employeeDetail.hireDate || '未提供' }}</el-descriptions-item>
            <el-descriptions-item label="離職原因" v-if="employeeDetail.status === '離職'">
              <el-tag type="warning" size="small">{{ employeeDetail.resignationReason || '未提供' }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="現時薪資" v-if="employeeDetail.status === '在職'">
              <span style="font-weight: bold; color: #2C8976;">MOP {{ formatMoney(employeeDetail.currentSalary || 0) }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 供款统计概览 -->
        <el-card class="detail-card statistics-card" style="margin-bottom: 20px;">
          <template #header>
            <div style="display: flex; align-items: center; gap: 8px;">
              <el-icon color="#409EFF"><TrendCharts /></el-icon>
              <h3>供款統計概覽</h3>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="statistic-item employee-contribution">
                <div class="statistic-icon">
                  <el-icon size="24"><User /></el-icon>
                </div>
                <div class="statistic-content">
                  <div class="statistic-label">僱員總供款</div>
                  <div class="statistic-value">MOP {{ formatMoney(totalEmployeeContribution) }}</div>
                  <div class="statistic-desc">累計個人供款金額</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="statistic-item employer-contribution">
                <div class="statistic-icon">
                  <el-icon size="24"><OfficeBuilding /></el-icon>
                </div>
                <div class="statistic-content">
                  <div class="statistic-label">僱主總供款</div>
                  <div class="statistic-value">MOP {{ formatMoney(totalEmployerContribution) }}</div>
                  <div class="statistic-desc">累計企業供款金額</div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="8">
              <div class="statistic-item vested-contribution">
                <div class="statistic-icon">
                  <el-icon size="24"><Trophy /></el-icon>
                </div>
                <div class="statistic-content">
                  <div class="statistic-label">權益歸屬供款約值</div>
                  <div class="statistic-value highlight">MOP {{ formatMoney(vestedEmployerContribution) }}</div>
                  <div class="statistic-desc">按歸屬比例計算</div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 参与计划信息 -->
        <el-card class="detail-card" style="margin-bottom: 20px;">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3>參與計劃信息</h3>
              <span style="color: #909399; font-size: 14px;">共參與 {{ participatedPlans.length }} 個計劃</span>
            </div>
          </template>
          
          <el-table :data="participatedPlans" border>
            <el-table-column prop="planName" label="計劃編號" width="120" />
            <el-table-column prop="planScheme" label="計劃方案" width="120" />
            <el-table-column prop="planType" label="計劃類型" width="100">
              <template #default="scope">
                <el-tag :type="scope.row.planType === '央積金' ? 'primary' : 'success'" size="small">
                  {{ scope.row.planType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="joinDate" label="加入日期" width="120" />
            <el-table-column prop="contributionBase" label="供款基數" width="auto" align="right">
              <template #default="scope">
                <span style="font-weight: bold; color: #2C8976;">MOP {{ formatMoney(scope.row.contributionBase) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="employerRate" label="僱主比例" width="100" align="center" />
            <el-table-column prop="employeeRate" label="僱員比例" width="100" align="center" />
            <el-table-column prop="monthlyEmployerAmount" label="月度僱主供款" width="auto" align="right">
              <template #default="scope">
                <span style="font-weight: bold; color: #E6A23C;">MOP {{ formatMoney(scope.row.monthlyEmployerAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="monthlyEmployeeAmount" label="月度僱員供款" width="auto" align="right">
              <template #default="scope">
                <span style="font-weight: bold; color: #E6A23C;">MOP {{ formatMoney(scope.row.monthlyEmployeeAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalEmployerContribution" label="累計僱主供款" width="auto" align="right">
              <template #default="scope">
                <span style="font-weight: bold; color: #67C23A;">MOP {{ formatMoney(scope.row.totalEmployerContribution) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="totalEmployeeContribution" label="累計僱員供款" width="auto" align="right">
              <template #default="scope">
                <span style="font-weight: bold; color: #67C23A;">MOP {{ formatMoney(scope.row.totalEmployeeContribution) }}</span>
              </template>
            </el-table-column>
           
          </el-table>
        </el-card>

        <!-- 供款历史记录 -->
        <el-card class="detail-card">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <h3>近期供款記錄</h3>
              <div>
                <el-select v-model="selectedPlan" placeholder="選擇計劃" style="width: 150px; margin-right: 12px;" size="small">
                  <el-option label="所有計劃" value="" />
                  <el-option 
                    v-for="plan in participatedPlans" 
                    :key="plan.planName"
                    :label="plan.planName"
                    :value="plan.planName"
                  />
                </el-select>
                <el-button size="small" type="primary" @click="viewFullHistory">查看完整歷史</el-button>
              </div>
            </div>
          </template>
          
          <el-table :data="filteredContributionHistory" border style="width: 100%">
            <el-table-column prop="period" label="供款期間" min-width="120" />
            <el-table-column prop="planName" label="計劃編號" min-width="120" />
            <el-table-column prop="planType" label="計劃類型" min-width="100">
              <template #default="scope">
                <el-tag :type="scope.row.planType === '央積金' ? 'primary' : 'success'" size="small">
                  {{ scope.row.planType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="employerAmount" label="僱主供款" min-width="130" align="right">
              <template #default="scope">
                MOP {{ scope.row.employerAmount }}
              </template>
            </el-table-column>
            <el-table-column prop="employeeAmount" label="僱員供款" min-width="130" align="right">
              <template #default="scope">
                MOP {{ scope.row.employeeAmount }}
              </template>
            </el-table-column>
            <el-table-column prop="totalAmount" label="個人總供款" min-width="140" align="right">
              <template #default="scope">
                <span style="font-weight: bold;">MOP {{ scope.row.totalAmount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="狀態" min-width="100">
              <template #default="scope">
                <el-tag :type="scope.row.status === '已對賬' ? 'success' : 'warning'" size="small">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="paymentDate" label="繳費日期" min-width="120" />
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper" style="margin-top: 20px;">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              :total="filteredContributionHistory.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </el-card>
      </div>

      <!-- 加载状态 -->
      <div v-else class="loading-container">
        <el-empty description="正在加載數據..." />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User, OfficeBuilding, Trophy, TrendCharts } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const employeeDetail = ref(null)
const participatedPlans = ref([])
const contributionHistory = ref([])
const selectedPlan = ref('')

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)

// 过滤后的供款历史
const filteredContributionHistory = computed(() => {
  let history = contributionHistory.value
  if (selectedPlan.value) {
    history = history.filter(item => item.planName === selectedPlan.value)
  }
  
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return history.slice(start, end)
})

// 计算总供款数据
const totalEmployeeContribution = computed(() => {
  return participatedPlans.value.reduce((total, plan) => {
    return total + (plan.totalEmployeeContribution || 0)
  }, 0)
})

const totalEmployerContribution = computed(() => {
  return participatedPlans.value.reduce((total, plan) => {
    return total + (plan.totalEmployerContribution || 0)
  }, 0)
})

// 按权益归属比例计算的雇主供款约值
const vestedEmployerContribution = computed(() => {
  const vestingPercentage = (employeeDetail.value?.vestingPercentage || 70) / 100
  return totalEmployerContribution.value * vestingPercentage
})


// 模拟数据
const mockEmployeeData = {
  'ER1234500001': {
    employeeId: 'ER1234500001',
    name: '張三',
    englishSurname: 'ZHANG',
    englishGivenName: 'San',
    gender: '男',
    idNumber: 'A123456(7)',
    department: '市場部',
    position: '經理',
    status: '在職',
    phone: '853-66778899',
    email: 'zhangsan@company.com',
    employmentDate: '2023-01-15',
    lastEmploymentDate: '2023-01-15',
    hireDate: '2023-01-15',
    currentSalary: 35000,
    vestingPercentage: 75, // 权益归属比例
    participatedPlans: [
      {
        planName: 'ER12345',
        planScheme: '方案A',
        planType: '央積金',
        joinDate: '2024-01-01',
        contributionBase: 25000,
        employerRate: '10%',
        employeeRate: '10%',
        monthlyEmployerAmount: 2500,
        monthlyEmployeeAmount: 2500,
        totalEmployerContribution: 17500, // 7個月累計
        totalEmployeeContribution: 17500, // 7個月累計
        status: '正常'
      },
      {
        planName: 'PR67890',
        planScheme: '方案B',
        planType: '私退金',
        joinDate: '2024-01-01',
        contributionBase: 25000,
        employerRate: '8%',
        employeeRate: '8%',
        monthlyEmployerAmount: 2000,
        monthlyEmployeeAmount: 2000,
        totalEmployerContribution: 14000, // 7個月累計
        totalEmployeeContribution: 14000, // 7個月累計
        status: '正常'
      }
    ]
  },
  'ER1234500002': {
    employeeId: 'ER1234500002',
    name: '李四',
    englishSurname: 'LEE',
    englishGivenName: 'Si',
    gender: '女',
    idNumber: 'B234567(8)',
    department: '技術部',
    position: '工程師',
    status: '在職',
    phone: '853-66778866',
    email: 'lisi@company.com',
    employmentDate: '2023-03-20',
    lastEmploymentDate: '2023-03-20',
    hireDate: '2023-03-20',
    currentSalary: 30000,
    vestingPercentage: 80, // 权益归属比例
    participatedPlans: [
      {
        planName: 'ER12345',
        planScheme: '方案B',
        planType: '央積金',
        joinDate: '2024-02-01',
        contributionBase: 30000,
        employerRate: '10%',
        employeeRate: '10%',
        monthlyEmployerAmount: 3000,
        monthlyEmployeeAmount: 3000,
        totalEmployerContribution: 18000, // 6個月累計
        totalEmployeeContribution: 18000, // 6個月累計
        status: '正常'
      }
    ]
  },
  'ER1234500006': {
    employeeId: 'ER1234500006',
    name: '黃八',
    englishSurname: 'WONG',
    englishGivenName: 'Pat',
    gender: '男',
    idNumber: 'F678901(2)',
    department: '销售部',
    position: '經理',
    status: '離職',
    phone: '853-66778877',
    email: 'wongpat@company.com',
    employmentDate: '2023-01-15',
    lastEmploymentDate: '2024-06-30',
    hireDate: '2023-01-15',
    currentSalary: 0,
    resignationReason: '個人發展需要',
    vestingPercentage: 60, // 权益归属比例
    participatedPlans: [
      {
        planName: 'ER12345',
        planScheme: '方案B',
        planType: '央積金',
        joinDate: '2023-01-15',
        contributionBase: 0,
        employerRate: '10%',
        employeeRate: '10%',
        monthlyEmployerAmount: 0,
        monthlyEmployeeAmount: 0,
        totalEmployerContribution: 25000, // 离职前累计
        totalEmployeeContribution: 25000, // 离职前累计
        status: '已終止'
      }
    ]
  }
}

// 获取员工详情数据
const fetchEmployeeDetail = () => {
  const employeeId = route.params.id
  
  // 模拟API调用
  setTimeout(() => {
    const data = mockEmployeeData[employeeId]
    if (data) {
      employeeDetail.value = data
      participatedPlans.value = data.participatedPlans
      contributionHistory.value = generateContributionHistory(data)
    } else {
      ElMessage.error('未找到對應的僱員信息')
      goBack()
    }
  }, 500)
}

// 生成供款历史数据
const generateContributionHistory = (employee) => {
  const history = []
  const months = ['2024年1月', '2023年12月', '2023年11月', '2023年10月', '2023年9月', '2023年8月']
  
  employee.participatedPlans.forEach(plan => {
    months.forEach(month => {
      history.push({
        period: month,
        planName: plan.planName,
        planType: plan.planType,
        employerAmount: formatMoney(plan.monthlyEmployerAmount),
        employeeAmount: formatMoney(plan.monthlyEmployeeAmount),
        totalAmount: formatMoney(plan.monthlyEmployerAmount + plan.monthlyEmployeeAmount),
        status: '已對賬',
        paymentDate: month.replace('年', '-').replace('月', '-25')
      })
    })
  })
  
  return history.sort((a, b) => new Date(b.period) - new Date(a.period))
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}

// 查看完整历史
const viewFullHistory = () => {
  ElMessage.info('跳轉到供款歷史查詢頁面')
  // 实际项目中可以跳转到供款历史页面，并过滤该员工的记录
}

// 工具函数
const getStatusType = (status) => {
  const statusMap = {
    '在職': 'success',
    '待入職': 'warning',
    '離職': 'danger'
  }
  return statusMap[status] || 'info'
}

const formatMoney = (amount) => {
  return amount ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// 分页处理函数
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}

onMounted(() => {
  fetchEmployeeDetail()
})
</script>

<style scoped>
.employee-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-card {
  margin-bottom: 20px;
}

.detail-card h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: bold;
}

.loading-container {
  text-align: center;
  padding: 40px 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
}

:deep(.el-descriptions-item__label) {
  font-weight: bold;
  color: #606266;
}

:deep(.el-descriptions-item__content) {
  color: #303133;
}

:deep(.el-table th) {
  background-color: #fafafa;
}

/* 统计卡片样式 */
.statistics-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.statistics-card h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
  font-weight: bold;
}

.statistic-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.statistic-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.statistic-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
}

.employee-contribution .statistic-icon {
  background: linear-gradient(135deg, #67C23A, #85ce61);
}

.employer-contribution .statistic-icon {
  background: linear-gradient(135deg, #409EFF, #66b1ff);
}

.vested-contribution .statistic-icon {
  background: linear-gradient(135deg, #E6A23C, #ebb563);
}

.statistic-content {
  flex: 1;
}

.statistic-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 5px;
}

.statistic-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.statistic-value.highlight {
  color: #E6A23C;
  font-size: 26px;
}

.statistic-desc {
  font-size: 12px;
  color: #C0C4CC;
}
</style>