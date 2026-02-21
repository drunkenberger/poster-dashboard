# Commit Log

## Commit: 95f6062 - 2026-02-08
**Mensaje:** Initial setup: Poster Tool social media dashboard
**Archivos modificados:** 53 archivos (estructura completa del proyecto)
**Descripcion detallada:** Setup completo del monorepo con client (React+Vite+TS), server (Express proxy), y shared (tipos TypeScript). Incluye routing con 6 paginas, layout con sidebar colapsable y header, i18n ES/EN, services API para accounts/posts/media/results, stores Zustand, tema Tailwind v4 con colores por plataforma, y proxy seguro a PostBridge API.
**Proposito/Razon:** Establecer la base completa del proyecto Poster Tool para gestionar publicaciones en multiples redes sociales.

## Commit: 2400c04 - 2026-02-08
**Mensaje:** Add accounts page with real API data and rename app to Poster Tool
**Archivos modificados:** 12 archivos - Accounts.tsx, AccountCard.tsx, PlatformFilter.tsx, PlatformIcon.tsx, PlatformBadge.tsx, LoadingSkeleton.tsx, EmptyState.tsx, ErrorMessage.tsx, server/index.ts, i18n locales, PRD.md, PLAN.md
**Descripcion detallada:** Fase 2 completa. Pagina de cuentas conectadas con datos reales de la API (2 cuentas Instagram). Componentes UI reutilizables: iconos por plataforma, badges con colores, skeletons de carga, estados vacios y de error. Filtro por plataforma. Fix de carga de .env en monorepo. Renombrado de app a Poster Tool.
**Proposito/Razon:** Implementar la gestion visual de cuentas sociales conectadas como base para la creacion de posts.

## Commit: e0d2879 - 2026-02-10
**Mensaje:** Add post creation page with media upload, account selector and publish flow
**Archivos modificados:** 11 archivos - CreatePost.tsx, MediaUploader.tsx, AccountSelector.tsx, useMediaUpload.ts, Toast.tsx, App.tsx, index.css, i18n locales
**Descripcion detallada:** Fase 3 core. Pagina de creacion de posts con: editor de caption con contador de caracteres, MediaUploader con drag & drop y preview de imagenes/videos (flujo signed URL), AccountSelector con checkboxes agrupados por plataforma, sistema de toast notifications, y flujo completo de publicacion via PostBridge API. Verificado con datos reales (2 cuentas Instagram).
**Proposito/Razon:** Implementar la funcionalidad principal de la app: crear y publicar posts en multiples cuentas sociales desde un solo lugar.

## Commit: dcddc7b - 2026-02-10
**Mensaje:** Add scheduling, drafts, posts list, and connect account button
**Archivos modificados:** 11 archivos - CreatePost.tsx, Posts.tsx, Accounts.tsx, SchedulePicker.tsx, PostCard.tsx, PostStatusBadge.tsx, StatusFilter.tsx, i18n locales, CHANGE_LOG.md, ELEMENT_IDS.md
**Descripcion detallada:** Fase 4 completa. SchedulePicker con toggle publicar ahora vs programar y datetime picker nativo. Modo borrador con boton guardar. Pagina Posts con lista paginada, filtros por estado (borrador/programado/procesando/publicado/fallido), cards con badges de estado. Pagina Accounts con boton "Conectar cuenta" que abre PostBridge dashboard y boton refresh.
**Proposito/Razon:** Completar el flujo de gestion de posts: programar, guardar borradores, ver historial con estados, y facilitar la conexion de nuevas cuentas.

## Commit: 16846af - 2026-02-19
**Mensaje:** Add password gate to restrict app access with shared team password
**Archivos modificados:** 6 archivos - PasswordGate.tsx (new), main.tsx, en.json, es.json, CHANGE_LOG.md, ELEMENT_IDS.md
**Descripcion detallada:** Componente PasswordGate que envuelve App en main.tsx. Valida contrasena compartida del equipo hasheando el input con Web Crypto API (SHA-256) y comparando contra hash pre-calculado. Estado de autenticacion en sessionStorage (se pierde al cerrar pestana). UI centrada con soporte dark mode e i18n ES/EN.
**Proposito/Razon:** Restringir acceso a la app deployada en Netlify con una contrasena simple compartida por el equipo, sin necesidad de sistema de usuarios.

## Commit: fb58552 - 2026-02-21
**Mensaje:** Add auto-schedule, infinite scroll posts, caption service, and fix status filters
**Archivos modificados:** 30 archivos - AutoSchedule.tsx (new), AutoScheduleProgress.tsx (new), autoScheduleRunner.ts (new), captions.ts client service (new), captions.ts server route (new), App.tsx, Sidebar.tsx, Posts.tsx, postsStore.ts, StatusFilter.tsx, en.json, es.json, CHANGE_LOG.md, ELEMENT_IDS.md, + archivos previos de sesiones anteriores
**Descripcion detallada:** (1) Auto Schedule: pagina /auto-schedule para programar videos de Drive automaticamente. Cada cuenta recibe videos en orden aleatorio diferente con tiempos independientes (1 post = 1 video + 1 cuenta). Runner con retry (5 intentos, backoff exponencial) y delays entre uploads (2s) y posts (800ms) para evitar rate limiting. Progress UI con fases upload/creating, totales recalculados, y lista expandible de errores con mensajes reales del API. (2) Posts infinite scroll con IntersectionObserver, 25 por pagina. (3) Fix StatusFilter: solo muestra status validos de la API (scheduled, processing, posted) — draft/published/failed causaban error 400. (4) Caption service dedicado cliente+servidor.
**Proposito/Razon:** Automatizar la programacion masiva de videos con orden y tiempos diferentes por cuenta para evitar que todas las cuentas publiquen lo mismo al mismo tiempo. Mejorar la pagina de Posts para ver todos los posts con scroll infinito. Corregir filtros de status que no funcionaban.
