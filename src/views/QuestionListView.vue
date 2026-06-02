<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getQuestions, createQuestion, publishQuestion } from '@/api/questions'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import MainLayout from '@/layouts/MainLayout.vue'
import ActiveUsers from '@/components/ActiveUsers.vue'
import type { QuestionVo } from '@/types/api'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

// 列表状态
const questions = ref<QuestionVo[]>([])
const loading = ref(false)
const total = ref(0)
const pageIndex = ref(1)
const pageSize = ref(10)
const sort = ref<string>('')
const keyword = ref('')

// 提问弹窗
const showCreateModal = ref(false)
const createTitle = ref('')
const createContent = ref('')
const creating = ref(false)

// 监听路由 query 变化
watch(() => route.query.keyword, (val) => {
  keyword.value = (val as string) || ''
  pageIndex.value = 1
  fetchQuestions()
})

watch(() => route.query.by, (val) => {
  sort.value = (val as string) || ''
  pageIndex.value = 1
  fetchQuestions()
})

watch(() => route.query.ask, (val) => {
  if (val) {
    if (!auth.isLoggedIn) {
      router.push({ name: 'login', query: { redirect: '/' } })
      return
    }
    showCreateModal.value = true
    router.replace({ path: '/', query: { ...route.query, ask: undefined } })
  }
})

// 数据获取
async function fetchQuestions() {
  loading.value = true
  try {
    const res = await getQuestions({
      pageIndex: pageIndex.value,
      pageSize: pageSize.value,
      slug: keyword.value || undefined,
      by: sort.value || undefined,
    })
    questions.value = res.list
    total.value = res.total
  } catch {
    questions.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 排序切换
function handleSortChange(e: any) {
  const value = e.target.value
  router.push({
    path: '/',
    query: {
      ...route.query,
      by: value || undefined,
    },
  })
}

// 分页
function handlePageChange(page: number, size: number) {
  pageIndex.value = page
  pageSize.value = size
  fetchQuestions()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleSizeChange(_page: number, size: number) {
  pageSize.value = size
  pageIndex.value = 1
  fetchQuestions()
}

// 提问
function handleAskQuestion() {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: '/' } })
    return
  }
  showCreateModal.value = true
}

async function handleCreateQuestion() {
  if (!createTitle.value.trim()) {
    message.warning('请输入问题标题')
    return
  }
  if (!createContent.value.trim()) {
    message.warning('请输入问题描述')
    return
  }
  creating.value = true
  try {
    const questionId = await createQuestion({
      title: createTitle.value.trim(),
      content: createContent.value.trim(),
      categoryId: 1,
    })
    await publishQuestion(Number(questionId))
    message.success('问题发布成功！')
    showCreateModal.value = false
    createTitle.value = ''
    createContent.value = ''
    router.push(`/questions/${questionId}`)
  } catch {
    // handled by interceptor
  } finally {
    creating.value = false
  }
}

function goDetail(id: number) {
  router.push(`/questions/${id}`)
}

const showTotal = (total: number, range: [number, number]) =>
  `第 ${range[0]}-${range[1]} 条，共 ${total} 个问题`

const hasSearch = computed(() => !!keyword.value)
const paginationVisible = computed(() => total > pageSize)

onMounted(() => {
  if (route.query.keyword) {
    keyword.value = route.query.keyword as string
  }
  if (route.query.by) {
    sort.value = route.query.by as string
  }
  fetchQuestions()
})
</script>

