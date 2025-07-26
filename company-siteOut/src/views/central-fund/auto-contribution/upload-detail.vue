<template>
  <div class="upload-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>凭证上传详情 (E503-2-1)</span>
          <el-button @click="goBack">返回列表</el-button>
        </div>
      </template>
      
      <!-- 通知书信息 -->
      <el-descriptions title="通知书信息" :column="2" border>
        <el-descriptions-item label="通知书编号">{{ noticeDetail.noticeNo }}</el-descriptions-item>
        <el-descriptions-item label="计划名称">{{ noticeDetail.planName }}</el-descriptions-item>
        <el-descriptions-item label="缴费期间">{{ noticeDetail.period }}</el-descriptions-item>
        <el-descriptions-item label="应缴金额">
          <span class="amount-text">MOP {{ noticeDetail.amount }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="截止日期">
          <el-tag :type="getDueDateType(noticeDetail.dueDate)">
            {{ noticeDetail.dueDate }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="getStatusType(noticeDetail.status)">
            {{ noticeDetail.status }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      
      <!-- 上传表单 -->
      <div class="upload-section">
        <h3>上传供款凭证</h3>
        <el-form :model="uploadForm" :rules="rules" ref="uploadFormRef" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="实际缴费日期" prop="paymentDate">
                <el-date-picker
                  v-model="uploadForm.paymentDate"
                  type="date"
                  placeholder="选择缴费日期"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="实缴金额" prop="actualAmount">
                <el-input v-model="uploadForm.actualAmount" placeholder="请输入实际缴费金额">
                  <template #prepend>MOP</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="缴费方式" prop="paymentMethod">
                <el-select v-model="uploadForm.paymentMethod" placeholder="请选择缴费方式">
                  <el-option label="银行转账" value="bank-transfer" />
                  <el-option label="支票" value="check" />
                  <el-option label="网上银行" value="online-banking" />
                  <el-option label="ATM转账" value="atm" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="凭证编号" prop="voucherNo">
                <el-input v-model="uploadForm.voucherNo" placeholder="请输入凭证编号" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="备注说明">
            <el-input
              v-model="uploadForm.remark"
              type="textarea"
              :rows="3"
              placeholder="请输入备注说明"
            />
          </el-form-item>
          
          <el-form-item label="上传凭证" prop="files">
            <el-upload
              ref="uploadRef"
              action="#"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :file-list="fileList"
              :auto-upload="false"
              multiple
              :limit="5"
              list-type="picture-card"
              accept=".jpg,.jpeg,.png,.pdf"
            >
              <el-icon><Plus /></el-icon>
              <template #tip>
                <div class="el-upload__tip">
                  支持上传缴费凭证、银行回单、转账截图等文件<br>
                  格式支持 jpg、png、pdf，单个文件不超过5MB，最多上传5个文件
                </div>
              </template>
            </el-upload>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" size="large" @click="submitUpload" :loading="uploading">
              <el-icon><Upload /></el-icon>
              提交凭证
            </el-button>
            <el-button size="large" @click="resetForm">重置</el-button>
            <el-button size="large" @click="saveDraft">保存草稿</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import { Plus, Upload } from '@element-plus/icons-vue'

export default {
  name: 'CentralFundUploadDetail',
  components: {
    Plus,
    Upload
  },
  data() {
    return {
      noticeDetail: {
        noticeNo: 'CN2024001',
        planName: '央积金计划A',
        period: '2024年1月',
        amount: '100,000.00',
        dueDate: '2024-02-15',
        status: '待上传'
      },
      uploadForm: {
        paymentDate: '',
        actualAmount: '100,000.00',
        paymentMethod: '',
        voucherNo: '',
        remark: ''
      },
      fileList: [],
      uploading: false,
      // 表单验证规则 - 已移除必填项检查
      rules: {
        paymentDate: [],
        actualAmount: [],
        paymentMethod: [],
        voucherNo: [],
        files: []
      }
    }
  },
  mounted() {
    this.loadNoticeDetail()
  },
  methods: {
    loadNoticeDetail() {
      // 根据路由参数加载通知书详情
      const { id } = this.$route.params
      const { noticeNo } = this.$route.query
      console.log('加载凭证上传详情:', { id, noticeNo })
      // 预填充实缴金额
      this.uploadForm.actualAmount = this.noticeDetail.amount
    },
    getStatusType(status) {
      const statusMap = {
        '待上传': 'warning',
        '已上传': 'info',
        '审核中': 'primary',
        '已通过': 'success',
        '已拒绝': 'danger'
      }
      return statusMap[status] || 'info'
    },
    getDueDateType(dueDate) {
      const today = new Date()
      const due = new Date(dueDate)
      const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'danger'
      if (diffDays <= 7) return 'warning'
      return 'success'
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList
      // 手动触发验证
      this.$nextTick(() => {
        this.$refs.uploadFormRef?.validateField('files')
      })
    },
    handleFileRemove(file, fileList) {
      this.fileList = fileList
      // 手动触发验证
      this.$nextTick(() => {
        this.$refs.uploadFormRef?.validateField('files')
      })
    },
    submitUpload() {
      // 移除表单验证，直接提交
      // this.$refs.uploadFormRef.validate((valid) => {
      //   if (valid) {
          this.uploading = true
          // 模拟上传过程
          setTimeout(() => {
            this.uploading = false
            this.$message.success('供款凭证提交成功，已发送至营运中心审核')
            // 提交后→E501→E501-1→P801-8(营运端审核)
            // 同时显示在E200(服务进度)
            this.$router.push('/central-fund/todo')
          }, 2000)
      //   } else {
      //     this.$message.error('请完善表单信息')
      //   }
      // })
    },
    resetForm() {
      this.$refs.uploadFormRef.resetFields()
      this.fileList = []
    },
    saveDraft() {
      this.$message.success('草稿已保存')
    },
    goBack() {
      this.$router.go(-1)
    }
  }
}
</script>

<style scoped>
.upload-detail {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.amount-text {
  font-size: 18px;
  font-weight: bold;
  color: #e6a23c;
}

.upload-section {
  margin-top: 30px;
}

.upload-section h3 {
  margin-bottom: 20px;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
}

.el-upload__tip {
  line-height: 1.4;
  font-size: 12px;
  color: #606266;
  margin-top: 8px;
}

:deep(.el-upload-list--picture-card) {
  --el-upload-list-picture-card-size: 100px;
}

:deep(.el-upload--picture-card) {
  --el-upload-picture-card-size: 100px;
}
</style>