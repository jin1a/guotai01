<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="菜单名称">
          <el-input v-model="queryParams.menuName" placeholder="请输入菜单名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="toolbar-wrapper">
      <el-button type="primary" @click="handleAdd">新增菜单</el-button>
    </div>

    <!-- 表格区域 -->
    <el-table
      v-loading="loading"
      :data="menuList"
      row-key="menuId"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      border
      default-expand-all
    >
      <el-table-column prop="menuName" label="菜单名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="icon" label="图标" width="80" align="center">
        <template #default="{ row }">
          <i v-if="row.icon" :class="row.icon"></i>
        </template>
      </el-table-column>
      <el-table-column prop="orderNum" label="排序" width="80" align="center" />
      <el-table-column prop="perms" label="权限标识" min-width="180" show-overflow-tooltip />
      <el-table-column prop="path" label="路由地址" min-width="180" show-overflow-tooltip />
      <el-table-column prop="component" label="组件路径" min-width="180" show-overflow-tooltip />
      <el-table-column prop="menuType" label="类型" width="80" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.menuType === 'M'">目录</el-tag>
          <el-tag v-else-if="row.menuType === 'C'" type="success">菜单</el-tag>
          <el-tag v-else-if="row.menuType === 'F'" type="info">按钮</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="visible" label="可见" width="80" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.visible === 1" type="success">显示</el-tag>
          <el-tag v-else type="info">隐藏</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="text" @click="handleAdd(row)">新增</el-button>
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑菜单弹窗 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="700px"
      append-to-body
      @close="handleDialogClose"
    >
      <el-form
        ref="menuFormRef"
        :model="menuForm"
        :rules="menuRules"
        label-width="100px"
      >
        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="menuForm.parentId"
            :data="menuOptions"
            :props="{ label: 'menuName', value: 'menuId', children: 'children' }"
            placeholder="请选择上级菜单"
            check-strictly
            clearable
          />
        </el-form-item>
        <el-form-item label="菜单类型" required>
          <el-radio-group v-model="menuForm.menuType">
            <el-radio label="M">目录</el-radio>
            <el-radio label="C">菜单</el-radio>
            <el-radio label="F">按钮</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单名称" prop="menuName">
          <el-input v-model="menuForm.menuName" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="显示排序" prop="orderNum">
          <el-input-number v-model="menuForm.orderNum" :min="0" :max="999" controls-position="right" />
        </el-form-item>
        <el-form-item
          v-if="menuForm.menuType !== 'F'"
          label="图标"
          prop="icon"
        >
          <el-input v-model="menuForm.icon" placeholder="请输入图标类名">
            <template #prefix>
              <i v-if="menuForm.icon" :class="menuForm.icon"></i>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item
          v-if="menuForm.menuType !== 'F'"
          label="路由地址"
          prop="path"
        >
          <el-input v-model="menuForm.path" placeholder="请输入路由地址" />
        </el-form-item>
        <el-form-item
          v-if="menuForm.menuType === 'C'"
          label="组件路径"
          prop="component"
        >
          <el-input v-model="menuForm.component" placeholder="请输入组件路径" />
        </el-form-item>
        <el-form-item
          v-if="menuForm.menuType === 'F'"
          label="权限标识"
          prop="perms"
        >
          <el-input v-model="menuForm.perms" placeholder="请输入权限标识" />
        </el-form-item>
        <el-form-item
          v-if="menuForm.menuType !== 'F'"
          label="显示状态"
        >
          <el-radio-group v-model="menuForm.visible">
            <el-radio :label="1">显示</el-radio>
            <el-radio :label="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="menuForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询参数
const queryParams = reactive({
  menuName: '',
  status: undefined
})

