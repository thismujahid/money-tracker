<script setup lang="ts">
import { useFinanceStore } from '../stores/finance'

const finance = useFinanceStore()

// Form reactive states
const amount = ref<number | null>(null)
const source = ref('')
const type = ref<'expense' | 'income'>('expense')
const isSubmitting = ref(false)

// History filters
const filterType = ref<'all' | 'income' | 'expense'>('all')

const filteredTransactions = computed(() => {
  if (filterType.value === 'all') return finance.transactions
  return finance.transactions.filter(t => t.type === filterType.value)
})

const formatDate = (isoString: string) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Add transaction handler
const handleAddTransaction = async () => {
  if (!amount.value || amount.value <= 0 || !source.value.trim()) {
    alert('من فضلك أدخل مبلغاً صحيحاً ووصفاً للمعاملة.')
    return
  }

  isSubmitting.value = true
  try {
    await finance.addTransaction(type.value, amount.value, source.value.trim())
    // Reset form
    amount.value = null
    source.value = ''
  } catch (error) {
    console.error(error)
    alert('حدث خطأ أثناء حفظ المعاملة.')
  } finally {
    isSubmitting.value = false
  }
}

// Delete transaction handler
const handleDeleteTransaction = async (id: string) => {
  if (confirm('هل أنت متأكد من رغبتك في حذف هذه المعاملة؟')) {
    await finance.deleteTransaction(id)
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Page Header & Balance Banner -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-2">
          إدارة <span class="gold-gradient-text">المصاريف والكاش</span>
        </h2>
        <p class="text-slate-400 mt-1">تتبع كاشك الحالي وسجل كافة الواردات والمصروفات اليومية.</p>
      </div>

      <!-- Quick Total Cash Display -->
      <div class="glass-panel py-4 px-6 rounded-2xl flex items-center gap-5 border border-gold-500/20 shadow-gold-glow">
        <div class="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400">
          <i class="pi pi-wallet text-2xl"></i>
        </div>
        <div>
          <span class="text-xs text-slate-400 block">رصيد الكاش المتوفر حالياً:</span>
          <span class="text-2xl font-extrabold text-gold-400 font-outfit">
            {{ finance.currentBalance.toLocaleString('ar-EG') }}
            <span class="text-sm font-bold text-slate-300"> ج.م</span>
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Add Record Form (1 Column) -->
      <div class="glass-panel rounded-2xl p-6 h-fit relative">
        <h3 class="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2 pb-3 border-b border-slate-800">
          <i class="pi pi-plus-circle text-gold-500"></i>
          إضافة سجل مالي جديد
        </h3>

        <form @submit.prevent="handleAddTransaction" class="space-y-5">
          <!-- Type Toggle Buttons -->
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-2">نوع السجل</label>
            <div class="grid grid-cols-2 gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                @click="type = 'expense'"
                class="py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200"
                :class="type === 'expense' 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : 'text-slate-400 hover:text-slate-200 bg-transparent border border-transparent'"
              >
                <i class="pi pi-arrow-down-right ml-1 text-xs"></i>
                مصروف
              </button>
              <button
                type="button"
                @click="type = 'income'"
                class="py-2.5 px-4 rounded-lg font-bold text-sm transition-all duration-200"
                :class="type === 'income' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'text-slate-400 hover:text-slate-200 bg-transparent border border-transparent'"
              >
                <i class="pi pi-arrow-up-left ml-1 text-xs"></i>
                وارد (كاش)
              </button>
            </div>
          </div>

          <!-- Amount Input -->
          <div>
            <label for="amount" class="block text-xs font-semibold text-slate-400 mb-2">المبلغ (ج.م)</label>
            <div class="relative">
              <input
                id="amount"
                v-model="amount"
                type="number"
                step="any"
                min="0.01"
                required
                placeholder="0.00"
                class="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all font-outfit text-left"
                style="direction: ltr;"
              />
              <span class="absolute top-1/2 right-4 -translate-y-1/2 text-sm text-slate-500 pointer-events-none">ج.م</span>
            </div>
          </div>

          <!-- Source/Destination Input -->
          <div>
            <label for="source" class="block text-xs font-semibold text-slate-400 mb-2">الوصف / وارد منين أو مصروف لإيه</label>
            <input
              id="source"
              v-model="source"
              type="text"
              required
              placeholder="مثال: راتب الشهر، شراء بقالة، بنزين"
              class="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-3.5 rounded-xl font-bold transition-all shadow-gold-glow flex items-center justify-center gap-2"
            :class="[
              isSubmitting 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : type === 'expense' 
                  ? 'bg-gradient-to-tr from-rose-600 to-rose-400 text-slate-950 hover:brightness-110 shadow-rose-500/10'
                  : 'bg-gradient-to-tr from-gold-600 to-amber-400 text-slate-950 hover:brightness-110'
            ]"
          >
            <i v-if="isSubmitting" class="pi pi-spin pi-spinner text-lg"></i>
            <span v-else>إضافة السجل المالي</span>
          </button>
        </form>
      </div>

      <!-- History Table & Filters (2 Columns) -->
      <div class="glass-panel rounded-2xl p-6 lg:col-span-2 flex flex-col min-h-[400px]">
        <!-- Table Header & Filter Tabs -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-800">
          <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2">
            <i class="pi pi-list text-gold-500"></i>
            تاريخ السجلات والعمليات
          </h3>

          <!-- Filter Tabs -->
          <div class="flex bg-slate-900/50 p-0.5 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              @click="filterType = 'all'"
              class="py-1.5 px-3 rounded-lg transition-all"
              :class="filterType === 'all' ? 'bg-slate-800 text-gold-400 border border-slate-700/50' : 'text-slate-400 hover:text-slate-200'"
            >
              الكل
            </button>
            <button
              @click="filterType = 'income'"
              class="py-1.5 px-3 rounded-lg transition-all"
              :class="filterType === 'income' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-slate-200'"
            >
              الوارد
            </button>
            <button
              @click="filterType = 'expense'"
              class="py-1.5 px-3 rounded-lg transition-all"
              :class="filterType === 'expense' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'text-slate-400 hover:text-slate-200'"
            >
              المصروف
            </button>
          </div>
        </div>

        <!-- Transactions List -->
        <div v-if="finance.isLoading" class="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
          <i class="pi pi-spin pi-spinner text-3xl text-gold-500"></i>
          <span>جاري تحميل السجلات...</span>
        </div>

        <div v-else-if="filteredTransactions.length === 0" class="flex-1 flex flex-col items-center justify-center text-center text-slate-500 gap-3 py-12 border border-dashed border-slate-800 rounded-xl">
          <i class="pi pi-search text-3xl text-slate-600"></i>
          <span class="text-base font-semibold">لا توجد سجلات مالية متطابقة</span>
          <p class="text-xs text-slate-400 max-w-xs">أضف بعض المعاملات من النموذج لتبدأ في تتبع تفاصيل الكاش.</p>
        </div>

        <div v-else class="flex-1 overflow-x-auto">
          <table class="w-full text-right border-collapse">
            <thead>
              <tr class="text-slate-400 text-xs border-b border-slate-800">
                <th class="pb-3 pr-2">المعاملة / الوصف</th>
                <th class="pb-3 text-center">النوع</th>
                <th class="pb-3">التاريخ والوقت</th>
                <th class="pb-3 text-left">المبلغ</th>
                <th class="pb-3 text-left pl-2"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-850">
              <tr 
                v-for="t in filteredTransactions" 
                :key="t.id" 
                class="hover:bg-slate-800/10 transition-colors group"
              >
                <!-- Source Name -->
                <td class="py-4 pr-2 font-bold text-slate-200 text-sm max-w-[150px] truncate" :title="t.source">
                  {{ t.source }}
                </td>
                
                <!-- Type Tag -->
                <td class="py-4 text-center">
                  <span 
                    class="text-[10px] font-bold px-2.5 py-1 rounded-full border"
                    :class="t.type === 'income' 
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                      : 'text-rose-400 bg-rose-500/10 border-rose-500/20'"
                  >
                    {{ t.type === 'income' ? 'وارد' : 'مصروف' }}
                  </span>
                </td>

                <!-- Date -->
                <td class="py-4 text-slate-400 text-xs font-medium">
                  {{ formatDate(t.date) }}
                </td>

                <!-- Amount -->
                <td 
                  class="py-4 text-left font-extrabold text-sm md:text-base font-outfit"
                  :class="t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'"
                >
                  {{ t.type === 'expense' ? '-' : '+' }}{{ t.amount.toLocaleString('ar-EG') }} ج.م
                </td>

                <!-- Actions -->
                <td class="py-4 text-left pl-2">
                  <button 
                    @click="handleDeleteTransaction(t.id)"
                    class="p-1.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
                    title="حذف"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
