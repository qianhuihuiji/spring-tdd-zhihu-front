// 分页信息
export interface PageInfo<T> {
  pageNum: number
  pageSize: number
  total: number
  pages: number
  list: T[]
}

// 统一响应
export interface CommonResult<T> {
  code: number
  message: string
  data: T
}

// 用户
export interface UserVo {
  id: number
  name: string
  phone: string
  email: string
  avatar: string | null
}

// 问题
export interface QuestionVo {
  id: number
  userId: number
  title: string
  content: string
  answersCount: number
  voteUpCount: number
  voteDownCount: number
  voteType: number | null
}

// 答案
export interface AnswerVo {
  id: number
  questionId: number
  userId: number
  content: string
  voteUpCount: number
  voteDownCount: number
  voteType: number | null
  createdAt: string
  updatedAt: string
}

// 登录请求
export interface LoginDto {
  username: string
  password: string
}

// 通知
export interface NotificationVo {
  id: number
  type: string
  userId: number
  readAt: string | null
  createdAt: string
  updatedAt: string
}

// 用户动态
export interface ActivityVo {
  id: number
  userId: number
  type: string
  subjectId: number
  subjectType: string
  createdAt: string
}

// 修改密码
export interface ChangePasswordDto {
  oldPassword: string
  newPassword: string
}

// 评论
export interface CommentVo {
  id: number
  commentedId: number
  content: string
  voteUpCount: number
  voteDownCount: number
  voteType: number | null
  createTime: string
}

// 创建问题请求
export interface CreateQuestionDto {
  title: string
  content: string
  categoryId: number
}

// 注册请求
export interface RegisterDto {
  name: string
  phone: string
  email: string
  password: string
}
