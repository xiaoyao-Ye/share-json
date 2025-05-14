<script setup lang="ts">
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header class="sticky top-0 z-50 w-full border-b bg-background">
      <div class="container flex items-center justify-between h-16">
        <router-link to="/" class="flex items-center space-x-2">
          <span class="inline-block font-bold">JSON 分享工具</span>
        </router-link>
        <nav class="flex gap-6">
          <router-link
            to="/"
            class="flex items-center text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
            :class="{ 'text-foreground': $route.path === '/' }"
          >
            首页
          </router-link>
          <router-link
            to="/my-shares"
            class="flex items-center text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
            :class="{ 'text-foreground': $route.path === '/my-shares' }"
          >
            我的分享
          </router-link>
        </nav>
      </div>
    </header>
    <main class="flex-1">
      <slot />
    </main>
    <footer class="py-6 border-t md:py-0">
      <div class="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <p class="text-sm leading-loose text-center text-muted-foreground md:text-left">
          &copy; {{ new Date().getFullYear() }} JSON 分享工具。保留所有权利。
        </p>
      </div>
    </footer>
  </div>
</template>
