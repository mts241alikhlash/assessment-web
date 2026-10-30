const KEY = 'cbt:device-id'

/**
 * Identitas perangkat untuk sesi ujian. Server mengikat sesi ke deviceId, jadi
 * nilainya harus stabil di satu browser. localStorage dipilih karena Safari
 * mode privat sekalipun masih menyimpannya selama tab hidup.
 */
export function deviceId(): string {
  try {
    const existing = window.localStorage.getItem(KEY)
    if (existing) return existing
    const created = crypto.randomUUID()
    window.localStorage.setItem(KEY, created)
    return created
  } catch {
    // Storage diblokir: pakai id per-tab supaya ujian tetap bisa dimulai.
    return `ephemeral-${crypto.randomUUID()}`
  }
}
