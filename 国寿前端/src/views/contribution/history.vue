<template>
  <div class="contribution-history">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>繳費記錄</span>
          <el-button type="primary" @click="exportData">導出記錄</el-button>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="date" label="繳費日期" width="180" />
        <el-table-column prop="amount" label="金額" width="180">
          <template #default="scope">
            {{ scope.row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="method" label="繳費方式" width="180" />
        <el-table-column prop="status" label="狀態">
          <template #default="scope">
            <el-tag :type="scope.row.status === '已完成' ? 'success' : 'warning'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleDownload(scope.row)">
              下載憑證
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

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)

const tableData = ref([
  {
    date: '2024-03-15',
    amount: 5000.00,
    method: '銀行轉賬',
    status: '已完成'
  },
  {
    date: '2024-02-15',
    amount: 5000.00,
    method: '信用卡',
    status: '已完成'
  },
  {
    date: '2024-01-15',
    amount: 5000.00,
    method: '支票',
    status: '處理中'
  }
])

const handleSizeChange = (val) => {
  console.log(`每頁 ${val} 條`)
}

const handleCurrentChange = (val) => {
  console.log(`當前頁: ${val}`)
}

const handleView = (row) => {
  console.log('查看記錄:', row)
}

const handleDownload = (row) => {
  console.log('下載憑證:', row)
}

const exportData = () => {
  console.log('導出記錄')
}
</script>

<style scoped>
.contribution-history {
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