/**
 * @name: 用户信息数据
 * @author: Zhang Weiwei
 * @created_date: 2023.10.08
 * @description: 用户信息和sessionId
 */

const state = {
  // 投保信息录入
  userInfo: {
    customerNo: '00000000134'
  },
  sessionId: ''
}

const getters = {
  userInfo: state => state.userInfo,
  sessionId: state => state.sessionId
}

export default {
  namespaced: true, // 启用命名空间
  state,
  getters
}
