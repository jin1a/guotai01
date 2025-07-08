<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="角色名称">
          <el-input v-model="queryParams.roleName" placeholder="请输入角色名称" clearable />
        </el-form-item>
        <el-form-item label="角色编码">
          <el-input v-model="queryParams.roleCode" placeholder="请输入角色编码" clearable />
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
      <el-button type="primary" @click="handleAdd">新增角色</el-button>
    </div>

    <!-- 表格区域 -->
    <el-table v-loading="loading" :data="roleList" border>
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="roleName" label="角色名称" min-width="120" show-overflow-tooltip />
      <el-table-column prop="roleKey" label="权限字符" min-width="120" show-overflow-tooltip />
      <el-table-column prop="roleSort" label="显示顺序" width="100" align="center" />
      <el-table-column prop="dataScope" label="数据权限" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">
          {{ dataScopeOptions.find(item => item.value === row.dataScope)?.label || '未设置' }}
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
      <el-table-column prop="createTime" label="创建时间" min-width="160" show-overflow-tooltip />
      <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-dropdown @command="(command) => handleCommand(command, row)">
            <el-button type="text">
              权限<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="permission">权限分配</el-dropdown-item>
                <el-dropdown-item command="dataScope">数据权限</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页区域 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 添加/编辑角色弹窗 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="600px"
      append-to-body
      @close="handleDialogClose"
    >
      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleRules"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleForm.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="roleForm.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="显示顺序" prop="roleSort">
          <el-input-number v-model="roleForm.roleSort" :min="1" :max="999" controls-position="right" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="roleForm.remark"
            type="textarea"
            placeholder="请输入备注"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="handleSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配权限弹窗 -->
    <el-dialog
      title="分配权限"
      v-model="permissionDialog.visible"
      width="600px"
      append-to-body
    >
      <el-form label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="currentRole.roleName" disabled />
        </el-form-item>
        <el-form-item label="权限分配">
          <el-tree
            ref="permissionTreeRef"
            :data="permissionOptions"
            :props="{ label: 'menuName', children: 'children' }"
            show-checkbox
            node-key="menuId"
            :default-checked-keys="checkedKeys"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="permissionDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="handlePermissionSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 分配数据权限弹窗 -->
    <el-dialog
      title="分配数据权限"
      v-model="dataScopeDialog.visible"
      width="600px"
      append-to-body
    >
      <el-form ref="dataScopeFormRef" :model="dataScopeForm" label-width="100px">
        <el-form-item label="角色名称">
          <el-input v-model="currentRole.roleName" disabled />
        </el-form-item>
        <el-form-item label="数据权限">
          <el-radio-group v-model="dataScopeForm.dataScope">
            <el-radio v-for="item in dataScopeOptions" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数据范围" v-if="dataScopeForm.dataScope === 2">
          <el-tree
            ref="deptTreeRef"
            :data="deptOptions"
            show-checkbox
            node-key="deptId"
            :props="{ label: 'deptName', children: 'children' }"
            :default-checked-keys="dataScopeForm.deptIds"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dataScopeDialog.visible = false">取 消</el-button>
          <el-button type="primary" @click="handleDataScopeSubmit">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { roleApi } from '@/api/system'
import { ArrowDown } from '@element-plus/icons-vue'

// 数据权限选项
const dataScopeOptions = [
  { label: '全部数据', value: 1 },
  { label: '本部门及下级数据', value: 2 },
  { label: '本部门数据', value: 3 },
  { label: '仅本人数据', value: 4 }
]

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  roleName: '',
  roleCode: '',
  status: undefined
})

