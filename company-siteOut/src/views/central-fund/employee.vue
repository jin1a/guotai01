<template>
  <div class="employee-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>央積金共同計劃下僱員管理</span>
        </div>
      </template>

      <!-- 查询条件 -->
      <el-form :model="searchForm" class="query-form">
        <!-- 第一行 -->
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="選擇計劃">
              <el-select v-model="searchForm.planName" placeholder="請選擇計劃" clearable style="width: 100%">
                <el-option label="全部計劃" value="" />
                <el-option label="央積金計劃A (ER12345)" value="ER12345" />
                <el-option label="央積金計劃B (ER67890)" value="ER67890" />
                <el-option label="私退金計劃A (PR12345)" value="PR12345" />
                <el-option label="私退金計劃B (PR67890)" value="PR67890" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="中文姓名">
              <el-input v-model="searchForm.chineseName" placeholder="請輸入中文姓名" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="英文姓名">
              <el-input v-model="searchForm.englishName" placeholder="請輸入英文姓名" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="成員編號">
              <el-input v-model="searchForm.memberNumber" placeholder="請輸入成員編號" clearable />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行 - 高级筛选 -->
        <el-row :gutter="20" v-show="showAdvanced">
          <el-col :span="6">
            <el-form-item label="受僱狀態">
              <el-select v-model="searchForm.employmentStatus" placeholder="請選擇受僱狀態" clearable style="width: 100%">
                <el-option label="全部狀態" value="" />
                <el-option label="在職" value="在職" />
                <el-option label="離職" value="離職" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="受僱日期">
              <el-date-picker
                v-model="searchForm.employmentDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="最後受僱日期">
              <el-date-picker
                v-model="searchForm.lastEmploymentDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="參加計劃日期">
              <el-date-picker
                v-model="searchForm.joinPlanDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="開始日期"
                end-placeholder="結束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <el-row>
          <el-col :span="24" style="text-align: right;">
            <el-form-item>
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                查詢
              </el-button>
              <el-button @click="resetSearch">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
           
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <!-- 员工列表 -->
      <el-table :data="employeeList" style="width: 100%">
        <el-table-column prop="employeeId" label="僱員編號" min-width="140" />
        <el-table-column prop="name" label="中文姓名" min-width="120" />
        <el-table-column prop="englishName" label="英文姓名" min-width="150">
          <template #default="scope">
            {{ scope.row.englishSurname }} {{ scope.row.englishGivenName }}
          </template>
        </el-table-column>
        <el-table-column prop="employmentDate" label="受僱日期" min-width="130" />
        <el-table-column prop="lastEmploymentDate" label="最後受僱日期" min-width="140" />
        <el-table-column prop="contributionBase" label="供款基數" min-width="130" align="right">
          <template #default="scope">
            MOP {{ formatMoney(scope.row.contributionBase) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="狀態" min-width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleViewDetail(scope.row)">詳情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Filter } from '@element-plus/icons-vue'

const router = useRouter()

// 查询表单
const searchForm = reactive({
  planName: '',
  chineseName: '',
  englishName: '',
  memberNumber: '',
  employmentStatus: '',
  employmentDateRange: [],
  lastEmploymentDateRange: [],
  joinPlanDateRange: []
})

// 控制高级搜索显示
const showAdvanced = ref(true)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(20)


// 模拟数据
const employeeList = ref([
  {
    planName: 'ER12345',
    planScheme: '方案A',
    employeeId: 'ER1234500001',
    name: '張三',
    englishSurname: 'ZHANG',
    englishGivenName: 'San',
    idNumber: 'A123456(7)',
    department: '市場部',
    position: '經理',
    employmentDate: '2023-01-15',
    lastEmploymentDate: '2023-01-15',
    joinDate: '2024-01-01',
    contributionBase: 25000,
    status: '在職'
  },
  {
    planName: 'ER12345',
    planScheme: '方案B',
    employeeId: 'ER1234500002',
    name: '李四',
    englishSurname: 'LEE',
    englishGivenName: 'Si',
    idNumber: 'B234567(8)',
    department: '技術部',
    position: '工程師',
    employmentDate: '2023-03-20',
    lastEmploymentDate: '2023-03-20',
    joinDate: '2024-02-01',
    contributionBase: 30000,
    status: '在職'
  },
  {
    planName: 'ER67890',
    planScheme: '方案A',
    employeeId: 'ER6789000003',
    name: '王五',
    englishSurname: 'WANG',
    englishGivenName: 'Wu',
    idNumber: 'C345678(9)',
    department: '財務部',
    position: '主管',
    employmentDate: '2023-10-01',
    lastEmploymentDate: '2023-10-01',
    joinDate: '2024-01-15',
    contributionBase: 28000,
    status: '在職'
  },
  {
    planName: 'ER12345',
    planScheme: '方案A',
    employeeId: 'ER1234500004',
    name: '趙六',
    englishSurname: 'ZHAO',
    englishGivenName: 'Liu',
    idNumber: 'D456789(0)',
    department: '人事部',
    position: '主任',
    employmentDate: '2023-05-15',
    lastEmploymentDate: '2023-05-15',
    joinDate: '2023-12-01',
    contributionBase: 35000,
    status: '在職'
  },
  {
    planName: 'ER67890',
    planScheme: '方案B',
    employeeId: 'ER6789000005',
    name: '陳七',
    englishSurname: 'CHEN',
    englishGivenName: 'Qi',
    idNumber: 'E567890(1)',
    department: '營運部',
    position: '專員',
    employmentDate: '2024-01-10',
    lastEmploymentDate: '2024-01-10',
    joinDate: '2024-03-01',
    contributionBase: 22000,
    status: '在職'
  },
  {
    planName: 'ER12345',
    planScheme: '方案B',
    employeeId: 'ER1234500006',
    name: '黃八',
    englishSurname: 'WONG',
    englishGivenName: 'Pat',
    idNumber: 'F678901(2)',
    department: '销售部',
    position: '經理',
    employmentDate: '2023-01-15',
    lastEmploymentDate: '2024-06-30',
    joinDate: '2023-01-15',
    contributionBase: 0,
    status: '離職'
  },
  {
    planName: 'ER67890',
    planScheme: '方案A',
    employeeId: 'ER6789000007',
    name: '周九',
    englishSurname: 'ZHOU',
    englishGivenName: 'Jiu',
    idNumber: 'G789012(3)',
    department: '客服部',
    position: '主管',
    employmentDate: '2023-12-01',
    lastEmploymentDate: '2023-12-01',
    joinDate: '2024-01-10',
    contributionBase: 26000,
    status: '在職'
  },
  {
    planName: 'ER12345',
    planScheme: '方案A',
    employeeId: 'ER1234500008',
    name: '吳十',
    englishSurname: 'WU',
    englishGivenName: 'Shi',
    idNumber: 'H890123(4)',
    department: '法務部',
    position: '律師',
    employmentDate: '2023-11-10',
    lastEmploymentDate: '2023-11-10',
    joinDate: '2024-02-15',
    contributionBase: 45000,
    status: '在職'
  },
  {
    planName: 'ER67890',
    planScheme: '方案B',
    employeeId: 'ER6789000009',
    name: '鄭華',
    englishSurname: 'ZHENG',
    englishGivenName: 'Hua',
    idNumber: 'I901234(5)',
    department: '採購部',
    position: '經理',
    employmentDate: '2023-08-15',
    lastEmploymentDate: '2023-08-15',
    joinDate: '2023-11-20',
    contributionBase: 32000,
    status: '在職'
  },
  {
    planName: 'ER12345',
    planScheme: '方案B',
    employeeId: 'ER1234500010',
    name: '林明',
    englishSurname: 'LIN',
    englishGivenName: 'Ming',
    idNumber: 'J012345(6)',
    department: '品管部',
    position: '工程師',
    employmentDate: '2024-01-05',
    lastEmploymentDate: '2024-01-05',
    joinDate: '2024-03-01',
    contributionBase: 28000,
    status: '在職'
  },
  {
    planName: 'ER67890',
    planScheme: '方案A',
    employeeId: 'ER6789000011',
    name: '徐強',
    englishSurname: 'XU',
    englishGivenName: 'Qiang',
    idNumber: 'K123456(7)',
    department: '生產部',
    position: '主任',
    employmentDate: '2023-07-01',
    lastEmploymentDate: '2023-07-01',
    joinDate: '2023-10-15',
    contributionBase: 31000,
    status: '在職'
  },
  {
    planName: 'ER12345',
    planScheme: '方案A',
    employeeId: 'ER1234500012',
    name: '馬麗',
    englishSurname: 'MA',
    englishGivenName: 'Li',
    idNumber: 'L234567(8)',
    department: '行政部',
    position: '秘書',
    employmentDate: '2023-12-15',
    lastEmploymentDate: '2023-12-15',
    joinDate: '2024-01-25',
    contributionBase: 18000,
    status: '在職'
  },
  {
    planName: 'ER67890',
    planScheme: '方案B',
    employeeId: 'ER6789000013',
    name: '高峰',
    englishSurname: 'GAO',
    englishGivenName: 'Feng',
    idNumber: 'M345678(9)',
    department: '研發部',
    position: '總監',
    employmentDate: '2023-04-01',
    lastEmploymentDate: '2023-04-01',
    joinDate: '2023-09-01',
    contributionBase: 52000,
    status: '在職'
  },
  {
    planName: 'ER12345',
    planScheme: '方案B',
    employeeId: 'ER1234500014',
    name: '楊柳',
    englishSurname: 'YANG',
    englishGivenName: 'Liu',
    idNumber: 'N456789(0)',
    department: '市場部',
    position: '專員',
    employmentDate: '2024-01-15',
    lastEmploymentDate: '2024-01-15',
    joinDate: '2024-02-20',
    contributionBase: 20000,
    status: '在職'
  },
  {
    planName: 'ER67890',
    planScheme: '方案A',
    employeeId: 'ER6789000015',
    name: '孫雲',
    englishSurname: 'SUN',
    englishGivenName: 'Yun',
    idNumber: 'O567890(1)',
    department: '財務部',
    position: '會計',
    employmentDate: '2023-11-20',
    lastEmploymentDate: '2023-11-20',
    joinDate: '2024-01-05',
    contributionBase: 24000,
    status: '在職'
  },
  {
    planName: 'ER12345',
    planScheme: '方案A',
    employeeId: 'ER1234500016',
    name: '何平',
    englishSurname: 'HE',
    englishGivenName: 'Ping',
    idNumber: 'P678901(2)',
    department: '技術部',
    position: '架構師',
    employmentDate: '2022-10-01',
    lastEmploymentDate: '2024-03-31',
    joinDate: '2023-05-10',
    contributionBase: 0,
    status: '離職'
  },
  {
    planName: 'ER67890',
    planScheme: '方案B',
    employeeId: 'ER6789000017',
    name: '潘靜',
    englishSurname: 'PAN',
    englishGivenName: 'Jing',
    idNumber: 'Q789012(3)',
    department: '營運部',
    position: '經理',
    employmentDate: '2023-09-15',
    lastEmploymentDate: '2023-09-15',
    joinDate: '2023-12-10',
    contributionBase: 38000,
    status: '在職'
  },
  {
    planName: 'ER12345',
    planScheme: '方案B',
    employeeId: 'ER1234500018',
    name: '鄧飛',
    englishSurname: 'DENG',
    englishGivenName: 'Fei',
    idNumber: 'R890123(4)',
    department: '客服部',
    position: '專員',
    employmentDate: '2024-02-01',
    lastEmploymentDate: '2024-02-01',
    joinDate: '2024-03-05',
    contributionBase: 19000,
    status: '在職'
  },
  {
    planName: 'ER67890',
    planScheme: '方案A',
    employeeId: 'ER6789000019',
    name: '曹雪',
    englishSurname: 'CAO',
    englishGivenName: 'Xue',
    idNumber: 'S901234(5)',
    department: '人事部',
    position: '專員',
    employmentDate: '2023-12-01',
    lastEmploymentDate: '2023-12-01',
    joinDate: '2024-01-20',
    contributionBase: 21000,
    status: '在職'
  },
  {
    planName: 'ER12345',
    planScheme: '方案A',
    employeeId: 'ER1234500020',
    name: '錢偉',
    englishSurname: 'QIAN',
    englishGivenName: 'Wei',
    idNumber: 'T012345(6)',
    department: '销售部',
    position: '主管',
    employmentDate: '2023-08-01',
    lastEmploymentDate: '2023-08-01',
    joinDate: '2023-11-01',
    contributionBase: 34000,
    status: '在職'
  }
])

// 格式化金额
const formatMoney = (amount) => {
  return amount ? amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'
}

// 状态标签类型
const getStatusType = (status) => {
  const types = {
    '在職': 'success',
    '待入職': 'warning',
    '離職': 'danger'
  }
  return types[status] || 'info'
}

// 搜索相关
const handleSearch = () => {
  ElMessage.success('執行搜索')
  // 实现搜索逻辑
}

const resetSearch = () => {
  searchForm.planName = ''
  searchForm.chineseName = ''
  searchForm.englishName = ''
  searchForm.memberNumber = ''
  searchForm.employmentStatus = ''
  searchForm.employmentDateRange = []
  searchForm.lastEmploymentDateRange = []
  searchForm.joinPlanDateRange = []
  handleSearch()
}

// 切换高级搜索显示状态
const toggleAdvancedSearch = () => {
  showAdvanced.value = !showAdvanced.value
}

// 分页相关
const handleSizeChange = (val) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // 重新加载数据
}

// 查看员工详情
const handleViewDetail = (employee) => {
  // 跳转到员工详情页面
  router.push({
    name: 'CentralFundEmployeeDetail',
    params: { id: employee.employeeId }
  })
}

</script>

<style scoped>
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.detail-card {
  margin-bottom: 20px;
}

.detail-card h3 {
  margin: 0;
  color: #303133;
  font-size: 16px;
  font-weight: bold;
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
</style> 