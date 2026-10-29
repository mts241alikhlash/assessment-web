---
'assessment-web': minor
---

Match admission-web's shell and page styling: the shared `@mts241alikhlash/ui`
theme tokens, a fixed top bar with the app switcher and `NavUser`, an inset
sidebar, the flat list wrapper, and admission's auth and profile screens
(including the hero images). `profileRoutes` is now registered, so `/profile`
and `/profile/edit` resolve instead of falling through to the 404 page.
