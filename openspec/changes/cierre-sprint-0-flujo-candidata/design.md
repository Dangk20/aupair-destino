## Context

La plataforma es Next.js 16 (App Router, JavaScript), MySQL con SQL crudo vía `mysql2`, sin ORM y sin pruebas automatizadas. Conviven dos aplicaciones en el mismo repositorio: sólo la capa Destino Au Pair (`lib/db-aupair.js`, `lib/session-aupair.js`, cookie `dap_token`) es la del producto real.

Estado verificado antes de escribir este diseño, sobre la base de datos local y sobre producción:

- **Códigos.** `lib/ventas-aupair.js` ya cuenta el uso al confirmar la venta, y funciona: las ventas 1 y 2 con `TATI0626` generaron comisión. Pero `codigos_promo.usos_actuales` sigue en `0` para ese código, porque el conteo se agregó después de esas confirmaciones y porque el recorrido real de la candidata deja la venta en `pendiente` — nadie la confirma. Además hay tres rutas administrativas que encienden acceso (`/api/admin/ventas/[id]/confirmar`, `/api/admin/toggle-acceso`, `/api/admin/confirmar-pago`) con lógica duplicada y divergente: la segunda cuenta el uso por su cuenta leyendo `usuarios.codigo_promo_usado`, la tercera no cuenta nada.
- **Documentos.** Se guardan en `public/uploads/documentos/<id>/` y se sirven como estáticos. En local funcionan; en producción devuelven **404** (`destino-aupair.com/uploads/documentos/18/certificado_idioma_...png`). Dos causas concurrentes: el servidor `standalone` de Next resuelve los estáticos de `public/` a partir del build, y el volumen `uploads` montado en un redeploy tapa lo que estuviera escrito en la imagen. Mientras esas URLs funcionaron, además, cualquiera con el enlace abría el pasaporte o la cédula de una candidata: `middleware.js` salta toda ruta que contenga un punto, así que nunca pidió sesión.
- **Validación de perfil.** `app/dashboard/perfil/evaluacion/page.jsx` sí bloquea al pulsar "Guardar y continuar", pero con un mensaje genérico ("Faltan N campos"), sin decir cuáles ni marcarlos; no valida al saltar de sección desde el navegador lateral ni al guardar sin avanzar. `app/dashboard/perfil/agencia/page.jsx` no valida nada y considera una sección completa con la mitad de sus campos. No hay validación en servidor en ninguna de las dos.

Restricción de negocio: dos meses de MVP con prioridad Admin → Candidatas → Agencias. Este change cierra el Sprint 0.0 y es el primero que se ejecuta bajo OpenSpec.

## Goals / Non-Goals

**Goals:**

- Que el conteo de usos de un código refleje ventas reales, por cualquier camino que el admin use para activar el acceso.
- Que el admin y la candidata puedan ver los documentos cargados, en producción, y que sólo ellos puedan verlos.
- Que ningún perfil llegue a la agencia con campos obligatorios vacíos, y que la candidata sepa exactamente cuáles le faltan.
- Dejar el trabajo trazable como el primer ciclo completo de OpenSpec en este repositorio.

**Non-Goals:**

- Migrar el almacenamiento a un servicio de objetos (S3/R2/Blob). Queda como deuda técnica registrada.
- Rediseñar el flujo de pago ni integrar pasarela: el pago se sigue coordinando por WhatsApp y confirmando a mano.
- Tocar la capa Project Center ni la plantilla Saasly.
- Recuperar los documentos ya perdidos en producción por vía de la aplicación.
- Refactorizar los formularios a una librería de formularios (React Hook Form / Zod): se resuelve con la fuente única de campos y estado local.

## Decisions

### 1. `lib/ventas-aupair.js` como único dueño de la transición de estado de una venta

`confirmarVenta(ventaId, opciones)` y `anularVenta(ventaId)` quedan como las únicas funciones que encienden permisos, consumen o liberan cupo de código y generan o anulan comisión. Se añade `confirmarAccesoUsuario(usuarioId, { monto })`, que resuelve o crea la venta de la candidata y delega en `confirmarVenta`. Las tres rutas administrativas quedan como envoltorios delgados.

