<template>
  <div class="services">
    <van-nav-bar
      title="服務"
      left-arrow
      @click-left="onClickLeft"
    />
    
    <!-- 底部导航栏 -->
    <tab-bar />
  </div>
</template>

<script>
import TabBar from '@/components/layout/TabBar.vue'

export default {
  name: 'Services',
  components: {
    TabBar
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1)
    }
  }
}
</script>

<style lang="scss" scoped>
.services {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 50px;
}
</style> 