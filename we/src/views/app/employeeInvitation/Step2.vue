<template>
  <div class="step2">
    <!-- 顶部导航 -->
    <van-nav-bar
      title="遞交僱員開戶申請"
      left-arrow
      @click-left="onClickLeft"
    />

    <!-- 步骤条 -->
    <div class="steps-wrapper">
      <van-steps :active="1" active-color="#07c160">
        <van-step>僱員資料確認</van-step>
        <van-step>身份認證</van-step>
        <van-step>銀行賬戶</van-step>
        <van-step>供款資料</van-step>
        <van-step>確認提交</van-step>
      </van-steps>
    </div>

    <!-- 表单内容 -->
    <div class="form-content">
      <div class="form-title">身份認證</div>
      
      <van-form @submit="onSubmit">
        <!-- 上传身份证正面 -->
        <div class="upload-section">
          <div class="upload-title">
            <span class="required">*</span>身份證正面
          </div>
          <van-uploader
            v-model="formData.idCardFront"
            :max-count="1"
            :after-read="afterRead"
          />
        </div>

        <!-- 上传身份证背面 -->
        <div class="upload-section">
          <div class="upload-title">
            <span class="required">*</span>身份證背面
          </div>
          <van-uploader
            v-model="formData.idCardBack"
            :max-count="1"
            :after-read="afterRead"
          />
        </div>

        <!-- 上传近期照片 -->
        <div class="upload-section">
          <div class="upload-title">
            <span class="required">*</span>近期照片
          </div>
          <van-uploader
            v-model="formData.recentPhoto"
            :max-count="1"
            :after-read="afterRead"
          />
        </div>

        <!-- 按钮组 -->
        <div class="button-group">
          <van-button plain type="primary" @click="onBack">返回</van-button>
          <van-button type="primary" native-type="submit">下一步</van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Step2',
  data() {
    return {
      formData: {
        idCardFront: [],
        idCardBack: [],
        recentPhoto: []
      }
    }
  },
  methods: {
    onClickLeft() {
      this.$router.push('/employee-invitation')
    },
    onBack() {
      this.$router.push('/employee-invitation')
    },
    onSubmit() {
      // 验证是否上传了所有必需的图片
      if (this.formData.idCardFront.length === 0 ||
          this.formData.idCardBack.length === 0 ||
          this.formData.recentPhoto.length === 0) {
        this.$toast('請上傳所有必需的圖片')
        return
      }
      
      // 处理表单提交
      console.log('form submit', this.formData)
      this.$router.push('/employee-invitation/step3')
    },
    afterRead(file) {
      // 这里可以处理文件上传逻辑
      console.log('file uploaded', file)
    }
  }
}
</script>

<style lang="scss" scoped>
.step2 {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 20px;

  .steps-wrapper {
    background: #07c160;
    padding: 20px 16px;
  }

  .form-content {
    margin: 16px;
    background: #fff;
    border-radius: 8px;
    padding: 16px;

    .form-title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
      margin-bottom: 16px;
      position: relative;
      padding-left: 12px;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 16px;
        background: #07c160;
        border-radius: 2px;
      }
    }

    .required {
      color: #ee0a24;
      margin-right: 4px;
    }

    .upload-section {
      margin-bottom: 20px;

      .upload-title {
        margin-bottom: 8px;
        color: #333;
        font-size: 14px;
      }
    }

    .button-group {
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
      padding: 0 16px;

      .van-button {
        width: 120px;
        height: 40px;
        border-radius: 20px;
      }
    }
  }
}
</style> 