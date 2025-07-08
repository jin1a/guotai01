import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userApi } from '@/api/system'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref({})
  const roles = ref([])
  const permissions = ref([])

  // 登录
  const login = async (loginForm) => {
    try {
      const res = await userApi.login(loginForm)
      token.value = res.token
      localStorage.setItem('token', res.token)
      return res
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const res = await userApi.getInfo()
      userInfo.value = res
      roles.value = res.roles || []
      permissions.value = res.permissions || []
      return res
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }

  // 登出
  const logout = async () => {
    try {
      await userApi.logout()
    } catch (error) {
      console.error('登出失败:', error)
    } finally {
      resetState()
    }
  }

  // 重置状态
  const resetState = () => {
    token.value = ''
    userInfo.value = {}
    roles.value = []
    permissions.value = []
    localStorage.removeItem('token')
  }

  // 判断是否有权限
  const hasPermission = (permission) => {
    return permissions.value.includes(permission)
  }

  // 判断是否有角色
  const hasRole = (role) => {
    return roles.value.includes(role)
  }

  return {
    token,
    userInfo,
    roles,
    permissions,
    login,
    getUserInfo,
    logout,
    resetState,
    hasPermission,
    hasRole
  }
}) 