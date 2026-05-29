import request from './request'
import type { LoginDto, RegisterDto } from '@/types/api'

export function login(data: LoginDto): Promise<string> {
  return request.post('/auth/login', data).then((res) => res.data.data)
}

export function register(data: RegisterDto): Promise<string> {
  return request.post('/auth/register', data).then((res) => res.data.message)
}
