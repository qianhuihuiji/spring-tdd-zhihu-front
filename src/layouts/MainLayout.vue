<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

function handleLogin() {
  router.push('/login')
}

function handleRegister() {
  router.push('/register')
}

function handleLogout() {
  auth.logout()
  router.push('/')
}

function goHome() {
  router.push('/')
}
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
          <a-input-search
            placeholder="搜索问题..."
            style="width: 400px"
            size="large"
          />
        </a-space>
        <a-space v-if="!auth.isLoggedIn">
          <a-button type="primary" ghost @click="handleRegister">注册</a-button>
          <a-button type="primary" ghost @click="handleLogin">登录</a-button>
        </a-space>
        <a-space v-else>
          <span style="color: #fff">{{ auth.username }}</span>
          <a-button type="primary" ghost @click="handleLogout">退出</a-button>
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
