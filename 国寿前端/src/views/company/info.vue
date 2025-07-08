<template>
  <div class="company-info">
    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>企業基本信息</span>
          <el-button type="primary" @click="handleEdit">編輯</el-button>
        </div>
      </template>

      <el-descriptions :column="2" border>
        <el-descriptions-item label="企業名稱">
          {{ companyInfo.name }}
        </el-descriptions-item>
        <el-descriptions-item label="統一編號">
          {{ companyInfo.registrationNumber }}
        </el-descriptions-item>
        <el-descriptions-item label="法定代表人">
          {{ companyInfo.legalRepresentative }}
        </el-descriptions-item>
        <el-descriptions-item label="聯繫電話">
          {{ companyInfo.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="電子郵箱">
          {{ companyInfo.email }}
        </el-descriptions-item>
        <el-descriptions-item label="註冊地址">
          {{ companyInfo.address }}
        </el-descriptions-item>
        <el-descriptions-item label="成立日期">
          {{ companyInfo.establishDate }}
        </el-descriptions-item>
        <el-descriptions-item label="企業規模">
          {{ companyInfo.size }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="編輯企業信息"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="企業名稱" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="統一編號" prop="registrationNumber">
          <el-input v-model="form.registrationNumber" />
        </el-form-item>
        <el-form-item label="法定代表人" prop="legalRepresentative">
          <el-input v-model="form.legalRepresentative" />
        </el-form-item>
        <el-form-item label="聯繫電話" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
        <el-form-item label="電子郵箱" prop="email">
          <el-input v-model="form.email" />
        </el-form-item>
        <el-form-item label="註冊地址" prop="address">
          <el-input v-model="form.address" />
        </el-form-item>
        <el-form-item label="成立日期" prop="establishDate">
          <el-date-picker
            v-model="form.establishDate"
            type="date"
            placeholder="選擇日期"
          />
        </el-form-item>
        <el-form-item label="企業規模" prop="size">
          <el-select v-model="form.size" placeholder="請選擇">
            <el-option label="小型企業" value="small" />
            <el-option label="中型企業" value="medium" />
            <el-option label="大型企業" value="large" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            確定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟数据
const companyInfo = reactive({
  name: '示例企業有限公司',
  registrationNumber: 'REG123456789',
  legalRepresentative: '張三',
  phone: '+853 1234 5678',
  email: 'contact@example.com',
  address: '澳門特別行政區示例街123號',
  establishDate: '2010-01-01',
  size: '中型企業'
})

const dialogVisible = ref(false)
const formRef = ref(null)

// 表单数据
const form = reactive({
  name: '',
  registrationNumber: '',
  legalRepresentative: '',
  phone: '',
  email: '',
  address: '',
  establishDate: '',
  size: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '請輸入企業名稱', trigger: 'blur' }
  ],
  registrationNumber: [
    { required: true, message: '請輸入統一編號', trigger: 'blur' }
  ],
  legalRepresentative: [
    { required: true, message: '請輸入法定代表人', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '請輸入聯繫電話', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '請輸入電子郵箱', trigger: 'blur' },
    { type: 'email', message: '請輸入正確的郵箱格式', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '請輸入註冊地址', trigger: 'blur' }
  ],
  establishDate: [
    { required: true, message: '請選擇成立日期', trigger: 'change' }
  ],
  size: [
    { required: true, message: '請選擇企業規模', trigger: 'change' }
  ]
}

// 处理编辑按钮点击
const handleEdit = () => {
  Object.assign(form, companyInfo)
  dialogVisible.value = true
}

// 处理表单提交
const handleSubmit = () => {
  if (!formRef.value) return
  
  formRef.value.validate((valid) => {
    if (valid) {
      Object.assign(companyInfo, form)
      dialogVisible.value = false
      ElMessage.success('企業信息更新成功')
    }
  })
}
</script>

<style scoped>
.company-info {
  padding: 20px;
}

.info-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 