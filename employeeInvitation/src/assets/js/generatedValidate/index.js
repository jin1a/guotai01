import Vue from 'vue'
import VeeValidate, { Validator } from 'vee-validate'
import zh_CN from 'vee-validate/dist/locale/zh_CN'
import validateItem from './generatedValidateItem'
// 解决fileds重复定义报错的问题
// 解决fileds重复定义报错的问题
const config = {
  errorBagName: 'errorBags', // change if property conflicts.
  fieldsBagName: 'fieldBags'
}

Vue.use(VeeValidate, config)
Validator.locale = 'zh_CN'
Validator.localize('zh_CN', {
  messages: zh_CN.messages
})
/*自定义校验规则*/
for (let item in validateItem) {
  console.log(item)
  Validator.extend(item, {
    getMessage: validateItem[item]().message,
    validate: validateItem[item]().validator
  })
}