*Alternativa descartada:* dejar que cada ruta siga con su lógica y sólo agregar el conteo a la que falta. Se descarta porque el bug reportado nació precisamente de esa duplicación: tres caminos que hacen "lo mismo" de tres maneras. Con un solo dueño, el próximo camino que se agregue hereda el comportamiento correcto.

*Consecuencia:* `toggle-acceso` deja de leer `usuarios.codigo_promo_usado` para contar. Ese campo se conserva como registro de qué código aplicó la candidata (insumo para la atribución cuando no hay venta), no como disparador de conteo.

### 2. Idempotencia por dato, no por bandera

El conteo se protege con la existencia previa de la fila en `codigos_promo_usos` (par `codigo_id` + `usuario_id`), no con un booleano en `ventas`. Se añade índice único sobre ese par para que la garantía viva en la base de datos y no dependa del orden de ejecución. La comisión ya está protegida por el único sobre `venta_id`.

*Alternativa descartada:* una columna `uso_contado` en `ventas`. Sería una segunda fuente de verdad sobre un hecho que ya está representado por la fila de uso.

### 3. Reversión al anular: decrementar, no recalcular

Anular decrementa `usos_actuales` con piso en cero y borra la fila de `codigos_promo_usos`. No se recalcula el contador desde cero sobre la tabla de usos en cada operación.

*Alternativa considerada:* derivar `usos_actuales` siempre con un `COUNT` sobre `codigos_promo_usos` y eliminar la columna. Es más limpio conceptualmente y elimina la posibilidad de desincronización, pero la columna la leen la validación pública de códigos y el módulo admin, y el volumen actual no justifica el refactor. Se mitiga con un script de reconciliación (tarea 1.7) que corrige el contador contra la tabla de usos, y que además arregla el desfase histórico ya existente.

### 4. Documentos: directorio de datos + ruta API autenticada

Los archivos pasan de `public/uploads/documentos/` a un directorio configurable por `UPLOADS_DIR` (por defecto `<cwd>/almacenamiento` — directorio propio: `data/` ya existe en el repo y contiene módulos que el sitio público importa), montado como volumen en producción. `documentos_usuario.url` deja de guardar una URL pública y guarda una referencia relativa (`documentos/<usuario_id>/<archivo>`). Se sirven por `GET /api/documentos/[id]`, que exige sesión, autoriza a la dueña o a un rol administrativo, resuelve la ruta contra el directorio de datos y verifica que la ruta resuelta siga dentro de él antes de leer.

*Alternativa descartada A:* dejarlos en `public/` y proteger con middleware. No sirve: el middleware salta toda ruta con punto y, aunque se corrigiera, el servidor de estáticos de Next no es el lugar para decidir autorización — y no resuelve el 404 de producción.

*Alternativa descartada B:* guardar los archivos como base64 en MySQL, como ya se hace con `usuarios.foto_url`. Resuelve la persistencia sin volumen, pero infla la base con documentos de hasta 10 MB, obliga a leer la columna completa para listar y empeora un patrón que ya es deuda en este repositorio.

*Alternativa aplazada:* almacenamiento de objetos. Es la respuesta correcta a mediano plazo; no se hace ahora por costo y alcance, y queda anotada en las notas técnicas privadas.

### 5. Compatibilidad de datos por normalización, no por doble lectura

Una migración normaliza los valores existentes de `documentos_usuario.url` (`/uploads/documentos/15/x.pdf` → `documentos/15/x.pdf`). La ruta de descarga entiende un único formato. Los archivos que existan en el volumen se siguen abriendo; los que no, caen en el estado "archivo no disponible".

*Alternativa descartada:* que la ruta acepte ambos formatos indefinidamente. Deja ambigüedad permanente en un campo que ya cambió de significado una vez.

### 6. "Archivo no disponible" es un estado de producto, no un error

El listado de documentos informa por cada uno si su archivo está presente. La UI del admin y la de la candidata muestran ese estado y, en el caso de la candidata, ofrecen volver a subir el documento. Es la respuesta honesta a los documentos ya perdidos en producción: la aplicación no puede recuperarlos, pero sí puede decirlo y encaminar la recarga.

