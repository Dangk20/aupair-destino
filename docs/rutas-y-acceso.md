# Inventario de rutas y control de acceso

**Levantado:** 2026-08-02 · Sprint 1 (`sprint-1-operacion-segura`, tarea 1.1)
**Alcance:** 82 rutas en `app/api/**`, 127 handlers (método × ruta).

Este documento es la **fuente de verdad** del control de acceso de la API.
`scripts/pruebas-humo.mjs` deriva sus aserciones de estas tablas: una ruta
nueva sin nivel declarado aquí se detecta sola.

Si añades una ruta, decláralas aquí **antes** de escribir el handler.

## Los cuatro niveles

| Nivel | Qué exige | Guard |
|---|---|---|
| **pública** | nada | — |
| **sesión** | cookie `dap_token` válida, cualquier rol | `requiereSesion(req)` |
| **rol** | sesión con un rol determinado | `requiereAdmin(req)` / `requiereRol(req, rol)` |
| **permiso** | sesión + el permiso de sección que la candidata paga, **leído de la base** | `requierePermiso(req, seccion)` |

Regla general por prefijo:

```
/api/admin/**      → rol admin
/api/asociada/**   → rol asociada
/api/agencia/**    → rol agencia
/api/dashboard/**  → sesión, y permiso en las secciones que se pagan
/api/auth/**       → pública, salvo /auth/me
```

Los cinco permisos de sección son columnas de `usuarios`: `acceso_documentos`,
`acceso_mensajes`, `acceso_recursos`, `acceso_reuniones`, `acceso_comunidad`.
Se leen **de la base en cada petición**, nunca del JWT: el token los congela
hasta el siguiente ingreso y la confirmación de un pago debe surtir efecto ya.

## Excepciones declaradas

Una ruta que admite más de un rol sólo es válida si figura aquí, con su motivo.
Una excepción no declarada es un defecto, no una decisión.

| Ruta | Roles | Motivo | Revisar en |
|---|---|---|---|
| `/api/admin/disponibilidad` | admin · asociada | La agenda de disponibilidad es compartida: la clienta y sus asesoras publican franjas sobre el mismo calendario. Cada una sólo puede editar o borrar las suyas (verificación de propiedad ya presente en PUT y DELETE). | Sprint 3, al construir el panel de la asociada |
| `/api/admin/eventos` | admin · asociada | Mismo calendario, mismo motivo. | Sprint 3 |
| `/api/dashboard/proceso` (PUT) | admin | Vive bajo `/api/dashboard/**` pero escribe el avance del proceso de **otra** persona: es una acción administrativa colocada en el prefijo equivocado. El GET sí es de la candidata. | Sprint 3, al reorganizar módulos |

## Rutas sin consumidor

Ningún archivo fuera de `app/api/` las llama. Se dejan documentadas para que
el barrido no gaste esfuerzo en ellas y para que su retiro sea una decisión
explícita, no un olvido.

| Ruta | Handlers | Nota |
|---|---|---|
| `/api/admin/reuniones` | GET, POST, PUT, DELETE | La página `/admin/reuniones` no la usa: trabaja con `asesoras`, `disponibilidad` y `eventos`. |
| `/api/admin/toggle-perfil` | POST | Sin ninguna referencia en el repositorio. |
| `/api/app/**` | 10 rutas, 15 handlers | Project Center. Su base de datos no existe en el servidor. **Se eliminan en el grupo 6.** |

> Corrección al plan: `app/app/*` (las *páginas* de Project Center) **ya no
> existe** en el repositorio — sólo quedan sus rutas de API en `app/api/app/`.
> La tarea 6.2 se ajusta a esa realidad.

Mientras `/api/admin/reuniones` y `/api/admin/toggle-perfil` sigan existiendo,
se protegen como cualquier otra ruta de admin. No se retiran en este sprint:
no estaban declarados en el proposal y retirarlos sin verificar producción es
la clase de atajo que este sprint existe para evitar.

