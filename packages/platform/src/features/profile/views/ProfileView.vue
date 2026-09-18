<script setup lang="ts">
import { onMounted, computed, unref, ref } from 'vue'
import { Card } from '@mts241alikhlash/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@mts241alikhlash/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@mts241alikhlash/ui/tabs'
import { Button } from '@mts241alikhlash/ui/button'
import { Camera, Loader2, Trash2 } from 'lucide-vue-next'
import { Avatar, AvatarImage, AvatarFallback } from '@mts241alikhlash/ui/avatar'

import PersonalInfoTab from '../components/PersonalInfoTab.vue'
import SchoolIdentityCard from '../components/SchoolIdentityCard.vue'
import ProfileSheets from '../components/ProfileSheets.vue'
import ChangePasswordSection from '../components/ChangePasswordSection.vue'

import {
  AddressInfoTab,
  useAddress,
  type AddressSavePayload,
} from '@/features/platform/address'
import { useProfileView } from '../composables/useProfileView'
import { profileConfig } from '../config'

const {
  activeTab,
  showEditProfile,
  showEditAddress,
  loading,
  profileData,
  rawProfile,
  isSaving,
  isAdmin,
  isEditable,
  initials,
  profileSubtitle,
  avatarUrl,
  isOwnProfile,
  isUploadingPhoto,
  getUserId,
  actionConfig,
  reloadProfile,
  handleActionClick,
  handleUpdateProfile,
  handlePhotoChange,
  handlePhotoDelete,
} = useProfileView()

const { saveAddress } = useAddress()

const handleUpdateAddress = async (payload: AddressSavePayload) => {
  const addressId = rawProfile.value?.address?.id
  const isCreate = !addressId
  const { success } = await saveAddress(payload, isCreate, addressId)
  if (success) {
    reloadProfile()
  }
}

const photoInput = ref<HTMLInputElement | null>(null)

async function onPhotoPicked(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (file) await handlePhotoChange(file)
}

const activeTabLabel = computed(() => {
  if (activeTab.value === 'personal') return 'Data Diri'
  if (activeTab.value === 'address') return 'Alamat'
  if (activeTab.value === 'security') return 'Keamanan'

  const extraTab = profileConfig.value.extraTabs.find(
    (tab) => tab.value === activeTab.value,
  )
  return extraTab ? extraTab.label : 'Profil Pengguna'
})

const hasExtraAction = computed(() => {
  const extraTab = profileConfig.value.extraTabs.find(
    (tab) => tab.value === activeTab.value,
  )
  return !!extraTab?.actionConfig
})

onMounted(() => {
  reloadProfile()
})
</script>

