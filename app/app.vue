<script setup lang="ts">
import { useFinanceStore } from './stores/finance'

const finance = useFinanceStore()

// Initialize Pinia store on app startup
onMounted(() => {
  finance.initializeStore()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <footer class="text-center py-4 bg-gray-100 mt-8">
      <p class="text-sm text-gray-500">
        Developed with ❤️ By <a href="https://thismujahid.github.io" target="_blank">Muhammad Mujahid</a>
      </p>
    </footer>
  </NuxtLayout>
</template>
