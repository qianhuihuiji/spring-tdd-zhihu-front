import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi } from '@/api/auth'
import type { LoginDto, RegisterDto } from '@/types/api'

function parseJwtPayload(jwt: string): Record<string, any> | null {
  try {
    const parts = jwt.split('.')
    if (parts.length !== 3) return null
    const payload = parts[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const username = ref<string | null>(localStorage.getItem('username'))
  const userId = ref<number | null>(
    localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : null
  )

  const isLoggedIn = computed(() => !!token.value)

  async function login(loginDto: LoginDto) {
    const jwt = await loginApi(loginDto)
    token.value = jwt
    username.value = loginDto.username
    localStorage.setItem('token', jwt)
    localStorage.setItem('username', loginDto.username)

    const payload = parseJwtPayload(jwt)
    if (payload?.userId) {
      userId.value = payload.userId
      localStorage.setItem('userId', String(payload.userId))
    }
  }

  async function register(registerDto: RegisterDto) {
    await registerApi(registerDto)
  }

  function logout() {
    token.value = null
    username.value = null
    userId.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('userId')
  }

  return { token, username, userId, isLoggedIn, login, register, logout }
})
