<template>
  <div class="profile-info">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>基本資料</span>
          <el-button type="primary" @click="handleEdit">編輯資料</el-button>
        </div>
      </template>
      
      <el-form 
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        :disabled="!isEditing"
      >
        <el-form-item label="頭像" prop="avatar">
          <el-upload
            class="avatar-uploader"
            action="/api/upload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="form.avatar" :src="form.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item label="性別" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="出生日期" prop="birthday">
          <el-date-picker 
            v-model="form.birthday"
            type="date"
            placeholder="選擇日期"
          />
        </el-form-item>

        <el-form-item label="手機號碼" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>

        <el-form-item label="電子郵箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>

        <el-form-item label="通訊地址" prop="address">
          <el-input v-model="form.address" type="textarea" />
        </el-form-item>

        <el-form-item v-if="isEditing">
          <el-button type="primary" @click="handleSave">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const formRef = ref(null)
const isEditing = ref(false)

const form = ref({
  avatar: '',
  name: '張三',
  gender: 'male',
  birthday: '',
  phone: '12345678',
  email: 'zhangsan@example.com',
  address: '香港特別行政區'
})

const rules = {
  name: [
    { required: true, message: '請輸入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '長度在 2 到 20 個字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '請輸入手機號碼', trigger: 'blur' },
    { pattern: /^\d{8}$/, message: '請輸入正確的手機號碼', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入電子郵箱', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的電子郵箱', trigger: 'blur' }
  ]
}

const handleEdit = () => {
  isEditing.value = true
}

const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid, fields) => {
    if (valid) {
      console.log('保存資料:', form.value)
      ElMessage.success('保存成功')
      isEditing.value = false
    } else {
      console.error('表單驗證失敗:', fields)
    }
  })
}

const handleCancel = () => {
  isEditing.value = false
  // 重置表单
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

const handleAvatarSuccess = (response, file) => {
  form.value.avatar = URL.createObjectURL(file.raw)
  ElMessage.success('頭像上傳成功')
}

const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg'
  const isPNG = file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG && !isPNG) {
    ElMessage.error('頭像只能是 JPG 或 PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('頭像大小不能超過 2MB!')
    return false
  }
  return true
}
</script>

<style scoped>
.profile-info {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style> 