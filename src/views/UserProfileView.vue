<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUser, uploadAvatar } from '@/api/users'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import MainLayout from '@/layouts/MainLayout.vue'
import type { UserVo } from '@/types/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const user = ref<UserVo | null>(null)
const loading = ref(false)
const notFound = ref(false)
const uploading = ref(false)

const isSelf = () => auth.username === user.value?.name

async function fetchUser() {
  const id = Number(route.params.id)
  if (!id) { router.push('/'); return }
  loading.value = true
  try {
    user.value = await getUser(id)
  } catch {
    notFound.value = true
  } finally {
    loading.value = false
  }
}

async function handleAvatarUpload(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  if (file.size > 2 * 1024 * 1024) {
    message.warning('头像大小不能超过 2MB')
    return
  }
  uploading.value = true
  try {
    const url = await uploadAvatar(user.value!.id, file)
    user.value!.avatar = url
    message.success('头像更新成功')
  } catch {
    // handled by interceptor
  } finally {
    uploading.value = false
  }
}

onMounted(fetchUser)
</script>

<template>
  <MainLayout>
    <div class="page-wrapper">
      <a-spin :spinning="loading">
        <template v-if="user">
          <a-card class="profile-card">
            <div class="profile-header">
              <div class="avatar-section">
                <a-avatar :size="80" :src="user.avatar">
                  {{ user.name.charAt(0).toUpperCase() }}
                </a-avatar>
                <label v-if="isSelf()" class="avatar-upload">
                  <a-spin :spinning="uploading" size="small">
                    <span class="avatar-upload-text">更换头像</span>
                  </a-spin>
                  <input
                    type="file"
                    accept="image/*"
                    style="display: none"
                    @change="handleAvatarUpload"
                  />
                </label>
              </div>
              <div class="profile-info">
                <h1 class="profile-name">{{ user.name }}</h1>
                <div class="profile-meta">
                  <span>{{ user.email }}</span>
                  <span>{{ user.phone }}</span>
                </div>
              </div>
            </div>
          </a-card>

          <a-card class="section-card">
            <a-empty description="更多信息即将上线" />
          </a-card>
        </template>

        <div v-else-if="notFound" class="empty-state">
          <a-empty description="用户不存在" />
        </div>
      </a-spin>
    </div>
  </MainLayout>
</template>

<style scoped>
.page-wrapper {
  max-width: 700px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.profile-card {
  margin-bottom: 16px;
  border-radius: 12px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar-upload {
  cursor: pointer;
  font-size: 12px;
  color: #1677ff;
}

.avatar-upload:hover {
  text-decoration: underline;
}

.avatar-upload-text {
  cursor: pointer;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
}

.profile-meta {
  display: flex;
  gap: 16px;
  color: #999;
  font-size: 14px;
}

.section-card {
  border-radius: 12px;
}

.empty-state {
  padding: 80px 0;
  text-align: center;
}
</style>
