<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import { BackButton } from '@mts241alikhlash/ui'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@mts241alikhlash/ui/alert-dialog'
import { Badge } from '@mts241alikhlash/ui/badge'
import { Button } from '@mts241alikhlash/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@mts241alikhlash/ui/card'
import { FloatingLabelField } from '@mts241alikhlash/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@mts241alikhlash/ui/select'
import { useBreadcrumbs } from '@mts241alikhlash/web-shared/composables/useBreadcrumbs'
import { useAuthSession } from '@/features/platform/auth'
import QuestionEditor from '../components/QuestionEditor.vue'
import { examBankService } from '../services/examBankService'
import { useExamBankStore } from '../stores/examBankStore'
import type {
  NamedOption,
  QuestionDetail,
  QuestionDraft,
  QuestionType,
} from '../types'
import { QUESTION_TYPES, statusLabel, typeLabel } from '../types'
import { emptyContent, validateDraft } from '../utils/questionDraft'
import { plainExcerpt } from '../utils/plainText'

const route = useRoute()
const router = useRouter()
const { hasPermission } = useAuthSession()
const store = useExamBankStore()
const { manageAll, subjectOptions } = storeToRefs(store)

const id = computed(() =>
  typeof route.params.id === 'string' ? route.params.id : null,
)
const isEdit = computed(() => id.value !== null)

const subjectId = ref('')
const gradeId = ref('')
const authorId = ref('')
const type = ref<QuestionType>('MULTIPLE_CHOICE')
const draft = ref<QuestionDraft>({
  bodyHtml: '',
  content: emptyContent('MULTIPLE_CHOICE'),
  points: 1,
})
const detail = ref<QuestionDetail | null>(null)
const teachers = ref<NamedOption[]>([])
const saving = ref(false)
const loading = ref(false)
const formError = ref<string | null>(null)
const subjectError = ref<string | undefined>()
const gradeError = ref<string | undefined>()
const warnOpen = ref(false)
const snapshot = ref('')

const subjectFieldId = useId()
const gradeFieldId = useId()
const authorFieldId = useId()
const typeFieldId = useId()

const gradeOptions = computed(() =>
  store.gradeOptionsFor(subjectId.value === '' ? null : subjectId.value),
)
const dirty = computed(() => JSON.stringify(draft.value) !== snapshot.value)
const canUpdate = computed(() => hasPermission('exam-questions.update'))
const canSubmit = computed(
  () =>
    isEdit.value &&
    canUpdate.value &&
    (detail.value?.status === 'DRAFT' || detail.value?.status === 'RETURNED'),
)
const returnNote = computed(() => {
  if (detail.value?.status !== 'RETURNED') return null
  return (
    [...detail.value.reviews].reverse().find((r) => r.action === 'RETURNED')
      ?.note ?? null
  )
})

useBreadcrumbs(() => [
  { title: 'Bank Soal', href: '/bank-soal' },
  {
    title: isEdit.value
      ? plainExcerpt(detail.value?.current.bodyHtml ?? '', 40) || 'Soal'
      : 'Soal Baru',
  },
])

function applyDetail(next: QuestionDetail) {
  detail.value = next
  type.value = next.type
  subjectId.value = next.subjectId
  gradeId.value = next.gradeId
  draft.value = {
    bodyHtml: next.current.bodyHtml,
    content: next.current.content,
    points: next.current.points,
  }
  snapshot.value = JSON.stringify(draft.value)
}

watch(type, (next) => {
  if (!isEdit.value)
    draft.value = { ...draft.value, content: emptyContent(next) }
})

watch(subjectId, async (next) => {
  if (!isEdit.value) {
    if (!gradeOptions.value.some((option) => option.id === gradeId.value)) {
      gradeId.value = ''
    }
    authorId.value = ''
    if (manageAll.value && next) {
      teachers.value = await examBankService.loadTeachers(next)
    }
  }
})

onMounted(async () => {
  loading.value = true
  await examBankService.loadReferences()
  if (id.value) {
    const loaded = await examBankService.loadQuestion(id.value)
    if (loaded) applyDetail(loaded)
    else await router.replace('/bank-soal')
  } else {
    snapshot.value = JSON.stringify(draft.value)
  }
  loading.value = false
})

function validate(): string | null {
  subjectError.value = undefined
  gradeError.value = undefined
  if (!isEdit.value) {
    if (subjectId.value === '') subjectError.value = 'Mapel wajib dipilih'
    if (gradeId.value === '') gradeError.value = 'Tingkat wajib dipilih'
    if (subjectError.value || gradeError.value) {
      return 'Lengkapi mapel dan tingkat dahulu.'
    }
  }
  return validateDraft(
    type.value,
    draft.value.bodyHtml,
    draft.value.content,
    draft.value.points,
  )
}

async function persist() {
  saving.value = true
  formError.value = null
  const body = {
    bodyHtml: draft.value.bodyHtml,
    content: draft.value.content,
    points: draft.value.points,
  }
  if (detail.value) {
    const wasApproved = detail.value.status === 'APPROVED'
    const result = await examBankService.updateQuestion(detail.value.id, body)
    if (result.success) {
      applyDetail(result.data)
      toast.success(
        wasApproved
          ? `Disimpan sebagai versi ${result.data.currentVersion}.`
          : 'Soal disimpan.',
      )
    } else {
      formError.value = result.error
    }
  } else {
    const result = await examBankService.createQuestion({
      subjectId: subjectId.value,
      gradeId: gradeId.value,
      authorEmployeeId: authorId.value || undefined,
      type: type.value,
      ...body,
    })
    if (result.success) {
      toast.success('Soal disimpan sebagai draf.')
      await router.push('/bank-soal')
    } else {
      formError.value = result.error
    }
  }
  saving.value = false
}

