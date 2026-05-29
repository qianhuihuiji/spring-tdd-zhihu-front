import axios from 'axios'
import { message } from 'ant-design-vue'
import router from '@/router'

const BASE_URL = '/api'

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截：自动附加 JWT Token（public 请求可通过 skipAuth 跳过）
request.interceptors.request.use(
  (config) => {
    if ((config as any).skipAuth) {
      return config
    }
    const raw = localStorage.getItem('token') || ''
    const token = raw.trim()
    if (token && /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/.test(token)) {
      config.headers.Authorization = token
    } else if (raw) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截：统一解包 CommonResult，处理 401/403
request.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== undefined && res.code !== 200) {
      message.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    // 返回 data 字段，使用方直接拿到业务数据
    return response
  },
  (error) => {
    if (error.response) {
      const status = error.response.status
      if (status === 401 || status === 403) {
        if ((error.config as any).noAuthRedirect) {
          return Promise.reject(error)
        }
        const hadToken = !!localStorage.getItem('token')
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        if (hadToken) {
          message.error('登录已过期，请重新登录')
        }
        router.push('/login')
      } else if (status === 500) {
        message.error('服务器错误')
      } else {
        message.error(error.response.data?.message || '请求失败')
      }
    } else {
      message.error('网络错误')
    }
    return Promise.reject(error)
  }
)

export default request
