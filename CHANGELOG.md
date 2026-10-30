# assessment-web

## 1.6.0

### Minor Changes

- 893de8f: Match admission-web's shell and page styling: the shared `@mts241alikhlash/ui`
  theme tokens, a fixed top bar with the app switcher and `NavUser`, an inset
  sidebar, the flat list wrapper, and admission's auth and profile screens
  (including the hero images). `profileRoutes` is now registered, so `/profile`
  and `/profile/edit` resolve instead of falling through to the 404 page.
- 4c51871: Add the exam grading and exam score screens. Teachers open Penilaian Ujian to see the exams of their classes with how many students wait for a grade, open an exam to list its students, and grade each short answer and essay (score up to the question points, optional note) next to the question, its grading guide and the student's answer. The last grade closes the session and its score is sent to the assessment. Nilai Ujian lists the exam scores of the classes the teacher teaches. Schedules with sessions lose Batalkan and gain Sesi, a dialog that lists each student with status, score and device and lets staff with exam-sessions.release free the device of a session in progress. Routes /penilaian-ujian and /nilai-ujian, menu items in the Ujian section, gateway prefixes /exam-grading and /exam-scores.
- bf74215: Ujian susulan. Di Jadwal Ujian, jadwal utama punya aksi Susulan: guru memilih siswa kelas yang belum mengerjakan (siswa yang sudah mengikuti, sedang mengerjakan, atau sudah ada di susulan lain ditandai alasannya), mengisi alasan, tanggal, jam, durasi, dan paket, lalu jadwal susulan dibuat dengan token sendiri. Jadwal susulan ditandai "Susulan" di kolom jenis dan punya aksi Peserta yang menampilkan alasan dan status tiap siswa (menunggu, sudah ikut ujian utama, mengerjakan, selesai) dan menghapus siswa yang belum punya sesi. Guru yang mengajar kelasnya juga bisa membuat susulan dan melihat pesertanya dari halaman Penilaian Ujian, tanpa izin jadwal; pilihan paket dibatasi ke mapel dan tingkat yang sama, dan setiap siswa punya alasan dan catatan sendiri.
- eb7bb81: Add the exam package and exam schedule screens: build a package from approved questions of one subject and grade, copy, change and delete a draft, schedule a package for a classroom with a date, times and duration, change or cancel a schedule, and read or replace the access code students enter. Routes /paket-soal and /jadwal-ujian, menu section Ujian, gateway prefixes /exam-packages, /exam-schedules, /exam-sessions, /me/exams and /student-exams (the last two serve the Android exam app through the same gateway).
- 5240e00: A schedule now has a Jenis ujian (Ulangan Harian, Quiz, Tugas, UTS or UAS), chosen in Tambah Jadwal and Ubah Jadwal and locked once students have started. The schedule list and the Penilaian Ujian list show it in a Jenis column. It needs exam-service with the exam type, which rejects a schedule without one.

  The Sesi dialog and the session list of Penilaian Ujian gain a Keluar column with how many times the app reported the student leaving the exam; an exam the app handed in after more than three exits shows 4× or more.

- 70243c0: Questions now live inside a question package. The Bank Soal section is gone. A teacher creates a package for a subject and grade, then builds it on its own page: add a new question, import from Excel or Word, take questions from another approved package (copied, with their origin shown as Baru, Diubah or Salinan), reorder, remove, rename and submit. A reviewer opens Persetujuan Paket, reads every question of a submitted package, leaves a note on any of them, then approves or returns the whole package; the teacher sees the notes on the package and on each question. Schedules offer approved and already scheduled packages. Routes /paket-soal/:id/soal/baru, /paket-soal/:id/soal/:questionId, /paket-soal/:id/impor, /persetujuan-paket and /persetujuan-paket/:id replace /bank-soal.

### Patch Changes

- 11316e1: Keep `@mts241alikhlash/ui` out of the Vite dependency pre-bundle, as admission-web does, so the sidebar context is one module instance in development and the layout no longer fails with `Symbol(SidebarContext) not found`.

## 1.5.0

### Minor Changes

- 318d345: Add the question bank for exams: a question list with filters, an editor with formulas (LaTeX), pictures and Arabic text, an approval queue for the deputy for curriculum, and import from Excel and Word. Adopt `@mts241alikhlash/ui` 1.11.

## 1.4.4

### Patch Changes

- 97bcfa6: Run on Node.js 24.22.1, the release that fixes the October 2026 security issues (Brotli decoder out-of-bounds write, TLS hostname checks, DNS NUL handling). The base image, the CI jobs and the engines range move from 24.21.0 to 24.22.1.

## 1.4.3

### Patch Changes

- 898e6ea: Ejaan Amerika di kode, komentar, dan nama test (`honours` menjadi `honors`, `enrolment` menjadi `enrollment`, dan sejenisnya).

## 1.4.2

### Patch Changes

- 5738f1f: Card, judul, dan isi memakai standar `@mts241alikhlash/ui` 1.8; field form memakai `FloatingField`; footer input kehadiran memakai `CardFooter standard`.

## 1.4.1

### Patch Changes

- 84007fe: The sidebar menu follows permissions only (web-shared 1.2.0), so a visible item always opens, also for the super admin.

## 1.4.0

### Minor Changes

- fbd9360: The profile address editor now selects official administrative regions and saves their codes.

### Patch Changes

- 40c2cec: The Vite dev server pre-bundles the Unovis `striptags` dependency so pages with charts load in the browser. Development only.

## 1.3.0

### Minor Changes

- d2fc0ba: Sub-pages go back with `BackButton` from `@mts241alikhlash/ui` 1.3.1, left of the card title and labelled with where it leads, and breadcrumbs name the record a page is about instead of "Detail" or "Ubah"; long crumbs truncate. Another user's profile gets a back button and their name in the breadcrumb. The profile and address tabs use floating labels with every field tied to its label, including the birth date picker.

### Patch Changes

- d2fc0ba: Badges take `rounded-md` from `@mts241alikhlash/ui` 1.2.1, and the report-card status labels in the table and detail dialog use the same radius.

## 1.2.0

### Minor Changes

- 77a9491: Search fields use `SearchInput` from `@mts241alikhlash/ui` 1.2.0: one icon, height and text size on every list, no zoom on iOS, and `DataTable`'s built-in filter follows it.

## 1.1.0

### Minor Changes

- 9ace99d: Icons come from `@lucide/vue` (replacing the deprecated `lucide-vue-next`), with `@mts241alikhlash/ui` and `web-shared` 1.1.0.

## 1.0.1

### Patch Changes

- 6fd226c: Update @mts241alikhlash/ui to 1.0.1.

## 1.0.0

### Major Changes

- First stable release.
