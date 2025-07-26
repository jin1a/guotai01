import router from './index'
import { useUserStore } from '@/stores/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 白名单路由
const whiteList = ['/login', '/404']

// 路由守卫 - 暂时禁用登录检测
router.beforeEach(async (to, from, next) => {
  NProgress.start()
  
  // 直接放行所有路由，不检查登录状态
  next()
  
  // 原有的登录检测逻辑已被注释
  /*
  const userStore = useUserStore()
  const hasToken = userStore.token

  if (hasToken) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasUserInfo = userStore.userInfo && Object.keys(userStore.userInfo).length > 0
      if (hasUserInfo) {
        next()
      } else {
        try {
          await userStore.getUserInfo()
          next({ ...to, replace: true })
        } catch (error) {
          await userStore.logout()
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
  */
})

router.afterEach(() => {
  NProgress.done()
}) 