### 7. `lib/campos-perfil.js` como fuente única de obligatoriedad

Un módulo declara, por sección y por parte, los campos obligatorios, su etiqueta visible y su condición de aplicabilidad (`requeridoSi`). De ahí se derivan la validación del cliente, la del servidor y el cálculo de progreso. Hoy esas tres cosas viven en tres archivos con criterios distintos — incluida la regla de "la mitad de los campos" del perfil de agencia, que es la razón de que un perfil aparezca completo sin estarlo.

*Alternativa descartada:* introducir Zod. Aportaría esquema y mensajes gratis, pero suma dependencia y un segundo estilo de validación a un repositorio sin pruebas y con dos meses de plazo. La estructura declarativa cubre lo que estas dos pantallas necesitan.

### 8. La validación de servidor distingue guardado parcial de perfil completo

`PUT /api/dashboard/perfil` acepta guardados parciales (la candidata debe poder dejar el formulario a medias) pero calcula del lado del servidor el estado de completitud y devuelve la lista de campos pendientes. El estado "completo" que ve la agencia nunca lo decide el cliente.

## Risks / Trade-offs

- **Los documentos de producción ya perdidos no se recuperan con este cambio** → Antes de migrar se diagnostica en el VPS si los archivos están en el volumen (tarea 2.1). Si están, la normalización los deja accesibles; si no, quedan marcados como "vuelve a subirlo" y la clienta debe pedir la recarga a las candidatas afectadas. Hay que decírselo de frente, no descubrirlo ella.
- **Unificar los tres caminos de activación puede alterar un flujo que la clienta usa a diario** → `toggle-acceso` pasa a crear o confirmar una venta donde antes sólo cambiaba una bandera. Se cubre con el recorrido manual de la tarea 4.2 sobre los tres caminos antes de desplegar, y con reversión por commit si algo se rompe.
- **El decremento al anular puede desincronizarse si alguien edita la base a mano** → El script de reconciliación es reejecutable y deja el contador igual al `COUNT` real de usos.
- **Endurecer la validación puede dejar bloqueadas a candidatas que ya tienen perfiles a medias** → El bloqueo aplica al avanzar, no al guardar ni al entrar: nadie queda encerrado fuera de su perfil, y el resumen le dice exactamente qué le falta. Aun así, conviene revisar cuántos perfiles existentes quedarían incompletos bajo el criterio nuevo antes de anunciarlo.
- **Sin pruebas automatizadas, la verificación es manual** → Las tareas de la fase 4 fijan los recorridos exactos a ejecutar. Montar pruebas automatizadas excede este change y se propone para el siguiente sprint.
- **Migración de archivos con la aplicación arriba** → El movimiento del directorio y la normalización de `url` deben ocurrir en la misma ventana de despliegue; si la aplicación queda con el código nuevo y los archivos sin mover, todos los documentos aparecerán como no disponibles hasta completar el paso.

## Migration Plan

1. Desplegar con `UPLOADS_DIR` apuntando al nuevo directorio y el volumen montado ahí en `docker-compose.yml`.
2. En el VPS: inventariar qué hay bajo el volumen actual y mover los archivos al directorio de datos (tarea 2.1 y 2.7).
3. Ejecutar la normalización de `documentos_usuario.url` y la reconciliación de `usos_actuales`.
4. Verificar los recorridos de la fase 4 en producción con una candidata de prueba.
5. Reversión: los cambios son un commit por fase; el paso 3 tiene su contrapartida documentada en la migración, y los archivos no se borran del origen hasta verificar el paso 4.

## Open Questions

- ¿Existen los archivos de producción en el volumen, o se perdieron en el redeploy? Se resuelve con el inventario de la tarea 2.1 y determina si hay que pedir recargas a las candidatas.
- ¿Cuántos perfiles ya registrados quedan incompletos bajo el criterio de obligatoriedad nuevo? Se mide antes de anunciar el cambio a las candidatas.
- El monto por defecto de 35 USD que usa `toggle-acceso` al crear una venta sin código: ¿es el valor que la clienta quiere registrar cuando activa acceso a mano, o debería pedirlo explícitamente? Se asume el valor actual y se confirma con ella.
