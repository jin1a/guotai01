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
const OffshoreAccounts = () => import('@/views/employeeInvitation/OffshoreAccounts.vue')
const TaxDetails = () => import('@/views/employeeInvitation/TaxDetails.vue')
const UploadMaterials = () => import('@/views/employeeInvitation/UploadMaterials.vue')
const Signature = () => import('@/views/employeeInvitation/Signature.vue')
const Statement = () => import('@/views/employeeInvitation/Statement.vue')
const ApplicationForm = () => import('@/views/employeeInvitation/ApplicationForm.vue')
// 私人退休金
const PRProtocolSpecification = () => import('@/views/privateRefund/PRProtocolSpecification.vue')
const PREmployeeInformation = () => import('@/views/privateRefund/PREmployeeInformation.vue')
const PRContributionDetails = () => import('@/views/privateRefund/PRContributionDetails.vue')
const PRProjectSelection = () => import('@/views/privateRefund/PRProjectSelection.vue')
const PROffshoreAccounts = () => import('@/views/privateRefund/PROffshoreAccounts.vue')
const PRTaxDetails = () => import('@/views/privateRefund/PRTaxDetails.vue')
const PRUploadMaterials = () => import('@/views/privateRefund/PRUploadMaterials.vue')
const PRSignature = () => import('@/views/privateRefund/PRSignature.vue')
const PRStatement = () => import('@/views/privateRefund/PRStatement.vue')
const PRApplicationForm = () => import('@/views/privateRefund/PRApplicationForm.vue')
const PRBeneficiary = () => import('@/views/privateRefund/PRBeneficiary.vue')
const TTtest = () => import('@/views/privateRefund/TTtest.vue')

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
    path: '/ProtocolSpecification',
    name: 'ProtocolSpecification',
    component: protocolSpecification,
    meta: {
      title: '协议说明'
    }
  },
  {
    path: '/EmployeeInformation',
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
  },
  {
    path: '/OffshoreAccounts',
    name: 'OffshoreAccounts',
    component: OffshoreAccounts,
    meta: {
      title: '海外帳戶稅收合規法案詳情'
    }
  },
  {
    path: '/TaxDetails',
    name: 'TaxDetails',
    component: TaxDetails,
    meta: {
      title: '海外帳戶稅收合規法案詳情'
    }
  },
  {
    path: '/UploadMaterials',
    name: 'UploadMaterials',
    component: UploadMaterials,
    meta: {
      title: '相关材料上传'
    }
  },
  {
    path: '/Signature',
    name: 'Signature',
    component: Signature,
    meta: {
      title: '簽名'
    }
  },
  {
    path: '/Statement',
    name: 'Statement',
    component: Statement,
    meta: {
      title: '聲明'
    }
  },
  {
    path: '/ApplicationForm',
    name: 'ApplicationForm',
    component: ApplicationForm,
    meta: {
      title: '參加計劃申請單'
    }
  },
  // 私人退休金
  {
    path: '/PRProtocolSpecification',
    name: 'PRProtocolSpecification',
    component: PRProtocolSpecification,
    meta: {
      title: '协议说明'
    }
  },
  {
    path: '/PREmployeeInformation',
    name: 'PREmployeeInformation',
    component: PREmployeeInformation,
    meta: {
      title: '僱員信息'
    }
  },
  {
    path: '/PRContributionDetails',
    name: 'PRContributionDetails',
    component: PRContributionDetails,
    meta: {
      title: '供款详情'
    }
  },
  {
    path: '/PRProjectSelection',
    name: 'PRProjectSelection',
    component: PRProjectSelection,
    meta: {
      title: '歸屬於僱員的供款投放項目選擇'
    }
  },
  {
    path: '/PROffshoreAccounts',
    name: 'PROffshoreAccounts',
    component: PROffshoreAccounts,
    meta: {
      title: '海外帳戶稅收合規法案詳情'
    }
  },
  {
    path: '/PRTaxDetails',
    name: 'PRTaxDetails',
    component: PRTaxDetails,
    meta: {
      title: '海外帳戶稅收合規法案詳情'
    }
  },
  {
    path: '/PRUploadMaterials',
    name: 'PRUploadMaterials',
    component: PRUploadMaterials,
    meta: {
      title: '相关材料上传'
    }
  },
  {
    path: '/PRSignature',
    name: 'PRSignature',
    component: PRSignature,
    meta: {
      title: '簽名'
    }
  },
  {
    path: '/PRStatement',
    name: 'PRStatement',
    component: PRStatement,
    meta: {
      title: '聲明'
    }
  },
  {
    path: '/PRApplicationForm',
    name: 'PRApplicationForm',
    component: PRApplicationForm,
    meta: {
      title: '參加計劃申請單'
    }
  },
  {
    path: '/PRBeneficiary',
    name: 'PRBeneficiary',
    component: PRBeneficiary,
    meta: {
      title: '指定受益人'
    }
  },
  {
    path: '/TTtest',
    name: 'TTtest',
    component: TTtest,
    meta: {
      title: 'TTtest'
    }
  }
]
