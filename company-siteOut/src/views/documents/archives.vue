<template>
  <div class="document-archives">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>檔案管理</span>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索檔案"
              class="search-input"
              clearable
              @clear="handleSearch"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleUpload">
              <el-icon><Upload /></el-icon>上傳檔案
            </el-button>
          </div>
        </div>
      </template>
      
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="檔案名稱" />
        <el-table-column prop="category" label="分類" width="150">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.category)">
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="上傳時間" width="180" />
        <el-table-column prop="size" label="大小" width="120" />
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleDownload(scope.row)">
              下載
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">
              刪除
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

    <!-- 上传文件对话框 -->
    <el-dialog v-model="uploadDialogVisible" title="上傳檔案" width="500px">
      <el-upload
        class="upload-demo"
        drag
        action="/api/upload"
        multiple
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          將文件拖到此處，或<em>點擊上傳</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持任意類型文件，單個文件不超過10MB
          </div>
        </template>
      </el-upload>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="uploadDialogVisible = false">
            完成
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Upload, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(100)
const uploadDialogVisible = ref(false)

const tableData = ref([
  {
    name: '保單文件.pdf',
    category: '保單',
    uploadTime: '2024-03-15 14:30',
    size: '2.5MB'
  },
  {
    name: '身份證明.jpg',
    category: '證件',
    uploadTime: '2024-03-14 09:15',
    size: '1.2MB'
  },
  {
    name: '銀行賬單.pdf',
    category: '財務',
    uploadTime: '2024-03-13 16:45',
    size: '856KB'
  }
])

const getTagType = (category) => {
  const types = {
    '保單': '',
    '證件': 'success',
    '財務': 'warning'
  }
  return types[category] || 'info'
}

const handleSearch = () => {
  console.log('搜索:', searchQuery.value)
}

const handleSizeChange = (val) => {
  console.log(`每頁 ${val} 條`)
}

const handleCurrentChange = (val) => {
  console.log(`當前頁: ${val}`)
}

const handleView = (row) => {
  console.log('查看文件:', row)
}

const handleDownload = (row) => {
  console.log('下載文件:', row)
}

const handleDelete = (row) => {
  ElMessage.success('文件已刪除')
  console.log('刪除文件:', row)
}

const handleUpload = () => {
  uploadDialogVisible.value = true
}

const handleUploadSuccess = (response, file) => {
  ElMessage.success(`${file.name} 上傳成功`)
}

const handleUploadError = (error, file) => {
  ElMessage.error(`${file.name} 上傳失敗`)
}
</script>

<style scoped>
.document-archives {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}
.search-input {
  width: 300px;
}
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
.upload-demo {
  width: 100%;
}
</style> 