// 角色列表数据
const roleList = ref([
  {
    roleId: 1,
    roleName: '超级管理员',
    roleKey: 'admin',
    roleSort: 1,
    status: 1,
    createTime: '2024-01-15 10:00:00',
    remark: '系统超级管理员'
  },
  {
    roleId: 2,
    roleName: '部门主管',
    roleKey: 'manager',
    roleSort: 2,
    status: 1,
    createTime: '2024-01-16 11:00:00',
    remark: '部门主管'
  },
  {
    roleId: 3,
    roleName: '普通员工',
    roleKey: 'employee',
    roleSort: 3,
    status: 1,
    createTime: '2024-01-17 12:00:00',
    remark: '普通员工'
  },
  {
    roleId: 4,
    roleName: '临时工',
    roleKey: 'temp',
    roleSort: 4,
    status: 0,
    createTime: '2024-01-18 13:00:00',
    remark: '临时工'
  }
])

const total = ref(4)
const loading = ref(false)

// 权限树选项
const permissionOptions = ref([
  {
    menuId: 1,
    menuName: '系统管理',
    children: [
      {
        menuId: 11,
        menuName: '用户管理',
        children: [
          { menuId: 111, menuName: '用户查询' },
          { menuId: 112, menuName: '用户新增' },
          { menuId: 113, menuName: '用户修改' },
          { menuId: 114, menuName: '用户删除' }
        ]
      },
      {
        menuId: 12,
        menuName: '角色管理',
        children: [
          { menuId: 121, menuName: '角色查询' },
          { menuId: 122, menuName: '角色新增' },
          { menuId: 123, menuName: '角色修改' },
          { menuId: 124, menuName: '角色删除' }
        ]
      },
      {
        menuId: 13,
        menuName: '菜单管理',
        children: [
          { menuId: 131, menuName: '菜单查询' },
          { menuId: 132, menuName: '菜单新增' },
          { menuId: 133, menuName: '菜单修改' },
          { menuId: 134, menuName: '菜单删除' }
        ]
      }
    ]
  },
  {
    menuId: 2,
    menuName: '系统监控',
    children: [
      { menuId: 21, menuName: '在线用户' },
      { menuId: 22, menuName: '操作日志' },
      { menuId: 23, menuName: '系统日志' }
    ]
  }
])

// 弹窗控制
const dialog = reactive({
  title: '',
  visible: false
})

const permissionDialog = reactive({
  visible: false
})

// 当前选中的角色
const currentRole = ref({})
const checkedKeys = ref([])

// 表单对象
const roleFormRef = ref(null)
const roleForm = reactive({
  roleId: undefined,
  roleName: '',
  roleKey: '',
  roleSort: 1,
  status: 1,
  remark: ''
})

