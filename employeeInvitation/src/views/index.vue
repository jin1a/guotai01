<template>
  <div class="identity-verification-page">
    <!-- 灰色背景遮罩 -->
    <div class="gray-bg"></div>

    <!-- 弹窗 -->
    <transition name="fade">
      <div class="popup" v-if="showPopup">
        <div class="popup-header">
          <span class="popup-title">身份驗證</span>
          <van-icon name="cross" class="popup-close" @click="showPopup = false" />
        </div>
        <div class="code-input-row">
          <div v-for="(item, idx) in 6" :key="idx" class="code-box">
            <input
              type="text"
              maxlength="1"
              v-model="codeArr[idx]"
              @input="onInput(idx, $event)"
              @focus="activeIdx = idx"
              :class="{ active: activeIdx === idx }"
              :ref="'input' + idx"
            />
          </div>
        </div>
        <div class="popup-btns">
          <van-button class="send-btn" type="warning" round block @click="sendCode">發送驗證碼</van-button>
          <van-button class="confirm-btn" type="success" round block @click="confirmCode">確認</van-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { Button, Icon } from 'vant'
export default {
  name: 'IdentityVerificationPage',
  components: { [Button.name]: Button, [Icon.name]: Icon },
  data() {
    return {
      showPopup: true,
      codeArr: Array(6).fill(''),
      activeIdx: 0
    }
  },
  methods: {
    onInput(idx, e) {
      const val = e.target.value.replace(/[^0-9a-zA-Z]/g, '').slice(0, 1)
      this.$set(this.codeArr, idx, val)
      if (val && idx < 5) {
        const nextInput = this.$refs['input' + (idx + 1)]
        if (Array.isArray(nextInput) && nextInput[0]) {
          nextInput[0].focus()
        } else if (nextInput) {
          nextInput.focus()
        }
        this.activeIdx = idx + 1
      }
    },
    sendCode() {
      this.$toast('驗證碼已發送')
    },
    confirmCode() {
      if (this.codeArr.join('').length < 6) {
        this.$toast('請輸入完整驗證碼')
        return
      }
      let type = this.$route.query.type
      if (type === 'PR') {
        this.$router.push('/PRProtocolSpecification')
      } else {
        this.$router.push('/ProtocolSpecification')
      }
      // this.$toast('驗證成功')
    }
  }
}
</script>

<style lang="scss" scoped>
.identity-verification-page {
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
}
.gray-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.18);
  z-index: 10;
}
.popup {
  position: fixed;
  left: 0;
  right: 0;
  top: 50%;
  bottom: auto;
  transform: translateY(-50%);
  margin: 0 auto;
  width: 90%;
  max-width: 400px;
  background: #fff;
  border-radius: 18px;
  z-index: 20;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  padding-bottom: 32px;
  animation: fadeIn .2s;
}
.popup-header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 56px;
  border-bottom: 1px solid #f1f1f1;
}
.popup-title {
  font-size: 18px;
  font-weight: 500;
  color: #333;
}
.popup-close {
  position: absolute;
  right: 18px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 22px;
  color: #bbb;
  cursor: pointer;
}
.code-input-row {
  display: flex;
  justify-content: center;
  margin: 32px 0 24px 0;
  gap: 12px;
}
.code-box {
  width: 44px;
  height: 44px;
  background: #e5e5e5;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.code-box input {
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 22px;
  outline: none;
}
.code-box input.active {
  border: 2px solid #07c160;
  background: #fff;
}
.popup-btns {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 0 24px;
}
.send-btn {
  background: #ffa200;
  color: #fff;
  font-size: 16px;
  margin-right: 0;
}
.confirm-btn {
  border: 0;
  background: #2ca193;
  color: #fff;
  font-size: 16px;
}
</style>
