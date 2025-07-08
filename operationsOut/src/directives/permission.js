import { useUserStore } from '@/stores/user'

// 权限指令
export const permission = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()

    if (value && value.length > 0) {
      const hasPermission = userStore.hasPermission(value)
      if (!hasPermission) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('需要指定权限值')
    }
  }
}

// 角色指令
export const role = {
  mounted(el, binding) {
    const { value } = binding
    const userStore = useUserStore()

    if (value && value.length > 0) {
      const hasRole = userStore.hasRole(value)
      if (!hasRole) {
        el.parentNode?.removeChild(el)
      }
    } else {
      throw new Error('需要指定角色值')
    }
  }
}

export default {
  install(app) {
    app.directive('permission', permission)
    app.directive('role', role)
  }
} 