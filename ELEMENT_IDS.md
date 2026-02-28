# Element IDs

| ID | Componente | Descripcion | Archivo | Linea |
|----|-----------|-------------|---------|-------|
| layout-sidebar-001 | Sidebar | Barra lateral de navegacion principal | Sidebar.tsx | 28 |
| sidebar-toggle-002 | Sidebar | Boton para colapsar/expandir sidebar | Sidebar.tsx | 34 |
| layout-header-003 | Header | Header superior de la aplicacion | Header.tsx | 12 |
| header-lang-toggle-004 | Header | Boton toggle de idioma ES/EN | Header.tsx | 16 |
| accounts-platform-filter-005 | PlatformFilter | Filtro de plataformas en pagina Cuentas | PlatformFilter.tsx | 18 |
| account-card-{id} | AccountCard | Card de cuenta social (dinamico por account.id) | AccountCard.tsx | 12 |
| media-uploader-006 | MediaUploader | Zona de drag & drop para subir archivos | MediaUploader.tsx | 30 |
| account-selector-007 | AccountSelector | Selector de cuentas destino con checkboxes | AccountSelector.tsx | 29 |
| post-publish-btn-008 | CreatePost | Boton publicar ahora | CreatePost.tsx | 56 |
| caption-input-009 | CreatePost | Textarea para escribir el caption | CreatePost.tsx | 79 |
| accounts-refresh-btn-010 | Accounts | Boton actualizar lista de cuentas | Accounts.tsx | 36 |
| accounts-connect-btn-011 | Accounts | Link a PostBridge dashboard para conectar cuentas | Accounts.tsx | 44 |
| schedule-picker-012 | SchedulePicker | Toggle publicar ahora vs programar con date picker | SchedulePicker.tsx | 28 |
| post-draft-btn-013 | CreatePost | Boton guardar como borrador | CreatePost.tsx | 63 |
| posts-status-filter-014 | StatusFilter | Filtro por estado de posts | StatusFilter.tsx | 14 |
| header-mobile-menu-015 | Header | Boton hamburger menu para sidebar mobile | Header.tsx | 25 |
| header-theme-toggle-016 | Header | Boton toggle dark/light mode | Header.tsx | 36 |
| sidebar-overlay-017 | Sidebar | Overlay oscuro detras del sidebar mobile | Sidebar.tsx | 38 |
| sidebar-close-mobile-018 | Sidebar | Boton X para cerrar sidebar mobile | Sidebar.tsx | 58 |
| platform-options-019 | PlatformOptions | Contenedor de opciones por plataforma con tabs | PlatformOptions.tsx | 42 |
| account-overrides-020 | AccountOverrides | Contenedor de overrides por cuenta individual | AccountOverrides.tsx | 34 |
| post-detail-021 | PostDetail | Contenedor principal de la pagina detalle de post | PostDetail.tsx | 62 |
| post-delete-btn-022 | PostDetail | Boton eliminar post en pagina de detalle | PostDetail.tsx | 70 |
| post-result-{id} | PostResultCard | Card de resultado por cuenta (dinamico por result.id) | PostResultCard.tsx | 15 |
| drive-back-btn-023 | DriveVideoBrowser | Boton volver a categorias desde lista de videos | DriveVideoBrowser.tsx | 38 |
| drive-category-{id} | CategoryGrid | Card de categoria/folder de Drive (dinamico por id) | CategoryGrid.tsx | 23 |
| drive-video-{id} | VideoGrid | Card de video de Drive (dinamico por id) | VideoGrid.tsx | 45 |
| categories-filter-024 | CategoryFilter | Filtro por categoria en pagina Cuentas | CategoryFilter.tsx | 18 |
| categories-picker-025 | AccountCategoryPicker | Toggle pills para asignar categorias a cuenta | AccountCategoryPicker.tsx | 23 |
| categories-manager-026 | CategoryManager | Modal para gestionar categorias (CRUD) | CategoryManager.tsx | 57 |
| categories-name-input-027 | CategoryManager | Input nombre de categoria en modal | CategoryManager.tsx | 71 |
| accounts-manage-cats-028 | Accounts | Boton para abrir modal de gestion de categorias | Accounts.tsx | 42 |
| bulk-steps-029 | BulkSteps | Indicador visual de pasos del wizard bulk | BulkSteps.tsx | 17 |
| bulk-video-select-030 | BulkVideoSelect | Contenedor de seleccion de videos (tabs Drive/Upload) | BulkVideoSelect.tsx | 23 |
| bulk-upload-drive-031 | BulkVideoSelect | Boton subir videos seleccionados de Drive | BulkVideoSelect.tsx | 108 |
| bulk-post-config-032 | BulkPostConfig | Contenedor de configuracion de posts en lote | BulkPostConfig.tsx | 29 |
| bulk-scheduler-033 | BulkScheduler | Contenedor de programacion de posts en lote | BulkScheduler.tsx | 37 |
| bulk-review-034 | BulkReview | Tabla de revision y envio de posts en lote | BulkReview.tsx | 31 |
| bulk-view-posts-035 | BulkReview | Boton ver posts despues de crear lote | BulkReview.tsx | 80 |
| bulk-submit-036 | BulkReview | Boton crear todos los posts del lote | BulkReview.tsx | 88 |
| shorts-upload-tab-037 | VideoUploader | Tabs de seleccion de fuente (Upload/Drive) | VideoUploader.tsx | 42 |
| shorts-upload-local-038 | VideoUploader | Zona drag & drop para subir video local | VideoUploader.tsx | 56 |
| shorts-upload-drive-039 | VideoUploader | Contenedor de navegacion Google Drive | VideoUploader.tsx | 65 |
| shorts-player-040 | VideoPlayer | Contenedor del reproductor de video nativo | VideoPlayer.tsx | 40 |
| shorts-time-display-041 | VideoPlayer | Display de tiempo actual / duracion | VideoPlayer.tsx | 49 |
| shorts-scene-markers-042 | VideoPlayer | Chips de escenas detectadas clickeables | VideoPlayer.tsx | 54 |
| shorts-clip-setstart-043 | ClipEditor | Boton para marcar inicio del clip | ClipEditor.tsx | 37 |
| shorts-clip-setend-044 | ClipEditor | Boton para marcar fin del clip | ClipEditor.tsx | 46 |
| shorts-clip-add-045 | ClipEditor | Boton para agregar clip a la lista | ClipEditor.tsx | 55 |
| shorts-clip-list-046 | ShortsEditor | Lista de clips cortados en resultado | ShortsEditor.tsx | 162 |
| shorts-cut-btn-047 | ShortsEditor | Boton crear posts en bulk con clips | ShortsEditor.tsx | 189 |
| shorts-cut-progress-048 | ShortsEditor | Indicadores de progreso de analisis/corte | ShortsEditor.tsx | 132 |
| shorts-saved-clips-049 | SavedClips | Seccion de clips guardados persistentes | SavedClips.tsx | 98 |
| drive-add-folder-050 | AddFolderInput | Boton para agregar carpeta de Drive custom | AddFolderInput.tsx | 28 |
| gate-password-051 | PasswordGate | Input de contrasena del password gate | PasswordGate.tsx | 60 |
| gate-submit-052 | PasswordGate | Boton submit del password gate | PasswordGate.tsx | 68 |
| auto-schedule-folder-053 | AutoSchedule | Seccion selector de carpeta Drive | AutoSchedule.tsx | 83 |
| auto-schedule-accounts-054 | AutoSchedule | Seccion selector de cuentas | AutoSchedule.tsx | 97 |
| auto-schedule-start-time-055 | AutoSchedule | Input fecha/hora inicio | AutoSchedule.tsx | 103 |
| auto-schedule-min-interval-056 | AutoSchedule | Input intervalo minimo en minutos | AutoSchedule.tsx | 112 |
| auto-schedule-max-interval-057 | AutoSchedule | Input intervalo maximo en minutos | AutoSchedule.tsx | 121 |
| auto-schedule-start-btn-058 | AutoSchedule | Boton programar todos los videos | AutoSchedule.tsx | 130 |
| auto-schedule-progress-059 | AutoScheduleProgress | Contenedor de progreso por video | AutoScheduleProgress.tsx | 68 |
| auto-schedule-view-posts-060 | AutoSchedule | Boton ver posts programados | AutoSchedule.tsx | 147 |
| carousel-topic-input-061 | TopicInput | Input del tema del carrusel | TopicInput.tsx | 30 |
| carousel-slide-count-062 | TopicInput | Selector numero de slides | TopicInput.tsx | 42 |
| carousel-lang-toggle-063 | TopicInput | Toggle idioma es/en | TopicInput.tsx | 56 |
| carousel-generate-btn-064 | TopicInput | Boton generar textos | TopicInput.tsx | 74 |
| carousel-text-editor-065 | SlideTextEditor | Contenedor editor de textos | SlideTextEditor.tsx | 16 |
| carousel-approve-texts-066 | SlideTextEditor | Boton aprobar textos | SlideTextEditor.tsx | 68 |
| carousel-image-grid-067 | SlideImageReview | Grid de imagenes generadas | SlideImageReview.tsx | 26 |
| carousel-approve-images-068 | SlideImageReview | Boton aprobar imagenes | SlideImageReview.tsx | 77 |
| carousel-style-presets-069 | StylePresets | Grid de presets de estilo | StylePresets.tsx | 80 |
| carousel-style-controls-070 | StyleControls | Panel de controles de estilo | StyleControls.tsx | 35 |
| carousel-canvas-preview-071 | SlideCanvas | Preview canvas del slide | SlideCanvas.tsx | 37 |
| carousel-slide-nav-072 | SlideStyleEditor | Navegacion entre slides | SlideStyleEditor.tsx | 46 |
| carousel-publish-btn-073 | CarouselPublish | Boton publicar carrusel | CarouselPublish.tsx | 99 |
| carousel-caption-074 | CarouselPublish | Input caption del carrusel | CarouselPublish.tsx | 84 |
| carousel-drive-picker-075 | DriveFolderPicker | Selector de carpeta Drive para guardar | DriveFolderPicker.tsx | 45 |
| series-carousel-tabs-076 | CarouselTabs | Tabs de seleccion de carrusel en serie | CarouselTabs.tsx | 12 |
| series-topic-input-077 | SeriesTopicInput | Input del tema de la serie | SeriesTopicInput.tsx | 30 |
| series-count-078 | SeriesTopicInput | Input cantidad de carruseles | SeriesTopicInput.tsx | 47 |
| series-slides-079 | SeriesTopicInput | Input slides por carrusel | SeriesTopicInput.tsx | 57 |
| series-generate-btn-080 | SeriesTopicInput | Boton generar toda la serie | SeriesTopicInput.tsx | 78 |
| series-text-editor-081 | SeriesTextEditor | Contenedor editor de textos por carrusel | SeriesTextEditor.tsx | 17 |
| series-image-review-082 | SeriesImageReview | Grid de imagenes con progreso global | SeriesImageReview.tsx | 23 |
| series-style-editor-083 | SeriesStyleEditor | Editor de estilos con tabs de carrusel | SeriesStyleEditor.tsx | 27 |
| series-publish-btn-084 | SeriesPublish | Boton publicar toda la serie | SeriesPublish.tsx | 88 |
| auto-schedule-mode-085 | AutoSchedule | Toggle modo videos/carruseles | AutoSchedule.tsx | 169 |
| carousel-save-btn-086 | CarouselPublish | Boton guardar carrusel en Drive sin publicar | CarouselPublish.tsx | 117 |
| series-save-btn-087 | SeriesPublish | Boton guardar serie en Drive sin publicar | SeriesPublish.tsx | 114 |
| bulk-upload-carousels-088 | BulkCarouselSelect | Boton subir carruseles seleccionados en bulk | BulkCarouselSelect.tsx | 143 |
| carousel-style-picker-089 | ImageStylePicker | Grid selector de estilo de imagen para carruseles | ImageStylePicker.tsx | 36 |
| analytics-stats-090 | AnalyticsStats | Cards de metricas totales (views, likes, comments, shares) | AnalyticsStats.tsx | 31 |
| analytics-table-091 | AnalyticsTable | Tabla de analytics por post | AnalyticsTable.tsx | 35 |
| analytics-sync-btn-092 | Analytics | Boton sincronizar analytics de TikTok | Analytics.tsx | 55 |
| analytics-timeframe-093 | Analytics | Toggle filtro de timeframe (7d/30d/90d/all) | Analytics.tsx | 66 |
| account-stats-no-posts | AccountPostStats | Mensaje cuando la cuenta no tiene posts | AccountPostStats.tsx | 20 |
| analytics-account-filter-094 | AllPostsTable | Filtro por cuenta en tabla de posts | AllPostsTable.tsx | 43 |
| analytics-posts-table-095 | AllPostsTable | Tabla de todos los posts | AllPostsTable.tsx | 76 |
| analytics-tabs-096 | Analytics | Tabs de navegacion (Resumen/Posts/TikTok) | Analytics.tsx | 83 |
