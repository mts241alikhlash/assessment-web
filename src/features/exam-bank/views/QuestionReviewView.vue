<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { DataTable, SearchInput } from '@mts241alikhlash/ui'
import { Button } from '@mts241alikhlash/ui/button'
import { Card } from '@mts241alikhlash/ui/card'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@mts241alikhlash/ui/dialog'
import { Filter } from '@lucide/vue'
import { buildReviewColumns } from '../components/reviewColumns'
import QuestionFilterFields from '../components/QuestionFilterFields.vue'
import QuestionReviewDialog from '../components/QuestionReviewDialog.vue'
import { useQuestionList } from '../composables/useQuestionList'
import { examBankService } from '../services/examBankService'
import { useExamBankStore } from '../stores/examBankStore'
import type { ApprovalResult, QuestionSummary } from '../types'
import { plainExcerpt } from '../utils/plainText'

const MAX_BULK = 50

const store = useExamBankStore()
const { subjectOptions, gradeOptions, authors } = storeToRefs(store)

const search = ref('')
const subjectId = ref('ALL')
const gradeId = ref('ALL')
const type = ref('ALL')
const status = ref('ALL')
const authorId = ref('ALL')
const page = ref(1)
const pageSize = ref(10)
const filterOpen = ref(false)
const selected = ref<string[]>([])
const reviewId = ref<string | null>(null)
const reviewOpen = ref(false)
const acting = ref(false)
const bulkResult = ref<{ approved: number; skipped: string[] } | null>(null)

const { questions, totalItems, loading, listError, filtersPending, refresh } =
  useQuestionList(
    { search, subjectId, gradeId, type, status, authorId },
    page,
    pageSize,
    ['exam-bank', 'review'],
    'SUBMITTED',
  )

watch(
  [search, subjectId, gradeId, type, authorId],
  () => {
    page.value = 1
    selected.value = []
  },
  { flush: 'sync' },
)

watch(questions, (rows) => {
  const visible = new Set(rows.map((row) => row.id))
  selected.value = selected.value.filter((id) => visible.has(id))
})

const activeFiltersCount = computed(
  () =>
    [subjectId, gradeId, type, authorId].filter((f) => f.value !== 'ALL')
      .length,
)
const allSelected = computed(
  () =>
    questions.value.length > 0 &&
    questions.value.every((row) => selected.value.includes(row.id)),
)
const tooMany = computed(() => selected.value.length > MAX_BULK)

function resetFilters() {
  subjectId.value = 'ALL'
  gradeId.value = 'ALL'
  type.value = 'ALL'
  authorId.value = 'ALL'
}

function toggle(id: string, checked: boolean) {
  selected.value = checked
    ? [...new Set([...selected.value, id])]
    : selected.value.filter((candidate) => candidate !== id)
}

function toggleAll(checked: boolean) {
  selected.value = checked ? questions.value.map((row) => row.id) : []
}

function review(question: QuestionSummary) {
  reviewId.value = question.id
  reviewOpen.value = true
}

async function onReviewed() {
  selected.value = []
  await refresh()
}

async function approveSelected() {
  const items = questions.value
    .filter((row) => selected.value.includes(row.id))
    .map((row) => ({ id: row.id, revision: row.revision }))
  if (items.length === 0 || items.length > MAX_BULK) return

  acting.value = true
  const results = await examBankService.approveMany(items)
  acting.value = false
  if (!results) return

  const titles = new Map(
    questions.value.map((row) => [row.id, plainExcerpt(row.bodyHtml, 40)]),
  )
  const skipped = results
    .filter((result: ApprovalResult) => !result.ok)
    .map(
      (result) =>
        `${titles.get(result.id) ?? result.id}: ${result.reason ?? 'Gagal disetujui'}`,
    )
  bulkResult.value = {
    approved: results.filter((result) => result.ok).length,
    skipped,
  }
  selected.value = []
  await refresh()
}

const columns = computed(() =>
  buildReviewColumns({
    subjectName: store.subjectName,
    gradeName: store.gradeName,
    isSelected: (id) => selected.value.includes(id),
    allSelected: () => allSelected.value,
    onToggle: toggle,
    onToggleAll: toggleAll,
    onReview: review,
  }),
)

onMounted(async () => {
  await examBankService.loadReferences()
  await examBankService.loadAuthors('SUBMITTED')
})
</script>

