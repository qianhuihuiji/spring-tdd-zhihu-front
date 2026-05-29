<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

defineOptions({ name: 'LoginView' })

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  username: '',
  password: '',
})

const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    await auth.login({ username: form.username, password: form.password })
    message.success('登录成功')
    const redirect = route.query.redirect as string
    router.push(redirect || '/')
  } catch {
    // 错误已由拦截器处理
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <h2 style="font-size: 28px; margin-bottom: 8px">登录</h2>
    <p style="color: #999; margin-bottom: 32px">欢迎回来，请登录你的账号</p>

    <a-form
      :model="form"
      layout="vertical"
      autocomplete="off"
      @finish="handleSubmit"
    >
      <a-form-item
        name="username"
        :rules="[{ required: true, message: '请输入用户名' }]"
      >
        <a-input
          v-model:value="form.username"
          placeholder="请输入用户名"
          size="large"
        >
          <template #prefix>
            <UserOutlined style="color: #bfbfbf" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        name="password"
        :rules="[{ required: true, message: '请输入密码' }]"
      >
        <a-input-password
          v-model:value="form.password"
          placeholder="请输入密码"
          size="large"
        >
          <template #prefix>
            <LockOutlined style="color: #bfbfbf" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          block
          size="large"
          :loading="loading"
        >
          登录
        </a-button>
      </a-form-item>

      <div style="text-align: center">
        还没有账号？<a-button type="link" @click="router.push({ name: 'register', query: route.query })">立即注册</a-button>
      </div>
    </a-form>
  </AuthLayout>
</template>
