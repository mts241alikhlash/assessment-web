<script setup lang="ts">
import { ref, watch } from 'vue'
import { Badge } from '@mts241alikhlash/ui/badge'
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
import { examBankService } from '../services/examBankService'
import { useExamBankStore } from '../stores/examBankStore'
import type { QuestionDetail } from '../types'
import { typeLabel } from '../types'
import AnswerKey from './AnswerKey.vue'
import QuestionPreview from './QuestionPreview.vue'
import ReturnQuestionDialog from './ReturnQuestionDialog.vue'

const props = defineProps<{ questionId: string | null }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ done: [] }>()

const store = useExamBankStore()
const detail = ref<QuestionDetail | null>(null)
const loading = ref(false)
const busy = ref(false)
const returnOpen = ref(false)

watch(
  () => [open.value, props.questionId] as const,
  async ([isOpen, id]) => {
    if (!isOpen || !id) return
    detail.value = null
    loading.value = true
    detail.value = await examBankService.loadQuestion(id)
    loading.value = false
    if (!detail.value) open.value = false
  },
  { immediate: true },
)

async function approve() {
  if (!detail.value) return
  busy.value = true
  const done = await examBankService.approveQuestion(
    detail.value.id,
    detail.value.revision,
  )
  busy.value = false
  if (done) {
    open.value = false
  }
  emit('done')
}

async function sendBack(note: string) {
  if (!detail.value) return
  busy.value = true
  const done = await examBankService.returnQuestion(
    detail.value.id,
    note,
    detail.value.revision,
  )
  busy.value = false
  if (done) {
    returnOpen.value = false
    open.value = false
  }
  emit('done')
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent size="xl">
      <DialogHeader standard>
        <DialogTitle>Tinjau Soal</DialogTitle>
        <DialogDescription class="sr-only">
          Baca soal dan kunci jawabannya, lalu setujui atau kembalikan.
        </DialogDescription>
      </DialogHeader>
      <DialogBody class="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <p
          v-if="loading || !detail"
          class="text-[length:var(--text-control,0.75rem)] text-muted-foreground"
        >
          Memuat soal…
        </p>
        <template v-else>
          <div
            class="flex flex-wrap items-center gap-2 text-[length:var(--text-control,0.75rem)]"
          >
            <Badge variant="outline">{{ typeLabel(detail.type) }}</Badge>
            <Badge variant="outline">
              {{ store.subjectName(detail.subjectId) }}
            </Badge>
            <Badge variant="outline">
              {{ store.gradeName(detail.gradeId) }}
            </Badge>
            <span class="text-muted-foreground">
              Versi {{ detail.current.number }}
            </span>
          </div>
          <QuestionPreview
            :type="detail.type"
            :body-html="detail.current.bodyHtml"
            :content="detail.current.content"
            :points="detail.current.points"
          />
          <AnswerKey
            :type="detail.type"
            :content="detail.current.content"
          />
        </template>
      </DialogBody>
      <DialogFooter
        standard
        class="justify-between"
      >
        <Button
          type="button"
          variant="outline"
          :disabled="busy || !detail"
          @click="returnOpen = true"
        >
          Kembalikan
        </Button>
        <Button
          type="button"
          :disabled="busy || !detail"
          @click="approve"
        >
          Setujui
        </Button>
      </DialogFooter>
    </DialogContent>
    <ReturnQuestionDialog
      v-model:open="returnOpen"
      :busy="busy"
      @confirm="sendBack"
    />
  </Dialog>
</template>
