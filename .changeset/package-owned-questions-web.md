---
'assessment-web': minor
---

Questions now live inside a question package. The Bank Soal section is gone. A teacher creates a package for a subject and grade, then builds it on its own page: add a new question, import from Excel or Word, take questions from another approved package (copied, with their origin shown as Baru, Diubah or Salinan), reorder, remove, rename and submit. A reviewer opens Persetujuan Paket, reads every question of a submitted package, leaves a note on any of them, then approves or returns the whole package; the teacher sees the notes on the package and on each question. Schedules offer approved and already scheduled packages. Routes /paket-soal/:id/soal/baru, /paket-soal/:id/soal/:questionId, /paket-soal/:id/impor, /persetujuan-paket and /persetujuan-paket/:id replace /bank-soal.
