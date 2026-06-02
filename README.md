# 仿知乎论坛前端

基于 Vue 3 + TypeScript + Ant Design Vue 构建的问答社区前端，对接 Spring Boot 3 后端。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Vue 3.5 (Composition API + `<script setup>`) |
| 语言 | TypeScript 5.6 |
| 构建 | Vite 6 |
| UI 组件 | Ant Design Vue 4.x |
| 图标 | @ant-design/icons-vue 7.x |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia 2 |
| HTTP | Axios |
| 测试 | Playwright 1.60 |

## 快速开始

```bash
npm install
npm run dev        # 启动开发服务器 → http://localhost:5173
npm run build      # 类型检查 + 生产构建
npm run preview    # 预览生产构建
```

Vite 开发服务器将 `/api` 和 `/uploads` 代理到后端 `192.168.1.10:8080`。

## 功能概览

### 问题
- 问题列表（搜索、排序、分页、分类卡片）
- 问题详情（SEO URL `/questions/:id/:slug`）
- 创建问题（分类选择、自动发布）
- 问题投票 / 关注

### 回答
- 回答列表（分页、投票、删除）
- 写回答 / 标记最佳
- 答案投票

### 评论
- 问题评论 / 答案评论
- 评论投票
- 统一卡片式布局

### 用户
- 登录 / 注册 / 退出
- JWT 认证（不带 Bearer 前缀）
- 用户主页（头像、信息、修改密码、动态时间线）
- 头像上传
- 活跃用户侧边栏

### 通知
- 通知列表页
- header 下拉菜单未读 badge

### 其他
- 邮箱验证页面
- 首页、登录/注册页导航入口
- Playwright 浏览器自动化测试

## 项目结构

```
src/
├── api/                    # Axios API 层
│   ├── request.ts          # 实例、请求/响应拦截器
│   ├── auth.ts             # 登录、注册、邮箱验证
│   ├── questions.ts        # 问题 CRUD、投票、关注、发布
│   ├── answers.ts          # 答案 CRUD、投票、最佳
│   ├── comments.ts         # 评论 CRUD、投票
│   ├── notifications.ts    # 通知列表
│   └── users.ts            # 用户详情、活跃用户、头像、改密、动态
├── components/             # 可复用组件
│   ├── CommentSection.vue  # 评论列表 + 表单 + 投票
│   └── ActiveUsers.vue     # 活跃用户列表
├── constants/
│   └── categories.ts       # 问题分类常量
├── layouts/
│   ├── MainLayout.vue      # 主布局（header + 内容 + footer）
│   └── AuthLayout.vue      # 登录/注册布局（左品牌 + 右表单）
├── router/index.ts         # 路由配置（7 条路由）
├── stores/auth.ts          # Pinia 认证 store（token/username/userId）
├── types/api.ts            # 类型定义（VO、DTO、PageInfo）
├── utils/slug.ts           # 标题→URL slug 工具
└── views/
    ├── QuestionListView.vue      # 问题列表（首页）
    ├── QuestionDetailView.vue    # 问题详情
    ├── LoginView.vue
    ├── RegisterView.vue
    ├── NotificationListView.vue  # 通知列表
    ├── UserProfileView.vue       # 用户主页
    └── EmailVerifyView.vue       # 邮箱验证
```

## 认证规则

**仅 `GET /questions`（问题列表）为公开接口**，其余所有接口均需携带 JWT Token。Token 通过 `Authorization` 请求头传递，不带 `Bearer` 前缀。

- `skipAuth: true` — 仅用于问题列表，跳过 token 附加
- `noAuthRedirect: true` — 需认证但由组件自行处理 401 的接口

## 后端 API

后端为 Spring Boot 3 应用，共 36 个接口，前端已全部接入。

API 文档：`http://192.168.1.10:8080/v3/api-docs`（OpenAPI 3.0 JSON）

详见 `CLAUDE.md` 中的完整接口对照表。
