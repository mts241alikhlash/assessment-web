<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authService, authSessionService, useAuthStore } from '../index'
import { authConfig } from '../config'
import { Button } from '@mts241alikhlash/ui/button'

type CallbackState = 'working' | 'unknown-account' | 'outage' | 'incomplete'

const route = useRoute()
const router = useRouter()
const store = useAuthStore()

const state = ref<CallbackState>('working')
const errorMessage = ref('')

const heading = computed(() => {
  switch (state.value) {
    case 'unknown-account':
      return 'Akun belum terdaftar'
    case 'outage':
      return 'Layanan tidak tersedia'
    case 'incomplete':
      return 'Melengkapi data'
    default:
      return 'Menyelesaikan masuk'
  }
})

const description = computed(() => {
  switch (state.value) {
    case 'unknown-account':
      return 'Email Google ini belum terhubung ke akun mana pun. Hubungi admin sekolah untuk didaftarkan lebih dulu.'
    case 'outage':
      return errorMessage.value
    case 'incomplete':
      return 'Akun Anda aktif, tetapi data pendaftaran belum lengkap. Mengalihkan ke formulir.'
    default:
      return 'Mohon tunggu sebentar.'
  }
})

function profileIncompleteFlag(): boolean {
  return route.query.profileIncomplete === 'true'
}

function homeTarget(): string {
  return authConfig.value.homeRoute
}

async function proceed() {
  const restored = await authService.restoreSession()

  if (!restored) {
    state.value = 'outage'
    errorMessage.value =
      'Sesi tidak dapat dipulihkan. Coba masuk lagi atau hubungi admin.'
    return
  }

  if (!store.user) {
    const hydrated = authSessionService.hydrateUser()
    if (hydrated) store.setUser(hydrated)
  }

  const roles = store.user?.roles ?? []
  if (roles.length === 0) {
    state.value = 'unknown-account'
    return
  }

  if (profileIncompleteFlag()) {
    state.value = 'incomplete'
    setTimeout(() => {
      void router.replace(homeTarget())
    }, 1200)
    return
  }

  void router.replace(homeTarget())
}

onMounted(proceed)
</script>

<template>
  <div class="flex min-h-svh items-center justify-center p-6">
    <div
      class="w-full max-w-sm rounded-xl border bg-card p-8 text-center shadow-sm"
    >
      <h1 class="text-lg font-semibold tracking-tight">{{ heading }}</h1>
      <p class="mt-2 text-sm text-muted-foreground text-balance">
        {{ description }}
      </p>

      <div
        v-if="state === 'working' || state === 'incomplete'"
        class="mt-6 flex justify-center"
      >
        <span
          class="size-5 animate-spin rounded-full border-2 border-muted border-t-primary"
          aria-label="Memuat"
        />
      </div>

      <Button
        v-else
        type="button"
        class="mt-6 w-full cursor-pointer"
        @click="router.replace({ name: 'login' })"
      >
        Kembali ke Halaman Masuk
      </Button>
    </div>
  </div>
</template>
