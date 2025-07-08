<template>
  <div class="mine">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <div class="user-info">
        <div class="avatar">
          <van-icon name="contact" size="60" />
        </div>
        <div class="info">
          <div class="name-tag">
            <span class="name">陳大文</span>
            <span class="tag">已綁定保單</span>
          </div>
          <div class="login-time">上次登入2024年06月19日 15:19 (香港時間) 登入成功</div>
        </div>
      </div>
      <div class="action-buttons">
        <van-icon name="scan" size="24" />
        <van-icon name="globe" size="24" />
      </div>
    </div>

    <!-- 保单统计 -->
    <div class="policy-stats">
      <div class="stat-item">
        <div class="title">個險保單</div>
        <div class="count">15</div>
      </div>
      <div class="stat-item">
        <div class="title">團險保單</div>
        <div class="count">查看</div>
      </div>
    </div>

    <!-- 功能列表 -->
    <div class="function-list">
      <!-- 个人信息相关 -->
      <div class="list-item" v-for="(item, index) in personalItems" :key="'personal-'+index">
        <div class="item-left">
          <van-icon :name="item.icon" :color="item.color" size="24" />
          <span>{{ item.title }}</span>
        </div>
        <van-icon name="arrow" />
      </div>

      <!-- 系统服务 -->
      <div class="section-title">系統服務</div>
      <div class="list-item" v-for="(item, index) in systemItems" :key="'system-'+index">
        <div class="item-left">
          <van-icon :name="item.icon" :color="item.color" size="24" />
          <span>{{ item.title }}</span>
        </div>
        <van-icon name="arrow" />
      </div>
    </div>

    <!-- 客服浮动按钮 -->
    <div class="service-float">
      <van-icon name="service-o" size="24" />
      <span>服務中心</span>
    </div>

    <!-- 底部导航栏 -->
    <tab-bar />
  </div>
</template>

<script>
import TabBar from '@/components/layout/TabBar.vue'

export default {
  name: 'Mine',
  components: {
    TabBar
  },
  data() {
    return {
      personalItems: [
        { title: '我的個人信息', icon: 'contact', color: '#07c160' },
        { title: '我的證件信息', icon: 'idcard', color: '#2196f3' },
        { title: '我的銀行賬戶', icon: 'balance-list-o', color: '#9c27b0' },
        { title: '我的電子卡', icon: 'credit-pay', color: '#3f51b5' }
      ],
      systemItems: [
        { title: '用戶指南', icon: 'guide-o', color: '#ff9800' },
        { title: '賬戶與安全', icon: 'shield-o', color: '#ff5722' },
        { title: '私隱及條款', icon: 'notes-o', color: '#009688' },
        { title: '滿意度調查', icon: 'smile-o', color: '#cddc39' }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.mine {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 50px;
}

.user-card {
  background: linear-gradient(135deg, #00796b 0%, #009688 100%);
  padding: 20px 16px;
  color: #fff;

  .user-info {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 8px;

    .avatar {
      width: 60px;
      height: 60px;
      border-radius: 30px;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;

      .van-icon {
        color: #fff;
      }
    }

    .info {
      flex: 1;

      .name-tag {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;

        .name {
          font-size: 20px;
          font-weight: 500;
        }

        .tag {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
        }
      }

      .login-time {
        font-size: 12px;
        opacity: 0.8;
      }
    }
  }

  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }
}

.policy-stats {
  margin: 12px 16px;
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-around;

  .stat-item {
    text-align: center;

    .title {
      font-size: 14px;
      color: #666;
      margin-bottom: 8px;
    }

    .count {
      font-size: 20px;
      font-weight: 500;
      color: #333;
    }
  }
}

.function-list {
  margin: 12px 16px;
  background: #fff;
  border-radius: 8px;
  padding: 0 16px;

  .section-title {
    padding: 16px 0;
    color: #666;
    font-size: 14px;
    border-top: 1px solid #f5f5f5;
  }

  .list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f5f5f5;

    &:last-child {
      border-bottom: none;
    }

    .item-left {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #333;
      font-size: 14px;
    }

    .van-icon-arrow {
      color: #999;
    }
  }
}

.service-float {
  position: fixed;
  right: 16px;
  bottom: 80px;
  background: #fff;
  border-radius: 24px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .van-icon {
    color: #009688;
  }

  span {
    font-size: 14px;
    color: #333;
  }
}
</style> 