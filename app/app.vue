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
  </NuxtLayout>
</template>
