# Plan de Desarrollo - Poster Tool

## Resumen de Fases

| Fase | Descripcion | Entregable |
|------|------------|-----------|
| 1 | Setup e Infraestructura | Proyecto configurado, proxy funcional |
| 2 | Gestion de Cuentas | Ver y filtrar cuentas conectadas |
| 3 | Creacion de Posts (core) | Crear y publicar posts con media |
| 4 | Programacion y Borradores | Calendario, scheduling, drafts |
| 5 | Resultados e Historial | Ver resultados y estados de posts |
| 6 | Opciones por Plataforma | Configuraciones especificas IG/TikTok |
| 7 | Dashboard y Polish | Dashboard principal, UX, responsive |
| 8 | Testing y Deploy | Tests completos, deployment |

---

## Fase 1: Setup e Infraestructura

### 1.1 Inicializar proyecto
- [ ] Crear monorepo con estructura `client/` + `server/` + `shared/`
- [ ] Inicializar React + Vite + TypeScript en `client/`
- [ ] Inicializar Express + TypeScript en `server/`
- [ ] Configurar Tailwind CSS + shadcn/ui
- [ ] Configurar ESLint + Prettier compartido

### 1.2 Backend Proxy
- [ ] Crear servidor Express con rutas proxy
- [ ] Middleware de autenticacion (leer API key de .env)
- [ ] Middleware de manejo de errores centralizado
- [ ] Configurar CORS para desarrollo local
- [ ] Proxy todas las rutas de PostBridge API

### 1.3 Frontend Base
- [ ] Configurar React Router con rutas principales
- [ ] Crear Layout principal (Sidebar + Header + Content)
- [ ] Configurar Zustand store base
- [ ] Crear servicio API base con Axios (apuntando al proxy)
- [ ] Configurar react-i18next con ES/EN

### 1.4 Tipos Compartidos
- [ ] Definir interfaces TypeScript para Social Account, Post, Media, PostResult
- [ ] Tipos para request/response del proxy

**Entregable:** App corriendo en localhost con layout vacio y proxy funcional.

---

## Fase 2: Gestion de Cuentas

### 2.1 API Service
- [ ] `accountsService.getAll(filters)` → GET /api/accounts
- [ ] `accountsService.getById(id)` → GET /api/accounts/:id

### 2.2 Store
- [ ] `useAccountsStore` con estado, fetch, filtros

### 2.3 UI
- [ ] Pagina `Accounts.tsx` con lista de cuentas
- [ ] Componente `AccountCard` (avatar placeholder, username, icono plataforma)
- [ ] Filtro por plataforma (Instagram, TikTok, todas)
- [ ] Estado de carga y estado vacio

**Entregable:** Ver todas las cuentas conectadas con filtros.

---

## Fase 3: Creacion de Posts (Core)

### 3.1 Media Upload
- [ ] `mediaService.createUploadUrl(file)` → POST /api/media/upload-url
- [ ] `mediaService.uploadFile(url, file)` → PUT directo al signed URL
- [ ] Componente `MediaUploader` con drag & drop
- [ ] Preview de imagenes/videos subidos
- [ ] Indicador de progreso de subida

### 3.2 Selector de Cuentas
- [ ] Componente `AccountSelector` - checkboxes con icono de plataforma
- [ ] Agrupado por plataforma
- [ ] "Seleccionar todas" por plataforma

### 3.3 Editor de Post
- [ ] Pagina `CreatePost.tsx` con flujo completo
- [ ] Textarea para caption con contador de caracteres
- [ ] Integracion con MediaUploader
- [ ] Integracion con AccountSelector
- [ ] Boton "Publicar Ahora"
- [ ] Flujo: subir media → obtener IDs → crear post → mostrar resultado

### 3.4 API Service Posts
- [ ] `postsService.create(data)` → POST /api/posts
- [ ] `postsService.getAll(filters)` → GET /api/posts
- [ ] `postsService.getById(id)` → GET /api/posts/:id
- [ ] `postsService.update(id, data)` → PATCH /api/posts/:id
- [ ] `postsService.delete(id)` → DELETE /api/posts/:id

**Entregable:** Crear un post con imagen/video y publicar en multiples cuentas.

---

## Fase 4: Programacion y Borradores

### 4.1 Scheduling
- [ ] Componente `SchedulePicker` (date + time picker)
- [ ] Selector de zona horaria
- [ ] Integracion en CreatePost: toggle "Publicar ahora" vs "Programar"
- [ ] Enviar `scheduled_at` en formato ISO 8601

### 4.2 Borradores
- [ ] Boton "Guardar como borrador" en editor
- [ ] Enviar `is_draft: true`
- [ ] Lista de borradores en pagina Posts (filtro status=draft)
- [ ] Editar y publicar borrador existente

