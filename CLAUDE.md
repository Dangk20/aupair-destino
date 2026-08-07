# CLAUDE.md — Destino Au Pair

Guía para Claude Code al trabajar en este repositorio.

> El contexto de negocio, el alcance cerrado y el estado del encargo viven en el
> `CLAUDE.md` de `proyectos/aupair/` (dos niveles arriba en el workspace Grexya).
> Este archivo cubre las reglas de ingeniería del repositorio.

## OpenSpec es obligatorio

**Todo cambio de comportamiento pasa por OpenSpec antes de tocar código.** Sin
excepción por tamaño: si cambia lo que el sistema hace, hay una propuesta.

Flujo:

1. `/opsx:propose "<qué se va a hacer>"` — genera `proposal.md`, `specs/`,
   `design.md` y `tasks.md` en `openspec/changes/<nombre>/`.
2. `/opsx:apply` — implementa marcando las tareas de `tasks.md` a medida que se
   completan.
3. `/opsx:archive` — al terminar y verificar, promueve las specs delta a
   `openspec/specs/` y archiva el change.

Reglas de uso:

- **Investigar antes de proponer.** El "Why" se sostiene en lo que se leyó del
  código o se consultó en la base de datos, no en suposiciones. Este repositorio
  fue dejado a medias por otro proveedor: lo que parece implementado con
  frecuencia está conectado a medias.
- **No implementar sin `tasks.md` completo y validado** (`openspec validate <nombre>`).
- **No cerrar una tarea sin verificarla.** No hay pruebas automatizadas: los
  recorridos manuales van escritos en `tasks.md` y se ejecutan de verdad.
- **Todo en español**, incluidos los artefactos de OpenSpec.
- Sólo se salta OpenSpec para cambios que no alteran comportamiento: formato,
  comentarios, renombres internos sin efecto visible.

El contexto del proyecto y las reglas por artefacto están en
`openspec/config.yaml` — se cargan solas al generar artefactos.

## Una sola aplicación (desde el Sprint 1)

El proveedor anterior construyó Destino Au Pair encima de una app ajena
("Project Center") y de la plantilla Saasly. **Ambas se retiraron en el
Sprint 1**: `app/api/app/**`, `lib/db.js`, `lib/session.js`, la rama de
Project Center en `middleware.js` y `saasly-nextjs-1.0.0/`. La base
`project_center` no existía en el servidor, así que esas 10 rutas fallaban al
conectarse.

Hoy queda una sola capa:

| | Destino Au Pair |
|---|---|
| Pool BD | `lib/db-aupair.js` → `destino_aupair` |
| Sesión | `lib/session-aupair.js`, cookie `dap_token`, `JWT_AUPAIR_SECRET` |
| Rutas | `/dashboard`, `/admin`, `/asociada`, `/agencia`, `/api/{auth,dashboard,admin,asociada,agencia,pago,codigos-promo,ventas,documentos,sesion-recursos}` |

Si encuentras una referencia a `lib/db.js`, `lib/session.js`, `JWT_SECRET`,
la cookie `token` o `/app/*`, es documentación vieja: ya no existe.

### Familias de columnas de `usuarios`

`usuarios` es una tabla ancha que acumuló varias versiones del formulario de
perfil. Antes de usar una columna, comprueba que sea la viva:

| Tema | Columna viva | Retiradas (migración 006) |
|---|---|---|
| Foto de perfil | `foto_url` | `fotos_perfil` |
| Experiencia con niños | `exp_ninos_externos`, `horas_exp_ninos`, `horas_childcare` | `experiencia_ninos` |
| Visa | `tiene_visa_j1`, `visa_negada` | `tiene_visa` |
| Avance del proceso | tabla `proceso_usuario` | `estado_proceso` |
| Fecha de viaje | — | `fecha_salida` |

Cuidado al buscar: `tiene_visa` casa como subcadena con `tiene_visa_j1`, que
sí se usa. Busca con delimitador de palabra.

Los permisos por sección son `acceso_documentos`, `acceso_mensajes`,
`acceso_recursos`, `acceso_reuniones` y `acceso_comunidad`; el acceso general
es `tiene_acceso` y el del perfil, `perfil_habilitado`.

De las cuatro preferencias `notif_*`, **sólo `notif_email` tiene lector**
(`lib/notificaciones-aupair.js`). `notif_plataforma`, `notif_mensajes` y
`notif_reuniones` siguen en la tabla pero no las lee nadie: se conservan porque
son los interruptores naturales de la mensajería y de los recordatorios cuando
esos módulos existan. Sus interruptores se retiraron de
`/dashboard/configuracion` para no prometer lo que no ocurre.

## Comandos

```bash
npm i
npm run dev     # next dev --turbopack, http://localhost:3000
npm run build
npm run lint
```

MySQL en `127.0.0.1:3307` (usuario `root`, sin contraseña), base `destino_aupair`.
Configurable con `DB_AUPAIR_HOST/PORT/USER/PASSWORD/NAME`. Local corre en Docker
(contenedor `dap-mysql`); producción, en el VPS por `docker-compose.yml`.

