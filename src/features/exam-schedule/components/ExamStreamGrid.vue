<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Hls from 'hls.js'
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
import { examScheduleService } from '../services/examScheduleService'
import type { ScheduleStream } from '../types'
import { isSeatDead } from '../logic/stream'

const props = defineProps<{
  open: boolean
  scheduleId: string
  title: string
}>()

const emit = defineEmits<{ 'update:open': [value: boolean] }>()

const rows = ref<ScheduleStream[]>([])
const error = ref<string | null>(null)
const loading = ref(false)
const now = ref(new Date())

const players = new Map<string, Hls>()
const videoEls = new Map<string, HTMLVideoElement>()

let poll: ReturnType<typeof setInterval> | null = null
let clock: ReturnType<typeof setInterval> | null = null

const ordered = computed(() =>
  [...rows.value].sort((a, b) =>
    (a.studentNis ?? '').localeCompare(b.studentNis ?? ''),
  ),
)

const blockedLabel: Record<NonNullable<ScheduleStream['cameraBlocked']>, string> = {
  network: 'Jaringan bermasalah',
  permission: 'Izin kamera ditolak',
  battery: 'Baterai lemah',
  stopped: 'Dihentikan siswa',
}

function detachPlayers() {
  for (const hls of players.values()) hls.destroy()
  players.clear()
  videoEls.clear()
}

/** hls.js needs a native player; Safari plays the playlist directly. */
function attach(video: HTMLVideoElement | null, url: string | null) {
  if (!video || !url) return
  videoEls.set(url, video)
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url
    return
  }
  if (!Hls.isSupported()) return
  const hls = new Hls({ liveDurationInfinity: true })
  hls.loadSource(url)
  hls.attachMedia(video)
  players.set(url, hls)
}

async function load() {
  loading.value = true
  const result = await examScheduleService.loadStreams(props.scheduleId)
  loading.value = false
  if (result.success) {
    rows.value = result.data
    error.value = null
  } else {
    rows.value = []
    error.value = result.error
  }
}

function stopTimers() {
  if (poll) clearInterval(poll)
  if (clock) clearInterval(clock)
  poll = null
  clock = null
}

watch(
  () => props.open,
  (open) => {
    stopTimers()
    detachPlayers()
    if (!open) return
    void load()
    poll = setInterval(() => void load(), 15_000)
    clock = setInterval(() => {
      now.value = new Date()
    }, 5_000)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  stopTimers()
  detachPlayers()
})
</script>

<template>
  <Dialog
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <DialogContent size="xl">
      <DialogHeader standard>
        <DialogTitle>Kamera Ujian</DialogTitle>
        <DialogDescription>{{ title }}</DialogDescription>
      </DialogHeader>
      <DialogBody class="min-h-0 flex-1 overflow-y-auto">
        <div
          v-if="error"
          class="space-y-3 rounded-md border p-3 text-[length:var(--text-control,0.75rem)]"
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
        <p
          v-else-if="!loading && ordered.length === 0"
          class="text-[length:var(--text-control,0.75rem)]"
        >
          Belum ada siswa yang memulai ujian ini.
        </p>
        <div
          v-else
          class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          <article
            v-for="row in ordered"
            :key="row.sessionId"
            class="overflow-hidden rounded-md border"
          >
            <div class="relative aspect-video bg-black">
              <video
                v-if="row.playbackUrl && !isSeatDead(row.lastSeenAt, now)"
                :ref="(el) => attach(el as HTMLVideoElement | null, row.playbackUrl)"
                class="h-full w-full object-cover"
                autoplay
                muted
                playsinline
              />
              <p
                v-else
                class="flex h-full items-center justify-center text-center text-[length:var(--text-control,0.75rem)] text-white"
                data-testid="seat-dead"
              >
                Kamera mati
              </p>
            </div>
            <div class="space-y-1 p-2 text-[length:var(--text-control,0.75rem)]">
              <p class="font-medium">
                {{ row.studentName ?? row.studentNis ?? row.sessionId }}
              </p>
              <p v-if="row.studentNis">{{ row.studentNis }}</p>
              <p
                v-if="isSeatDead(row.lastSeenAt, now)"
                class="text-red-600"
              >
                {{ row.cameraBlocked ? blockedLabel[row.cameraBlocked] : 'Tidak ada kabar' }}
              </p>
              <p v-if="row.violationCount > 0">
                Keluar aplikasi: {{ row.violationCount }}×
              </p>
            </div>
          </article>
        </div>
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
</template>
