<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="queryParams" ref="queryForm">
        <el-form-item label="权限名称" prop="permissionName">
          <el-input v-model="queryParams.permissionName" placeholder="请输入权限名称" clearable />
        </el-form-item>
        <el-form-item label="权限编码" prop="permissionCode">
          <el-input v-model="queryParams.permissionCode" placeholder="请输入权限编码" clearable />
        </el-form-item>
        <el-form-item label="资源类型" prop="resourceType">
          <el-select v-model="queryParams.resourceType" placeholder="请选择资源类型" clearable>
            <el-option label="菜单" :value="1" />
            <el-option label="按钮" :value="2" />
            <el-option label="接口" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card class="table-card">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" @click="handleAdd">新增权限</el-button>
          </el-col>
        </el-row>
      </template>

      <!-- 表格区域 -->
      <el-table
        v-loading="loading"
        :data="permissionList"
        row-key="permissionId"
        :tree-props="{ children: 'children' }"
      >
        <el-table-column prop="permissionName" label="权限名称" />
        <el-table-column prop="permissionCode" label="权限编码" />
        <el-table-column prop="resourceType" label="资源类型">
          <template #default="scope">
            {{ resourceTypeOptions[scope.row.resourceType] }}
          </template>
        </el-table-column>
        <el-table-column prop="method" label="HTTP方法" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.method" :type="methodTagType(scope.row.method)">
              {{ scope.row.method }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="urlPattern" label="URL匹配模式" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
              {{ scope.row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="text" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="text" @click="handleAdd(scope.row)">新增子权限</el-button>
            <el-button type="text" @click="handleDelete(scope.row)" class="delete-btn">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑权限对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="permissionForm" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="上级权限">
          <tree-select
            v-model="form.parentId"
            :options="permissionOptions"
            placeholder="选择上级权限"
          />
        </el-form-item>
        <el-form-item label="权限名称" prop="permissionName">
          <el-input v-model="form.permissionName" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限编码" prop="permissionCode">
          <el-input v-model="form.permissionCode" placeholder="请输入权限编码" :disabled="form.permissionId !== undefined" />
        </el-form-item>
        <el-form-item label="资源类型" prop="resourceType">
          <el-radio-group v-model="form.resourceType">
            <el-radio :label="1">菜单</el-radio>
            <el-radio :label="2">按钮</el-radio>
            <el-radio :label="3">接口</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="HTTP方法" prop="method" v-if="form.resourceType === 3">
          <el-select v-model="form.method" placeholder="请选择HTTP方法">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
          </el-select>
        </el-form-item>
        <el-form-item label="URL模式" prop="urlPattern" v-if="form.resourceType === 3">
          <el-input v-model="form.urlPattern" placeholder="请输入URL匹配模式" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" :max="999" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import TreeSelect from '@/components/TreeSelect/index.vue'

// 资源类型选项
const resourceTypeOptions = {
  1: '菜单',
  2: '按钮',
  3: '接口'
}

// HTTP方法标签类型
const methodTagType = (method) => {
  const types = {
    GET: '',
    POST: 'success',
    PUT: 'warning',
    DELETE: 'danger'
  }
  return types[method] || ''
}

// 查询参数
const queryParams = reactive({
  permissionName: '',
  permissionCode: '',
  resourceType: undefined
})

// 表单参数
const form = reactive({
  permissionId: undefined,
  parentId: 0,
  permissionName: '',
  permissionCode: '',
  resourceType: 1,
  method: '',
  urlPattern: '',
  sortOrder: 0,
  status: 1,
  remark: ''
})

// 表单校验规则
const rules = {
  permissionName: [
    { required: true, message: '权限名称不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '权限名称长度必须介于 2 和 50 之间', trigger: 'blur' }
  ],
  permissionCode: [
    { required: true, message: '权限编码不能为空', trigger: 'blur' },
    { min: 2, max: 100, message: '权限编码长度必须介于 2 和 100 之间', trigger: 'blur' }
  ],
  resourceType: [
    { required: true, message: '请选择资源类型', trigger: 'change' }
  ],
  method: [
    { required: true, message: '请选择HTTP方法', trigger: 'change' }
  ],
  urlPattern: [
    { required: true, message: '请输入URL匹配模式', trigger: 'blur' }
  ]
}

// 数据列表
const permissionList = ref([
  {
    permissionId: 1,
    permissionName: '系统管理',
    permissionCode: 'system',
    resourceType: 1,
    sortOrder: 1,
    status: 1,
    children: [
      {
        permissionId: 11,
        parentId: 1,
        permissionName: '用户管理',
        permissionCode: 'system:user',
        resourceType: 1,
        sortOrder: 1,
        status: 1,
        children: [
          {
            permissionId: 111,
            parentId: 11,
            permissionName: '用户查询',
            permissionCode: 'system:user:query',
            resourceType: 2,
            sortOrder: 1,
            status: 1
          },
          {
            permissionId: 112,
            parentId: 11,
            permissionName: '用户新增',
            permissionCode: 'system:user:add',
            resourceType: 2,
            sortOrder: 2,
            status: 1
          },
          {
            permissionId: 113,
            parentId: 11,
            permissionName: '用户修改',
            permissionCode: 'system:user:edit',
            resourceType: 2,
            sortOrder: 3,
            status: 1
          },
          {
            permissionId: 114,
            parentId: 11,
            permissionName: '用户删除',
            permissionCode: 'system:user:delete',
            resourceType: 2,
            sortOrder: 4,
            status: 1
          },
          {
            permissionId: 115,
            parentId: 11,
            permissionName: '获取用户列表',
            permissionCode: 'system:user:list',
            resourceType: 3,
            method: 'GET',
            urlPattern: '/api/system/users',
            sortOrder: 5,
            status: 1
          },
          {
            permissionId: 116,
            parentId: 11,
            permissionName: '创建用户',
            permissionCode: 'system:user:create',
            resourceType: 3,
            method: 'POST',
            urlPattern: '/api/system/users',
            sortOrder: 6,
            status: 1
          }
        ]
      },
      {
        permissionId: 12,
        parentId: 1,
        permissionName: '角色管理',
        permissionCode: 'system:role',
        resourceType: 1,
        sortOrder: 2,
        status: 1,
        children: [
          {
            permissionId: 121,
            parentId: 12,
            permissionName: '角色查询',
            permissionCode: 'system:role:query',
            resourceType: 2,
            sortOrder: 1,
            status: 1
          },
          {
            permissionId: 122,
            parentId: 12,
            permissionName: '角色新增',
            permissionCode: 'system:role:add',
            resourceType: 2,
            sortOrder: 2,
            status: 1
          },
          {
            permissionId: 123,
            parentId: 12,
            permissionName: '角色修改',
            permissionCode: 'system:role:edit',
            resourceType: 2,
            sortOrder: 3,
            status: 1
          },
          {
            permissionId: 124,
            parentId: 12,
            permissionName: '角色删除',
            permissionCode: 'system:role:delete',
            resourceType: 2,
            sortOrder: 4,
            status: 1
          }
        ]
      },
      {
        permissionId: 13,
        parentId: 1,
        permissionName: '菜单管理',
        permissionCode: 'system:menu',
        resourceType: 1,
        sortOrder: 3,
        status: 1,
        children: [
          {
            permissionId: 131,
            parentId: 13,
            permissionName: '菜单查询',
            permissionCode: 'system:menu:query',
            resourceType: 2,
            sortOrder: 1,
            status: 1
          },
          {
            permissionId: 132,
            parentId: 13,
            permissionName: '菜单新增',
            permissionCode: 'system:menu:add',
            resourceType: 2,
            sortOrder: 2,
            status: 1
          },
          {
            permissionId: 133,
            parentId: 13,
            permissionName: '菜单修改',
            permissionCode: 'system:menu:edit',
            resourceType: 2,
            sortOrder: 3,
            status: 1
          },
          {
            permissionId: 134,
            parentId: 13,
            permissionName: '菜单删除',
            permissionCode: 'system:menu:delete',
            resourceType: 2,
            sortOrder: 4,
            status: 1
          }
        ]
      }
    ]
  },
  {
    permissionId: 2,
    permissionName: '系统监控',
    permissionCode: 'monitor',
    resourceType: 1,
    sortOrder: 2,
    status: 1,
    children: [
      {
        permissionId: 21,
        parentId: 2,
        permissionName: '在线用户',
        permissionCode: 'monitor:online',
        resourceType: 1,
        sortOrder: 1,
        status: 1,
        children: [
          {
            permissionId: 211,
            parentId: 21,
            permissionName: '在线用户查询',
            permissionCode: 'monitor:online:query',
            resourceType: 2,
            sortOrder: 1,
            status: 1
          },
          {
            permissionId: 212,
            parentId: 21,
            permissionName: '强制退出',
            permissionCode: 'monitor:online:logout',
            resourceType: 2,
            sortOrder: 2,
            status: 1
          }
        ]
      },
      {
        permissionId: 22,
        parentId: 2,
        permissionName: '操作日志',
        permissionCode: 'monitor:operlog',
        resourceType: 1,
        sortOrder: 2,
        status: 1,
        children: [
          {
            permissionId: 221,
            parentId: 22,
            permissionName: '操作日志查询',
            permissionCode: 'monitor:operlog:query',
            resourceType: 2,
            sortOrder: 1,
            status: 1
          },
          {
            permissionId: 222,
            parentId: 22,
            permissionName: '操作日志删除',
            permissionCode: 'monitor:operlog:delete',
            resourceType: 2,
            sortOrder: 2,
            status: 1
          }
        ]
      }
    ]
  }
])

const permissionOptions = ref([
  {
    id: 0,
    label: '主目录',
    children: [
      {
        id: 1,
        label: '系统管理',
        children: [
          {
            id: 11,
            label: '用户管理'
          },
          {
            id: 12,
            label: '角色管理'
          },
          {
            id: 13,
            label: '菜单管理'
          }
        ]
      },
      {
        id: 2,
        label: '系统监控',
        children: [
          {
            id: 21,
            label: '在线用户'
          },
          {
            id: 22,
            label: '操作日志'
          }
        ]
      }
    ]
  }
])

const total = ref(0)
const loading = ref(false)
const title = ref('')
const open = ref(false)

// 查询列表
const getList = async () => {
  loading.value = true
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟搜索过滤
    const filterPermissions = (list) => {
      return list.filter(item => {
        const nameMatch = !queryParams.permissionName || item.permissionName.includes(queryParams.permissionName)
        const codeMatch = !queryParams.permissionCode || item.permissionCode.includes(queryParams.permissionCode)
        const typeMatch = !queryParams.resourceType || item.resourceType === queryParams.resourceType
        const matched = nameMatch && codeMatch && typeMatch
        
        if (item.children && item.children.length) {
          item.children = filterPermissions(item.children)
          return item.children.length > 0 || matched
        }
        
        return matched
      })
    }
    
    permissionList.value = filterPermissions(JSON.parse(JSON.stringify(permissionList.value)))
  } catch (error) {
    console.error('获取权限列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 表单提交
const submitForm = async () => {
  const permissionForm = document.querySelector('#permissionForm')
  if (!permissionForm) return
  
  permissionForm.validate(async (valid) => {
    if (valid) {
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const updatePermission = (list, permission) => {
          for (let i = 0; i < list.length; i++) {
            if (list[i].permissionId === permission.permissionId) {
              Object.assign(list[i], permission)
              return true
            }
            
            if (list[i].children && list[i].children.length) {
              if (updatePermission(list[i].children, permission)) {
                return true
              }
            }
          }
          
          return false
        }
        
        if (form.permissionId) {
          // 更新权限
          updatePermission(permissionList.value, { ...form })
        } else {
          // 新增权限
          const newPermission = {
            ...form,
            permissionId: Date.now()
          }
          
          const addPermission = (list, parentId) => {
            if (!parentId) {
              list.push(newPermission)
              return
            }
            
            for (let i = 0; i < list.length; i++) {
              if (list[i].permissionId === parentId) {
                if (!list[i].children) {
                  list[i].children = []
                }
                list[i].children.push(newPermission)
                return
              }
              
              if (list[i].children && list[i].children.length) {
                addPermission(list[i].children, parentId)
              }
            }
          }
          
          addPermission(permissionList.value, form.parentId)
        }
        
        ElMessage.success('保存成功')
        open.value = false
        getList()
      } catch (error) {
        console.error('保存权限失败:', error)
      }
    }
  })
}

// 其他方法
const handleQuery = () => {
  getList()
}

const resetQuery = () => {
  queryParams.permissionName = ''
  queryParams.permissionCode = ''
  queryParams.resourceType = undefined
  handleQuery()
}

const handleAdd = (row) => {
  title.value = '添加权限'
  open.value = true
  Object.assign(form, {
    permissionId: undefined,
    parentId: row ? row.permissionId : 0,
    permissionName: '',
    permissionCode: '',
    resourceType: 1,
    method: '',
    urlPattern: '',
    sortOrder: 0,
    status: 1,
    remark: ''
  })
}

const handleEdit = (row) => {
  title.value = '编辑权限'
  open.value = true
  Object.assign(form, row)
}

const handleDelete = (row) => {
  if (row.children && row.children.length) {
    ElMessage.warning('该权限包含子权限，不能删除')
    return
  }
  
  ElMessageBox.confirm('确认要删除该权限吗？', '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const deletePermission = (list, permissionId) => {
        const index = list.findIndex(item => item.permissionId === permissionId)
        if (index > -1) {
          list.splice(index, 1)
          return true
        }
        
        for (let i = 0; i < list.length; i++) {
          if (list[i].children && list[i].children.length) {
            if (deletePermission(list[i].children, permissionId)) {
              return true
            }
          }
        }
        
        return false
      }
      
      deletePermission(permissionList.value, row.permissionId)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除权限失败:', error)
    }
  }).catch(() => {})
}

const cancel = () => {
  open.value = false
  Object.assign(form, {
    permissionId: undefined,
    parentId: 0,
    permissionName: '',
    permissionCode: '',
    resourceType: 1,
    method: '',
    urlPattern: '',
    sortOrder: 0,
    status: 1,
    remark: ''
  })
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.mb8 {
  margin-bottom: 8px;
}

.delete-btn {
  color: #F56C6C;
}

.dialog-footer {
  text-align: right;
}
</style> 