<template>
  <div class="p-4 md:p-6 lg:p-8">
    <div
      v-if="loading"
      class="flex items-center justify-center min-h-[500px] rounded-2xl bg-card shadow-sm shadow-black/5 ring-1 ring-black/4"
    >
      <div class="flex flex-col items-center gap-3">
        <Loader2 class="size-8 animate-spin text-muted-foreground" />
        <p class="text-sm text-muted-foreground">Memuat data profil...</p>
      </div>
    </div>

    <Card
      v-else-if="profileData"
      class="overflow-hidden rounded-2xl shadow-sm shadow-black/5 ring-1 ring-black/4 bg-card border-none lg:h-[530px] flex flex-col"
    >
      <Tabs
        v-model="activeTab"
        class="w-full lg:h-full lg:flex lg:flex-col"
      >
        <div class="grid grid-cols-1 lg:grid-cols-4 lg:h-full lg:min-h-0">
          <div
            class="lg:col-span-1 p-6 lg:border-r border-border/60 flex flex-col gap-6 lg:h-full lg:min-h-0"
          >
            <div class="flex flex-col items-center text-center shrink-0">
              <div class="relative shrink-0 mb-4">
                <Avatar class="size-24 border-2 border-primary/20">
                  <AvatarImage
                    v-if="avatarUrl"
                    :src="avatarUrl"
                    :alt="profileData.fullName"
                  />
                  <AvatarFallback
                    class="bg-primary/10 text-2xl font-bold text-primary"
                  >
                    {{ initials }}
                  </AvatarFallback>
                </Avatar>

                <template v-if="isOwnProfile">
                  <input
                    ref="photoInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    class="hidden"
                    @change="onPhotoPicked"
                  />
                  <button
                    type="button"
                    :title="avatarUrl ? 'Ganti foto' : 'Unggah foto'"
                    :disabled="isUploadingPhoto"
                    class="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer"
                    @click="photoInput?.click()"
                  >
                    <Loader2
                      v-if="isUploadingPhoto"
                      class="size-4 animate-spin"
                    />
                    <Camera
                      v-else
                      class="size-4"
                    />
                  </button>
                  <button
                    v-if="avatarUrl && !isUploadingPhoto"
                    type="button"
                    title="Hapus foto"
                    class="absolute -bottom-1 -left-1 flex size-8 items-center justify-center rounded-full border-2 border-background bg-destructive text-destructive-foreground shadow-sm transition-opacity hover:opacity-90 cursor-pointer"
                    @click="handlePhotoDelete"
                  >
                    <Trash2 class="size-4" />
                  </button>
                </template>
              </div>

              <h2 class="text-xl font-bold text-foreground line-clamp-2">
                {{ profileData.fullName || '-' }}
              </h2>
              <p class="text-xs font-medium text-muted-foreground mt-1">
                {{ profileSubtitle }}
              </p>
            </div>

            <div class="lg:hidden w-full shrink-0">
              <Select v-model="activeTab">
                <SelectTrigger class="w-full">
                  <SelectValue placeholder="Pilih Tab" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="personal"> Data Diri </SelectItem>
                    <template
                      v-for="tab in profileConfig.extraTabs"
                      :key="tab.value"
                    >
                      <SelectItem
                        v-if="!tab.show || tab.show(profileData.roles ?? [])"
                        :value="tab.value"
                      >
                        {{ tab.label }}
                      </SelectItem>
                    </template>
                    <SelectItem value="address"> Alamat </SelectItem>
                    <SelectItem value="security"> Keamanan </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <TabsList
              class="hidden lg:flex flex-col gap-1 w-full bg-transparent border-0 h-auto p-0 flex-1 overflow-y-auto min-h-0 pr-1 select-none items-stretch justify-start [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
            >
              <TabsTrigger
                value="personal"
                class="justify-start px-3 py-2 h-9 text-left w-full border-0 rounded-md bg-transparent text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=active]:bg-sidebar-accent data-[state=active]:font-medium data-[state=active]:text-sidebar-accent-foreground shadow-none data-[state=active]:shadow-none transition-all duration-200 cursor-pointer"
              >
                Data Diri
              </TabsTrigger>
              <template
                v-for="tab in profileConfig.extraTabs"
                :key="tab.value"
              >
                <TabsTrigger
                  v-if="!tab.show || tab.show(profileData.roles ?? [])"
                  :value="tab.value"
                  class="justify-start px-3 py-2 h-9 text-left w-full border-0 rounded-md bg-transparent text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=active]:bg-sidebar-accent data-[state=active]:font-medium data-[state=active]:text-sidebar-accent-foreground shadow-none data-[state=active]:shadow-none transition-all duration-200 cursor-pointer"
                >
                  {{ tab.label }}
                </TabsTrigger>
              </template>
              <TabsTrigger
                value="address"
                class="justify-start px-3 py-2 h-9 text-left w-full border-0 rounded-md bg-transparent text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=active]:bg-sidebar-accent data-[state=active]:font-medium data-[state=active]:text-sidebar-accent-foreground shadow-none data-[state=active]:shadow-none transition-all duration-200 cursor-pointer"
              >
                Alamat
              </TabsTrigger>
              <TabsTrigger
                value="security"
                class="justify-start px-3 py-2 h-9 text-left w-full border-0 rounded-md bg-transparent text-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=active]:bg-sidebar-accent data-[state=active]:font-medium data-[state=active]:text-sidebar-accent-foreground shadow-none data-[state=active]:shadow-none transition-all duration-200 cursor-pointer"
              >
                Keamanan
              </TabsTrigger>
            </TabsList>
          </div>

          <div class="lg:col-span-3 flex flex-col lg:h-full lg:min-h-0">
            <div
              class="px-6 py-3.5 border-b border-border/60 shrink-0 flex items-center justify-between"
            >
              <h3 class="text-lg font-bold tracking-tight text-foreground">
                {{ activeTabLabel }}
              </h3>
              <Button
                v-if="isEditable && hasExtraAction"
                size="sm"
                class="h-8 gap-1.5 cursor-pointer text-xs"
                @click="handleActionClick(activeTab)"
              >
                <component
                  :is="actionConfig.icon"
                  class="size-3.5"
                />
                {{ actionConfig.text }}
              </Button>
            </div>

            <div
              class="p-6 lg:p-6 lg:pt-1 flex-1 lg:overflow-y-auto lg:min-h-0"
            >
              <TabsContent
                value="personal"
                class="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in-50 duration-200"
              >
                <PersonalInfoTab
                  :data="profileData"
                  :raw-profile="rawProfile"
                  :is-editable="isEditable"
                  :is-saving="isSaving"
                  @save="handleUpdateProfile"
                />

                <SchoolIdentityCard
                  v-if="profileData.schoolIdentity"
                  :data="profileData.schoolIdentity"
                  class="mt-6"
                />
              </TabsContent>

              <template
                v-for="tab in profileConfig.extraTabs"
                :key="tab.value"
              >
                <TabsContent
                  v-if="!tab.show || tab.show(profileData.roles ?? [])"
                  :value="tab.value"
                  class="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in-50 duration-200"
                >
                  <component
                    :is="tab.component"
                    v-bind="
                      tab.props
                        ? tab.props({
                            profileData: unref(profileData),
                            rawProfile: unref(rawProfile),
                            isAdmin,
                            reloadProfile,
                          })
                        : { data: profileData }
                    "
                    :is-editable="isEditable"
                    @reload="reloadProfile"
                  />
                </TabsContent>
              </template>

              <TabsContent
                value="address"
                class="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in-50 duration-200"
              >
                <AddressInfoTab
                  :data="profileData"
                  :raw-address="rawProfile?.address"
                  :is-editable="isEditable"
                  @save="handleUpdateAddress"
                />
              </TabsContent>

              <TabsContent
                value="security"
                class="mt-0 focus-visible:outline-none focus-visible:ring-0 animate-in fade-in-50 duration-200"
              >
                <ChangePasswordSection />
              </TabsContent>
            </div>
          </div>
        </div>
      </Tabs>
    </Card>
  </div>

  <ProfileSheets
    v-model:show-edit-profile="showEditProfile"
    v-model:show-edit-address="showEditAddress"
    :raw-profile="rawProfile"
    :profile-data="profileData"
    :is-saving="isSaving"
    :user-id="getUserId"
    @save-profile="handleUpdateProfile"
    @reload="reloadProfile"
  />

  <component
    :is="sheet.component"
    v-for="(sheet, i) in profileConfig.extraSheets"
    :key="i"
    v-bind="
      sheet.props({
        userId: getUserId,
        rawProfile: unref(rawProfile),
        profileData: unref(profileData),
        reloadProfile,
        isAdmin,
      })
    "
  />
</template>
