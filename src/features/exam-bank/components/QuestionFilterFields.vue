<script setup lang="ts">
import { useId } from 'vue'
import { FloatingLabelField } from '@mts241alikhlash/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@mts241alikhlash/ui/select'
import type { NamedOption, QuestionAuthor } from '../types'
import {
  QUESTION_STATUSES,
  QUESTION_TYPES,
  statusLabel,
  typeLabel,
} from '../types'

defineProps<{
  subjects: NamedOption[]
  grades: NamedOption[]
  authors: QuestionAuthor[]
  showAuthor: boolean
  showStatus: boolean
}>()

const subjectId = defineModel<string>('subjectId', { required: true })
const gradeId = defineModel<string>('gradeId', { required: true })
const type = defineModel<string>('type', { required: true })
const status = defineModel<string>('status', { required: true })
const authorId = defineModel<string>('authorId', { required: true })

const id = useId()
</script>

<template>
  <FloatingLabelField
    label="Mapel"
    :for="`${id}-subject`"
    class="w-fit min-w-28"
    floating
  >
    <Select v-model="subjectId">
      <SelectTrigger
        :id="`${id}-subject`"
        class="w-full"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">Semua</SelectItem>
        <SelectItem
          v-for="subject in subjects"
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
    :for="`${id}-grade`"
    class="w-fit min-w-28"
    floating
  >
    <Select v-model="gradeId">
      <SelectTrigger
        :id="`${id}-grade`"
        class="w-full"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">Semua</SelectItem>
        <SelectItem
          v-for="grade in grades"
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
    :for="`${id}-type`"
    class="w-fit min-w-28"
    floating
  >
    <Select v-model="type">
      <SelectTrigger
        :id="`${id}-type`"
        class="w-full"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">Semua</SelectItem>
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
    v-if="showStatus"
    label="Status"
    :for="`${id}-status`"
    class="w-fit min-w-28"
    floating
  >
    <Select v-model="status">
      <SelectTrigger
        :id="`${id}-status`"
        class="w-full"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">Semua</SelectItem>
        <SelectItem
          v-for="option in QUESTION_STATUSES"
          :key="option"
          :value="option"
        >
          {{ statusLabel(option) }}
        </SelectItem>
      </SelectContent>
    </Select>
  </FloatingLabelField>
  <FloatingLabelField
    v-if="showAuthor"
    label="Penulis"
    :for="`${id}-author`"
    class="w-fit min-w-28"
    floating
  >
    <Select v-model="authorId">
      <SelectTrigger
        :id="`${id}-author`"
        class="w-full"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">Semua</SelectItem>
        <SelectItem
          v-for="author in authors"
          :key="author.id"
          :value="author.id"
        >
          {{ author.name }}
        </SelectItem>
      </SelectContent>
    </Select>
  </FloatingLabelField>
</template>