<template>
  <MainLayout>
    <div class="page-wrapper">
      <div class="page-layout">
        <div class="page-main">
          <!-- 页面头部 -->
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">发现更多问题</h1>
          <p class="page-subtitle">探索、提问、分享你的见解</p>
          <a-radio-group
            :value="sort"
            option-type="button"
            size="small"
            @change="handleSortChange"
            class="sort-tabs"
          >
            <a-radio-button value="">综合</a-radio-button>
            <a-radio-button value="newest">最新</a-radio-button>
            <a-radio-button value="votes">最多赞同</a-radio-button>
            <a-radio-button value="answers">最多回答</a-radio-button>
          </a-radio-group>
        </div>
        <div class="page-header-right">
          <a-button type="primary" size="large" @click="handleAskQuestion">
            我要提问
          </a-button>
        </div>
      </div>

      <!-- 未登录引导 -->
      <a-card v-if="!auth.isLoggedIn" class="login-banner" :body-style="{ padding: '16px 24px' }">
        <div class="login-banner-content">
          <span>登录后可以提问、互动，发现更多精彩内容</span>
          <a-space>
            <a-button type="primary" @click="router.push({ name: 'login', query: { redirect: '/' } })">
              登录
            </a-button>
            <a-button @click="router.push({ name: 'register', query: { redirect: '/' } })">
              注册
            </a-button>
          </a-space>
        </div>
      </a-card>

      <!-- 顶部信息栏 -->
      <div v-if="!loading" class="info-bar">
        <span v-if="hasSearch" class="info-text">
          搜索「{{ keyword }}」找到 {{ total }} 个问题
        </span>
        <span v-else class="info-text">
          共 {{ total }} 个问题
        </span>
      </div>

      <!-- 顶部分页 -->
      <div v-if="paginationVisible" class="pagination-wrapper pagination-top">
        <a-pagination
          v-model:current="pageIndex"
          :total="total"
          :page-size="pageSize"
          show-size-changer
          show-quick-jumper
          :show-total="showTotal"
          :page-size-options="['5', '10', '20', '50']"
          @change="handlePageChange"
          @show-size-change="handleSizeChange"
        />
      </div>

      <!-- 内容区 -->
      <div class="question-list">
        <!-- 骨架屏 -->
        <template v-if="loading">
          <a-card v-for="i in 5" :key="i" class="question-card skeleton-card">
            <a-skeleton active avatar :title="{ width: '55%' }" :paragraph="{ rows: 2 }" />
            <div style="margin-top: 16px">
              <a-skeleton active :title="false" :paragraph="{ rows: 1, width: ['20%'] }" />
            </div>
          </a-card>
        </template>

        <!-- 空状态 -->
        <div v-else-if="questions.length === 0" class="empty-state">
          <template v-if="hasSearch">
            <a-empty description="未找到相关问题，换个关键词试试" />
          </template>
          <template v-else>
            <a-empty description="还没有问题，快来提出第一个问题吧！">
              <a-button type="primary" @click="handleAskQuestion">我要提问</a-button>
            </a-empty>
          </template>
        </div>

        <!-- 问题列表 -->
        <template v-else>
          <a-card
            v-for="item in questions"
            :key="item.id"
            class="question-card"
            hoverable
            @click="goDetail(item.id)"
          >
            <div class="card-body">
              <h3 class="card-title">{{ item.title }}</h3>
              <div class="card-content">
                <span class="card-content-text">{{ item.content }}</span>
                <div class="card-content-fade"></div>
              </div>
            </div>
            <div class="card-footer">
              <a-space size="large">
                <a
                  class="author-link"
                  @click.stop="router.push(`/users/${item.userId}`)"
                >
                  用户 #{{ item.userId }}
                </a>
                <span class="stat-item">
                  <span class="stat-icon">⬆</span>
                  <span class="stat-value">{{ item.voteUpCount }}</span>
                  <span class="stat-label">赞同</span>
                </span>
                <span class="stat-item">
                  <span class="stat-icon">💬</span>
                  <span class="stat-value">{{ item.answersCount }}</span>
                  <span class="stat-label">回答</span>
                </span>
              </a-space>
              <span class="card-action-hint">查看详情 →</span>
            </div>
          </a-card>
        </template>
      </div>

      <!-- 底部分页 -->
          <div v-if="paginationVisible" class="pagination-wrapper pagination-bottom">
            <a-pagination
              v-model:current="pageIndex"
              :total="total"
              :page-size="pageSize"
              show-size-changer
              show-quick-jumper
              :show-total="showTotal"
              :page-size-options="['5', '10', '20', '50']"
              @change="handlePageChange"
              @show-size-change="handleSizeChange"
            />
          </div>
        </div>
        <div class="page-sidebar">
          <ActiveUsers />
        </div>
      </div>
    </div>

    <!-- 提问弹窗 -->
    <a-modal
      v-model:open="showCreateModal"
      title="提出新问题"
      :confirm-loading="creating"
      ok-text="发布问题"
      cancel-text="取消"
      @ok="handleCreateQuestion"
    >
      <a-form layout="vertical" style="margin-top: 16px">
        <a-form-item label="问题标题" required>
          <a-input
            v-model:value="createTitle"
            placeholder="用一句话说清楚你的问题..."
            :maxlength="100"
            show-count
            size="large"
          />
        </a-form-item>
        <a-form-item label="问题描述" required>
          <a-textarea
            v-model:value="createContent"
            placeholder="详细描述问题的背景和你想了解什么..."
            :rows="6"
            :maxlength="5000"
            show-count
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </MainLayout>
</template>

