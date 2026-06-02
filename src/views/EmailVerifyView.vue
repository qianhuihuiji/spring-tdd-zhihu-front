<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { verifyEmail } from '@/api/auth'
import { message } from 'ant-design-vue'
import AuthLayout from '@/layouts/AuthLayout.vue'

const route = useRoute()
const router = useRouter()

const status = ref<'loading' | 'success' | 'error'>('loading')
const msg = ref('')

onMounted(async () => {
  const token = route.query.token as string
  if (!token) {
    status.value = 'error'
    msg.value = '缺少验证 token，请检查邮件中的链接是否完整'
    return
  }
  try {
    const res = await verifyEmail(token)
    status.value = 'success'
    msg.value = res || '邮箱验证成功！'
  } catch (err: any) {
    status.value = 'error'
    msg.value = err?.response?.data?.message || '验证失败，链接可能已过期'
  }
})
</script>

<template>
  <AuthLayout>
    <div class="verify-box">
      <a-spin :spinning="status === 'loading'">
        <div v-if="status === 'loading'" style="text-align: center">
          <p style="color: #999">正在验证邮箱...</p>
        </div>

        <a-result
          v-else-if="status === 'success'"
          status="success"
          title="邮箱验证成功"
          :sub-title="msg"
        >
          <template #extra>
            <a-button type="primary" @click="router.push('/login')">
              去登录
            </a-button>
          </template>
        </a-result>

        <a-result
          v-else
          status="error"
          title="验证失败"
          :sub-title="msg"
        >
          <template #extra>
            <a-space>
              <a-button @click="router.push('/')">返回首页</a-button>
              <a-button type="primary" @click="router.push('/register')">
                重新注册
              </a-button>
            </a-space>
          </template>
        </a-result>
      </a-spin>
    </div>
  </AuthLayout>
</template>

<style scoped>
.verify-box {
  width: 100%;
}
</style>
