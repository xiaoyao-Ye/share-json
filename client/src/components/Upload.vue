<script setup lang="ts">
import type { ExpiryType } from '~/api/api'
import { FileUp, Upload as UploadIcon } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { createShare, uploadJsonFile } from '~/api/api'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'

const router = useRouter()
const file = ref<File | null>(null)
const jsonContent = ref<any>(null)
const expiration = ref<ExpiryType>('day')
const isDragging = ref(false)
const isUploading = ref(false)
const error = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 有效期选项
const expirationOptions: { value: ExpiryType, label: string }[] = [
  { value: 'day', label: '1 天' },
  { value: 'week', label: '7 天' },
  { value: 'permanent', label: '永久' },
]

// 格式化文件大小
const formattedFileSize = computed(() => {
  if (!file.value)
    return ''

  const size = file.value.size
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  }
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
})

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  isDragging.value = true
}

function handleDragLeave(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  isDragging.value = false

  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    handleFileSelect(e.dataTransfer.files[0])
  }
}

function handleFileInputChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    handleFileSelect(target.files[0])
  }
}

function handleFileSelect(selectedFile: File) {
  if (!selectedFile.name.endsWith('.json')) {
    error.value = '请上传 JSON 文件'
    file.value = null
    jsonContent.value = null
    return
  }

  error.value = null
  file.value = selectedFile

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = JSON.parse(e.target?.result as string)
      jsonContent.value = content
    }
    catch (err) {
      console.error('Error parsing JSON:', err)
      error.value = '无效的 JSON 文件'
      file.value = null
      jsonContent.value = null
    }
  }
  reader.readAsText(selectedFile)
}

async function handleUpload() {
  if (!file.value || !jsonContent.value)
    return

  try {
    isUploading.value = true
    error.value = null

    const formData = new FormData()
    formData.append('file', file.value)

    // 上传文件
    const shareFile = await uploadJsonFile(formData)

    // 创建分享
    const shareData = {
      fileId: shareFile.id,
      expiryType: expiration.value,
    }
    const share = await createShare(shareData)

    // 跳转到我的分享页面
    router.push(`/${share.shareCode}`)
  }
  catch (err) {
    console.error('Error uploading file:', err)
    error.value = '上传失败，请重试'
  }
  finally {
    isUploading.value = false
  }
}
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle>上传 JSON 文件</CardTitle>
      <CardDescription>拖拽或选择 JSON 文件，生成分享链接</CardDescription>
    </CardHeader>
    <CardContent class="space-y-6">
      <Alert v-if="error" variant="destructive">
        <AlertDescription>{{ error }}</AlertDescription>
      </Alert>

      <div
        class="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg"
        :class="isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
        @click="fileInputRef?.click()"
      >
        <div class="p-3 mb-4 rounded-full bg-primary/10">
          <FileUp class="w-6 h-6 text-primary" />
        </div>
        <h3 class="mb-2 text-lg font-medium">
          {{ file ? file.name : '拖拽文件到此处或点击上传' }}
        </h3>
        <p class="mb-4 text-sm text-muted-foreground">
          {{ file ? `文件大小: ${formattedFileSize}` : '支持 .json 文件' }}
        </p>
        <input ref="fileInputRef" type="file" accept=".json" class="hidden" @change="handleFileInputChange">
      </div>

      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="expiration">链接有效期</Label>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="option in expirationOptions"
              :key="option.value"
              :variant="expiration === option.value ? 'default' : 'outline'"
              :disabled="isUploading || !file"
              class="flex-1"
              @click="expiration = option.value"
            >
              {{ option.label }}
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button class="w-full" :disabled="isUploading || !file" @click="handleUpload">
        <template v-if="isUploading">
          <div class="w-4 h-4 mr-2 border-2 rounded-full border-background animate-spin border-t-transparent" />
          上传中...
        </template>
        <template v-else>
          <UploadIcon class="w-4 h-4 mr-2" />
          生成分享链接
        </template>
      </Button>
    </CardFooter>
  </Card>
</template>
