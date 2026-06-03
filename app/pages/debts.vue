<script setup lang="ts">
import { useFinanceStore } from '../stores/finance'

const finance = useFinanceStore()

// Form reactive states
const creditor = ref('')
const amount = ref<number | null>(null)
const reason = ref('')
const isSubmitting = ref(false)

// Expandable debt items tracking (stores debtId of expanded debts)
const expandedDebts = ref<Record<string, boolean>>({})

// Repayment inline forms data (stores { debtId: amount } mapping)
const repaymentsForm = ref<Record<string, number | null>>({})

const toggleExpand = (debtId: string) => {
  expandedDebts.value[debtId] = !expandedDebts.value[debtId]
}

const formatDate = (isoString: string) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Compute total paid for a debt
const getPaidAmount = (debt: any) => {
  return debt.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0
}

// Compute remaining amount for a debt
const getRemainingAmount = (debt: any) => {
  const paid = getPaidAmount(debt)
  const remaining = debt.amount - paid
  return remaining > 0 ? remaining : 0
}

// Add new debt
const handleAddDebt = async () => {
  if (!creditor.value.trim() || !amount.value || amount.value <= 0 || !reason.value.trim()) {
    alert('من فضلك أدخل تفاصيل الدين والمبلغ بشكل صحيح.')
    return
  }

  isSubmitting.value = true
  try {
    await finance.addDebt(creditor.value.trim(), amount.value, reason.value.trim())
    // Reset form
    creditor.value = ''
    amount.value = null
    reason.value = ''
  } catch (error) {
    console.error(error)
    alert('حدث خطأ أثناء حفظ الدين.')
  } finally {
    isSubmitting.value = false
  }
}

// Delete whole debt
const handleDeleteDebt = async (id: string) => {
  if (confirm('هل أنت متأكد من رغبتك في حذف هذا الدين وكل سجلات سداده؟')) {
    await finance.deleteDebt(id)
  }
}

// Add repayment to debt
const handleAddRepayment = async (debtId: string) => {
  const payAmount = repaymentsForm.value[debtId]
  const debt = finance.debts.find(d => d.id === debtId)
  
  if (!payAmount || payAmount <= 0) {
    alert('من فضلك أدخل مبلغ سداد صحيح.')
    return
  }

  if (debt && payAmount > getRemainingAmount(debt)) {
    alert('لا يمكن أن يتخطى مبلغ السداد القيمة المتبقية من الدين!')
    return
  }

  try {
    await finance.addRepayment(debtId, payAmount)
    // Reset repayment input
    repaymentsForm.value[debtId] = null
  } catch (error) {
    console.error(error)
    alert('حدث خطأ أثناء تسجيل السداد.')
  }
}

// Delete specific repayment
const handleDeleteRepayment = async (debtId: string, paymentId: string) => {
  if (confirm('هل أنت متأكد من رغبتك في حذف سجل السداد هذا؟')) {
    await finance.deleteRepayment(debtId, paymentId)
  }
}
</script>

