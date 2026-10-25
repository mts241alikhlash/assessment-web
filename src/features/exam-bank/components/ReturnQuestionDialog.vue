<script setup lang="ts">
import { ref, useId, watch } from 'vue'
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
import { FloatingLabelField } from '@mts241alikhlash/ui/form'
import { Textarea } from '@mts241alikhlash/ui/textarea'

defineProps<{ busy: boolean }>()
const open = defineModel<boolean>('open', { required: true })
const emit = defineEmits<{ confirm: [note: string] }>()

const MAX_NOTE = 1000

const note = ref('')
const error = ref<string | undefined>()
const fieldId = useId()

watch(open, (isOpen) => {
  if (isOpen) {
    note.value = ''
    error.value = undefined
  }
})

function confirm() {
  const text = note.value.trim()
  if (text === '') {
    error.value = 'Catatan wajib diisi'
    return
  }
  if (text.length > MAX_NOTE) {
    error.value = `Catatan paling banyak ${MAX_NOTE} karakter`
    return
  }
  emit('confirm', text)
}
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent size="md">
      <DialogHeader standard>
        <DialogTitle>Kembalikan Soal</DialogTitle>
        <DialogDescription class="sr-only">
          Tulis catatan perbaikan untuk penulis soal.
        </DialogDescription>
      </DialogHeader>
      <DialogBody>
        <FloatingLabelField
          label="Catatan untuk penulis"
          :for="fieldId"
          :error="error"
          floating
        >
          <Textarea
            :id="fieldId"
            v-model="note"
            rows="4"
            :maxlength="MAX_NOTE"
            class="resize-none"
          />
        </FloatingLabelField>
      </DialogBody>
      <DialogFooter
        standard
        class="justify-between"
      >
        <Button
          type="button"
          variant="outline"
          :disabled="busy"
          @click="open = false"
        >
          Batal
        </Button>
        <Button
          type="button"
          :disabled="busy"
          @click="confirm"
        >
          Kembalikan
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
