<template>
  <div class="employee-info-page">
    <!-- 顶部步骤条 -->
    <Steps :total="7" :nub="1" title="僱員信息" />
    <div class="form-area">
      <div class="form-title">
        <span class="title-bar"></span>
        僱員信息
      </div>
      <van-form @submit="onSubmit" ref="formRef">
        <div class="form-group">
          <label class="form-label">計劃編碼</label>
          <van-field class="form-input readonly" v-model="form.planCode" readonly />
        </div>
        <div class="form-group">
          <label class="form-label">僱主名稱</label>
          <van-field class="form-input readonly" v-model="form.employerName" readonly />
        </div>

        <div class="form-group">
          <label class="form-label">僱員編號</label>
          <van-field class="form-input readonly" v-model="form.employeeCode" readonly />
        </div>
        <div class="form-group">
          <label class="form-label required">僱員類別</label>
          <van-field 
            class="form-input" 
            v-model="form.employeeType" 
            placeholder="請輸入"
            :rules="[{ required: true, message: '請輸入僱員類別' }]"
          />
        </div>
        <div class="form-group">
          <label class="form-label required">銜接類別</label>
          <div class="input-arrow" @click="showConnectionPicker = true">
            <van-field 
              class="form-input" 
              v-model="form.connectionType" 
              placeholder="請選擇" 
              readonly
              :rules="[{ required: true, message: '請選擇銜接類別' }]"
            />
            <van-icon name="arrow-down" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">中文姓名</label>
          <van-field class="form-input readonly" v-model="form.chineseName" readonly />
        </div>
        <div class="form-group">
          <label class="form-label">外文姓名 <span class="field-tip">(需與身份證相同)</span></label>
          <van-field 
            class="form-input" 
            v-model="form.englishName" 
            placeholder="請輸入"
            :rules="[
              { required: true, message: '請輸入外文姓名' },
              { pattern: /^[a-zA-Z\s]+$/, message: '外文姓名只能包含英文字母和空格' }
            ]"
          />
        </div>
        <div class="form-group">
          <label class="form-label">身份證類別 <span class="field-tip">(需與身份證相同)</span></label>
          <div class="input-arrow" @click="showIdTypePicker = true">
            <van-field 
              class="form-input readonly" 
              v-model="form.idType" 
              readonly
            />
            <van-icon name="arrow-down" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">身份證編碼</label>
          <van-field class="form-input readonly" v-model="form.idNumber" readonly />
        </div>
        <div class="row-flex">
          <div class="form-group flex-1">
            <label class="form-label required">出生日期</label>
            <div class="input-arrow" @click="showBirthDatePicker = true">
              <van-field 
                class="form-input" 
                v-model="form.birthDate" 
                placeholder="請選擇" 
                readonly
                :rules="[{ required: true, message: '請選擇出生日期' }]"
              />
              <van-icon name="calendar-o" />
            </div>
          </div>
          <div class="form-group flex-1 ml8">
            <label class="form-label required">性別</label>
            <div class="gender-group">
              <label class="gender-radio">
                <input type="radio" value="男" v-model="form.gender" />
                <span class="radio-box" :class="{ checked: form.gender === '男' }"></span>男
              </label>
              <label class="gender-radio">
                <input type="radio" value="女" v-model="form.gender" />
                <span class="radio-box" :class="{ checked: form.gender === '女' }"></span>女
              </label>
            </div>
            <van-field 
              v-model="form.gender" 
              :rules="[{ required: true, message: '請選擇性別' }]"
              style="display: none;"
            />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label required">出生地點</label>
          <div class="input-arrow" @click="showBirthPlacePicker = true">
            <van-field 
              class="form-input" 
              v-model="form.birthPlace" 
              placeholder="請選擇" 
              readonly
              :rules="[{ required: true, message: '請選擇出生地點' }]"
            />
            <van-icon name="arrow-down" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label required">國籍/地區</label>
          <div class="input-arrow" @click="showNationalityPicker = true">
            <van-field 
              class="form-input" 
              v-model="form.nationality" 
              placeholder="請選擇" 
              readonly
              :rules="[{ required: true, message: '請選擇國籍/地區' }]"
            />
            <van-icon name="arrow-down" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label required">流動電話</label>
          <van-field 
            class="form-input readonly" 
            v-model="form.mobile" 
            readonly
            :rules="[
              { required: true, message: '請輸入流動電話' },
              { pattern: /^1[3-9]\d{9}$/, message: '請輸入正確的手機號碼' }
            ]"
          />
        </div>
        <div class="form-group">
          <label class="form-label">固定電話</label>
          <van-field 
            class="form-input" 
            v-model="form.phone" 
            label="" 
            placeholder="請輸入"
            :rules="[
              { pattern: /^(\d{3,4}-)?\d{7,8}$/, message: '請輸入正確的固定電話號碼' }
            ]"
          />
        </div>
        <div class="form-group">
          <label class="form-label required">電郵地址</label>
          <van-field 
            class="form-input readonly" 
            v-model="form.email" 
            readonly
            :rules="[
              { required: true, message: '請輸入電郵地址' },
              { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '請輸入正確的電郵地址格式' }
            ]"
          />
        </div>
        <div class="form-group">
          <label class="form-label required">地址（永久地址）</label>
          <div class="input-arrow" @click="showAddressArea = true">
            <van-field 
              class="form-input" 
              :value="addressText" 
              placeholder="请选择" 
              readonly
              :rules="[{ 
                required: true, 
                validator: (val) => {
                  return this.addressText && this.addressText.trim() !== ''
                },
                message: '請選擇地址' 
              }]"
            />
            <van-icon name="arrow-down" />
          </div>
          <van-field 
            class="form-input mt8" 
            v-model="form.addressDetail" 
            placeholder="街道、门牌、大廈、楼层、室"
            :rules="[{ required: true, message: '請輸入詳細地址' }]"
          />
        </div>
        <div class="form-group">
          <label class="form-label">通訊地址 <span class="field-tip">(生與永久地址不同,請填寫此欄。)</span></label>
          <div class="input-arrow" @click="showContactArea = true">
            <van-field 
              class="form-input" 
              :value="contactAddressText" 
              placeholder="请选择" 
              readonly
            />
            <van-icon name="arrow-down" />
          </div>
          <van-field 
            class="form-input mt8" 
            v-model="form.contactDetail" 
            placeholder="街道、门牌、大廈、楼层、室"
          />
        </div>
        <div class="form-group">
          <label class="form-label required">聘用日期</label>
          <div class="input-arrow" @click="showHireDatePicker = true">
            <van-field 
              class="form-input" 
              v-model="form.hireDate" 
              readonly
              :rules="[{ required: true, message: '請選擇聘用日期' }]"
            />
            <van-icon name="calendar-o" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">原參加私退金計劃日期 <span class="field-tip">(新僱員無需填寫)</span></label>
          <div class="input-arrow" @click="showOldPlanDatePicker = true">
            <van-field 
              class="form-input" 
              v-model="form.oldPlanDate" 
              readonly
            />
            <van-icon name="calendar-o" />
          </div>
        </div>
      </van-form>
    </div>
    <div class="btn-group">
      <van-button class="btn-back" type="default" round block @click="onBack">返回</van-button>
      <van-button class="btn-next" type="success" round block @click="onSubmit">下一步</van-button>
    </div>
    <!-- 各类选择器弹窗（省略数据源和事件实现，可根据实际需求补充） -->
    <van-popup v-model="showConnectionPicker" position="bottom">
      <van-picker :columns="connectionTypes" confirm-button-text="確定" cancel-button-text="取消" show-toolbar
        @confirm="onConnectionTypeConfirm" @cancel="showConnectionPicker = false" />
    </van-popup>
    <van-popup v-model="showIdTypePicker" position="bottom">
      <van-picker show-toolbar confirm-button-text="確定" cancel-button-text="取消" :columns="idTypes" @confirm="onIdTypeConfirm"
        @cancel="showIdTypePicker = false" />
    </van-popup>
    <van-popup v-model="showBirthDatePicker" position="bottom">
      <van-datetime-picker confirm-button-text="確定" cancel-button-text="取消" type="date" :min-date="minDate"
        :max-date="maxDate" @confirm="onBirthDateConfirm" @cancel="showBirthDatePicker = false" />
    </van-popup>
    <van-popup v-model="showHireDatePicker" position="bottom">
      <van-datetime-picker confirm-button-text="確定" cancel-button-text="取消" type="date" :min-date="minDate"
        :max-date="maxDate" @confirm="onHireDateConfirm" @cancel="showHireDatePicker = false" />
    </van-popup>
    <van-popup v-model="showOldPlanDatePicker" position="bottom">
      <van-datetime-picker confirm-button-text="確定" cancel-button-text="取消" type="date" :min-date="minDate"
        :max-date="maxDate" @confirm="onOldPlanDateConfirm" @cancel="showOldPlanDatePicker = false" />
    </van-popup>
    <!-- 省市区选择弹窗可根据实际需求补充 -->
    <van-popup v-model="showExamplePicker" position="bottom">
      <van-picker :columns="exampleOptions.map(item => item.label)" @confirm="onExamplePickerConfirm"
        @cancel="showExamplePicker = false" />
    </van-popup>
    <van-popup v-model="showAddressArea" position="bottom">
      <van-area confirm-button-text="確定" cancel-button-text="取消" :area-list="addressAreaList"
        @confirm="onAddressAreaConfirm" @cancel="showAddressArea = false" />
    </van-popup>
    <van-popup v-model="showContactArea" position="bottom">
      <van-area confirm-button-text="確定" cancel-button-text="取消" :area-list="addressAreaList"
        @confirm="onContactAreaConfirm" @cancel="showContactArea = false" />
    </van-popup>
    <van-popup v-model="showBirthPlacePicker" position="bottom">
      <van-picker :columns="birthPlaces" confirm-button-text="確定" cancel-button-text="取消" show-toolbar
        @confirm="onBirthPlaceConfirm" @cancel="showBirthPlacePicker = false" />
    </van-popup>
    <van-popup v-model="showNationalityPicker" position="bottom">
      <van-picker :columns="nationalities" confirm-button-text="確定" cancel-button-text="取消" show-toolbar
        @confirm="onNationalityConfirm" @cancel="showNationalityPicker = false" />
    </van-popup>
  </div>
