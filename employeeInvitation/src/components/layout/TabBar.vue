<template>
  <van-tabbar v-model="activeTab" @change="handleTabChange" fixed>
    <van-tabbar-item name="home" icon="wap-home-o">首頁</van-tabbar-item>
    <van-tabbar-item name="products" icon="shield-o">產品</van-tabbar-item>
    <van-tabbar-item name="services" icon="like-o">服務</van-tabbar-item>
    <van-tabbar-item name="mine" icon="manager-o">我的</van-tabbar-item>
  </van-tabbar>
</template>

<script>
export default {
  name: 'TabBar',
  data() {
    return {
      activeTab: 'home'
    }
  },
  created() {
    this.setActiveTab()
  },
  watch: {
    // 监听路由变化，更新激活的标签
    '$route': {
      handler: 'setActiveTab',
      immediate: true
    }
  },
  methods: {
    setActiveTab() {
      const routePath = this.$route.path
      switch (routePath) {
        case '/':
          this.activeTab = 'home'
          break
        case '/products':
          this.activeTab = 'products'
          break
        case '/services':
          this.activeTab = 'services'
          break
        case '/mine':
          this.activeTab = 'mine'
          break
        default:
          this.activeTab = 'home'
      }
    },
    handleTabChange(name) {
      switch (name) {
        case 'home':
          this.$router.push('/')
          break
        case 'products':
          this.$router.push('/products')
          break
        case 'services':
          this.$router.push('/services')
          break
        case 'mine':
          this.$router.push('/mine')
          break
      }
    }
  }
}
</script> 