<template>
  <div class="error-page">
    <div class="error-content">
      <div class="error-image">
        <el-icon size="120" color="#409eff">
          <Warning />
        </el-icon>
      </div>
      
      <div class="error-info">
        <h1>404</h1>
        <h2>页面不存在</h2>
        <p>抱歉，您访问的页面不存在或已被删除</p>
        
        <div class="error-actions">
          <el-button type="primary" @click="goHome">
            <el-icon><House /></el-icon>
            返回首页
          </el-button>
          <el-button @click="goBack">
            <el-icon><Back /></el-icon>
            返回上页
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/dashboard')
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}
</script>

<style scoped>
.error-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.error-content {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.error-image {
  margin-bottom: 30px;
}

.error-info h1 {
  font-size: 72px;
  font-weight: bold;
  color: #409eff;
  margin: 0 0 10px 0;
}

.error-info h2 {
  font-size: 24px;
  color: #333;
  margin: 0 0 15px 0;
}

.error-info p {
  color: #666;
  font-size: 16px;
  margin: 0 0 30px 0;
}

.error-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

@media (max-width: 768px) {
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .error-info h1 {
    font-size: 48px;
  }
}
</style> 