<template>
  <div class="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
    <Card
      gap="none"
      class="overflow-visible rounded-none border-0 bg-transparent shadow-none ring-0"
    >
      <div class="space-y-4 p-0 sm:px-0">
        <div
          v-if="bulkResult"
          class="space-y-2 rounded-md border p-3 text-[length:var(--text-control,0.75rem)]"
          role="status"
          data-testid="bulk-result"
        >
          <p class="font-medium">
            {{ bulkResult.approved }} soal disetujui<template
              v-if="bulkResult.skipped.length > 0"
              >, {{ bulkResult.skipped.length }} dilewati</template
            >.
          </p>
          <ul
            v-if="bulkResult.skipped.length > 0"
            class="list-disc pl-5"
          >
            <li
              v-for="line in bulkResult.skipped"
              :key="line"
            >
              {{ line }}
            </li>
          </ul>
        </div>

        <div
          v-if="listError"
          class="space-y-3 rounded-md border p-4"
          role="alert"
        >
          <p class="text-[length:var(--text-control,0.75rem)]">
            {{ listError }}
          </p>
          <Button
            variant="outline"
            @click="refresh()"
          >
            Coba lagi
          </Button>
        </div>
        <DataTable
          v-else
          mobile="cards"
          :columns="columns"
          :data="filtersPending ? [] : questions"
          :page="page"
          :page-size="pageSize"
          :total-items="totalItems"
          :is-loading="loading || filtersPending"
          item-label="soal"
          @update:page="page = $event"
          @update:page-size="pageSize = $event"
        >
          <template #header-left>
            <Button
              v-if="selected.length > 0"
              class="shrink-0"
              :disabled="acting || tooMany"
              @click="approveSelected"
            >
              Setujui terpilih ({{ selected.length }})
            </Button>
            <span
              v-if="tooMany"
              class="text-[length:var(--text-control,0.75rem)] text-destructive"
            >
              Paling banyak {{ MAX_BULK }} soal sekaligus.
            </span>
          </template>
          <template #header-right>
            <div class="flex items-end">
              <div
                class="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-0 sm:[&>*:not(:first-child)]:-ml-px sm:[&>*:not(:first-child)_:is(button,input)]:rounded-l-none sm:[&>*:not(:last-child)_:is(button,input)]:rounded-r-none sm:[&>*:focus-within]:z-10"
              >
                <QuestionFilterFields
                  v-model:subject-id="subjectId"
                  v-model:grade-id="gradeId"
                  v-model:type="type"
                  v-model:status="status"
                  v-model:author-id="authorId"
                  :subjects="subjectOptions"
                  :grades="gradeOptions"
                  :authors="authors"
                  :show-author="true"
                  :show-status="false"
                />
              </div>
              <SearchInput
                v-model="search"
                class="sm:w-40"
                label="Cari soal"
              />
            </div>
          </template>
          <template #mobile-toolbar>
            <SearchInput
              v-model="search"
              label="Cari soal"
              class="w-full"
            />
          </template>
          <template #mobile-filter>
            <Button
              variant="outline"
              class="relative shrink-0"
              @click="filterOpen = true"
            >
              <Filter class="mr-1.5 size-4" />
              Filter
              <span
                v-if="activeFiltersCount"
                class="absolute -top-1.5 -right-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground"
              >
                {{ activeFiltersCount }}
              </span>
            </Button>
          </template>
          <template #empty>
            <p>
              {{
                activeFiltersCount || search
                  ? 'Tidak ada soal yang cocok dengan filter.'
                  : 'Tidak ada soal yang menunggu persetujuan.'
              }}
            </p>
          </template>
        </DataTable>
      </div>
    </Card>

    <QuestionReviewDialog
      v-model:open="reviewOpen"
      :question-id="reviewId"
      @done="onReviewed"
    />

    <Dialog v-model:open="filterOpen">
      <DialogContent size="md">
        <DialogHeader standard>
          <DialogTitle>Filter Soal</DialogTitle>
          <DialogDescription class="sr-only">
            Pilih mapel, tingkat, jenis dan penulis soal.
          </DialogDescription>
        </DialogHeader>
        <DialogBody class="space-y-4">
          <QuestionFilterFields
            v-model:subject-id="subjectId"
            v-model:grade-id="gradeId"
            v-model:type="type"
            v-model:status="status"
            v-model:author-id="authorId"
            :subjects="subjectOptions"
            :grades="gradeOptions"
            :authors="authors"
            :show-author="true"
            :show-status="false"
          />
        </DialogBody>
        <DialogFooter
          standard
          class="justify-between"
        >
          <Button
            variant="outline"
            @click="resetFilters"
          >
            Atur Ulang
          </Button>
          <Button @click="filterOpen = false">Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
