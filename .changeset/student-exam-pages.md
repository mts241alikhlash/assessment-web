---
'assessment-web': minor
---

Add the student exam pages: `/ujian` lists the exams of the student's
classroom, `/ujian/:scheduleId/token` starts a session with the exam token,
and `/ujian/sesi/:sessionId` is the sheet itself. The sheet renders outside
the app layout, so a student cannot leave the exam through the sidebar; the
timer, question counter and navigation sit inside the question card.

Answers are saved per question through `POST /student-exams/:id/answers` and
the session is submitted with `POST /student-exams/:id/submit`. Questions are
grouped by type in a question-list dialog, with a 10-column grid on phones and
20 on desktop.
