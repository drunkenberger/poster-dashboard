# PRD - Poster Tool: Social Media Dashboard

## 1. Vision del Producto

Dashboard web unificado para gestionar y publicar contenido en multiples cuentas de Instagram y TikTok (con soporte extensible a 9 plataformas) usando la API de PostBridge.

---

## 2. Problema que Resuelve

Los creadores de contenido y social media managers manejan multiples cuentas en distintas plataformas. Alternar entre apps, adaptar contenido manualmente y programar publicaciones por separado consume tiempo y genera errores. Poster Tool centraliza todo en un solo dashboard.

---

## 3. Usuarios Objetivo

| Tipo | Descripcion |
|------|-------------|
| Social Media Manager | Maneja 3-15 cuentas de clientes, necesita eficiencia |
| Creador de Contenido | Tiene presencia en varias plataformas, quiere publicar simultaneamente |
| Agencia Digital | Equipo que gestiona cuentas de multiples marcas |

---

## 4. Plataformas Soportadas (via PostBridge API)

**Fase 1 (MVP):** Instagram, TikTok
**Fase 2:** Facebook, Twitter/X, Threads
**Fase 3:** YouTube, Pinterest, LinkedIn, Bluesky

---

## 5. Funcionalidades

### 5.1 Gestion de Cuentas
- Ver todas las cuentas conectadas con plataforma y username
- Filtrar cuentas por plataforma
- Indicador visual de estado por plataforma (icono + color)

### 5.2 Creacion de Posts
- Editor de caption con preview en tiempo real
- Subida de imagenes (PNG, JPEG) y videos (MP4, MOV)
- Seleccion multiple de cuentas destino
- Overrides por plataforma (caption, media distintos por plataforma)
- Overrides por cuenta (personalizar para una cuenta especifica)
- Modo borrador (guardar sin publicar)

### 5.3 Programacion de Posts
- Selector de fecha/hora para publicacion futura
- Publicacion inmediata con un click
- Vista de calendario con posts programados
- Zona horaria configurable

### 5.4 Opciones Especificas por Plataforma
- **Instagram:** Placement (feed/reels), trial reel, auto-graduation
- **TikTok:** Titulo, etiqueta AI-generated, guardar como borrador

### 5.5 Gestion de Media
- Galeria de medios subidos
- Preview de imagenes y videos
- Indicador de expiracion (media se elimina a las 24h en PostBridge)
- Soporte drag & drop para subida

### 5.6 Historial y Resultados
- Lista de posts con estado (programado, publicado, fallido)
- Detalle de resultado por plataforma/cuenta
- Link directo al post publicado en la plataforma
- Filtros por plataforma, estado y fecha

### 5.7 Dashboard Principal
- Resumen de cuentas conectadas
- Posts recientes con estado
- Acceso rapido a crear nuevo post
- Stats basicos (posts publicados hoy, programados, fallidos)

---

## 6. Arquitectura Tecnica

### 6.1 Stack Tecnologico

| Capa | Tecnologia | Justificacion |
|------|-----------|---------------|
| Frontend | React + TypeScript | Ecosistema maduro, tipado seguro |
| UI Framework | Tailwind CSS + shadcn/ui | Componentes accesibles, estilo moderno |
| Estado | Zustand | Ligero, simple, sin boilerplate |
| Routing | React Router v7 | Estandar para SPAs |
| HTTP Client | Axios | Interceptors para auth, manejo de errores |
| Build Tool | Vite | Rapido, moderno |
| Backend/Proxy | Express.js (Node) | Proxy para proteger API key, no exponer en frontend |
| i18n | react-i18next | Internacionalizacion desde el inicio |
| Testing | Vitest + Testing Library | Compatible con Vite, rapido |

### 6.2 Arquitectura de la Aplicacion