## Rutas públicas

Son las **únicas** siete que pueden responder sin sesión. Cualquier otra que
lo haga es un defecto.

| Ruta | Método | Por qué es pública |
|---|---|---|
| `/api/auth/login` | POST | Es el ingreso. |
| `/api/auth/logout` | POST | Borra la cookie; exigir sesión impediría salir de una sesión rota. |
| `/api/auth/register` | POST | Autorregistro de la candidata. |
| `/api/auth/forgot-password` | POST | Recuperación de contraseña. |
| `/api/auth/reset-password` | POST | Se autoriza con el token del correo, no con sesión. |
| `/api/codigos-promo/validar` | POST | La candidata valida su código antes de pagar, en el flujo público. |
| `/api/sesiones-public` | GET | Alimenta la landing (`sections/HeroSection1.jsx`). |

## `/api/admin/**` — 36 rutas, 66 handlers

Nivel objetivo: **rol admin**, salvo las excepciones declaradas arriba.

| Ruta | Métodos | Estado | Consumidor |
|---|---|---|---|
| `/admin/aprobar-evaluacion` | PUT | ✅ | `/admin/perfiles` |
| `/admin/asesoras` | GET | ✅ | `/admin/reuniones` |
| `/admin/asociadas` | GET, POST | ✅ | `/admin/asociadas`, `/admin/codigos-promo` |
| `/admin/asociadas/[id]` | GET, PUT, DELETE | ✅ | `/admin/asociadas/[id]` |
| `/admin/asociadas/asignar` | GET, POST | ✅ | `/admin/asociadas/[id]` |
| `/admin/bd-estructura` | GET | ✅ | `/admin/bd-verificar` |
| `/admin/codigos-promo` | GET, POST, PUT, DELETE | ✅ | `/admin/codigos-promo` |
| `/admin/configuracion` | GET, PUT | ✅ | `/admin/configuracion` |
| `/admin/confirmar-pago` | POST | ✅ | `/admin/pagos` |
| `/admin/disponibilidad` | GET, POST, PUT, DELETE | ✅ excepción | `/admin/reuniones` |
| `/admin/eventos` | POST, PUT, DELETE | ✅ excepción | `/admin/reuniones` |
| `/admin/eventos` | **GET** | 🔴 **sin verificación de rol** | `/admin/reuniones`, `/dashboard/reuniones` |
| `/admin/mensajes` | GET, POST | ✅ | `/admin/mensajes` |
| `/admin/pagos/movimientos` | GET | ✅ | `/admin/pagos` |
| `/admin/pagos/stats` | GET | ✅ | `/admin`, `/admin/pagos` |
| `/admin/perfiles` | GET | ✅ | `/admin/perfiles` |
| `/admin/perfiles/[id]` | GET, PUT | ✅ | `/admin/perfiles/[id]` |
| `/admin/perfiles/[id]/documentos` | GET, PUT, DELETE | ✅ | `/admin/perfiles/[id]` |
| `/admin/recursos` | GET, POST, DELETE | ✅ | `/admin/sesiones` |
| `/admin/referidos` | GET, POST | ✅ | `/admin`, `/admin/referidos` |
| `/admin/referidos/[id]` | PUT, DELETE | ✅ | `/admin/referidos` |
| `/admin/referidos/[id]/pagar` | POST | ✅ | `/admin/referidos` |
| `/admin/referidos/inscripciones` | GET | ✅ | `/admin/referidos` |
| `/admin/reuniones` | GET, POST, PUT, DELETE | ✅ | — sin consumidor |
| `/admin/sesiones` | GET, POST, PUT, DELETE | ✅ | `/admin/sesiones` |
| `/admin/stats` | GET | ✅ | `/admin`, `/admin/sesiones` |
| `/admin/toggle-acceso` | POST, PUT | ✅ | `/admin/usuarias` |
| `/admin/toggle-perfil` | POST | ✅ | — sin consumidor |
| `/admin/usuarias` | GET, PUT | ✅ | `/admin/usuarias`, `/admin/cambiar-roles` |
| `/admin/usuarias/[id]` | PUT | ✅ | `/admin/usuarias` |
| `/admin/usuarios/[id]/cambiar-rol` | PUT | ✅ | `/admin/cambiar-roles` |
| `/admin/usuarios/actividad` | GET | ✅ | `/admin/usuarias` |
| `/admin/usuarios/stats` | GET | ✅ | `/admin/usuarias` |
| `/admin/usuarios/top-referentes` | GET | ✅ | `/admin/usuarias` |
| `/admin/ventas` | GET | ✅ | `/admin/ventas` |
| `/admin/ventas/[id]/anular` | POST | ✅ | `/admin/ventas` |
| `/admin/ventas/[id]/confirmar` | POST | ✅ | `/admin/ventas` |

