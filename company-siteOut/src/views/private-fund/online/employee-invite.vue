<template>
  <div class="private-fund-join-application">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>私退金新加入计划申请</span>
        </div>
      </template>
      
      <el-form :model="applicationForm" :rules="rules" ref="applicationFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划名称" prop="planName">
              <el-select v-model="applicationForm.planName" placeholder="请选择计划">
                <el-option label="私退金计划A" value="plan-a" />
                <el-option label="私退金计划B" value="plan-b" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="申请类型" prop="applicationType">
              <el-select v-model="applicationForm.applicationType" placeholder="请选择申请类型">
                <el-option label="新员工加入" value="new-employee" />
                <el-option label="转入其他计划" value="transfer-in" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="雇员姓名" prop="employeeName">
              <el-input v-model="applicationForm.employeeName" placeholder="请输入雇员姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="证件号码" prop="idNumber">
              <el-input v-model="applicationForm.idNumber" placeholder="请输入证件号码" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="入职日期" prop="hireDate">
              <el-date-picker
                v-model="applicationForm.hireDate"
                type="date"
                placeholder="选择入职日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划生效日期" prop="effectiveDate">
              <el-date-picker
                v-model="applicationForm.effectiveDate"
                type="date"
                placeholder="选择生效日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="基本工资" prop="basicSalary">
              <el-input v-model="applicationForm.basicSalary" placeholder="请输入基本工资" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="供款比例" prop="contributionRate">
              <el-input v-model="applicationForm.contributionRate" placeholder="请输入供款比例(%)" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="备注说明" prop="remark">
          <el-input
            v-model="applicationForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注说明"
          />
        </el-form-item>
        
        <el-form-item label="上传附件">
          <el-upload
            action="#"
            :on-change="handleFileChange"
            :file-list="fileList"
            :auto-upload="false"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">
                支持上传身份证、入职证明等文件，格式支持 pdf、jpg、png，单个文件不超过5MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitApplication">提交申请</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'PrivateFundJoinApplication',
  data() {
    return {
      applicationForm: {
        planName: '',
        applicationType: '',
        employeeName: '',
        idNumber: '',
        hireDate: '',
        effectiveDate: '',
        basicSalary: '',
        contributionRate: '',
        remark: ''
      },
      fileList: [],
      rules: {
        planName: [
          { required: true, message: '请选择计划名称', trigger: 'change' }
        ],
        applicationType: [
          { required: true, message: '请选择申请类型', trigger: 'change' }
        ],
        employeeName: [
          { required: true, message: '请输入雇员姓名', trigger: 'blur' }
        ],
        idNumber: [
          { required: true, message: '请输入证件号码', trigger: 'blur' }
        ],
        hireDate: [
          { required: true, message: '请选择入职日期', trigger: 'change' }
        ],
        effectiveDate: [
          { required: true, message: '请选择计划生效日期', trigger: 'change' }
        ],
        basicSalary: [
          { required: true, message: '请输入基本工资', trigger: 'blur' }
        ],
        contributionRate: [
          { required: true, message: '请输入供款比例', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    handleFileChange(file, fileList) {
      this.fileList = fileList
    },
    submitApplication() {
      this.$refs.applicationFormRef.validate((valid) => {
        if (valid) {
          // 提交后→P801-7(审核)，然后显示在E601(待办列表)
          this.$message.success('新加入计划申请提交成功')
          // 跳转到待办列表
          this.$router.push('/private-fund/todo')
        } else {
          this.$message.error('请完善表单信息')
        }
      })
    },
    resetForm() {
      this.$refs.applicationFormRef.resetFields()
      this.fileList = []
    }
  }
}
</script>

<style scoped>
.private-fund-join-application {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>