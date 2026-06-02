<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getQuestion,
  upVoteQuestion,
  cancelUpVoteQuestion,
  downVoteQuestion,
  cancelDownVoteQuestion,
  subscribeQuestion,
  unsubscribeQuestion,
} from '@/api/questions'
import {
  getAnswers,
  postAnswer,
  deleteAnswer,
  upVoteAnswer,
  cancelUpVoteAnswer,
  downVoteAnswer,
  cancelDownVoteAnswer,
} from '@/api/answers'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import MainLayout from '@/layouts/MainLayout.vue'
import CommentSection from '@/components/CommentSection.vue'
import type { QuestionVo, AnswerVo } from '@/types/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const question = ref<QuestionVo | null>(null)
const answers = ref<AnswerVo[]>([])
const loading = ref(false)
const answersLoading = ref(false)
const answersTotal = ref(0)
const answerPageIndex = ref(1)
const answerPageSize = ref(10)
const needsLogin = ref(false)
const showAnswerForm = ref(false)
const answerContent = ref('')
const submitting = ref(false)
const subscribed = ref(false)

const showAnswerTotal = (total: number) => `共 ${total} 条回答`

async function fetchDetail() {
  const id = Number(route.params.id)
  if (!id) { router.push('/'); return }
  loading.value = true
  try {
    question.value = await getQuestion(id)
    needsLogin.value = false
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      needsLogin.value = true
    } else {
      router.push('/')
    }
  } finally {
    loading.value = false
  }
}

async function fetchAnswers() {
  answersLoading.value = true
  try {
    const res = await getAnswers(Number(route.params.id), {
      pageIndex: answerPageIndex.value,
      pageSize: answerPageSize.value,
    })
    answers.value = res.list
    answersTotal.value = res.total
  } catch {
    // handled by interceptor
  } finally {
    answersLoading.value = false
  }
}

function handleAnswerPageChange() {
  fetchAnswers()
}

function handleAnswerSizeChange(p: number, s: number) {
  answerPageSize.value = s
  fetchAnswers()
}

// 问题投票
async function handleUpVote() {
  if (!auth.isLoggedIn) { message.warning('请先登录'); return }
  const q = question.value!
  if (q.voteType === 1) {
    await cancelUpVoteQuestion(q.id)
    q.voteUpCount--
    q.voteType = 0
  } else {
    await upVoteQuestion(q.id)
    q.voteUpCount++
    if (q.voteType === -1) q.voteDownCount--
    q.voteType = 1
  }
}

async function handleDownVote() {
  if (!auth.isLoggedIn) { message.warning('请先登录'); return }
  const q = question.value!
  if (q.voteType === -1) {
    await cancelDownVoteQuestion(q.id)
    q.voteDownCount--
    q.voteType = 0
  } else {
    await downVoteQuestion(q.id)
    q.voteDownCount++
    if (q.voteType === 1) q.voteUpCount--
    q.voteType = -1
  }
}

// 关注
async function handleSubscribe() {
  if (!auth.isLoggedIn) { message.warning('请先登录'); return }
  if (subscribed.value) {
    await unsubscribeQuestion(question.value!.id)
    subscribed.value = false
    message.success('已取消关注')
  } else {
    await subscribeQuestion(question.value!.id)
    subscribed.value = true
    message.success('已关注该问题')
  }
}

// 答案投票
async function handleAnswerUpVote(answer: AnswerVo) {
  if (!auth.isLoggedIn) { message.warning('请先登录'); return }
  if (answer.voteType === 1) {
    await cancelUpVoteAnswer(answer.id)
    answer.voteUpCount--
    answer.voteType = 0
  } else {
    await upVoteAnswer(answer.id)
    answer.voteUpCount++
    if (answer.voteType === -1) answer.voteDownCount--
    answer.voteType = 1
  }
}

async function handleAnswerDownVote(answer: AnswerVo) {
  if (!auth.isLoggedIn) { message.warning('请先登录'); return }
  if (answer.voteType === -1) {
    await cancelDownVoteAnswer(answer.id)
    answer.voteDownCount--
    answer.voteType = 0
  } else {
    await downVoteAnswer(answer.id)
    answer.voteDownCount++
    if (answer.voteType === 1) answer.voteUpCount--
    answer.voteType = -1
  }
}

// 提交回答
async function handlePostAnswer() {
  if (!answerContent.value.trim()) {
    message.warning('请输入回答内容')
    return
  }
  submitting.value = true
  try {
    await postAnswer(Number(route.params.id), { content: answerContent.value })
    message.success('回答提交成功')
    answerContent.value = ''
    showAnswerForm.value = false
    answerPageIndex.value = 1
    if (question.value) question.value.answersCount++
    fetchAnswers()
  } catch {
    // handled by interceptor
  } finally {
    submitting.value = false
  }
}

// 删除答案
async function handleDeleteAnswer(answer: AnswerVo) {
  try {
    await deleteAnswer(answer.id)
    message.success('答案已删除')
    if (question.value) question.value.answersCount--
    fetchAnswers()
  } catch {
    // handled by interceptor
  }
}

onMounted(() => {
  fetchDetail()
  fetchAnswers()
})
</script>

