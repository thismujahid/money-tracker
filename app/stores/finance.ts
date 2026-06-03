import { defineStore } from 'pinia'
import { signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth'
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore'

export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  source: string
  date: string
}

export interface Repayment {
  id: string
  amount: number
  date: string
}

export interface Debt {
  id: string
  creditor: string
  amount: number
  reason: string
  date: string
  payments: Repayment[]
}

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    user: null as User | null,
    uid: '' as string,
    isLocalMode: true,
    isLoading: true,
    transactions: [] as Transaction[],
    debts: [] as Debt[],
    unsubscribeTransactions: null as (() => void) | null,
    unsubscribeDebts: null as (() => void) | null,
  }),

  getters: {
    // Current available balance: income - expenses
    currentBalance: (state) => {
      return state.transactions.reduce((acc, t) => {
        if (t.type === 'income') {
          return acc + t.amount
        } else {
          return acc - t.amount
        }
      }, 0)
    },

    // Total outstanding debt
    totalDebts: (state) => {
      return state.debts.reduce((acc, d) => {
        const totalPaid = d.payments?.reduce((pAcc, p) => pAcc + p.amount, 0) || 0
        const remaining = d.amount - totalPaid
        return acc + (remaining > 0 ? remaining : 0)
      }, 0)
    },

    // Net worth: balance - total debt
    netWorth() {
      return this.currentBalance - this.totalDebts
    },

    // Combined recent activity, sorted by date descending
    recentActivity: (state) => {
      const activities: any[] = []

      // Add transactions
      state.transactions.forEach(t => {
        activities.push({
          id: t.id,
          activityType: 'transaction',
          type: t.type, // income/expense
          amount: t.amount,
          title: t.source,
          date: t.date,
          subtitle: t.type === 'income' ? 'وارد' : 'مصروف'
        })
      })

      // Add repayments
      state.debts.forEach(d => {
        d.payments?.forEach(p => {
          activities.push({
            id: p.id,
            activityType: 'repayment',
            type: 'repayment',
            amount: p.amount,
            title: `سداد دين إلى ${d.creditor}`,
            date: p.date,
            subtitle: `عن دين: ${d.reason}`
          })
        })
      })

      // Sort by date descending
      return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
  },

  actions: {
    async initializeStore() {
      this.isLoading = true
      const { isFirebaseConfigured, auth, db } = useFirebase()

      if (isFirebaseConfigured && auth && db) {
        this.isLocalMode = false
        // Listen to Auth State
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            this.user = firebaseUser
            this.uid = firebaseUser.uid
            this.setupFirebaseListeners(db, firebaseUser.uid)
          } else {
            // Sign in anonymously to secure the session
            try {
              const credentials = await signInAnonymously(auth)
              this.user = credentials.user
              this.uid = credentials.user.uid
              this.setupFirebaseListeners(db, credentials.user.uid)
            } catch (err) {
              console.error('فشل تسجيل الدخول المجهول:', err)
              this.enableLocalMode()
            }
          }
        })
      } else {
        this.enableLocalMode()
      }
    },

    enableLocalMode() {
      this.isLocalMode = true
      this.uid = 'local-user'
      
      // Load from localStorage
      if (process.client) {
        const localTransactions = localStorage.getItem('masareef_transactions')
        const localDebts = localStorage.getItem('masareef_debts')
        
        if (localTransactions) this.transactions = JSON.parse(localTransactions)
        if (localDebts) this.debts = JSON.parse(localDebts)
      }
      this.isLoading = false
    },

    setupFirebaseListeners(db: any, userId: string) {
      if (this.unsubscribeTransactions) this.unsubscribeTransactions()
      if (this.unsubscribeDebts) this.unsubscribeDebts()

      const transactionsRef = collection(db, 'users', userId, 'transactions')
      this.unsubscribeTransactions = onSnapshot(transactionsRef, (snapshot) => {
        const txs: Transaction[] = []
        snapshot.forEach((doc) => {
          txs.push({ id: doc.id, ...doc.data() } as Transaction)
        })
        this.transactions = txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        this.isLoading = false
      }, (error) => {
        console.error('خطأ في مزامنة المصاريف:', error)
      })

      const debtsRef = collection(db, 'users', userId, 'debts')
      this.unsubscribeDebts = onSnapshot(debtsRef, (snapshot) => {
        const dbs: Debt[] = []
        snapshot.forEach((doc) => {
          dbs.push({ id: doc.id, ...doc.data() } as Debt)
        })
        this.debts = dbs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }, (error) => {
        console.error('خطأ في مزامنة الديون:', error)
      })
    },

    saveToLocalStorage() {
      if (process.client && this.isLocalMode) {
        localStorage.setItem('masareef_transactions', JSON.stringify(this.transactions))
        localStorage.setItem('masareef_debts', JSON.stringify(this.debts))
      }
    },

    async addTransaction(type: 'income' | 'expense', amount: number, source: string) {
      const transaction: Transaction = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        type,
        amount,
        source,
        date: new Date().toISOString()
      }

      if (this.isLocalMode) {
        this.transactions.unshift(transaction)
        this.saveToLocalStorage()
      } else {
        const { db } = useFirebase()
        if (db && this.uid) {
          const docRef = doc(db, 'users', this.uid, 'transactions', transaction.id)
          await setDoc(docRef, transaction)
        }
      }
    },

    async deleteTransaction(id: string) {
      if (this.isLocalMode) {
        this.transactions = this.transactions.filter(t => t.id !== id)
        this.saveToLocalStorage()
      } else {
        const { db } = useFirebase()
        if (db && this.uid) {
          const docRef = doc(db, 'users', this.uid, 'transactions', id)
          await deleteDoc(docRef)
        }
      }
    },

    async addDebt(creditor: string, amount: number, reason: string) {
      const debt: Debt = {
        id: 'debt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        creditor,
        amount,
        reason,
        date: new Date().toISOString(),
        payments: []
      }

      if (this.isLocalMode) {
        this.debts.unshift(debt)
        this.saveToLocalStorage()
      } else {
        const { db } = useFirebase()
        if (db && this.uid) {
          const docRef = doc(db, 'users', this.uid, 'debts', debt.id)
          await setDoc(docRef, debt)
        }
      }
    },

    async deleteDebt(id: string) {
      if (this.isLocalMode) {
        this.debts = this.debts.filter(d => d.id !== id)
        this.saveToLocalStorage()
      } else {
        const { db } = useFirebase()
        if (db && this.uid) {
          const docRef = doc(db, 'users', this.uid, 'debts', id)
          await deleteDoc(docRef)
        }
      }
    },

    async addRepayment(debtId: string, amount: number) {
      const repayment: Repayment = {
        id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        amount,
        date: new Date().toISOString()
      }

      if (this.isLocalMode) {
        const debt = this.debts.find(d => d.id === debtId)
        if (debt) {
          if (!debt.payments) debt.payments = []
          debt.payments.push(repayment)
          this.saveToLocalStorage()
        }
      } else {
        const { db } = useFirebase()
        if (db && this.uid) {
          const docRef = doc(db, 'users', this.uid, 'debts', debtId)
          await updateDoc(docRef, {
            payments: arrayUnion(repayment)
          })
        }
      }
    },

    async deleteRepayment(debtId: string, paymentId: string) {
      if (this.isLocalMode) {
        const debt = this.debts.find(d => d.id === debtId)
        if (debt && debt.payments) {
          debt.payments = debt.payments.filter(p => p.id !== paymentId)
          this.saveToLocalStorage()
        }
      } else {
        const { db } = useFirebase()
        if (db && this.uid) {
          const debt = this.debts.find(d => d.id === debtId)
          if (debt) {
            const paymentToRemove = debt.payments.find(p => p.id === paymentId)
            if (paymentToRemove) {
              const docRef = doc(db, 'users', this.uid, 'debts', debtId)
              await updateDoc(docRef, {
                payments: arrayRemove(paymentToRemove)
              })
            }
          }
        }
      }
    }
  }
})
