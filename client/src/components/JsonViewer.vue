<script setup lang="ts">
import { ChevronsDown, ChevronsUp } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import VueJsonPretty from 'vue-json-pretty'
import { Button } from '../components/ui/button'
import { isDark } from '../composables/dark'
import 'vue-json-pretty/lib/styles.css'

const props = defineProps<{
  data: any
}>()

const expanded = ref<boolean>(false)
const expandDepth = ref<number>(1)
const isVirtual = ref<boolean>(true) // 启用虚拟滚动
const key = ref<number>(0) // 用于强制重新渲染组件

// 根据当前主题计算样式类
const themeClass = computed(() => isDark.value ? 'json-viewer-dark' : 'json-viewer-light')

function expandAll() {
  expandDepth.value = Infinity
  expanded.value = false
  key.value++ // 强制重新渲染组件
}

function collapseAll() {
  expandDepth.value = 1
  expanded.value = true
  key.value++ // 强制重新渲染组件
}
</script>

<template>
  <div class="overflow-x-auto">
    <div class="sticky top-0 flex justify-end gap-2 p-2 border-b bg-background z-10">
      <Button variant="outline" size="sm" @click="expandAll">
        <ChevronsDown class="w-4 h-4 mr-2" />
        展开全部
      </Button>
      <Button variant="outline" size="sm" @click="collapseAll">
        <ChevronsUp class="w-4 h-4 mr-2" />
        折叠全部
      </Button>
    </div>
    <div class="p-4 font-mono text-sm json-container">
      <VueJsonPretty
        :key="key"
        :data="props.data"
        :deep="expandDepth"
        :show-length="true"
        :show-icon="true"
        :collapsed="expanded"
        hover-preview
        :virtual="isVirtual"
        :height="500"
        :item-height="24"
        selectable-type="multiple"
        class="json-viewer"
        :class="themeClass"
      />
    </div>
  </div>
</template>

<style scoped>
.json-container {
  overflow-y: auto;
}

.json-viewer :deep(.vjs-tree) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

/* 浅色模式样式 */
.json-viewer-light :deep(.vjs-key) {
  color: #9333ea; /* 紫色 */
}

.json-viewer-light :deep(.vjs-value.vjs-value-string) {
  color: #16a34a; /* 绿色 */
}

.json-viewer-light :deep(.vjs-value.vjs-value-number) {
  color: #2563eb; /* 蓝色 */
}

.json-viewer-light :deep(.vjs-value.vjs-value-boolean) {
  color: #ea580c; /* 橙色 */
}

.json-viewer-light :deep(.vjs-value.vjs-value-null) {
  color: #6b7280; /* 灰色 */
}

/* 深色模式样式 */
.json-viewer-dark :deep(.vjs-key) {
  color: #c084fc; /* 亮紫色 */
}

.json-viewer-dark :deep(.vjs-value.vjs-value-string) {
  color: #4ade80; /* 亮绿色 */
}

.json-viewer-dark :deep(.vjs-value.vjs-value-number) {
  color: #60a5fa; /* 亮蓝色 */
}

.json-viewer-dark :deep(.vjs-value.vjs-value-boolean) {
  color: #fb923c; /* 亮橙色 */
}

.json-viewer-dark :deep(.vjs-value.vjs-value-null) {
  color: #9ca3af; /* 亮灰色 */
}
</style>
