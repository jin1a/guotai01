<template>
  <div class="accept-invitation">
    <!-- 顶部导航 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" @click="onClickLeft" />
      <span>遞交僱員開戶申請</span>
    </div>

    <!-- 步骤条 -->
    <div class="steps-wrapper">
      <div class="step-item active">
        <van-icon name="success" class="success-icon" />
        <span>僱員資料確認</span>
      </div>
      <div class="step-item">2</div>
      <div class="step-item">3</div>
      <div class="step-item">4</div>
      <div class="step-item">5</div>
    </div>

    <!-- 表单内容 -->
    <div class="form-content">
      <div class="section-title">
        <div class="title-bar"></div>
        <span>僱員信息</span>
      </div>
      
      <div class="form-group">
        <div class="form-row">
          <div class="label">計劃編碼</div>
          <div class="value-box">12345665321</div>
        </div>
        <div class="form-row">
          <div class="label">僱主名稱</div>
          <div class="value-box">僱主</div>
        </div>
      </div>

      <div class="form-group">
        <div class="form-row">
          <div class="label">僱員編號</div>
          <div class="value-box">002123453</div>
        </div>
      </div>

      <div class="form-item">
        <label class="required">僱員類別</label>
        <input type="text" placeholder="請輸入" />
      </div>

      <div class="form-item">
        <label class="required">銜接類別</label>
        <div class="select-box" @click="showConnectionPicker = true">
          <span class="placeholder">請選擇</span>
          <van-icon name="arrow" />
        </div>
      </div>

      <div class="form-item">
        <label>中文姓名</label>
        <div class="value-box">孫大志</div>
      </div>

      <div class="form-item">
        <label class="required">外文姓名</label>
        <div class="input-wrapper">
          <input type="text" placeholder="請輸入" />
          <span class="tip">(需與身份證相同)</span>
        </div>
      </div>

      <div class="form-item">
        <label>身份證類別</label>
        <div class="select-box" @click="showIdTypePicker = true">
          <span>澳門居民身份證</span>
          <van-icon name="arrow" />
        </div>
      </div>

      <div class="form-item">
        <label>身份證號碼</label>
        <div class="value-box">123456789876543</div>
      </div>

      <div class="form-item">
        <label class="required">出生日期</label>
        <div class="date-picker" @click="showDatePicker = true">
          <span class="placeholder">請選擇</span>
          <van-icon name="calendar-o" />
        </div>
      </div>

      <div class="form-item">
        <label class="required">性別</label>
        <div class="radio-group">
          <div class="radio-item">
            <input type="radio" id="male" name="gender" value="male" />
            <label for="male">男</label>
          </div>
          <div class="radio-item">
            <input type="radio" id="female" name="gender" value="female" />
            <label for="female">女</label>
          </div>
        </div>
      </div>
    </div>

    <!-- Popups -->
    <van-popup v-model="showConnectionPicker" position="bottom">
      <van-picker
        show-toolbar
        :columns="connectionTypes"
        @confirm="onConnectionTypeConfirm"
        @cancel="showConnectionPicker = false"
      />
    </van-popup>

    <van-popup v-model="showIdTypePicker" position="bottom">
      <van-picker
        show-toolbar
        :columns="idTypes"
        @confirm="onIdTypeConfirm"
        @cancel="showIdTypePicker = false"
      />
    </van-popup>

    <van-popup v-model="showDatePicker" position="bottom">
      <van-datetime-picker
        type="date"
        :min-date="minDate"
        :max-date="maxDate"
        @confirm="onDateConfirm"
        @cancel="showDatePicker = false"
      />
    </van-popup>
  </div>
</template>

<script>
export default {
  name: 'AcceptInvitation',
  data() {
    return {
      formData: {
        planCode: '12345665321',
        employerName: '僱主',
        employeeCode: '002123453',
        employeeType: '',
        connectionType: '',
        chineseName: '孫大志',
        englishName: '',
        idType: '澳門居民身份證',
        idNumber: '123456789876543',
        birthDate: '',
        gender: ''
      },
      showConnectionPicker: false,
      showIdTypePicker: false,
      showDatePicker: false,
      connectionTypes: ['類型1', '類型2', '類型3'],
      idTypes: ['澳門居民身份證', '香港居民身份證', '其他'],
      minDate: new Date(1900, 0, 1),
      maxDate: new Date()
    }
  },
  methods: {
    onClickLeft() {
      this.$router.go(-1)
    },
    onConnectionTypeConfirm(value) {
      this.formData.connectionType = value
      this.showConnectionPicker = false
    },
    onIdTypeConfirm(value) {
      this.formData.idType = value
      this.showIdTypePicker = false
    },
    onDateConfirm(value) {
      this.formData.birthDate = this.formatDate(value)
      this.showDatePicker = false
    },
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
}
</script>

<style lang="scss" scoped>
.accept-invitation {
  min-height: 100vh;
  background-color: #f7f8fa;

  .nav-bar {
    display: flex;
    align-items: center;
    height: 44px;
    padding: 0 16px;
    background: #fff;
    border-bottom: 1px solid #eee;

    .van-icon {
      font-size: 20px;
      margin-right: 8px;
    }

    span {
      font-size: 16px;
      color: #333;
    }
  }

  .steps-wrapper {
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding: 12px 16px;
    background: #07c160;

    .step-item {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #fff;
      color: #07c160;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;

      &.active {
        background: transparent;
        color: #fff;
        display: flex;
        align-items: center;

        .success-icon {
          font-size: 20px;
        }

        span {
          font-size: 12px;
          margin-left: 4px;
        }
      }
    }
  }

  .form-content {
    background: #fff;
    margin-top: 12px;

    .section-title {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #eee;

      .title-bar {
        width: 4px;
        height: 16px;
        background: #07c160;
        margin-right: 8px;
        border-radius: 2px;
      }

      span {
        font-size: 16px;
        color: #333;
        font-weight: 500;
      }
    }

    .form-group {
      background: #f8f8f8;
      margin: 12px 16px;
      border-radius: 4px;
      padding: 12px;

      .form-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          width: 80px;
          color: #666;
          font-size: 14px;
        }

        .value-box {
          flex: 1;
          background: #f0f0f0;
          padding: 8px 12px;
          border-radius: 4px;
          color: #333;
          font-size: 14px;
        }
      }
    }

    .form-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid #f5f5f5;

      label {
        width: 90px;
        color: #333;
        font-size: 14px;

        &.required::before {
          content: '*';
          color: #ee0a24;
          margin-right: 2px;
        }
      }

      .value-box {
        flex: 1;
        background: #f8f8f8;
        padding: 8px 12px;
        border-radius: 4px;
        color: #333;
        font-size: 14px;
      }

      input {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        font-size: 14px;
        color: #333;
        text-align: right;

        &::placeholder {
          color: #999;
        }
      }

      .input-wrapper {
        flex: 1;
        display: flex;
        align-items: center;

        .tip {
          font-size: 12px;
          color: #999;
          margin-left: 4px;
        }
      }

      .select-box {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .placeholder {
          color: #999;
        }

        .van-icon {
          margin-left: 4px;
          color: #999;
        }
      }

      .date-picker {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: flex-end;

        .placeholder {
          color: #999;
        }

        .van-icon {
          margin-left: 4px;
          color: #999;
        }
      }

      .radio-group {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        gap: 16px;

        .radio-item {
          display: flex;
          align-items: center;

          input[type="radio"] {
            margin-right: 4px;
          }

          label {
            width: auto;
          }
        }
      }
    }
  }
}
</style> 