<script setup lang="ts">
import { useTransactionStore } from '@/stores/use-transaction-store'
import type { CreateTransactionBody, Transaction, TransactionType, UpdateTransactionBody } from '@/models'

const CATEGORIES = [
  'เงินเดือน',
  'โบนัส',
  'รายรับอื่นๆ',
  'อาหาร',
  'ค่าเดินทาง',
  'ค่าเช่า',
  'ค่าน้ำ-ไฟ',
  'ค่าอินเทอร์เน็ต',
  'ค่ารักษาพยาบาล',
  'ช้อปปิ้ง',
  'ความบันเทิง',
  'ค่าการศึกษา',
  'ประกัน',
  'อื่นๆ',
] as const

const transactionStore = useTransactionStore()
const { transactions, isLoading, error } = storeToRefs(transactionStore)

const headers = [
  { title: 'วันที่', key: 'date' },
  { title: 'ประเภท', key: 'type' },
  { title: 'หมวดหมู่', key: 'category' },
  { title: 'จำนวนเงิน', key: 'amount' },
  { title: 'คำอธิบาย', key: 'description' },
  { title: 'จัดการ', key: 'action', sortable: false, align: 'end' as const },
]

const dialog = ref(false)
const deleteDialog = ref(false)
const isSubmitting = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const deletingTransaction = ref<Transaction | null>(null)

const form = ref<CreateTransactionBody & UpdateTransactionBody>({
  type: 'EXPENSE' as TransactionType,
  category: '',
  amount: 0,
  description: '',
  date: new Date().toISOString().substring(0, 10),
})

function openCreate() {
  editingTransaction.value = null
  form.value = {
    type: 'EXPENSE' as TransactionType,
    category: '',
    amount: 0,
    description: '',
    date: new Date().toISOString().substring(0, 10),
  }
  dialog.value = true
}

function openEdit(tx: Transaction) {
  editingTransaction.value = tx
  form.value = {
    type: tx.type,
    category: tx.category,
    amount: tx.amount,
    description: tx.description,
    date: tx.date,
  }
  dialog.value = true
}

function openDelete(tx: Transaction) {
  deletingTransaction.value = tx
  deleteDialog.value = true
}

async function submit() {
  isSubmitting.value = true
  try {
    if (editingTransaction.value)
      await transactionStore.updateTransaction(editingTransaction.value.id, form.value)
    else
      await transactionStore.createTransaction(form.value as CreateTransactionBody)
    dialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingTransaction.value) return
  isSubmitting.value = true
  try {
    await transactionStore.deleteTransaction(deletingTransaction.value.id)
    deleteDialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}

function typeChipColor(type: TransactionType) {
  return type === 'INCOME' ? 'success' : 'error'
}

function typeLabel(type: TransactionType) {
  return type === 'INCOME' ? 'รายรับ' : 'รายจ่าย'
}

onMounted(() => transactionStore.fetchTransactions())
</script>

<template>
  <div>
    <!-- Summary Cards -->
    <VRow class="mb-6">
      <VCol cols="12" sm="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="success" variant="tonal" size="48">
              <VIcon icon="ri-arrow-up-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">รายรับรวม</div>
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
              <div class="text-caption text-medium-emphasis">รายจ่ายรวม</div>
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
              <div class="text-caption text-medium-emphasis">คงเหลือ</div>
              <div class="text-h5 font-weight-bold">
                {{ formatCurrency(transactionStore.balance) }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <!-- Transactions Table -->
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">รายการทั้งหมด</span>
        <VBtn
          color="primary"
          prepend-icon="ri-add-line"
          @click="openCreate"
        >
          เพิ่มรายการ
        </VBtn>
      </VCardTitle>

      <VDivider />

      <VAlert
        v-if="error"
        type="error"
        class="ma-4"
        :text="error"
        closable
      />

      <VDataTable
        :headers="headers"
        :items="transactions"
        :loading="isLoading"
        hover
      >
        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
        </template>

        <template #item.type="{ item }">
          <VChip
            :color="typeChipColor(item.type)"
            size="small"
          >
            {{ typeLabel(item.type) }}
          </VChip>
        </template>

        <template #item.amount="{ item }">
          <span :class="item.type === 'INCOME' ? 'text-success' : 'text-error'">
            {{ item.type === 'INCOME' ? '+' : '-' }}{{ formatCurrency(item.amount) }}
          </span>
        </template>

        <template #item.action="{ item }">
          <IconBtn @click="openEdit(item)">
            <VTooltip activator="parent" location="top">แก้ไข</VTooltip>
            <VIcon icon="ri-pencil-line" />
          </IconBtn>
          <IconBtn color="error" @click="openDelete(item)">
            <VTooltip activator="parent" location="top">ลบ</VTooltip>
            <VIcon icon="ri-delete-bin-line" />
          </IconBtn>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-disabled">
            ยังไม่มีรายการ กด "เพิ่มรายการ" เพื่อเริ่มบันทึก
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="520" persistent>
      <VCard :title="editingTransaction ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'">
        <VCardText>
          <VForm @submit.prevent="submit">
            <VSelect
              v-model="form.type"
              label="ประเภท"
              :items="[
                { title: 'รายรับ', value: 'INCOME' },
                { title: 'รายจ่าย', value: 'EXPENSE' },
              ]"
              prepend-inner-icon="ri-swap-line"
              class="mb-4"
              required
            />

            <VSelect
              v-model="form.category"
              label="หมวดหมู่"
              :items="CATEGORIES"
              prepend-inner-icon="ri-price-tag-3-line"
              class="mb-4"
              required
            />

            <VTextField
              v-model.number="form.amount"
              label="จำนวนเงิน"
              type="number"
              prepend-inner-icon="ri-money-dollar-circle-line"
              class="mb-4"
              min="1"
              step="0.01"
              required
            />

            <VTextField
              v-model="form.date"
              label="วันที่"
              type="date"
              prepend-inner-icon="ri-calendar-line"
              class="mb-4"
              required
            />

            <VTextField
              v-model="form.description"
              label="คำอธิบาย (ไม่บังคับ)"
              prepend-inner-icon="ri-file-text-line"
              class="mb-4"
            />
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">ยกเลิก</VBtn>
          <VBtn
            color="primary"
            :loading="isSubmitting"
            @click="submit"
          >
            {{ editingTransaction ? 'บันทึก' : 'เพิ่ม' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard title="ลบรายการ">
        <VCardText>
          แน่ใจหรือไม่ว่าต้องการลบรายการนี้? การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="deleteDialog = false">ยกเลิก</VBtn>
          <VBtn
            color="error"
            :loading="isSubmitting"
            @click="confirmDelete"
          >
            ลบ
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
