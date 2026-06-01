# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在本仓库中工作时提供指导。

## 命令

```
npm run dev        # 启动开发服务器，端口 5173
npm run build      # 类型检查 + 生产构建
npm run preview    # 预览生产构建
npx playwright *   # 浏览器自动化测试（使用系统 Chrome）
```

暂无测试框架配置。

## 架构

Vue 3.5 + TypeScript + Vite 6 + Ant Design Vue 4.x + Vue Router 4 + Pinia + Axios。

仿知乎论坛前端。后端为 Spring Boot 3 应用，地址 `192.168.1.10:8080`（仓库 `spring-tdd-zhihu`）。Vite 开发服务器将 `/api` 代理到 `http://192.168.1.10:8080`，并去掉 `/api` 前缀。

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
- **API 文档**: `http://192.168.1.10:8080/v3/api-docs`（OpenAPI 3.0 JSON，公开访问）

### 关键设计决策

1. **无全局路由守卫** — 认证逻辑在 API 层和组件层处理。公开接口通过 `skipAuth: true` 跳过 token 附加。需认证但可选登录的接口使用 `noAuthRedirect: true`，让组件自行展示登录提示，而非拦截器自动跳转。
2. **Axios 响应拦截器** 解包 `CommonResult`：若 `code !== 200` 则显示错误消息。401/403 时清空 localStorage 并跳转到 `/login`（除非设置了 `noAuthRedirect`）。
3. **登录回跳链**: `redirect` 查询参数贯穿 列表 → 登录 → 注册 → 登录 → 返回原页面。

---

## 完整后端 API 参考

### 用户认证
| 方法 | 路径 | 说明 | 认证 | 请求体 |
|------|------|------|------|--------|
| POST | `/auth/register` | 注册 | 否 | `{ name, phone, email, password }` |
| POST | `/auth/login` | 登录 | 否 | `{ username, password }` |
| GET | `/auth/logout` | 登出 | 是 | - |
| GET | `/auth/verify-email` | 邮箱验证 | 否 | `?token=xxx` |

### 问题 (Questions)
| 方法 | 路径 | 说明 | 认证 | 参数/请求体 |
|------|------|------|------|-------------|
| GET | `/questions` | 问题列表 | 否 | `?pageIndex,pageSize,slug,by,popularity,unanswered` |
| POST | `/questions` | 创建问题 | 是 | `{ title, content, categoryId }` |
| GET | `/questions/{id}` | 问题详情 | 否 | - |
| GET | `/questions/{id}/{slug}` | 问题详情(SEO) | 否 | - |
| POST | `/questions/{questionId}/up-votes` | 点赞问题 | 是 | - |
| DELETE | `/questions/{questionId}/up-votes` | 取消点赞 | 是 | - |
| POST | `/questions/{questionId}/down-votes` | 点踩问题 | 是 | - |
| DELETE | `/questions/{questionId}/down-votes` | 取消点踩 | 是 | - |
| POST | `/questions/{questionId}/subscriptions` | 关注问题 | 是 | - |
| DELETE | `/questions/{questionId}/subscriptions` | 取消关注 | 是 | - |
| POST | `/questions/{questionId}/published-questions` | 发布问题 | 是 | - |

问题列表查询参数说明：
- `slug` — 按 slug 搜索（类似关键词）
- `by` — 排序方式
- `popularity` — 热度筛选（传数字）
- `unanswered` — 是否只看未回答（传数字）

### 答案 (Answers)
| 方法 | 路径 | 说明 | 认证 | 请求体 |
|------|------|------|------|--------|
| GET | `/questions/{questionId}/answers` | 答案列表 | 否 | `?pageIndex,pageSize` |
| POST | `/questions/{questionId}/answers` | 写回答 | 是 | `{ content }` |
| DELETE | `/answers/{answerId}` | 删除答案 | 是 | - |
| POST | `/answers/{answerId}/up-votes` | 点赞答案 | 是 | - |
| DELETE | `/answers/{answerId}/up-votes` | 取消点赞 | 是 | - |
| POST | `/answers/{answerId}/down-votes` | 点踩答案 | 是 | - |
| DELETE | `/answers/{answerId}/down-votes` | 取消点踩 | 是 | - |
| POST | `/answers/{answerId}/best` | 标记最佳答案 | 是 | - |

