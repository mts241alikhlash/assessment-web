<script setup lang="ts">
import { reactive, watch, useId } from 'vue'
import { Input } from '@mts241alikhlash/ui/input'
import { FloatingLabelField } from '@mts241alikhlash/ui/form'
import { Button } from '@mts241alikhlash/ui/button'
import { Loader2 } from '@lucide/vue'
import { useAddress } from '../composables/useAddress'
import type { AddressData, AddressRecord, AddressSavePayload } from '../types'

const props = defineProps<{
  data: AddressData
  rawAddress?: AddressRecord | null
  isEditable: boolean
}>()

const emit = defineEmits<{
  save: [payload: AddressSavePayload]
}>()

const { isSaving } = useAddress()
const fieldId = useId()

const form = reactive({
  street: '',
  rt: '',
  rw: '',
  village: '',
  district: '',
  city: '',
  province: '',
  country: 'Indonesia',
  postalCode: '',
})

watch(
  () => [props.rawAddress, props.data.address] as const,
  ([rawAddr, dataAddr]) => {
    const addr = rawAddr ?? dataAddr
    if (addr) {
      form.street = addr.street ?? ''
      form.rt = addr.rt ?? ''
      form.rw = addr.rw ?? ''
      form.village = addr.village ?? ''
      form.district = addr.district ?? ''
      form.city = addr.city ?? ''
      form.province = addr.province ?? ''
      form.country = addr.country ?? 'Indonesia'
      form.postalCode = addr.postalCode ?? ''
    }
  },
  { immediate: true },
)

function handleSubmit() {
  if (!props.isEditable) return
  emit('save', {
    street: form.street,
    rt: form.rt === '' ? null : form.rt,
    rw: form.rw === '' ? null : form.rw,
    village: form.village,
    district: form.district,
    city: form.city,
    province: form.province,
    country: form.country,
    postalCode: form.postalCode === '' ? null : form.postalCode,
  })
}
</script>

<template>
  <div class="py-4">
    <form
      class="space-y-4"
      @submit.prevent="handleSubmit"
    >
      <div class="grid gap-5 md:grid-cols-2">
        <FloatingLabelField
          label="Jalan / Dusun"
          :for="`${fieldId}-street`"
          :required="isEditable"
          :floating="!isEditable || !!form.street"
          class="md:col-span-2"
        >
          <Input
            :id="`${fieldId}-street`"
            v-model="form.street"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            required
          />
        </FloatingLabelField>

        <FloatingLabelField
          label="RT"
          :for="`${fieldId}-rt`"
          :floating="!isEditable || !!form.rt"
        >
          <Input
            :id="`${fieldId}-rt`"
            v-model="form.rt"
            maxlength="5"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
          />
        </FloatingLabelField>

        <FloatingLabelField
          label="RW"
          :for="`${fieldId}-rw`"
          :floating="!isEditable || !!form.rw"
        >
          <Input
            :id="`${fieldId}-rw`"
            v-model="form.rw"
            maxlength="5"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
          />
        </FloatingLabelField>

        <FloatingLabelField
          label="Desa / Kelurahan"
          :for="`${fieldId}-village`"
          :required="isEditable"
          :floating="!isEditable || !!form.village"
        >
          <Input
            :id="`${fieldId}-village`"
            v-model="form.village"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            required
          />
        </FloatingLabelField>

        <FloatingLabelField
          label="Kecamatan"
          :for="`${fieldId}-district`"
          :required="isEditable"
          :floating="!isEditable || !!form.district"
        >
          <Input
            :id="`${fieldId}-district`"
            v-model="form.district"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            required
          />
        </FloatingLabelField>

        <FloatingLabelField
          label="Kabupaten / Kota"
          :for="`${fieldId}-city`"
          :required="isEditable"
          :floating="!isEditable || !!form.city"
        >
          <Input
            :id="`${fieldId}-city`"
            v-model="form.city"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            required
          />
        </FloatingLabelField>

        <FloatingLabelField
          label="Provinsi"
          :for="`${fieldId}-province`"
          :required="isEditable"
          :floating="!isEditable || !!form.province"
        >
          <Input
            :id="`${fieldId}-province`"
            v-model="form.province"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
            required
          />
        </FloatingLabelField>

        <FloatingLabelField
          label="Negara"
          :for="`${fieldId}-country`"
          floating
        >
          <Input
            :id="`${fieldId}-country`"
            v-model="form.country"
            disabled
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
          />
        </FloatingLabelField>

        <FloatingLabelField
          label="Kode Pos"
          :for="`${fieldId}-postal-code`"
          :floating="!isEditable || !!form.postalCode"
        >
          <Input
            :id="`${fieldId}-postal-code`"
            v-model="form.postalCode"
            maxlength="10"
            :disabled="!isEditable"
            class="disabled:opacity-100 disabled:bg-muted/20 disabled:cursor-default disabled:text-foreground disabled:border-border/80"
          />
        </FloatingLabelField>
      </div>

      <div
        v-if="isEditable"
        class="flex justify-end gap-3 pt-4"
      >
        <Button
          type="submit"
          :disabled="isSaving"
        >
          <Loader2
            v-if="isSaving"
            class="mr-2 h-4 w-4 animate-spin"
          />
          {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </Button>
      </div>
    </form>
  </div>
</template>
