<template>
  <div class="contribution-details-container">
    <Steps :total="7" :nub="2" title="供款详情" />
    <div class="content">
      <h2 class="title">
        <span class="title-bar"></span>供款详情
      </h2>
      <div class="formDiv">
        <van-form @submit="onSubmit" ref="form">
          <van-field
            v-model="contributionRatio"
            label="僱员供款比例"            
            required
            readonly
            clickable           
            :rules="[{ required: true, message: '请选择僱员供款比例' }]"
            @click="showRatioPicker = true"
            input-align="left"
            class="custom-field"
          >
            <template #input>
              <div class="picker-box" :class="{'selected': contributionRatio !== ''}">                
                <span :class="{'placeholder': contributionRatio === ''}">{{ contributionRatio?contributionRatio:'请选择' }}</span>
                <span class="arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="#bfbfbf" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
            </template>
          </van-field>
          <van-popup v-model="showRatioPicker" position="bottom">
            <van-picker show-toolbar confirm-button-text="確定" cancel-button-text="取消" :columns="ratioOptions" @confirm="onRatioConfirm" @cancel="showRatioPicker = false" />
          </van-popup>

          <van-field
            v-model="baseLimit"
            label="僱员供款计算基准上下限"
            required
            readonly
            clickable           
            :rules="[{ required: true, message: '请选择供款计算基准上下限' }]"
            @click="showLimitPicker = true"
            input-align="left"
            class="custom-field"
          >
            <template #input>
              <div class="picker-box" :class="{'selected': baseLimit !== ''}">                
                <span :class="{'placeholder': baseLimit === ''}">{{ baseLimit?baseLimit:'请选择' }}</span>
                <span class="arrow">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 6L8 10L12 6" stroke="#bfbfbf" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
            </template>
          </van-field>
          <van-popup v-model="showLimitPicker" position="bottom">
            <van-picker show-toolbar confirm-button-text="確定" cancel-button-text="取消" :columns="limitOptions" @confirm="onLimitConfirm" @cancel="showLimitPicker = false" />
          </van-popup>

          <div class="explanation">
            <div class="explanation-title">说明</div>
            <ol class="explanation-list">
              <li>供款金额将截算至元位。如计算出的供款金额的尾数不足一元，则按一元计。</li>
              <li>每一年度僱员可获得一次调整供款比例及供款计算基准上下限。</li>
            </ol>
          </div>
          <div class="footer">
            <van-button class="btn btn-outline" block @click="onPrev" type="default">上一步</van-button>
            <van-button class="btn btn-primary" block native-type="submit" type="primary">下一步</van-button>
          </div>
        </van-form>
      </div>
    </div>
  </div>
</template>

<script>
import Steps from '@/components/steps/Steps.vue'
import { Popup, Picker, Form, Field, Button } from 'vant'
export default {
  name: 'ContributionDetails',
  components: {
    [Popup.name]: Popup,
    [Picker.name]: Picker,
    [Form.name]: Form,
    [Field.name]: Field,
    [Button.name]: Button,
    Steps
  },
  data() {
    return {
      contributionRatio: '',
      baseLimit: '',
      showRatioPicker: false,
      showLimitPicker: false,
      ratioOptions: [     
        { text: '请选择', value: '' },  
        { text: '5%', value: '5' },
        { text: '6%', value: '6' }
      ],
      limitOptions: [
       
        { text: '1000元', value: '1000' },
        { text: '2000元', value: '2000' }
      ]
    }
  },
  computed: {
    // contributionRatioLabel() {
    //   const found = this.ratioOptions.find(opt => opt.value === this.contributionRatio)
    //   return found ? found.text : '僱主预设'
    // },
    // baseLimitLabel() {
    //   const found = this.limitOptions.find(opt => opt.value === this.baseLimit)
    //   return found ? found.text : '不设立'
    // }
  },
  methods: {
    onPrev() {
      this.$emit('prev')
    },
    onNext() {
      this.$emit('next')
    },
    onRatioConfirm(val) {
      this.contributionRatio = val.value
      this.showRatioPicker = false
    },
    onLimitConfirm(val) {
      this.baseLimit = val.value
      this.showLimitPicker = false
    },
    async onSubmit() {
      // 校验通过自动提交，否则自动提示
      this.$toast('提交成功')
      this.onNext()
    }
  }
}
</script>

<style scoped>
.contribution-details-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #fff;
}

.content {
  flex: 1;
  padding: 24px 16px 120px 16px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}
.title-bar {
  width: 4px;
  height: 24px;
  background: #009688;
  border-radius: 2px;
  display: inline-block;
  margin-right: 8px;
}
.dot {
  display: none;
}

.formDiv {
  background: #fff;
  border-radius: 8px;
  padding: 0 0 16px 0;
}
.custom-field {
  margin-bottom: 12px;
}
.form-group {
  margin-bottom: 20px;
}

.label {
  display: block;
  font-size: 16px;
  margin-bottom: 8px;
  color: #222;
}

.label .desc {
  color: #fa541c;
  font-size: 12px;
  margin-left: 4px;
}

.required:before {
  content: '*';
  color: #fa541c;
  margin-right: 2px;
}

.picker-box {
  width: 100%;
  height: 44px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  padding: 0 14px;
  font-size: 16px;
  background: #fff;
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  color: #222;
}

.picker-box:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border-color: #bfbfbf;
}

.picker-box .arrow {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

.picker-box .arrow svg {
  width: 30px;
  height: 30px;
}

.picker-box .placeholder {
  color: #bfbfbf;
}

.picker-box.selected {
  color: #222;
}

.explanation {
  margin-top: 32px;
}

.explanation-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
}

.explanation-list {
  padding-left: 18px;
  color: #666;
  font-size: 15px;
}

.footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px 24px 24px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  display: flex;  
  gap: 16px;
  margin-top: 32px;
}

.btn {
  width: 140px;
  height: 44px;
  border-radius: 24px;
  font-size: 18px;
  font-weight: 500;
  border: 1.5px solid #009688;
  background: #fff;
  color: #009688;
  outline: none;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.btn-primary {
  background: #009688;
  color: #fff;
  border: 1.5px solid #009688;
}
.btn-outline {
  background: #fff;
  color: #009688;
  border: 1.5px solid #009688;
}
.btn:active {
  opacity: 0.8;
}
</style>