<template>
  <MainLayout>
    <a-spin :spinning="loading">
      <template v-if="question">
        <!-- 问题头部 -->
        <a-card class="question-card">
          <h1 class="question-title">{{ question.title }}</h1>
          <div class="question-meta">
            <a class="author-link" @click="router.push(`/users/${question.userId}`)">
              用户 #{{ question.userId }}
            </a>
            <span>👍 {{ question.voteUpCount }}</span>
            <span>👎 {{ question.voteDownCount }}</span>
            <span>💬 {{ question.answersCount }} 个回答</span>
          </div>
          <a-divider />
          <div class="question-content">{{ question.content }}</div>
          <a-divider />
          <a-space>
            <a-button
              :type="question.voteType === 1 ? 'primary' : 'default'"
              @click="handleUpVote"
            >
              👍 赞同 {{ question.voteUpCount }}
            </a-button>
            <a-button
              :type="question.voteType === -1 ? 'primary' : 'default'"
              danger
              @click="handleDownVote"
            >
              👎
            </a-button>
            <a-button
              :type="subscribed ? 'primary' : 'default'"
              @click="handleSubscribe"
            >
              {{ subscribed ? '已关注' : '关注问题' }}
            </a-button>
          </a-space>
        </a-card>

        <!-- 问题评论 -->
        <a-card class="question-card">
          <CommentSection :commented-id="question.id" type="question" />
        </a-card>

        <!-- 回答区域 -->
        <div style="margin-top: 24px">
          <h3 style="margin-bottom: 16px">
            回答（{{ question.answersCount }}）
          </h3>

          <a-spin :spinning="answersLoading">
            <a-list
              :data-source="answers"
              item-layout="vertical"
            >
              <template #empty>
                <a-empty description="暂无回答" />
              </template>
              <template #renderItem="{ item: answer }">
                <a-card
                  class="answer-card"
                  :body-style="{ padding: '20px 24px' }"
                >
                  <div class="answer-content">{{ answer.content }}</div>
                  <a-divider style="margin: 12px 0" />
                  <div class="answer-meta">
                    <a
                      class="author-link"
                      @click="router.push(`/users/${answer.userId}`)"
                    >
                      用户 #{{ answer.userId }}
                    </a>
                    <span v-if="answer.createdAt" class="answer-time">{{ answer.createdAt }}</span>
                  </div>
                  <a-space>
                    <a-button
                      size="small"
                      :type="answer.voteType === 1 ? 'primary' : 'default'"
                      @click="handleAnswerUpVote(answer)"
                    >
                      👍 {{ answer.voteUpCount }}
                    </a-button>
                    <a-button
                      size="small"
                      :type="answer.voteType === -1 ? 'primary' : 'default'"
                      danger
                      @click="handleAnswerDownVote(answer)"
                    >
                      👎 {{ answer.voteDownCount }}
                    </a-button>
                  </a-space>
                  <a-popconfirm
                    title="确定删除这条回答？"
                    ok-text="删除"
                    cancel-text="取消"
                    @confirm="handleDeleteAnswer(answer)"
                  >
                    <a-button size="small" danger style="margin-left: 8px">删除</a-button>
                  </a-popconfirm>
                  <CommentSection :commented-id="answer.id" type="answer" />
                </a-card>
              </template>
            </a-list>

            <div
              v-if="answersTotal > answerPageSize"
              style="text-align: center; margin-top: 24px"
            >
              <a-pagination
                v-model:current="answerPageIndex"
                :total="answersTotal"
                :page-size="answerPageSize"
                show-size-changer
                show-quick-jumper
                :show-total="showAnswerTotal"
                :page-size-options="['5', '10', '20']"
                @change="handleAnswerPageChange"
                @show-size-change="handleAnswerSizeChange"
              />
            </div>
          </a-spin>
        </div>

        <!-- 回答表单 -->
        <a-card v-if="auth.isLoggedIn" style="margin-top: 24px">
          <template v-if="showAnswerForm">
            <a-form-item>
              <a-textarea
                v-model:value="answerContent"
                :rows="5"
                placeholder="写下你的回答..."
              />
            </a-form-item>
            <a-space>
              <a-button
                type="primary"
                :loading="submitting"
                @click="handlePostAnswer"
              >
                提交回答
              </a-button>
              <a-button @click="showAnswerForm = false">取消</a-button>
            </a-space>
          </template>
          <a-button
            v-else
            type="primary"
            block
            size="large"
            @click="showAnswerForm = true"
          >
            写回答
          </a-button>
        </a-card>
        <a-card v-else style="margin-top: 24px; text-align: center">
          登录后才能写回答
          <a-button
            type="primary"
            style="margin-left: 12px"
            @click="router.push({ name: 'login', query: { redirect: route.fullPath } })"
          >
            去登录
          </a-button>
        </a-card>
      </template>

      <a-card v-else-if="!loading && needsLogin" style="text-align: center; padding: 80px 0">
        <a-empty description="需要登录后才能查看问题详情" />
        <a-button
          type="primary"
          style="margin-top: 16px"
          @click="router.push({ name: 'login', query: { redirect: route.fullPath } })"
        >
          去登录
        </a-button>
      </a-card>
      <a-card v-else-if="!loading" style="text-align: center; padding: 80px 0">
        <a-empty description="问题不存在" />
      </a-card>
    </a-spin>
  </MainLayout>
</template>

<style scoped>
.question-card {
  margin-bottom: 16px;
}

.question-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 12px;
  line-height: 1.4;
}

.question-meta {
  color: #999;
  font-size: 14px;
  display: flex;
  gap: 16px;
}

.question-content {
  white-space: pre-wrap;
  line-height: 1.8;
  font-size: 15px;
  min-height: 80px;
}

.answer-card {
  margin-bottom: 12px;
  border-radius: 8px;
}

.answer-content {
  white-space: pre-wrap;
  line-height: 1.8;
  font-size: 15px;
}

.answer-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.answer-time {
  font-size: 12px;
  color: #bbb;
}

.author-link {
  font-size: 13px;
  color: #1677ff;
  cursor: pointer;
  text-decoration: none;
}

.author-link:hover {
  color: #4096ff;
}
</style>
