<script setup lang="ts">
import Layout from '~/components/Layout.vue'
import Upload from '~/components/Upload.vue'
</script>

<template>
  <Layout>
    <div class="container max-w-5xl py-6 md:py-10">
      <div class="flex flex-col items-center space-y-4 text-center">
        <h1 class="text-3xl font-bold tracking-tighter md:text-5xl sm:text-4xl">
          JSON 分享工具
        </h1>
        <p class="text-muted-foreground max-w-[700px] md:text-xl">
          上传您的 JSON 文件，生成分享链接，轻松与他人共享
        </p>
      </div>
      <div class="mt-10">
        <Upload />
      </div>
    </div>
  </Layout>
</template>
