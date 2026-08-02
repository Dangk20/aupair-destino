## Why

La plataforma está viva, con candidatas reales y pagos reales, y hoy no es segura ni suficiente para que la clienta opere sola.

El 31 de julio se descubrió que ocho rutas `/api/admin/*` respondían sin pedir sesión: `/api/admin/pagos/movimientos` entregaba nombres, correos y montos pagados de las candidatas a cualquiera con la URL. Se cerraron ese mismo día por urgencia. Pero el hallazgo no fue un caso aislado sino la punta de un patrón: de 82 rutas, **sólo 30 verifican rol** y **sólo 3 verifican el permiso de sección** que la candidata paga. El control de acceso de la plataforma es, en la práctica, cosmético.

En paralelo, la clienta no puede cerrar su ciclo de negocio: las comisiones de las asociadas **se calculan y se guardan, pero no hay ninguna pantalla donde verlas ni marcarlas como pagadas**. Es la última pieza que le falta para poder gestionar el día a día sin depender de nosotros — y la condición acordada para que el resto del panel de administración deje de ser prioridad.

Y hay una deuda que agrava lo anterior: dentro del repositorio vive **una segunda aplicación completa (Project Center)** cuya base de datos **no existe en el servidor**, con su propio secreto JWT y su propio mapa de roles metidos en `middleware.js` — el archivo que decide quién entra a dónde. La fuga que cerramos vivía en ese terreno confuso.

## What Changes

### Control de acceso real en toda la API

- Las 82 rutas quedan clasificadas y protegidas: pública, requiere sesión, requiere rol, o requiere permiso de sección.
- **BREAKING (interno)**: toda ruta bajo `/api/admin/**` exige rol admin; bajo `/api/asociada/**` y `/api/agencia/**`, su rol. Un llamado directo sin la sesión correcta deja de funcionar.
- Los permisos que la candidata paga (documentos, mensajes, recursos, reuniones, comunidad) se verifican **contra la base de datos**, no contra el JWT, que los congela hasta el siguiente ingreso.
- Un usuario sólo accede a *sus* datos: hoy varias rutas aceptan un id por parámetro sin comprobar de quién es.

### El bug de sesión al crear usuarios

- **BREAKING**: `/api/auth/register` deja de escribir la cookie de sesión cuando la llamada viene de un admin creando a otra persona. Hoy el admin queda logueado como el usuario que acaba de crear — es el "me saca de la sesión" que reporta la clienta.
- Se revisa el mismo síntoma en el flujo de la candidata.

### Comisiones visibles

- Pantalla de comisiones en el panel: por asociada, con su estado, y la acción de marcarlas como pagadas. El backend ya existe desde el Sprint 0.0.
- Con esto, las tres cosas que la clienta necesita para operar —revisar perfiles, rastrear pagos, rastrear comisiones— quedan completas.

### Que los archivos no se puedan perder

- Respaldo diario automático del volumen de documentos en el servidor, con rotación y una restauración probada.
- Hoy los archivos sobreviven a un despliegue, pero no a un borrado accidental del volumen ni a un fallo de disco.

### Errores que estorban a diario

- El botón de ingresar no responde después de cerrar sesión.
- Cerrar sesión devuelve a la landing en vez de a la pantalla de ingreso.

### Saneamiento de la arquitectura heredada

- **BREAKING**: se elimina Project Center — `/app/app/*`, `/app/api/app/*`, `lib/db.js`, `lib/session.js` y su rama completa en `middleware.js`. Son 10 rutas que consultan una base inexistente.
- Se retiran las 5 columnas muertas de `usuarios` y la plantilla `saasly-nextjs-1.0.0/`.

### Pruebas de humo de permisos

- Script sin dependencias que verifica las reglas de acceso contra un entorno corriendo, y que el despliegue ejecuta antes de dar el visto bueno. Habría detectado la fuga el día que se introdujo.

## Capabilities

### New Capabilities

- `control-de-acceso`: quién puede llamar cada ruta de la API y con qué condiciones — sesión, rol, propiedad del recurso y permiso de sección pagado.
- `comisiones`: consulta y gestión de las comisiones generadas por las ventas con código de asociada.
- `respaldo-archivos`: resguardo periódico y restauración del almacenamiento de documentos y recursos.

### Modified Capabilities

Ninguna. Las reglas de acceso a documentos que fijó el Sprint 0.0 siguen vigentes tal cual; `control-de-acceso` las generaliza al resto de la API sin cambiar su comportamiento.

## Impact

**Código afectado**

- `lib/session-aupair.js` — guards `requiereAdmin`, `requiereSesion`; se añaden `requierePermiso` y `requiereDueño`.
- Las 82 rutas de `app/api/**` — clasificación y guard correspondiente.
- `app/api/auth/register/route.js` — dejar de emitir cookie en creación administrativa.
- `middleware.js` — retirar la rama de Project Center.
- `app/admin/comisiones/` y `app/api/admin/comisiones/` (nuevos).
- `app/login/page.jsx` y el flujo de cierre de sesión.
- `scripts/pruebas-humo.mjs` (nuevo) y `deploy/desplegar-codigo.sh`.

**Datos**

- Migración que elimina de `usuarios`: `experiencia_ninos`, `fecha_salida`, `estado_proceso`, `tiene_visa`, `fotos_perfil`.
- Ninguna otra tabla se toca. `referidos` y `referido_registros` se retiran en el Sprint 3, no aquí.

**Infraestructura**

- Cron diario de respaldo en el VPS, con su procedimiento de restauración documentado.

## Qué queda muerto

Este change **retira** deuda en lugar de producirla:

| Qué | Dónde | Por qué |
|---|---|---|
| Aplicación Project Center | `/app/app/*`, `/app/api/app/*` (10 rutas) | Su base de datos no existe en el servidor |
| Pool y sesión de Project Center | `lib/db.js`, `lib/session.js` | Sólo los usaba lo anterior |
| Rama de Project Center en el middleware | `middleware.js` | Segundo JWT y segundo mapa de roles en el archivo de seguridad |
| Columnas abandonadas | `usuarios`: `experiencia_ninos`, `fecha_salida`, `estado_proceso`, `tiene_visa`, `fotos_perfil` | Versiones viejas de columnas vivas; ninguna línea las menciona |
| Plantilla original | `saasly-nextjs-1.0.0/`, `README.md` de la raíz | Nadie la importa; el README es el de la plantilla |

**Deuda nueva que sí se produce:** la pantalla de comisiones se construye sobre el modelo actual (`comisiones` ligada a `ventas`). Cuando en el Sprint 3 se retire el sistema viejo de referidos, habrá que unificar ahí lo que quede de `referido_registros`. Queda anotado.

**Fuera de alcance**

- Retirar `referidos` y `referido_registros` (Sprint 3).
- Normalizar `usuarios` — deuda consciente, no se justifica con el volumen actual.
- Mover fotos base64 y archivos a almacenamiento de objetos (post-MVP).
- Suites unitarias y funcionales completas: aquí sólo entran las pruebas de humo de permisos.
