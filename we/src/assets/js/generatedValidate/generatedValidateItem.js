export default {
  // 默认存在的校验
  mobile: () => {
      return {
        message: () => {
          return '请输入正确的手机号'
        },
        validator: (value) => {
          return value.length === 11 && /^((12|13|14|15|16|17|18|19)[0-9]{1}\d{8})$/.test(value)
        }
      }
    },
    required: () => {
      return {
        message: (file) => {
          return file + '不能为空'
        },
        validator: (value) => {
          return value ? true : false
        }
      }
    },
}