Consultar la base local:

```bash
docker exec dap-mysql mysql -uroot -proot destino_aupair -e "SELECT ..."
```

`GUIA_BD_ROLES.md` documenta las tablas y `COMANDOS_SQL_UTILES.sql` trae
consultas listas.

## Arquitectura

- **Roles**: `usuaria` (candidata), `asociada`, `agencia`, `admin`. Tabla única
  `usuarios` con enum `rol`; un rol por usuario. `middleware.js` verifica
  `dap_token`, aplica el mapeo rol↔prefijo de ruta y pasa la identidad a los
  handlers por cabeceras `x-dap-user-*`.
- **Puerta de pago**: `usuarios.tiene_acceso` más los permisos por sección
  (`acceso_documentos`, `acceso_mensajes`, …). El JWT los lleva embebidos, pero
  **son sólo una pista para pintar la interfaz, nunca la autorización**:
  `requierePermiso()` los lee de la base en cada petición, para que confirmar o
  anular un pago surta efecto sin que la candidata vuelva a ingresar.
- **Ventas y comisiones**: `lib/ventas-aupair.js` es el dueño único de la
  confirmación y anulación de una venta: permisos, consumo del código y comisión.
  Ninguna ruta debe encender permisos ni contar usos por su cuenta.
- **Patrón de ruta API**: cada handler empieza con su guard de
  `lib/session-aupair.js` y luego SQL parametrizado contra el pool:

  ```js
  const guard = requiereAdmin(req);          // o requiereRol(req, "asociada")
  if (guard.error) return guard.error;       // o await requierePermiso(req, "documentos")
  const session = guard.session;
  ```

  **El nivel que exige cada una de las 84 rutas está en `docs/rutas-y-acceso.md`.**
  Si añades una ruta, decláralo ahí *antes* de escribir el handler: las
  pruebas de humo fallan si encuentran una ruta sin nivel declarado.

- **Pruebas de humo**: `node scripts/pruebas-humo.mjs` — 541 aserciones de
  control de acceso contra un entorno corriendo. No escribe en la base, así
  que es segura contra producción. El despliegue la ejecuta dentro del
  contenedor y se detiene si falla.
- **Documentos**: archivos en el directorio de datos (`UPLOADS_DIR`, fuera de
  `public/`), servidos por ruta API autenticada. Las fotos de perfil siguen como
  data-URI base64 en columnas de MySQL — deuda técnica conocida.
- **Correo**: `lib/notificaciones-aupair.js` es el **dueño único** del correo
  saliente. Ninguna ruta instancia Resend ni arma HTML de correo por su cuenta.
  Tres garantías que sostiene el módulo: un fallo de correo nunca tumba la
  operación que lo originó, el envío no bloquea la respuesta (`after()` de
  Next), y un aviso de una sola vez no se repite (columna
  `notificaciones.clave_unica`, con el destinatario dentro de la clave).

  | Aviso | A quién | Dónde se dispara |
  |---|---|---|
  | Registro de candidata | admins | `app/api/auth/register/route.js` |
  | Bienvenida | candidata | `app/api/auth/register/route.js` |
  | Pago confirmado | admins | `lib/ventas-aupair.js` · `confirmarVenta()` |
  | Acceso activado | candidata | `lib/ventas-aupair.js` · `confirmarVenta()` |
  | Curso completado | admins | `app/api/dashboard/completar/route.js` |
  | Evaluación aprobada | candidata | `app/api/admin/aprobar-evaluacion/route.js` |
  | Reunión agendada / cancelada | admins | `app/api/dashboard/reuniones/route.js` |
  | Recuperar contraseña | quien la pide | `app/api/auth/forgot-password/route.js` |

  Los avisos a la candidata respetan `usuarios.notif_email`, leída de la base
  en cada envío. Los del admin no la consultan y van a todos los `rol='admin'`
  enviables, menos lo que liste `NOTIF_EXCLUIR_EMAILS`.

  **`RESEND_API_KEY` vacía en producción significa que no sale ningún correo**,
  incluida la recuperación de contraseña, y el fallo sólo se ve en la tabla
  `notificaciones` (`estado='omitido'`). Producción estuvo así desde el
  despliegue del 2026-07-23 hasta que se detectó el 2026-08-05.
- **Sitio público**: `app/(publicPages)/` + `sections/`, contenido de muestra en `data/`.

Utilidades del admin: `/admin/bd-verificar` (inspector del esquema en vivo) y
`/admin/cambiar-roles` (cambio de rol; no permite degradar admins).

## Convenciones

- Español en UI, comentarios, nombres de tabla y columnas.
- JavaScript, no TypeScript. Estilos en línea en las páginas ya existentes:
  seguir el estilo del archivo que se edita.
- SQL crudo parametrizado. Nada de concatenar valores en la consulta.
- Antes de dar algo por terminado: `npm run build` y `node scripts/pruebas-humo.mjs`.
  (`npm run lint` está roto de antes: llama a `next lint`, retirado en Next 16.)
