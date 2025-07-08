<template>
  <div class="china-life-login">
    <!-- 顶部导航 -->
    <div class="top-nav">
      <span class="nav-text">中國人壽（海外）- 香港</span>
      <div class="language-switch">
        <el-icon class="globe-icon"><Globe /></el-icon>
        <span>繁體</span>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 登录卡片容器 -->
      <div class="login-card">
        <!-- LOGO区域 -->
        <div class="logo-section">
          <!-- 完整LOGO图片或默认设计 -->
          <div v-if="logoImageUrl" class="full-logo-container">
            <img :src="logoImageUrl" alt="中國人壽海外" class="full-logo-image" @error="handleImageError" />
          </div>
          <div v-else class="default-logo-container">
            <div class="logo-container">
              <div class="logo-circle">
                <div class="logo-icon">C</div>
              </div>
              <div class="logo-text">
                <div class="brand-line">
                  <span class="brand-name">中國人壽</span>
                  <span class="brand-sub">海外</span>
                </div>
                <div class="brand-english">CHINA LIFE</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 登录表单区域 -->
        <div class="login-section">
        <h1 class="welcome-title">歡迎登入</h1>

        <!-- 登录表单 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @keyup.enter="handleLogin"
        >
                      <!-- 登录方式选择 -->
            <div class="login-method">
              <el-dropdown trigger="click" @command="handleLoginMethodChange">
                <span class="login-method-trigger">
                  {{ loginMethod === 'email' ? '電郵密碼登錄' : '用戶名登錄' }}
                  <el-icon class="el-icon--right"><arrow-down /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="email">電郵密碼登錄</el-dropdown-item>
                    <el-dropdown-item command="username">用戶名登錄</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              placeholder="請輸入電郵"
              class="login-input"
              prefix-icon="Message"
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="請輸入密碼"
              class="login-input"
              prefix-icon="Lock"
              show-password
            />
          </el-form-item>
          
          <!-- 同意条款 -->
          <div class="agreement-section">
            <el-checkbox v-model="loginForm.agree" class="agree-checkbox">
              同意
              <span class="agreement-text">
                <a href="#" class="agreement-link">《用戶服務協議》</a>、
                <a href="#" class="agreement-link">《個人資料政策》</a>、
                <a href="#" class="agreement-link">《收集個人資料聲明》</a>。
              </span>
            </el-checkbox>
          </div>

          <!-- 忘记密码 -->
          <div class="forgot-password">
            <a href="#" class="forgot-link">忘記密碼</a>
          </div>
          
          <!-- 登录按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              class="login-button"
              :loading="userStore.loading"
              @click="handleLogin"
            >
              {{ userStore.loading ? '登錄中...' : '登錄' }}
            </el-button>
          </el-form-item>

          <!-- 计划开通账号 -->
          <div class="register-section">
            <a href="#" class="register-link">計劃開通賬號 ></a>
          </div>
        </el-form>
        </div>
      </div>
    </div>

    <!-- 底部信息 -->
    <footer class="footer">
      <div class="footer-links">
        <a href="#" class="footer-link">聯絡我們</a>
        <a href="#" class="footer-link">使用條款</a>
        <a href="#" class="footer-link">網上保安</a>
        <a href="#" class="footer-link">個人資料收集</a>
        <a href="#" class="footer-link">收集個人資料聲明</a>
        <a href="#" class="footer-link">網上用戶指南</a>
      </div>
      <div class="footer-info">
        <div class="copyright">
          中國人壽保險(海外)股份有限公司 (於中華人民共和國註冊成立之股份有限公司) © 2024 版權所有
        </div>
        <div class="contact-info">
          <el-icon class="phone-icon"><Phone /></el-icon>
          <span class="hotline">香港服務熱線 (852) 3999 5519</span>
          <div class="social-icons">
            <el-icon class="social-icon"><Connection /></el-icon>
            <el-icon class="social-icon"><Search /></el-icon>
            <el-icon class="social-icon"><ChatDotRound /></el-icon>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElForm, ElMessage } from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getImageUrl } from '@/utils/image'
import { useRouter } from 'vue-router'
import type { FormRules } from 'element-plus'