### 4.3 Vista Calendario
- [ ] Componente `CalendarView` con posts programados
- [ ] Vista mensual con indicadores de posts por dia
- [ ] Click en dia → ver posts de ese dia

**Entregable:** Programar posts a futuro y gestionar borradores.

---

## Fase 5: Resultados e Historial

### 5.1 API Service
- [ ] `resultsService.getAll(filters)` → GET /api/results
- [ ] `resultsService.getById(id)` → GET /api/results/:id

### 5.2 Lista de Posts
- [ ] Pagina `Posts.tsx` con lista paginada
- [ ] Filtros: plataforma, estado (draft/scheduled/published/failed)
- [ ] Indicadores visuales de estado (iconos + colores)

### 5.3 Detalle de Post
- [ ] Modal/pagina con detalle del post
- [ ] Resultado por cada cuenta/plataforma
- [ ] Links a posts publicados en plataformas
- [ ] Mensajes de error si fallo

**Entregable:** Historial completo de posts con resultados detallados.

---

## Fase 6: Opciones por Plataforma

### 6.1 Instagram
- [ ] Selector de placement: feed vs reels
- [ ] Toggle trial reel
- [ ] Configuracion auto-graduation strategy

### 6.2 TikTok
- [ ] Campo de titulo
- [ ] Toggle etiqueta AI-generated content
- [ ] Toggle guardar como borrador en TikTok

### 6.3 Overrides
- [ ] UI para caption diferente por plataforma
- [ ] UI para media diferente por plataforma
- [ ] UI para override por cuenta especifica
- [ ] Tabs en editor: "General" | "Instagram" | "TikTok"

**Entregable:** Configuracion completa por plataforma al crear posts.

---

## Fase 7: Dashboard y Polish

### 7.1 Dashboard Principal
- [ ] Stats cards: cuentas activas, posts hoy, programados, fallidos
- [ ] Posts recientes con estado
- [ ] Acciones rapidas: "Nuevo Post", ver cuentas
- [ ] Actividad reciente (ultimos resultados)

### 7.2 UX y Responsive
- [ ] Sidebar colapsable en mobile
- [ ] Layout responsive para todas las paginas
- [ ] Notificaciones toast para acciones (post creado, error, etc.)
- [ ] Loading skeletons en todas las listas
- [ ] Empty states con ilustraciones/mensajes utiles

### 7.3 Temas e i18n
- [ ] Dark mode / Light mode toggle
- [ ] Traducciones completas ES/EN
- [ ] Selector de idioma en settings

**Entregable:** App pulida, responsive y lista para usar.

---

## Fase 8: Testing y Deploy

### 8.1 Testing
- [ ] Tests unitarios para services (API layer)
- [ ] Tests unitarios para stores (Zustand)
- [ ] Tests de componentes con Testing Library
- [ ] Tests de integracion para flujos criticos (crear post, subir media)
- [ ] Tests del backend proxy (routes, middleware)

### 8.2 Deploy
- [ ] Dockerizar backend + frontend
- [ ] Configurar variables de entorno para produccion
- [ ] Setup CI basico (lint + test)
- [ ] Documentar proceso de deploy

**Entregable:** App testeada y desplegable.

---

## Dependencias Externas

| Dependencia | Descripcion | Riesgo |
|-------------|------------|--------|
| PostBridge API | Toda la funcionalidad depende de esta API | Alto - sin ella no funciona nada |
| API Key | Necesaria para cualquier operacion | Requiere cuenta activa en PostBridge |
| Cuentas Sociales | Deben estar conectadas en PostBridge | Config externa al app |

---

## Stack de Dependencias (npm packages)

### Client
```
react, react-dom, react-router-dom
typescript
tailwindcss, @tailwindcss/vite
zustand
axios
react-i18next, i18next
date-fns (manejo de fechas)
lucide-react (iconos)
vitest, @testing-library/react
```

### Server
```
express
cors
helmet (seguridad headers)
dotenv
axios (llamadas a PostBridge)
typescript, tsx
vitest (testing)
```

---

## Orden de Ejecucion Sugerido

```
Fase 1 (Setup)           ████████░░░░░░░░░░░░░░░░░░░░░░  ~2 dias
Fase 2 (Cuentas)         ░░░░░░░░████░░░░░░░░░░░░░░░░░░  ~1 dia
Fase 3 (Posts Core)      ░░░░░░░░░░░░████████░░░░░░░░░░░  ~3 dias
Fase 4 (Scheduling)      ░░░░░░░░░░░░░░░░░░░░████░░░░░░░  ~2 dias
Fase 5 (Resultados)      ░░░░░░░░░░░░░░░░░░░░░░░░███░░░░  ~1 dia
Fase 6 (Plataformas)     ░░░░░░░░░░░░░░░░░░░░░░░░░░░██░░  ~2 dias
Fase 7 (Dashboard)       ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██  ~2 dias
Fase 8 (Testing/Deploy)  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█  ~2 dias
```
