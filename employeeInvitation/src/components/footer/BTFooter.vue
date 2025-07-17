<template>
  <div class="footer">
    <div class="btn-group">
      <van-button class="btn-back" type="default" round block @click="onBack">返回</van-button>
      <van-button class="btn-next" type="success"  @click="onSubmit1">下一步</van-button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Footer',
  methods: {
    onBack() {
      this.$router.back()
    },
    onSubmit1() {
      this.$emit('nextClick')
      // this.$router.push('/employeeInvitation/EmployeeInformation')
    }
  }
}
</script>

<style lang="scss" scoped>

.btn-group {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 20px 18px 60px 18px;
  background: #fff;
}

.btn-back {
  flex: 1;
  background: #fff;
  color: #269488;
  font-size: 18px;
  font-weight: 600;
  border: 2px solid #269488;
  height: 48px;
  border-radius: 24px;
  margin-right: 0;
  box-shadow: none;
  letter-spacing: 2px;
}

.btn-next {
  flex: 1;
  background: #269488;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  border: none;
  height: 48px;
  border-radius: 24px;
  margin-left: 0;
  box-shadow: none;
  letter-spacing: 2px;
}
</style>