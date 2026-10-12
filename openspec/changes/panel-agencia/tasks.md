## 1. Reglas y autorización

- [x] 1.1 `lib/agencia-aupair.js`: `candidataDeAgencia()`
- [x] 1.2 `lib/perfil.js`: modo `agencia`
- [x] 1.3 `/api/documentos/[id]`: admitir a la agencia de la candidata

## 2. Rutas (declaradas en `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs` antes del handler)

- [x] 2.1 `GET /api/agencia/tablero`
- [x] 2.2 `GET /api/agencia/candidatas/[id]` y `GET .../documentos`
- [x] 2.3 `PUT /api/agencia/candidatas/[id]/etapa`
- [x] 2.4 `GET /api/agencia/candidatas/[id]/descargar`
- [x] 2.5 Retirar `/api/agencia/candidatas` (vieja), `/api/agencia/perfiles`, `/api/agencia/perfiles/[id]`, `/api/agencia/[id]`

## 3. Interfaz

- [x] 3.1 `FichaCandidata`: tabla de permisos (`propio`, `equipo`, `agencia`); `revision` como alias
- [x] 3.2 `PestanaDocumentos`: modo agencia de sólo lectura
- [x] 3.3 `/agencia`: tablero; `/agencia/candidatas/[id]`: ficha con etapa, mover, descargar y presentación
- [x] 3.4 Menú de la agencia; retirar `perfiles`, `documentos`, `reportes`, `configuracion`

## 3b. Ajustes tras la revisión de Daniel (2026-10-12)

- [x] 3b.1 `TableroEtapas`: las salidas como últimas columnas de la misma fila
- [x] 3b.2 `TableroEtapas`: vista «Lista»; la vista elegida se recuerda
- [x] 3b.4 En la lista, la etapa se cambia desde la columna Etapa (la píldora abre las etapas); sin ⋯ en la fila. Verificado: el menú abre bajo la píldora y mover a «Elección de plan» funciona
- [x] 3b.3 Verificar en Playwright: agencia y admin, tablero y lista; mover desde la lista

## 4. Verificación

- [x] 4.1 `npm run build` y `node scripts/pruebas-humo.mjs`
- [x] 4.2 Playwright — agencia A ve en su tablero sólo sus candidatas aprobadas; mueve una a Pago confirmado; la línea de tiempo de la candidata (y la del admin) lo muestran con la agencia como autora
- [x] 4.3 Agencia A abre la ficha: sin Editar ni Observar, documentos sin aprobar/rechazar/quitar, ve la presentación y no las notas internas (comprobar también la respuesta JSON)
- [x] 4.4 Agencia A descarga el ZIP de su candidata; agencia B recibe 404 en la ficha, los documentos, la descarga y al mover
- [x] 4.5 Admin y candidata siguen viendo su ficha igual que antes
- [x] 4.6 Limpiar datos de prueba

### Resultado de la verificación (2026-10-12, local, Playwright + API)

- Laura → «Revision Agencia» (22) y Dani → «Luisana UNO800» (12). El tablero de la agencia 22 trae sólo a Laura.
- Agencia 22 sobre Dani (ajena): ficha, documentos, descarga y mover → 404; su documento por `/api/documentos/[id]` → 403. Sobre Laura: documento 200, mover a Pago confirmado 200, mover a «En revisión» → 400 (etapa calculada), ZIP 200 con la hoja de vida y el pasaporte.
- La respuesta de la ficha trae `nota_dap` y no trae `notas_agencia`, `decision_dap_motivo`, `score_dap`, `calificacion_dap`, `password` ni `reset_token`; el historial no trae hechos internos.
- En el navegador: el menú de la agencia es sólo «Mis candidatas»; la ficha muestra etapa, «Descargar perfil», la presentación del equipo y la pestaña Recorrido; sin Editar, sin Observar; Documentos sin aprobar, rechazar, nota ni quitar.
- El admin conserva Editar y Observar; su historial muestra «Pasó a Pago confirmado (Revision Agencia)».
- `npm run build` y `pruebas-humo.mjs`: 639 en verde, 0 en rojo.

## 5. Despliegue

- [x] 5.1 Contar `agencia_evaluaciones` en producción antes de desplegar
- [x] 5.2 Junto con `etapas-candidata` (`deploy/desplegar.sh`)

### Despliegue (2026-10-12)

`deploy/desplegar.sh` con 009 y 010; respaldo previo `/var/respaldos-dap/20261012-1939`; 632 aserciones en verde dentro del contenedor. En producción: 2 agencias, `agencia_evaluaciones` vacía (0 filas: el flujo heredado no tenía datos), 3 mensajes viejos copiados a 3 conversaciones, historial rellenado (13 registros, 4 aprobadas). Quedan 4 aprobadas sin agencia: se asignan desde la ficha.