### 评论 (Comments) ← 前端尚未实现
| 方法 | 路径 | 说明 | 认证 | 请求体 |
|------|------|------|------|--------|
| GET | `/comments/questions/{questionId}` | 问题评论 | 否 | `?pageIndex,pageSize` |
| POST | `/comments/questions/{questionId}` | 写问题评论 | 是 | `{ content }` |
| GET | `/comments/answers/{answerId}` | 答案评论 | 否 | `?pageIndex,pageSize` |
| POST | `/comments/answers/{answerId}` | 写答案评论 | 是 | `{ content }` |
| POST | `/comments/{commentId}/up-votes` | 点赞评论 | 是 | - |
| DELETE | `/comments/{commentId}/up-votes` | 取消点赞 | 是 | - |
| POST | `/comments/{commentId}/down-votes` | 点踩评论 | 是 | - |
| DELETE | `/comments/{commentId}/down-votes` | 取消点踩 | 是 | - |

### 通知 (Notifications) ← 前端尚未实现
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/notifications` | 通知列表 | 是 | `?pageIndex,pageSize` |

### 用户 (Users) ← 前端尚未实现
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/users/{id}` | 用户详情 | 否 |
| POST | `/users/{id}/avatar` | 上传头像 | 是 | multipart/form-data |
| GET | `/active-users` | 活跃用户列表 | 否 |

---

## 数据模型

### QuestionVo
```
id, userId, title, content, answersCount, voteUpCount, voteDownCount, voteType,
answers?: PageInfo<AnswerVo>   // 详情接口可能内嵌答案
```

### AnswerVo
```
id, questionId, userId, content, voteUpCount, voteDownCount, voteType,
createdAt, updatedAt
```

### CommentVo
```
id, commentedId, content, voteUpCount, voteDownCount, voteType, createTime
```

### NotificationVo
```
id, type, userId, readAt, createdAt, updatedAt
```

### UserVo
```
id, name, phone, email, avatar
```

### 请求 DTO

| DTO | 字段 |
|-----|------|
| UserRegisterDto | name*, phone*(1[3-9]xxxxxxxxx), email*, password*(6-20位) |
| UserLoginDto | username*, password* |
| QuestionDto | title*, content*, categoryId* |
| AnswerDto | content* |
| CommentDto | content* |

---

## 前端实现状态 vs 后端能力

### 已实现
- 登录/注册
- 问题列表（分页、搜索、排序）
- 问题详情
- 问题投票/关注
- 答案列表
- 回答/删除答案
- 答案投票
- 标记最佳答案
- 提问弹窗

### 已知差异需修复

| 问题 | 当前实现 | 后端实际 |
|------|----------|----------|
| 创建问题 | `{ title, content }` | 需要 `{ title, content, categoryId }` |
| 问题列表查询 | 使用 `keyword` 参数 | 应使用 `slug` 参数 |
| 后台 IP | CLAUDE.md 写的 `192.168.1.7` | 实际是 `192.168.1.10` |

### 待开发功能（按优先级）

1. **评论系统** — 问题详情页添加问题评论 + 答案评论，含投票
2. **通知系统** — 头部通知铃铛 + 通知列表页
3. **用户主页** — `/users/:id` 展示用户信息和问答历史
4. **头像上传** — 用户设置页上传头像
5. **邮箱验证** — 注册后验证邮箱的流程页
6. **问题发布** — 创建后需调用 publish 接口
7. **SEO URL** — 问题详情使用 `/questions/:id/:slug` 格式
8. **活跃用户** — 侧边栏展示活跃用户

---

## 开发路线图

### Phase 1: 修复差异（当前）
- [ ] 创建问题加上 `categoryId` 字段
- [ ] 问题列表搜索改用 `slug` 参数（保持 keyword 前端行为不变）

### Phase 2: 评论系统
- [ ] 新建 `src/api/comments.ts`
- [ ] 新增 `CommentVo` 类型
- [ ] QuestionDetailView 添加评论区域

### Phase 3: 通知 + 用户
- [ ] 新建 `src/api/notifications.ts`
- [ ] 新建 `src/api/users.ts`
- [ ] Header 通知铃铛
- [ ] 通知列表页 `/notifications`
- [ ] 用户主页 `/users/:id`

### Phase 4: 完善
- [ ] 头像上传
- [ ] 问题 slug URL
- [ ] 活跃用户侧边栏
