<template>
  <div class="input-arrow">
   
    <van-field
      v-model="displayLabel"
      class="form-input" 
      :label="label"
      :placeholder="placeholder"
      :disabled="disabled"
      readonly      
      :rules="rules"
      @click="showPicker = !disabled"
    />
    <van-icon name="arrow-down" />
    
    <van-popup v-model:show="showPicker" position="bottom">
      <van-picker
        :columns="options"
        confirm-button-text="確定"
        cancel-button-text="取消"
        show-toolbar       
        @cancel="showPicker = false"
        @confirm="onConfirm"
      />
    </van-popup>
    
  </div>
</template>

<script>
import { Icon, Button, Popup, Picker, DatetimePicker, Area, Form, Field } from 'vant'
export default {
  name: 'Select',
  components: {
    [Icon.name]: Icon,
    [Button.name]: Button,
    [Popup.name]: Popup,
    [Picker.name]: Picker,
    [DatetimePicker.name]: DatetimePicker,
    [Area.name]: Area,
    [Form.name]: Form,
    [Field.name]: Field
  },
  props: {
    value: {
      type: [String, Number, Object, Array], // 根据你的实际类型
      default: ''
    },
    options: {
      type: Array,
      required: true
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },    
    rules: {
      type: Array,
      default: () => []
    }
  },
  emits: ['input', 'change'],
  data() {
    return {
      showPicker: false
    };
  },
  computed: {
    displayLabel() {     
      const selected = this.options.find(
        item => item['value'] === this.value
      );
      return selected ? selected['text'] : '';
    }
  },
  methods: {
    onConfirm(option) {      
      this.$emit('input', option.value)
      this.$emit('change', option);
      this.showPicker = false;
    }
  }
};
</script>

<style scoped>

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
</style>