```
insta-postbridge/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/        # Componentes UI reutilizables
│   │   │   ├── ui/            # shadcn/ui base components
│   │   │   ├── layout/        # Header, Sidebar, Layout
│   │   │   ├── posts/         # PostEditor, PostCard, PostList
│   │   │   ├── accounts/      # AccountCard, AccountSelector
│   │   │   ├── media/         # MediaUploader, MediaGallery
│   │   │   └── calendar/      # CalendarView, SchedulePicker
│   │   ├── pages/             # Paginas/Rutas
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CreatePost.tsx
│   │   │   ├── Posts.tsx
│   │   │   ├── Accounts.tsx
│   │   │   ├── Media.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/             # Custom hooks
│   │   ├── stores/            # Zustand stores
│   │   ├── services/          # API service layer
│   │   ├── types/             # TypeScript interfaces
│   │   ├── i18n/              # Traducciones
│   │   └── utils/             # Utilidades
│   └── ...config files
├── server/                    # Backend Express proxy
│   ├── src/
│   │   ├── routes/            # Rutas API proxy
│   │   ├── middleware/        # Auth, error handling, rate limiting
│   │   └── utils/             # Utilidades servidor
│   └── ...config files
└── shared/                    # Tipos compartidos
    └── types/
```

### 6.3 Flujo de Datos

```
Browser → Express Proxy (API key segura) → PostBridge API
                                         ← Response
       ← Response al cliente
```

El backend Express actua SOLO como proxy seguro. No tiene base de datos propia. Toda la data vive en PostBridge.

### 6.4 API Proxy Endpoints

| Proxy Route | PostBridge Endpoint | Metodo |
|-------------|-------------------|--------|
| /api/accounts | /v1/social-accounts | GET |
| /api/accounts/:id | /v1/social-accounts/:id | GET |
| /api/posts | /v1/posts | GET, POST |
| /api/posts/:id | /v1/posts/:id | GET, PATCH, DELETE |
| /api/media | /v1/media | GET |
| /api/media/:id | /v1/media/:id | GET, DELETE |
| /api/media/upload-url | /v1/media/create-upload-url | POST |
| /api/results | /v1/post-results | GET |
| /api/results/:id | /v1/post-results/:id | GET |

---

## 7. Flujos de Usuario Clave

### 7.1 Crear y Publicar un Post
1. Usuario navega a "Crear Post"
2. Escribe caption en editor
3. Sube media (drag & drop o file picker)
4. Selecciona cuentas destino (Instagram cuenta1, TikTok cuenta2...)
5. (Opcional) Configura overrides por plataforma
6. (Opcional) Programa fecha/hora
7. Click "Publicar" o "Programar"
8. Sistema sube media → obtiene media_ids → crea post via API
9. Redirige a detalle del post con estado

### 7.2 Revisar Resultados
1. Usuario navega a "Posts"
2. Ve lista con estados (iconos: check verde, reloj amarillo, X roja)
3. Click en post → ve detalle con resultado por cada cuenta
4. Links directos a posts publicados

---

## 8. Requisitos No Funcionales

- **Performance:** Carga inicial < 2s, transiciones < 300ms
- **Responsive:** Funcional en mobile (360px+), tablet y desktop
- **Seguridad:** API key nunca expuesta al frontend, sanitizacion de inputs
- **i18n:** Espanol e Ingles desde el inicio
- **Accesibilidad:** WCAG 2.1 AA basico (contraste, navegacion por teclado)

---

## 9. Fuera de Alcance (v1)

- Autenticacion de usuarios (multi-tenant) - es single-user por ahora
- Analytics avanzados / graficas de engagement
- Comentarios / interacciones con seguidores
- Editor de imagenes/video integrado
- Integracion con calendarios externos
- App mobile nativa

---

## 10. Metricas de Exito

- Publicar exitosamente en 2+ cuentas simultaneamente
- Tiempo de creacion de post < 2 minutos
- 0 exposiciones de API key en el frontend
- Cobertura de pruebas > 80%
