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
  // E100 - 账户概览
  {
    path: '/dashboard',
    meta: {
      title: '账户概览',
      icon: HomeFilled
    }
  },
  // E200 - 服务进度
  {
    path: '/service-progress',
    meta: {
      title: '服务进度',
      icon: Monitor
    },
    children: [
      // E200-1 服务进度详情 (弹窗页面，路由仅作占位)
      {
        path: 'auto-contribution',
        meta: {
          title: '雇主供款进度'
        }
      },
      // {
      //   path: 'contribution-request',
      //   meta: {
      //     title: '供款调整申请进度'
      //   }
      // },
      // 历史服务查询 (本期暂不实现，已注释)
      // {
      //   path: 'history',
      //   meta: {
      //     title: '历史服务查询'
      //   }
      // }
    ]
  },
  // E300 - 消息通知 (本期暂不实现，已注释)
  // {
  //   path: '/notification',
  //   meta: {
  //     title: '消息通知',
  //     icon: Message
  //   }
  // },
  // E400 - 电子通知书 (本期暂不实现，已注释)
  // {
  //   path: '/electronic-notice',
  //   meta: {
  //     title: '电子通知书',
  //     icon: Document
  //   }
  // },
  // E500 - 央积金共同计划
  {
    path: '/central-fund',
    meta: {
      title: '央积金共同计划',
      icon: Money
    },
    children: [
      // E501 - 待办列表
      {
        path: 'todo',
        meta: {
          title: '待办列表'
        }
      },
      // E502 - 雇员管理
      {
        path: 'employee',
        meta: {
          title: '雇员管理'
        }
      },
      // 雇主供款模块 (合并原自动供款和手动供款)
      {
        path: 'employer-contribution',
        meta: {
          title: '雇主供款'
        },
        children: [
          // 供款记录查询
          {
            path: 'records-query',
            meta: {
              title: '供款记录查询'
            }
          },
          // 自动供款账单
          {
            path: 'auto-bill',
            meta: {
              title: '自动供款账单'
            }
          },
          // 手动供款账单  
          {
            path: 'manual-bill',
            meta: {
              title: '手动供款账单'
            }
          },
          // 提交供款清单
          {
            path: 'submit-list',
            meta: {
              title: '提交供款清单'
            }
          }
        ]
      },
      // E506 - 线上办理
      {
        path: 'online',
        meta: {
          title: '线上办理'
        },
        children: [
          // E506-1 - 新加入计划申请
          {
            path: 'join-application',
            meta: {
              title: '新加入计划申请'
            }
          },
          // E506-2 - 终止参与计划申请
          {
            path: 'termination-application',
            meta: {
              title: '终止参与计划申请'
            }
          },
          // E506-3 - 调职申请
          {
            path: 'transfer-application',
            meta: {
              title: '调职申请'
            }
          },
          // E506-4 - 薪资调整申请
          {
            path: 'salary-adjustment',
            meta: {
              title: '薪资调整申请'
            }
          }
        ]
      }
    ]
  },
  // E600 - 私退金共同计划 (子菜单已隐藏)
  {
    path: '/private-fund',
    meta: {
      title: '私退金共同计划',
      icon: Wallet
    },
    children: [
      // 所有子菜单已隐藏，暂不开放
      // // E601 - 待办列表
      // {
      //   path: 'todo',
      //   meta: {
      //     title: '待办列表'
      //   }
      // },
      // // E602 - 雇员管理
      // {
      //   path: 'index',
      //   meta: {
      //     title: '雇员管理'
      //   }
      // },
      // // 雇主供款模块 (合并原自动供款和手动供款)
      // {
      //   path: 'employer-contribution',
      //   meta: {
      //     title: '雇主供款'
      //   },
      //   children: [
      //     // 自动供款账单
      //     {
      //       path: 'auto-bill',
      //       meta: {
      //         title: '自动供款账单'
      //       }
      //     },
      //     // 手动供款账单
      //     {
      //       path: 'manual-bill',
      //       meta: {
      //         title: '手动供款账单'
      //       }
      //     },
      //     // 提交供款清单
      //     {
      //       path: 'submit-list',
      //       meta: {
      //         title: '提交供款清单'
      //       }
      //     },
      //     // 供款记录查询
      //     {
      //       path: 'records-query',
      //       meta: {
      //         title: '供款记录查询'
      //       }
      //     }
      //   ]
      // },
      // // E606 - 线上办理
      // {
      //   path: 'online',
      //   meta: {
      //     title: '线上办理'
      //   },
      //   children: [
      //     // E606-1 - 新加入计划申请
      //     {
      //       path: 'join-application',
      //       meta: {
      //         title: '新加入计划申请'
      //       }
      //     },
      //     // E606-2 - 终止参与计划申请
      //     {
      //       path: 'termination-application',
      //       meta: {
      //         title: '终止参与计划申请'
      //       }
      //     },
      //     // E606-3 - 调职申请
      //     {
      //       path: 'transfer-application',
      //       meta: {
      //         title: '调职申请'
      //       }
      //     },
      //     // E606-4 - 薪资调整申请
      //     {
      //       path: 'salary-adjustment',
      //       meta: {
      //         title: '薪资调整申请'
      //       }
      //     }
      //   ]
      // }
    ]
  },
  // E700 - 系统管理
  {
    path: '/system',
    meta: {
      title: '系统管理',
      icon: Setting
    },
    children: [
      // E701 - 用户管理
      {
        path: 'users',
        meta: {
          title: '用户管理',
          icon: UserFilled
        }
      },
      // E702 - 角色管理 (本期暂不实现，已注释)
      // {
      //   path: 'roles',
      //   meta: {
      //     title: '角色管理',
      //     icon: Lock
      //   }
      // },
      // E703 - 部门管理 (本期暂不实现，已注释)
      // {
      //   path: 'departments',
      //   meta: {
      //     title: '部门管理',
      //     icon: OfficeBuilding
      //   }
      // },
      // E704 - 菜单管理 (本期暂不实现，已注释)
      // {
      //   path: 'menus',
      //   meta: {
      //     title: '菜单管理',
      //     icon: Menu
      //   }
      // },
      // E705 - 权限管理
      {
        path: 'permissions',
        meta: {
          title: '权限管理',
          icon: Key
        }
      },
      // E706 - 其他设置 (本期暂不实现，已注释)
      // {
      //   path: 'settings',
      //   meta: {
      //     title: '其他设置'
      //   }
      // }
    ]
  }
] 