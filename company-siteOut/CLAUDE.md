# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述
这是中国人寿（海外）企业中心系统前端项目，使用Vue 3 + Vite + Element Plus技术栈，为企业提供央积金、私退金等保险业务管理功能。

## 核心开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本  
npm run build

# 预览构建结果
npm run preview

# 代码检查和自动修复
npm run lint
```

开发服务器运行在 http://localhost:3001，API请求会代理到 http://localhost:8080。

## 项目架构

### 技术栈
- **框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **UI库**: Element Plus + Element Plus Icons
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP客户端**: Axios
- **加密**: JSEncrypt

### 目录结构
- `src/api/` - API接口定义，使用统一的request.js封装axios
- `src/components/` - 公共组件
- `src/directives/` - 自定义指令（如权限指令）
- `src/layout/` - 布局组件，包含顶部导航、侧边菜单、面包屑等
- `src/router/` - 路由配置，支持三级菜单结构
- `src/stores/` - Pinia状态管理
- `src/utils/` - 工具函数（加密、图片处理等）
- `src/views/` - 页面组件，按业务模块组织

### 业务模块结构
项目包含以下主要业务模块：
- **央积金共同计划** (`central-fund/`) - 包含自动供款、手动供款、供款调整、线上办理等
- **私退金共同计划** (`private-fund/`) - 与央积金功能对称，业务逻辑一致
- **系统管理** (`system/`) - 用户管理、角色管理、权限管理等

## 开发规范

### 组件开发
- 使用Vue 3 Composition API
- 优先使用Element Plus组件
- 保持央积金和私退金模块的代码对称性
- 遵循现有的文件命名和目录结构约定

### API集成
- API调用统一通过`src/api/`目录下的模块
- 请求拦截器自动添加Authorization头
- 统一的错误处理和消息提示

### 权限控制
- 使用Pinia user store管理用户状态和权限
- 路由守卫检查登录状态
- 支持基于角色和权限的访问控制

### 样式规范
- 主题色：#2C8976（绿色）、#F39800（橙色）
- 使用Element Plus的设计规范
- 响应式布局，支持企业级应用的复杂界面需求

## 关键配置

### 环境变量
- `VITE_API_BASE_URL` - API基础URL
- 开发环境自动代理API请求到localhost:8080

### 路由配置
- 支持三级菜单结构
- 自动生成面包屑导航
- 基于token的路由守卫

### 自动导入配置
- Vue相关API自动导入
- Element Plus组件按需导入和自动导入
- 别名配置：`@` 指向 `src/` 目录

## 重要特性

### 菜单系统
- 三级菜单结构，支持图标和权限控制
- 动态面包屑导航
- 菜单状态与路由同步

### 业务流程
- 完整的供款管理流程（通知书查询、凭证上传、记录查询）
- 雇员管理和线上申请流程
- 服务进度跟踪和消息通知

### 用户体验
- 页面切换动画效果
- 统一的加载状态和错误处理
- 响应式设计适配不同屏幕尺寸

## 开发注意事项

1. **模块对称性**: 央积金(`central-fund`)和私退金(`private-fund`)功能完全对称，修改时需要同时更新两个模块
2. **权限检查**: 新功能需要考虑权限控制，通过user store的`hasPermission`和`hasRole`方法
3. **API集成**: 新的API调用需要在对应的api模块中定义，遵循现有的错误处理模式
4. **样式一致性**: 保持与现有设计系统的一致性，使用统一的主题色和组件样式

项目当前完成度达85.7%，主要功能已实现，剩余部分为详情弹窗和部分记录查询功能。