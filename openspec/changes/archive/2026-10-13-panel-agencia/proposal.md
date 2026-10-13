## Why

El panel de la agencia es un frontend heredado del proveedor, distinto en todo
al resto de la plataforma, y con su propio modelo del proceso. Verificado en el
código:

- **Ve a todas las candidatas** con `perfil_completo = 1`, sin filtro por
  agencia (`/api/agencia/candidatas`, `/api/agencia/perfiles`).
- **Tiene su propio flujo** (evaluar → plan de 2 o 4 cuotas → confirmar pago →
  "perfil en activación") sobre `agencia_evaluaciones` y una columna global
  `estado_agencia` que la última agencia que actúa pisa a las demás. La clienta
  lo reemplazó el 2026-10-12 por las etapas de `etapas-candidata`.
- **Recibe datos internos del equipo:** `perfilPublicable(fila, "revision")` le
  entrega `notas_agencia`, que son las notas internas.
- **Puede escribir el perfil de la candidata** (`accion: "actualizar_perfil"`
  escribe bio, hobbies, estatura… en `usuarios`).
- **Enlaces y rutas rotas:** `/agencia/perfiles/${id}` no existe;
  `/agencia/configuracion` llama a `/api/agencia/perfil`, que no existe.

Daniel lo fijó como regla del proyecto el 2026-10-12: **la interfaz de admin,
candidata y agencia es la misma; lo que cambia son los permisos.**

## What Changes

- **La agencia entra a un tablero** —el mismo componente del admin— con sus
  candidatas (las que el equipo aprobó y le envió) en las etapas de la agencia:
  Evaluación, Elección de plan, Pago confirmado, Visa, Completada, No continúa.
  Las mueve arrastrando o desde el menú de la tarjeta.
- **Abre la misma ficha** que ven la candidata y el admin, con permisos de
  agencia: ve el perfil completo, los documentos, la línea de tiempo y la
  "Presentación para la agencia"; puede **mover la etapa** y **descargar el
  perfil** (R13); no edita, no observa, no ve notas internas ni el motivo de
  No califica.
- **La ficha pasa de "modos" a una tabla de permisos** (`propio`, `equipo`,
  `agencia`), declarada en un solo lugar.
- **Todo se autoriza en el servidor** con la relación `candidata_agencia`: una
  agencia sólo lee y mueve a sus candidatas.
- **Se retira el panel heredado**: páginas `perfiles`, `documentos` y
  `reportes`, y las rutas `/api/agencia/{candidatas,perfiles,[id]}`.

## Capabilities

### New Capabilities

- `panel-agencia`: qué ve y qué puede hacer la agencia.

### Modified Capabilities

- `ficha-candidata`: la ficha se dibuja según una tabla de permisos por rol, y
  la agencia es uno de ellos.

## Impact

- Rutas nuevas: `GET /api/agencia/tablero`, `GET /api/agencia/candidatas/[id]`,
  `GET /api/agencia/candidatas/[id]/documentos`,
  `PUT /api/agencia/candidatas/[id]/etapa`,
  `GET /api/agencia/candidatas/[id]/descargar`; `/api/documentos/[id]` admite a
  la agencia de la candidata.
- Páginas: `app/agencia/page.jsx` (tablero), `app/agencia/candidatas/[id]/page.jsx`
  (ficha); menú de la agencia.
- `components/perfil/FichaCandidata.jsx`, `PestanaDocumentos.jsx`,
  `lib/perfil.js` (modo agencia).
- Sin migraciones.

## Fuera de alcance

- La comisión agencia → DAP al llegar a "Pago confirmado" (R17).
- Calendario, sesiones y mensajes de la agencia (R15, R16).
- La configuración de la cuenta de la agencia: su página llama a una ruta que
  no existe desde antes; se anota y se retira del menú hasta construirla.
- Varias agencias por candidata.

## Qué queda muerto

- Páginas `app/agencia/perfiles`, `app/agencia/documentos`,
  `app/agencia/reportes`, `app/agencia/configuracion`.
- Rutas `/api/agencia/candidatas`, `/api/agencia/perfiles`,
  `/api/agencia/perfiles/[id]`, `/api/agencia/[id]`.
- La tabla `agencia_evaluaciones` deja de usarse. **No se borra en este
  change:** antes hay que contar sus filas en producción; si está vacía, se
  retira en una migración aparte.
- `estado_agencia`, `calificacion_dap` y `score_dap` dejan de escribirse y de
  leerse en el admin y la agencia. Los sigue leyendo el panel de la asociada
  (fuera de alcance); se retiran cuando ese panel pase por el mismo cambio.
