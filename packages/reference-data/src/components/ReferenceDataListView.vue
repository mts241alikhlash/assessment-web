<script
  setup
  lang="ts"
  generic="
    T extends ReferenceDataEntity,
    TCreate = Record<string, unknown>,
    TUpdate = TCreate
  "
>
import { onMounted, ref } from 'vue'
import { Plus } from 'lucide-vue-next'
import { DataTable } from '@mts241alikhlash/ui'
import { Button } from '@mts241alikhlash/ui/button'
import { Card, CardHeader, CardTitle } from '@mts241alikhlash/ui/card'
import { useReferenceDataCrud } from '../composables/useReferenceDataCrud'
import { buildColumns } from './buildColumns'
import ReferenceDataFormDialog from './ReferenceDataFormDialog.vue'
import type { ReferenceDataConfig, ReferenceDataEntity } from '../types/config'

const props = defineProps<{
  config: ReferenceDataConfig<T, TCreate, TUpdate>
}>()

const { data, isLoading, isSubmitting, fetchAll, create, update, remove } =
  useReferenceDataCrud(props.config)

const isAddOpen = ref(false)
const isEditOpen = ref(false)
const selectedItem = ref<T | null>(null)

function openEdit(item: T) {
  selectedItem.value = { ...item }
  isEditOpen.value = true
}

async function handleAddSave(payload: Record<string, unknown>) {
  const success = await create(payload as TCreate)
  if (success) isAddOpen.value = false
}

async function handleEditSave(payload: Record<string, unknown>) {
  if (!selectedItem.value) return
  const success = await update(selectedItem.value.id, payload as TUpdate)
  if (success) isEditOpen.value = false
}

const columns = buildColumns(props.config, openEdit, (item, callbacks) => {
  void remove(item, callbacks)
})

const firstTextFieldKey = props.config.fields.find(
  (f) => f.kind === 'text',
)?.key

onMounted(() => {
  void fetchAll()
})
</script>

<template>
  <Card
    class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4"
  >
    <CardHeader
      class="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b px-6 py-5 gap-4"
    >
      <CardTitle class="text-2xl font-bold tracking-tight">
        {{ config.entityLabel.plural }}
      </CardTitle>
      <Button
        v-if="config.permissions.canCreate"
        class="w-full sm:w-auto"
        @click="isAddOpen = true"
      >
        <Plus class="mr-2 h-4 w-4" /> Tambah {{ config.entityLabel.singular }}
      </Button>
    </CardHeader>

    <div class="p-6">
      <DataTable
        :columns="columns"
        :data="data as T[]"
        :is-loading="isLoading"
        :item-label="config.entityLabel.plural.toLowerCase()"
        :filter-column="firstTextFieldKey"
        :filter-placeholder="`Cari ${config.entityLabel.plural.toLowerCase()}...`"
      />
    </div>
  </Card>

  <ReferenceDataFormDialog
    v-if="config.permissions.canCreate"
    v-model:open="isAddOpen"
    :fields="config.fields"
    :entity-label="config.entityLabel"
    :is-submitting="isSubmitting"
    @save="handleAddSave"
  />

  <ReferenceDataFormDialog
    v-if="config.permissions.canUpdate"
    v-model:open="isEditOpen"
    :fields="config.fields"
    :entity-label="config.entityLabel"
    :is-submitting="isSubmitting"
    :initial-data="selectedItem"
    @save="handleEditSave"
  />
</template>
