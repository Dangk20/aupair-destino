## Context

Capa Destino Au Pair. Piezas que ya existen y se reutilizan:

- `sesion_recursos(id, sesion_id → sesiones ON DELETE CASCADE, nombre, tipo ENUM('pdf','docx','otro'), url, tamano_kb, created_at)`.
- `lib/almacenamiento-archivos.js`: `guardarArchivo`, `archivoDisponible`, `resolverRuta`, `tipoContenido`.
- `/admin/sesiones` → pestaña Recursos → `/api/admin/recursos` (GET/POST/DELETE, `requiereAdmin`).
- `GET /api/dashboard/sesiones` calcula `estado` (`completed` / `available` / `locked`) con desbloqueo secuencial y `CURSO_LIBRE = true`.
- `/dashboard/curso` es el reproductor del menú (componente `Player` + tarjeta de resumen).

## Goals / Non-Goals

**Goals:** que la candidata vea y descargue los recursos de la sesión que está viendo; que el criterio de acceso a un recurso sea el mismo que el del video; validar en el servidor lo que el admin sube.

**Non-Goals:** la biblioteca general `/dashboard/recursos`; tipos de recurso nuevos; tocar el reproductor huérfano `/dashboard/sesion/[id]`.

## Decisions

### 1. La regla de desbloqueo vive en `lib/curso-aupair.js`

```js
export const CURSO_LIBRE = true;
export function estadosDeSesiones(filas, session) → filas + { estado }
export async function sesionVisible(sesionId, session) → boolean
```

`estadosDeSesiones` es el bucle que hoy está dentro de la ruta, movido tal cual.
`sesionVisible` hace la consulta de sesiones + progreso de la usuaria y
pregunta por el estado de una. El admin siempre ve.

*Alternativa descartada — duplicar el cálculo en la ruta de descarga:* es
exactamente la desincronización que ya se pagó con el perfil (tres
definiciones de "sección completa").

### 2. Los recursos viajan con la lista de sesiones

`GET /api/dashboard/sesiones` hace una segunda consulta a `sesion_recursos` y
cuelga `recursos: [{ id, nombre, tipo, tamano_kb, url, disponible }]` sólo de
las sesiones no bloqueadas; a las bloqueadas, `[]`. `url` es la ruta
autenticada `/api/sesion-recursos/{id}/archivo`.

*Alternativa descartada — ruta nueva `GET /api/dashboard/sesiones/[id]/recursos`:*
una petición más por cada cambio de clase y una ruta más que declarar y probar;
son pocas filas y el curso ya pide la lista entera.

### 3. Descarga: visibilidad en vez de `acceso_recursos`, y como adjunto

`/api/sesion-recursos/[id]/archivo` lee `sesion_id` del recurso y llama a
`sesionVisible`; 403 si no. `Content-Disposition: attachment; filename*=UTF-8''…`
con la extensión del archivo guardado.

*Alternativa descartada — mantener `acceso_recursos`:* la clienta decidió que
quien ve el video baja su material; con el permiso pagado, la candidata vería
la clase y recibiría un error al pedir la guía.

### 4. Validación de subida en el servidor

`POST /api/admin/recursos`: extensión en `.pdf/.doc/.docx` y `file.size ≤ 20 MB`,
antes de leer el buffer. 400 con el motivo. Es el mismo límite que ya anuncia
la interfaz del admin.

### 5. La sección en el curso

Dentro de la tarjeta de la sesión activa, tras el resumen: título "RECURSOS DE
ESTA CLASE", una fila por recurso con icono por tipo (lucide `FileText`), nombre,
tipo y tamaño, y un enlace `<a href={url} download>` con `Download`. Si
`disponible === false`, la fila sale atenuada con "No disponible". Paleta `T`.

## Risks / Trade-offs

- **Ampliar quién descarga.** Hoy sólo descarga quien tiene `acceso_recursos`;
  después, cualquiera con la sesión desbloqueada. Es la decisión de la clienta.
  → El material subido al curso deja de ser contenido pagado; se le dice al
  entregar.
- **`archivoDisponible` por cada recurso en cada carga del curso.** Son
  `stat()` locales, pocos por sesión. → Aceptable.

## Migration Plan

Sin migraciones. `deploy/desplegar-codigo.sh`. Reversión: commit anterior.

## Open Questions

- ¿El menú "Recursos" debe reunir los recursos de todas las sesiones? Change aparte.
