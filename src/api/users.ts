import request from './request'
import type { UserVo } from '@/types/api'

export function getUser(id: number): Promise<UserVo> {
  return request
    .get(`/users/${id}`)
    .then((res) => res.data.data)
}

export function getActiveUsers(): Promise<UserVo[]> {
  return request
    .get('/active-users')
    .then((res) => res.data.data)
}

export function uploadAvatar(id: number, file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  return request
    .post(`/users/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((res) => res.data.data)
}
