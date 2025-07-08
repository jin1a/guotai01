import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { title: '账户概览' }
        },
        {
          path: 'notification',
          name: 'Notification',
          component: () => import('@/views/Notification.vue'),
          meta: { title: '消息通知' }
        },
        {
          path: 'download',
          name: 'Download',
          component: () => import('@/views/Download.vue'),
          meta: { title: '下载中心' }
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/settings/index.vue'),
          meta: { title: '其他设置' }
        }
      ]
    },
    {
      path: '/company',
      component: Layout,
      children: [
        {
          path: 'info',
          name: 'CompanyInfo',
          component: () => import('@/views/company/info.vue'),
          meta: { title: '企业信息' }
        }
      ]
    },
    {
      path: '/central-fund',
      component: Layout,
      children: [
        {
          path: 'plan',
          name: 'CentralFundPlan',
          component: () => import('@/views/central-fund/plan.vue'),
          meta: { title: '计划管理' }
        },
        {
          path: 'employee',
          name: 'CentralFundEmployee',
          component: () => import('@/views/central-fund/employee.vue'),
          meta: { title: '雇员管理' }
        },
        {
          path: 'contribution',
          name: 'CentralFundContribution',
          component: () => import('@/views/central-fund/contribution.vue'),
          meta: { title: '供款管理' }
        }
      ]
    },
    {
      path: '/private-fund',
      component: Layout,
      children: [
        {
          path: '',
          name: 'PrivateFund',
          component: () => import('@/views/private-fund/index.vue'),
          meta: { title: '澳门私退金' }
        }
      ]
    },
    {
      path: '/system',
      component: Layout,
      meta: { title: '系统管理' },
      children: [
        {
          path: 'users',
          name: 'SystemUsers',
          component: () => import('@/views/system/users.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: 'roles',
          name: 'SystemRoles',
          component: () => import('@/views/system/roles.vue'),
          meta: { title: '角色管理' }
        },
        {
          path: 'departments',
          name: 'SystemDepartments',
          component: () => import('@/views/system/departments.vue'),
          meta: { title: '部门管理' }
        },
        {
          path: 'menus',
          name: 'SystemMenus',
          component: () => import('@/views/system/menus.vue'),
          meta: { title: '菜单管理' }
        },
        {
          path: 'permissions',
          name: 'SystemPermissions',
          component: () => import('@/views/system/permissions.vue'),
          meta: { title: '权限管理' }
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/404.vue')
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 中國人壽（海外）` : '中國人壽（海外）'

  // 检查是否需要登录
  const isAuthenticated = localStorage.getItem('token')
  if (to.path !== '/login' && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router 