import request from './request'

// 用户管理接口
export const userApi = {
  // 获取用户列表
  getList(params) {
    return request({
      url: '/system/user/list',
      method: 'get',
      params
    })
  },
  // 获取用户详情
  getInfo(userId) {
    return request({
      url: `/system/user/${userId}`,
      method: 'get'
    })
  },
  // 新增用户
  add(data) {
    return request({
      url: '/system/user',
      method: 'post',
      data
    })
  },
  // 修改用户
  update(data) {
    return request({
      url: `/system/user/${data.userId}`,
      method: 'put',
      data
    })
  },
  // 删除用户
  delete(userId) {
    return request({
      url: `/system/user/${userId}`,
      method: 'delete'
    })
  },
  // 重置密码
  resetPassword(userId) {
    return request({
      url: `/system/user/${userId}/password/reset`,
      method: 'put'
    })
  },
  // 修改密码
  updatePassword(data) {
    return request({
      url: '/system/user/password',
      method: 'put',
      data
    })
  },
  // 获取用户角色
  getRoles(userId) {
    return request({
      url: `/system/user/${userId}/role`,
      method: 'get'
    })
  },
  // 分配用户角色
  assignRoles(userId, roleIds) {
    return request({
      url: `/system/user/${userId}/role`,
      method: 'put',
      data: roleIds
    })
  },
  // 获取部门树
  getDeptTree() {
    return request({
      url: '/system/dept/tree',
      method: 'get'
    })
  },
  // 获取角色列表
  getRoleList() {
    return request({
      url: '/system/role/list',
      method: 'get',
      params: {
        pageSize: 999 // 获取所有角色
      }
    })
  }
}

// 角色管理接口
export const roleApi = {
  // 获取角色列表
  getList(params) {
    return request({
      url: '/system/role/list',
      method: 'get',
      params
    })
  },
  // 获取角色详情
  getInfo(roleId) {
    return request({
      url: `/system/role/${roleId}`,
      method: 'get'
    })
  },
  // 新增角色
  add(data) {
    return request({
      url: '/system/role',
      method: 'post',
      data
    })
  },
  // 修改角色
  update(data) {
    return request({
      url: `/system/role/${data.roleId}`,
      method: 'put',
      data
    })
  },
  // 删除角色
  delete(roleId) {
    return request({
      url: `/system/role/${roleId}`,
      method: 'delete'
    })
  },
  // 获取角色权限
  getPermissions(roleId) {
    return request({
      url: `/system/role/${roleId}/permission`,
      method: 'get'
    })
  },
  // 分配角色权限
  assignPermissions(roleId, permissionIds) {
    return request({
      url: `/system/role/${roleId}/permission`,
      method: 'put',
      data: permissionIds
    })
  }
}

// 权限管理接口
export const permissionApi = {
  // 获取权限列表
  getList(params) {
    return request({
      url: '/system/permission/list',
      method: 'get',
      params
    })
  },
  // 获取权限详情
  getInfo(permissionId) {
    return request({
      url: `/system/permission/${permissionId}`,
      method: 'get'
    })
  },
  // 新增权限
  add(data) {
    return request({
      url: '/system/permission',
      method: 'post',
      data
    })
  },
  // 修改权限
  update(data) {
    return request({
      url: `/system/permission/${data.permissionId}`,
      method: 'put',
      data
    })
  },
  // 删除权限
  delete(permissionId) {
    return request({
      url: `/system/permission/${permissionId}`,
      method: 'delete'
    })
  },
  // 获取权限树
  getTree() {
    return request({
      url: '/system/permission/tree',
      method: 'get'
    })
  }
}

// 部门管理接口
export const deptApi = {
  // 获取部门列表
  getList(params) {
    return request({
      url: '/system/dept/list',
      method: 'get',
      params
    })
  },
  // 获取部门详情
  getInfo(deptId) {
    return request({
      url: `/system/dept/${deptId}`,
      method: 'get'
    })
  },
  // 新增部门
  add(data) {
    return request({
      url: '/system/dept',
      method: 'post',
      data
    })
  },
  // 修改部门
  update(data) {
    return request({
      url: `/system/dept/${data.deptId}`,
      method: 'put',
      data
    })
  },
  // 删除部门
  delete(deptId) {
    return request({
      url: `/system/dept/${deptId}`,
      method: 'delete'
    })
  },
  // 获取部门树
  getTree() {
    return request({
      url: '/system/dept/tree',
      method: 'get'
    })
  }
}

// 数据字典接口
export const dictApi = {
  // 获取字典列表
  getList(params) {
    return request({
      url: '/system/dict/list',
      method: 'get',
      params
    })
  },
  // 获取字典详情
  getInfo(dictId) {
    return request({
      url: `/system/dict/${dictId}`,
      method: 'get'
    })
  },
  // 新增字典
  add(data) {
    return request({
      url: '/system/dict',
      method: 'post',
      data
    })
  },
  // 修改字典
  update(data) {
    return request({
      url: `/system/dict/${data.dictId}`,
      method: 'put',
      data
    })
  },
  // 删除字典
  delete(dictId) {
    return request({
      url: `/system/dict/${dictId}`,
      method: 'delete'
    })
  },
  // 根据类型获取字典数据
  getByType(type) {
    return request({
      url: `/system/dict/type/${type}`,
      method: 'get'
    })
  }
}

// 系统配置接口
export const configApi = {
  // 获取配置列表
  getList(params) {
    return request({
      url: '/system/config/list',
      method: 'get',
      params
    })
  },
  // 获取配置详情
  getInfo(configId) {
    return request({
      url: `/system/config/${configId}`,
      method: 'get'
    })
  },
  // 新增配置
  add(data) {
    return request({
      url: '/system/config',
      method: 'post',
      data
    })
  },
  // 修改配置
  update(data) {
    return request({
      url: `/system/config/${data.configId}`,
      method: 'put',
      data
    })
  },
  // 删除配置
  delete(configId) {
    return request({
      url: `/system/config/${configId}`,
      method: 'delete'
    })
  },
  // 根据键名获取配置
  getByKey(key) {
    return request({
      url: `/system/config/key/${key}`,
      method: 'get'
    })
  }
}

// 操作日志接口
export const logApi = {
  // 获取操作日志列表
  getList(params) {
    return request({
      url: '/system/log/list',
      method: 'get',
      params
    })
  },
  // 删除操作日志
  delete(logId) {
    return request({
      url: `/system/log/${logId}`,
      method: 'delete'
    })
  },
  // 清空操作日志
  clear() {
    return request({
      url: '/system/log/clear',
      method: 'delete'
    })
  }
} 