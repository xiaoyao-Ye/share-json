<script setup lang="ts">
import { Copy, ExternalLink, Trash2 } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '~/components/Layout.vue'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
import { mockDeleteShare, mockGetUserShares } from '~/lib/mock-api'
import { getUserId } from '~/lib/user-utils'

const router = useRouter()
const shares = ref<any[]>([])
const loading = ref(true)
const shareToDelete = ref<string | null>(null)

onMounted(async () => {
  try {
    loading.value = true
    const userId = getUserId()
    const data = await mockGetUserShares(userId)
    shares.value = data
  }
  catch (error) {
    console.error('Error fetching shares:', error)
  }
  finally {
    loading.value = false
  }
})

function handleCopyLink(id: string) {
  const url = `${window.location.origin}/view/${id}`
  navigator.clipboard.writeText(url)
}

async function handleDeleteShare() {
  if (!shareToDelete.value)
    return

  try {
    const userId = getUserId()
    await mockDeleteShare(shareToDelete.value, userId)
    shares.value = shares.value.filter(share => share.id !== shareToDelete.value)
  }
  catch (error) {
    console.error('Error deleting share:', error)
  }
  finally {
    shareToDelete.value = null
  }
}

function formatExpiryDate(expiresAt: string | null) {
  if (!expiresAt)
    return '永久有效'

  const expiry = new Date(expiresAt)
  const now = new Date()

  if (expiry < now) {
    return '已过期'
  }

  return expiry.toLocaleString()
}
</script>

<template>
  <Layout>
    <div class="container py-6">
      <h1 class="mb-6 text-2xl font-bold">
        我的分享
      </h1>

      <div v-if="loading" class="flex justify-center py-10">
        <div class="w-10 h-10 border-4 rounded-full border-primary border-t-transparent animate-spin" />
      </div>

      <div v-else-if="shares.length === 0" class="p-8 text-center border rounded-lg">
        <h2 class="text-lg font-medium">
          您还没有创建任何分享
        </h2>
        <p class="mt-2 text-muted-foreground">
          上传 JSON 文件并创建分享链接
        </p>
        <Button class="mt-4" @click="router.push('/')">
          创建分享
        </Button>
      </div>

      <div v-else class="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>文件名</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>有效期至</TableHead>
              <TableHead class="text-right">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="share in shares" :key="share.id">
              <TableCell class="font-medium">
                {{ share.filename || `json-share-${share.id.slice(0, 8)}` }}
              </TableCell>
              <TableCell>{{ new Date(share.createdAt).toLocaleString() }}</TableCell>
              <TableCell>{{ formatExpiryDate(share.expiresAt) }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" @click="handleCopyLink(share.id)">
                    <Copy class="w-4 h-4" />
                    <span class="sr-only">复制链接</span>
                  </Button>
                  <Button variant="ghost" size="icon" @click="router.push(`/${share.id}`)">
                    <ExternalLink class="w-4 h-4" />
                    <span class="sr-only">查看</span>
                  </Button>
                  <AlertDialog :open="shareToDelete === share.id" @update:open="!$event && (shareToDelete = null)">
                    <AlertDialogTrigger as-child>
                      <Button variant="ghost" size="icon" @click="shareToDelete = share.id">
                        <Trash2 class="w-4 h-4" />
                        <span class="sr-only">删除</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                          您确定要删除此分享吗？此操作无法撤销，分享链接将立即失效。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction @click="handleDeleteShare">
                          删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  </Layout>
</template>
