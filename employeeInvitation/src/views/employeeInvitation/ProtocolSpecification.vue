<template>
  <div class="protocol-specification-page">
    <div class="content-area">
      <div class="pdf-title">協議說明</div>
      <div class="pdf-iframe-wrapper">
        <iframe :src="pdfUrl" width="100%" height="100%" style="border:none;" />
      </div>
    </div>
    <div class="btn-group">
      <van-button class="btn-disagree" type="warning" round block @click="onDisagree">不同意</van-button>
      <van-button class="btn-agree" type="success" round block @click="onAgree">同意</van-button>
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
  height: 60vh;
  border: 1px solid #eee;
  background: #fff;
}
.btn-group {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 0 24px 32px 24px;
}
.btn-disagree {
  background: #ffa200;
  color: #fff;
  font-size: 16px;
}
.btn-agree {
  background: #2ca193;
  color: #fff;
  font-size: 16px;
  border: none !important;
  box-shadow: none !important;
}
</style>
