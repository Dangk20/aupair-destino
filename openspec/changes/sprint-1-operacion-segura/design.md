## Context

Estado verificado el 31 de julio de 2026 sobre el código y sobre producción:

- **82 rutas** en `app/api/**`. Sólo **67** verifican sesión, **30** verifican rol y **3** verifican permiso de sección. Las 8 que no verificaban nada se cerraron ese día por urgencia (ya desplegado, commit `834ef03`), y de ahí salió el hallazgo de fondo: no hay un criterio aplicado de forma pareja, sino verificaciones puestas a mano ruta por ruta.
- **`app/api/auth/register/route.js:122`** escribe la cookie `dap_token` en toda llamada, incluida la del admin creando a otra persona. Es la causa del "crear un usuario me saca de la sesión".
- **Las comisiones no tienen pantalla.** `lib/ventas-aupair.js` las genera y `comisiones` las guarda desde el Sprint 0.0, pero no existe ni la ruta ni la vista.
- **La base `project_center` no existe en el servidor.** Aun así, `lib/db.js` abre un pool contra ella, 10 rutas la consultan y `middleware.js` mantiene su rama completa: segundo secreto JWT, segundo mapa de roles, segundo conjunto de prefijos protegidos.
- **El volumen `dap_uploads` persiste** entre despliegues (comprobado el 31 de julio: el contenedor se recreó y los archivos siguieron), pero no hay ningún respaldo automático.

Restricción: 10–15 h/semana, sprint de 2 semanas, sobre una plataforma con usuarias reales que no puede quedar caída.

## Goals / Non-Goals

**Goals:**

- Que ninguna ruta entregue datos a quien no debe, y que eso quede comprobado por una máquina y no por la memoria de quien programa.
- Que la clienta pueda gestionar comisiones y con eso opere su negocio sin depender de nosotros.
- Que los documentos de las candidatas no se puedan perder por un descuido.
- Sacar del repositorio la aplicación ajena que ensucia el archivo de seguridad.

**Non-Goals:**

- Retirar `referidos` / `referido_registros` (Sprint 3).
- Normalizar `usuarios` — deuda consciente.
- Almacenamiento de objetos para archivos y fotos (post-MVP).
- Suites unitarias y funcionales completas: aquí sólo las pruebas de humo de permisos.
- Rediseñar la interfaz del panel; la vista de comisiones sigue el estilo del módulo de ventas.

## Decisions

### 1. Guards declarativos en `lib/session-aupair.js`, no verificaciones a mano

Se completa la familia iniciada al cerrar la fuga: `requiereSesion(req)` y `requiereAdmin(req)` ya existen; se añaden `requiereRol(req, rol)`, `requierePermiso(req, seccion)` —que lee de la base— y `requiereDueño(req, usuarioId)`. Todo handler empieza con una línea:

```js
const guard = requiereAdmin(req);
if (guard.error) return guard.error;
```

*Alternativa descartada A:* resolver todo en `middleware.js`. Tentador porque centraliza, pero el middleware no puede consultar la base de datos (corre antes y en otro contexto), y los permisos por sección tienen que leerse de la base — que es justamente el bug del JWT congelado. Además dejaría la autorización lejos del handler que la necesita, que es lo que hoy hace difícil auditar.

*Alternativa descartada B:* un envoltorio `withAuth(handler, nivel)` que decore cada export. Más elegante, pero obliga a reescribir la firma de 82 handlers y a que quien lea el archivo entienda el envoltorio antes de entender la ruta. Con dos líneas explícitas al inicio, lo que pasa se ve sin saltar de archivo.

*Consecuencia:* la verificación se repite en cada handler. Es repetición deliberada: en control de acceso, lo explícito y auditable vale más que lo seco.

### 2. Un inventario de rutas como fuente de verdad

Se escribe `docs/rutas-y-acceso.md` (o equivalente) con las 82 rutas y su nivel. Las pruebas de humo se derivan de esa tabla, así que una ruta nueva sin nivel declarado se detecta sola.

*Alternativa considerada:* generar el inventario automáticamente leyendo el código. Más bonito, pero el nivel de acceso es una decisión de negocio —¿esta ruta la puede ver una agencia?— y no se deduce del código. La tabla se escribe a mano una vez y se mantiene.

### 3. `register` distingue autorregistro de creación administrativa

La ruta emite cookie sólo cuando **no** hay una sesión de admin en la petición. Si un admin está creando a otra persona, se crea el usuario y no se toca la cookie.

*Alternativa descartada:* una ruta aparte `/api/admin/usuarios` para creación administrativa. Es lo correcto a largo plazo y deja `register` limpio, pero duplica la validación de datos y el hasheo mientras el panel siga llamando a `register`. Se anota como mejora para el Sprint 3, cuando se toque el módulo de usuarios.

### 4. Permisos leídos de la base, con el JWT como pista

`requierePermiso` consulta la columna del usuario en cada petición que lo necesita. Es una consulta indexada por clave primaria; con este volumen, irrelevante. El JWT conserva los permisos sólo para que la interfaz pinte los estados sin esperar, nunca como fuente de autorización.

