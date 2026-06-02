<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUser, uploadAvatar, changePassword, getActivities } from '@/api/users'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import MainLayout from '@/layouts/MainLayout.vue'
import type { UserVo, ActivityVo } from '@/types/api'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const user = ref<UserVo | null>(null)
const loading = ref(false)
const notFound = ref(false)
const uploading = ref(false)

// 修改密码
const showPasswordForm = ref(false)
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const changingPassword = ref(false)

// 动态
const activities = ref<ActivityVo[]>([])
const activitiesLoading = ref(false)
const activityTotal = ref(0)
const activityPage = ref(1)

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

async function handleChangePassword() {
  if (!oldPassword.value) { message.warning('请输入旧密码'); return }
  if (!newPassword.value) { message.warning('请输入新密码'); return }
  if (newPassword.value.length < 6 || newPassword.value.length > 20) {
    message.warning('新密码长度需在 6-20 位之间')
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    message.warning('两次输入的新密码不一致')
    return
  }
  changingPassword.value = true
  try {
    await changePassword({
      oldPassword: oldPassword.value,
      newPassword: newPassword.value,
    })
    message.success('密码修改成功')
    showPasswordForm.value = false
    oldPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch {
    // handled by interceptor
  } finally {
    changingPassword.value = false
  }
}

async function fetchActivities() {
  if (!isSelf()) return
  activitiesLoading.value = true
  try {
    const res = await getActivities({ pageIndex: activityPage.value, pageSize: 10 })
    activities.value = res.list
    activityTotal.value = res.total
  } catch {
    // ignore
  } finally {
    activitiesLoading.value = false
  }
}

function handleActivityPageChange() {
  fetchActivities()
}

const activityLabels: Record<string, string> = {
  created_question: '提出了问题',
  answered_question: '回答了问题',
  upvoted_question: '赞同了问题',
  upvoted_answer: '赞同了回答',
  subscribed_question: '关注了问题',
  best_answer: '回答被标记为最佳',
}

function activityLink(activity: ActivityVo): string | null {
  if (activity.subjectType === 'question') return `/questions/${activity.subjectId}`
  return null
}

onMounted(() => {
  fetchUser().then(() => {
    if (isSelf()) fetchActivities()
  })
})
</script>

<template>
  <MainLayout>
    <div class="page-wrapper">
      <a-spin :spinning="loading">
        <template v-if="user">
          <!-- 个人信息卡片 -->
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

          <!-- 本人操作区 -->
          <template v-if="isSelf()">
            <!-- 修改密码 -->
            <a-card class="section-card" title="修改密码">
              <template v-if="showPasswordForm">
                <a-form layout="vertical" style="max-width: 360px">
                  <a-form-item label="旧密码">
                    <a-input-password v-model:value="oldPassword" placeholder="输入旧密码" />
                  </a-form-item>
                  <a-form-item label="新密码">
                    <a-input-password v-model:value="newPassword" placeholder="6-20 位字母/数字/符号" />
                  </a-form-item>
                  <a-form-item label="确认新密码">
                    <a-input-password v-model:value="confirmPassword" placeholder="再次输入新密码" />
                  </a-form-item>
                  <a-space>
                    <a-button type="primary" :loading="changingPassword" @click="handleChangePassword">
                      保存
                    </a-button>
                    <a-button @click="showPasswordForm = false">取消</a-button>
                  </a-space>
                </a-form>
              </template>
              <a-button v-else @click="showPasswordForm = true">修改密码</a-button>
            </a-card>

            <!-- 动态列表 -->
            <a-card class="section-card" title="我的动态">
              <a-spin :spinning="activitiesLoading">
                <div v-if="activities.length === 0 && !activitiesLoading" class="empty-state">
                  <a-empty description="暂无动态" />
                </div>
                <div v-else class="activity-list">
                  <div v-for="item in activities" :key="item.id" class="activity-item">
                    <span class="activity-type">
                      {{ activityLabels[item.type] || item.type }}
                    </span>
                    <a
                      v-if="activityLink(item)"
                      class="activity-link"
                      @click="router.push(activityLink(item)!)"
                    >
                      查看 →
                    </a>
                    <span class="activity-time">{{ item.createdAt }}</span>
                  </div>
                </div>
                <div v-if="activityTotal > 10" style="text-align: center; margin-top: 16px">
                  <a-pagination
                    v-model:current="activityPage"
                    :total="activityTotal"
                    :page-size="10"
                    size="small"
                    simple
                    @change="handleActivityPageChange"
                  />
                </div>
              </a-spin>
            </a-card>
          </template>

          <!-- 他人主页占位 -->
          <a-card v-else class="section-card">
            <a-empty description="暂无更多信息" />
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
  margin-bottom: 16px;
  border-radius: 12px;
}

.activity-list {
  display: flex;
  flex-direction: column;
}

.activity-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-type {
  font-size: 14px;
  color: #333;
}

.activity-link {
  font-size: 13px;
  color: #1677ff;
  cursor: pointer;
}

.activity-link:hover {
  color: #4096ff;
}

.activity-time {
  font-size: 12px;
  color: #bbb;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}
</style>