**Un solo hueco:** `GET /api/admin/eventos` no verifica rol alguno — cualquier
sesión válida, incluida la de una candidata, lee la agenda de la clienta y sus
asesoras. Quedó así porque lo consume el calendario de la candidata
(`app/dashboard/reuniones/page.jsx`), que hoy devuelve `<ComingSoon/>` de
forma incondicional en la línea 307 — pero su `useEffect` corre igual, así que
el navegador de la candidata sigue llamando la ruta. Cerrarla no rompe nada
visible.

## `/api/asociada/**` — 6 rutas, 6 handlers

Nivel objetivo: **rol asociada**. Las seis lo verifican.

| Ruta | Métodos | Estado | Propiedad |
|---|---|---|---|
| `/asociada/perfil` | PUT | ✅ | opera sobre `session.id` |
| `/asociada/reuniones` | GET | ✅ | — |
| `/asociada/reuniones/[id]/confirmar` | POST | ✅ | 🟡 revisar en 2.5 |
| `/asociada/stats` | GET | ✅ | — |
| `/asociada/usuarias-asignadas` | GET | ✅ | — |
| `/asociada/usuarias/[id]` | GET | ✅ | 🟡 revisar en 2.5 |

## `/api/agencia/**` — 4 rutas, 5 handlers

Nivel objetivo: **rol agencia**. Las cuatro lo verifican.

| Ruta | Métodos | Estado | Propiedad |
|---|---|---|---|
| `/agencia/[id]` | GET | ✅ | 🟡 revisar en 2.5 |
| `/agencia/candidatas` | GET | ✅ | — |
| `/agencia/perfiles` | GET | ✅ | — |
| `/agencia/perfiles/[id]` | GET, PUT | ✅ | 🟡 revisar en 2.5 |

## `/api/dashboard/**` — 15 rutas, 22 handlers

Nivel objetivo: **sesión**, más el **permiso** de la sección que se paga.
Aquí está el grueso del trabajo pendiente: de 22 handlers, **uno solo**
verifica permiso hoy.

| Ruta | Método | Nivel objetivo | Estado |
|---|---|---|---|
| `/dashboard/acceso` | GET | sesión | ✅ — es la ruta que informa los permisos |
| `/dashboard/bienvenida` | POST | sesión | ✅ |
| `/dashboard/completar` | POST | sesión | ✅ — avance del curso, no es sección de pago |
| `/dashboard/configuracion` | GET, PUT | sesión | ✅ |
| `/dashboard/disponibilidad` | GET | sesión + `acceso_reuniones` | 🔴 |
| `/dashboard/documento` | POST | sesión | 🟡 revisar — sube documentos desde el perfil; gatearlo con `acceso_documentos` podría bloquear el completado del perfil |
| `/dashboard/documentos` | GET | sesión + `acceso_documentos` | 🔴 |
| `/dashboard/documentos` | POST | sesión + `acceso_documentos` | ✅ — único que lo verifica hoy |
| `/dashboard/documentos` | DELETE | sesión + `acceso_documentos` | 🔴 |
| `/dashboard/foto` | POST | sesión | ✅ |
| `/dashboard/mensajes` | GET, POST | sesión + `acceso_mensajes` | 🔴 |
| `/dashboard/perfil` | GET, PUT | sesión | ✅ |
| `/dashboard/proceso` | GET | sesión | ✅ |
| `/dashboard/proceso` | PUT | rol admin | ✅ excepción |
| `/dashboard/recursos` | GET | sesión + `acceso_recursos` | 🔴 |
| `/dashboard/reuniones` | GET, POST, DELETE | sesión + `acceso_reuniones` | 🔴 |
| `/dashboard/sesiones` | GET | sesión | ✅ — contenido del curso |

