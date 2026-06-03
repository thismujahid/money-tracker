<script setup lang="ts">
import { useFinanceStore } from '../stores/finance'

const finance = useFinanceStore()
const route = useRoute()

const navItems = [
  { label: 'الرئيسية', icon: 'pi pi-home', path: '/' },
  { label: 'المصاريف', icon: 'pi pi-wallet', path: '/expenses' },
  { label: 'الديون', icon: 'pi pi-percentage', path: '/debts' }, // percentage or calendar or primeicon for debt
]

// Determine if path is active
const isActive = (path: string) => {
  return route.path === path
}
</script>

<template>
  <div class="min-h-screen bg-darkbg-950 text-slate-100 flex flex-col md:flex-row relative overflow-hidden font-sans">
    <!-- Golden Backdrop Blur Blobs -->
    <div class="glow-blob w-[300px] h-[300px] bg-gold-500 top-[-50px] right-[-50px]"></div>
    <div class="glow-blob w-[400px] h-[400px] bg-amber-600 bottom-[-100px] left-[-100px]"></div>
    <div class="glow-blob w-[250px] h-[250px] bg-yellow-500 top-[40%] left-[20%]"></div>

    <!-- Desktop Sidebar (Right side for RTL) -->
    <aside class="hidden md:flex flex-col w-64 glass-panel border-l border-r-0 border-t-0 border-b-0 z-10 p-5 shrink-0">
      <!-- App Logo / Title -->
      <div class="flex items-center gap-3 mb-8 pb-4 border-b border-slate-800">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-600 to-amber-400 flex items-center justify-center shadow-gold-glow">
          <i class="pi pi-chart-line text-darkbg-950 text-xl font-bold"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold gold-gradient-text tracking-wide font-outfit">دفتر المصاريف</h1>
          <p class="text-xs text-slate-400">تتبع مصاريفك وديونك</p>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 space-y-2">
        <NuxtLink 
          v-for="item in navItems" 
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group text-slate-300"
          :class="[
            isActive(item.path) 
              ? 'bg-gradient-to-r from-gold-500/20 to-amber-500/5 border border-gold-500/30 text-gold-400 shadow-gold-glow' 
              : 'hover:bg-slate-800/50 hover:text-slate-100 border border-transparent'
          ]"
        >
          <i :class="[item.icon, isActive(item.path) ? 'text-gold-400' : 'text-slate-400 group-hover:text-gold-400']" class="text-lg"></i>
          <span class="font-medium text-base">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Sync Status Badge -->
      <div class="mt-auto pt-4 border-t border-slate-800 flex flex-col gap-2">
        <div class="flex items-center justify-between text-xs text-slate-400 px-2">
          <span>حالة المزامنة:</span>
          <span 
            v-if="finance.isLocalMode" 
            class="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20"
          >
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            تخزين محلي
          </span>
          <span 
            v-else 
            class="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            سحابي (Firebase)
          </span>
        </div>
      </div>
    </aside>

    <!-- Mobile Top Header -->
    <header class="md:hidden flex items-center justify-between p-4 glass-panel border-b border-t-0 border-l-0 border-r-0 z-10">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-lg bg-gradient-to-tr from-gold-600 to-amber-400 flex items-center justify-center shadow-gold-glow">
          <i class="pi pi-chart-line text-darkbg-950 text-lg"></i>
        </div>
        <div>
          <h1 class="text-lg font-bold gold-gradient-text">دفتر المصاريف</h1>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span 
          v-if="finance.isLocalMode" 
          class="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20"
        >
          محلي
        </span>
        <span 
          v-else 
          class="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"
        >
          سحابي
        </span>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 flex flex-col min-w-0 z-10 relative overflow-y-auto pb-24 md:pb-6">
      <div class="max-w-6xl w-full mx-auto p-4 md:p-8 flex-1">
        <slot />
        <footer class="text-center py-4 mt-8">
      <p class="text-sm text-gray-500 text-[40px]">
        Developed with ❤️ By <a href="https://thismujahid.github.io" class="text-gold-400 font-bold hover:underline" target="_blank">Muhammad Mujahid</a>
      </p>
    </footer>
      </div>
    </main>

    <!-- Mobile Bottom Navigation -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-b-0 border-l-0 border-r-0 z-20 py-2 px-6 flex justify-around items-center">
      <NuxtLink 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200"
        :class="[isActive(item.path) ? 'text-gold-400' : 'text-slate-400']"
      >
        <i :class="[item.icon, isActive(item.path) ? 'text-gold-400' : 'text-slate-400']" class="text-xl"></i>
        <span class="text-[10px] font-medium">{{ item.label }}</span>
      </NuxtLink>
    </nav>
  </div>
</template>