*Alternativa considerada:* refrescar el token al confirmar un pago. Ya se hace en parte, pero no cubre el caso de una sesión abierta en otro dispositivo. Leer de la base es lo único correcto.

### 5. Comisiones: vista de lectura y una sola acción de escritura

`GET /api/admin/comisiones` con filtros y totales; `POST /api/admin/comisiones/[id]/pagar`. La vista sigue el patrón de `/admin/ventas`.

Los totales excluyen las anuladas. El estado `anulada` ya existe desde el Sprint 0.0.

*Alternativa descartada:* pagos parciales o agrupados por asociada. La clienta no lo ha pedido y añade estado que hoy no existe. Si aparece la necesidad, entra como change propio.

### 6. Project Center se elimina, no se aísla

Se borran `/app/app/*`, `/app/api/app/*`, `lib/db.js`, `lib/session.js` y la rama del middleware, previa comprobación de que ninguna pantalla viva los importa.

*Alternativa descartada:* moverlo a un directorio `legacy/` o dejarlo tras una bandera. Aplaza la decisión y deja el ruido en el repositorio. Su base de datos no existe: no hay ningún escenario en el que ese código vuelva a servir. Y está en git, así que se puede recuperar del historial si hiciera falta.

### 7. Respaldo con las herramientas del servidor

Un script en el VPS, ejecutado por cron, que empaqueta el volumen y rota copias con retención de 14 días, fuera del árbol público y con permisos restringidos. Se prueba una restauración real y se deja constancia.

*Alternativa considerada:* respaldo fuera del servidor (S3/R2). Es lo correcto —un respaldo en el mismo disco no protege contra el fallo de ese disco— pero implica cuenta, credenciales y costo. Se hace lo local ahora, que cubre el error humano (el escenario más probable), y se anota el respaldo externo como deuda con su razón escrita.

### 8. Pruebas de humo sin framework

`scripts/pruebas-humo.mjs`: Node puro, `fetch` contra un entorno corriendo, sesiones de prueba por rol, y una aserción por regla del inventario. Sale con código distinto de cero si algo falla. El script de despliegue lo ejecuta.

*Alternativa descartada:* Vitest o Jest. Aportan estructura y buenos mensajes, pero suman dependencias y configuración a un repositorio sin ninguna prueba y con dos meses de plazo. Un script de Node se entiende sin aprender nada y corre en cualquier lado. Cuando existan pruebas unitarias de verdad (Sprint 2), se evalúa mover todo a un framework.

## Risks / Trade-offs

- **Cerrar rutas puede romper pantallas que las llamaban sin sesión** → El inventario se arma leyendo qué página consume cada ruta antes de tocarla, y las pruebas de humo cubren el camino feliz de cada rol. Aun así, el recorrido manual de las cuatro áreas es obligatorio antes de desplegar.
- **`requierePermiso` añade una consulta por petición** → Es por clave primaria y el volumen es de decenas de usuarias. Si algún día pesa, se cachea por petición.
- **Eliminar Project Center toca `middleware.js`, el archivo más sensible** → Se hace en un commit aislado, con las pruebas de humo corriendo antes y después, y verificando que las cuatro áreas siguen entrando.
- **El respaldo vive en el mismo servidor** → No protege contra la pérdida del VPS. Cubre el error humano, que es el escenario probable. El respaldo externo queda anotado como deuda.
- **El sprint mezcla seguridad, funcionalidad y saneamiento** → Es mucho para dos semanas a media jornada. Si hay que recortar, el orden de sacrificio es: primero el saneamiento de Project Center, después las pruebas de humo. **El control de acceso y las comisiones no se recortan**: son la razón del sprint.

## Migration Plan

1. Guards y barrido de rutas, por áreas y en commits separados (admin → asociada → agencia → dashboard).
2. Pruebas de humo, en cuanto exista el inventario: sirven de red para todo lo demás.
3. `register`, comisiones y errores de sesión.
4. Eliminación de Project Center, en su propio commit.
5. Migración de columnas muertas.
6. Respaldo y prueba de restauración en el VPS.
7. Despliegue con `deploy/desplegar.sh` (hay migración), verificación y recorrido manual por rol.

Reversión: cada bloque es un commit; el punto 5 tiene su contrapartida documentada. El respaldo del punto 6 se prueba antes de dar el sprint por cerrado.

## Open Questions

- ¿La clienta quiere registrar *cómo* pagó una comisión (medio, referencia) o basta con marcarla pagada? Se asume lo segundo; si quiere lo primero, son dos columnas más.
- ¿Cuántos días de respaldo conservar? Se asume 14; el disco del VPS y el tamaño actual (5,4 MB) lo permiten de sobra.
- El módulo `/admin/pagos` (sistema viejo) sigue existiendo aunque esté oculto del menú. ¿Se retira ya o espera al Sprint 3 con el resto de referidos? Se asume que espera.
