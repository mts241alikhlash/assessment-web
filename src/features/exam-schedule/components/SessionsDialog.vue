<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DataTable } from '@mts241alikhlash/ui'
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
import { Button } from '@mts241alikhlash/ui/button'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@mts241alikhlash/ui/dialog'
import { useAuthSession } from '@/features/platform/auth'
import { examScheduleService } from '../services/examScheduleService'
import type { ScheduleSession } from '../types'
import { buildSessionColumns } from './sessionColumns'

const props = defineProps<{
  open: boolean
  scheduleId: string
  title: string
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const { hasPermission } = useAuthSession()

const sessions = ref<ScheduleSession[]>([])
const total = ref(0)
const error = ref<string | null>(null)
const loading = ref(false)
const releaseTarget = ref<ScheduleSession | null>(null)
const releasing = ref(false)

async function load() {
  loading.value = true
  const result = await examScheduleService.loadSessions(props.scheduleId)
  loading.value = false
  if (result.success) {
    sessions.value = result.data
    total.value = result.total
    error.value = null
  } else {
    sessions.value = []
    total.value = 0
    error.value = result.error
  }
}

async function confirmRelease() {
  const target = releaseTarget.value
  if (!target) return
  releasing.value = true
  const done = await examScheduleService.releaseSession(target.sessionId)
  releasing.value = false
  releaseTarget.value = null
  if (done) await load()
}

const columns = computed(() =>
  buildSessionColumns({
    canRelease: hasPermission('exam-sessions.release'),
    onRelease: (session) => {
      releaseTarget.value = session
    },
  }),
)

watch(
  () => props.open,
  (open) => {
    releaseTarget.value = null
    if (open) void load()
  },
  { immediate: true },
)
</script>

<template>
  <Dialog
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <DialogContent size="xl">
      <DialogHeader standard>
        <DialogTitle>Sesi Ujian</DialogTitle>
        <DialogDescription>{{ title }}</DialogDescription>
      </DialogHeader>
      <DialogBody class="min-h-0 flex-1 overflow-y-auto">
        <p
          v-if="!error && total > sessions.length"
          class="mb-3 rounded-md border p-3 text-[length:var(--text-control,0.75rem)]"
          role="status"
        >
          Menampilkan {{ sessions.length }} dari {{ total }} sesi.
        </p>
        <div
          v-if="error"
          class="space-y-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-[length:var(--text-control,0.75rem)]"
          role="alert"
        >
          <p>{{ error }}</p>
          <Button
            variant="outline"
            @click="load"
          >
            Coba lagi
          </Button>
        </div>
        <DataTable
          v-else
          mobile="cards"
          hide-pagination
          :columns="columns"
          :data="sessions"
          :is-loading="loading"
          item-label="sesi"
        >
          <template #empty>
            <p>Belum ada siswa yang memulai ujian ini.</p>
          </template>
        </DataTable>
      </DialogBody>
      <DialogFooter standard>
        <Button
          variant="outline"
          @click="emit('update:open', false)"
        >
          Tutup
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <AlertDialog
    :open="releaseTarget !== null"
    @update:open="releaseTarget = $event ? releaseTarget : null"
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Lepas sesi ini?</AlertDialogTitle>
        <AlertDialogDescription>
          Perangkat siswa dilepas. Siswa harus masuk lagi dengan token dan
          melanjutkan dari jawaban yang sudah tersimpan; sisa waktunya tidak
          berubah.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="releasing">Batal</AlertDialogCancel>
        <AlertDialogAction
          :disabled="releasing"
          @click.prevent="confirmRelease"
        >
          Lepas
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
