# Change Log

[2026-02-08] Setup monorepo con client (React+Vite+TS), server (Express+TS), shared (tipos) | Archivos: package.json, client/*, server/*, shared/* | Estado: Exitoso
[2026-02-08] Configuracion Tailwind CSS v4 con tema personalizado y colores por plataforma | Archivos: client/src/index.css, client/vite.config.ts | Estado: Exitoso
[2026-02-08] Backend Express proxy con rutas a PostBridge API (accounts, posts, media, results) | Archivos: server/src/index.ts, server/src/routes/*.ts, server/src/middleware/*.ts | Estado: Exitoso
[2026-02-08] Frontend base: Router, Layout (Sidebar+Header), i18n ES/EN, services, stores | Archivos: client/src/App.tsx, client/src/components/layout/*.tsx, client/src/services/*.ts, client/src/stores/*.ts, client/src/i18n/* | Estado: Exitoso
[2026-02-08] Tipos TypeScript compartidos para PostBridge API (SocialAccount, Post, Media, PostResult) | Archivos: shared/types/index.ts | Estado: Exitoso
[2026-02-08] Renombrar app de PostBridge a Poster Tool | Archivos: package.json, i18n/locales/*.json, PRD.md, PLAN.md, index.html | Estado: Exitoso
[2026-02-08] Pagina de Cuentas con datos reales de la API, filtro por plataforma, componentes UI reutilizables | Archivos: pages/Accounts.tsx, components/accounts/*.tsx, components/ui/*.tsx | Estado: Exitoso
[2026-02-08] Fix carga de .env en monorepo (dotenv path relativo desde server) | Archivos: server/src/index.ts | Estado: Exitoso
[2026-02-10] Fase 3: Pagina CreatePost con editor de caption, MediaUploader drag&drop, AccountSelector, y flujo de publicacion | Archivos: pages/CreatePost.tsx, components/media/MediaUploader.tsx, components/accounts/AccountSelector.tsx, hooks/useMediaUpload.ts, components/ui/Toast.tsx, App.tsx | Estado: Exitoso
