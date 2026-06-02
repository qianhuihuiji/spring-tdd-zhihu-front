<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getActiveUsers } from '@/api/users'
import type { UserVo } from '@/types/api'

const router = useRouter()
const users = ref<UserVo[]>([])

onMounted(async () => {
  try {
    users.value = await getActiveUsers()
  } catch {
    // ignore
  }
})

function goUser(id: number) {
  router.push(`/users/${id}`)
}
</script>

<template>
  <div v-if="users.length > 0" class="active-users">
    <h4 class="section-title">活跃用户</h4>
    <div class="user-list">
      <div
        v-for="user in users"
        :key="user.id"
        class="user-item"
        @click="goUser(user.id)"
      >
        <a-avatar :size="36" :src="user.avatar">
          {{ user.name.charAt(0).toUpperCase() }}
        </a-avatar>
        <span class="user-name">{{ user.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.active-users {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  padding: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 14px;
  color: #333;
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-item:hover {
  background: #f5f5f5;
}

.user-name {
  font-size: 14px;
  color: #333;
}
</style>
