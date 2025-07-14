<template>
  <div class="protocol-specification-page">
    <div class="content-area">
      <div class="pdf-title">參加計劃申請單</div>
      <div class="pdf-iframe-wrapper">
        <iframe :src="pdfUrl" width="100%" height="500" style="border:none;" />
      </div>
    </div>
    <div class="btn-group">
      <van-button class="btn-back" type="default" round block @click="onBack">返回</van-button>
      <van-button class="btn-next" type="success" round block @click="onSubmit1">簽字</van-button>
    </div>
  </div>
</template>

<script>
import { Button } from 'vant'
export default {
  name: 'ProtocolSpecification',
  components: { [Button.name]: Button },
  data() {
    return {
      pdfUrl: '/static/12.pdf' // 可替换为本地或网络PDF
    }
  },
  methods: {
    onDisagree() {
      this.$toast('您已选择不同意')
    },
    onAgree() {
      this.$toast('您已同意协议')
    }
  }
}
</script>

<style lang="scss" scoped>
.protocol-specification-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.content-area {
  flex: 1;
  padding: 32px 24px 0 24px;
}
.pdf-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
}
.pdf-iframe-wrapper {
  width: 100%;
  height: 500px;
  border: 1px solid #eee;
  background: #fff;
}

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
