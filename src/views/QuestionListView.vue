<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getQuestions } from '@/api/questions'
import MainLayout from '@/layouts/MainLayout.vue'
import type { QuestionVo } from '@/types/api'

const router = useRouter()
const questions = ref<QuestionVo[]>([])
const loading = ref(false)
const total = ref(0)
const pageIndex = ref(1)
const pageSize = ref(10)

async function fetchQuestions() {
  loading.value = true
  try {
    const res = await getQuestions({
      pageIndex: pageIndex.value,
      pageSize: pageSize.value,
    })
    questions.value = res.list
    total.value = res.total
  } catch {
    // handled by interceptor
  } finally {
    loading.value = false
  }
}

function handlePageChange(page: number, size: number) {
  pageIndex.value = page
  pageSize.value = size
  fetchQuestions()
}

function handleSizeChange(_page: number, size: number) {
  pageSize.value = size
  pageIndex.value = 1
  fetchQuestions()
}

const showTotal = (total: number) => `共 ${total} 个问题`

function goDetail(id: number) {
  router.push(`/questions/${id}`)
}

onMounted(fetchQuestions)
</script>

<template>
  <MainLayout>
    <a-spin :spinning="loading">
      <a-list
        :data-source="questions"
        item-layout="vertical"
        size="large"
      >
        <template #empty>
          <a-empty description="暂无问题" />
        </template>
        <template #renderItem="{ item }">
          <a-list-item
            style="cursor: pointer; background: #fff; margin-bottom: 8px; border-radius: 8px"
            @click="goDetail(item.id)"
          >
            <a-list-item-meta>
              <template #title>
                {{ item.title }}
              </template>
            </a-list-item-meta>
            <div style="max-height: 80px; overflow: hidden; color: #666">
              {{ item.content }}
            </div>
            <template #actions>
              <span>👍 {{ item.voteUpCount }}</span>
              <span>💬 {{ item.answersCount }} 个回答</span>
            </template>
          </a-list-item>
        </template>
      </a-list>
      <div style="text-align: center; margin-top: 24px" v-if="total > 0">
        <a-pagination
          v-model:current="pageIndex"
          :total="total"
          :page-size="pageSize"
          show-size-changer
          show-quick-jumper
          :show-total="showTotal"
          :page-size-options="['5', '10', '20', '50']"
          @change="handlePageChange"
          @show-size-change="handleSizeChange"
        />
      </div>
    </a-spin>
  </MainLayout>
</template>
