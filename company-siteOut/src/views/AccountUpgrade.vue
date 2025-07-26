<template>
  <div class="account-upgrade">
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
      <div class="upgrade-container">
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
        <h1 class="welcome-title">賬戶升級設置</h1>
        <p class="welcome-subtitle">檢測到您使用計劃號登錄，請設置用戶名和密碼以升級您的賬戶</p>

        <!-- 当前登录信息 -->
        <div class="current-login-section">
          <h2 class="section-title">當前登錄信息</h2>
          <div class="current-info-card">
            <div class="info-item">
              <el-icon class="info-icon"><User /></el-icon>
              <div class="info-content">
                <span class="info-label">登錄方式：</span>
                <span class="info-value plan-login">計劃號登錄</span>
              </div>
            </div>
            <div class="info-item">
              <el-icon class="info-icon"><Key /></el-icon>
              <div class="info-content">
                <span class="info-label">當前計劃號：</span>
                <span class="info-value">{{ currentPlanCode }}</span>
              </div>
            </div>
          </div>
        </div>

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
            <div class="info-row">
              <span class="info-label">註冊地址：</span>
              <span class="info-value">{{ companyInfo.address }}</span>
            </div>
          </div>
        </div>

        <!-- 关联计划信息展示 -->
        <div class="plans-info-section">
          <h2 class="section-title">關聯計劃資訊</h2>
          <div class="plan-cards">
            <div 
              v-for="plan in allPlans" 
              :key="plan.id"
              class="plan-card"
              :class="{ 
                active: plan.active,
                current: plan.planCode === currentPlanCode
              }"
            >
              <div class="plan-header">
                <div class="plan-icon" :class="plan.type">
                  <i :class="plan.icon"></i>
                </div>
                <div class="plan-info">
                  <div class="plan-name">
                    {{ plan.name }}
                    <el-tag 
                      v-if="plan.planCode === currentPlanCode" 
                      type="warning" 
                      size="small"
                      class="current-tag"
                    >
                      當前登錄
                    </el-tag>
                  </div>
                  <div class="plan-code">{{ plan.planCode }}</div>
                </div>
              </div>
              <div class="plan-details">
                <div class="plan-detail">
                  <span class="detail-label">參與員工：</span>
                  <span class="detail-value">{{ plan.employeeCount }}人</span>
                </div>
                <div class="plan-detail">
                  <span class="detail-label">狀態：</span>
                  <span class="detail-value status" :class="plan.status">
                    {{ plan.statusText }}
                  </span>
                </div>
                <div class="plan-detail">
                  <span class="detail-label">開始日期：</span>
                  <span class="detail-value">{{ plan.startDate }}</span>
                </div>
                <div class="plan-detail">
                  <span class="detail-label">供款比例：</span>
                  <span class="detail-value">
                    雇員{{ plan.contributionRate.employee }} / 雇主{{ plan.contributionRate.employer }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 账号升级表单 -->
        <div class="upgrade-form-section">
          <h2 class="section-title">設置新的登錄資訊</h2>
          <div class="upgrade-notice">
            <el-alert
              title="升級說明"
              type="info"
              :closable="false"
              show-icon
            >
              <template #default>
                <p>升級後您將可以：</p>
                <ul>
                  <li>使用用戶名密碼登錄，無需記住計劃號</li>
                  <li>統一管理企業下的所有計劃</li>
                  <li>享受更完整的企業服務功能</li>
                  <li>獲得更好的安全保護</li>
                </ul>
              </template>
            </el-alert>
          </div>

          <el-form
            ref="upgradeFormRef"
            :model="upgradeForm"
            :rules="upgradeRules"
            class="upgrade-form"
            label-position="top"
          >
            <el-form-item label="新用戶名" prop="username">
              <el-input
                v-model="upgradeForm.username"
                placeholder="請輸入用戶名（4-20個字符）"
                class="form-input"
                maxlength="20"
                show-word-limit
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="新密碼" prop="password">
              <el-input
                v-model="upgradeForm.password"
                type="password"
                placeholder="請輸入密碼（至少8位，包含數字和字母）"
                class="form-input"
                show-password
                maxlength="50"
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="確認密碼" prop="confirmPassword">
              <el-input
                v-model="upgradeForm.confirmPassword"
                type="password"
                placeholder="請再次輸入密碼"
                class="form-input"
                show-password
                maxlength="50"
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 协议同意 -->
            <div class="agreement-section">
              <el-checkbox v-model="upgradeForm.agree" class="agree-checkbox">
                我已閱讀並同意賬戶升級條款，並確認
                <span class="agreement-text">
                  <a href="#" class="agreement-link">《用戶服務協議》</a>、
                  <a href="#" class="agreement-link">《個人資料政策》</a>
                </span>
              </el-checkbox>
            </div>

            <!-- 提交按钮 -->
            <div class="form-actions">
              <el-button
                class="cancel-button"
                @click="handleCancel"
              >
                暫不升級
              </el-button>
              <el-button
                type="primary"
                class="submit-button"
                :loading="loading"
                @click="handleUpgrade"
              >
                {{ loading ? '升級中...' : '確認升級' }}
              </el-button>
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

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElForm, ElMessage, ElMessageBox } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { rsaEncrypt } from '@/utils/encrypt'
import { useUserStore } from '@/stores/user'
import { 
  getCompanyInfoByPlanCode, 
  getAllPlansByCompany, 
  upgradePlanAccount,
  validatePlanCode
} from '@/utils/mockData'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const upgradeFormRef = ref()
const loading = ref(false)

