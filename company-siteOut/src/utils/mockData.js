// 模拟企业数据和计划信息

// 根据token获取企业信息的模拟数据
export const getCompanyInfoByToken = (token) => {
  // 模拟不同的企业数据
  const companies = {
    'demo-token-001': {
      name: '香港科技有限公司',
      code: 'HK001234567',
      email: 'hr@hktech.com',
      phone: '+852 2123 4567',
      address: '香港中環金融街88號25樓',
      industry: '信息技術服務業',
      registrationDate: '2020-03-15',
      contactPerson: '張經理'
    },
    'demo-token-002': {
      name: '港島貿易集團',
      code: 'HK007891234',
      email: 'admin@hktrading.com.hk',
      phone: '+852 2987 6543',
      address: '香港灣仔軒尼詩道123號18樓',
      industry: '進出口貿易',
      registrationDate: '2018-07-22',
      contactPerson: '李總監'
    },
    'demo-token-003': {
      name: '九龍製造實業',
      code: 'HK005567890',
      email: 'contact@klmanufacturing.hk',
      phone: '+852 2345 6789',
      address: '香港九龍長沙灣工業大廈B座10樓',
      industry: '製造業',
      registrationDate: '2015-11-08',
      contactPerson: '王廠長'
    }
  }

  // 如果是demo模式或者token不存在，返回默认企业信息
  if (token === 'demo' || !companies[token]) {
    return companies['demo-token-001']
  }

  return companies[token]
}

// 根据企业代码获取计划信息
export const getPlanInfoByCompany = (companyCode) => {
  const planConfigs = {
    'HK001234567': [
      {
        id: 1,
        name: '央積金共同計劃',
        type: 'central',
        icon: 'el-icon-bank-card',
        planCode: 'MPF-HK001-2024',
        employeeCount: 156,
        status: 'active',
        statusText: '運行中',
        active: true,
        startDate: '2020-04-01',
        contributionRate: {
          employee: '5%',
          employer: '5%'
        }
      },
      {
        id: 2,
        name: '私退金共同計劃',
        type: 'private',
        icon: 'el-icon-wallet',
        planCode: 'ORSO-HK001-2024',
        employeeCount: 89,
        status: 'pending',
        statusText: '待激活',
        active: false,
        startDate: '2024-01-01',
        contributionRate: {
          employee: '5%',
          employer: '10%'
        }
      }
    ],
    'HK007891234': [
      {
        id: 1,
        name: '央積金共同計劃',
        type: 'central',
        icon: 'el-icon-bank-card',
        planCode: 'MPF-HK007-2024',
        employeeCount: 234,
        status: 'active',
        statusText: '運行中',
        active: true,
        startDate: '2018-08-01',
        contributionRate: {
          employee: '5%',
          employer: '5%'
        }
      }
    ],
    'HK005567890': [
      {
        id: 1,
        name: '央積金共同計劃',
        type: 'central',
        icon: 'el-icon-bank-card',
        planCode: 'MPF-HK005-2024',
        employeeCount: 445,
        status: 'active',
        statusText: '運行中',
        active: true,
        startDate: '2016-01-01',
        contributionRate: {
          employee: '5%',
          employer: '5%'
        }
      },
      {
        id: 2,
        name: '私退金共同計劃',
        type: 'private',
        icon: 'el-icon-wallet',
        planCode: 'ORSO-HK005-2024',
        employeeCount: 320,
        status: 'active',
        statusText: '運行中',
        active: true,
        startDate: '2017-06-01',
        contributionRate: {
          employee: '6%',
          employer: '12%'
        }
      }
    ]
  }

  return planConfigs[companyCode] || planConfigs['HK001234567']
}

// 验证邮箱注册token
export const validateEmailToken = (token) => {
  // 模拟token验证逻辑
  const validTokens = [
    'demo-token-001',
    'demo-token-002', 
    'demo-token-003',
    'email-verify-abc123',
    'email-verify-def456',
    'email-verify-ghi789'
  ]

  // demo模式总是有效
  if (token === 'demo') {
    return {
      valid: true,
      companyCode: 'HK001234567',
      expiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24小时后过期
      issuedAt: new Date()
    }
  }

  return {
    valid: validTokens.includes(token),
    companyCode: token.includes('001') ? 'HK001234567' : 
                token.includes('002') ? 'HK007891234' : 'HK005567890',
    expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
    issuedAt: new Date()
  }
}

