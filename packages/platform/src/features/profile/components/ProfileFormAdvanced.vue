<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { FormControl, FloatingField } from '@mts241alikhlash/ui/form'
import { Input } from '@mts241alikhlash/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@mts241alikhlash/ui/select'
import {
  religionRefApi as religionApi,
  bloodTypeRefApi as bloodTypeApi,
} from '../api/profileReferenceApi'

const religions = ref<{ id: string; name: string }[]>([])
const bloodTypes = ref<{ id: string; name: string }[]>([])

onMounted(async () => {
  try {
    const [religionRes, bloodTypeRes] = await Promise.all([
      religionApi.getReligions({ limit: 100, isActive: true }),
      bloodTypeApi.getBloodTypes({ limit: 100, isActive: true }),
    ])
    religions.value = religionRes.data?.data ?? []
    bloodTypes.value = bloodTypeRes.data?.data ?? []
  } catch (error) {
    console.error('Gagal memuat data master untuk profil:', error)
  }
})
</script>

<template>
  <div class="grid gap-5 md:grid-cols-2 p-1">
    <FloatingField
      v-slot="{ componentField }"
      name="email"
      label="Email"
    >
      <div class="content-start">
        <FormControl>
          <Input
            type="email"
            maxlength="255"
            v-bind="componentField"
          />
        </FormControl>
      </div>
    </FloatingField>
    <FloatingField
      v-slot="{ componentField }"
      name="phone"
      label="No. Handphone"
    >
      <div class="content-start">
        <FormControl>
          <Input
            maxlength="15"
            v-bind="componentField"
          />
        </FormControl>
      </div>
    </FloatingField>
    <FloatingField
      v-slot="{ value, handleChange }"
      name="bloodTypeId"
      label="Golongan Darah"
    >
      <div class="content-start">
        <Select
          :model-value="value"
          @update:model-value="handleChange"
        >
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih Gol. Darah" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="none"> Tidak Tahu / Kosong </SelectItem>
            <SelectItem
              v-for="bt in bloodTypes"
              :key="bt.id"
              :value="bt.id"
            >
              {{ bt.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FloatingField>
    <FloatingField
      v-slot="{ value, handleChange }"
      name="religionId"
      label="Agama"
    >
      <div class="content-start">
        <Select
          :model-value="value"
          @update:model-value="handleChange"
        >
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih Agama" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="none"> Tidak Diisi / Kosong </SelectItem>
            <SelectItem
              v-for="rel in religions"
              :key="rel.id"
              :value="rel.id"
            >
              {{ rel.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FloatingField>
    <FloatingField
      v-slot="{ value, handleChange }"
      name="maritalStatus"
      label="Status Pernikahan"
    >
      <div class="content-start">
        <Select
          :model-value="value"
          @update:model-value="handleChange"
        >
          <FormControl>
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            <SelectItem value="none"> Tidak Diisi / Kosong </SelectItem>
            <SelectItem value="SINGLE"> Belum Menikah </SelectItem>
            <SelectItem value="MARRIED"> Menikah </SelectItem>
            <SelectItem value="DIVORCED"> Cerai Hidup </SelectItem>
            <SelectItem value="WIDOWED"> Cerai Mati </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </FloatingField>
    <FloatingField
      v-slot="{ componentField }"
      name="kk"
      label="No. Kartu Keluarga (KK)"
    >
      <div class="content-start">
        <FormControl>
          <Input
            maxlength="16"
            v-bind="componentField"
          />
        </FormControl>
      </div>
    </FloatingField>
    <FloatingField
      v-slot="{ componentField }"
      name="npwp"
      label="NPWP"
    >
      <div class="content-start">
        <FormControl>
          <Input
            maxlength="20"
            v-bind="componentField"
          />
        </FormControl>
      </div>
    </FloatingField>
  </div>
</template>
