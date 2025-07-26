<template>
  <div class="contribution-payment">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>供款繳費</span>
        </div>
      </template>
      <el-form :model="form" label-width="120px">
        <el-form-item label="繳費金額">
          <el-input-number v-model="form.amount" :min="0" :precision="2" :step="100" />
        </el-form-item>
        <el-form-item label="繳費方式">
          <el-select v-model="form.paymentMethod" placeholder="請選擇繳費方式">
            <el-option label="銀行轉賬" value="bank" />
            <el-option label="信用卡" value="credit" />
            <el-option label="支票" value="check" />
          </el-select>
        </el-form-item>
        <el-form-item label="繳費日期">
          <el-date-picker v-model="form.paymentDate" type="date" placeholder="選擇日期" />
        </el-form-item>
        <el-form-item label="備註">
          <el-input v-model="form.remarks" type="textarea" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">確認繳費</el-button>
          <el-button>取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  amount: 0,
  paymentMethod: '',
  paymentDate: '',
  remarks: ''
})

const onSubmit = () => {
  console.log('form submitted:', form.value)
}
</script>

<style scoped>
.contribution-payment {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 