**No hay ninguna ruta de `acceso_comunidad`.** La comunidad se resuelve hoy en
el cliente (`app/dashboard/comunidad/page.jsx`) sin llamar a la API. El
permiso existe en la base y lo aplica `AccessGate` en la interfaz; no hay
ruta que proteger.

## Rutas sueltas — 5 rutas, 8 handlers

| Ruta | Método | Nivel objetivo | Estado |
|---|---|---|---|
| `/auth/me` | GET | sesión | ✅ |
| `/codigos-promo/usar` | POST | sesión | ✅ |
| `/documentos/[id]` | GET | sesión + dueña o rol revisor | ✅ — cerrado en el Sprint 0.0 |
| `/sesion-recursos/[id]/archivo` | GET | sesión + admin o `acceso_recursos` | ✅ — cerrado en el Sprint 0.0 |
| `/ventas` | POST, GET | sesión + propiedad | 🟡 revisar en 2.5 |

## Estado del barrido

Medido por `scripts/pruebas-humo.mjs` contra el entorno local.

| Comprobación | Antes del barrido | Ahora |
|---|---|---|
| Cobertura del inventario | 144/144 | **144/144** |
| Sin sesión → 401 | 112/112 | **112/112** |
| Rol ajeno → 403 | 30/226 | **226/226** |
| Rol declarado → no 403 | 36/36 | **36/36** |
| Permiso leído de la base | 1/10 | **10/10** |

**528 aserciones, 0 en rojo.**

Qué cambió: 67 handlers pasaron de resolver el rol a mano
(`if (!session || session.rol !== "x") return unauthorized()`, que devolvía
401 donde corresponde 403) a usar `requiereAdmin` / `requiereRol`. Se cerró
`GET /api/admin/eventos`. Y 10 handlers de `/api/dashboard/**` pasaron a
verificar el permiso de sección con `requierePermiso`, que lo lee de la base.

Comprobado además con usuarias reales, porque las pruebas de humo sólo miden
el rechazo: la usuaria 6 —que tiene `acceso_documentos = 1` y
`acceso_recursos = 0`— recibe 200 en documentos y 403 en recursos con un
token que declara ambos permisos. El guard lee la columna correcta de la
base y manda sobre el token en las dos direcciones.

### Lo que queda

| Grupo | Qué falta |
|---|---|
| 2.5 propiedad | 5 rutas reciben un id por parámetro sin comprobar de quién es: `/asociada/reuniones/[id]/confirmar`, `/asociada/usuarias/[id]`, `/agencia/[id]`, `/agencia/perfiles/[id]`, `/ventas` |

**Consistencia pendiente, sin efecto en el comportamiento:** 49 handlers de
nivel *sesión* siguen con `getSessionFromRequest` + `if (!session)` a mano en
vez de `requiereSesion`. Verifican lo correcto y responden 401 como deben; es
uniformidad de estilo, no un defecto. No entra en este sprint para no
engordar el diff de un sprint de seguridad.

El barrido de rol resultó mucho menor de lo que estimó el `design.md` (que
contaba por archivo, no por handler, y no incorporaba los guards del commit
`834ef03`). El trabajo real estaba en **los permisos de sección**.
