<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getNotifications } from '@/api/notifications'
import MainLayout from '@/layouts/MainLayout.vue'
import type { NotificationVo } from '@/types/api'

const notifications = ref<NotificationVo[]>([])
const loading = ref(false)
const total = ref(0)
const pageIndex = ref(1)
const pageSize = ref(10)

async function fetchNotifications() {
  loading.value = true
  try {
    const res = await getNotifications({
      pageIndex: pageIndex.value,
      pageSize: pageSize.value,
    })
    notifications.value = res.list
    total.value = res.total
  } catch {
    notifications.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function handlePageChange() {
  fetchNotifications()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const showTotal = (total: number, range: [number, number]) =>
  `第 ${range[0]}-${range[1]} 条，共 ${total} 条通知`

const typeLabels: Record<string, string> = {
  new_answer: '回答了你的问题',
  upvote_question: '赞同了你的问题',
  upvote_answer: '赞同了你的回答',
  comment_question: '评论了你的问题',
  comment_answer: '评论了你的回答',
  best_answer: '你的回答被标记为最佳',
}

onMounted(fetchNotifications)
</script>

<template>
  <MainLayout>
    <div class="page-wrapper">
      <div class="page-header">
        <h1 class="page-title">通知</h1>
        <p class="page-subtitle">查看与你相关的动态</p>
      </div>

      <a-spin :spinning="loading">
        <div v-if="notifications.length === 0 && !loading" class="empty-state">
          <a-empty description="暂无通知" />
        </div>

        <div v-else class="notification-list">
          <div
            v-for="item in notifications"
            :key="item.id"
            class="notification-item"
            :class="{ unread: !item.readAt }"
          >
            <div class="notification-dot" v-if="!item.readAt"></div>
            <div class="notification-body">
              <span class="notification-type">
                {{ typeLabels[item.type] || item.type }}
              </span>
              <span class="notification-time">{{ item.createdAt }}</span>
            </div>
          </div>
        </div>

        <div v-if="total > pageSize" style="text-align: center; margin-top: 24px">
          <a-pagination
            v-model:current="pageIndex"
            :total="total"
            :page-size="pageSize"
            show-size-changer
            :show-total="showTotal"
            :page-size-options="['10', '20', '50']"
            @change="handlePageChange"
          />
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

.page-header {
  margin-bottom: 24px;
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
  margin: 0;
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  margin-bottom: 8px;
  transition: background 0.2s;
}

.notification-item:hover {
  background: #fafafa;
}

.notification-item.unread {
  background: #f0f7ff;
  border-color: #d6e4ff;
}

.notification-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1677ff;
  flex-shrink: 0;
  margin-top: 6px;
}

.notification-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-type {
  font-size: 14px;
  color: #333;
}

.notification-time {
  font-size: 12px;
  color: #bbb;
}

.empty-state {
  padding: 80px 0;
  text-align: center;
}
</style>
