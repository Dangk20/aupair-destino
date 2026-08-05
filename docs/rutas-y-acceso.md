# Inventario de rutas y control de acceso

**Levantado:** 2026-08-02 · Sprint 1 (`sprint-1-operacion-segura`, tarea 1.1)
**Alcance:** 84 rutas en `app/api/**`, 129 handlers (método × ruta).

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

## Rutas rotas conocidas

Responden **500**. Es deuda heredada, no un problema de permisos, y por eso
las pruebas de humo las declaran en `ROTAS_CONOCIDAS` en vez de fallar por
ellas: no bloquean el despliegue, pero salen listadas en cada ejecución. Si
una deja de estar rota, la prueba avisa para quitarla de la lista.

| Ruta | Error | Alcance |
|---|---|---|
| `/api/asociada/stats` | `usuarios.asesora_asignada_id` no existe | Sprint 3 |
| `/api/asociada/usuarias-asignadas` | igual | Sprint 3 |
| `/api/asociada/usuarias/[id]` | igual | Sprint 3 |
| `/api/admin/asociadas/asignar` | igual | Sprint 3 |
| `/api/admin/reuniones` | `reuniones.fecha` no existe · además sin consumidor | Sprint 3 |

### Una ruta que se llama y no existe

`/dashboard` y `/dashboard/proceso` piden **`/api/dashboard/reunion`** (en
singular) y esa ruta no existe: la real es `/api/dashboard/reuniones`, y
además devuelve `{ reuniones: [...] }` mientras las dos páginas leen
`.reunion`. Es decir, **el recuadro "Tu próxima reunión" de la pantalla de
inicio de la candidata nunca ha mostrado una reunión**: siempre dice "aún no
tienes una agendada", tenga o no tenga.

No se arregla aquí. Es un cambio de comportamiento visible en la primera
pantalla que ve una candidata, así que va por su propia propuesta —
corresponde al Sprint 2, junto con el dashboard con datos reales.

**Seis archivos consultan `usuarios.asesora_asignada_id` y la columna no
existe ni en local ni en producción.** El módulo de la asociada nunca
funcionó. `/api/auth/register` también la usa para asignar asesora
automáticamente, pero envuelto en un `try/catch` con `console.warn`: falla en
silencio en cada registro, así que esa asignación automática jamás ocurrió.

Se descubrió el 2026-08-02 al migrar el panel de la asociada a la cáscara
compartida. Las pruebas de humo no lo habían detectado porque sólo
comprobaban que un rol no recibiera 403 — y un 500 pasaba la aserción. Queda
corregido: ahora un 500 falla salvo que esté declarado aquí.

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

## `/api/admin/**` — 38 rutas, 68 handlers

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
| `/admin/comisiones` | GET | ✅ | `/admin/comisiones` |
| `/admin/comisiones/[id]/pagar` | POST | ✅ | `/admin/comisiones` |
| `/admin/configuracion` | GET, PUT | ✅ | `/admin/configuracion` |
| `/admin/confirmar-pago` | POST | ✅ | `/admin/pagos` |
| `/admin/disponibilidad` | GET, POST, PUT, DELETE | ✅ excepción | `/admin/reuniones` |
| `/admin/eventos` | GET, POST, PUT, DELETE | ✅ excepción | `/admin/reuniones`, `/dashboard/reuniones` |
| `/admin/mensajes` | GET, POST | ✅ | `/admin/mensajes` |
| `/admin/pagos/movimientos` | GET | ✅ | `/admin/pagos` |
| `/admin/pagos/stats` | GET | ✅ | `/admin`, `/admin/pagos` |
| `/admin/perfiles` | GET | ✅ | `/admin/perfiles` |
| `/admin/perfiles/[id]` | GET, PUT | ✅ | `/admin/perfiles/[id]` |
| `/admin/perfiles/[id]/descargar` | GET | ✅ | `/admin/perfiles` |
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

**Hueco cerrado en el barrido:** `GET /api/admin/eventos` no verificaba rol
alguno — cualquier sesión válida, incluida la de una candidata, leía la agenda
de la clienta y sus asesoras. Quedó así porque lo consume el calendario de la
candidata
(`app/dashboard/reuniones/page.jsx`), que hoy devuelve `<ComingSoon/>` de
forma incondicional en la línea 307 — pero su `useEffect` corre igual, así que
el navegador de la candidata seguía llamando la ruta. Cerrarla no rompió nada
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

### Verificación de propiedad

Revisadas las 5 rutas que reciben un identificador por parámetro:

| Ruta | Resultado |
|---|---|
| `/asociada/usuarias/[id]` | ✅ Ya acotada: el `WHERE` incluye `asesora_asignada_id = session.id` y responde 404 si la usuaria no es suya |
| `/asociada/reuniones/[id]/confirmar` | ✅ Ya acotada: comprueba que la reunión sea de una de sus referidas antes de confirmarla |
| `/ventas` | ✅ No recibe id: opera siempre sobre `session.id` |
| `/agencia/[id]` | 🔴 **Sin acotar — no hay modelo de datos que lo permita** |
| `/agencia/perfiles/[id]` | 🔴 **Sin acotar — mismo motivo** |

Tres de las cinco ya estaban correctas: la verificación vivía en el `WHERE`
de la consulta, no en un guard, y por eso no se veía en el barrido.

#### La agencia no tiene modelo de asignación

`/api/agencia/candidatas` entrega **todas** las candidatas con
`perfil_completo = 1` a **cualquier** cuenta con rol agencia. No existe
columna ni tabla que diga qué candidata corresponde a qué agencia:
`usuarios` sólo tiene `estado_agencia`, `progreso_agencia` y `notas_agencia`,
que son globales de la candidata, no por agencia.

No se puede añadir `requiereDueño` aquí: no hay dueño que consultar. Definir
ese modelo es exactamente el **ítem 7 del alcance** ("Usuarios por agencia"),
que depende de los talleres de descubrimiento y está planificado para el
Sprint 3.

Hay algo peor que la lectura: `PUT /api/agencia/perfiles/[id]` con
`accion=evaluar` guarda la evaluación en `agencia_evaluaciones` —que sí tiene
`agencia_id`, así que queda bien separada— pero además escribe
`usuarios.estado_agencia`, que es **una sola columna compartida**. Con dos
agencias, la evaluación de la segunda pisaría el estado que fijó la primera.

**Alcance real hoy:** existe **una** cuenta con rol agencia
(`operaciones@uno800.com`) y `agencia_evaluaciones` está vacía. No hay
exposición entre agencias porque no hay una segunda agencia. El día que se
cree la segunda, sin haber definido antes el modelo, cada una vería y
evaluaría a las candidatas de la otra.

**No abrir una segunda cuenta de agencia hasta cerrar el ítem 7.**

**Consistencia pendiente, sin efecto en el comportamiento:** 49 handlers de
nivel *sesión* siguen con `getSessionFromRequest` + `if (!session)` a mano en
vez de `requiereSesion`. Verifican lo correcto y responden 401 como deben; es
uniformidad de estilo, no un defecto. No entra en este sprint para no
engordar el diff de un sprint de seguridad.

El barrido de rol resultó mucho menor de lo que estimó el `design.md` (que
contaba por archivo, no por handler, y no incorporaba los guards del commit
`834ef03`). El trabajo real estaba en **los permisos de sección**.
