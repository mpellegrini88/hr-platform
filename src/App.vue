<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <Sidebar />
    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <Topbar />
      <main class="flex-1 overflow-y-auto scroll-thin">
        <RouterView />
      </main>
    </div>
    <Toast />
  </div>
</template>

<script setup>
import Sidebar from '@/components/ui/Sidebar.vue'
import Topbar  from '@/components/ui/Topbar.vue'
import Toast   from '@/components/ui/Toast.vue'
</script>
