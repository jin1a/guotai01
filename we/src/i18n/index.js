import Vue from 'vue'
import VueI18n from 'vue-i18n'
import enUS from './locales/en-US'
import zhHK from './locales/zh-HK'

Vue.use(VueI18n)

const messages = {
  'en-US': enUS,
  'zh-HK': zhHK
}

// 获取浏览器语言设置
const getBrowserLang = function() {
  let browserLang = navigator.language
  let defaultBrowserLang = ''
  if (browserLang.toLowerCase() === 'zh-hk' || browserLang.toLowerCase() === 'zh-tw' || browserLang.toLowerCase() === 'zh-hant') {
    defaultBrowserLang = 'zh-HK'
  } else {
    defaultBrowserLang = 'en-US'
  }
  return defaultBrowserLang
}

const i18n = new VueI18n({
  locale: localStorage.getItem('language') || 'zh-HK',
  messages
})

export default i18n 