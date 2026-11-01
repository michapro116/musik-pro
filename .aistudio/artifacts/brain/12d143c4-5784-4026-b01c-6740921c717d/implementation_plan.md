# MiMusic Pro — Plan de Implementación & Estado de Fases

Aplicación Android nativa e interfaz interactiva para **MiMusic Pro**, un reproductor musical personal de alta fidelidad inspirado en Spotify pero sin suscripciones, con motor DSP Audio Pro de 10 bandas, reproducción continua Gapless, soporte Google Cast / Bluetooth, Modo Conducción, Copias de Seguridad, Editor ID3 con carátula personalizada, Refuerzo Acústico 3D y Temas Dinámicos Material You.

---

## Estado Actual de las Fases

### Fase 1: Núcleo del Reproductor & Audio Pro (Completada)
- [x] Tema oscuro grafito (`#0A0A0D` / `#121217`) con acentos esmeralda y cian.
- [x] Motor DSP Audio Pro de 10 bandas (31Hz a 16kHz) con presets (Reggaetón, Urbano, Rock, Voces, etc.).
- [x] Graves profundos (Bass Boost 80Hz low-shelf), Virtualizador 3D envolvente y Limitador de volumen.
- [x] Letras karaoke sincronizadas en tiempo real con salto por línea.
- [x] Editor completo de etiquetas y metadatos ID3 (título, artista, álbum, año, género, carátula).
- [x] Temporizador de apagado (*Sleep Timer*) con cuenta regresiva en vivo.

### Fase 2: Conectividad & Almacenamiento Físico (Completada)
- [x] Selector de salida de audio: Altavoces locales, Bluetooth A2DP y Google Cast / Chromecast.
- [x] Reproducción continua *Gapless* sin silencios intermedios ni saltos de códec.
- [x] Explorador físico de carpetas (`/storage/emulated/0/Music/...`) con migas de pan y reproducción por carpetas.
- [x] Exportador de listas universales `.M3U` y gestor de listas de reproducción.
- [x] Integración de Google Drive con descarga para reproducción 100% offline.

### Fase 3: Visualizador de Onda Continua Gapless (Completada)
- [x] Visualizador de onda de 3 capas en lienzo HTML5 (`WaveformVisualizer.tsx`) con amortiguación temporal (EMA / Lerp) y fase continua orgánica para evitar parpadeos visuales al cambiar de pista.
- [x] Integración en el reproductor completo (`FullPlayer.tsx`) y mini-reproductor (`MiniPlayer.tsx`).
- [x] Componente Jetpack Compose nativo (`ContinuousWaveformVisualizer.kt`) con `rememberInfiniteTransition`.

### Fase 4: Modo Conducción, DJ Crossfade, Backup & Widgets (Completada)
- [x] **Modo Conducción Seguro (`CarModeView.tsx`)**:
  - Interfaz de alto contraste antideslumbrante para vehículos y soportes móviles.
  - Botones táctiles gigantes (Play/Pausa, anterior, siguiente, salto +/- 15s).
  - Velocímetro GPS digital simulado (km/h) y reloj digital grande.
  - Control por gestos táctiles y comandos de voz.
- [x] **Control de Velocidad con Preservación de Tono**:
  - Selector de velocidad (0.75x, 1.0x, 1.25x, 1.5x, 2.0x) con corrección de tono de voz (`preservesPitch = true`).
- [x] **DJ Smart Crossfade**:
  - Fundido gradual entre canciones ajustable (0s, 3s, 5s, 8s, 12s) para transiciones de mezcla en vivo.
- [x] **Copias de Seguridad & Restauración (`BackupRestoreModal.tsx`)**:
  - Exportación de la biblioteca completa a archivo `.json` y lista maestra `.m3u8`.
  - Restauración instantánea de copias de seguridad.
- [x] **Simulador de Widgets Android 14/15 (`AndroidWidgetSimulatorModal.tsx`)**:
  - Previsualización interactiva de widgets 4x1 y 4x2 con controles funcionales.
- [x] **Exportación para Android Studio & APK**:
  - `CarModeActivity.kt` y `MiMusicAppWidgetProvider.kt` incluidos con workflow de GitHub Actions.

### Fase 5: Calidad Audiófila Hi-Res, Listas Dinámicas Inteligentes, MediaSession & ReplayGain (Completada)
- [x] **Identificación & Insignias Audiófilas Hi-Res**:
  - Detección de formatos de estudio: `FLAC 24-bit/96kHz Lossless`, `320 kbps HQ`, `AAC 256k` y PCM.
  - Insignia dorada de alta resolución (`AudioQualityBadge.tsx` y `HiResAudioBadge.kt`).
  - Pestaña dedicada "Hi-Res Lossless" en la biblioteca musical.
