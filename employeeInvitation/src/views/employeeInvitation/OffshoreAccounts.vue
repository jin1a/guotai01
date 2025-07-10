<template>
  <div class="employee-info-page">
    <Steps :total="7" :nub="4" title="海外帳戶稅收法案" />
    <div class="form-area">
      <div class="form-title">
        <span class="title-bar"></span>
        海外帳戶稅收合規法案詳情
      </div>
      <van-form @submit="onSubmit1" ref="formRef">
        <div class="form-group">
          <label class="form-label required">是否為美國公民或美國稅務居民</label>
          <div class="input-arrow" @click="showConnectionPicker = true">
            <van-field 
              class="form-input" 
              v-model="USCitizenText" 
              placeholder="請選擇" 
              readonly
              :rules="[{ required: true, message: '請選擇' }]"
            />
            <van-icon name="arrow-down" />
          </div>
        </div>
        <div class="form-group" v-if="form.USCitizenValue == 'N'">
          <label class="form-label required">納稅人識別號碼</label>
          <van-field class="form-input " v-model="form.employerName" placeholder="請輸入"
            :rules="[{ required: true, message: '請輸入' }]" />          
        </div>
      </van-form>
      <div class="description">
        <div class="title">說明</div>
        <div class="content">
          <p>1. 美國稅務居民指是美國綠卡持有人（即美國合法永久居民）或滿足實質居住測試（即他/她於本納稅年內已在美國逗留至少 31 天和三年內在美國逗留至少 183 天
            (含本納稅度及過往兩年))。如閣下的答案為「是」，請填寫 並上傳W-9 表格。</p>
          <p>三年內在美國逗留日數計算方法 = 本年實際居住在美國日數 + 1/3 去年居住在美國的日數+ 1/6 前年居住在美國的日數</p>
          <p>2. 如閣下的答案為「否」，並非美國公民或美國稅務居民，但具有以下其中一項或以上之身份/狀況, 例如︰具美國住址或通訊地址或郵政信箱、具美國電話號碼，或常設指示將資金轉入位於美國帳戶，請遞交填妥好的 W-8BEN
            表格及相關證明文件。</p>
          <p>3. 如閣下的出身國家是美國，但聲明為非美國公民或美國稅務居民，請提供喪失/放棄美國籍之證明文件副本並遞交填妥好的 W-8BEN 表格。</p>
        </div>
      </div>
    </div>
    <div class="btn-group">
      <van-button class="btn-back" type="default" round block @click="onBack">返回</van-button>
      <van-button class="btn-next" type="success" round block @click="onSubmit1">下一步</van-button>
    </div>
    <!-- 各类选择器弹窗（省略数据源和事件实现，可根据实际需求补充） -->
    <van-popup v-model="showConnectionPicker" position="bottom">
      <van-picker :columns="connectionTypes" confirm-button-text="確定" cancel-button-text="取消" show-toolbar
        @confirm="onConnectionTypeConfirm" @cancel="showConnectionPicker = false" />
    </van-popup>
  </div>
</template>

<script>
import { Icon, Button, Popup, Picker, DatetimePicker, Area, Form, Field } from 'vant'
import { areaList } from '@vant/area-data'
import { get } from '@/assets/js/utils/request'
import Steps from '@/components/steps/Steps.vue'
export default {
  name: 'OffshoreAccounts',
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
      USCitizenText: '',
      showConnectionPicker: false,
      connectionTypes: [
        { text: '請選擇', value: '' },
        { text: '是', value: 'Y' },
        { text: '否', value: 'N' }
      ],

    }
  },
  mounted() {

  },
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    onConnectionTypeConfirm(val) {      
      this.USCitizenText = val.text
      this.form.USCitizenValue = val.value
      this.showConnectionPicker = false
    },
    onSubmit1() {
      let kk=this.$refs.formRef.validate().then(res=>{
        console.log(res,999)        
        this.$toast.success('表單驗證通過，正在跳轉...')
        this.$router.push('/TaxDetails')
      }).catch(err=>{
        console.log(err,888)
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

.steps-bar {
  background: linear-gradient(90deg, #5ebc75 0%, #07c160 100%);
  padding: 0 0 12px 0;
  border-radius: 0 0 18px 18px;
  box-shadow: 0 2px 8px rgba(7, 193, 96, 0.08);
}

.steps-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 0 16px;
}

.steps-title {
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
}

.steps-icon {
  font-size: 20px;
  margin-right: 6px;
  color: #fff;
}

.steps-numbers {
  display: flex;
  align-items: center;
  gap: 8px;
}

.step-circle {
  width: 28px;
  height: 28px;
  background: #fff;
  color: #07c160;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
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
