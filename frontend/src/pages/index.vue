<script setup lang="ts">
import { onMounted } from 'vue'
import { useSEO } from '@/composables/useSEO'
import { useTransactionStore } from '@/stores/use-transaction-store'

useSEO({
  title: 'ภาพรวม - NgernNgern ThongThong',
  description: 'ภาพรวมรายรับรายจ่ายของคุณ',
  keywords: ['รายรับ', 'รายจ่าย', 'dashboard', 'การเงิน'],
})

const transactionStore = useTransactionStore()

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}

const recentTransactions = computed(() =>
  [...transactionStore.transactions].slice(0, 5)
)

const topExpenseCategories = computed(() => {
  const groups: Record<string, number> = {}
  for (const t of transactionStore.transactions) {
    if (t.type === 'EXPENSE') {
      groups[t.category] = (groups[t.category] || 0) + t.amount
    }
  }
  return Object.entries(groups)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
})

const currentMonthKey = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
})

const currentMonth = computed(() =>
  transactionStore.transactionsByMonth[currentMonthKey.value]
)

onMounted(async () => {
  await transactionStore.fetchTransactions()
})
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-2">NgernNgern ThongThong</h1>
    <p class="text-body-1 text-medium-emphasis mb-6">ระบบบันทึกรายรับรายจ่ายส่วนบุคคล</p>

    <!-- Summary Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="success" variant="tonal" size="48">
              <VIcon icon="ri-arrow-up-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">รายรับรวมทั้งหมด</div>
              <div class="text-h5 font-weight-bold text-success">
                {{ formatCurrency(transactionStore.totalIncome) }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="error" variant="tonal" size="48">
              <VIcon icon="ri-arrow-down-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">รายจ่ายรวมทั้งหมด</div>
              <div class="text-h5 font-weight-bold text-error">
                {{ formatCurrency(transactionStore.totalExpense) }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar
              :color="transactionStore.balance >= 0 ? 'primary' : 'warning'"
              variant="tonal"
              size="48"
            >
              <VIcon icon="ri-wallet-3-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">คงเหลือสุทธิ</div>
              <div class="text-h5 font-weight-bold">
                {{ formatCurrency(transactionStore.balance) }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <!-- Recent Transactions -->
      <VCol cols="12" md="7">
        <VCard title="รายการล่าสุด">
          <VList lines="two">
            <VListItem
              v-for="tx in recentTransactions"
              :key="tx.id"
            >
              <template #prepend>
                <VAvatar
                  :color="tx.type === 'INCOME' ? 'success' : 'error'"
                  variant="tonal"
                  size="36"
                >
                  <VIcon
                    :icon="tx.type === 'INCOME' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'"
                    size="18"
                  />
                </VAvatar>
              </template>
              <VListItemTitle>
                <span class="font-weight-medium">{{ tx.category }}</span>
                <span class="ms-2 text-caption text-medium-emphasis">{{ tx.description }}</span>
              </VListItemTitle>
              <VListItemSubtitle>
                {{ new Date(tx.date).toLocaleDateString('th-TH', { dateStyle: 'medium' }) }}
              </VListItemSubtitle>
              <template #append>
                <span
                  :class="tx.type === 'INCOME' ? 'text-success' : 'text-error'"
                  class="font-weight-bold"
                >
                  {{ tx.type === 'INCOME' ? '+' : '-' }}{{ formatCurrency(tx.amount) }}
                </span>
              </template>
            </VListItem>
            <VListItem v-if="recentTransactions.length === 0" class="text-center text-medium-emphasis py-4">
              ยังไม่มีรายการ เริ่มบันทึกกันเลย!
            </VListItem>
          </VList>
          <VCardActions>
            <RouterLink :to="{ name: 'transaction-page' }">
              <VBtn variant="text" size="small">ดูทั้งหมด</VBtn>
            </RouterLink>
          </VCardActions>
        </VCard>
      </VCol>

      <!-- Top Expense Categories -->
      <VCol cols="12" md="5">
        <VCard title="หมวดหมู่รายจ่ายสูงสุด">
          <VList lines="two">
            <VListItem
              v-for="[category, amount] in topExpenseCategories"
              :key="category"
            >
              <VListItemTitle>{{ category }}</VListItemTitle>
              <template #append>
                <span class="text-error font-weight-bold">
                  {{ formatCurrency(amount) }}
                </span>
              </template>
            </VListItem>
            <VListItem v-if="topExpenseCategories.length === 0" class="text-center text-medium-emphasis py-4">
              ยังไม่มีรายจ่าย
            </VListItem>
          </VList>
        </VCard>

        <!-- This month summary -->
        <VCard v-if="currentMonth" class="mt-4" title="เดือนนี้">
          <VCardText>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-success">รายรับ</span>
              <span class="text-success font-weight-bold">{{ formatCurrency(currentMonth.income) }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span class="text-error">รายจ่าย</span>
              <span class="text-error font-weight-bold">{{ formatCurrency(currentMonth.expense) }}</span>
            </div>
            <VDivider class="my-2" />
            <div class="d-flex justify-space-between">
              <span class="font-weight-medium">คงเหลือ</span>
              <span
                :class="(currentMonth.income - currentMonth.expense) >= 0 ? 'text-primary' : 'text-warning'"
                class="font-weight-bold"
              >
                {{ formatCurrency(currentMonth.income - currentMonth.expense) }}
              </span>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
