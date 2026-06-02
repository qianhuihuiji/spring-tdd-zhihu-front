import request from './request'
import type { NotificationVo, PageInfo } from '@/types/api'

export function getNotifications(params: {
  pageIndex: number
  pageSize: number
}): Promise<PageInfo<NotificationVo>> {
  return request
    .get('/notifications', { params })
    .then((res) => res.data.data)
}