// 表单校验规则
const roleRules = {
  roleName: [
    { required: true, message: '角色名称不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  roleKey: [
    { required: true, message: '权限字符不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  roleSort: [
    { required: true, message: '显示顺序不能为空', trigger: 'blur' }
  ]
}

// 获取角色列表
const getList = async () => {
  try {
    loading.value = true
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟搜索过滤
    const filteredList = roleList.value.filter(item => {
      const roleNameMatch = !queryParams.roleName || item.roleName.includes(queryParams.roleName)
      const statusMatch = queryParams.status === undefined || item.status === queryParams.status
      return roleNameMatch && statusMatch
    })
    
    // 模拟分页
    const start = (queryParams.pageNum - 1) * queryParams.pageSize
    const end = start + queryParams.pageSize
    roleList.value = filteredList.slice(start, end)
    total.value = filteredList.length
  } catch (error) {
    console.error('获取角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 查询按钮点击事件
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 重置按钮点击事件
const resetQuery = () => {
  queryParams.roleName = ''
  queryParams.roleCode = ''
  queryParams.status = undefined
  handleQuery()
}

// 新增按钮点击事件
const handleAdd = () => {
  dialog.title = '新增角色'
  dialog.visible = true
  Object.assign(roleForm, {
    roleId: undefined,
    roleName: '',
    roleKey: '',
    roleSort: 1,
    status: 1,
    remark: ''
  })
}

// 编辑按钮点击事件
const handleEdit = (row) => {
  dialog.title = '编辑角色'
  dialog.visible = true
  Object.assign(roleForm, row)
}

// 删除按钮点击事件
const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该角色吗？', '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = roleList.value.findIndex(item => item.roleId === row.roleId)
      if (index !== -1) {
        roleList.value.splice(index, 1)
        total.value--
      }
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除角色失败:', error)
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

// 权限分配按钮点击事件
const handlePermission = (row) => {
  currentRole.value = row
  permissionDialog.visible = true
  // 模拟已分配的权限
  checkedKeys.value = row.roleId === 1 
    ? [111, 112, 113, 114, 121, 122, 123, 124, 131, 132, 133, 134, 21, 22, 23] 
    : row.roleId === 2
      ? [111, 112, 113, 121, 122, 123]
      : [111, 121, 131]
}

// 提交权限分配
const handlePermissionSubmit = async () => {
  try {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    ElMessage.success('权限分配成功')
    permissionDialog.visible = false
  } catch (error) {
    console.error('权限分配失败:', error)
  }
}

// 提交表单
const handleSubmit = async () => {
  roleFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (roleForm.roleId) {
          // 更新角色
          const index = roleList.value.findIndex(item => item.roleId === roleForm.roleId)
          if (index !== -1) {
            roleList.value[index] = { ...roleList.value[index], ...roleForm }
          }
        } else {
          // 新增角色
          const newRole = {
            ...roleForm,
            roleId: roleList.value.length + 1,
            createTime: new Date().toLocaleString()
          }
          roleList.value.push(newRole)
          total.value++
        }
        
        ElMessage.success('保存成功')
        dialog.visible = false
        getList()
      } catch (error) {
        console.error('保存角色失败:', error)
      }
    }
  })
}

// 弹窗关闭事件
const handleDialogClose = () => {
  roleFormRef.value?.resetFields()
}

// 分页大小改变事件
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  getList()
}

// 页码改变事件
const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  getList()
}

// 数据权限对话框状态
const dataScopeDialog = reactive({
  visible: false
})

// 数据权限表单数据
const dataScopeForm = reactive({
  roleId: undefined,
  dataScope: 1,
  deptIds: []
})

// 部门树数据
const deptOptions = ref([
  {
    deptId: 1,
    deptName: '总公司',
    children: [
      {
        deptId: 2,
        deptName: '研发部门',
        children: [
          {
            deptId: 3,
            deptName: '研发一组'
          },
          {
            deptId: 4,
            deptName: '研发二组'
          }
        ]
      },
      {
        deptId: 5,
        deptName: '市场部门'
      },
      {
        deptId: 6,
        deptName: '财务部门'
      }
    ]
  }
])

// 部门树引用
const deptTreeRef = ref(null)

// 处理数据权限分配
const handleDataScope = (row) => {
  currentRole.value = { ...row }
  dataScopeForm.roleId = row.roleId
  dataScopeForm.dataScope = row.dataScope || 1
  dataScopeForm.deptIds = row.deptIds || []
  dataScopeDialog.visible = true
}

// 提交数据权限
const handleDataScopeSubmit = async () => {
  try {
    // 获取选中的部门ID
    if (dataScopeForm.dataScope === 2) {
      dataScopeForm.deptIds = deptTreeRef.value.getCheckedKeys()
    }

    // 更新角色的数据权限
    const index = roleList.value.findIndex(item => item.roleId === dataScopeForm.roleId)
    if (index > -1) {
      roleList.value[index].dataScope = dataScopeForm.dataScope
      roleList.value[index].deptIds = dataScopeForm.deptIds
    }

    ElMessage.success('数据权限配置成功')
    dataScopeDialog.visible = false
  } catch (error) {
    console.error('配置数据权限失败:', error)
    ElMessage.error('配置数据权限失败')
  }
}

// 处理下拉菜单命令
const handleCommand = (command, row) => {
  switch (command) {
    case 'permission':
      handlePermission(row)
      break
    case 'dataScope':
      handleDataScope(row)
      break
  }
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

  .pagination-wrapper {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
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