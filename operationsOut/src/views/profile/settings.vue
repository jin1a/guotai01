<template>
  <div class="profile-settings">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>賬戶設置</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <!-- 修改密码 -->
        <el-tab-pane label="修改密碼" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="120px"
          >
            <el-form-item label="當前密碼" prop="currentPassword">
              <el-input
                v-model="passwordForm.currentPassword"
                type="password"
                show-password
                placeholder="請輸入當前密碼"
              />
            </el-form-item>
            <el-form-item label="新密碼" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="請輸入新密碼"
              />
            </el-form-item>
            <el-form-item label="確認新密碼" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="請再次輸入新密碼"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleChangePassword">
                確認修改
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知設置" name="notifications">
          <el-form
            ref="notificationFormRef"
            :model="notificationForm"
            label-width="120px"
          >
            <el-form-item label="系統通知">
              <el-switch v-model="notificationForm.systemNotification" />
            </el-form-item>
            <el-form-item label="郵件通知">
              <el-switch v-model="notificationForm.emailNotification" />
            </el-form-item>
            <el-form-item label="短信通知">
              <el-switch v-model="notificationForm.smsNotification" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveNotifications">
                保存設置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane label="安全設置" name="security">
          <el-form label-width="120px">
            <el-form-item label="雙重認證">
              <el-switch v-model="securityForm.twoFactor" />
            </el-form-item>
            <el-form-item label="登錄驗證">
              <el-radio-group v-model="securityForm.loginVerification">
                <el-radio label="none">無</el-radio>
                <el-radio label="email">郵件驗證</el-radio>
                <el-radio label="sms">短信驗證</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveSecurity">
                保存設置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('password')

// 密码表单
const passwordFormRef = ref(null)
const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('請輸入密碼'))
  } else {
    if (passwordForm.value.confirmPassword !== '') {
      passwordFormRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('請再次輸入密碼'))
  } else if (value !== passwordForm.value.newPassword) {
    callback(new Error('兩次輸入密碼不一致!'))
  } else {
    callback()
  }
}

const passwordRules = {
  currentPassword: [
    { required: true, message: '請輸入當前密碼', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, trigger: 'blur', validator: validatePass }
  ],
  confirmPassword: [
    { required: true, trigger: 'blur', validator: validatePass2 }
  ]
}

// 通知设置表单
const notificationForm = ref({
  systemNotification: true,
  emailNotification: true,
  smsNotification: false
})

// 安全设置表单
const securityForm = ref({
  twoFactor: false,
  loginVerification: 'none'
})

// 处理修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  await passwordFormRef.value.validate((valid, fields) => {
    if (valid) {
      console.log('修改密碼:', passwordForm.value)
      ElMessage.success('密碼修改成功')
      passwordForm.value = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    } else {
      console.error('表單驗證失敗:', fields)
    }
  })
}

// 处理保存通知设置
const handleSaveNotifications = () => {
  console.log('保存通知設置:', notificationForm.value)
  ElMessage.success('通知設置已保存')
}

// 处理保存安全设置
const handleSaveSecurity = () => {
  console.log('保存安全設置:', securityForm.value)
  ElMessage.success('安全設置已保存')
}
</script>

<style scoped>
.profile-settings {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 