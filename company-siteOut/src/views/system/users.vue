<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="queryParams.phone" placeholder="请输入手机号" clearable />
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
      <el-button type="primary" @click="handleAdd">新增用户</el-button>
    </div>

    <!-- 表格区域 -->
    <el-table v-loading="loading" :data="userList" border>
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
      <el-table-column prop="realName" label="真实姓名" min-width="120" show-overflow-tooltip />
      <el-table-column prop="phone" label="手机号" min-width="120" show-overflow-tooltip />
      <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
      <el-table-column prop="deptName" label="部门" min-width="120" show-overflow-tooltip />
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
      <el-table-column label="操作" width="250" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleReset(row)">重置密码</el-button>
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

    <!-- 添加/编辑用户弹窗 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="600px"
      append-to-body
      @close="handleDialogClose"
    >
      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="userForm.userId !== undefined" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="部门" prop="deptId">
          <el-select v-model="userForm.deptId" placeholder="请选择部门">
            <el-option
              v-for="item in deptOptions"
              :key="item.deptId"
              :label="item.deptName"
              :value="item.deptId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="userForm.roleIds" placeholder="请选择角色" multiple>
            <el-option
              v-for="item in roleOptions"
              :key="item.roleId"
              :label="item.roleName"
              :value="item.roleId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="userForm.remark"
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi } from '@/api/system'

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  username: '',
  phone: '',
  status: undefined
})

// 用户列表数据
const userList = ref([
  {
    userId: 1,
    username: 'admin',
    realName: '系统管理员',
    phone: '13800138000',
    email: 'admin@example.com',
    deptName: '技术部',
    deptId: 1,
    status: 1,
    roleIds: [1],
    createTime: '2024-01-15 10:00:00',
    remark: '超级管理员'
  },
  {
    userId: 2,
    username: 'zhangsan',
    realName: '张三',
    phone: '13800138001',
    email: 'zhangsan@example.com',
    deptName: '人事部',
    deptId: 2,
    status: 1,
    roleIds: [2],
    createTime: '2024-01-16 11:00:00',
    remark: '人事专员'
  },
  {
    userId: 3,
    username: 'lisi',
    realName: '李四',
    phone: '13800138002',
    email: 'lisi@example.com',
    deptName: '财务部',
    deptId: 3,
    status: 0,
    roleIds: [3],
    createTime: '2024-01-17 12:00:00',
    remark: '财务主管'
  },
  {
    userId: 4,
    username: 'wangwu',
    realName: '王五',
    phone: '13800138003',
    email: 'wangwu@example.com',
    deptName: '市场部',
    deptId: 4,
    status: 1,
    roleIds: [2, 3],
    createTime: '2024-01-18 13:00:00',
    remark: '市场经理'
  },
  {
    userId: 5,
    username: 'zhaoliu',
    realName: '赵六',
    phone: '13800138004',
    email: 'zhaoliu@example.com',
    deptName: '销售部',
    deptId: 5,
    status: 1,
    roleIds: [4],
    createTime: '2024-01-19 14:00:00',
    remark: '销售总监'
  }
])

const total = ref(5)

// 部门选项
const deptOptions = ref([
  {
    deptId: 1,
    deptName: '技术部'
  },
  {
    deptId: 2,
    deptName: '人事部'
  },
  {
    deptId: 3,
    deptName: '财务部'
  },
  {
    deptId: 4,
    deptName: '市场部'
  },
  {
    deptId: 5,
    deptName: '销售部'
  }
])

// 角色选项
const roleOptions = ref([
  {
    roleId: 1,
    roleName: '超级管理员'
  },
  {
    roleId: 2,
    roleName: '部门主管'
  },
  {
    roleId: 3,
    roleName: '普通员工'
  },
  {
    roleId: 4,
    roleName: '临时工'
  }
])

// 弹窗控制
const dialog = reactive({
  title: '',
  visible: false
})

// 表单对象
const userFormRef = ref(null)
const userForm = reactive({
  userId: undefined,
  username: '',
  realName: '',
  phone: '',
  email: '',
  deptId: undefined,
  roleIds: [],
  status: 1,
  remark: ''
})

// 表单校验规则 - 已移除必填项检查
const userRules = {
  username: [],
  realName: [],
  phone: [],
  email: [],
  deptId: [],
  roleIds: []
}

// 获取用户列表
const getList = async () => {
  try {
    loading.value = true
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟搜索过滤
    const filteredList = userList.value.filter(item => {
      const usernameMatch = !queryParams.username || item.username.includes(queryParams.username)
      const phoneMatch = !queryParams.phone || item.phone.includes(queryParams.phone)
      const statusMatch = queryParams.status === undefined || item.status === queryParams.status
      return usernameMatch && phoneMatch && statusMatch
    })
    
    // 模拟分页
    const start = (queryParams.pageNum - 1) * queryParams.pageSize
    const end = start + queryParams.pageSize
    userList.value = filteredList.slice(start, end)
    total.value = filteredList.length
  } catch (error) {
    console.error('获取用户列表失败:', error)
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
  queryParams.username = ''
  queryParams.phone = ''
  queryParams.status = undefined
  handleQuery()
}

// 新增按钮点击事件
const handleAdd = () => {
  dialog.title = '新增用户'
  dialog.visible = true
  Object.assign(userForm, {
    userId: undefined,
    username: '',
    realName: '',
    phone: '',
    email: '',
    deptId: undefined,
    roleIds: [],
    status: 1,
    remark: ''
  })
}

// 编辑按钮点击事件
const handleEdit = async (row) => {
  dialog.title = '编辑用户'
  dialog.visible = true
  try {
    const res = await userApi.getInfo(row.userId)
    Object.assign(userForm, res)
  } catch (error) {
    console.error('获取用户详情失败:', error)
  }
}

// 删除按钮点击事件
const handleDelete = (row) => {
  ElMessageBox.confirm('确认要删除该用户吗？', '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      const index = userList.value.findIndex(item => item.userId === row.userId)
      if (index !== -1) {
        userList.value.splice(index, 1)
        total.value--
      }
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除用户失败:', error)
    }
  }).catch(() => {})
}

// 重置密码按钮点击事件
const handleReset = (row) => {
  ElMessageBox.confirm('确认要重置该用户的密码吗？', '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      ElMessage.success('重置密码成功')
    } catch (error) {
      console.error('重置密码失败:', error)
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
  // 移除表单验证，直接提交
  // userFormRef.value?.validate(async (valid) => {
  //   if (valid) {
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (userForm.userId) {
          // 更新用户
          const index = userList.value.findIndex(item => item.userId === userForm.userId)
          if (index !== -1) {
            userList.value[index] = { ...userList.value[index], ...userForm }
          }
        } else {
          // 新增用户
          const newUser = {
            ...userForm,
            userId: userList.value.length + 1,
            createTime: new Date().toLocaleString()
          }
          userList.value.push(newUser)
          total.value++
        }
        
        ElMessage.success('保存成功')
        dialog.visible = false
        getList()
      } catch (error) {
        console.error('保存用户失败:', error)
      }
  //   }
  // })
}

// 弹窗关闭事件
const handleDialogClose = () => {
  userFormRef.value?.resetFields()
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

// 获取部门选项
const getDeptOptions = async () => {
  try {
    const res = await userApi.getDeptTree()
    deptOptions.value = res
  } catch (error) {
    console.error('获取部门列表失败:', error)
  }
}

// 获取角色选项
const getRoleOptions = async () => {
  try {
    const res = await userApi.getRoleList()
    roleOptions.value = res
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

// 初始化
onMounted(() => {
  getList()
  getDeptOptions()
  getRoleOptions()
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