- [x] **Mixes Dinámicos Inteligentes (Smart Auto-Mixes)**:
  - 4 mezclas automáticas: *Joyas Audiófilas Hi-Res*, *Alta Energía & BPM*, *Top Frecuentes (Top 25)* y *Sesión Chill & Lo-Fi*.
  - Reproducción con 1 toque y conversión directa a listas permanentes `.m3u`.
- [x] **Normalización Inteligente de Volumen (ReplayGain EBU R128)**:
  - Nodo de ganancia dinámica en Web Audio API (`audioEngine.ts`) y procesador para ExoPlayer (`ReplayGainNormalizer.kt`).
- [x] **MediaSession API & Botones de Auriculares**:
  - Metadatos del sistema operativo (`navigator.mediaSession`) para pantalla de bloqueo, barra de notificaciones y mandos Bluetooth.
  - Controlador nativo en Kotlin (`MediaSessionHelper.kt`).
- [x] **Temporizador con Desvanecimiento Suave (Fade-Out Sleep Timer)**:
  - Rampa suave de disminución de volumen en los últimos 30 segundos del temporizador.
- [x] **Atajos Globales de Teclado**:
  - Controles de reproducción rápidos por teclado.

### Fase 6: Editor ID3 con Carátula, Refuerzo Acústico 3D y Temas Dinámicos Material You (Completada)
- [x] **Editor Avanzado de Etiquetas ID3 & Carátula (`TagEditorModal.tsx`)**:
  - Subida directa de fotos desde el teléfono o computadora con redimensionamiento y compresión optimizada en lienzo Canvas (WebP/JPEG 512px).
  - 8 carátulas artísticas predefinidas (Urbano Neón, Club DJ, Lo-Fi, Rock, Subwoofer Gold, Acústica, Synthwave, Estudio).
  - Edición de metadatos completos ID3v2.4: Título, Artista, Álbum, Año, Pista Nº, Género, Compositor / Productor.
  - Persistencia automática de cambios en `localStorage` (`mimusic_song_tag_overrides_v1`) para que ninguna edición se pierda tras reiniciar la app.
  - Integración accesible en todas las vistas (`FullPlayer`, `LibraryView`, `SearchView`).
  - Clase Kotlin `ID3TagEditorHelper.kt` incluida en la exportación de Android Studio para actualizar `MediaStore` de Android.
- [x] **Refuerzo Dinámico de Graves & Virtualizador 3D Surround en DSP (`audioEngine.ts` & `AudioProEqualizer.tsx`)**:
  - **Dynamic Bass Boost Studio**:
    - Filtro Low-Shelf con ganancia de hasta +14 dB y selector de frecuencia de corte dedicada: 60Hz (Subwoofer), 80Hz (Club Punch), 100Hz (Pegada), 120Hz (Cálido).
    - Compresor analógico dinámico anti-clipping (`DynamicsCompressorNode` a -1.5dB peak limit) para subgraves demoledores sin saturación ni recortes digitales.
  - **Virtualizador 3D Surround (Apertura Estéreo 360°)**:
    - Matriz de retardo de fase cruzada (efecto Haas) con atenuación inversa de canal y modulación de retardo según el entorno acústico.
    - 4 Entornos virtuales: Estudio (1.2ms nítido), Auditorio (2.4ms sala sinfónica), Concierto (3.2ms 360° estadio), Club Nocturno (1.6ms envolvente).
    - Diagrama interactivo de ángulo de radiación acústica de 45° a 180°.
    - Procesador nativo `AndroidSpatialAudioDSP.kt` con `android.media.audiofx.BassBoost` y `android.media.audiofx.Virtualizer` para ExoPlayer.
- [x] **Temas Dinámicos Material You basados en la Carátula (`colorExtractor.ts`)**:
  - Algoritmo de muestreo cromático en tiempo real que extrae el color vibrante primario, acento secundario y fondo ambiental a partir de la carátula en reproducción.
  - Aura ambiental dinámica con resplandor difuminado detrás de la portada, fondo con degradado reactivo y botón de reproducción teñido con el color del álbum.
  - Onda continua sincronizada del visualizador tintada con la paleta cromática de la pista.
  - Botón conmutador con icono de paleta (`Palette`) en la barra superior de `FullPlayer` con persistencia de preferencia.
  - Componente Jetpack Compose nativo `DynamicMaterialYouPalette.kt` exportado en el archivo ZIP.
