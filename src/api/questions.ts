import request from './request'
import type { CommonResult, PageInfo, QuestionVo, CreateQuestionDto } from '@/types/api'

export function getQuestions(params: {
  pageIndex: number
  pageSize: number
  slug?: string
  by?: string
}): Promise<PageInfo<QuestionVo>> {
  return request
    .get('/questions', { params, skipAuth: true } as any)
    .then((res) => res.data.data)
}

export function createQuestion(data: CreateQuestionDto): Promise<QuestionVo> {
  return request
    .post('/questions', data)
    .then((res) => res.data.data)
}

export function getQuestion(id: number): Promise<QuestionVo> {
  return request
    .get(`/questions/${id}`, { noAuthRedirect: true } as any)
    .then((res) => res.data.data)
}

// 问题投票
export function upVoteQuestion(questionId: number): Promise<void> {
  return request.post(`/questions/${questionId}/up-votes`).then((res) => res.data)
}

export function cancelUpVoteQuestion(questionId: number): Promise<void> {
  return request.delete(`/questions/${questionId}/up-votes`).then((res) => res.data)
}

export function downVoteQuestion(questionId: number): Promise<void> {
  return request.post(`/questions/${questionId}/down-votes`).then((res) => res.data)
}

export function cancelDownVoteQuestion(questionId: number): Promise<void> {
  return request.delete(`/questions/${questionId}/down-votes`).then((res) => res.data)
}

// 关注问题
export function subscribeQuestion(questionId: number): Promise<void> {
  return request.post(`/questions/${questionId}/subscriptions`).then((res) => res.data)
}

export function unsubscribeQuestion(questionId: number): Promise<void> {
  return request.delete(`/questions/${questionId}/subscriptions`).then((res) => res.data)
}
