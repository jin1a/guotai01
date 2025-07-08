<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <div class="search-wrapper">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="部门名称">
          <el-input v-model="queryParams.deptName" placeholder="请输入部门名称" clearable />
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
      <el-button type="primary" @click="handleAdd">新增部门</el-button>
    </div>

    <!-- 表格区域 -->
    <el-table
      v-loading="loading"
      :data="deptList"
      row-key="deptId"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      border
      default-expand-all
    >
      <el-table-column prop="deptName" label="部门名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="orderNum" label="排序" width="80" align="center" />
      <el-table-column prop="leader" label="负责人" min-width="100" show-overflow-tooltip />
      <el-table-column prop="phone" label="联系电话" min-width="120" show-overflow-tooltip />
      <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
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
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="text" @click="handleAdd(row)">新增</el-button>
          <el-button type="text" @click="handleEdit(row)">编辑</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑部门弹窗 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="600px"
      append-to-body
      @close="handleDialogClose"
    >
      <el-form
        ref="deptFormRef"
        :model="deptForm"
        :rules="deptRules"
        label-width="100px"
      >
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="deptForm.parentId"
            :data="deptOptions"
            :props="{ label: 'deptName', value: 'deptId', children: 'children' }"
            placeholder="请选择上级部门"
            check-strictly
            clearable
          />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="deptForm.deptName" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="显示排序" prop="orderNum">
          <el-input-number v-model="deptForm.orderNum" :min="0" :max="999" controls-position="right" />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="deptForm.leader" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="deptForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="deptForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="deptForm.status">
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询参数
const queryParams = reactive({
  deptName: '',
  status: undefined
})

// 部门列表数据
const deptList = ref([
  {
    deptId: 1,
    deptName: '中国人寿（海外）',
    orderNum: 1,
    leader: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    status: 1,
    createTime: '2024-01-15 10:00:00',
    children: [
      {
        deptId: 2,
        parentId: 1,
        deptName: '技术部',
        orderNum: 1,
        leader: '李四',
        phone: '13800138001',
        email: 'lisi@example.com',
        status: 1,
        createTime: '2024-01-16 11:00:00',
        children: [
          {
            deptId: 6,
            parentId: 2,
            deptName: '开发组',
            orderNum: 1,
            leader: '王五',
            phone: '13800138005',
            email: 'wangwu@example.com',
            status: 1,
            createTime: '2024-01-20 15:00:00'
          },
          {
            deptId: 7,
            parentId: 2,
            deptName: '测试组',
            orderNum: 2,
            leader: '赵六',
            phone: '13800138006',
            email: 'zhaoliu@example.com',
            status: 1,
            createTime: '2024-01-20 16:00:00'
          }
        ]
      },
      {
        deptId: 3,
        parentId: 1,
        deptName: '人事部',
        orderNum: 2,
        leader: '王五',
        phone: '13800138002',
        email: 'wangwu@example.com',
        status: 1,
        createTime: '2024-01-17 12:00:00'
      },
      {
        deptId: 4,
        parentId: 1,
        deptName: '财务部',
        orderNum: 3,
        leader: '赵六',
        phone: '13800138003',
        email: 'zhaoliu@example.com',
        status: 1,
        createTime: '2024-01-18 13:00:00'
      },
      {
        deptId: 5,
        parentId: 1,
        deptName: '市场部',
        orderNum: 4,
        leader: '钱七',
        phone: '13800138004',
        email: 'qianqi@example.com',
        status: 0,
        createTime: '2024-01-19 14:00:00'
      }
    ]
  }
])

const loading = ref(false)

