<template>
  <div class="download">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>下載中心</span>
          <div class="header-actions">
            <el-input
              v-model="searchQuery"
              placeholder="搜索文件"
              class="search-input"
              clearable
              @clear="handleSearch"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 表格文件 -->
        <el-tab-pane label="表格文件" name="forms">
          <el-table :data="formsData" style="width: 100%">
            <el-table-column prop="name" label="文件名稱" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="format" label="格式" width="100">
              <template #default="scope">
                <el-tag>{{ scope.row.format }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" width="100" />
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button type="primary" link @click="handleDownload(scope.row)">
                  下載
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 使用指南 -->
        <el-tab-pane label="使用指南" name="guides">
          <el-table :data="guidesData" style="width: 100%">
            <el-table-column prop="name" label="文件名稱" />
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="format" label="格式" width="100">
              <template #default="scope">
                <el-tag type="success">{{ scope.row.format }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="size" label="大小" width="100" />
            <el-table-column label="操作" width="150">
              <template #default="scope">
                <el-button type="primary" link @click="handleDownload(scope.row)">
                  下載
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 常用软件 -->
        <el-tab-pane label="常用軟件" name="software">
          <el-row :gutter="20">
            <el-col v-for="item in softwareData" :key="item.id" :span="8">
              <el-card class="software-card" shadow="hover">
                <div class="software-icon">
                  <el-icon size="40"><component :is="item.icon" /></el-icon>
                </div>
                <h3>{{ item.name }}</h3>
                <p>{{ item.description }}</p>
                <div class="software-info">
                  <span>版本：{{ item.version }}</span>
                  <span>大小：{{ item.size }}</span>
                </div>
                <el-button type="primary" @click="handleDownload(item)">
                  下載
                </el-button>
              </el-card>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 下载进度对话框 -->
    <el-dialog v-model="downloadDialogVisible" title="下載進度" width="400px">
      <div class="download-progress">
        <div class="file-info">
          <span>{{ currentDownload.name }}</span>
          <span>{{ downloadProgress }}%</span>
        </div>
        <el-progress :percentage="downloadProgress" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCancelDownload">取消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Search, Document, Download, Platform } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('forms')
const searchQuery = ref('')
const downloadDialogVisible = ref(false)
const downloadProgress = ref(0)
const currentDownload = ref({})

// 表格文件数据
const formsData = ref([
  {
    id: 1,
    name: '供款申請表',
    description: '用於申請供款的標準表格',
    format: 'PDF',
    size: '156KB'
  },
  {
    id: 2,
    name: '資料變更表',
    description: '用於變更個人資料的表格',
    format: 'DOC',
    size: '89KB'
  },
  {
    id: 3,
    name: '賬戶申請表',
    description: '開立新賬戶使用的申請表',
    format: 'PDF',
    size: '245KB'
  }
])

// 使用指南数据
const guidesData = ref([
  {
    id: 1,
    name: '系統使用手冊',
    description: '詳細的系統操作指南',
    format: 'PDF',
    size: '2.5MB'
  },
  {
    id: 2,
    name: '常見問題解答',
    description: '常見問題和解決方案',
    format: 'PDF',
    size: '1.8MB'
  }
])

// 常用软件数据
const softwareData = ref([
  {
    id: 1,
    name: 'PDF閱讀器',
    description: '用於查看PDF文件的軟件',
    version: '2.5.0',
    size: '45MB',
    icon: Document
  },
  {
    id: 2,
    name: '電子簽名工具',
    description: '用於文件電子簽名的工具',
    version: '1.2.1',
    size: '28MB',
    icon: Platform
  },
  {
    id: 3,
    name: '文件壓縮工具',
    description: '用於壓縮和解壓文件',
    version: '3.1.0',
    size: '32MB',
    icon: Download
  }
])

const handleSearch = () => {
  console.log('搜索:', searchQuery.value)
}

const handleDownload = (file) => {
  currentDownload.value = file
  downloadDialogVisible.value = true
  downloadProgress.value = 0
  
  // 模拟下载进度
  const timer = setInterval(() => {
    downloadProgress.value += 10
    if (downloadProgress.value >= 100) {
      clearInterval(timer)
      downloadDialogVisible.value = false
      ElMessage.success('下載完成')
    }
  }, 300)
}

const handleCancelDownload = () => {
  downloadDialogVisible.value = false
  ElMessage.info('已取消下載')
}
</script>

<style scoped>
.download {
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
}
.search-input {
  width: 300px;
}
.software-card {
  margin-bottom: 20px;
  text-align: center;
}
.software-icon {
  margin: 20px 0;
  color: var(--el-color-primary);
}
.software-info {
  display: flex;
  justify-content: space-around;
  margin: 15px 0;
  color: #606266;
  font-size: 14px;
}
.download-progress {
  padding: 20px;
}
.file-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
</style> 