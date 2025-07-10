<template>
  <div>
    <Steps :total="7" :nub="6" title="附件" />
    <div class="upload-materials">     
      <div class="form-title">
        <span class="title-bar"></span>
        相关材料上传
      </div>
      <div class="upload-section">
        <div class="upload-label">
          <span class="required">*</span> 会员证件正面
        </div>
        <van-uploader
          v-model="files.front"
          :after-read="onAfterRead('front')"
          :max-count="1"
          :show-upload="files.front.length === 0"
          :preview-image="true"
          class="upload-box"
        >
          <div class="upload-placeholder" v-if="files.front.length === 0">
            <van-icon name="plus" size="48" />
          </div>
        </van-uploader>

        <div class="upload-label">
          <span class="required">*</span> 会员证件反面
        </div>
        <van-uploader
          v-model="files.back"
          :after-read="onAfterRead('back')"
          :max-count="1"
          :show-upload="files.back.length === 0"
          :preview-image="true"
          class="upload-box"
        >
          <div class="upload-placeholder" v-if="files.back.length === 0">
            <van-icon name="plus" size="48" />
          </div>
        </van-uploader>

        <div class="upload-label">
          <span class="required">*</span> 会员地址证明（水电费单）
        </div>
        <van-uploader
          v-model="files.address"
          :after-read="onAfterRead('address')"
          :max-count="1"
          :show-upload="files.address.length === 0"
          :preview-image="true"
          class="upload-box"
        >
          <div class="upload-placeholder" v-if="files.address.length === 0">
            <van-icon name="plus" size="48" />
          </div>
        </van-uploader>

        <div class="upload-label">其他附件</div>
        <van-uploader
          v-model="files.other"
          :after-read="onAfterRead('other')"
          :max-count="1"
          :show-upload="files.other.length === 0"
          :preview-image="true"
          class="upload-box"
        >
          <div class="upload-placeholder" v-if="files.other.length === 0">
            <van-icon name="plus" size="48" />
          </div>
        </van-uploader>
      </div>

      <div class="footer-btns">
        <van-button round plain type="primary" class="btn" @click="onPrev">上一步</van-button>
        <van-button round type="primary" class="btn next" :loading="uploading" @click="onNext">下一步</van-button>
      </div>
    </div>
  </div>
  
</template>

<script>
import { Uploader, Button, Icon } from 'vant';
import axios from 'axios';
import Steps from '@/components/steps/Steps.vue'
export default {
  name: 'UploadMaterials',
  components: {
    'van-uploader': Uploader,
    'van-button': Button,
    'van-icon': Icon,
    Steps
  },
  data() {
    return {
      files: {
        front: [],
        back: [],
        address: [],
        other: [],
      },
      uploading: false,
    };
  },
  methods: {
    async uploadFile(file) {
      const formData = new FormData();
      formData.append('file', file.file);
      try {
        this.uploading = true;
        const res = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        this.uploading = false;
        return res.data.url;
      } catch (e) {
        this.uploading = false;
        this.$toast.fail('上传失败');
        throw e;
      }
    },
    onAfterRead(type) {
      return async (file) => {
        try {
          const url = await this.uploadFile(file);
          this.files[type] = [{ ...file, url }];
        } catch (e) {
          // 错误已提示
        }
      };
    },
    onPrev() {
      this.$router.back();
    },
    onNext() {
      if (!this.files.front.length || !this.files.back.length || !this.files.address.length) {
        this.$toast.fail('请上传所有必填材料');
        return;
      }
      // 下一步逻辑
      this.$router.push({ name: '下一步页面路由名' });
    },
  },
};
</script>

<style lang="scss" scoped>
.form-title {
  display: flex;
  align-items: center;
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin: 18px 0 12px 0;
}

.title-bar {
  width: 4px;
  height: 22px;
  background: #07c160;
  border-radius: 2px;
  margin-right: 10px;
}
.upload-materials {
  padding: 15px 16px 10px 16px;
  .title {
    display: flex;
    align-items: center;
    font-size: 22px;
    font-weight: bold;
    margin-bottom: 24px;
  }
  .upload-section {
    .upload-label {
      font-size: 16px;
      color: #555;
      margin: 16px 0 8px 0;
      .required {
        color: #e54d42;
        margin-right: 2px;
      }
    }
    .upload-box {
      width: 140px;
      height: 100px;
      border: 2px dashed #888;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      background: #fff;
      .upload-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
    }
  }
  .footer-btns {
    
    background: #fff;
    display: flex;
    justify-content: space-around;
    padding: 20px 0 20px 0;
    box-shadow: 0 -2px 8px rgba(0,0,0,0.03);
    .btn {
      width: 140px;
      height: 44px;
      font-size: 18px;
    }
    .next {
      background: #24907a;
      border: none;
      color: #fff;
    }
  }
}
</style>
