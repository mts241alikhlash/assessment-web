---
'assessment-web': patch
---

Keep `@mts241alikhlash/ui` out of the Vite dependency pre-bundle, as admission-web does, so the sidebar context is one module instance in development and the layout no longer fails with `Symbol(SidebarContext) not found`.