// 生成模拟的用户注册成功数据
export const generateUserData = (registerForm, companyInfo) => {
  return {
    token: `company-user-${companyInfo.code}-${Date.now()}`,
    userInfo: {
      id: Math.floor(Math.random() * 10000) + 1000,
      username: registerForm.username,
      email: companyInfo.email,
      companyName: companyInfo.name,
      companyCode: companyInfo.code,
      role: 'company_admin',
      permissions: ['central-fund:*', 'private-fund:*', 'system:view'],
      createTime: new Date().toISOString(),
      lastLoginTime: new Date().toISOString(),
      status: 'active'
    }
  }
}

// 模拟邮箱发送功能
export const sendRegistrationEmail = (companyEmail, companyName) => {
  // 生成模拟token
  const token = `demo-token-${Date.now()}`
  const registrationLink = `${window.location.origin}/company-register?token=${token}`
  
  console.log('=== 模拟邮箱发送 ===')
  console.log('收件人:', companyEmail)
  console.log('企业名称:', companyName)
  console.log('注册链接:', registrationLink)
  console.log('=====================')
  
  // 模拟邮件内容
  const emailContent = {
    to: companyEmail,
    subject: '中國人壽（海外）企業賬戶開通邀請',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2C8976; color: white; padding: 20px; text-align: center;">
          <h1>中國人壽（海外）</h1>
          <h2>企業賬戶開通邀請</h2>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <p>親愛的 ${companyName} 負責人：</p>
          <p>感謝您選擇中國人壽（海外）的服務。請點擊以下鏈接完成企業賬戶的開通設置：</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${registrationLink}" 
               style="background: #ffb700; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 25px; font-weight: bold;">
              立即開通賬戶
            </a>
          </div>
          <p><strong>注意事項：</strong></p>
          <ul>
            <li>此鏈接有效期為24小時</li>
            <li>請妥善保管您的登錄資訊</li>
            <li>如有疑問，請聯繫客服熱線：(852) 3999 5519</li>
          </ul>
        </div>
        <div style="background: #666; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>中國人壽保險(海外)股份有限公司 © 2024 版權所有</p>
        </div>
      </div>
    `,
    sentAt: new Date().toISOString(),
    token: token
  }
  
  return emailContent
}

// ================== 账号升级相关功能 ==================

// 验证计划号
export const validatePlanCode = (planCode) => {
  const validPlanCodes = [
    'MPF-HK001-2024',
    'ORSO-HK001-2024', 
    'MPF-HK007-2024',
    'MPF-HK005-2024',
    'ORSO-HK005-2024',
    'MPF-DEMO-2024',
    'ORSO-DEMO-2024'
  ]
  
  return {
    valid: validPlanCodes.includes(planCode),
    planCode: planCode,
    validatedAt: new Date().toISOString()
  }
}

// 根据计划号获取企业信息
export const getCompanyInfoByPlanCode = (planCode) => {
  // 计划号到企业的映射
  const planToCompanyMap = {
    'MPF-HK001-2024': 'HK001234567',
    'ORSO-HK001-2024': 'HK001234567',
    'MPF-HK007-2024': 'HK007891234', 
    'MPF-HK005-2024': 'HK005567890',
    'ORSO-HK005-2024': 'HK005567890',
    'MPF-DEMO-2024': 'HK001234567',
    'ORSO-DEMO-2024': 'HK001234567'
  }
  
  const companyCode = planToCompanyMap[planCode] || 'HK001234567'
  return getCompanyInfoByToken(companyCode)
}

// 获取企业的所有计划信息
export const getAllPlansByCompany = (companyCode) => {
  return getPlanInfoByCompany(companyCode)
}

// 升级计划账号（绑定用户名密码）
export const upgradePlanAccount = (planCode, username, encryptedPassword, companyInfo) => {
  // 验证计划号
  const planValidation = validatePlanCode(planCode)
  if (!planValidation.valid) {
    throw new Error('无效的计划号')
  }
  
  // 检查用户名是否已存在（模拟）
  const existingUsernames = ['admin', 'test', 'user', 'manager']
  if (existingUsernames.includes(username.toLowerCase())) {
    throw new Error('用户名已存在')
  }
  
  // 生成升级后的用户数据
  const upgradedUserData = {
    token: `upgraded-${companyInfo.code}-${Date.now()}`,
    userInfo: {
      id: Math.floor(Math.random() * 10000) + 2000,
      username: username,
      email: companyInfo.email,
      companyName: companyInfo.name,
      companyCode: companyInfo.code,
      role: 'company_admin',
      permissions: ['central-fund:*', 'private-fund:*', 'system:view'],
      createTime: new Date().toISOString(),
      lastLoginTime: new Date().toISOString(),
      status: 'active',
      accountType: 'upgraded', // 标记为升级账号
      originalPlanCode: planCode, // 保存原始计划号
      upgradeTime: new Date().toISOString()
    }
  }
  
  console.log('账号升级成功:', {
    planCode,
    username,
    companyCode: companyInfo.code,
    newToken: upgradedUserData.token
  })
  
  return upgradedUserData
}

// 检测是否为计划号登录
export const isPlanCodeLogin = (loginIdentifier) => {
  // 计划号格式检测：通常是 MPF-xxx-yyyy 或 ORSO-xxx-yyyy
  const planCodePattern = /^(MPF|ORSO)-[A-Z0-9]+-\d{4}$/
  return planCodePattern.test(loginIdentifier)
}

// 模拟计划号登录
export const loginWithPlanCode = (planCode, password) => {
  // 验证计划号
  const planValidation = validatePlanCode(planCode)
  if (!planValidation.valid) {
    throw new Error('无效的计划号')
  }
  
  // 模拟密码验证（这里简化处理）
  const validPlanPasswords = {
    'MPF-HK001-2024': 'plan123456',
    'ORSO-HK001-2024': 'orso123456',
    'MPF-HK007-2024': 'mpf789012',
    'MPF-HK005-2024': 'plan555666',
    'ORSO-HK005-2024': 'orso777888',
    'MPF-DEMO-2024': 'demo123456',
    'ORSO-DEMO-2024': 'demo789012'
  }
  
  if (validPlanPasswords[planCode] !== password) {
    throw new Error('计划号或密码错误')
  }
  
  // 获取企业信息
  const companyInfo = getCompanyInfoByPlanCode(planCode)
  
  // 生成临时登录token（计划号登录）
  const loginData = {
    token: `plan-login-${planCode}-${Date.now()}`,
    userInfo: {
      id: `plan-${planCode}`,
      planCode: planCode,
      companyName: companyInfo.name,
      companyCode: companyInfo.code,
      email: companyInfo.email,
      role: 'plan_user',
      permissions: planCode.startsWith('MPF') ? ['central-fund:*'] : ['private-fund:*'],
      accountType: 'plan_login', // 标记为计划号登录
      loginTime: new Date().toISOString(),
      needsUpgrade: true // 标记需要升级
    }
  }
  
  console.log('计划号登录成功:', {
    planCode,
    companyCode: companyInfo.code,
    token: loginData.token
  })
  
  return loginData
}

// 获取账号升级建议
export const getUpgradeRecommendation = (planCode) => {
  const companyInfo = getCompanyInfoByPlanCode(planCode)
  const allPlans = getAllPlansByCompany(companyInfo.code)
  
  return {
    currentPlan: allPlans.find(plan => plan.planCode === planCode),
    allPlans: allPlans,
    benefits: [
      '使用用户名密码登录，无需记住复杂的计划号',
      '统一管理企业下的所有保险计划',
      '享受更完整的企业服务功能',
      '获得更好的安全保护和数据加密',
      '支持更多的在线服务和自助操作'
    ],
    urgency: allPlans.length > 1 ? 'high' : 'medium' // 多计划企业建议高优先级升级
  }
}