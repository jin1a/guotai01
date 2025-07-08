<template>
  <div class="notification">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>消息通知</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleReadAll">
              全部已讀
            </el-button>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="未讀消息" name="unread">
          <div v-if="unreadMessages.length === 0" class="empty-state">
            暫無未讀消息
          </div>
          <el-timeline v-else>
            <el-timeline-item
              v-for="message in unreadMessages"
              :key="message.id"
              :timestamp="message.time"
              :type="message.type"
            >
              <el-card class="message-card">
                <div class="message-header">
                  <span class="message-title">{{ message.title }}</span>
                  <el-tag :type="getTagType(message.type)" size="small">
                    {{ message.type }}
                  </el-tag>
                </div>
                <div class="message-content">{{ message.content }}</div>
                <div class="message-actions">
                  <el-button type="text" @click="handleRead(message)">
                    標記已讀
                  </el-button>
                  <el-button type="text" @click="handleDelete(message)">
                    刪除
                  </el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>

        <el-tab-pane label="全部消息" name="all">
          <div v-if="allMessages.length === 0" class="empty-state">
            暫無消息
          </div>
          <el-timeline v-else>
            <el-timeline-item
              v-for="message in allMessages"
              :key="message.id"
              :timestamp="message.time"
              :type="message.type"
            >
              <el-card class="message-card" :class="{ 'is-read': message.isRead }">
                <div class="message-header">
                  <span class="message-title">{{ message.title }}</span>
                  <el-tag :type="getTagType(message.type)" size="small">
                    {{ message.type }}
                  </el-tag>
                </div>
                <div class="message-content">{{ message.content }}</div>
                <div class="message-actions">
                  <el-button type="text" @click="handleDelete(message)">
                    刪除
                  </el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const activeTab = ref('unread')

const unreadMessages = ref([
  {
    id: 1,
    title: '供款提醒',
    content: '您的本月供款即將到期，請及時繳納。',
    type: '提醒',
    time: '2024-03-20 09:00',
    isRead: false
  },
  {
    id: 2,
    title: '系統維護通知',
    content: '系統將於本週六凌晨2:00-4:00進行例行維護，期間可能無法訪問。',
    type: '系統',
    time: '2024-03-19 15:30',
    isRead: false
  }
])

const allMessages = ref([
  {
    id: 1,
    title: '供款提醒',
    content: '您的本月供款即將到期，請及時繳納。',
    type: '提醒',
    time: '2024-03-20 09:00',
    isRead: false
  },
  {
    id: 2,
    title: '系統維護通知',
    content: '系統將於本週六凌晨2:00-4:00進行例行維護，期間可能無法訪問。',
    type: '系統',
    time: '2024-03-19 15:30',
    isRead: false
  },
  {
    id: 3,
    title: '結單更新',
    content: '您的2024年2月份結單已生成，可前往查看。',
    type: '通知',
    time: '2024-03-01 10:00',
    isRead: true
  }
])

const getTagType = (type) => {
  const types = {
    '提醒': 'warning',
    '系統': 'danger',
    '通知': 'info'
  }
  return types[type] || 'info'
}

const handleRead = (message) => {
  message.isRead = true
  unreadMessages.value = unreadMessages.value.filter(m => m.id !== message.id)
  ElMessage.success('已標記為已讀')
}

const handleReadAll = () => {
  unreadMessages.value.forEach(message => {
    message.isRead = true
  })
  unreadMessages.value = []
  ElMessage.success('全部標記為已讀')
}

const handleDelete = (message) => {
  unreadMessages.value = unreadMessages.value.filter(m => m.id !== message.id)
  allMessages.value = allMessages.value.filter(m => m.id !== message.id)
  ElMessage.success('消息已刪除')
}
</script>

<style scoped>
.notification {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  gap: 16px;
}
.empty-state {
  text-align: center;
  color: #909399;
  padding: 30px 0;
}
.message-card {
  margin-bottom: 10px;
}
.message-card.is-read {
  opacity: 0.7;
}
.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.message-title {
  font-weight: bold;
}
.message-content {
  color: #606266;
  margin-bottom: 10px;
}
.message-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}
</style> 