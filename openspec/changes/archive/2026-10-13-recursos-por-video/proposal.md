## Why

La clienta pidió (R7, reunión del 2026-08-05; confirmado el 2026-10-10) que **cada
video del curso tenga sus recursos descargables** —guías, PDF, documentos— para
que quien lo vea pueda bajar el material de esa clase.

La mitad ya existe y la otra mitad no, verificado en el código:

- **El lado del admin funciona.** En `/admin/sesiones`, pestaña Recursos, el
  admin sube, lista, abre y borra archivos por sesión (`/api/admin/recursos`,
  tabla `sesion_recursos`, almacenamiento fuera de `public/`). Cada sesión tiene
  un solo video, así que "por video" es "por sesión".
- **La candidata no los ve.** `/dashboard/curso`, que es el reproductor del
  menú, no consulta recursos; `GET /api/dashboard/sesiones` no los trae, y no
  existe ninguna ruta donde la candidata los pueda listar.
- **Aunque los viera, no los podría bajar.** `GET /api/sesion-recursos/[id]/archivo`
  exige `acceso_recursos`, un permiso pagado, mientras que los videos son
  gratis (`CURSO_LIBRE = true`): una candidata vería la clase y recibiría 403
  al pedir su guía. Y responde `Content-Disposition: inline`, así que el archivo
  se abre en el navegador en vez de descargarse.
- **El servidor acepta cualquier archivo.** El límite de PDF/Word de 20 MB sólo
  existe en el navegador del admin.

## What Changes

- **El curso muestra los recursos de la sesión que se está viendo**, debajo del
  resumen, con nombre, tipo y tamaño, y un botón para descargarlos.
- `GET /api/dashboard/sesiones` incluye los recursos de cada sesión **que la
  candidata puede ver** (disponible o completada); las bloqueadas no los
  exponen.
- **Puede descargar un recurso quien puede ver su video** (decisión de la
  clienta): la descarga deja de exigir `acceso_recursos` y pasa a exigir que la
  sesión no esté bloqueada para esa usuaria. El admin, siempre.
- La descarga entrega el archivo como **adjunto**, con su nombre.
- El servidor valida **tipo (PDF o Word) y tamaño (20 MB)** al subir.
- La regla de qué sesión está desbloqueada para quién pasa a un único módulo
  (`lib/curso-aupair.js`), compartido por la lista de sesiones y la descarga.

## Capabilities

### New Capabilities

- `curso-candidata`: qué ve la candidata de cada sesión del curso, incluidos sus
  recursos descargables.

### Modified Capabilities

- `documentos-candidata`: el requisito "Los recursos del curso comparten el
  almacenamiento y quedan protegidos" cambia el criterio de acceso de la
  candidata (de `acceso_recursos` a "la sesión está desbloqueada para ella") y
  añade la validación de tipo y tamaño al subir.

## Impact

- `lib/curso-aupair.js` (nuevo), `app/api/dashboard/sesiones/route.js`,
  `app/api/sesion-recursos/[id]/archivo/route.js`, `app/api/admin/recursos/route.js`,
  `app/dashboard/curso/page.jsx`, `docs/rutas-y-acceso.md`.
- Sin migraciones: `sesion_recursos` ya existe.
- **Trabajo adicional al contrato cerrado** (R7 figura entre los módulos nuevos
  de la reunión del 5 de agosto): se registra como adicional cotizado.

## Fuera de alcance

- La biblioteca general `/dashboard/recursos` (hoy "Próximamente", sobre una
  tabla `recursos` que no existe en la base). Si la clienta quiere que ese menú
  reúna los recursos de todas las sesiones, es un change aparte.
- Recursos de otros tipos (imágenes, enlaces externos, video).
- `/dashboard/sesion/[id]`, un segundo reproductor al que no enlaza ninguna
  pantalla: se anota como código huérfano, no se toca aquí.

## Qué queda muerto

Nada nuevo. `acceso_recursos` sigue existiendo: lo usa la biblioteca general,
que queda fuera de alcance.
