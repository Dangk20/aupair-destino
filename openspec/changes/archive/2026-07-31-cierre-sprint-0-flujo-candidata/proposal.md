## Why

El flujo de la candidata (registro → perfil → pago con código → documentos) quedó funcional de punta a punta en el Sprint 0.0, pero un recorrido real dejó tres huecos que impiden darlo por cerrado: los códigos de las asociadas nunca suman usos aunque la venta se cobre, los documentos de las candidatas **no se ven en producción** (404) y el formulario "Cuéntanos un poco de ti" deja avanzar con campos obligatorios vacíos, produciendo perfiles incompletos que la agencia no puede evaluar.

Los tres bloquean la meta de negocio inmediata: entregarles el ambiente a las candidatas y mostrárselo a las agencias.

## What Changes

### 1. Conteo real de usos de códigos promo

- El uso de un código se contabiliza **en un único momento del ciclo de vida: cuando se confirma el pago** de la venta. Aplicar el código en `/pago` deja rastro (venta pendiente) pero no consume cupo.
- **BREAKING (interno)**: todos los caminos administrativos que activan el acceso de una candidata (`/api/admin/ventas/[id]/confirmar`, `/api/admin/toggle-acceso`, `/api/admin/confirmar-pago`) pasan a delegar en la misma función de confirmación. Hoy cada uno hace su propia mezcla de permisos, comisiones y conteo, y sólo dos de los tres cuentan el uso.
- Anular una venta confirmada revierte el uso (libera el cupo) para que el límite de usos refleje ventas vivas.
- `/admin/codigos-promo` distingue **usos confirmados** de **aplicaciones pendientes**, para que la clienta vea movimiento desde que la candidata aplica el código y no sólo al confirmar.

### 2. Documentos de candidatas visibles y protegidos

- Los documentos dejan de guardarse bajo `public/uploads/` y de servirse como archivo estático. Pasan a un directorio de datos fuera del árbol público, servido por una **ruta API autenticada** que valida sesión, rol y propiedad del documento.
- **BREAKING**: las URLs `/uploads/documentos/...` dejan de existir. Los registros ya guardados en `documentos_usuario.url` se migran al nuevo esquema de referencia.
- Cuando el archivo físico no está disponible (documentos perdidos en producción), la UI muestra un estado explícito de "archivo no disponible — pedir recarga" en lugar de un 404 del navegador.
- Cierra una exposición vigente: hoy cualquiera con el enlace abre el pasaporte o la cédula de una candidata sin estar autenticado.

### 3. Validación de campos obligatorios del perfil

- El formulario "Cuéntanos un poco de ti" (perfil general y sección de agencia) declara qué campos son obligatorios y **no permite guardar ni avanzar de sección** si falta alguno.
- Cada campo faltante se marca en rojo con su mensaje, se muestra un resumen de lo que falta y el foco salta al primer campo con error.
- La validación se aplica también en el servidor, para que el estado "perfil completo" que ve la agencia sea confiable y no dependa del navegador.

## Capabilities

### New Capabilities

- `codigos-promo`: ciclo de vida de un código de descuento — validación, aplicación, consumo de cupo al confirmar el pago, reversión al anular y reporte de uso para el módulo admin.
- `documentos-candidata`: carga, almacenamiento, acceso autorizado y revisión de los documentos del proceso de la candidata.
- `perfil-candidata`: campos del perfil (general y agencia), cuáles son obligatorios, cómo se valida su diligenciamiento y cuándo un perfil se considera completo.

### Modified Capabilities

Ninguna: es el primer change bajo OpenSpec en este repositorio, así que no hay specs previas que modificar.

## Impact

**Código afectado**

- `lib/ventas-aupair.js` — punto único de confirmación/anulación de venta y de consumo del código.
- `app/api/admin/ventas/[id]/confirmar/route.js`, `app/api/admin/ventas/[id]/anular/route.js`, `app/api/admin/toggle-acceso/route.js`, `app/api/admin/confirmar-pago/route.js` — delegan en la función única.
- `app/api/admin/codigos-promo/route.js` y `app/admin/codigos-promo/page.jsx` — métricas de usos confirmados vs. pendientes.
- `app/api/dashboard/documentos/route.js` — escritura fuera de `public/`; nueva ruta de descarga autenticada.
- `app/admin/perfiles/[id]/page.jsx`, `app/dashboard/documentos/page.jsx` — consumo de la nueva ruta y estado "archivo no disponible".
- `app/dashboard/perfil/page.jsx`, `app/dashboard/perfil/agencia/page.jsx` — validación en cliente; `app/api/dashboard/perfil/*` — validación en servidor.
- `lib/campos-perfil.js` (nuevo) — fuente única de campos obligatorios, compartida por cliente, servidor y cálculo de progreso.

**Datos y despliegue**

- Migración de `documentos_usuario.url` al nuevo esquema de referencia.
- El `docker-compose.yml` monta el volumen de uploads en la nueva ruta de datos, fuera de `public/`.
- Los documentos ya perdidos en producción no son recuperables desde la aplicación: requieren diagnóstico en el VPS y, si no están en el volumen, recarga por parte de las candidatas.

**Fuera de alcance**

- Migrar el almacenamiento a un servicio de objetos (S3/R2). Se documenta como deuda técnica.
- Los módulos sin definición funcional (Reportes, Notificaciones, Asesoras, alcance profundo de Agencia), que pasan primero por talleres de descubrimiento.
