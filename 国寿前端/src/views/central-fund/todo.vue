<template>
  <div class="todo-list">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>待辦列表</span>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索待辦事項"
              class="search-input"
              clearable
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-table :data="todoList" style="width: 100%">
        <el-table-column prop="type" label="類型" width="120">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.type)">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="標題" />
        <el-table-column prop="deadline" label="截止日期" width="180" />
        <el-table-column prop="status" label="狀態" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" link @click="handleView(scope.row)">
              查看
            </el-button>
            <el-button type="success" link @click="handleProcess(scope.row)">
              處理
            </el-button>
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
import { ref } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

// 模拟数据
const todoList = ref([
  {
    id: 1,
    type: '供款',
    title: '2024年3月供款待確認',
    deadline: '2024-03-31',
    status: '待處理'
  },
  {
    id: 2,
    type: '計劃',
    title: '新增計劃申請審核',
    deadline: '2024-03-25',
    status: '進行中'
  },
  {
    id: 3,
    type: '僱員',
    title: '僱員資料更新確認',
    deadline: '2024-03-28',
    status: '待處理'
  }
])

const getTagType = (type) => {
  const types = {
    '供款': 'warning',
    '計劃': 'success',
    '僱員': 'info'
  }
  return types[type] || 'default'
}

const getStatusType = (status) => {
  const types = {
    '待處理': 'warning',
    '進行中': 'primary',
    '已完成': 'success'
  }
  return types[status] || 'info'
}

const handleView = (row) => {
  ElMessage.info(`查看待辦事項：${row.title}`)
}

const handleProcess = (row) => {
  ElMessage.success(`開始處理：${row.title}`)
}

const handleSizeChange = (val) => {
  pageSize.value = val
  // 重新加载数据
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  // 重新加载数据
}
</script>

<style scoped>
.todo-list {
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.search-input {
  width: 300px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 