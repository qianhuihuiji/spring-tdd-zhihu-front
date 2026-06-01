import request from './request'
import type { CommentVo, PageInfo } from '@/types/api'

export function getQuestionComments(
  questionId: number,
  params: { pageIndex: number; pageSize: number }
): Promise<PageInfo<CommentVo>> {
  return request
    .get(`/comments/questions/${questionId}`, { params, noAuthRedirect: true } as any)
    .then((res) => res.data.data)
}

export function postQuestionComment(
  questionId: number,
  data: { content: string }
): Promise<void> {
  return request
    .post(`/comments/questions/${questionId}`, data)
    .then((res) => res.data)
}

export function getAnswerComments(
  answerId: number,
  params: { pageIndex: number; pageSize: number }
): Promise<PageInfo<CommentVo>> {
  return request
    .get(`/comments/answers/${answerId}`, { params, noAuthRedirect: true } as any)
    .then((res) => res.data.data)
}

export function postAnswerComment(
  answerId: number,
  data: { content: string }
): Promise<void> {
  return request
    .post(`/comments/answers/${answerId}`, data)
    .then((res) => res.data)
}

export function upVoteComment(commentId: number): Promise<void> {
  return request
    .post(`/comments/${commentId}/up-votes`)
    .then((res) => res.data)
}

export function cancelUpVoteComment(commentId: number): Promise<void> {
  return request
    .delete(`/comments/${commentId}/up-votes`)
    .then((res) => res.data)
}

export function downVoteComment(commentId: number): Promise<void> {
  return request
    .post(`/comments/${commentId}/down-votes`)
    .then((res) => res.data)
}

export function cancelDownVoteComment(commentId: number): Promise<void> {
  return request
    .delete(`/comments/${commentId}/down-votes`)
    .then((res) => res.data)
}
