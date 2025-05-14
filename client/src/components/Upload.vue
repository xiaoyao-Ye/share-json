<script setup lang="ts">
import { FileUp, Upload as UploadIcon } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card'
import { Label } from '~/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { mockCreateShare } from '~/lib/mock-api'
import { getUserId } from '~/lib/user-utils'

const router = useRouter()
const file = ref<File | null>(null)
const jsonContent = ref<any>(null)
const expiration = ref<string>('permanent')
const isDragging = ref(false)
const isUploading = ref(false)
const error = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

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

    const userId = getUserId()
    let expiresAt: Date | null = null

    if (expiration.value === '1day') {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 1)
    }
    else if (expiration.value === '7days') {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7)
    }

    const shareData = {
      userId,
      filename: file.value.name,
      content: jsonContent.value,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
    }

    const share = await mockCreateShare(shareData)
    router.push(`/view/${share.id}`)
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
          {{ file ? `文件大小: ${(file.size / 1024).toFixed(2)} KB` : '支持 .json 文件' }}
        </p>
        <input ref="fileInputRef" type="file" accept=".json" class="hidden" @change="handleFileInputChange">
        <!-- <Button variant="outline" :disabled="isUploading" @click="fileInputRef?.click()">
          选择文件
        </Button> -->
      </div>

      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="expiration">链接有效期</Label>
          <Select v-model="expiration" class="w-full" :disabled="isUploading || !file">
            <SelectTrigger id="expiration">
              <SelectValue placeholder="选择有效期" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1day">
                1 天
              </SelectItem>
              <SelectItem value="7days">
                7 天
              </SelectItem>
              <SelectItem value="permanent">
                永久
              </SelectItem>
            </SelectContent>
          </Select>
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