// 扩展登录表单类型
interface ChinaLifeLoginForm {
  email: string
  password: string
  agree: boolean
}

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref<InstanceType<typeof ElForm>>()
const loginMethod = ref('email')

// LOGO图片支持
const logoImageUrl = ref<string>('')

// 尝试加载LOGO图片
const tryLoadLogo = () => {
  try {
    // 使用 titile.png 作为LOGO图片
    logoImageUrl.value = getImageUrl('titile.png')
  } catch (error) {
    // 如果图片不存在，logoImageUrl保持为空，会显示默认的圆形LOGO
    console.log('LOGO图片未找到，使用默认LOGO')
  }
}

// 图片加载错误处理
const handleImageError = () => {
  logoImageUrl.value = ''
  console.log('LOGO图片加载失败，切换到默认LOGO')
}

// 处理登录方式变更
const handleLoginMethodChange = (command: string) => {
  loginMethod.value = command
}

// 初始化时尝试加载LOGO
tryLoadLogo()

// 登录表单数据
const loginForm = reactive<ChinaLifeLoginForm>({
  email: 'admin@example.com',
  password: '123456',
  agree: false
})

// 表单验证规则
const loginRules: FormRules = {
  email: [
    { required: true, message: '請輸入電郵', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的電郵格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, max: 20, message: '密碼長度在 6 到 20 個字符', trigger: 'blur' }
  ]
}

// 登录处理
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  if (!loginForm.agree) {
    ElMessage.warning('請同意用戶服務協議')
    return
  }
  
  try {
    await loginFormRef.value.validate()
    // 模拟登录成功，设置 token
    localStorage.setItem('token', 'fake-token')
    userStore.$patch({
      token: 'fake-token',
      userInfo: {
        id: 1,
        username: loginForm.email,
        nickname: '测试用户',
        role: 'admin',
        permissions: ['*'],
        createTime: new Date().toISOString()
      }
    })
    ElMessage.success('登錄成功')
    // 直接跳转到仪表盘
    router.push('/dashboard')
  } catch (error) {
    console.error('表單驗證失敗:', error)
    ElMessage.error('表單驗證失敗')
  }
}
</script>

<style scoped>
/* 整体布局 */
.china-life-login {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e5e5;
}

.nav-text {
  color: #666;
  font-size: 14px;
}

.language-switch {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

.globe-icon {
  font-size: 16px;
}

/* 主要内容区 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  width: 100%;
}

/* LOGO区域 */
.logo-section {
  margin-bottom: 20px;
  text-align: center;
}

/* 登录卡片容器 */
.login-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  width: 100%;
}

/* 完整LOGO图片样式 */
.full-logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
}

.full-logo-image {
  height: 60px;
  width: auto;
  max-width: 300px;
  object-fit: contain;
}

/* 默认LOGO样式 */
.default-logo-container {
  margin-bottom: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.logo-circle {
  width: 48px;
  height: 48px;
  background: #00a86b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-icon {
  color: white;
  font-size: 28px;
  font-weight: bold;
  font-family: Arial, sans-serif;
}

.logo-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.brand-line {
  display: flex;
  align-items: center;
  gap: 4px;
  line-height: 1;
}

.brand-name {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  letter-spacing: 1px;
}

.brand-sub {
  font-size: 22px;
  color: #00a86b;
  font-weight: bold;
  letter-spacing: 1px;
}

.brand-english {
  font-size: 11px;
  color: #999;
  font-weight: normal;
  letter-spacing: 2px;
  margin-top: -2px;
}



/* 登录区域 */
.login-section {
  width: 100%;
  position: relative;
}

.welcome-title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 30px;
  margin-top: 10px;
}

/* 登录方式选择 */
.login-method {
  margin-bottom: 25px;
  width: 397px;
}

.method-select {
  width: 100%;
}

.method-select {
  position: relative;
}

.login-method {
  margin-bottom: 25px;
}

.login-method-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #333333;
  font-weight: 500;
  cursor: pointer;
  padding: 12px 0;
}

.el-dropdown {
  width: 100%;
}

:deep(.el-dropdown-menu) {
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border: none;
  padding: 8px 0;
  background: #FFFFFF;
  min-width: 397px;
}

