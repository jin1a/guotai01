<template>
  <div class="signature-page">
    <div class="section compare-section">
      <img src="@/assets/images/01.gif" width="99%" alt="證件簽字比對文件（證件有簽字的一面）">
    </div>
    <div class="section signature-section">
      <vue-signature-pad width="500px" height="300px" ref="signaturePad" />
    </div>
    <div class="footer-btns">
      <button class="btn back" @click="handleBack">返回</button>
      <button class="btn submit" @click="handleSubmit">提交</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Signature',
  methods: {
    handleBack() {
      this.$router.back();
    },
    handleSubmit() {
      const { isEmpty, data } = this.$refs.signaturePad.saveSignature();
      console.log(isEmpty,888);
      console.log(data,999);
      // this.$router.push('/'); // 可根据实际需求修改目标路由
    }
  }
};
</script>

<style scoped>
.signature-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
}
.section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #444;  
  border-bottom: 1px solid #eee;
}
.compare-section {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
}
.signature-section {
  border-bottom: none;
}
.footer-btns {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 24px 0 16px 0;
  background: #fff;
}
.btn {
  min-width: 120px;
  height: 44px;
  border: none;
  border-radius: 24px;
  font-size: 18px;
  color: #fff;
  cursor: pointer;
  outline: none;
  transition: background 0.2s;
}
.btn.back {
  background: #ffa800;
}
.btn.submit {
  background: #229488;
}
</style>
