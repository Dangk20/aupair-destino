## Why

Al abrir una candidata desde el tablero, la agencia y el equipo necesitan
hablar con ella sin salir de esa pantalla, con sus datos básicos a la vista
(referencia visual de Daniel, 2026-10-12). Es lo que la clienta pidió como
**R5 (mensajería con supervisión del admin)** y **R16 (la agencia accede a
mensajes)** en la reunión del 2026-08-05. Se registra como **trabajo adicional
cotizado**, como R3 y R7.

Lo que existe hoy no sirve de base. Verificado en el código y la base:

- La tabla `mensajes` sólo modela **candidata ↔ equipo** (`remitente ENUM('usuario','admin')`).
  No hay lugar para una agencia ni para varias conversaciones por candidata.
- Tiene 2 filas en local, ambas de candidatas de prueba sin respuesta.
- La agencia no tiene ninguna forma de escribirle a la candidata.
- R5 pide algo que el modelo actual no puede expresar: que la administradora
  pueda **leer** cualquier conversación y que, cuando **entra** a una, quede
  visible en la conversación.

## What Changes

- **Vista rápida de la candidata.** Se abre al hacer clic en la tarjeta del
  tablero o en «Ver» de la lista. Tiene el chat a la izquierda y los datos
  generales básicos a la derecha. «Ver perfil» lleva a la ficha completa.
  Es el mismo componente para la agencia y el admin; solo cambian los permisos.
- **Conversaciones por candidata.** Cada candidata tiene una conversación con
  el equipo de Destino Au Pair y otra con su agencia.
  - La de la agencia empieza cuando la agencia pulsa «Iniciar conversación».
- **Supervisión del admin (R5).**
  - El admin lee cualquier conversación sin dejar rastro.
  - Para escribir en una conversación de agencia, pulsa «Entrar a la
    conversación». Eso deja en el hilo, a la vista de todos, «<nombre> del
    equipo de Destino Au Pair entró a la conversación».
- **La candidata** ve en «Mensajes» sus conversaciones: con el equipo y con su
  agencia, cuando la agencia la haya iniciado.
- **No leídos.** La tarjeta y la fila muestran un punto cuando hay mensajes
  sin leer. Los mensajes se actualizan cada pocos segundos mientras la
  conversación está abierta.
- **Migración 010:**
  - Crea las tablas `conversaciones`, `conversacion_mensajes` y `conversacion_lecturas`.
  - Copia los mensajes de `mensajes` a la conversación con el equipo.
  - Deja de usar `mensajes`, pero no la borra.
- `/admin/mensajes` y `/dashboard/mensajes` pasan a leer el modelo nuevo.

**Fuera de este change:**
- Asociadas en la mensajería (R5 las nombra, pero no tienen candidatas asignadas todavía).
- Adjuntos.
- Avisos por correo de mensajes nuevos (R6).
- Tiempo real con websockets.

## Capabilities

### New Capabilities

- `chat-candidata`: las conversaciones de una candidata con el equipo y con su agencia, la supervisión del admin y la vista rápida.

### Modified Capabilities

Ninguna. Que la tarjeta y la fila abran la vista rápida se declara aquí y no
en `panel-agencia`, porque ese change todavía no está archivado.

## Impact

- **Base:** migración `010_conversaciones.sql`, registrada en `deploy/desplegar.sh`.
- **Librería:** `lib/conversaciones-aupair.js`, dueña única de quién lee y escribe cada conversación.
- **Rutas:** se declaran en `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs`.
  Se reescriben `/api/admin/mensajes` y `/api/dashboard/mensajes`.
- **Interfaz:** `components/panel/VistaRapida.jsx` y `components/chat/Conversacion.jsx`.
  Se reescriben `TableroEtapas`, `/admin/mensajes` y `/dashboard/mensajes`.
- **Depende de** `etapas-candidata` y `panel-agencia` (`candidata_agencia`). Se despliega después de ellos o junto con ellos.
