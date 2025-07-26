<template>
  <div class="settings">
    <el-card class="settings-card">
      <template #header>
        <div class="card-header">
          <span>系統設置</span>
        </div>
      </template>

      <el-tabs>
        <!-- 个人设置 -->
        <el-tab-pane label="個人設置">
          <el-form
            ref="personalFormRef"
            :model="personalForm"
            :rules="personalRules"
            label-width="100px"
          >
            <el-form-item label="用戶名" prop="username">
              <el-input v-model="personalForm.username" disabled />
            </el-form-item>
            <el-form-item label="姓名" prop="name">
              <el-input v-model="personalForm.name" />
            </el-form-item>
            <el-form-item label="電子郵箱" prop="email">
              <el-input v-model="personalForm.email" />
            </el-form-item>
            <el-form-item label="手機號碼" prop="phone">
              <el-input v-model="personalForm.phone" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSavePersonal">
                保存設置
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 安全设置 -->
        <el-tab-pane label="安全設置">
          <el-form
            ref="securityFormRef"
            :model="securityForm"
            :rules="securityRules"
            label-width="100px"
          >
            <el-form-item label="原密碼" prop="oldPassword">
              <el-input
                v-model="securityForm.oldPassword"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item label="新密碼" prop="newPassword">
              <el-input
                v-model="securityForm.newPassword"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item label="確認密碼" prop="confirmPassword">
              <el-input
                v-model="securityForm.confirmPassword"
                type="password"
                show-password
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveSecurity">
                修改密碼
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 通知设置 -->
        <el-tab-pane label="通知設置">
          <el-form label-width="200px">
            <el-form-item label="系統消息">
              <el-switch v-model="notificationSettings.system" />
            </el-form-item>
            <el-form-item label="待辦提醒">
              <el-switch v-model="notificationSettings.todo" />
            </el-form-item>
            <el-form-item label="供款到期提醒">
              <el-switch v-model="notificationSettings.contribution" />
            </el-form-item>
            <el-form-item label="郵件通知">
              <el-switch v-model="notificationSettings.email" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSaveNotification">
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
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 个人设置表单
const personalFormRef = ref(null)
const personalForm = reactive({
  username: 'admin',
  name: '管理員',
  email: 'admin@example.com',
  phone: '+853 1234 5678'
})

const personalRules = {
  name: [
    { required: true, message: '請輸入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入電子郵箱', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的郵箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '請輸入手機號碼', trigger: 'blur' }
  ]
}

// 安全设置表单
const securityFormRef = ref(null)
const securityForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== securityForm.newPassword) {
    callback(new Error('兩次輸入的密碼不一致'))
  } else {
    callback()
  }
}

const securityRules = {
  oldPassword: [
    { required: true, message: '請輸入原密碼', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '請輸入新密碼', trigger: 'blur' },
    { min: 6, message: '密碼長度不能少於6個字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '請再次輸入新密碼', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 通知设置
const notificationSettings = reactive({
  system: true,
  todo: true,
  contribution: true,
  email: false
})

// 处理保存个人设置
const handleSavePersonal = () => {
  if (!personalFormRef.value) return
  
  personalFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('個人設置保存成功')
    }
  })
}

// 处理保存安全设置
const handleSaveSecurity = () => {
  if (!securityFormRef.value) return
  
  securityFormRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('密碼修改成功')
      securityForm.oldPassword = ''
      securityForm.newPassword = ''
      securityForm.confirmPassword = ''
    }
  })
}

// 处理保存通知设置
const handleSaveNotification = () => {
  ElMessage.success('通知設置保存成功')
}
</script>

<style scoped>
.settings {
  padding: 20px;
}

.settings-card {
  min-height: 500px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

:deep(.el-form) {
  max-width: 500px;
  margin: 20px auto;
}
</style> 