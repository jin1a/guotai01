import Vue from 'vue'
import Router from 'vue-router'
import App from './app/index'


Vue.use(Router)

const constantRouterMap = [...App] //后续可以删减模块

export default new Router({
  mode: 'hash', //路由模式
  routes: constantRouterMap,
  scrollBehavior: () => ({ y: 0 })
})
