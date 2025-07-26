<template>
  <div class="company-register">
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
      <div class="register-container">
        <!-- LOGO区域 -->
        <div class="logo-section">
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

        <!-- 欢迎标题 -->
        <h1 class="welcome-title">企業首次登錄設置</h1>
        <p class="welcome-subtitle">請查看您的企業資訊並設置登錄密碼</p>

        <!-- 企业信息展示 -->
        <div class="company-info-section">
          <h2 class="section-title">企業資訊</h2>
          <div class="info-card">
            <div class="info-row">
              <span class="info-label">企業名稱：</span>
              <span class="info-value">{{ companyInfo.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">企業編號：</span>
              <span class="info-value">{{ companyInfo.code }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">聯絡郵箱：</span>
              <span class="info-value">{{ companyInfo.email }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">聯絡電話：</span>
              <span class="info-value">{{ companyInfo.phone }}</span>
            </div>
          </div>
        </div>

        <!-- 计划信息展示 -->
        <div class="plan-info-section">
          <h2 class="section-title">計劃資訊</h2>
          <div class="plan-cards">
            <div 
              v-for="plan in planInfo" 
              :key="plan.id"
              class="plan-card"
              :class="{ active: plan.active }"
            >
              <div class="plan-header">
                <div class="plan-icon" :class="plan.type">
                  <i :class="plan.icon"></i>
                </div>
                <div class="plan-name">{{ plan.name }}</div>
              </div>
              <div class="plan-details">
                <div class="plan-detail">
                  <span class="detail-label">計劃編號：</span>
                  <span class="detail-value">{{ plan.planCode }}</span>
                </div>
                <div class="plan-detail">
                  <span class="detail-label">參與員工：</span>
                  <span class="detail-value">{{ plan.employeeCount }}人</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户设置表单 -->
        <div class="user-setup-section">
          <h2 class="section-title">設置登錄資訊</h2>
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            :rules="registerRules"
            class="register-form"
            label-position="top"
          >
            <el-form-item label="用戶名" prop="username">
              <el-input
                v-model="registerForm.username"
                placeholder="請輸入用戶名（4-20個字符）"
                class="form-input"
                maxlength="20"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="登錄密碼" prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="請輸入密碼（至少8位，包含數字和字母）"
                class="form-input"
                show-password
                maxlength="50"
              />
            </el-form-item>

            <el-form-item label="確認密碼" prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="請再次輸入密碼"
                class="form-input"
                show-password
                maxlength="50"
              />
            </el-form-item>

            <!-- 协议同意 -->
            <div class="agreement-section">
              <el-checkbox v-model="registerForm.agree" class="agree-checkbox">
                我已閱讀並同意
                <span class="agreement-text">
                  <a href="#" class="agreement-link">《用戶服務協議》</a>、
                  <a href="#" class="agreement-link">《個人資料政策》</a>、
                  <a href="#" class="agreement-link">《收集個人資料聲明》</a>
                </span>
              </el-checkbox>
            </div>

            <!-- 提交按钮 -->
            <el-form-item>
              <el-button
                type="primary"
                class="submit-button"
                :loading="loading"
                @click="handleRegister"
              >
                {{ loading ? '設置中...' : '完成設置' }}
              </el-button>
            </el-form-item>
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

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElForm, ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { rsaEncrypt } from '@/utils/encrypt'
import { useUserStore } from '@/stores/user'
import { 
  getCompanyInfoByToken, 
  getPlanInfoByCompany, 
  validateEmailToken, 
  generateUserData 
} from '@/utils/mockData'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const registerFormRef = ref()
const loading = ref(false)

// 企业和计划信息数据
const companyInfo = reactive({})
const planInfo = reactive([])

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  agree: false
})

// 表单验证规则
const registerRules = {
  username: [
    { required: true, message: '請輸入用戶名', trigger: 'blur' },
    { min: 4, max: 20, message: '用戶名長度為4-20個字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用戶名只能包含字母、數字、下劃線和中文', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 8, message: '密碼至少8位字符', trigger: 'blur' },
    { 
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/, 
      message: '密碼必須包含至少一個字母和一個數字', 
      trigger: 'blur' 
    }
  ],
  confirmPassword: [
    { required: true, message: '請確認密碼', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('兩次輸入密碼不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 验证邮箱token并加载企业数据
const verifyEmailToken = () => {
  const token = route.query.token || route.query.demo
  if (!token) {
    ElMessage.error('無效的註冊鏈接')
    router.push('/login')
    return false
  }
  
  // 验证token有效性
  const tokenResult = validateEmailToken(token === 'true' ? 'demo' : token)
  if (!tokenResult.valid) {
    ElMessage.error('註冊鏈接已過期或無效')
    router.push('/login')
    return false
  }
  
  // 加载企业信息
  const company = getCompanyInfoByToken(token === 'true' ? 'demo' : token)
  Object.assign(companyInfo, company)
  
  // 加载计划信息
  const plans = getPlanInfoByCompany(company.code)
  planInfo.splice(0, planInfo.length, ...plans)
  
  console.log('验证token成功:', token)
  console.log('企业信息:', company)
  console.log('计划信息:', plans)
  
  return true
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    // 表单验证
    await registerFormRef.value.validate()
    
    // 检查协议同意
    if (!registerForm.agree) {
      ElMessage.warning('請同意用戶服務協議')
      return
    }
    
    loading.value = true
    
    // 模拟注册请求
    const encryptedPassword = rsaEncrypt(registerForm.password)
    
    // 模拟API调用延时
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 生成用户数据
    const userData = generateUserData(registerForm, companyInfo)
    
    // 存储到localStorage和store
    localStorage.setItem('token', userData.token)
    userStore.$patch({
      token: userData.token,
      userInfo: userData.userInfo
    })
    
    ElMessage.success('企業賬戶設置成功！歡迎使用中國人壽企業服務系統')
    
    // 跳转到仪表盘
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
    
  } catch (error) {
    console.error('註冊失敗:', error)
    ElMessage.error('設置失敗，請重試')
  } finally {
    loading.value = false
  }
}

// 组件挂载时验证token
onMounted(() => {
  if (!verifyEmailToken()) {
    return
  }
  
  // 可以根据token获取具体的企业信息
  // 这里使用模拟数据
})
</script>

<style scoped>
/* 整体布局 */
.company-register {
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
  justify-content: center;
  padding: 40px 20px;
}

.register-container {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 800px;
  width: 100%;
}

/* LOGO区域 */
.logo-section {
  text-align: center;
  margin-bottom: 30px;
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

/* 标题区域 */
.welcome-title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
}

.welcome-subtitle {
  text-align: center;
  font-size: 16px;
  color: #666;
  margin-bottom: 40px;
}

/* 节标题 */
.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #2C8976;
}

/* 企业信息区域 */
.company-info-section {
  margin-bottom: 40px;
}

.info-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border-left: 4px solid #2C8976;
}

.info-row {
  display: flex;
  margin-bottom: 16px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-weight: 500;
  color: #555;
  min-width: 100px;
}

.info-value {
  color: #333;
  font-weight: 500;
}

/* 计划信息区域 */
.plan-info-section {
  margin-bottom: 40px;
}

.plan-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.plan-card {
  background: #fff;
  border: 2px solid #e5e5e5;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.3s ease;
}

.plan-card.active {
  border-color: #2C8976;
  box-shadow: 0 4px 12px rgba(44, 137, 118, 0.15);
}

.plan-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.plan-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.plan-icon.central {
  background: #2C8976;
}

.plan-icon.private {
  background: #F39800;
}

.plan-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.plan-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: #666;
  font-size: 14px;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.detail-value.status.active {
  color: #2C8976;
}

.detail-value.status.pending {
  color: #F39800;
}

/* 用户设置区域 */
.user-setup-section {
  margin-bottom: 20px;
}

.register-form {
  max-width: 500px;
  margin: 0 auto;
}

.form-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #dcdfe6;
  padding: 12px 16px;
  font-size: 16px;
  background: #fff;
}

.form-input :deep(.el-input__wrapper:hover) {
  border-color: #2C8976;
}

.form-input :deep(.el-input__wrapper.is-focus) {
  border-color: #2C8976;
  box-shadow: 0 0 0 2px rgba(44, 137, 118, 0.1);
}

/* 协议区域 */
.agreement-section {
  margin: 24px 0;
}

.agree-checkbox :deep(.el-checkbox__label) {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.agree-checkbox :deep(.el-checkbox__inner) {
  border-radius: 4px;
  border-color: #2C8976;
}

.agree-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #2C8976;
  border-color: #2C8976;
}

.agreement-text {
  color: #666;
}

.agreement-link {
  color: #F39800;
  text-decoration: none;
}

.agreement-link:hover {
  text-decoration: underline;
}

/* 提交按钮 */
.submit-button {
  width: 100%;
  height: 50px;
  background: #ffb700;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  color: white;
}

.submit-button:hover {
  background: #e6a300;
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
  .register-container {
    padding: 20px;
    margin: 0 10px;
  }
  
  .plan-cards {
    grid-template-columns: 1fr;
  }
  
  .logo-container {
    flex-direction: column;
    gap: 15px;
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
}
</style>