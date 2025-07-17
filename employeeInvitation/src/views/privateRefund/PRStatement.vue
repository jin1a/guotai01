<template>
  <div class="employee-info-page">
    <Steps :total="7" :nub="7" title="聲明" />
    <div class="form-area">
      <div class="form-title">
        <span class="title-bar"></span>
        個人稅務居民聲明
      </div>
      <div class="description">
        <div class="content">
          1.本人明白，本人提供的資料適用於帳戶持有人與中國人壽保險(海外)股份有限公司關係的所有條款及細則的規
          範，當中列明中國人壽保險(海外)股份有限公司可如何使用及分享由本人所提供的資料。<br>
          2.本人知悉本表格所載資料和關於帳戶持有人及任何須申報帳戶的資料將向澳門特別行政區政府財政局申報，而
          有關資料將按照金融帳戶信息交換協定，被轉交到帳戶持有人所屬的常居地的司法管轄區的稅務當局。<br>
          3.本人證明，就與本表格所有相關的帳戶，本人是帳戶持有人。<br>
          4.本人承諾，如情況有所改變，以致影響本表格所述的個人稅務居民身份，或引致本表格所載的資料不正確，本
          人會通知中國人壽保險(海外)股份有限公司，並會在情況發生改變後的 30 日內，向中國人壽保險(海外)股份有
          限公司提交一份已適當更新的自證證明表格。<br>
          5.本人聲明就本人所知所信，本表格內所填報的所有資料和聲明均屬真實、正確和完備。<br>
        </div>
      </div>
      <div class="form-title">
        <span class="title-bar"></span>
        個人資料收集聲明
      </div>
      <div class="description">
        <div class="content">
          本保險公司收集閣下提供的資料乃用於本計劃參加及其日常運作之用途，未經許可，不作其他用途。
        </div>
      </div>
      <div class="form-title">
        <span class="title-bar"></span>
        總體聲明
      </div>
      <div class="description">
        <div class="content">
          1.本人確認已閱讀並明白「客戶確認符合《海外帳戶稅收合規法案》和其他適用法律」聲明。本人特此確認並同意提供本人有關國籍，稅務狀況的更新資料及其他資料及本公司可根據本聲明向第三方披露資料。<br>
          2.本人同意本公司為遵循 海外帳戶稅收合規法案 (the “FATCA”)，在本人/我們符合 FATCA 申報要求時，根據規定將本人/我們提供及留存於本公司之任何個人資料提供予美國國稅局，以進行 FATCA 相關申報作業。<br>
          3.本人現申請成為本計劃成員，並授權予本人僱主按本計劃規則或其任何修訂於本人每月薪金中扣除供款。<br>
          4.本表內及其它本人已簽署之文件所載有關本人參加本計劃之資料皆完整及真確。本人已注意到，就本人之申請，中國人壽保險(海外)股份有限公司將根據上述資料處理。<br>
          5.本人同意受本計劃及各有關基金管理規章及第 7/2017 號法律及第 33/2017 號行政法規所約束，同時本人承諾遵守所有有關條款。<br>
          6.就本人於本表內的所有選擇(如適用)，本人願意接受一切責任，並確認「中國人壽保險(海外)股份有限公司」毋須就本人所作之不適當選擇而導致之損失負任何責任。<br>
        </div>
      </div>
    </div>
    <div class="checkbox">
      <van-checkbox v-model="checked">
        本人已確認上述聲明以及所填內容為本人所填寫
      </van-checkbox>
    </div>
    <div class="btn-group">
      <van-button class="btn-back" type="default" round block @click="onBack">返回</van-button>
      <van-button class="btn-next" type="success" round block @click="onSubmit1">下一步</van-button>
    </div>

  </div>
</template>

<script>
import { Icon, Button, Popup, Picker, DatetimePicker, Area, Form, Field, Checkbox } from 'vant'
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
    Steps,
    [Checkbox.name]: Checkbox
  },
  data() {
    return {
      form: {
        planCode: '',
      },
      checked: false,
    }
  },
  mounted() {

  },
  methods: {
    onBack() {
      this.$router.go(-1)
    },

    onSubmit1() {
      this.$router.push('/Signature')
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

.checkbox .van-checkbox__icon {
  border-radius: 2px !important;
}

.checkbox .van-icon {
  border-radius: 2px !important;
}
</style>
