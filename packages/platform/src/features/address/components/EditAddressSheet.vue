<script setup lang="ts">
import { useAddressForm } from '../composables/useAddressForm'
import { Button } from '@mts241alikhlash/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@mts241alikhlash/ui/sheet'
import { FormControl, FloatingField } from '@mts241alikhlash/ui/form'
import { Input } from '@mts241alikhlash/ui/input'
import { ScrollArea } from '@mts241alikhlash/ui/scroll-area'
import RegionSelect from './RegionSelect.vue'
import { useAddress } from '../composables/useAddress'
import type { EditAddressProps } from '../types'

const props = defineProps<EditAddressProps>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  reload: []
}>()

const { isSaving, saveAddress } = useAddress()

const {
  open,
  existingAddress,
  onSubmit,
  regionCodes,
  regionErrors,
  setRegionCodes,
  setRegionNames,
} = useAddressForm({
  props,
  emit,
  saveAddress,
})
</script>

<template>
  <Sheet v-model:open="open">
    <SheetContent
      class="w-full sm:max-w-xl md:max-w-xl lg:max-w-xl flex flex-col gap-0 border-l p-0"
    >
      <form
        class="flex flex-col h-full"
        @submit.prevent="onSubmit"
      >
        <SheetHeader class="px-6 py-6 border-b shrink-0">
          <SheetTitle class="text-xl">
            {{ existingAddress ? 'Ubah Alamat' : 'Tambah Alamat' }}
          </SheetTitle>
          <SheetDescription>
            Masukkan atau perbarui data alamat tempat tinggal Anda saat ini
            dengan lengkap dan valid.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea class="flex-1 min-h-0">
          <div class="p-6">
            <div class="grid gap-5 md:grid-cols-2">
              <FloatingField
                v-slot="{ componentField }"
                name="street"
                label="Jalan / Dusun"
                required
              >
                <div class="md:col-span-2 content-start">
                  <FormControl>
                    <Input v-bind="componentField" />
                  </FormControl>
                </div>
              </FloatingField>

              <FloatingField
                v-slot="{ componentField }"
                name="rt"
                label="RT"
              >
                <div class="content-start">
                  <FormControl>
                    <Input
                      maxlength="5"
                      v-bind="componentField"
                    />
                  </FormControl>
                </div>
              </FloatingField>

              <FloatingField
                v-slot="{ componentField }"
                name="rw"
                label="RW"
              >
                <div class="content-start">
                  <FormControl>
                    <Input
                      maxlength="5"
                      v-bind="componentField"
                    />
                  </FormControl>
                </div>
              </FloatingField>

              <div class="md:col-span-2">
                <RegionSelect
                  :model-value="regionCodes"
                  :errors="regionErrors"
                  @update:model-value="setRegionCodes"
                  @update:names="setRegionNames"
                />
              </div>

              <FloatingField
                v-slot="{ componentField }"
                name="country"
                label="Negara"
                required
              >
                <div class="content-start">
                  <FormControl>
                    <Input
                      disabled
                      v-bind="componentField"
                    />
                  </FormControl>
                </div>
              </FloatingField>

              <FloatingField
                v-slot="{ componentField }"
                name="postalCode"
                label="Kode Pos"
              >
                <div class="content-start">
                  <FormControl>
                    <Input
                      maxlength="10"
                      v-bind="componentField"
                    />
                  </FormControl>
                </div>
              </FloatingField>
            </div>
          </div>
        </ScrollArea>

        <SheetFooter
          class="px-6 py-4 border-t shrink-0 flex gap-2 sm:justify-end w-full bg-background relative mt-auto"
        >
          <Button
            type="button"
            variant="outline"
            :disabled="isSaving"
            @click="open = false"
          >
            Batal
          </Button>
          <Button
            type="submit"
            variant="default"
            :disabled="isSaving"
          >
            {{
              isSaving
                ? 'Menyimpan...'
                : existingAddress
                  ? 'Simpan Perubahan'
                  : 'Tambah Alamat'
            }}
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>