// 菜单列表数据
const menuList = ref([
  {
    menuId: 1,
    menuName: '系统管理',
    icon: 'el-icon-setting',
    orderNum: 1,
    path: '/system',
    component: null,
    menuType: 'M',
    visible: 1,
    status: 1,
    children: [
      {
        menuId: 11,
        parentId: 1,
        menuName: '用户管理',
        icon: 'el-icon-user',
        orderNum: 1,
        path: 'users',
        component: 'system/users',
        menuType: 'C',
        visible: 1,
        status: 1,
        children: [
          {
            menuId: 111,
            parentId: 11,
            menuName: '用户查询',
            orderNum: 1,
            perms: 'system:user:query',
            menuType: 'F',
            status: 1
          },
          {
            menuId: 112,
            parentId: 11,
            menuName: '用户新增',
            orderNum: 2,
            perms: 'system:user:add',
            menuType: 'F',
            status: 1
          },
          {
            menuId: 113,
            parentId: 11,
            menuName: '用户修改',
            orderNum: 3,
            perms: 'system:user:edit',
            menuType: 'F',
            status: 1
          },
          {
            menuId: 114,
            parentId: 11,
            menuName: '用户删除',
            orderNum: 4,
            perms: 'system:user:delete',
            menuType: 'F',
            status: 1
          }
        ]
      },
      {
        menuId: 12,
        parentId: 1,
        menuName: '角色管理',
        icon: 'el-icon-s-custom',
        orderNum: 2,
        path: 'roles',
        component: 'system/roles',
        menuType: 'C',
        visible: 1,
        status: 1,
        children: [
          {
            menuId: 121,
            parentId: 12,
            menuName: '角色查询',
            orderNum: 1,
            perms: 'system:role:query',
            menuType: 'F',
            status: 1
          },
          {
            menuId: 122,
            parentId: 12,
            menuName: '角色新增',
            orderNum: 2,
            perms: 'system:role:add',
            menuType: 'F',
            status: 1
          },
          {
            menuId: 123,
            parentId: 12,
            menuName: '角色修改',
            orderNum: 3,
            perms: 'system:role:edit',
            menuType: 'F',
            status: 1
          },
          {
            menuId: 124,
            parentId: 12,
            menuName: '角色删除',
            orderNum: 4,
            perms: 'system:role:delete',
            menuType: 'F',
            status: 1
          }
        ]
      },
      {
        menuId: 13,
        parentId: 1,
        menuName: '菜单管理',
        icon: 'el-icon-menu',
        orderNum: 3,
        path: 'menus',
        component: 'system/menus',
        menuType: 'C',
        visible: 1,
        status: 1,
        children: [
          {
            menuId: 131,
            parentId: 13,
            menuName: '菜单查询',
            orderNum: 1,
            perms: 'system:menu:query',
            menuType: 'F',
            status: 1
          },
          {
            menuId: 132,
            parentId: 13,
            menuName: '菜单新增',
            orderNum: 2,
            perms: 'system:menu:add',
            menuType: 'F',
            status: 1
          },
          {
            menuId: 133,
            parentId: 13,
            menuName: '菜单修改',
            orderNum: 3,
            perms: 'system:menu:edit',
            menuType: 'F',
            status: 1
          },
          {
            menuId: 134,
            parentId: 13,
            menuName: '菜单删除',
            orderNum: 4,
            perms: 'system:menu:delete',
            menuType: 'F',
            status: 1
          }
        ]
      }
    ]
  },
  {
    menuId: 2,
    menuName: '系统监控',
    icon: 'el-icon-monitor',
    orderNum: 2,
    path: '/monitor',
    component: null,
    menuType: 'M',
    visible: 1,
    status: 1,
    children: [
      {
        menuId: 21,
        parentId: 2,
        menuName: '在线用户',
        icon: 'el-icon-user',
        orderNum: 1,
        path: 'online',
        component: 'monitor/online',
        menuType: 'C',
        visible: 1,
        status: 1
      },
      {
        menuId: 22,
        parentId: 2,
        menuName: '操作日志',
        icon: 'el-icon-document',
        orderNum: 2,
        path: 'operlog',
        component: 'monitor/operlog',
        menuType: 'C',
        visible: 1,
        status: 1
      }
    ]
  }
])

const loading = ref(false)

// 菜单树选项
const menuOptions = ref([
  {
    menuId: 0,
    menuName: '主目录',
    children: [
      {
        menuId: 1,
        menuName: '系统管理',
        children: [
          {
            menuId: 11,
            menuName: '用户管理'
          },
          {
            menuId: 12,
            menuName: '角色管理'
          },
          {
            menuId: 13,
            menuName: '菜单管理'
          }
        ]
      },
      {
        menuId: 2,
        menuName: '系统监控',
        children: [
          {
            menuId: 21,
            menuName: '在线用户'
          },
          {
            menuId: 22,
            menuName: '操作日志'
          }
        ]
      }
    ]
  }
])

// 弹窗控制
const dialog = reactive({
  title: '',
  visible: false
})

// 表单对象
const menuFormRef = ref(null)
const menuForm = reactive({
  menuId: undefined,
  parentId: undefined,
  menuName: '',
  icon: '',
  orderNum: 0,
  path: '',
  component: '',
  menuType: 'M',
  visible: 1,
  status: 1,
  perms: ''
})