<style scoped>
.page-wrapper {
  padding-bottom: 40px;
}

.page-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.page-main {
  flex: 1;
  min-width: 0;
}

.page-sidebar {
  width: 280px;
  flex-shrink: 0;
  position: sticky;
  top: 88px;
}

/* ---- 页面头部 ---- */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 6px;
  color: #1a1a1a;
}

.page-subtitle {
  font-size: 14px;
  color: #999;
  margin: 0 0 16px;
}

.sort-tabs {
  margin-top: 4px;
}

.page-header-right {
  flex-shrink: 0;
  margin-left: 24px;
  margin-top: 4px;
}

/* ---- 登录引导 ---- */
.login-banner {
  margin-bottom: 20px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f4ff 100%);
  border: 1px solid #91caff;
  border-radius: 12px;
}

.login-banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #1677ff;
  font-size: 14px;
}

/* ---- 信息栏 ---- */
.info-bar {
  margin-bottom: 16px;
}

.info-text {
  color: #999;
  font-size: 14px;
}

/* ---- 分页 ---- */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding: 12px 0;
}

.pagination-top {
  padding-top: 0;
  padding-bottom: 20px;
}

.pagination-bottom {
  padding-top: 32px;
  padding-bottom: 0;
}

/* ---- 问题列表 ---- */
.question-list {
  display: flex;
  flex-direction: column;
}

.question-card {
  margin-bottom: 16px;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.10);
  border-color: #d6e4ff;
}

.skeleton-card {
  cursor: default;
}

.skeleton-card:hover {
  transform: none;
  box-shadow: none;
  border-color: #f0f0f0;
}

/* ---- 卡片内容 ---- */
.card-body {
  padding: 8px 0 4px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1677ff;
  margin: 0 0 12px;
  line-height: 1.5;
  transition: color 0.2s;
}

.question-card:hover .card-title {
  color: #4096ff;
}

.card-content {
  position: relative;
  max-height: 52px;
  overflow: hidden;
}

.card-content-text {
  color: #666;
  font-size: 14px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-content-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 24px;
  background: linear-gradient(to bottom, transparent, #fff);
  pointer-events: none;
}

/* ---- 卡片底部 ---- */
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f5f5f5;
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #999;
  font-size: 13px;
}

.stat-icon {
  font-size: 14px;
}

.stat-value {
  font-weight: 600;
  color: #555;
}

.stat-label {
  color: #bbb;
}

.author-link {
  font-size: 13px;
  color: #1677ff;
  text-decoration: none;
}

.author-link:hover {
  color: #4096ff;
}

.card-action-hint {
  font-size: 13px;
  color: #bbb;
  opacity: 0;
  transition: opacity 0.3s;
}

.question-card:hover .card-action-hint {
  opacity: 1;
  color: #1677ff;
}

/* ---- 空状态 ---- */
.empty-state {
  padding: 80px 0;
  text-align: center;
}
</style>
