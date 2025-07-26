<template>
  <el-container class="layout-container">
    <!-- 顶部导航 -->
    <el-header class="header" height="92">
      <div class="header-left">
        <div class="region-selector">
          <span>中國人壽（海外）-澳門</span>
          <el-icon class="el-icon--right"><CaretBottom /></el-icon>
        </div>
      </div>
      <div class="header-right">
        <span class="login-time">上次登入：2024年06月19日 15:19（澳門時間）</span>
        <span class="separator">|</span>
        <span class="user-status">會員(成功)</span>
        <el-button link class="icon-button">
          <el-icon><Setting /></el-icon>
        </el-button>
        <el-button link class="icon-button">
          <el-icon><Monitor /></el-icon>
        </el-button>
      </div>
    </el-header>

    <!-- Logo区域 -->
    <div class="logo-bar">
      <div class="logo">
        <img src="@/assets/images/titile.png" alt="中國人壽海外" class="logo-image" />
      </div>
      <div class="language-switch">
        <span class="text">陳大文</span>
        <el-icon><CaretBottom /></el-icon>
      </div>
    </div>

    <!-- 主要内容区 -->
    <el-container class="main-container">
      <!-- 侧边栏 -->
      <el-aside width="240px" class="sidebar">
        <el-menu
          :default-active="$route.path"
          :unique-opened="true"
          router
          class="sidebar-menu"
        >
          <template v-for="item in menus" :key="item.path">
            <!-- 一级菜单 -->
            <el-sub-menu v-if="item.children" :index="item.path" class="menu-item">
              <template #title>
                <el-icon>
                  <component :is="item.meta.icon" />
                </el-icon>
                <span>{{ item.meta.title }}</span>
              </template>
              
              <!-- 二级菜单 -->
              <template v-for="subItem in item.children" :key="item.path + '/' + subItem.path">
                <!-- 有子菜单的二级菜单 -->
                <el-sub-menu v-if="subItem.children" :index="item.path + '/' + subItem.path" class="menu-item">
                  <template #title>{{ subItem.meta.title }}</template>
                  <!-- 三级菜单 -->
                  <el-menu-item 
                    v-for="child in subItem.children"
                    :key="item.path + '/' + subItem.path + '/' + child.path"
                    :index="item.path + '/' + subItem.path + '/' + child.path"
                    class="menu-item"
                  >
                    {{ child.meta.title }}
                  </el-menu-item>
                </el-sub-menu>
                
                <!-- 没有子菜单的二级菜单 -->
                <el-menu-item 
                  v-else
                  :index="item.path + '/' + subItem.path"
                  class="menu-item"
                >
                  {{ subItem.meta.title }}
                </el-menu-item>
              </template>
            </el-sub-menu>

            <!-- 没有子菜单的一级菜单 -->
            <el-menu-item v-else :index="item.path" class="menu-item">
              <el-icon>
                <component :is="item.meta.icon" />
              </el-icon>
              <template #title>{{ item.meta.title }}</template>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>

      <!-- 主内容 -->
<el-main class="main-content">
  <!-- 面包屑导航 -->
  <el-card v-if="route.path !== '/dashboard'" class="breadcrumb-card" shadow="never">
    <el-breadcrumb class="breadcrumb" separator="/">
      <template v-if="currentMenu">
        <!-- 一级菜单 -->
              <el-breadcrumb-item :to="currentMenu.path">
                {{ currentMenu.meta?.title }}
              </el-breadcrumb-item>
              <!-- 二级菜单 -->
              <el-breadcrumb-item 
                v-if="currentSubmenu"
                :to="currentMenu.path + '/' + currentSubmenu.path"
              >
                {{ currentSubmenu.meta?.title }}
              </el-breadcrumb-item>
              <!-- 三级菜单 -->
              <el-breadcrumb-item 
                v-if="currentThirdMenu"
              >
                {{ currentThirdMenu.meta?.title }}
              </el-breadcrumb-item>
            </template>
          </el-breadcrumb>
        </el-card>

        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>

    <!-- 底部 -->
    <el-footer height="auto" class="footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="#">聯絡我們</a>
          <a href="#">使用條款</a>
          <a href="#">網上保安</a>
          <a href="#">個人資料收集</a>
          <a href="#">收集個人資料聲明</a>
          <a href="#">網上用戶指南</a>
        </div>
        <div class="footer-info">
          <div class="copyright">
            中國人壽保險(海外)股份有限公司 (於中華人民共和國註冊成立之股份有限公司) © 2024 版權所有
          </div>
          <div class="contact">
            <span class="hotline">
              <el-icon><Phone /></el-icon>
              香港服務熱線 (852) 3999 5519
            </span>
            <div class="social-icons">
              <el-icon><Connection /></el-icon>
              <el-icon><Search /></el-icon>
              <el-icon><ChatDotRound /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </el-footer>
  </el-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { menus } from '@/router/menus'
import {
  Setting,
  Monitor,
  CaretBottom,
  Phone,
  Connection,
  Search,
  ChatDotRound
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)

// 当前菜单项
const currentMenu = computed(() => {
  const paths = route.path.split('/').filter(Boolean)
  if (paths.length > 0) {
    return menus.find(item => item.path === '/' + paths[0])
  }
  return null
})

// 当前二级菜单项
const currentSubmenu = computed(() => {
  const paths = route.path.split('/').filter(Boolean)
  if (paths.length > 1 && currentMenu.value?.children) {
    return currentMenu.value.children.find(item => item.path === paths[1])
  }
  return null
})

