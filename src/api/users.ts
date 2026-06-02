import request from './request'
import type { UserVo, ActivityVo, ChangePasswordDto, PageInfo } from '@/types/api'

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

export function changePassword(data: ChangePasswordDto): Promise<void> {
  return request
    .post('/users/me/password', data)
    .then((res) => res.data)
}

export function getActivities(params: {
  pageIndex: number
  pageSize: number
}): Promise<PageInfo<ActivityVo>> {
  return request
    .get('/activities', { params })
    .then((res) => res.data.data)
}
