<script setup lang="ts">
import { ChevronDown, ChevronRight, ChevronsDown, ChevronsUp } from 'lucide-vue-next'
import { ref } from 'vue'
import { Button } from '../components/ui/button'

const props = defineProps<{
  data: any
}>()

const expandedPaths = ref<Set<string>>(new Set([]))

function togglePath(path: string) {
  const newExpandedPaths = new Set(expandedPaths.value)
  if (newExpandedPaths.has(path)) {
    newExpandedPaths.delete(path)
  }
  else {
    newExpandedPaths.add(path)
  }
  expandedPaths.value = newExpandedPaths
}

function expandAll() {
  const allPaths = new Set<string>()

  const findAllPaths = (obj: any, path = '') => {
    if (obj && typeof obj === 'object') {
      allPaths.add(path)
      Object.keys(obj).forEach((key) => {
        const newPath = path ? `${path}.${key}` : key
        findAllPaths(obj[key], newPath)
      })
    }
  }

  findAllPaths(props.data)
  expandedPaths.value = allPaths
}

function collapseAll() {
  expandedPaths.value = new Set()
}
</script>

<template>
  <div class="overflow-x-auto">
    <div class="sticky top-0 flex justify-end gap-2 p-2 border-b bg-background">
      <Button variant="outline" size="sm" @click="expandAll">
        <ChevronsDown class="w-4 h-4 mr-2" />
        展开全部
      </Button>
      <Button variant="outline" size="sm" @click="collapseAll">
        <ChevronsUp class="w-4 h-4 mr-2" />
        折叠全部
      </Button>
    </div>
    <div class="p-4 font-mono text-sm">
      <template v-if="data === null">
        <span class="text-gray-500">null</span>
      </template>
      <template v-else-if="typeof data === 'boolean'">
        <span class="text-orange-600">{{ data.toString() }}</span>
      </template>
      <template v-else-if="typeof data === 'number'">
        <span class="text-blue-600">{{ data }}</span>
      </template>
      <template v-else-if="typeof data === 'string'">
        <span class="text-green-600">"{{ data }}"</span>
      </template>
      <template v-else-if="Array.isArray(data)">
        <div>
          <div class="inline-flex items-center cursor-pointer" @click="togglePath('root')">
            <ChevronDown v-if="expandedPaths.has('root')" class="w-4 h-4 text-muted-foreground" />
            <ChevronRight v-else class="w-4 h-4 text-muted-foreground" />
            <span class="text-gray-500">[{{ data.length }}]</span>
          </div>

          <div v-if="expandedPaths.has('root')" class="pl-4 ml-4 border-l">
            <div v-for="(item, i) in data" :key="i" class="my-1">
              <span class="text-gray-500">{{ i }}: </span>
              <template v-if="item === null">
                <span class="text-gray-500">null</span>
              </template>
              <template v-else-if="typeof item === 'boolean'">
                <span class="text-orange-600">{{ item.toString() }}</span>
              </template>
              <template v-else-if="typeof item === 'number'">
                <span class="text-blue-600">{{ item }}</span>
              </template>
              <template v-else-if="typeof item === 'string'">
                <span class="text-green-600">"{{ item }}"</span>
              </template>
              <template v-else-if="Array.isArray(item)">
                <div>
                  <div class="inline-flex items-center cursor-pointer" @click.stop="togglePath(`root.${i}`)">
                    <ChevronDown v-if="expandedPaths.has(`root.${i}`)" class="w-4 h-4 text-muted-foreground" />
                    <ChevronRight v-else class="w-4 h-4 text-muted-foreground" />
                    <span class="text-gray-500">[{{ item.length }}]</span>
                  </div>
                </div>
              </template>
              <template v-else-if="typeof item === 'object'">
                <div>
                  <div class="inline-flex items-center cursor-pointer" @click.stop="togglePath(`root.${i}`)">
                    <ChevronDown v-if="expandedPaths.has(`root.${i}`)" class="w-4 h-4 text-muted-foreground" />
                    <ChevronRight v-else class="w-4 h-4 text-muted-foreground" />
                    <span class="text-gray-500">{{ `${Object.keys(item).length}` }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="typeof data === 'object'">
        <div>
          <div class="inline-flex items-center cursor-pointer" @click="togglePath('root')">
            <ChevronDown v-if="expandedPaths.has('root')" class="w-4 h-4 text-muted-foreground" />
            <ChevronRight v-else class="w-4 h-4 text-muted-foreground" />
            <span class="text-gray-500">{{ `${Object.keys(data).length}` }}</span>
          </div>

          <div v-if="expandedPaths.has('root')" class="pl-4 ml-4 border-l">
            <div v-for="key in Object.keys(data)" :key="key" class="my-1">
              <span class="text-purple-600">"{{ key }}"</span>:
              <template v-if="data[key] === null">
                <span class="text-gray-500">null</span>
              </template>
              <template v-else-if="typeof data[key] === 'boolean'">
                <span class="text-orange-600">{{ data[key].toString() }}</span>
              </template>
              <template v-else-if="typeof data[key] === 'number'">
                <span class="text-blue-600">{{ data[key] }}</span>
              </template>
              <template v-else-if="typeof data[key] === 'string'">
                <span class="text-green-600">"{{ data[key] }}"</span>
              </template>
              <template v-else-if="Array.isArray(data[key])">
                <div>
                  <div class="inline-flex items-center cursor-pointer" @click.stop="togglePath(`root.${key}`)">
                    <ChevronDown v-if="expandedPaths.has(`root.${key}`)" class="w-4 h-4 text-muted-foreground" />
                    <ChevronRight v-else class="w-4 h-4 text-muted-foreground" />
                    <span class="text-gray-500">[{{ data[key].length }}]</span>
                  </div>
                </div>
              </template>
              <template v-else-if="typeof data[key] === 'object'">
                <div>
                  <div class="inline-flex items-center cursor-pointer" @click.stop="togglePath(`root.${key}`)">
                    <ChevronDown v-if="expandedPaths.has(`root.${key}`)" class="w-4 h-4 text-muted-foreground" />
                    <ChevronRight v-else class="w-4 h-4 text-muted-foreground" />
                    <span class="text-gray-500">{{ `${Object.keys(data[key]).length}` }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