// 表单校验规则
const menuRules = {
  menuName: [
    { required: true, message: '菜单名称不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  orderNum: [
    { required: true, message: '显示排序不能为空', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '路由地址不能为空', trigger: 'blur' }
  ]
}

// 监听菜单类型变化
watch(() => menuForm.menuType, (val) => {
  if (val === 'F') {
    menuForm.icon = ''
    menuForm.path = ''
    menuForm.component = ''
    menuForm.visible = 1
  }
})

// 获取菜单列表
const getList = async () => {
  try {
    loading.value = true
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟搜索过滤
    const filterMenu = (list) => {
      return list.filter(item => {
        const nameMatch = !queryParams.menuName || item.menuName.includes(queryParams.menuName)
        const statusMatch = queryParams.status === undefined || item.status === queryParams.status
        const matched = nameMatch && statusMatch
        
        if (item.children && item.children.length) {
          item.children = filterMenu(item.children)
          return item.children.length > 0 || matched
        }
        
        return matched
      })
    }
    
    menuList.value = filterMenu(JSON.parse(JSON.stringify(menuList.value)))
  } catch (error) {
    console.error('获取菜单列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查询按钮点击事件
const handleQuery = () => {
  getList()
}

// 重置按钮点击事件
const resetQuery = () => {
  queryParams.menuName = ''
  queryParams.status = undefined
  handleQuery()
}

// 新增按钮点击事件
const handleAdd = (row) => {
  dialog.title = '新增菜单'
  dialog.visible = true
  Object.assign(menuForm, {
    menuId: undefined,
    parentId: row ? row.menuId : undefined,
    menuName: '',
    icon: '',
    orderNum: 0,
    path: '',
    component: '',
    menuType: row ? (row.menuType === 'M' ? 'C' : 'F') : 'M',
    visible: 1,
    status: 1,
    perms: ''
  })
}

// 编辑按钮点击事件
const handleEdit = (row) => {
  dialog.title = '编辑菜单'
  dialog.visible = true
  Object.assign(menuForm, row)
}

// 删除按钮点击事件
const handleDelete = (row) => {
  if (row.children && row.children.length) {
    ElMessage.warning('该菜单包含子菜单，不能删除')
    return
  }
  
  ElMessageBox.confirm('确认要删除该菜单吗？', '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const deleteMenu = (list, menuId) => {
        const index = list.findIndex(item => item.menuId === menuId)
        if (index > -1) {
          list.splice(index, 1)
          return true
        }
        
        for (let i = 0; i < list.length; i++) {
          if (list[i].children && list[i].children.length) {
            if (deleteMenu(list[i].children, menuId)) {
              return true
            }
          }
        }
        
        return false
      }
      
      deleteMenu(menuList.value, row.menuId)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除菜单失败:', error)
    }
  }).catch(() => {})
}

// 状态切换事件
const handleStatusChange = async (row) => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('修改成功')
  } catch (error) {
    console.error('修改状态失败:', error)
    row.status = row.status === 1 ? 0 : 1
  }
}

// 提交表单
const handleSubmit = async () => {
  menuFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const updateMenu = (list, menu) => {
          for (let i = 0; i < list.length; i++) {
            if (list[i].menuId === menu.menuId) {
              Object.assign(list[i], menu)
              return true
            }
            
            if (list[i].children && list[i].children.length) {
              if (updateMenu(list[i].children, menu)) {
                return true
              }
            }
          }
          
          return false
        }
        
        if (menuForm.menuId) {
          // 更新菜单
          updateMenu(menuList.value, { ...menuForm })
        } else {
          // 新增菜单
          const newMenu = {
            ...menuForm,
            menuId: Date.now()
          }
          
          const addMenu = (list, parentId) => {
            if (!parentId) {
              list.push(newMenu)
              return
            }
            
            for (let i = 0; i < list.length; i++) {
              if (list[i].menuId === parentId) {
                if (!list[i].children) {
                  list[i].children = []
                }
                list[i].children.push(newMenu)
                return
              }
              
              if (list[i].children && list[i].children.length) {
                addMenu(list[i].children, parentId)
              }
            }
          }
          
          addMenu(menuList.value, menuForm.parentId)
        }
        
        ElMessage.success('保存成功')
        dialog.visible = false
        getList()
      } catch (error) {
        console.error('保存菜单失败:', error)
      }
    }
  })
}

// 弹窗关闭事件
const handleDialogClose = () => {
  menuFormRef.value?.resetFields()
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.app-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;

  .search-wrapper {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .search-form {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  .toolbar-wrapper {
    margin-bottom: 20px;
  }
}

:deep(.el-table) {
  .el-button {
    padding: 2px 0;
    margin: 0 5px;
  }
}

.dialog-footer {
  padding-top: 20px;
  text-align: right;
}
</style> 