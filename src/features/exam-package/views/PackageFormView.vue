<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { BackButton, SearchInput } from '@mts241alikhlash/ui'
import { Button } from '@mts241alikhlash/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@mts241alikhlash/ui/card'
import { FloatingLabelField } from '@mts241alikhlash/ui/form'
import { Input } from '@mts241alikhlash/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@mts241alikhlash/ui/select'
import { useBreadcrumbs } from '@mts241alikhlash/web-shared/composables/useBreadcrumbs'
import { typeLabel } from '@/features/exam-bank/types'
import { useAuthSession } from '@/features/platform/auth'
import { ArrowDown, ArrowUp, Plus, X } from '@lucide/vue'
import { useCandidateList } from '../composables/useCandidateList'
import { usePackageForm } from '../composables/usePackageForm'
import { examPackageService } from '../services/examPackageService'
import { useExamPackageStore } from '../stores/examPackageStore'

const route = useRoute()
const router = useRouter()
const { hasPermission } = useAuthSession()
const store = useExamPackageStore()
const { subjectOptions, gradeOptions } = storeToRefs(store)

const rawId = computed(() => {
  const value = route.params.id
  return typeof value === 'string' && value !== '' ? value : null
})
const isEdit = computed(() => rawId.value !== null)

const form = usePackageForm(
  rawId.value === null ? { mode: 'create' } : { mode: 'edit', id: rawId.value },
)
const { title, subjectId, gradeId, selected, totalPoints } = form

const canPick = computed(() => hasPermission('exam-packages.create'))

const search = ref('')
const page = ref(1)
const candidateList = useCandidateList(subjectId, gradeId, search, page)

watch([subjectId, gradeId, search], () => {
  page.value = 1
})

const lastPage = computed(() =>
  Math.max(
    1,
    Math.ceil(candidateList.totalItems.value / candidateList.pageSize),
  ),
)

const titleId = 'package-title'
const subjectFieldId = 'package-subject'
const gradeFieldId = 'package-grade'

useBreadcrumbs(() => [
  { title: 'Paket Soal', href: '/paket-soal' },
  { title: isEdit.value ? title.value || 'Paket' : 'Paket Baru' },
])

async function save() {
  const saved = await form.submit()
  if (saved) await router.push(`/paket-soal/${saved.id}`)
}

onMounted(async () => {
  await examPackageService.loadReferences()
  await form.load()
})
</script>

