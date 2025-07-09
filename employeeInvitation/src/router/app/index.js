/*
 * @name:
 * @author: Zhang Weiwei
 * @created_date: Do not edit
 * @description:
 */
// 用途：app模块路由配置
//定义相关组件
const notFound = () => import('@/views/app/404')
const home = () => import('@/views/app/Home.vue')
// const contributionDetails = () => import('@/views/app/accountOpeningApplication/ContributionDetails.vue')
const mine = () => import('@/views/app/Mine.vue')
const products = () => import('@/views/app/Products.vue')
const services = () => import('@/views/app/Services.vue')
const identityVerification = () => import('@/views/index.vue')
const protocolSpecification = () => import('@/views/employeeInvitation/ProtocolSpecification.vue')
const employeeInformation = () => import('@/views/employeeInvitation/EmployeeInformation.vue')
const ContributionDetails = () => import('@/views/employeeInvitation/ContributionDetails.vue')
const ProjectSelection = () => import('@/views/employeeInvitation/ProjectSelection.vue')

export default [
  {
    path: '/404',
    component: notFound,
    meta: {
      title: '404'
    }
  },
  {
    path: '*',
    redirect: '/404'
  },
  {
    path: '/',
    name: 'identity-verification',
    component: identityVerification,
    meta: {
      title: '身份驗證'
    }
  },
  {
    path: '/home',
    name: 'home',
    component: home,
    meta: {
      title: '首頁'
    }
  },
  // {
  //   path: '/contributionDetails',
  //   component: contributionDetails
  // },
  {
    path: '/mine',
    name: 'mine',
    component: mine,
    meta: {
      title: '我的',
      keepAlive: true
    }
  },
  {
    path: '/products',
    name: 'products',
    component: products,
    meta: {
      title: '商品',
      keepAlive: true
    }
  },
  {
    path: '/services',
    name: 'services',
    component: services,
    meta: {
      title: '服務',
      keepAlive: true
    }
  },
  {
    path: '/employee-invitation',
    name: 'EmployeeInvitation',
    component: () => import('@/views/app/employeeInvitation/AcceptInvitation.vue'),
    meta: {
      title: '遞交僱員開戶申請'
    }
  },
  {
    path: '/protocol-specification',
    name: 'ProtocolSpecification',
    component: protocolSpecification,
    meta: {
      title: '协议说明'
    }
  },
  {
    path: '/employee-information',
    name: 'EmployeeInformation',
    component: employeeInformation,
    meta: {
      title: '僱員信息'
    }
  },
  {
    path: '/ContributionDetails',
    name: 'ContributionDetails',
    component: ContributionDetails,
    meta: {
      title: '供款详情'
    }
  },
  {
    path: '/ProjectSelection',
    name: 'ProjectSelection',
    component: ProjectSelection,
    meta: {
      title: '歸屬於僱員的供款投放項目選擇'
    }
  }
]
