# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指导。

## 命令

```
npm run dev        # 启动开发服务器，端口 5173
npm run build      # 类型检查 + 生产构建
npm run preview    # 预览生产构建
```

暂无测试框架配置。

## 架构

Vue 3.5 + TypeScript + Vite 6 + Ant Design Vue 4.x + Vue Router 4 + Pinia + Axios。

仿知乎论坛前端。后端为 Spring Boot 3 应用，地址 `192.168.1.7:8080`（仓库 `spring-tdd-zhihu`）。Vite 开发服务器将 `/api` 代理到 `http://192.168.1.7:8080`，并去掉 `/api` 前缀。

### 目录结构

```
src/
├── api/
│   ├── request.ts       # Axios 实例，含请求/响应拦截器
│   ├── auth.ts          # 登录 / 注册
│   ├── questions.ts     # 问题 CRUD、投票、关注
│   └── answers.ts       # 答案 CRUD、投票、标记最佳
├── router/index.ts      # 4 条路由，无全局守卫
├── stores/auth.ts       # Pinia 认证 store（token + username 持久化到 localStorage）
├── types/api.ts         # CommonResult、PageInfo、UserVo、QuestionVo、AnswerVo、DTO
├── layouts/
│   ├── MainLayout.vue   # 蓝色顶部导航 + 内容区 + 页脚
│   └── AuthLayout.vue   # 左侧品牌面板（渐变蓝）+ 右侧表单面板
└── views/
    ├── LoginView.vue
    ├── RegisterView.vue
    ├── QuestionListView.vue   # 问题列表，公开访问，分页
    └── QuestionDetailView.vue  # 问题详情，需认证：问题内容 + 投票/关注 + 答案列表/投票 + 回答表单
```

### 后端 API 约定

- **响应封装**: `CommonResult<T>` → `{ code: number, message: string, data: T }`
- **JWT 认证**: Token 通过 `Authorization` 头传递，**不带** Bearer 前缀（后端直接解析原始 token）
- **测试用户**: Jane / John / Foo，密码均为 `password`

### 关键设计决策

1. **无全局路由守卫** — 认证逻辑在 API 层和组件层处理。公开接口通过 `skipAuth: true` 跳过 token 附加。需认证但可选登录的接口使用 `noAuthRedirect: true`，让组件自行展示登录提示，而非拦截器自动跳转。
2. **Axios 响应拦截器** 解包 `CommonResult`：若 `code !== 200` 则显示错误消息。401/403 时清空 localStorage 并跳转到 `/login`（除非设置了 `noAuthRedirect`）。
3. **登录回跳链**: `redirect` 查询参数贯穿 列表 → 登录 → 注册 → 登录 → 返回原页面。
