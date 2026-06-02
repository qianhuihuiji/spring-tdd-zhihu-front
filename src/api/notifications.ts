import request from './request'
import type { NotificationVo, PageInfo } from '@/types/api'

export function getNotifications(params: {
  pageIndex: number
  pageSize: number
}): Promise<PageInfo<NotificationVo>> {
  return request
    .get('/notifications', { params, noAuthRedirect: true } as any)
    .then((res) => res.data.data)
}