// 当前三级菜单项
const currentThirdMenu = computed(() => {
  const paths = route.path.split('/').filter(Boolean)
  if (paths.length > 2 && currentSubmenu.value?.children) {
    return currentSubmenu.value.children.find(item => item.path === paths[2])
  }
  return null
})

// 获取用户信息 - 暂时禁用
onMounted(() => {
  // 暂时不获取用户信息，避免登录检测
  // if (userStore.token && !userStore.userInfo) {
  //   userStore.getUserInfo()
  // }
})

// 处理退出登录
const handleLogout = () => {
  // 暂时不处理退出登录
  // userStore.logout()
  // router.push('/login')
  
  // 可以简单地跳转到登录页
  router.push('/login')
}
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.header {
  background: #f8f8f8;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 48px;
  height: 40px;
  line-height: 40px;
  color: #666;
  font-size: 13px;
}

.region-selector {
  color: #333;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.region-selector .el-icon {
  font-size: 12px;
  color: #999;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.separator {
  color: #e0e0e0;
  margin: 0 8px;
}

.icon-button {
  color: #666;
  font-size: 16px;
  padding: 0 8px;
}

.icon-button:hover {
  color: #2C8976;
}

/* Logo区域 */
.logo-bar {
  height: 92px;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 48px;
  border-bottom: 1px solid #e6e6e6;
}

.logo-image {
  height: 32px;
}

.language-switch {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
}

.language-switch .el-icon {
  font-size: 12px;
  color: #999;
}

/* 主容器 */
.main-container {
  flex: 1;
  background: #f5f5f5;
}

/* 侧边栏 */
.sidebar {
  background: #fff;
  border-right: 1px solid #e6e6e6;
  padding: 16px 0;
  margin: 10px 0px 10px 40px;
  width: 260px !important;
  border-radius: 10px;
  height: 100%;
}

.sidebar-menu {
  border: none;
}

:deep(.el-menu) {
  border-right: none;
}

/* 侧边栏菜单样式 */
:deep(.el-menu-item), :deep(.el-sub-menu__title) {
  height: 50px;
  line-height: 26px;
  padding: 12px 24px !important;
  margin: 4px 16px;
  border-radius: 8px;
  position: relative;
  font-size: 18px;
  font-weight: bold;
}

/* 一级菜单图标样式 */
:deep(.el-menu-item .el-icon), 
:deep(.el-sub-menu__title .el-icon):not(.el-sub-menu__icon-arrow) {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  margin: 0;
  font-size: 18px;
}

/* 确保文字对齐 */
:deep(.el-menu-item), :deep(.el-sub-menu__title) {
  padding-left: 52px !important;
  display: flex;
  align-items: center;
}

/* 箭头样式 */
:deep(.el-sub-menu__icon-arrow) {
  position: absolute;
  right: 24px;
  margin-top: -6px;
}

/* 二级菜单样式 */
:deep(.el-sub-menu .el-menu-item), 
:deep(.el-sub-menu .el-sub-menu__title) {
  padding-left: 56px !important;
  margin: 4px 16px;
}

/* 三级菜单样式 */
:deep(.el-sub-menu .el-sub-menu .el-menu-item) {
  padding-left: 88px !important;
  margin: 4px 16px;
}

/* 菜单激活和悬停状态 */
:deep(.el-menu-item.is-active) {
  background-color: #2C8976 !important;
  color: #fff !important;
}

:deep(.el-menu-item:hover), :deep(.el-sub-menu__title:hover) {
  background-color: #f5f5f5;
}

:deep(.el-sub-menu.is-active) > .el-sub-menu__title {
  background-color: #2C8976 !important;
  color: #fff !important;
}

:deep(.el-sub-menu .el-sub-menu.is-active) > .el-sub-menu__title {
  background-color: #f5f5f5 !important;
  color: #2C8976 !important;
}

:deep(.el-sub-menu.is-active .el-menu-item.is-active) {
  background-color: #f5f5f5 !important;
  color: #2C8976 !important;
}

:deep(.el-sub-menu.is-active .el-menu-item.is-active)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background-color: #2C8976;
  border-radius: 2px;
}

:deep(.el-menu--inline) {
  background-color: #f8f8f8;
  margin: 0 4px;
  border-radius: 4px;
}

/* 主内容区 */
.main-content {
  background: #f5f5f5;
  padding: 24px;
}

/* 底部 */
.footer {
  background: #999999;
  padding: 24px;
  color: #fff;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-links {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.footer-links a {
  color: #fff;
  text-decoration: none;
  font-size: 14px;
}

.footer-links a:hover {
  text-decoration: underline;
}

.footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.contact {
  display: flex;
  align-items: center;
  gap: 24px;
}

.hotline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.social-icons {
  display: flex;
  gap: 16px;
}

.social-icons .el-icon {
  font-size: 20px;
  cursor: pointer;
}

/* 路由切换动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* 面包屑卡片样式 */
.breadcrumb-card {
  margin-bottom: 24px;
  background-color: #F5F7FA;
}

:deep(.el-card__body) {
  padding: 16px 24px !important;
}

/* 面包屑样式 */
.breadcrumb {
  font-size: 18px;
}

:deep(.el-breadcrumb__item) {
  display: inline-flex;
  align-items: center;
}

:deep(.el-breadcrumb__inner) {
  color: #666666;
  font-weight: normal;
}

:deep(.el-breadcrumb__inner.is-link:hover) {
  color: #F39800;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #333333;
  font-weight: bold;
}

:deep(.el-breadcrumb__separator) {
  margin: 0 12px;
  color: #666666;
}
</style> 