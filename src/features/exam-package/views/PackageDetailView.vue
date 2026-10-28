<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BackButton, DataTable } from '@mts241alikhlash/ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
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
  CardHeader,
  CardTitle,
} from '@mts241alikhlash/ui/card'
import { useBreadcrumbs } from '@mts241alikhlash/web-shared/composables/useBreadcrumbs'
import ScheduleFormDialog from '@/features/exam-schedule/components/ScheduleFormDialog.vue'
import { useAuthSession } from '@/features/platform/auth'
import { buildPackageItemColumns } from '../components/packageItemColumns'
import { examPackageService } from '../services/examPackageService'
import { useExamPackageStore } from '../stores/examPackageStore'
import { packageStatusLabel } from '../types'
import type { ExamPackageView } from '../types'

const route = useRoute()
const router = useRouter()
const { hasPermission } = useAuthSession()
const store = useExamPackageStore()

const id = computed(() => String(route.params.id ?? ''))
const pkg = ref<ExamPackageView | null>(null)
const loading = ref(true)
const loadFailed = ref(false)
const deleteOpen = ref(false)
const deleting = ref(false)
const copying = ref(false)
const scheduleOpen = ref(false)

const isDraft = computed(() => pkg.value?.status === 'DRAFT')
const totalPoints = computed(() =>
  (pkg.value?.items ?? []).reduce((sum, item) => sum + item.points, 0),
)
const columns = buildPackageItemColumns()

useBreadcrumbs(() => [
  { title: 'Paket Soal', href: '/paket-soal' },
  { title: pkg.value?.title ?? 'Paket' },
])

async function copy() {
  if (copying.value) return
  copying.value = true
  const copied = await examPackageService.copyPackage(id.value)
  copying.value = false
  if (copied) await router.push(`/paket-soal/${copied.id}`)
}

async function confirmDelete() {
  deleting.value = true
  const done = await examPackageService.deletePackage(id.value)
  deleting.value = false
  if (done) {
    deleteOpen.value = false
    await router.push('/paket-soal')
  }
}

async function load() {
  loading.value = true
  loadFailed.value = false
  deleteOpen.value = false
  scheduleOpen.value = false
  try {
    pkg.value = await examPackageService.loadPackage(id.value)
  } catch {
    pkg.value = null
    loadFailed.value = true
  }
  loading.value = false
}

watch(id, load)

onMounted(async () => {
  await examPackageService.loadReferences()
  await load()
})
</script>

<template>
  <div class="px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
    <Card gap="none">
      <CardHeader standard>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <BackButton
              label="Kembali ke Paket Soal"
              @click="router.push('/paket-soal')"
            />
            <CardTitle size="lg">{{ pkg?.title ?? 'Paket Soal' }}</CardTitle>
          </div>
          <div
            v-if="pkg"
            class="flex flex-wrap gap-2"
          >
            <Button
              v-if="isDraft && hasPermission('exam-packages.update')"
              variant="outline"
              @click="router.push(`/paket-soal/${id}/ubah`)"
            >
              Ubah
            </Button>
            <Button
              v-if="hasPermission('exam-packages.create')"
              variant="outline"
              @click="copy"
            >
              Salin
            </Button>
            <Button
              v-if="isDraft && hasPermission('exam-packages.delete')"
              variant="outline"
              @click="deleteOpen = true"
            >
              Hapus
            </Button>
            <Button
              v-if="hasPermission('exam-schedules.create')"
              @click="scheduleOpen = true"
            >
              Jadwalkan
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent
        variant="standard"
        class="space-y-4"
      >
        <div
          v-if="loadFailed"
          class="space-y-3"
          role="alert"
        >
          <p class="text-[length:var(--text-control,0.75rem)]">
            Paket tidak dapat dimuat.
          </p>
          <Button
            variant="outline"
            @click="load"
          >
            Coba lagi
          </Button>
        </div>
        <p
          v-else-if="!loading && !pkg"
          class="text-[length:var(--text-control,0.75rem)]"
          role="status"
        >
          Paket tidak ditemukan.
        </p>
        <template v-if="pkg">
          <div
            class="flex flex-wrap items-center gap-2 text-[length:var(--text-control,0.75rem)]"
          >
            <Badge variant="outline">{{
              store.subjectName(pkg.subjectId)
            }}</Badge>
            <Badge variant="outline">{{ store.gradeName(pkg.gradeId) }}</Badge>
            <Badge variant="secondary">{{
              packageStatusLabel(pkg.status)
            }}</Badge>
            <span class="text-muted-foreground">
              {{ pkg.items.length }} soal · Total {{ totalPoints }} poin
            </span>
          </div>
          <DataTable
            mobile="cards"
            hide-pagination
            :columns="columns"
            :data="pkg.items"
            :page="1"
            :page-size="Math.max(pkg.items.length, 1)"
            :total-items="pkg.items.length"
            item-label="soal"
          >
            <template #empty>
              <p>Paket ini belum berisi soal.</p>
            </template>
          </DataTable>
        </template>
      </CardContent>
    </Card>

    <ScheduleFormDialog
      v-if="scheduleOpen && pkg"
      v-model:open="scheduleOpen"
      :package-id="pkg.id"
      :package-grade-id="pkg.gradeId"
      :package-title="pkg.title"
      @saved="router.push('/jadwal-ujian')"
    />

    <AlertDialog v-model:open="deleteOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus paket?</AlertDialogTitle>
          <AlertDialogDescription>
            Paket {{ pkg?.title }} dihapus dan tidak muncul lagi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            :disabled="deleting"
            @click="confirmDelete"
          >
            Ya, hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