// 部门树选项
const deptOptions = ref([
  {
    deptId: 0,
    deptName: '中国人寿（海外）',
    children: [
      {
        deptId: 1,
        deptName: '技术部',
        children: [
          {
            deptId: 4,
            deptName: '开发组'
          },
          {
            deptId: 5,
            deptName: '测试组'
          }
        ]
      },
      {
        deptId: 2,
        deptName: '人事部'
      },
      {
        deptId: 3,
        deptName: '财务部'
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
const deptFormRef = ref(null)
const deptForm = reactive({
  deptId: undefined,
  parentId: undefined,
  deptName: '',
  orderNum: 0,
  leader: '',
  phone: '',
  email: '',
  status: 1
})

// 表单校验规则
const deptRules = {
  deptName: [
    { required: true, message: '部门名称不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  orderNum: [
    { required: true, message: '显示排序不能为空', trigger: 'blur' }
  ],
  leader: [
    { required: true, message: '负责人不能为空', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}

// 获取部门列表
const getList = async () => {
  try {
    loading.value = true
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟搜索过滤
    const filterDept = (list) => {
      return list.filter(item => {
        const nameMatch = !queryParams.deptName || item.deptName.includes(queryParams.deptName)
        const statusMatch = queryParams.status === undefined || item.status === queryParams.status
        const matched = nameMatch && statusMatch
        
        if (item.children && item.children.length) {
          item.children = filterDept(item.children)
          return item.children.length > 0 || matched
        }
        
        return matched
      })
    }
    
    deptList.value = filterDept(JSON.parse(JSON.stringify(deptList.value)))
  } catch (error) {
    console.error('获取部门列表失败:', error)
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
  queryParams.deptName = ''
  queryParams.status = undefined
  handleQuery()
}

// 新增按钮点击事件
const handleAdd = (row) => {
  dialog.title = '新增部门'
  dialog.visible = true
  Object.assign(deptForm, {
    deptId: undefined,
    parentId: row ? row.deptId : undefined,
    deptName: '',
    orderNum: 0,
    leader: '',
    phone: '',
    email: '',
    status: 1
  })
}

// 编辑按钮点击事件
const handleEdit = (row) => {
  dialog.title = '编辑部门'
  dialog.visible = true
  Object.assign(deptForm, row)
}

// 删除按钮点击事件
const handleDelete = (row) => {
  if (row.children && row.children.length) {
    ElMessage.warning('该部门包含子部门，不能删除')
    return
  }
  
  ElMessageBox.confirm('确认要删除该部门吗？', '警告', {
    type: 'warning'
  }).then(async () => {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const deleteDept = (list, deptId) => {
        const index = list.findIndex(item => item.deptId === deptId)
        if (index > -1) {
          list.splice(index, 1)
          return true
        }
        
        for (let i = 0; i < list.length; i++) {
          if (list[i].children && list[i].children.length) {
            if (deleteDept(list[i].children, deptId)) {
              return true
            }
          }
        }
        
        return false
      }
      
      deleteDept(deptList.value, row.deptId)
      ElMessage.success('删除成功')
    } catch (error) {
      console.error('删除部门失败:', error)
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
  deptFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const updateDept = (list, dept) => {
          for (let i = 0; i < list.length; i++) {
            if (list[i].deptId === dept.deptId) {
              Object.assign(list[i], dept)
              return true
            }
            
            if (list[i].children && list[i].children.length) {
              if (updateDept(list[i].children, dept)) {
                return true
              }
            }
          }
          
          return false
        }
        
        if (deptForm.deptId) {
          // 更新部门
          updateDept(deptList.value, { ...deptForm })
        } else {
          // 新增部门
          const newDept = {
            ...deptForm,
            deptId: Date.now(),
            createTime: new Date().toLocaleString()
          }
          
          const addDept = (list, parentId) => {
            if (!parentId) {
              list.push(newDept)
              return
            }
            
            for (let i = 0; i < list.length; i++) {
              if (list[i].deptId === parentId) {
                if (!list[i].children) {
                  list[i].children = []
                }
                list[i].children.push(newDept)
                return
              }
              
              if (list[i].children && list[i].children.length) {
                addDept(list[i].children, parentId)
              }
            }
          }
          
          addDept(deptList.value, deptForm.parentId)
        }
        
        ElMessage.success('保存成功')
        dialog.visible = false
        getList()
      } catch (error) {
        console.error('保存部门失败:', error)
      }
    }
  })
}

// 弹窗关闭事件
const handleDialogClose = () => {
  deptFormRef.value?.resetFields()
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