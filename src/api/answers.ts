import request from './request'
import type { PageInfo, AnswerVo } from '@/types/api'

export function getAnswers(
  questionId: number,
  params: { pageIndex: number; pageSize: number }
): Promise<PageInfo<AnswerVo>> {
  return request
    .get(`/questions/${questionId}/answers`, { params })
    .then((res) => res.data.data)
}

export function postAnswer(
  questionId: number,
  data: { content: string }
): Promise<void> {
  return request
    .post(`/questions/${questionId}/answers`, data)
    .then((res) => res.data)
}

export function deleteAnswer(answerId: number): Promise<void> {
  return request.delete(`/answers/${answerId}`).then((res) => res.data)
}

export function markBestAnswer(answerId: number): Promise<void> {
  return request.post(`/answers/${answerId}/best`).then((res) => res.data)
}

// 答案投票
export function upVoteAnswer(answerId: number): Promise<void> {
  return request.post(`/answers/${answerId}/up-votes`).then((res) => res.data)
}

export function cancelUpVoteAnswer(answerId: number): Promise<void> {
  return request.delete(`/answers/${answerId}/up-votes`).then((res) => res.data)
}

export function downVoteAnswer(answerId: number): Promise<void> {
  return request.post(`/answers/${answerId}/down-votes`).then((res) => res.data)
}

export function cancelDownVoteAnswer(answerId: number): Promise<void> {
  return request.delete(`/answers/${answerId}/down-votes`).then((res) => res.data)
}
