<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
import { Filter, Plus } from '@lucide/vue'
import { useAuthSession } from '@/features/platform/auth'
import { buildQuestionColumns } from '../components/questionColumns'
import QuestionFilterFields from '../components/QuestionFilterFields.vue'
import { useQuestionList } from '../composables/useQuestionList'
import { examBankService } from '../services/examBankService'
import { useExamBankStore } from '../stores/examBankStore'
import { QUESTION_STATUSES, type QuestionSummary } from '../types'
import { isUuid } from '../utils/uuid'

const router = useRouter()
const route = useRoute()
const { hasPermission } = useAuthSession()
const store = useExamBankStore()
const { manageAll, subjectOptions, gradeOptions, authors } = storeToRefs(store)

const search = ref('')
function fromAddress(name: string, accept: (value: string) => boolean): string {
  const value = route.query[name]
  return typeof value === 'string' && accept(value) ? value : 'ALL'
}

const subjectId = ref(fromAddress('subjectId', isUuid))
const gradeId = ref(fromAddress('gradeId', isUuid))
const type = ref('ALL')
const status = ref(
  fromAddress('status', (value) =>
    (QUESTION_STATUSES as readonly string[]).includes(value),
  ),
)
const authorId = ref('ALL')
const page = ref(1)
const pageSize = ref(10)
const filterOpen = ref(false)

const { questions, totalItems, loading, listError, filtersPending, refresh } =
  useQuestionList(
    { search, subjectId, gradeId, type, status, authorId },
    page,
    pageSize,
  )

watch(
  [search, subjectId, gradeId, type, status, authorId],
  () => {
    page.value = 1
  },
  { flush: 'sync' },
)

const activeFiltersCount = computed(
  () =>
    [subjectId, gradeId, type, status, authorId].filter(
      (filter) => filter.value !== 'ALL',
    ).length,
)

function resetFilters() {
  subjectId.value = 'ALL'
  gradeId.value = 'ALL'
  type.value = 'ALL'
  status.value = 'ALL'
  authorId.value = 'ALL'
}

function resetAllFilters() {
  resetFilters()
  search.value = ''
}

function changePageSize(size: number) {
  pageSize.value = size
  page.value = 1
}

function openQuestion(question: QuestionSummary) {
  void router.push(`/bank-soal/${question.id}`)
}

const columns = computed(() =>
  buildQuestionColumns({
    subjectName: store.subjectName,
    gradeName: store.gradeName,
    canUpdate: hasPermission('exam-questions.update'),
    canDelete: hasPermission('exam-questions.delete'),
    canModify: store.canModify,
    onEdit: openQuestion,
    onSubmit: async (question) => {
      if (await examBankService.submitQuestion(question.id)) await refresh()
    },
    onDelete: async (question, { closeAlert, setLoading }) => {
      setLoading(true)
      const done = await examBankService.deleteQuestion(question.id)
      setLoading(false)
      if (done) {
        closeAlert()
        await refresh()
      }
    },
  }),
)

onMounted(async () => {
  await examBankService.loadReferences()
  if (manageAll.value) await examBankService.loadAuthors()
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
          row-clickable
          :columns="columns"
          :data="filtersPending ? [] : questions"
          :page="page"
          :page-size="pageSize"
          :total-items="totalItems"
          :is-loading="loading || filtersPending"
          item-label="soal"
          @update:page="page = $event"
          @update:page-size="changePageSize"
          @row-click="openQuestion"
        >
          <template #header-left>
            <Button
              v-if="hasPermission('exam-questions.create')"
              class="shrink-0"
              @click="router.push('/bank-soal/baru')"
            >
              <Plus class="mr-1.5 size-4" />
              Tambah
            </Button>
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
                  :show-author="manageAll"
                  :show-status="true"
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
            <div class="space-y-3">
              <p>
                {{
                  activeFiltersCount || search
                    ? 'Tidak ada soal yang cocok dengan filter.'
                    : 'Belum ada soal.'
                }}
              </p>
              <Button
                v-if="activeFiltersCount || search"
                variant="outline"
                @click="resetAllFilters"
              >
                Atur Ulang
              </Button>
            </div>
          </template>
        </DataTable>
      </div>
    </Card>

    <Dialog v-model:open="filterOpen">
      <DialogContent size="md">
        <DialogHeader standard>
          <DialogTitle>Filter Soal</DialogTitle>
          <DialogDescription class="sr-only">
            Pilih mapel, tingkat, jenis dan status soal.
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
            :show-author="manageAll"
            :show-status="true"
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
