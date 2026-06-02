<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import { PhoneOutlined, LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons-vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  name: '',
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)

async function handleSubmit() {
  if (form.password !== form.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  loading.value = true
  try {
    await auth.register({
      name: form.name,
      phone: form.phone,
      email: form.email,
      password: form.password,
    })
    message.success('注册成功，请查看邮箱完成验证后登录')
    router.push({ name: 'login', query: route.query })
  } catch {
    // 错误已由拦截器处理
  } finally {
    loading.value = false
  }
}

function validateConfirmPassword(_rule: any, value: string) {
  if (value !== form.password) {
    return Promise.reject('两次输入的密码不一致')
  }
  return Promise.resolve()
}
</script>

<template>
  <AuthLayout>
    <h2 style="font-size: 28px; margin-bottom: 8px">注册</h2>
    <p style="color: #999; margin-bottom: 32px">创建你的账号，开始探索世界</p>

    <a-form
      :model="form"
      layout="vertical"
      autocomplete="off"
      @finish="handleSubmit"
    >
      <a-form-item
        name="phone"
        :rules="[
          { required: true, message: '请输入手机号' },
          { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' },
        ]"
      >
        <a-input
          v-model:value="form.phone"
          placeholder="请输入手机号"
          size="large"
          maxlength="11"
        >
          <template #prefix>
            <PhoneOutlined style="color: #bfbfbf" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        name="name"
        :rules="[{ required: true, message: '请输入用户名' }]"
      >
        <a-input
          v-model:value="form.name"
          placeholder="请输入用户名"
          size="large"
        >
          <template #prefix>
            <UserOutlined style="color: #bfbfbf" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        name="email"
        :rules="[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '邮箱格式不正确' },
        ]"
      >
        <a-input
          v-model:value="form.email"
          placeholder="请输入邮箱"
          size="large"
        >
          <template #prefix>
            <MailOutlined style="color: #bfbfbf" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        name="password"
        :rules="[
          { required: true, message: '请输入密码' },
          {
            pattern: /^[a-zA-Z0-9_@#$!%*?&]{6,20}$/,
            message: '密码为 6-20 位字母、数字或特殊字符',
          },
        ]"
      >
        <a-input-password
          v-model:value="form.password"
          placeholder="请输入密码（6-20 位）"
          size="large"
        >
          <template #prefix>
            <LockOutlined style="color: #bfbfbf" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item
        name="confirmPassword"
        :rules="[
          { required: true, message: '请确认密码' },
          { validator: validateConfirmPassword },
        ]"
      >
        <a-input-password
          v-model:value="form.confirmPassword"
          placeholder="请再次输入密码"
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
          注册
        </a-button>
      </a-form-item>

      <div style="text-align: center">
        已有账号？<a-button type="link" @click="router.push({ name: 'login', query: route.query })">立即登录</a-button>
      </div>
    </a-form>
  </AuthLayout>
</template>
