<script setup lang="ts">
import { Copy, ExternalLink, Trash2 } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { deleteShare, getUserShares } from '~/api/api'
import Layout from '~/components/Layout.vue'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { useNotification } from '~/composables'

const router = useRouter()
const shares = ref<any[]>([])
const loading = ref(true)
const shareToDelete = ref<string | null>(null)
const notification = useNotification()

onMounted(async () => {
  try {
    loading.value = true
    const data = await getUserShares()
    shares.value = data
  } catch (error) {
    console.error('Error fetching shares:', error)
  } finally {
    loading.value = false
  }
})

function handleCopyLink(shareCode: string) {
  const url = `${window.location.origin}/${shareCode}`
  navigator.clipboard
    .writeText(url)
    .then(() => {
      notification.success('复制成功', '链接已复制到剪贴板')
    })
    .catch((err) => {
      console.error('复制失败:', err)
      notification.error('复制失败', '无法复制到剪贴板，请手动复制')
    })
}

async function handleDeleteShare(shareId: string) {
  if (!shareId) return

  try {
    await deleteShare(shareId)
    shares.value = shares.value.filter((share) => share.id !== shareId)
    notification.success('删除成功', '分享链接已删除')
  } catch (error) {
    console.error('删除分享错误:', error)
    notification.error('删除失败', '请稍后重试')
  } finally {
    shareToDelete.value = null
  }
}

function formatExpiryDate(expiresAt: string | null) {
  if (!expiresAt) return '永久有效'

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
      <h1 class="mb-6 text-2xl font-bold">我的分享</h1>

      <div v-if="loading" class="flex justify-center py-10">
        <div
          class="w-10 h-10 border-4 rounded-full border-primary border-t-transparent animate-spin" />
      </div>

      <div v-else-if="shares.length === 0" class="p-8 text-center border rounded-lg">
        <h2 class="text-lg font-medium">您还没有创建任何分享</h2>
        <p class="mt-2 text-muted-foreground">上传 JSON 文件并创建分享链接</p>
        <Button class="mt-4" @click="router.push('/')"> 创建分享 </Button>
      </div>

      <div v-else class="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>文件名</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>有效期至</TableHead>
              <TableHead class="text-right"> 操作 </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="share in shares" :key="share.id">
              <TableCell class="font-medium">
                {{ share.fileName }}
              </TableCell>
              <TableCell>{{ new Date(share.createdAt).toLocaleString() }}</TableCell>
              <TableCell>{{ formatExpiryDate(share.expiresAt) }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button variant="ghost" size="icon" @click="handleCopyLink(share.shareCode)">
                    <Copy class="w-4 h-4" />
                    <span class="sr-only">复制链接</span>
                  </Button>
                  <Button variant="ghost" size="icon" @click="router.push(`/${share.shareCode}`)">
                    <ExternalLink class="w-4 h-4" />
                    <span class="sr-only">查看</span>
                  </Button>
                  <AlertDialog
                    :open="shareToDelete === share.id"
                    @update:open="!$event && (shareToDelete = null)">
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
                        <AlertDialogAction @click="handleDeleteShare(share.id)">
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
