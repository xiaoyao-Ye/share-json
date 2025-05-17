<script setup lang="ts">
import { AlertCircle, Download, Link } from 'lucide-vue-next'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getJsonContentStreamByShareCode, getShareDownloadUrl } from '../api/api'
import JsonViewer from '../components/JsonViewer.vue'
import Layout from '../components/Layout.vue'
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert'
import { Button } from '../components/ui/button'
import { Progress } from '../components/ui/progress'
import { useNotification } from '../composables'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const expired = ref(false)
const jsonData = ref<any>(null)
// @ts-expect-error - 路由参数类型处理
const shareCode = ref<string>(route.params.id as string)
const notification = useNotification()

// 流数据状态
const isStreaming = ref(false)
const progress = ref(0)
const receivedBytes = ref(0)
const totalBytes = ref(0)
const abortStream = ref<(() => void) | null>(null)

onMounted(() => loadJsonContent())

onBeforeUnmount(() => abortStream.value?.())

function loadJsonContent() {
  isStreaming.value = true
  loading.value = true
  receivedBytes.value = 0
  totalBytes.value = 0

  abortStream.value = getJsonContentStreamByShareCode(
    shareCode.value,
    undefined, // 开始处理时无需特殊操作
    // 进度更新
    (currentSize) => {
      receivedBytes.value = currentSize

      // 估算总大小以计算进度
      if (totalBytes.value === 0) {
        totalBytes.value = currentSize * 20 // 假设数据至少是第一个块的20倍
      }
      else if (currentSize > totalBytes.value * 0.8) {
        totalBytes.value = currentSize * 1.5
      }

      // 计算进度，最大99%（留1%给解析过程）
      progress.value = Math.min(Math.floor((currentSize / totalBytes.value) * 100), 99)
    },
    // 完成处理
    (data) => {
      loading.value = false
      if (data.code === 404 || data.code === 400) {
        expired.value = true
        return
      }
      isStreaming.value = false
      jsonData.value = data
      progress.value = 100
    },
    // 错误处理
    (error, details) => {
      console.error('获取JSON流错误:', error, details)

      // 检查是否过期或不存在的错误
      if (error.includes('404') || error.includes('不存在') || error.includes('过期')) {
        expired.value = true
      }
      else {
        notification.error('加载失败', details || error)
      }

      isStreaming.value = false
      loading.value = false
    },
  )
}

// 格式化字节大小为人类可读格式
function formatBytes(bytes: number): string {
  if (bytes === 0)
    return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`
}

function handleCopyLink() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => notification.success('复制成功', '链接已复制到剪贴板'))
    .catch((err) => {
      console.error('复制失败:', err)
      notification.error('复制失败', '无法复制到剪贴板，请手动复制')
    })
}

function handleDownload() {
  window.open(getShareDownloadUrl(shareCode.value), '_blank')
}
</script>

<template>
  <Layout>
    <div v-if="loading" class="container py-10">
      <div v-if="isStreaming" class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex justify-between text-sm">
            <span>正在加载JSON数据...</span>
            <span>{{ formatBytes(receivedBytes) }}</span>
          </div>
          <Progress :value="progress" />
        </div>
        <div class="text-sm text-muted-foreground">
          检测到数据体积较大，页面预览可能有延迟。建议您下载文件到本地查看，以提升体验。
        </div>
      </div>
      <div v-else class="flex justify-center">
        <div class="w-10 h-10 border-4 rounded-full border-primary border-t-transparent animate-spin" />
      </div>
    </div>

    <div v-else-if="expired" class="container py-10">
      <Alert variant="destructive">
        <AlertCircle class="w-4 h-4" />
        <AlertTitle>链接已过期</AlertTitle>
        <AlertDescription>此分享链接已过期或不存在。请联系分享者获取新的链接。</AlertDescription>
      </Alert>
      <div class="flex justify-center mt-4">
        <Button @click="router.push('/')">
          返回首页
        </Button>
      </div>
    </div>

    <div v-else class="container py-6">
      <div class="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-2xl font-bold">
          JSON 预览
        </h1>
        <div class="flex flex-wrap gap-2">
          <Button variant="outline" @click="handleCopyLink">
            <Link class="w-4 h-4 mr-2" />
            复制链接
          </Button>
          <Button variant="outline" @click="handleDownload">
            <Download class="w-4 h-4 mr-2" />
            下载 JSON
          </Button>
        </div>
      </div>

      <div class="border rounded-lg">
        <JsonViewer :data="jsonData" />
      </div>
    </div>
  </Layout>
</template>
