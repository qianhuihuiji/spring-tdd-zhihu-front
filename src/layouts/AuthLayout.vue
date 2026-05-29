<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="auth-layout">
    <div class="brand-panel">
      <div class="brand-content">
        <h1 class="brand-logo" @click="goHome">知乎</h1>
        <p class="brand-slogan">发现更大的世界</p>
        <p class="brand-desc">Spring TDD 仿知乎论坛，分享你的知识与见解</p>
      </div>
    </div>
    <div class="form-panel">
      <div class="form-wrapper">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex;
  min-height: 100vh;
}

.brand-panel {
  flex: 0 0 42%;
  background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.brand-content {
  text-align: center;
  color: #fff;
}

.brand-logo {
  font-size: 64px;
  font-weight: 700;
  margin: 0 0 24px;
  cursor: pointer;
  letter-spacing: 8px;
}

.brand-slogan {
  font-size: 24px;
  margin: 0 0 16px;
  opacity: 0.95;
}

.brand-desc {
  font-size: 15px;
  opacity: 0.75;
  line-height: 1.6;
  margin: 0;
}

.form-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 60px;
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
}
</style>