:deep(.el-dropdown-menu__item) {
  height: 48px;
  line-height: 48px;
  padding: 0 16px;
  font-size: 16px;
  color: #333333;
  display: flex;
  align-items: center;
}

:deep(.el-dropdown-menu__item:hover),
:deep(.el-dropdown-menu__item:focus) {
  background: #F5F5F5;
  color: #333333;
}

/* 登录表单 */
.login-form {
  background: none;
  width: 100%;
  box-shadow:none
}

.login-input :deep(.el-input__wrapper) {
  box-sizing: border-box;
  border: 1px solid #F0F0F0;
  box-shadow: none;
  padding: 15px 16px;
  font-size: 16px;
  background: #FFFFFF;
  border-radius: 8px;
  width: 397px;
  height: 48px; 
}

.login-input :deep(.el-input__wrapper:hover) {
  background: #FFFFFF;
}

.login-input :deep(.el-input__wrapper.is-focus) {
 background: #FFFFFF;
  box-shadow: none;
}

.login-input :deep(.el-input__inner) {
  font-size: 16px;
  color: #333;
}

.login-input :deep(.el-input__inner::placeholder) {
 background: #FFFFFF;
}

/* 同意条款区域 */
.agreement-section {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 1.4;
}

.agree-checkbox :deep(.el-checkbox__label) {
  color: #666;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.agree-checkbox :deep(.el-checkbox__inner) {
  border-radius: 50%;
  width: 20px;
  height: 20px;
  border-color: #ccc;
  background-color: #fff;
}

.agree-checkbox :deep(.el-checkbox__inner::after) {
  height: 8px;
  left: 7px;
  top: 4px;
}

.agree-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #2C8976;
  border-color: #2C8976;
}

.agreement-text {
  color: #666;
  line-height: 1.4;
}

.agreement-link {
  color: #F39800;
  text-decoration: underline;
}

.agreement-link:hover {
  color: #F39800;
  text-decoration: underline;
}

/* 忘记密码 */
.forgot-password {
  text-align: left;
}

.forgot-link {
  color: #F39800;
  text-decoration: none;
  font-size: 14px;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* 登录按钮 */
.login-button {
  width: 100%;
  height: 50px;
  background: #ffb700;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  cursor: pointer;
}

.login-button:hover {
  background: #e6a300;
}

.login-button.is-loading {
  background: #ffb700;
  opacity: 0.8;
}

/* 注册链接 */
.register-section {
  text-align: center;
}

.register-link {
  color: #ffb700;
  text-decoration: none;
  font-size: 14px;
}

.register-link:hover {
  text-decoration: underline;
}

/* 底部信息 */
.footer {
  background: #999999;
  padding: 12px 40px;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-links {
  display: flex;
  gap: 24px;
  padding-bottom: 8px;
}

.footer-link {
  color: #FFFFFF;
  text-decoration: none;
  font-size: 12px;
  position: relative;
}

.footer-link:not(:last-child)::after {
  content: "";
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
}

.footer-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  color: #FFFFFF;
  font-size: 12px;
  opacity: 0.8;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.hotline {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #FFFFFF;
  font-size: 14px;
}

.phone-icon {
  color: #FFFFFF;
  font-size: 16px;
}

.social-icons {
  display: flex;
  gap: 16px;
}

.social-icon {
  color: #FFFFFF;
  font-size: 20px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.social-icon:hover {
  opacity: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .top-nav {
    padding: 10px 15px;
  }
  
  .main-content {
    padding: 20px 15px;
  }
  
  .login-card {
    padding: 30px 20px;
    margin: 0 10px;
  }
  
  .logo-container {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .logo-text {
    align-items: center;
  }
  
  .brand-line {
    justify-content: center;
  }
  
  .welcome-title {
    font-size: 24px;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .contact-info {
    flex-direction: column;
    gap: 10px;
  }
}

/* 表单项间距调整 */
.login-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.login-form :deep(.el-form-item__content) {
  line-height: 1;
}

/* 同意条款区域调整 */
.agreement-section {
  margin: 16px 0;
}

/* 忘记密码区域调整 */
.forgot-password {
  margin: 12px 0 24px 0;
}

/* 注册区域调整 */
.register-section {
  margin-top: 16px;
}
</style> 