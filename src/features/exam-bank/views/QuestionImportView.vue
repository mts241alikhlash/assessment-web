<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Download } from '@lucide/vue'
import { BackButton, FileDropzone } from '@mts241alikhlash/ui'
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
import { examBankService } from '../services/examBankService'
import { useExamBankStore } from '../stores/examBankStore'
import type { ImportResult, NamedOption } from '../types'

const MAX_BYTES = 10 * 1024 * 1024

const router = useRouter()
const store = useExamBankStore()
const { manageAll, subjectOptions } = storeToRefs(store)

const subjectId = ref('')
const gradeId = ref('')
const authorId = ref('')
const file = ref<File | null>(null)
const teachers = ref<NamedOption[]>([])
const importing = ref(false)
const problem = ref<string | null>(null)
const subjectError = ref<string | undefined>()
const gradeError = ref<string | undefined>()
const result = ref<ImportResult | null>(null)

const subjectFieldId = useId()
const gradeFieldId = useId()
const authorFieldId = useId()

const gradeOptions = computed(() =>
  store.gradeOptionsFor(subjectId.value === '' ? null : subjectId.value),
)

watch(subjectId, async (next) => {
  if (!gradeOptions.value.some((option) => option.id === gradeId.value)) {
    gradeId.value = ''
  }
  authorId.value = ''
  if (manageAll.value && next) {
    teachers.value = await examBankService.loadTeachers(next)
  }
})

function pickFile(event: Event) {
  const chosen = (event.target as HTMLInputElement).files?.[0] ?? null
  problem.value = null
  result.value = null
  if (!chosen) return
  if (!/\.(xlsx|docx)$/i.test(chosen.name)) {
    problem.value = 'Berkas harus .xlsx atau .docx.'
    return
  }
  if (chosen.size > MAX_BYTES) {
    problem.value = 'Ukuran berkas maksimal 10 MB.'
    return
  }
  file.value = chosen
}

async function submit() {
  subjectError.value =
    subjectId.value === '' ? 'Mapel wajib dipilih' : undefined
  gradeError.value = gradeId.value === '' ? 'Tingkat wajib dipilih' : undefined
  if (subjectError.value || gradeError.value) return
  if (!file.value) {
    problem.value = 'Pilih berkas Excel atau Word dahulu.'
    return
  }

  importing.value = true
  problem.value = null
  result.value = null
  const response = await examBankService.importQuestions({
    file: file.value,
    subjectId: subjectId.value,
    gradeId: gradeId.value,
    authorEmployeeId: authorId.value || undefined,
  })
  importing.value = false
  if (response.success) {
    result.value = response.data
    file.value = null
  } else {
    problem.value = response.error
  }
}

function showDrafts() {
  void router.push({
    path: '/bank-soal',
    query: {
      status: 'DRAFT',
      subjectId: subjectId.value,
      gradeId: gradeId.value,
    },
  })
}

onMounted(() => examBankService.loadReferences())
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
          <CardTitle size="lg">Impor Soal</CardTitle>
        </div>
      </CardHeader>
      <CardContent
        variant="standard"
        class="space-y-6"
      >
        <div class="grid gap-5 sm:grid-cols-2">
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

        <div class="space-y-2">
          <p
            class="text-[length:var(--text-control,0.75rem)] text-muted-foreground"
          >
            Unduh template, isi soalnya, lalu unggah. Semua soal masuk sebagai
            draf dan perlu diajukan untuk disetujui.
          </p>
          <div class="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              @click="examBankService.downloadTemplate('xlsx')"
            >
              <Download class="mr-1.5 size-4" />
              Template Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              @click="examBankService.downloadTemplate('docx')"
            >
              <Download class="mr-1.5 size-4" />
              Template Word
            </Button>
          </div>
        </div>

        <FileDropzone
          accept=".xlsx,.docx"
          :file-name="file?.name"
          clearable
          :invalid="problem !== null"
          aria-label="Pilih berkas soal"
          hint="Excel (.xlsx) atau Word (.docx), maks. 10 MB"
          @change="pickFile"
          @clear="file = null"
        />
        <p
          v-if="problem"
          class="text-[length:var(--text-control,0.75rem)] text-destructive"
          role="alert"
        >
          {{ problem }}
        </p>

        <div
          v-if="result"
          class="space-y-3 rounded-md border p-4"
          role="status"
          data-testid="import-result"
        >
          <p class="font-medium">
            {{ result.created }} soal dibuat sebagai draf
            <template v-if="result.errors.length > 0">
              , {{ result.errors.length }} baris gagal
            </template>
          </p>
          <ul
            v-if="result.errors.length > 0"
            class="space-y-1 text-[length:var(--text-control,0.75rem)]"
          >
            <li
              v-for="error in result.errors"
              :key="`${error.row}-${error.reason}`"
              data-testid="import-error"
            >
              Baris {{ error.row }}: {{ error.reason }}
            </li>
          </ul>
          <Button
            v-if="result.created > 0"
            type="button"
            variant="outline"
            @click="showDrafts"
          >
            Lihat soal yang dibuat
          </Button>
        </div>
      </CardContent>
      <CardFooter
        standard
        class="justify-end"
      >
        <Button
          type="button"
          :disabled="importing || !file"
          @click="submit"
        >
          {{ importing ? 'Mengimpor…' : 'Impor' }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
