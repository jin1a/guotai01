<template>
  <div class="private-fund">
    <el-card class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>澳門私退金</span>
        </div>
      </template>
      <div class="welcome-content">
        <el-empty description="功能開發中，敬請期待..." />
      </div>
    </el-card>
  </div>
</template>

<script setup>
// 暂时不需要任何逻辑
</script>

<style scoped>
.private-fund {
  padding: 20px;
}

.welcome-card {
  min-height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
</style> 