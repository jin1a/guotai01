<template>
  <div class="document-statements">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>結單文件</span>
          <el-radio-group v-model="year" size="small">
            <el-radio-button label="2024">2024年</el-radio-button>
            <el-radio-button label="2023">2023年</el-radio-button>
            <el-radio-button label="2022">2022年</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="date" label="日期" width="180" />
        <el-table-column prop="title" label="標題" />
        <el-table-column prop="type" label="類型" width="180">
          <template #default="scope">
            <el-tag>{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">預覽</el-button>
            <el-button size="small" type="primary" @click="handleDownload(scope.row)">
              下載
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const year = ref('2024')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const tableData = ref([
  {
    date: '2024-03-01',
    title: '2024年2月份結單',
    type: '月結單',
    size: '156KB'
  },
  {
    date: '2024-02-01',
    title: '2024年1月份結單',
    type: '月結單',
    size: '148KB'
  },
  {
    date: '2024-01-01',
    title: '2023年年度結單',
    type: '年結單',
    size: '2.5MB'
  }
])

const handleSizeChange = (val) => {
  console.log(`每頁 ${val} 條`)
}

const handleCurrentChange = (val) => {
  console.log(`當前頁: ${val}`)
}

const handleView = (row) => {
  console.log('預覽文件:', row)
}

const handleDownload = (row) => {
  console.log('下載文件:', row)
}
</script>

<style scoped>
.document-statements {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style> 