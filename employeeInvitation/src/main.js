import Vue from 'vue'
import App from './App.vue'
import Router from './router'
import Store from './store'
import Filters from '@/filters'
import utils from '@/assets/js/common'
import './icons'
import FastClick from 'fastclick'
import '@/assets/js/generatedValidate/index' //表单校验
import validatorItem from '@/assets/js/generatedValidate/generatedValidateItem' //表单校验
import '@utils/compatible' //兼容性代码
import NoMoreClick from '@/directive/no-more-click'
import VueSignaturePad from 'vue-signature-pad';
//全局注册vant常用组件
import 'vant/lib/index.css'
import 'viewerjs/dist/viewer.css'
import 'quill/dist/quill.snow.css'
import Bus from '@utils/bus'
import { 
  Toast, 
  Form, 
  Loading, 
  Lazyload, 
  Notify, 
  Image, 
  Icon, 
  Button, 
  Tabbar, 
  TabbarItem,
  Locale 
} from 'vant'
import i18n from './i18n'
import generatedFormat from '@/assets/js/generatedFormat/index'
import generatedApi from '@/api/generatedApi/index'
import generatedComponents from './generatedComponents'

// 导入英文语言包
import enUS from 'vant/es/locale/lang/en-US'

for (let item in generatedComponents) {
  Vue.component(item, generatedComponents[item])
}
Vue.use(Image)
Vue.use(Toast)
Vue.use(Form)
Vue.use(Loading)
Vue.use(Lazyload)
Vue.use(Notify)
Vue.use(Icon)
Vue.use(Button)
Vue.use(Tabbar)
Vue.use(TabbarItem)
Vue.use(Lazyload, {
  lazyComponent: true,
})
Vue.use(VueSignaturePad);

// 设置 Vant 组件的语言
Locale.use('zh-HK')

// 全局 防重复点击
Vue.directive('no-more-click', NoMoreClick)

Vue.prototype.$utils = utils
Vue.prototype.$bus = new Bus()
Vue.prototype.$generatedFormat = generatedFormat
Vue.prototype.$generatedApi = generatedApi
Vue.prototype.$generatedDictList = generatedFormat.formatList
Vue.prototype.$validatorItem = { ...validatorItem }

// 注册过滤器
Object.keys(Filters).forEach(function(k) {
  Vue.filter(k, Filters[k])
})

let envFlag = process.env.VUE_APP_FLAG
if (envFlag != 'prd') {
  Vue.config.devtools = true
} else {
  Vue.config.devtools = false
}

//权限控制
import { permission } from '@/assets/js/utils/permission'
permission()

//ios点击300毫秒时延
FastClick.attach(document.body)

// components下的文件全部转化成组件
const files = require.context('@/components/', true, /\.vue$/)
files.keys().map(item => {
  Vue.component(files(item).default.name, files(item).default)
})

Vue.config.productionTip = false

const vm = new Vue({
  router: Router,
  store: Store,
  i18n,
  render: h => h(App)
}).$mount('#app')
window.page = vm
