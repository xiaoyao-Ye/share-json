<script setup lang="ts">
import { AlertCircle, Download, Link } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import JsonViewer from '~/components/JsonViewer.vue'
import Layout from '~/components/Layout.vue'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { mockGetShareById } from '~/lib/mock-api'

const route = useRoute()
const router = useRouter()
const share = ref<any>(null)
const loading = ref(true)
const expired = ref(false)
const jsonData = ref<any>(null)
const id = typeof route.params.id === 'string' ? route.params.id : Array.isArray(route.params.id) ? route.params.id[0] : ''

onMounted(async () => {
  try {
    loading.value = true
    const data = await mockGetShareById(id)

    if (!data) {
      expired.value = true
      return
    }

    // 检查分享是否过期
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      expired.value = true
      return
    }

    share.value = data
    jsonData.value = data.content
  }
  catch (error) {
    console.error('Error fetching share:', error)
    expired.value = true
  }
  finally {
    loading.value = false
  }
})

function handleCopyLink() {
  const url = window.location.href
  navigator.clipboard.writeText(url)
}

function handleDownload() {
  if (!jsonData.value)
    return

  const blob = new Blob([JSON.stringify(jsonData.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `json-share-${id}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <Layout>
    <div v-if="loading" class="container py-10">
      <div class="flex justify-center">
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

      <div class="p-4 mb-4 border rounded-lg">
        <div class="mb-2 text-sm text-muted-foreground">
          <span class="font-medium">创建时间：</span>
          {{ new Date(share.createdAt).toLocaleString() }}
        </div>
        <div class="text-sm text-muted-foreground">
          <span class="font-medium">有效期至：</span>
          {{ share.expiresAt ? new Date(share.expiresAt).toLocaleString() : '永久有效' }}
        </div>
      </div>

      <div class="border rounded-lg">
        <JsonViewer :data="jsonData" />
      </div>
    </div>
  </Layout>
</template>