// 当前计划号（从路由参数或用户store获取）
const currentPlanCode = ref('')
// 企业和计划信息数据
const companyInfo = reactive({})
const allPlans = reactive([])

// 升级表单数据
const upgradeForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  agree: false
})

// 表单验证规则
const upgradeRules = {
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
        if (value !== upgradeForm.password) {
          callback(new Error('兩次輸入密碼不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 初始化数据
const initializeData = () => {
  // 获取当前计划号（可以从路由参数、localStorage或用户store获取）
  const planCode = route.query.planCode || localStorage.getItem('currentPlanCode') || 'MPF-HK001-2024'
  currentPlanCode.value = planCode
  
  // 验证计划号
  const planValidation = validatePlanCode(planCode)
  if (!planValidation.valid) {
    ElMessage.error('無效的計劃號')
    router.push('/login')
    return
  }
  
  // 获取企业信息
  const company = getCompanyInfoByPlanCode(planCode)
  Object.assign(companyInfo, company)
  
  // 获取该企业的所有计划
  const plans = getAllPlansByCompany(company.code)
  allPlans.splice(0, allPlans.length, ...plans)
  
  console.log('当前计划号:', planCode)
  console.log('企业信息:', company)
  console.log('所有计划:', plans)
}

// 处理升级
const handleUpgrade = async () => {
  if (!upgradeFormRef.value) return
  
  try {
    // 表单验证
    await upgradeFormRef.value.validate()
    
    // 检查协议同意
    if (!upgradeForm.agree) {
      ElMessage.warning('請同意賬戶升級條款')
      return
    }
    
    // 确认升级操作
    await ElMessageBox.confirm(
      '升級後將無法使用計劃號登錄，只能使用新設置的用戶名密碼登錄。確認要升級嗎？',
      '確認升級',
      {
        confirmButtonText: '確認升級',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    loading.value = true
    
    // 模拟升级API调用
    const encryptedPassword = rsaEncrypt(upgradeForm.password)
    
    // 模拟API调用延时
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 升级账号
    const upgradeResult = upgradePlanAccount(
      currentPlanCode.value,
      upgradeForm.username,
      encryptedPassword,
      companyInfo
    )
    
    // 更新用户store
    localStorage.setItem('token', upgradeResult.token)
    userStore.$patch({
      token: upgradeResult.token,
      userInfo: upgradeResult.userInfo
    })
    
    // 清除旧的计划号登录信息
    localStorage.removeItem('currentPlanCode')
    
    ElMessage.success('賬戶升級成功！歡迎使用新的登錄方式')
    
    // 跳转到仪表盘
    setTimeout(() => {
      router.push('/dashboard')
    }, 1500)
    
  } catch (error) {
    if (error === 'cancel') {
      return // 用户取消升级
    }
    console.error('升級失敗:', error)
    ElMessage.error('升級失敗，請重試')
  } finally {
    loading.value = false
  }
}

// 处理取消/暂不升级
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm(
      '您可以繼續使用計劃號登錄，但建議您盡快升級以獲得更好的服務體驗。確認要暫不升級嗎？',
      '暫不升級',
      {
        confirmButtonText: '繼續使用舊方式',
        cancelButtonText: '我要升級',
        type: 'info',
      }
    )
    
    // 跳转到仪表盘，继续使用计划号登录
    router.push('/dashboard')
    
  } catch (error) {
    // 用户选择了"我要升级"，不做任何操作
  }
}

// 组件挂载时初始化数据
onMounted(() => {
  initializeData()
})
</script>

<style scoped>
/* 整体布局 */
.account-upgrade {
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

.upgrade-container {
  background: #ffffff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  max-width: 900px;
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

/* 当前登录信息区域 */
.current-login-section {
  margin-bottom: 40px;
}

.current-info-card {
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 12px;
  padding: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-icon {
  font-size: 18px;
  color: #F39800;
}

.info-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-weight: 500;
  color: #555;
}

.info-value {
  color: #333;
  font-weight: 600;
}

.info-value.plan-login {
  color: #F39800;
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
.plans-info-section {
  margin-bottom: 40px;
}

.plan-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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

.plan-card.current {
  border-color: #F39800;
  box-shadow: 0 4px 12px rgba(243, 152, 0, 0.15);
  background: #fffbf0;
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

.plan-info {
  flex: 1;
}

.plan-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.plan-code {
  font-size: 14px;
  color: #666;
  font-family: monospace;
}

.current-tag {
  font-size: 12px;
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

/* 升级表单区域 */
.upgrade-form-section {
  margin-bottom: 20px;
}

.upgrade-notice {
  margin-bottom: 30px;
}

.upgrade-notice ul {
  margin: 10px 0 0 0;
  padding-left: 20px;
}

.upgrade-notice li {
  margin-bottom: 5px;
  color: #666;
}

.upgrade-form {
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

/* 表单操作按钮 */
.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.cancel-button {
  width: 140px;
  height: 50px;
  border: 2px solid #dcdfe6;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  background: #fff;
}

.cancel-button:hover {
  border-color: #2C8976;
  color: #2C8976;
}

.submit-button {
  width: 140px;
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
  .upgrade-container {
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
  
  .form-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .cancel-button,
  .submit-button {
    width: 100%;
    max-width: 300px;
  }
}
</style>