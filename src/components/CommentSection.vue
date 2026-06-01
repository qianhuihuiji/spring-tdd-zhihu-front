<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import {
  getQuestionComments,
  postQuestionComment,
  getAnswerComments,
  postAnswerComment,
  upVoteComment,
  cancelUpVoteComment,
  downVoteComment,
  cancelDownVoteComment,
} from '@/api/comments'
import type { CommentVo } from '@/types/api'

const props = defineProps<{
  commentedId: number
  type: 'question' | 'answer'
}>()

const auth = useAuthStore()

const comments = ref<CommentVo[]>([])
const loading = ref(false)
const total = ref(0)
const pageIndex = ref(1)
const pageSize = ref(5)

const showForm = ref(false)
const commentContent = ref('')
const submitting = ref(false)

async function fetchComments() {
  loading.value = true
  try {
    const fetcher = props.type === 'question' ? getQuestionComments : getAnswerComments
    const res = await fetcher(props.commentedId, {
      pageIndex: pageIndex.value,
      pageSize: pageSize.value,
    })
    comments.value = res.list
    total.value = res.total
  } catch {
    comments.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function handlePost() {
  if (!commentContent.value.trim()) {
    message.warning('请输入评论内容')
    return
  }
  submitting.value = true
  try {
    const poster = props.type === 'question' ? postQuestionComment : postAnswerComment
    await poster(props.commentedId, { content: commentContent.value.trim() })
    message.success('评论发表成功')
    commentContent.value = ''
    showForm.value = false
    pageIndex.value = 1
    fetchComments()
  } catch {
    // handled by interceptor
  } finally {
    submitting.value = false
  }
}

function handleWriteComment() {
  if (!auth.isLoggedIn) {
    message.warning('请先登录')
    return
  }
  showForm.value = !showForm.value
}

async function handleUpVote(comment: CommentVo) {
  if (!auth.isLoggedIn) { message.warning('请先登录'); return }
  if (comment.voteType === 1) {
    await cancelUpVoteComment(comment.id)
    comment.voteUpCount--
    comment.voteType = 0
  } else {
    await upVoteComment(comment.id)
    comment.voteUpCount++
    if (comment.voteType === -1) comment.voteDownCount--
    comment.voteType = 1
  }
}

async function handleDownVote(comment: CommentVo) {
  if (!auth.isLoggedIn) { message.warning('请先登录'); return }
  if (comment.voteType === -1) {
    await cancelDownVoteComment(comment.id)
    comment.voteDownCount--
    comment.voteType = 0
  } else {
    await downVoteComment(comment.id)
    comment.voteDownCount++
    if (comment.voteType === 1) comment.voteUpCount--
    comment.voteType = -1
  }
}

function handlePageChange() {
  fetchComments()
}

const showTotal = (total: number) => `共 ${total} 条评论`

onMounted(fetchComments)
</script>

<template>
  <div class="comment-section">
    <div class="comment-header">
      <span class="comment-title">评论 ({{ total }})</span>
      <a-button size="small" @click="handleWriteComment">
        {{ showForm ? '收起' : '写评论' }}
      </a-button>
    </div>

    <!-- 评论表单 -->
    <div v-if="showForm" class="comment-form">
      <a-textarea
        v-model:value="commentContent"
        :rows="3"
        placeholder="写下你的评论..."
        style="margin-bottom: 8px"
      />
      <a-space>
        <a-button type="primary" size="small" :loading="submitting" @click="handlePost">
          发表
        </a-button>
        <a-button size="small" @click="showForm = false">取消</a-button>
      </a-space>
    </div>

    <!-- 评论列表 -->
    <a-spin :spinning="loading">
      <div v-if="comments.length === 0 && !loading" class="comment-empty">
        暂无评论
      </div>
      <div v-else class="comment-list">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-content">{{ comment.content }}</div>
          <div class="comment-meta">
            <span class="comment-time">{{ comment.createTime }}</span>
            <a-space size="small">
              <a-button
                size="small"
                :type="comment.voteType === 1 ? 'primary' : 'text'"
                @click="handleUpVote(comment)"
              >
                ▲ {{ comment.voteUpCount }}
              </a-button>
              <a-button
                size="small"
                :type="comment.voteType === -1 ? 'primary' : 'text'"
                danger
                @click="handleDownVote(comment)"
              >
                ▼ {{ comment.voteDownCount }}
              </a-button>
            </a-space>
          </div>
        </div>
      </div>

      <div v-if="total > pageSize" style="text-align: center; margin-top: 12px">
        <a-pagination
          v-model:current="pageIndex"
          :total="total"
          :page-size="pageSize"
          size="small"
          simple
          :show-total="showTotal"
          @change="handlePageChange"
        />
      </div>
    </a-spin>
  </div>
</template>

<style scoped>
.comment-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.comment-title {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.comment-form {
  margin-bottom: 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.comment-list {
  display: flex;
  flex-direction: column;
}

.comment-item {
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-content {
  font-size: 14px;
  line-height: 1.7;
  color: #333;
  white-space: pre-wrap;
  margin-bottom: 6px;
}

.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-time {
  font-size: 12px;
  color: #bbb;
}

.comment-empty {
  color: #ccc;
  font-size: 13px;
  text-align: center;
  padding: 16px 0;
}
</style>
