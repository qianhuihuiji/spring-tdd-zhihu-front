---
name: zhihu-frontend-overview
description: Vue 3 仿知乎前端项目全貌 — 技术栈、文件结构、进度、后端 API 对接
metadata: 
  node_type: memory
  type: project
  originSessionId: 74dbf36f-fc43-4ac9-8133-ba77518504d0
---

# 知乎前端项目全貌

## 技术栈

Vue 3.5 + TypeScript + Vite 6 + Ant Design Vue 4.x + Vue Router 4 + Pinia + Axios

## 后端对照

- 后端: `spring-tdd-zhihu` (Spring Boot 3, Java 17, MySQL), 仓库 `qianhuihuiji/spring-tdd-zhihu`
- 后端地址: `192.168.1.7:8080`
- 统一响应: `CommonResult<T>` => `{ code, message, data }`
- JWT 认证: 无状态 token, Authorization 头直接传 token 值 (不带 Bearer 前缀)
- 测试用户: Jane/John/Foo, 密码均为 `password`

## 项目结构

```
src/
├── api/
│   ├── request.ts       # Axios 实例, token 拦截器, skipAuth/noAuthRedirect 标记
│   ├── auth.ts          # 登录/注册
│   ├── questions.ts     # 问题列表/详情/投票/关注
│   └── answers.ts       # 答案列表/提交/投票
├── router/index.ts      # 路由 (无全局守卫, 认证由 API 层处理)
├── stores/auth.ts       # Pinia auth store (token + username 持久化到 localStorage)
├── types/api.ts         # CommonResult, PageInfo, UserVo, QuestionVo, AnswerVo, LoginDto, RegisterDto
├── layouts/
│   ├── MainLayout.vue   # 主布局: 蓝色顶部导航 + 内容区 + 页脚
│   └── AuthLayout.vue   # 认证布局: 左右分栏 (左品牌区渐变蓝 + 右表单白)
└── views/
    ├── LoginView.vue          # 用户名+密码登录, AuthLayout
    ├── RegisterView.vue       # 一步式注册 (手机/用户名/邮箱/密码/确认密码), AuthLayout
    ├── QuestionListView.vue   # 首页问题列表 (分页, 公开)
    └── QuestionDetailView.vue # 问题详情: 问题内容/投票/关注 + 答案列表/投票 + 回答表单
```

## 已完成功能

- [x] 脚手架搭建 (Vite + Vue + TS + Antd + 中文 locale)
- [x] 登录/注册 (左右分栏式, 用户名登录, 一步注册)
- [x] 问题列表 (分页, show-size-changer, show-quick-jumper, show-total)
- [x] 问题详情 (内容展示, 投票, 关注, 答案列表分页, 答案投票, 回答表单)
- [x] JWT token 存取 (localStorage, Axios 拦截器自动附加)
- [x] 401 处理 (含 token 时弹"登录已过期", 无 token 时静默跳转)
- [x] 登录后回跳 (redirect query 参数全链路: 列表→登录→注册→登录→详情)
- [x] 未登录访问详情页 → 展示"需要登录"提示 + 去登录按钮
- [x] Authorization 头不带 Bearer 前缀

## 待开发

- [ ] 评论功能 (问题评论 / 答案评论)
- [ ] 用户中心 (头像上传, 个人资料)
- [ ] 通知列表
- [ ] 发布问题页
- [ ] 活跃用户页
- [ ] 搜索功能
- [ ] 标记最佳答案
- [ ] 删除答案

## API 路由对照

| 前端调用 | Vite 代理改写 | 后端实际路径 | 认证 |
|---------|-------------|------------|------|
| POST /api/auth/login | POST /auth/login | POST /auth/login | 公开 |
| POST /api/auth/register | POST /auth/register | POST /auth/register | 公开 |
| GET /api/questions | GET /questions | GET /questions | 公开 |
| GET /api/questions/:id | GET /questions/:id | GET /questions/:id | 需认证 |
| GET /api/questions/:id/answers | GET /questions/:id/answers | GET /questions/:id/answers | 需认证 |
| POST /api/questions/:id/answers | POST /questions/:id/answers | POST /questions/:id/answers | 需认证 |
| POST /api/questions/:id/up-votes | POST /questions/:id/up-votes | 同上 | 需认证 |
| DELETE /api/questions/:id/up-votes | DELETE /questions/:id/up-votes | 同上 | 需认证 |
| POST /api/questions/:id/down-votes | POST /questions/:id/down-votes | 同上 | 需认证 |
| DELETE /api/questions/:id/down-votes | DELETE /questions/:id/down-votes | 同上 | 需认证 |
| POST /api/questions/:id/subscriptions | POST /questions/:id/subscriptions | 同上 | 需认证 |
| DELETE /api/questions/:id/subscriptions | DELETE /questions/:id/subscriptions | 同上 | 需认证 |
| POST/DELETE /api/answers/:id/up-votes | POST/DELETE /answers/:id/up-votes | 同上 | 需认证 |
| POST/DELETE /api/answers/:id/down-votes | POST/DELETE /answers/:id/down-votes | 同上 | 需认证 |

## 关键设计决策

1. **Authorization 头不带 Bearer 前缀** — 后端 JWT Filter 直接接收原始 token
2. **public 接口用 skipAuth 跳过 token 附加** — 避免触发后端 JWT 解析
3. **需要认证但未登录的接口用 noAuthRedirect** — API 层不跳转, 页面自行展示登录提示
4. **无全局路由守卫** — 认证逻辑在 API 层和页面层处理, 用户体验更好
