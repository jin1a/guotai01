<template>
  <div class="employee-info-page">
    <Steps :total="7" :nub="4" title="指定受益人" />
    <div class="form-area">
      <div class="form-title">
        <span class="title-bar"></span>
        指定受益人
      </div>
      <van-form @submit="onSubmit1" ref="formRef">        
        <div class="form-group">
          <label class="form-label required">受益人姓名</label>
          <van-field class="form-input " v-model="form.employerName" placeholder="請輸入"
            :rules="[{ required: true, message: '請輸入' }]" />          
        </div>
        <div class="form-group">
          <label class="form-label required">佔利益百分比</label>
          <van-field class="form-input " v-model="form.employerName" placeholder="請輸入"
            :rules="[{ required: true, message: '請輸入' }]" />          
        </div>
        <div class="form-group">
          <label class="form-label required">關係</label>
          <van-field class="form-input " v-model="form.employerName" placeholder="請輸入"
            :rules="[{ required: true, message: '請輸入' }]" />          
        </div>
        <div class="form-group">
          <label class="form-label required">身份證/護照號碼</label>
          <van-field class="form-input " v-model="form.employerName" placeholder="請輸入"
            :rules="[{ required: true, message: '請輸入' }]" />          
        </div>
        <div class="form-group">
          <label class="form-label required">地址</label>
          <van-field class="form-input " v-model="form.employerName" placeholder="請輸入"
            :rules="[{ required: true, message: '請輸入' }]" />          
        </div>
      </van-form>
      <div class="description">
        <div class="title">說明</div>
        <div class="content">
          <p>1.百分比必須以整數填寫及所有受益人佔利益百分比總計必須為百分之一百。</p>
          <p>2.本人現指定上述受益人可按中國人壽澳門分公司界定供款退休計劃之條文收取身故利益。</p>
          <p>3.本人同時明白更改上述之地址和受益人，必須要中國人壽保險(海外)股份有限公司澳門分公司收妥書面通知方可辦理。</p>
        </div>
      </div>
    </div>
    <div class="btn-group">
      <van-button class="btn-back" type="default" round block @click="onBack">返回</van-button>
      <van-button class="btn-next" type="success" round block @click="onSubmit1">下一步</van-button>
    </div>
    
  </div>
</template>

<script>
import { Icon, Button, Popup, Picker, DatetimePicker, Area, Form, Field } from 'vant'
import { areaList } from '@vant/area-data'
import { get } from '@/assets/js/utils/request'
import Steps from '@/components/steps/Steps.vue'
export default {
  name: 'PRBeneficiary',
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
        USCitizenValue: ''  
      }, 
    }
  },
  mounted() {

  },
  methods: {
    onBack() {
      this.$router.go(-1)
    },    
    onSubmit1() {
      this.$refs.formRef.validate().then(res=>{        
        this.$router.push('/TaxDetails')
      }).catch(err=>{        
        this.$toast.fail(err[0].message)
      })      
      
    },
  }
}
</script>

<style lang="scss" scoped>
.description .title {
  font-size: 16px;
  color: #222;
  font-weight: 600;
  margin-bottom: 10px;
  margin-top: 10px;
}

.description .content {
  font-size: 14px;
  color: #222;
  font-weight: 400;
  line-height: 24px;
  margin-bottom: 10px;
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
