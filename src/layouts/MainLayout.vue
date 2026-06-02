<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { BellOutlined } from '@ant-design/icons-vue'
import { getNotifications } from '@/api/notifications'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const searchKeyword = ref((route.query.keyword as string) || '')
const unreadCount = ref(0)

async function fetchUnreadCount() {
  if (!auth.isLoggedIn) return
  try {
    const res = await getNotifications({ pageIndex: 1, pageSize: 1 })
    // Count unread from total — approximation; backend may not support unread filter
    unreadCount.value = res.total
  } catch {
    // ignore
  }
}

watch(() => route.query.keyword, (val) => {
  searchKeyword.value = (val as string) || ''
})

function handleSearch(value: string) {
  router.push({ path: '/', query: value ? { keyword: value } : {} })
}

function handleLogin() {
  router.push({ name: 'login', query: { redirect: route.fullPath } })
}

function handleRegister() {
  router.push({ name: 'register', query: { redirect: route.fullPath } })
}

function handleAskQuestion() {
  if (!auth.isLoggedIn) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  router.push({ path: '/', query: { ...route.query, ask: Date.now().toString() } })
  // scroll to top and emit event — handled in QuestionListView via route.query.ask
}

function handleLogout() {
  auth.logout()
  router.push('/')
}

function goHome() {
  router.push('/')
}

function goNotifications() {
  router.push('/notifications')
}

onMounted(fetchUnreadCount)
</script>

<template>
  <a-layout>
    <a-layout-header class="header">
      <div class="header-content">
        <a-space align="center" size="large">
          <a-typography-title
            :level="3"
            style="color: #fff; margin: 0; cursor: pointer"
            @click="goHome"
          >
            知乎
          </a-typography-title>
          <a-button type="link" style="color: #fff; font-size: 15px" @click="goHome">
            首页
          </a-button>
          <a-input-search
            v-model:value="searchKeyword"
            placeholder="搜索问题..."
            style="width: 360px"
            size="large"
            @search="handleSearch"
          />
        </a-space>
        <a-space>
          <a-button type="primary" ghost @click="handleAskQuestion">
            我要提问
          </a-button>
          <a-badge v-if="auth.isLoggedIn" :count="unreadCount" :overflow-count="99" size="small">
            <a-button ghost shape="circle" @click="goNotifications">
              <BellOutlined style="color: #fff" />
            </a-button>
          </a-badge>
          <template v-if="!auth.isLoggedIn">
            <a-button ghost @click="handleRegister">注册</a-button>
            <a-button ghost @click="handleLogin">登录</a-button>
          </template>
          <template v-else>
            <span style="color: #fff">{{ auth.username }}</span>
            <a-button ghost @click="handleLogout">退出</a-button>
          </template>
        </a-space>
      </div>
    </a-layout-header>
    <a-layout-content class="content">
      <div class="container">
        <slot />
      </div>
    </a-layout-content>
    <a-layout-footer class="footer">
      <div class="container">
        知乎 ©2026 仿知乎论坛 | 基于 Spring TDD 构建
      </div>
    </a-layout-footer>
  </a-layout>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #1677ff;
  display: flex;
  align-items: center;
  height: 64px;
  line-height: normal;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.content {
  min-height: calc(100vh - 64px - 70px);
  padding: 24px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer {
  text-align: center;
  color: #999;
  background: #f0f0f0;
  padding: 24px 0;
}
</style>