</template>

<script>
import { Icon, Button, Popup, Picker, DatetimePicker, Area, Form, Field } from 'vant'
import { areaList } from '@vant/area-data'
import { get } from '@/assets/js/utils/request'
import Steps from '@/components/steps/Steps.vue'
export default {
  name: 'EmployeeInformation',
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
        planCode: '123456654321',
        employerName: '僱主',
        employeeCode: '002123453',
        employeeType: '',
        connectionType: '',
        chineseName: '孫大志',
        englishName: '',
        idType: '澳門居民身份證',
        idNumber: '12345678987654',
        birthDate: '',
        gender: '',
        birthPlace: '',
        nationality: '',
        mobile: '13512341234',
        phone: '',
        email: '123321@126.com',
        addressProvince: '',
        addressCity: '',
        addressDistrict: '',
        addressDetail: '',
        contactProvince: '',
        contactCity: '',
        contactDistrict: '',
        contactDetail: '',
        hireDate: '',
        oldPlanDate: '',
        exampleSelect: '', // 选中的值
        exampleSelectLabel: '' // 选中的显示文本
      },
      showConnectionPicker: false,
      showIdTypePicker: false,
      showBirthDatePicker: false,
      showHireDatePicker: false,
      showOldPlanDatePicker: false,
      showExamplePicker: false,
      showAddressArea: false, // 控制永久地址选择弹窗
      addressAreaList: areaList, // 省市区数据
      addressText: '', // 展示已选省市区
      showContactArea: false, // 控制通讯地址选择弹窗
      contactAddressText: '', // 展示已选通讯省市区
      showBirthPlacePicker: false, // 控制出生地点选择弹窗
      showNationalityPicker: false, // 控制国籍选择弹窗
      connectionTypes: ['前員工', '現員工'],
      idTypes: ['澳門居民身份證', '香港居民身份證', '護照'],
      birthPlaces: ['澳門', '香港', '中國內地', '台灣', '其他'],
      nationalities: ['中國', '澳門', '香港', '台灣', '其他'],
      minDate: new Date(1900, 0, 1),
      maxDate: new Date(),
      exampleOptions: [] // 下拉选项
    }
  },
  mounted() {
    this.fetchExampleOptions()
  },
  methods: {
    onBack() {
      this.$router.go(-1)
    },
    async onSubmit() {
      try {
        // 触发表单验证
        const valid = await this.$refs.formRef.validate()
        if (valid) {
          // 额外的业务逻辑验证
          if (this.form.birthDate && this.form.hireDate) {
            const birthYear = new Date(this.form.birthDate).getFullYear()
            const hireYear = new Date(this.form.hireDate).getFullYear()
            const age = hireYear - birthYear
            
            if (age < 16) {
              this.$toast.fail('聘用時年齡不能少於16歲')
              return
            }
            
            if (age > 65) {
              this.$toast.fail('聘用時年齡不能超過65歲')
              return
            }
          }
          
          // 表单验证通过，执行下一步操作
          this.$toast.success('表單驗證通過，正在跳轉...')
          // 这里可以添加跳转到下一步的逻辑
          // this.$router.push('/next-step')
        }
      } catch (error) {
        this.$toast.fail('請檢查表單填寫是否正確')
      }
    },
    onNext() {
      this.onSubmit()
    },
    onConnectionTypeConfirm(val) {
      this.form.connectionType = val
      this.showConnectionPicker = false
    },
    onIdTypeConfirm(val) {
      this.form.idType = val
      this.showIdTypePicker = false
    },
    onBirthDateConfirm(val) {
      this.form.birthDate = this.formatDate(val)
      this.showBirthDatePicker = false
    },
    onHireDateConfirm(val) {
      this.form.hireDate = this.formatDate(val)
      this.showHireDatePicker = false
    },
    onOldPlanDateConfirm(val) {
      this.form.oldPlanDate = this.formatDate(val)
      this.showOldPlanDatePicker = false
    },
    formatDate(date) {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    },
    async fetchExampleOptions() {
      try {
        const res = await get('/api/options')
        // 假设接口返回 [{ label: '选项1', value: '1' }, ...]
        this.exampleOptions = res || []
      } catch (e) {
        this.exampleOptions = []
      }
    },
    onExamplePickerConfirm(val) {
      // Vant Picker 返回的是 label
      const selected = this.exampleOptions.find(item => item.label === val)
      this.form.exampleSelect = selected ? selected.value : ''
      this.form.exampleSelectLabel = val
      this.showExamplePicker = false
    },
    onAddressAreaConfirm(values) {
      this.addressText = values.map(v => v.name).join(' ')
      this.form.addressProvince = values[0] ? values[0].name : ''
      this.form.addressCity = values[1] ? values[1].name : ''
      this.form.addressDistrict = values[2] ? values[2].name : ''
      this.showAddressArea = false
    },
    onContactAreaConfirm(values) {
      this.contactAddressText = values.map(v => v.name).join(' ')
      this.form.contactProvince = values[0] ? values[0].name : ''
      this.form.contactCity = values[1] ? values[1].name : ''
      this.form.contactDistrict = values[2] ? values[2].name : ''
      this.showContactArea = false
    },
    onBirthPlaceConfirm(val) {
      this.form.birthPlace = val
      this.showBirthPlacePicker = false
    },
    onNationalityConfirm(val) {
      this.form.nationality = val
      this.showNationalityPicker = false
    }
  }
}
</script>

<style lang="scss" scoped>
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
