import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi } from '@/api/auth'
import type { LoginDto, RegisterDto } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const username = ref<string | null>(localStorage.getItem('username'))

  const isLoggedIn = computed(() => !!token.value)

  async function login(loginDto: LoginDto) {
    const jwt = await loginApi(loginDto)
    token.value = jwt
    username.value = loginDto.username
    localStorage.setItem('token', jwt)
    localStorage.setItem('username', loginDto.username)
  }

  async function register(registerDto: RegisterDto) {
    await registerApi(registerDto)
  }

  function logout() {
    token.value = null
    username.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  return { token, username, isLoggedIn, login, register, logout }
})