async function save() {
  const problem = validate()
  if (problem) {
    formError.value = problem
    return
  }
  if (detail.value?.status === 'APPROVED') {
    warnOpen.value = true
    return
  }
  await persist()
}

async function confirmNewVersion() {
  warnOpen.value = false
  await persist()
}

async function submitForApproval() {
  if (!detail.value) return
  saving.value = true
  if (await examBankService.submitQuestion(detail.value.id)) {
    const fresh = await examBankService.loadQuestion(detail.value.id)
    if (fresh) applyDetail(fresh)
  }
  saving.value = false
}
</script>

<template>
  <div class="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
    <Card gap="none">
      <CardHeader standard>
        <div class="flex items-center gap-3">
          <BackButton
            label="Kembali ke Bank Soal"
            @click="router.push('/bank-soal')"
          />
          <CardTitle size="lg">
            {{ isEdit ? 'Ubah Soal' : 'Tambah Soal' }}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent
        v-if="!loading"
        variant="standard"
        class="space-y-6"
      >
        <div
          v-if="detail"
          class="flex flex-wrap items-center gap-2 text-[length:var(--text-control,0.75rem)]"
        >
          <Badge variant="outline">{{ typeLabel(detail.type) }}</Badge>
          <Badge variant="outline">
            {{ store.subjectName(detail.subjectId) }}
          </Badge>
          <Badge variant="outline">{{ store.gradeName(detail.gradeId) }}</Badge>
          <Badge variant="secondary">{{ statusLabel(detail.status) }}</Badge>
          <span class="text-muted-foreground">
            Versi {{ detail.currentVersion }}
            <template
              v-if="
                detail.approvedVersion !== null &&
                detail.approvedVersion !== detail.currentVersion
              "
            >
              · disetujui versi {{ detail.approvedVersion }}
            </template>
          </span>
        </div>

        <div
          v-if="returnNote"
          class="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-[length:var(--text-control,0.75rem)]"
          role="status"
        >
          <p class="font-medium">Dikembalikan oleh penyetuju</p>
          <p>{{ returnNote }}</p>
        </div>

        <div
          v-if="!isEdit"
          class="grid gap-5 sm:grid-cols-2"
        >
          <FloatingLabelField
            label="Mapel"
            :for="subjectFieldId"
            :error="subjectError"
            floating
          >
            <Select v-model="subjectId">
              <SelectTrigger
                :id="subjectFieldId"
                class="w-full"
              >
                <SelectValue placeholder="Pilih mapel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="subject in subjectOptions"
                  :key="subject.id"
                  :value="subject.id"
                >
                  {{ subject.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FloatingLabelField>
          <FloatingLabelField
            label="Tingkat"
            :for="gradeFieldId"
            :error="gradeError"
            floating
          >
            <Select v-model="gradeId">
              <SelectTrigger
                :id="gradeFieldId"
                class="w-full"
              >
                <SelectValue placeholder="Pilih tingkat" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="grade in gradeOptions"
                  :key="grade.id"
                  :value="grade.id"
                >
                  {{ grade.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FloatingLabelField>
          <FloatingLabelField
            label="Jenis"
            :for="typeFieldId"
            floating
          >
            <Select v-model="type">
              <SelectTrigger
                :id="typeFieldId"
                class="w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in QUESTION_TYPES"
                  :key="option"
                  :value="option"
                >
                  {{ typeLabel(option) }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FloatingLabelField>
          <FloatingLabelField
            v-if="manageAll"
            label="Penulis"
            :for="authorFieldId"
            floating
          >
            <Select v-model="authorId">
              <SelectTrigger
                :id="authorFieldId"
                class="w-full"
              >
                <SelectValue placeholder="Saya sendiri" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="teacher in teachers"
                  :key="teacher.id"
                  :value="teacher.id"
                >
                  {{ teacher.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </FloatingLabelField>
        </div>

        <QuestionEditor
          v-model="draft"
          :type="type"
        />

        <p
          v-if="formError"
          class="text-[length:var(--text-control,0.75rem)] text-destructive"
          role="alert"
        >
          {{ formError }}
        </p>
      </CardContent>

      <CardFooter
        v-if="!loading"
        standard
        class="justify-between"
      >
        <Button
          v-if="canSubmit"
          type="button"
          variant="outline"
          :disabled="saving || dirty"
          :title="dirty ? 'Simpan perubahan dahulu' : undefined"
          @click="submitForApproval"
        >
          Ajukan untuk persetujuan
        </Button>
        <span v-else />
        <Button
          v-if="!isEdit || canUpdate"
          type="button"
          :disabled="saving"
          @click="save"
        >
          {{ saving ? 'Menyimpan…' : 'Simpan' }}
        </Button>
      </CardFooter>
    </Card>

    <AlertDialog v-model:open="warnOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Simpan sebagai versi baru?</AlertDialogTitle>
          <AlertDialogDescription>
            Soal ini sudah disetujui. Perubahan akan menjadi versi baru dan
            perlu disetujui lagi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            variant="outline"
            @click="warnOpen = false"
          >
            Batal
          </Button>
          <Button @click="confirmNewVersion">Simpan versi baru</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