<template>
  <div class="space-y-8">
    <!-- Page Header & Debt summary banner -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div>
        <h2 class="text-2xl md:text-3xl font-bold text-slate-100 flex items-center gap-2">
          تتبع <span class="gold-gradient-text">الديون والالتزامات</span>
        </h2>
        <p class="text-slate-400 mt-1">سجل الديون المستحقة عليك للآخرين وتابع دفعات السداد الجزئية.</p>
      </div>

      <!-- Quick Total Debt Display -->
      <div class="glass-panel py-4 px-6 rounded-2xl flex items-center gap-5 border border-rose-500/20 shadow-rose-500/5">
        <div class="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
          <i class="pi pi-percentage text-2xl"></i>
        </div>
        <div>
          <span class="text-xs text-slate-400 block">إجمالي الديون المتبقية عليك:</span>
          <span class="text-2xl font-extrabold text-rose-400 font-outfit">
            {{ finance.totalDebts.toLocaleString('ar-EG') }}
            <span class="text-sm font-bold text-slate-350"> ج.م</span>
          </span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Add Debt Form (1 Column) -->
      <div class="glass-panel rounded-2xl p-6 h-fit relative">
        <h3 class="text-lg font-bold text-slate-100 mb-5 flex items-center gap-2 pb-3 border-b border-slate-800">
          <i class="pi pi-user-plus text-gold-500"></i>
          تسجيل دين جديد
        </h3>

        <form @submit.prevent="handleAddDebt" class="space-y-5">
          <!-- Creditor Input -->
          <div>
            <label for="creditor" class="block text-xs font-semibold text-slate-400 mb-2">الدائن (أخي، صديقي، فلان...)</label>
            <input
              id="creditor"
              v-model="creditor"
              type="text"
              required
              placeholder="مثال: أخي محمد، أحمد عبد الله"
              class="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all"
            />
          </div>

          <!-- Debt Amount Input -->
          <div>
            <label for="debt_amount" class="block text-xs font-semibold text-slate-400 mb-2">المبلغ المستلف (ج.م)</label>
            <div class="relative">
              <input
                id="debt_amount"
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

          <!-- Reason / Details -->
          <div>
            <label for="reason" class="block text-xs font-semibold text-slate-400 mb-2">بند الاستلاف / تفاصيل الدين</label>
            <input
              id="reason"
              v-model="reason"
              type="text"
              required
              placeholder="مثال: شراء لبن، تكملة إيجار الشقة"
              class="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-500/50 focus:ring-1 focus:ring-gold-500/50 transition-all"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-3.5 rounded-xl font-bold transition-all bg-gradient-to-tr from-gold-600 to-amber-400 text-slate-950 hover:brightness-110 shadow-gold-glow flex items-center justify-center gap-2"
          >
            <i v-if="isSubmitting" class="pi pi-spin pi-spinner text-lg"></i>
            <span v-else>تسجيل الدين</span>
          </button>
        </form>
      </div>

      <!-- Debts List & Sub-logs (2 Columns) -->
      <div class="glass-panel rounded-2xl p-6 lg:col-span-2 flex flex-col min-h-[400px]">
        <h3 class="text-lg font-bold text-slate-100 mb-6 pb-4 border-b border-slate-800 flex items-center gap-2">
          <i class="pi pi-list text-gold-500"></i>
          قائمة الديون والالتزامات النشطة
        </h3>

        <!-- Loading State -->
        <div v-if="finance.isLoading" class="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400">
          <i class="pi pi-spin pi-spinner text-3xl text-gold-500"></i>
          <span>جاري تحميل الديون...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="finance.debts.length === 0" class="flex-1 flex flex-col items-center justify-center text-center text-slate-500 gap-3 py-12 border border-dashed border-slate-800 rounded-xl">
          <i class="pi pi-check-circle text-4xl text-emerald-500/40"></i>
          <span class="text-base font-semibold">ممتاز! لا توجد ديون مسجلة عليك</span>
          <p class="text-xs text-slate-400 max-w-xs">يمكنك إضافة ديون من النموذج على اليمين إذا استلفت أي مبلغ.</p>
        </div>

        <!-- Debts List Accordion -->
        <div v-else class="space-y-4 max-h-[550px] overflow-y-auto pr-1">
          <div 
            v-for="debt in finance.debts" 
            :key="debt.id"
            class="bg-slate-900/40 border border-slate-800 rounded-xl transition-all duration-200 overflow-hidden"
            :class="{'border-gold-500/30 ring-1 ring-gold-500/10 shadow-gold-glow': expandedDebts[debt.id]}"
          >
            <!-- Debt Main Row -->
            <div 
              @click="toggleExpand(debt.id)"
              class="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 cursor-pointer hover:bg-slate-800/10 transition-colors"
            >
              <div class="flex items-start gap-3">
                <!-- Status icon (checked or alert) -->
                <div 
                  class="w-10 h-10 rounded-lg flex items-center justify-center border mt-0.5 shrink-0"
                  :class="getRemainingAmount(debt) === 0 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'"
                >
                  <i :class="getRemainingAmount(debt) === 0 ? 'pi pi-check' : 'pi pi-exclamation-triangle'"></i>
                </div>
                
                <div>
                  <div class="font-bold text-slate-200 flex items-center gap-2">
                    <span>{{ debt.creditor }}</span>
                    <span class="text-xs font-normal text-slate-400 font-sans">({{ formatDate(debt.date) }})</span>
                  </div>
                  <p class="text-xs text-slate-400 mt-1">عن: {{ debt.reason }}</p>
                </div>
              </div>

              <!-- Amounts & Expand arrow -->
              <div class="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                <div class="text-right">
                  <div class="text-sm font-semibold text-slate-400">
                    المتبقي: 
                    <span 
                      class="font-extrabold font-outfit"
                      :class="getRemainingAmount(debt) === 0 ? 'text-emerald-400' : 'text-rose-400'"
                    >
                      {{ getRemainingAmount(debt).toLocaleString('ar-EG') }} ج.م
                    </span>
                  </div>
                  <div class="text-[10px] text-slate-500 mt-0.5">
                    الأصل: {{ debt.amount.toLocaleString('ar-EG') }} ج.م | السداد: {{ getPaidAmount(debt).toLocaleString('ar-EG') }} ج.م
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <!-- Delete Debt Button -->
                  <button 
                    @click.stop="handleDeleteDebt(debt.id)"
                    class="p-2 text-slate-650 hover:text-rose-500 hover:bg-rose-500/5 rounded-lg transition-colors"
                    title="حذف الدين بالكامل"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                  <i 
                    class="pi pi-chevron-down text-slate-400 transition-transform duration-200" 
                    :class="{'rotate-180 text-gold-400': expandedDebts[debt.id]}"
                  ></i>
                </div>
              </div>
            </div>

            <!-- Expandable Repayments Section -->
            <div 
              v-show="expandedDebts[debt.id]"
              class="border-t border-slate-800 bg-slate-950/40 p-4 space-y-4"
            >
              <!-- Repayment Progress Bar -->
              <div class="space-y-1.5">
                <div class="flex justify-between text-xs font-medium text-slate-400">
                  <span>نسبة السداد</span>
                  <span class="font-outfit text-gold-400">
                    {{ Math.round((getPaidAmount(debt) / debt.amount) * 100) }}%
                  </span>
                </div>
                <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div 
                    class="gold-gradient-bg h-full rounded-full transition-all duration-500"
                    :style="{ width: `${(getPaidAmount(debt) / debt.amount) * 100}%` }"
                  ></div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <!-- Add Repayment Input Form -->
                <div class="bg-slate-900/30 p-3 rounded-lg border border-slate-800/80">
                  <h4 class="text-xs font-bold text-slate-300 mb-3 flex items-center gap-1.5">
                    <i class="pi pi-plus text-gold-500 text-[10px]"></i>
                    إضافة دفعة سداد جديدة
                  </h4>
                  <div class="flex gap-2">
                    <div class="relative flex-1">
                      <input 
                        v-model="repaymentsForm[debt.id]"
                        type="number"
                        step="any"
                        min="0.01"
                        placeholder="0.00"
                        class="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-gold-500/50 font-outfit text-left"
                        style="direction: ltr;"
                        @keyup.enter="handleAddRepayment(debt.id)"
                      />
                      <span class="absolute top-1/2 right-3 -translate-y-1/2 text-[10px] text-slate-500 pointer-events-none">ج.م</span>
                    </div>
                    <button 
                      @click="handleAddRepayment(debt.id)"
                      class="px-3.5 bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center shrink-0"
                    >
                      تسجيل
                    </button>
                  </div>
                </div>

                <!-- Repayments History List -->
                <div>
                  <h4 class="text-xs font-bold text-slate-350 mb-2.5 flex items-center gap-1.5">
                    <i class="pi pi-history text-slate-500 text-[10px]"></i>
                    تاريخ السداد لهذا الدين
                  </h4>
                  
                  <div v-if="!debt.payments || debt.payments.length === 0" class="text-xs text-slate-500 italic py-3 text-center bg-slate-900/10 rounded-lg border border-dashed border-slate-800/60">
                    لم يتم دفع أي سدادات بعد.
                  </div>
                  
                  <div v-else class="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                    <div 
                      v-for="pay in debt.payments" 
                      :key="pay.id"
                      class="flex items-center justify-between text-xs py-1.5 px-2 bg-slate-900/30 rounded border border-slate-800 group/pay"
                    >
                      <div class="flex items-center gap-2 text-slate-300">
                        <i class="pi pi-check text-[10px] text-emerald-400"></i>
                        <span class="font-extrabold font-outfit text-emerald-400">{{ pay.amount.toLocaleString('ar-EG') }} ج.م</span>
                        <span class="text-[10px] text-slate-400">في {{ formatDate(pay.date) }}</span>
                      </div>
                      <button 
                        @click="handleDeleteRepayment(debt.id, pay.id)"
                        class="text-slate-500 hover:text-rose-500 opacity-0 group-hover/pay:opacity-100 transition-opacity focus:opacity-100 p-0.5 rounded"
                        title="حذف دفعة السداد"
                      >
                        <i class="pi pi-times text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
