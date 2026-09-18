import { useAuthStore } from '../stores/authStore'
import { computed } from 'vue'

export function useRoleGuard() {
  const authStore = useAuthStore()
  const userRoles = computed(() => authStore.user?.roles ?? [])
  const userPermissions = computed(() => authStore.user?.permissions ?? [])

  const isSuperAdmin = computed(() => userRoles.value.includes('SUPER_ADMIN'))

  function can(...permissions: string[]): boolean {
    if (isSuperAdmin.value) return true
    return permissions.some((p) => userPermissions.value.includes(p))
  }

  return {
    userRoles,
    userPermissions,
    isSuperAdmin,
    can,
  }
}
