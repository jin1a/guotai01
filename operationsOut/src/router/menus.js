import {
  HomeFilled,
  Document,
  Avatar,
  Message,
  Download,
  Setting,
  Monitor,
  CaretBottom,
  Phone,
  Connection,
  Search,
  ChatDotRound,
  UserFilled,
  Lock,
  List,
  Money,
  Wallet,
  OfficeBuilding,
  Menu,
  Key
} from '@element-plus/icons-vue'

export const menus = [
  {
    path: '/dashboard',
    meta: {
      title: '賬戶概覽',
      icon: HomeFilled
    }
  },
  {
    path: '/central-fund',
    meta: {
      title: '央積金共同計劃',
      icon: Money
    },
    children: [
      {
        path: 'plan',
        meta: {
          title: '計劃管理'
        }
      },
      {
        path: 'employee',
        meta: {
          title: '僱員管理'
        }
      },
      {
        path: 'contribution',
        meta: {
          title: '供款管理'
        }
      }
    ]
  },
  {
    path: '/system',
    meta: {
      title: '系統管理',
      icon: Setting
    },
    children: [
      {
        path: 'users',
        meta: {
          title: '用戶管理',
          icon: UserFilled
        }
      },
      {
        path: 'roles',
        meta: {
          title: '角色管理',
          icon: Lock
        }
      },
      {
        path: 'departments',
        meta: {
          title: '部門管理',
          icon: OfficeBuilding
        }
      },
      {
        path: 'menus',
        meta: {
          title: '菜單管理',
          icon: Menu
        }
      },
      {
        path: 'permissions',
        meta: {
          title: '權限管理',
          icon: Key
        }
      }
    ]
  },
  {
    path: '/private-fund',
    meta: {
      title: '澳門私退金',
      icon: Document
    }
  },
  {
    path: '/company/info',
    meta: {
      title: '企業信息',
      icon: Avatar
    }
  },
  {
    path: '/settings',
    meta: {
      title: '其他設置',
      icon: Setting
    }
  },
  {
    path: '/notification',
    meta: {
      title: '消息通知',
      icon: Message
    }
  },
  {
    path: '/download',
    meta: {
      title: '下載中心',
      icon: Download
    }
  }
] 