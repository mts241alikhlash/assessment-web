import { ref } from 'vue'

export const authConfig = ref({
  appKey: 'ACADEMIC',
  appTitle: '241 Apps',
  appSubtitle: 'Sistem Informasi Akademik',
  logoAlt: '241 Apps Logo',
  loginTitle: 'Masuk ke 241 Apps',
  homeRoute: '/',
})

export function configureAuth(config: Partial<typeof authConfig.value>) {
  authConfig.value = { ...authConfig.value, ...config }
}
