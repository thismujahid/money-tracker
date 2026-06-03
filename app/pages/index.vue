<script setup lang="ts">
import { useFinanceStore } from '../stores/finance'

const finance = useFinanceStore()

const formatDate = (isoString: string) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('ar-EG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Quick delete handler for recent activities
const handleDeleteActivity = async (activity: any) => {
  if (confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟')) {
    if (activity.activityType === 'transaction') {
      await finance.deleteTransaction(activity.id)
    } else if (activity.activityType === 'repayment') {
      // Find the debt containing this payment
      const debt = finance.debts.find(d => d.payments?.some(p => p.id === activity.id))
      if (debt) {
        await finance.deleteRepayment(debt.id, activity.id)
      }
    }
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-2">
          مرحباً بك في <span class="gold-gradient-text">دفتر المصاريف</span>
        </h2>
        <p class="text-slate-400 mt-1">تتبع كاشك، ديونك، والتزاماتك المالية بكل سهولة في مكان واحد.</p>
      </div>

      <!-- Quick Summary Date -->
      <div class="text-sm bg-slate-800/40 border border-slate-700/50 rounded-xl px-4 py-2 text-slate-300">
        {{ new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
      </div>
    </div>

    <!-- Stat Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Cash Balance Card -->
      <div class="glass-panel glass-card-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[150px]">
        <div class="absolute top-0 left-0 w-32 h-32 bg-gold-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex items-center justify-between">
          <span class="text-slate-400 font-medium">رصيدك الحالي (الكاش)</span>
          <div class="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center border border-gold-500/20 text-gold-400">
            <i class="pi pi-wallet text-xl"></i>
          </div>
        </div>
        <div class="mt-4">
          <div class="text-3xl font-extrabold text-gold-400 tracking-tight font-outfit">
            {{ finance.currentBalance.toLocaleString('ar-EG') }} <span class="text-lg font-bold text-slate-400">ج.م</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">إجمالي النقود المتوفرة معك حالياً</p>
        </div>
      </div>

      <!-- Debt Card -->
      <div class="glass-panel glass-card-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[150px]">
        <div class="absolute top-0 left-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex items-center justify-between">
          <span class="text-slate-400 font-medium">إجمالي الديون عليك</span>
          <div class="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-400">
            <i class="pi pi-percentage text-xl"></i>
          </div>
        </div>
        <div class="mt-4">
          <div class="text-3xl font-extrabold text-rose-400 tracking-tight font-outfit">
            {{ finance.totalDebts.toLocaleString('ar-EG') }} <span class="text-lg font-bold text-slate-400">ج.م</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">مجموع المبالغ المستحقة للآخرين</p>
        </div>
      </div>

      <!-- Net Worth Card -->
      <div class="glass-panel glass-card-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[150px]">
        <div class="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex items-center justify-between">
          <span class="text-slate-400 font-medium">صافي الموقف المالي</span>
          <div 
            class="w-10 h-10 rounded-lg flex items-center justify-center border text-xl"
            :class="finance.netWorth >= 0 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'"
          >
            <i class="pi pi-chart-bar"></i>
          </div>
        </div>
        <div class="mt-4">
          <div 
            class="text-3xl font-extrabold tracking-tight font-outfit"
            :class="finance.netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'"
          >
            {{ finance.netWorth.toLocaleString('ar-EG') }} <span class="text-lg font-bold text-slate-400">ج.م</span>
          </div>
          <p class="text-xs text-slate-400 mt-1">الكاش المتوفر ناقص الديون المطلوبة</p>
        </div>
      </div>
    </div>

    <!-- Quick Navigation Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <NuxtLink to="/expenses" class="glass-panel glass-card-hover p-6 rounded-2xl flex items-center justify-between group">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
            <i class="pi pi-plus text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-lg text-slate-100">إضافة مصاريف أو كاش وارد</h3>
            <p class="text-sm text-slate-400 mt-0.5">تسجيل الراتب، المشتريات اليومية، أو فواتيرك.</p>
          </div>
        </div>
        <i class="pi pi-arrow-left text-slate-400 group-hover:text-gold-400 transition-colors"></i>
      </NuxtLink>

      <NuxtLink to="/debts" class="glass-panel glass-card-hover p-6 rounded-2xl flex items-center justify-between group">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <i class="pi pi-user-plus text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-lg text-slate-100">إدارة الديون والسداد</h3>
            <p class="text-sm text-slate-400 mt-0.5">تسجيل دين جديد مستحق، أو دفع سداد دين سابق.</p>
          </div>
        </div>
        <i class="pi pi-arrow-left text-slate-400 group-hover:text-amber-400 transition-colors"></i>
      </NuxtLink>
    </div>

    <!-- Recent Activity Section -->
    <div class="glass-panel rounded-2xl p-6 relative">
      <h3 class="text-xl font-bold text-slate-100 mb-6 flex items-center gap-2">
        <i class="pi pi-history text-gold-500"></i>
        أحدث المعاملات والسداد
      </h3>

      <div v-if="finance.isLoading" class="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
        <i class="pi pi-spin pi-spinner text-3xl text-gold-500"></i>
        <span>جاري تحميل البيانات...</span>
      </div>

      <div v-else-if="finance.recentActivity.length === 0" class="flex flex-col items-center justify-center py-12 text-center text-slate-500 gap-3 border border-dashed border-slate-800 rounded-xl">
        <i class="pi pi-inbox text-4xl text-slate-600"></i>
        <div class="text-base font-medium">لا توجد عمليات مسجلة حتى الآن</div>
        <p class="text-xs max-w-xs text-slate-400">اضغط على الأزرار بالأعلى للبدء في تتبع كاشك أو ديونك.</p>
      </div>

      <div v-else class="divide-y divide-slate-800 max-h-[400px] overflow-y-auto pr-1">
        <div 
          v-for="activity in finance.recentActivity.slice(0, 10)" 
          :key="activity.id"
          class="flex items-center justify-between py-4 group"
        >
          <div class="flex items-center gap-3.5">
            <!-- Icon based on type -->
            <div 
              class="w-10 h-10 rounded-lg flex items-center justify-center"
              :class="[
                activity.type === 'income' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : '',
                activity.type === 'expense' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : '',
                activity.type === 'repayment' ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20' : '',
              ]"
            >
              <i 
                :class="[
                  activity.type === 'income' ? 'pi pi-arrow-up-left' : '',
                  activity.type === 'expense' ? 'pi pi-arrow-down-right' : '',
                  activity.type === 'repayment' ? 'pi pi-check-circle' : '',
                ]" 
                class="text-base"
              ></i>
            </div>
            
            <div>
              <div class="font-bold text-slate-200 text-sm md:text-base">{{ activity.title }}</div>
              <div class="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{{ activity.subtitle }}</span>
                <span>•</span>
                <span>{{ formatDate(activity.date) }}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <span 
              class="font-extrabold text-sm md:text-base font-outfit"
              :class="[
                activity.type === 'income' ? 'text-emerald-400' : 'text-slate-200',
                activity.type === 'expense' ? 'text-rose-400' : '',
                activity.type === 'repayment' ? 'text-gold-400' : '',
              ]"
            >
              {{ activity.type === 'expense' ? '-' : '+' }}{{ activity.amount.toLocaleString('ar-EG') }} ج.م
            </span>

            <button 
              @click="handleDeleteActivity(activity)"
              class="p-2 text-slate-500 hover:text-rose-500 rounded-lg hover:bg-rose-500/5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
              title="حذف السجل"
            >
              <i class="pi pi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
