<template>
  <div class="employee-info-page">
    <Steps :total="7" :nub="3" title="供款投放項目" />
    <div class="form-area">
      <div class="form-title">
        <span class="title-bar"></span>
        歸屬於僱員的供款投放項目選擇
      </div>
      <div class="formTip">（填寫前請先向僱主了解此部份是否可由僱員自行填報）</div>
      <van-form @submit="onSubmit" ref="formRef">
        <div class="form-group">
          <label class="form-label">僱員姓名</label>
          <van-field class="form-input readonly" v-model="form.planCode" readonly />
        </div>
        <div class="form-group">
          <label class="form-label">證件號碼</label>
          <van-field class="form-input readonly" v-model="form.employerName" readonly />
        </div>
        <div class="content-title">僱主供款百分比分佈</div>
        <div class="form-group">
          <label class="form-label">中國人壽澳門分公司開放式保證基金</label>
          <van-field class="form-input readonly" v-model="form.employerName" readonly />
        </div>
        <div class="form-group">
          <label class="form-label">中國人壽澳門分公司開放式平衡基金</label>
          <van-field class="form-input readonly" v-model="form.employerName" readonly />
        </div>
        <div class="form-group">
          <label class="form-label">中國人壽澳門分公司開放式增長基金</label>
          <van-field class="form-input readonly" v-model="form.employerName" readonly />
        </div>
        <div class="content-total">
          <div class="content-total-title">總和</div>
          <div class="content-total-value">100%</div>
        </div>
        <div class="content-title">僱員供款百分比分佈</div>
        <div class="form-group">
          <label class="form-label required">中國人壽澳門分公司開放式保證基金</label>
          <van-field class="form-input" v-model="form.employerName" placeholder="請輸入"
            :rules="[{ required: true, message: '請輸入' }]" />
        </div>
        <div class="form-group">
          <label class="form-label required">中國人壽澳門分公司開放式平衡基金</label>
          <van-field class="form-input " v-model="form.employerName" placeholder="請輸入"
            :rules="[{ required: true, message: '請輸入' }]" />
        </div>
        <div class="form-group">
          <label class="form-label required">中國人壽澳門分公司開放式增長基金</label>
          <van-field class="form-input " v-model="form.employerName" placeholder="請輸入"
            :rules="[{ required: true, message: '請輸入' }]" />
        </div>
        <div class="content-total">
          <div class="content-total-title">總和</div>
          <div class="content-total-value">100%</div>
        </div>
      </van-form>
      <div class="description">
        <div class="title">說明</div>
        <div class="content">
          <p>1.選取的退休基金的供款投放的分配比例應至少為百分之五或其整倍數，總百分比亦必須為 100%。</p>
          <p>2.每一年度僱員可獲無限次免費轉換基金。</p>
          <p>3.如僱主許可或當僱員享有 100%僱主供款結餘，僱主供款部份的投資選擇可由僱員決定。</p>
        </div>
      </div>
    </div>
    <div class="btn-group">
      <van-button class="btn-back" type="default" round block @click="onBack">返回</van-button>
      <van-button class="btn-next" type="success" round block @click="onSubmit">下一步</van-button>
    </div>
    <!-- 各类选择器弹窗（省略数据源和事件实现，可根据实际需求补充） -->

  </div>
</template>

<script>
import { Icon, Button, Popup, Picker, DatetimePicker, Area, Form, Field } from 'vant'
import { areaList } from '@vant/area-data'
import { get } from '@/assets/js/utils/request'
import Steps from '@/components/steps/Steps.vue'
export default {
  name: 'ProjectSelection',
  components: {
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Popup.name]: Popup,
    [Picker.name]: Picker,
    [DatetimePicker.name]: DatetimePicker,
    [Area.name]: Area,
    [Form.name]: Form,
    [Field.name]: Field,
    Steps
  },
  data() {
    return {
      form: {
        planCode: '',
        employerName: '',
      },

    }
  },
  mounted() {
    
  },
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    onSubmit(){
      this.$router.push('/OffshoreAccounts')
    }
  }
}
</script>

<style lang="scss" scoped>
.content-title{font-size: 16px;color: #222; margin-bottom: 10px;margin-top: 15px;}
.content-total{display: flex;align-items: center;justify-content: space-between;padding: 0px 0 12px 0;}
.content-total-title{font-size: 14px;color: #222;font-weight: 400;}
.content-total-value{font-size: 18px;color: #F39800;font-weight: 400;}
.description .title{font-size: 16px;color: #222;font-weight: 600; margin-bottom: 10px;margin-top: 10px;}
.description .content{font-size: 14px;color: #222;font-weight: 400;line-height: 24px;margin-bottom: 10px;}
.formTip {
  color: #F6400E;
  padding: 10px 0 15px 0;
}
.employee-info-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
}


.form-area {
  padding: 0 6px 0 6px;
  margin: 0 15px;
}

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

.form-content {
  background: #fff;
  border-radius: 16px;
  padding: 10px 0 0 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-label {
  display: block;
  font-weight: 400;
  font-size: 15px;
  color: #222;
  margin-bottom: 8px;
  line-height: 1.2;
}

.form-label.required::before {
  content: '*';
  color: #ee0a24;
  margin-right: 2px;
  font-weight: bold;
}

.form-input {
  width: 100%;
  height: 42px;
  border: 0.5px solid #eaeaea;
  border-radius: 8px;
  background: #fff;
  font-size: 15px;
  color: #222;
  padding: 0 12px;
  outline: none;
  box-sizing: border-box;
  transition: border 0.2s;
  margin-bottom: 0;
}

.form-input:focus {
  border: 1px solid #07c160;
}

.form-input.readonly {
  background: #f7f8fa;
  color: #999;
  border: 0.5px solid #eaeaea;
}

/* Vant Field 组件样式覆盖 */
:deep(.van-field__control) {
  height: 42px;
  font-size: 15px;
  color: #222;
}

:deep(.van-field--error .van-field__control) {
  color: #ee0a24;
}

:deep(.van-field__error-message) {
  color: #ee0a24;
  font-size: 12px;
  margin-top: 4px;
}

:deep(.van-field__body) {
  padding: 0;
}

:deep(.van-field__control) {
  padding: 0;
}

.input-arrow {
  display: flex;
  align-items: center;
  position: relative;
}

.input-arrow input {
  flex: 1;
  cursor: pointer;
}

.input-arrow .van-icon {
  position: absolute;
  right: 10px;
  color: #bbb;
  font-size: 18px;
}

.mt8 {
  margin-top: 8px;
}

.field-tip {
  color: #999;
  font-size: 12px;
  margin-left: 4px;
  font-weight: 400;
}

.gender-group {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 2px;
}

.gender-radio {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #222;
  font-weight: 400;
  margin-right: 12px;
}

.radio-box {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 1.5px solid #d1d1d6;
  border-radius: 4px;
  margin-right: 6px;
  background: #fff;
  vertical-align: middle;
  transition: border 0.2s;
}

.gender-radio input[type="radio"] {
  display: none;
}

.gender-radio .radio-box.checked {
  border: 1.5px solid #07c160;
  background: #07c160;
}

.gender-radio .radio-box.checked::after {
  content: '';
  display: block;
  width: 10px;
  height: 10px;
  background: #fff;
  border-radius: 2px;
  margin: 3px auto;
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
