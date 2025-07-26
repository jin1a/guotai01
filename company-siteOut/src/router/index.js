import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/company-register',
      name: 'CompanyRegister',
      component: () => import('@/views/CompanyRegister.vue'),
      meta: { title: '企业首次注册' }
    },
    {
      path: '/account-upgrade',
      name: 'AccountUpgrade',
      component: () => import('@/views/AccountUpgrade.vue'),
      meta: { title: '账号升级' }
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
          path: 'electronic-notice',
          name: 'ElectronicNotice',
          component: () => import('@/views/ElectronicNotice.vue'),
          meta: { title: '电子通知书' }
        },
        {
          path: 'service-progress',
          name: 'ServiceProgress',
          component: () => import('@/views/service-progress/index.vue'),
          meta: { title: '服务进度' }
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
      path: '/central-auto-contribution',
      component: Layout,
      children: [
        {
          path: 'notice',
          name: 'CentralAutoContributionNotice',
          component: () => import('@/views/central-auto-contribution/notice.vue'),
          meta: { title: '央积金缴费通知书查询' }
        },
        {
          path: 'upload',
          name: 'CentralAutoContributionUpload',
          component: () => import('@/views/central-auto-contribution/upload.vue'),
          meta: { title: '央积金提交供款凭证' }
        },
        {
          path: 'records',
          name: 'CentralAutoContributionRecords',
          component: () => import('@/views/central-auto-contribution/records.vue'),
          meta: { title: '央积金供款记录查询' }
        }
      ]
    },
    {
      path: '/private-auto-contribution',
      component: Layout,
      children: [
        {
          path: 'notice',
          name: 'PrivateAutoContributionNotice',
          component: () => import('@/views/private-auto-contribution/notice.vue'),
          meta: { title: '私退金缴费通知书查询' }
        },
        {
          path: 'upload',
          name: 'PrivateAutoContributionUpload',
          component: () => import('@/views/private-auto-contribution/upload.vue'),
          meta: { title: '私退金提交供款凭证' }
        },
        {
          path: 'records',
          name: 'PrivateAutoContributionRecords',
          component: () => import('@/views/private-auto-contribution/records.vue'),
          meta: { title: '私退金供款记录查询' }
        }
      ]
    },
    {
      path: '/contribution-adjustment',
      component: Layout,
      children: [
        {
          path: 'request',
          name: 'ContributionAdjustmentRequest',
          component: () => import('@/views/contribution-adjustment/request.vue'),
          meta: { title: '供款调整申请' }
        }
      ]
    },
    {
      path: '/pending-tasks',
      component: Layout,
      children: [
        {
          path: 'contribution-review',
          name: 'PendingTasksContributionReview',
          component: () => import('@/views/pending-tasks/contribution-review.vue'),
          meta: { title: '供款清单审核' }
        },
        {
          path: 'adjustment-review',
          name: 'PendingTasksAdjustmentReview',
          component: () => import('@/views/pending-tasks/adjustment-review.vue'),
          meta: { title: '供款调整复核' }
        }
      ]
    },
    {
      path: '/service-progress',
      component: Layout,
      children: [
        {
          path: 'auto-contribution',
          name: 'ServiceProgressAutoContribution',
          component: () => import('@/views/service-progress/auto-contribution.vue'),
          meta: { title: '自动供款服务进度查询' }
        },
        {
          path: 'contribution-request',
          name: 'ServiceProgressContributionRequest',
          component: () => import('@/views/service-progress/contribution-request.vue'),
          meta: { title: '供款调整申请进度查询' }
        },
        {
          path: 'history',
          name: 'ServiceProgressHistory',
          component: () => import('@/views/service-progress/index.vue'),
          meta: { title: '历史服务查询' }
        },
        {
          path: 'detail',
          name: 'ServiceProgressDetail',
          component: () => import('@/views/service-progress/detail.vue'),
          meta: { title: '服务进度详情' }
        }
      ]
    },
    {
      path: '/central-fund',
      component: Layout,
      children: [
        {
          path: 'todo',
          name: 'CentralFundTodo',
          component: () => import('@/views/central-fund/todo.vue'),
          meta: { title: '央积金待办列表' }
        },
        {
          path: 'employee',
          name: 'CentralFundEmployee',
          component: () => import('@/views/central-fund/employee.vue'),
          meta: { title: '央积金雇员管理' }
        },
        {
          path: 'employee/detail/:id',
          name: 'CentralFundEmployeeDetail',
          component: () => import('@/views/central-fund/employee-detail.vue'),
          meta: { title: '僱員詳情' }
        },
        {
          path: 'auto-contribution/payment-notice',
          name: 'CentralFundAutoContributionNotice',
          component: () => import('@/views/central-auto-contribution/notice.vue'),
          meta: { title: '央积金缴费通知书查询' }
        },
        {
          path: 'auto-contribution/notice-detail/:id',
          name: 'CentralFundNoticeDetail',
          component: () => import('@/views/central-fund/auto-contribution/notice-detail.vue'),
          meta: { title: '缴费通知书详情' }
        },
        {
          path: 'auto-contribution/submit-voucher',
          name: 'CentralFundAutoContributionUpload',
          component: () => import('@/views/central-fund/auto-contribution/submit-voucher.vue'),
          meta: { title: '央积金提交供款凭证' }
        },
        {
          path: 'auto-contribution/upload-voucher',
          name: 'CentralFundUploadVoucher',
          component: () => import('@/views/central-fund/auto-contribution/upload-voucher.vue'),
          meta: { title: '上传供款凭证' }
        },
        {
          path: 'auto-contribution/upload-detail/:id',
          name: 'CentralFundUploadDetail',
          component: () => import('@/views/central-fund/auto-contribution/upload-detail.vue'),
          meta: { title: '凭证上传详情' }
        },
        {
          path: 'auto-contribution/contribution-history',
          name: 'CentralFundContributionHistory',
          component: () => import('@/views/central-fund/contribution-history.vue'),
          meta: { title: '央积金供款历史查询' }
        },
        {
          path: 'auto-contribution/contribution-history/detail/:id',
          name: 'CentralFundContributionHistoryDetail',
          component: () => import('@/views/central-fund/contribution-history-detail.vue'),
          meta: { title: '央积金供款历史详情' }
        },
        {
          path: 'manual-contribution/submit-voucher',
          name: 'CentralFundManualContributionUpload',
          component: () => import('@/views/central-fund/manual-contribution/upload.vue'),
          meta: { title: '央积金手动供款凭证上传' }
        },
        {
          path: 'manual-contribution/contribution-records',
          name: 'CentralFundManualContributionRecords',
          component: () => import('@/views/central-fund/manual-contribution/records.vue'),
          meta: { title: '央积金手动供款记录' }
        },
        {
          path: 'manual-contribution/record-detail',
          name: 'CentralFundManualContributionRecordDetail',
          component: () => import('@/views/central-fund/manual-contribution/record-detail.vue'),
          meta: { title: '手动供款记录详情' }
        },
        {
          path: 'contribution-adjustment',
          name: 'CentralFundAdjustment',
          component: () => import('@/views/central-fund/contribution-adjustment/index.vue'),
          meta: { title: '央积金供款调整' }
        },
        {
          path: 'online/join-application',
          name: 'CentralFundJoinApplication',
          component: () => import('@/views/central-fund/online/employee-invite.vue'),
          meta: { title: '央积金新加入计划申请' }
        },
        {
          path: 'online/termination-application',
          name: 'CentralFundTerminationApplication',
          component: () => import('@/views/central-fund/online/termination-application.vue'),
          meta: { title: '央积金终止参与计划申请' }
        },
        {
          path: 'online/transfer-application',
          name: 'CentralFundTransferApplication',
          component: () => import('@/views/central-fund/online/transfer-application.vue'),
          meta: { title: '央积金调职申请' }
        },
        {
          path: 'online/salary-adjustment',
          name: 'CentralFundSalaryAdjustment',
          component: () => import('@/views/central-fund/online/salary-adjustment.vue'),
          meta: { title: '央积金薪资调整申请' }
        },
        // 雇主供款模块路由
        {
          path: 'employer-contribution/auto-bill',
          name: 'CentralFundEmployerContributionAutoBill',
          component: () => import('@/views/central-fund/employer-contribution/auto-bill.vue'),
          meta: { title: '央积金自动供款账单' }
        },
        {
          path: 'employer-contribution/manual-bill',
          name: 'CentralFundEmployerContributionManualBill',
          component: () => import('@/views/central-fund/employer-contribution/manual-bill.vue'),
          meta: { title: '央积金手动供款账单' }
        },
        {
          path: 'employer-contribution/submit-list',
          name: 'CentralFundEmployerContributionSubmitList',
          component: () => import('@/views/central-fund/employer-contribution/submit-list.vue'),
          meta: { title: '央积金提交供款清单' }
        },
        {
          path: 'employer-contribution/records-query',
          name: 'CentralFundEmployerContributionRecordsQuery',
          component: () => import('@/views/central-fund/employer-contribution/records-query.vue'),
          meta: { title: '央积金供款记录查询' }
        },
        {
          path: 'employer-contribution/records-detail/:id',
          name: 'CentralFundEmployerContributionRecordsDetail',
          component: () => import('@/views/central-fund/employer-contribution/records-detail.vue'),
          meta: { title: '供款记录详情' }
        },
        {
          path: 'employer-contribution/manual-bill-detail/:id',
          name: 'CentralFundEmployerContributionManualBillDetail',
          component: () => import('@/views/central-fund/employer-contribution/manual-bill-detail.vue'),
          meta: { title: '央积金手动供款账单详情' }
        }
      ]
    },
    {
      path: '/private-fund',
      component: Layout,
      children: [
        {
          path: 'todo',
          name: 'PrivateFundTodo',
          component: () => import('@/views/private-fund/todo.vue'),
          meta: { title: '私退金待办列表' }
        },
        {
          path: 'index',
          name: 'PrivateFundEmployee',
          component: () => import('@/views/private-fund/index.vue'),
          meta: { title: '私退金雇员管理' }
        },
        {
          path: 'auto-contribution/payment-notice',
          name: 'PrivateFundAutoContributionNotice',
          component: () => import('@/views/private-auto-contribution/notice.vue'),
          meta: { title: '私退金缴费通知书查询' }
        },
        {
          path: 'auto-contribution/submit-voucher',
          name: 'PrivateFundAutoContributionUpload',
          component: () => import('@/views/private-auto-contribution/upload.vue'),
          meta: { title: '私退金提交供款凭证' }
        },
        {
          path: 'auto-contribution/contribution-history',
          name: 'PrivateFundContributionHistory',
          component: () => import('@/views/private-fund/contribution-history.vue'),
          meta: { title: '私退金供款历史查询' }
        },
        {
          path: 'auto-contribution/contribution-history/detail/:id',
          name: 'PrivateFundContributionHistoryDetail',
          component: () => import('@/views/private-fund/contribution-history-detail.vue'),
          meta: { title: '私退金供款历史详情' }
        },
        {
          path: 'manual-contribution/submit-voucher',
          name: 'PrivateFundManualContributionUpload',
          component: () => import('@/views/private-fund/manual-contribution/upload.vue'),
          meta: { title: '私退金手动供款凭证上传' }
        },
        {
          path: 'manual-contribution/contribution-records',
          name: 'PrivateFundManualContributionRecords',
          component: () => import('@/views/private-fund/manual-contribution/records.vue'),
          meta: { title: '私退金手动供款记录' }
        },
        {
          path: 'contribution-adjustment',
          name: 'PrivateFundAdjustment',
          component: () => import('@/views/private-fund/contribution-adjustment/index.vue'),
          meta: { title: '私退金供款调整' }
        },
        {
          path: 'online/join-application',
          name: 'PrivateFundJoinApplication',
          component: () => import('@/views/private-fund/online/employee-invite.vue'),
          meta: { title: '私退金新加入计划申请' }
        },
        {
          path: 'online/termination-application',
          name: 'PrivateFundTerminationApplication',
          component: () => import('@/views/private-fund/online/termination-application.vue'),
          meta: { title: '私退金终止参与计划申请' }
        },
        {
          path: 'online/transfer-application',
          name: 'PrivateFundTransferApplication',
          component: () => import('@/views/private-fund/online/transfer-application.vue'),
          meta: { title: '私退金调职申请' }
        },
        {
          path: 'online/salary-adjustment',
          name: 'PrivateFundSalaryAdjustment',
          component: () => import('@/views/private-fund/online/salary-adjustment.vue'),
          meta: { title: '私退金薪资调整申请' }
        },
        // 雇主供款模块路由
        {
          path: 'employer-contribution/auto-bill',
          name: 'PrivateFundEmployerContributionAutoBill',
          component: () => import('@/views/private-fund/employer-contribution/auto-bill.vue'),
          meta: { title: '私退金自动供款账单' }
        },
        {
          path: 'employer-contribution/manual-bill',
          name: 'PrivateFundEmployerContributionManualBill',
          component: () => import('@/views/private-fund/employer-contribution/manual-bill.vue'),
          meta: { title: '私退金手动供款账单' }
        },
        {
          path: 'employer-contribution/submit-list',
          name: 'PrivateFundEmployerContributionSubmitList',
          component: () => import('@/views/private-fund/employer-contribution/submit-list.vue'),
          meta: { title: '私退金提交供款清单' }
        },
        {
          path: 'employer-contribution/records-query',
          name: 'PrivateFundEmployerContributionRecordsQuery',
          component: () => import('@/views/private-fund/employer-contribution/records-query.vue'),
          meta: { title: '私退金供款记录查询' }
        },
        {
          path: 'employer-contribution/records-detail/:id',
          name: 'PrivateFundEmployerContributionRecordsDetail',
          component: () => import('@/views/private-fund/employer-contribution/records-detail.vue'),
          meta: { title: '私退金供款记录详情' }
        },
        {
          path: 'employer-contribution/manual-bill-detail/:id',
          name: 'PrivateFundEmployerContributionManualBillDetail',
          component: () => import('@/views/private-fund/employer-contribution/manual-bill-detail.vue'),
          meta: { title: '私退金手动供款账单详情' }
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
  const publicRoutes = ['/login', '/company-register', '/account-upgrade']
  
  if (!publicRoutes.includes(to.path) && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router