<template>
  <div class="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
    <Card gap="none">
      <CardHeader standard>
        <div class="flex items-center gap-3">
          <BackButton
            label="Kembali ke Paket Soal"
            @click="router.push('/paket-soal')"
          />
          <CardTitle size="lg">
            {{ isEdit ? 'Ubah Paket' : 'Tambah Paket' }}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent
        v-if="!form.loading.value"
        variant="standard"
        class="space-y-6"
      >
        <div
          v-if="form.loadError.value"
          class="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-[length:var(--text-control,0.75rem)]"
          role="alert"
        >
          {{ form.loadError.value }}
        </div>
        <template v-else>
          <div
            v-if="form.locked.value"
            class="rounded-md border p-3 text-[length:var(--text-control,0.75rem)]"
            role="status"
          >
            Paket sudah dijadwalkan dan tidak bisa diubah. Salin paket untuk
            membuat versi baru.
          </div>
          <div
            v-if="form.error.value"
            class="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-[length:var(--text-control,0.75rem)]"
            role="alert"
          >
            {{ form.error.value }}
          </div>

          <div class="grid gap-5 sm:grid-cols-3">
            <FloatingLabelField
              label="Judul paket"
              :for="titleId"
              floating
            >
              <Input
                :id="titleId"
                v-model="title"
                :disabled="form.locked.value"
                maxlength="200"
              />
            </FloatingLabelField>
            <template v-if="!isEdit">
              <FloatingLabelField
                label="Mapel"
                :for="subjectFieldId"
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
            </template>
            <p
              v-else
              class="self-center text-[length:var(--text-control,0.75rem)] text-muted-foreground sm:col-span-2"
            >
              {{ store.subjectName(subjectId) }} ·
              {{ store.gradeName(gradeId) }}
            </p>
          </div>

          <div class="grid gap-6 lg:grid-cols-2">
            <section
              v-if="!form.locked.value && canPick"
              class="space-y-3"
            >
              <h2 class="font-medium">Soal Tersedia</h2>
              <p
                v-if="!candidateList.enabled.value"
                class="text-[length:var(--text-control,0.75rem)] text-muted-foreground"
              >
                Pilih mapel dan tingkat dahulu untuk melihat soal yang sudah
                disetujui.
              </p>
              <template v-else>
                <SearchInput
                  v-model="search"
                  label="Cari soal"
                  class="w-full"
                />
                <p
                  v-if="candidateList.error.value"
                  class="text-[length:var(--text-control,0.75rem)]"
                  role="alert"
                >
                  {{ candidateList.error.value }}
                </p>
                <p
                  v-else-if="
                    candidateList.stale.value || candidateList.loading.value
                  "
                  class="text-[length:var(--text-control,0.75rem)] text-muted-foreground"
                >
                  Memuat soal…
                </p>
                <p
                  v-else-if="candidateList.candidates.value.length === 0"
                  class="text-[length:var(--text-control,0.75rem)] text-muted-foreground"
                >
                  Belum ada soal yang disetujui untuk mapel dan tingkat ini.
                </p>
                <ul
                  v-else
                  class="space-y-2"
                >
                  <li
                    v-for="candidate in candidateList.candidates.value"
                    :key="candidate.id"
                    class="flex items-start justify-between gap-3 rounded-md border p-3"
                  >
                    <div class="min-w-0 space-y-1">
                      <p class="text-[length:var(--text-control,0.75rem)]">
                        {{ candidate.summary || '-' }}
                      </p>
                      <p
                        class="text-[length:var(--text-control,0.75rem)] text-muted-foreground"
                      >
                        {{ typeLabel(candidate.type) }} ·
                        {{ candidate.points }} poin
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      :aria-pressed="form.isSelected(candidate.id)"
                      :aria-label="
                        form.isSelected(candidate.id)
                          ? undefined
                          : `Tambahkan ${candidate.summary || 'soal tanpa teks'}`
                      "
                      @click="form.toggle(candidate)"
                    >
                      <template v-if="form.isSelected(candidate.id)">
                        Dipilih
                      </template>
                      <Plus
                        v-else
                        class="size-4"
                      />
                    </Button>
                  </li>
                </ul>
                <div class="flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    :disabled="page <= 1"
                    @click="page -= 1"
                  >
                    Sebelumnya
                  </Button>
                  <span class="text-[length:var(--text-control,0.75rem)]">
                    Halaman {{ page }} dari {{ lastPage }}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    :disabled="page >= lastPage"
                    @click="page += 1"
                  >
                    Berikutnya
                  </Button>
                </div>
              </template>
            </section>
            <p
              v-else-if="!form.locked.value"
              class="text-[length:var(--text-control,0.75rem)] text-muted-foreground"
            >
              Menambah soal membutuhkan izin Tambah Paket.
            </p>

            <section class="space-y-3">
              <h2 class="font-medium">Soal Terpilih ({{ selected.length }})</h2>
              <p
                class="text-[length:var(--text-control,0.75rem)] text-muted-foreground"
              >
                Total {{ totalPoints }} poin
              </p>
              <p
                v-if="selected.length === 0"
                class="text-[length:var(--text-control,0.75rem)] text-muted-foreground"
              >
                Belum ada soal dalam paket ini.
              </p>
              <ol class="space-y-2">
                <li
                  v-for="(item, index) in selected"
                  :key="item.id"
                  class="flex items-start justify-between gap-3 rounded-md border p-3"
                >
                  <div class="min-w-0 space-y-1">
                    <p class="text-[length:var(--text-control,0.75rem)]">
                      {{ index + 1 }}. {{ item.summary || '-' }}
                    </p>
                    <p
                      class="text-[length:var(--text-control,0.75rem)] text-muted-foreground"
                    >
                      {{ typeLabel(item.type) }} · {{ item.points }} poin
                    </p>
                  </div>
                  <div
                    v-if="!form.locked.value"
                    class="flex shrink-0 gap-1"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      aria-label="Naikkan"
                      :disabled="index === 0"
                      @click="form.move(index, -1)"
                    >
                      <ArrowUp class="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      aria-label="Turunkan"
                      :disabled="index === selected.length - 1"
                      @click="form.move(index, 1)"
                    >
                      <ArrowDown class="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      aria-label="Hapus dari paket"
                      @click="form.remove(index)"
                    >
                      <X class="size-4" />
                    </Button>
                  </div>
                </li>
              </ol>
            </section>
          </div>
        </template>
      </CardContent>

      <CardFooter
        v-if="
          !form.loading.value && !form.locked.value && !form.loadError.value
        "
        standard
        class="justify-end"
      >
        <Button
          type="button"
          :disabled="!form.canSubmit.value"
          @click="save"
        >
          {{ form.saving.value ? 'Menyimpan…' : 'Simpan' }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
