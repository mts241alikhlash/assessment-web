<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLoginForm } from '../composables/useLoginForm'
import { cn } from '@mts241alikhlash/web-shared/utils/utils'
import { Button } from '@mts241alikhlash/ui/button'
import { Input } from '@mts241alikhlash/ui/input'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@mts241alikhlash/ui/form'
import { Eye, EyeOff } from 'lucide-vue-next'

import { authConfig } from '../config'
import { authApi } from '../api/authApi'

const props = defineProps<{
  class?: string
}>()

const { isSubmitting, errorMessage, onSubmit } = useLoginForm()

const showPassword = ref(false)

function startGoogleSignIn() {
  window.location.href = authApi.googleStartUrl(window.location.origin)
}
const loginTitle = computed(() => authConfig.value.loginTitle)
</script>

<template>
  <form
    :class="cn('flex flex-col gap-6', props.class)"
    @submit.prevent="onSubmit"
  >
    <div class="flex flex-col gap-6">
      <div class="flex flex-col items-center gap-1 text-center">
        <h1 class="text-2xl font-bold">{{ loginTitle }}</h1>
        <p class="text-muted-foreground text-sm text-balance">
          Masukkan kredensial Anda untuk melanjutkan
        </p>
      </div>
      <FormField
        v-slot="{ componentField }"
        name="identifier"
      >
        <FormItem>
          <FormLabel for="identifier"> ID Pengguna </FormLabel>
          <FormControl>
            <Input
              id="identifier"
              type="text"
              placeholder="NIS / NIP / No. HP / Username"
              v-bind="componentField"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField
        v-slot="{ componentField }"
        name="password"
      >
        <FormItem>
          <FormLabel for="password"> Password </FormLabel>
          <FormControl>
            <div class="relative">
              <Input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Kata sandi"
                class="pr-10"
                v-bind="componentField"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm text-muted-foreground hover:text-foreground cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                :aria-label="
                  showPassword
                    ? 'Sembunyikan kata sandi'
                    : 'Tampilkan kata sandi'
                "
                :aria-pressed="showPassword"
                @click="showPassword = !showPassword"
              >
                <component
                  :is="showPassword ? EyeOff : Eye"
                  class="size-4"
                />
              </button>
            </div>
          </FormControl>
          <div class="flex justify-end mt-1">
            <router-link
              to="/forgot-password"
              class="text-xs text-primary font-semibold hover:underline"
            >
              Lupa Password?
            </router-link>
          </div>
          <FormMessage />
        </FormItem>
      </FormField>
      <Button
        type="submit"
        :disabled="isSubmitting"
        class="w-full cursor-pointer"
      >
        {{ isSubmitting ? 'Memproses...' : 'Masuk' }}
      </Button>
      <div class="flex items-center gap-3">
        <span class="h-px flex-1 bg-border" />
        <span class="text-xs text-muted-foreground">atau</span>
        <span class="h-px flex-1 bg-border" />
      </div>
      <Button
        type="button"
        variant="outline"
        class="w-full cursor-pointer"
        :disabled="isSubmitting"
        @click="startGoogleSignIn"
      >
        <svg
          class="size-4 mr-1.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
          />
        </svg>
        Masuk dengan Google
      </Button>
      <p
        v-if="errorMessage"
        class="text-center text-sm text-destructive"
      >
        {{ errorMessage }}
      </p>
    </div>
  </form>
</template>
