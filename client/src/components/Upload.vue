<script setup lang="ts">
import type { ExpiryType } from '~/api/api'
import { FileUp, Upload as UploadIcon } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { createShare, uploadJsonFile, verifyFileExists } from '~/api/api'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Label } from '~/components/ui/label'

interface FileWithHash extends File {
  fileHash?: string
}

const router = useRouter()
const file = ref<FileWithHash | null>(null)
const fileHash = ref<string | null>(null)
const expiration = ref<ExpiryType>('day')
const isDragging = ref(false)
const isUploading = ref(false)
const isHashing = ref(false)
const error = ref<string | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)

// 有效期选项
const expirationOptions: { value: ExpiryType; label: string }[] = [
  { value: 'day', label: '1 天' },
  { value: 'week', label: '7 天' },
  { value: 'permanent', label: '永久' },
]

// 格式化文件大小
const formattedFileSize = computed(() => {
  if (!file.value) return ''

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

// 计算文件哈希
async function calculateFileHash(fileToHash: File): Promise<string> {
  return new Promise((resolve, reject) => {
    isHashing.value = true

    try {
      // 创建Web Worker计算哈希
      const worker = new Worker(new URL('../workers/hash.worker.ts', import.meta.url), {
        type: 'module',
      })

      worker.onmessage = (e) => {
        isHashing.value = false
        if (e.data.success) {
          resolve(e.data.hash)
        } else {
          reject(new Error(e.data.error))
        }
        worker.terminate()
      }

      worker.onerror = (err) => {
        isHashing.value = false
        reject(new Error('计算哈希失败: ' + err.message))
        worker.terminate()
      }

      // 发送文件到Worker进行处理
      worker.postMessage(fileToHash)
    } catch (err) {
      isHashing.value = false
      reject(err)
    }
  })
}

async function handleFileSelect(selectedFile: File) {
  if (!selectedFile.name.endsWith('.json')) {
    error.value = '请上传 JSON 文件'
    file.value = null
    fileHash.value = null
    return
  }

  // 添加文件大小检查
  const maxFileSize = 20 * 1024 * 1024 // 20MB
  if (selectedFile.size > maxFileSize) {
    error.value = `文件大小不能超过20MB，当前文件大小：${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB`
    file.value = null
    fileHash.value = null
    return
  }

  error.value = null
  file.value = selectedFile as FileWithHash
  fileHash.value = await calculateFileHash(selectedFile)
}

async function handleUpload() {
  if (!file.value) return

  try {
    isUploading.value = true
    error.value = null

    const fileId = await verifyFileOrUpload()

    // 创建分享
    const shareData = { fileId, expiryType: expiration.value }

    const share = await createShare(shareData)

    // 跳转到我的分享页面
    router.push(`/${share.shareCode}`)
  } catch (err) {
    console.error('Error uploading file:', err)
    error.value = '上传失败，请重试'
  } finally {
    isUploading.value = false
  }
}

async function verifyFileOrUpload() {
  const verifyResult = await verifyFileExists({
    fileHash: fileHash.value!,
    fileName: file.value!.name,
    fileSize: file.value!.size,
  })
  return verifyResult.exists ? verifyResult.fileId! : await uploadFile()
}

// 上传文件并返回文件ID
async function uploadFile(): Promise<string> {
  const formData = new FormData()
  formData.append('file', file.value!)
  formData.append('fileHash', fileHash.value!)

  // 上传文件
  const shareFile = await uploadJsonFile(formData)
  return shareFile.id
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
        class="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg relative"
        :class="isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
        @click="fileInputRef?.click()">
        <!-- 哈希计算遮罩 -->
        <div
          v-if="isHashing"
          class="absolute inset-0 flex items-center justify-center bg-background/80 z-10 rounded-lg">
          <div class="flex flex-col items-center">
            <div
              class="w-8 h-8 border-2 rounded-full border-primary animate-spin border-t-transparent mb-2"></div>
            <p class="text-sm">计算文件指纹中...</p>
          </div>
        </div>

        <div class="p-3 mb-4 rounded-full bg-primary/10">
          <FileUp class="w-6 h-6 text-primary" />
        </div>
        <h3 class="mb-2 text-lg font-medium">
          {{ file ? file.name : '拖拽文件到此处或点击上传' }}
        </h3>
        <p class="mb-4 text-sm text-muted-foreground">
          {{ file ? `文件大小: ${formattedFileSize}` : '支持 .json 文件' }}
        </p>
        <input
          ref="fileInputRef"
          type="file"
          accept=".json"
          class="hidden"
          @change="handleFileInputChange" />
      </div>

      <div class="grid gap-4">
        <div class="grid gap-2">
          <Label for="expiration">链接有效期</Label>
          <div class="flex flex-wrap gap-2">
            <Button
              v-for="option in expirationOptions"
              :key="option.value"
              :variant="expiration === option.value ? 'default' : 'outline'"
              :disabled="isUploading || isHashing || !file"
              class="flex-1"
              @click="expiration = option.value">
              {{ option.label }}
            </Button>
          </div>
        </div>
      </div>
    </CardContent>
    <CardFooter>
      <Button class="w-full" :disabled="isUploading || isHashing || !file" @click="handleUpload">
        <template v-if="isUploading">
          <div
            class="w-4 h-4 mr-2 border-2 rounded-full border-background animate-spin border-t-transparent" />
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
