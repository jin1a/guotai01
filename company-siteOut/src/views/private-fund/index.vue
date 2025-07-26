<template>
  <div class="employee-management">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>私退金共同計劃下僱員管理</span>
        </div>
      </template>

      <!-- 查询条件 -->
      <el-form :model="searchForm" :inline="true" class="query-form">
        <el-form-item label="計劃名稱">
          <el-select v-model="searchForm.planName" placeholder="請選擇計劃" clearable>
            <el-option label="全部計劃" value="" />
            <el-option label="私退金計劃A" value="plan-a" />
            <el-option label="私退金計劃B" value="plan-b" />
          </el-select>
        </el-form-item>
        <el-form-item label="僱員姓名">
          <el-input v-model="searchForm.name" placeholder="請輸入姓名" clearable />
        </el-form-item>
        <el-form-item label="身份證號">
          <el-input v-model="searchForm.idNumber" placeholder="請輸入身份證號" clearable />
        </el-form-item>
        <el-form-item label="狀態">
          <el-select v-model="searchForm.status" placeholder="請選擇狀態" clearable>
            <el-option label="全部" value="" />
            <el-option label="在職" value="active" />
            <el-option label="離職" value="resigned" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查詢</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 员工列表 -->
      <el-table :data="employeeList" style="width: 100%">
        <el-table-column prop="planName" label="計劃名稱" width="150" />
        <el-table-column prop="employeeId" label="僱員編號" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="idNumber" label="身份證號" width="150" />
        <el-table-column prop="department" label="部門" width="120" />
        <el-table-column prop="position" label="職位" width="120" />
        <el-table-column prop="joinDate" label="加入計劃日期" width="130" />
        <el-table-column prop="contributionBase" label="供款基數" width="120" align="right">
          <template #default="scope">
            ¥{{ formatMoney(scope.row.contributionBase) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="狀態" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
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
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询表单
const searchForm = reactive({
  planName: '',
  name: '',
  idNumber: '',
  status: ''
})

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(20)

// 模拟数据
const employeeList = ref([
  {
    planName: '私退金計劃A',
    employeeId: 'E202401001',
    name: '張三',
    idNumber: 'A123456(7)',
    department: '市場部',
    position: '經理',
    joinDate: '2024-01-01',
    contributionBase: 25000,
    status: '在職'
  },
  {
    planName: '私退金計劃A',
    employeeId: 'E202401002',
    name: '李四',
    idNumber: 'B234567(8)',
    department: '技術部',
    position: '工程師',
    joinDate: '2024-02-01',
    contributionBase: 30000,
    status: '在職'
  },
  {
    planName: '私退金計劃B',
    employeeId: 'E202401003',
    name: '王五',
    idNumber: 'C345678(9)',
    department: '財務部',
    position: '主管',
    joinDate: '2024-01-15',
    contributionBase: 28000,
    status: '在職'
  },
  {
    planName: '私退金計劃A',
    employeeId: 'E202401004',
    name: '趙六',
    idNumber: 'D456789(0)',
    department: '人事部',
    position: '主任',
    joinDate: '2023-12-01',
    contributionBase: 35000,
    status: '在職'
  },
  {
    planName: '私退金計劃B',
    employeeId: 'E202401005',
    name: '陳七',
    idNumber: 'E567890(1)',
    department: '營運部',
    position: '專員',
    joinDate: '2024-03-01',
    contributionBase: 22000,
    status: '在職'
  },
  {
    planName: '私退金計劃A',
    employeeId: 'E202301001',
    name: '黃八',
    idNumber: 'F678901(2)',
    department: '销售部',
    position: '經理',
    joinDate: '2023-01-15',
    contributionBase: 0,
    status: '離職'
  },
  {
    planName: '私退金計劃B',
    employeeId: 'E202401006',
    name: '周九',
    idNumber: 'G789012(3)',
    department: '客服部',
    position: '主管',
    joinDate: '2024-01-10',
    contributionBase: 26000,
    status: '在職'
  },
  {
    planName: '私退金計劃A',
    employeeId: 'E202401007',
    name: '吳十',
    idNumber: 'H890123(4)',
    department: '法務部',
    position: '律師',
    joinDate: '2024-02-15',
    contributionBase: 45000,
    status: '在職'
  },
  {
    planName: '私退金計劃B',
    employeeId: 'E202401008',
    name: '鄭華',
    idNumber: 'I901234(5)',
    department: '採購部',
    position: '經理',
    joinDate: '2023-11-20',
    contributionBase: 32000,
    status: '在職'
  },
  {
    planName: '私退金計劃A',
    employeeId: 'E202401009',
    name: '林明',
    idNumber: 'J012345(6)',
    department: '品管部',
    position: '工程師',
    joinDate: '2024-03-01',
    contributionBase: 28000,
    status: '在職'
  },
  {
    planName: '私退金計劃B',
    employeeId: 'E202401010',
    name: '徐強',
    idNumber: 'K123456(7)',
    department: '生產部',
    position: '主任',
    joinDate: '2023-10-15',
    contributionBase: 31000,
    status: '在職'
  },
  {
    planName: '私退金計劃A',
    employeeId: 'E202401011',
    name: '馬麗',
    idNumber: 'L234567(8)',
    department: '行政部',
    position: '秘書',
    joinDate: '2024-01-25',
    contributionBase: 18000,
    status: '在職'
  },
  {
    planName: '私退金計劃B',
    employeeId: 'E202401012',
    name: '高峰',
    idNumber: 'M345678(9)',
    department: '研發部',
    position: '總監',
    joinDate: '2023-09-01',
    contributionBase: 52000,
    status: '在職'
  },
  {
    planName: '私退金計劃A',
    employeeId: 'E202401013',
    name: '楊柳',
    idNumber: 'N456789(0)',
    department: '市場部',
    position: '專員',
    joinDate: '2024-02-20',
    contributionBase: 20000,
    status: '在職'
  },
  {
    planName: '私退金計劃B',
    employeeId: 'E202401014',
    name: '孫雲',
    idNumber: 'O567890(1)',
    department: '財務部',
    position: '會計',
    joinDate: '2024-01-05',
    contributionBase: 24000,
    status: '在職'
  },
  {
    planName: '私退金計劃A',
    employeeId: 'E202301002',
    name: '何平',
    idNumber: 'P678901(2)',
    department: '技術部',
    position: '架構師',
    joinDate: '2023-05-10',
    contributionBase: 0,
    status: '離職'
  },
  {
    planName: '私退金計劃B',
    employeeId: 'E202401015',
    name: '潘靜',
    idNumber: 'Q789012(3)',
    department: '營運部',
    position: '經理',
    joinDate: '2023-12-10',
    contributionBase: 38000,
    status: '在職'
  },
  {
    planName: '私退金計劃A',
    employeeId: 'E202401016',
    name: '鄧飛',
    idNumber: 'R890123(4)',
    department: '客服部',
    position: '專員',
    joinDate: '2024-03-05',
    contributionBase: 19000,
    status: '在職'
  },
  {
    planName: '私退金計劃B',
    employeeId: 'E202401017',
    name: '曹雪',
    idNumber: 'S901234(5)',
    department: '人事部',
    position: '專員',
    joinDate: '2024-01-20',
    contributionBase: 21000,
    status: '在職'
  },
  {
    planName: '私退金計劃A',
    employeeId: 'E202401018',
    name: '錢偉',
    idNumber: 'T012345(6)',
    department: '销售部',
    position: '主管',
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
  searchForm.employeeId = ''
  searchForm.name = ''
  searchForm.status = ''
  handleSearch()
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

// 员工操作相关
const handleAddEmployee = () => {
  dialogType.value = 'add'
  dialogVisible.value = true
  // 重置表单
  if (employeeFormRef.value) {
    employeeFormRef.value.resetFields()
  }
}

const handleView = (row) => {
  ElMessage.info(`查看僱員：${row.name}`)
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  dialogVisible.value = true
  // 填充表单数据
  Object.assign(employeeForm, row)
}

const handleResign = (row) => {
  ElMessageBox.confirm(
    `確定要將僱員 ${row.name} 設置為離職狀態嗎？`,
    '警告',
    {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(`僱員 ${row.name} 已設置為離職`)
  }).catch(() => {
    ElMessage.info('已取消操作')
  })
}

const handleSubmitEmployee = () => {
  // 移除表单验证，直接提交
  // if (!employeeFormRef.value) return
  
  // employeeFormRef.value.validate((valid) => {
  //   if (valid) {
      ElMessage.success(
        dialogType.value === 'add' 
          ? '新增僱員成功' 
          : '更新僱員資料成功'
      )
      dialogVisible.value = false
  //   }
  // })
}

// 导入相关
const handleImport = () => {
  importDialogVisible.value = true
}

const handleFileChange = (file) => {
  uploadFile.value = file
}

const handleUpload = () => {
  if (!uploadFile.value) {
    ElMessage.warning('請先選擇文件')
    return
  }
  ElMessage.success('開始上傳文件')
  // 实现上传逻辑
}

const handleDownloadTemplate = () => {
  ElMessage.success('開始下載模板')
  // 实现下载模板逻辑
}

// 线上办理相关
const handleOnlineProcess = (command, employee) => {
  const routes = {
    join: '/private-fund/online/join-application',
    terminate: '/private-fund/online/termination-application', 
    transfer: '/private-fund/online/transfer-application',
    salary: '/private-fund/online/salary-adjustment'
  }
  
  if (routes[command]) {
    // 跳转到对应的线上办理页面，并传递雇员信息
    ElMessage.info(`跳转到${getProcessName(command)}页面`)
    // 实际项目中可以通过路由参数传递雇员信息
    // this.$router.push({ 
    //   path: routes[command], 
    //   query: { employeeId: employee.employeeId } 
    // })
  }
}

const getProcessName = (command) => {
  const names = {
    join: '新加入计划申请',
    terminate: '终止参与计划申请',
    transfer: '调职申请', 
    salary: '薪资调整申请'
  }
  return names[command] || '未知'
}
</script>

<style scoped>


.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.search-form {
  margin-bottom: 20px;
  padding: 20px;
  background-color: #f8f8f8;
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

.upload-demo {
  text-align: center;
}

.upload-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

:deep(.el-upload-dragger) {
  width: 100%;
}

:deep(.el-upload__tip) {
  margin-top: 12px;
  text-align: center;
}
</style> 