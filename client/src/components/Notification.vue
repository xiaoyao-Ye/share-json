<script setup lang="ts">
import { AlertCircle, CheckCircle, XCircle } from 'lucide-vue-next'
import { onMounted, onUnmounted, ref } from 'vue'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'

export interface NotificationProps {
  message: string
  description?: string
  type?: 'success' | 'error' | 'info'
  onDestroy?: () => void
}

const props = withDefaults(defineProps<NotificationProps>(), {
  type: 'info',
  description: '',
})

const visible = ref(false)
const timer = ref<number | null>(null)

onMounted(() => {
  // 显示通知
  visible.value = true

  // 2秒后自动关闭
  timer.value = window.setTimeout(() => {
    close()
  }, 2000)
})

onUnmounted(() => {
  if (timer.value) {
    clearTimeout(timer.value)
  }
})

function close() {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }

  visible.value = false

  // 延迟调用onDestroy，让动画有时间完成
  setTimeout(() => {
    if (props.onDestroy) {
      props.onDestroy()
    }
  }, 300)
}

defineExpose({
  close,
})
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0">
    <div v-if="visible" class="fixed top-16 left-1/2 z-50 -translate-x-1/2 max-w-sm mx-4">
      <Alert
        :variant="type === 'error' ? 'destructive' : 'default'"
        class="shadow-md border border-border">
        <CheckCircle v-if="type === 'success'" class="text-green-500" />
        <AlertCircle v-else-if="type === 'info'" class="text-blue-500" />
        <XCircle v-else-if="type === 'error'" class="text-destructive" />

        <AlertTitle>{{ message }}</AlertTitle>
        <AlertDescription v-if="description">
          {{ description }}
        </AlertDescription>
      </Alert>
    </div>
  </Transition>
</template>

<style scoped>
.animate-bounce-once {
  animation: bounce 0.5s ease-out;
}

@keyframes bounce {
  0% {
    transform: translateY(15px);
    opacity: 0;
  }
  70% {
    transform: translateY(-5px);
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
