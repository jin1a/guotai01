



import {

  getOrgIds,

} from '@/api/generatedApi/index'


const common = {
  state: {
    userInfo: {kk:999}
  },
  actions: {
    // 获取用户的组织id（包括当前和当前以上的），存放在localstore，vuex
    getOrgIdsAc({ commit }, telNub) {
      return getOrgIds({ account: telNub }).then((res) => {
        commit('SET_ORG_IDS', res)
        
      })
    },
    
  },
  mutations: {
    SET_ORG_IDS: (state, data) => {
      
    },
  }
}
export default common
