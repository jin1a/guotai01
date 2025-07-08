//权限控制
import router from '@/router'
export function permission() {
  router.beforeEach(async (to, from, next) => {
    document.title = to.meta.title ? to.meta.title : '退休金'
    //判断是否登录
    let token = localStorage.token
    if (!token) {
      localStorage.token = ''
      //无token，判断是否需要登录
      if (to.meta.auth) {
        next(`/login?redirect=${to.path}`)
      } else {
        next()
      }
    } else {
      if (to.path === '/login') {
        next({ path: '/' })
      } else {
        next()
      }
    }
  })
}
