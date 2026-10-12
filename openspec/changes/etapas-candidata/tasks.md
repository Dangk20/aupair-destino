## 1. Datos

- [x] 1.1 `migrations/009_etapas_candidata.sql` (idempotente, con relleno) y registro en `deploy/desplegar.sh`; aplicar en local

## 2. Reglas y escritura

- [x] 2.1 `lib/etapas-candidata.js`: `ETAPAS`, `SALIDAS`, `etapaDe`, `scoreInformacion`
- [x] 2.2 `lib/historial-aupair.js`: `registrarHecho`, `moverEtapa`, `historialDe`, `contextoEtapa` (consulta perfil + abiertas + relación)
- [x] 2.3 Registrar hechos en registro, `perfil/enviar` y observaciones

## 3. Rutas (declaradas en `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs` antes del handler)

- [x] 3.1 `PUT /api/admin/perfiles/[id]/decision`; retirar `aprobar-evaluacion`
- [x] 3.2 `PUT /api/admin/perfiles/[id]/etapa`
- [x] 3.3 `GET /api/admin/perfiles/[id]/historial` y `GET /api/dashboard/historial`
- [x] 3.4 `GET /api/admin/tablero` y `GET /api/admin/agencias`
- [x] 3.5 Reescribir `GET /api/dashboard/proceso` sobre las etapas; retirar el `PUT` y `proceso_usuario`; actualizar ids en inicio, reuniones y recursos

## 4. Interfaz

- [x] 4.1 `components/perfil/LineaDeTiempo.jsx`
- [x] 4.2 Mi Destino y ficha propia con la línea de tiempo
- [x] 4.3 Ficha del admin: decisión, etapa, score, notas, línea de tiempo
- [x] 4.4 `components/panel/TableroEtapas.jsx` y `/admin/perfiles/tablero`, enlazado desde Candidatas

## 5. Verificación

- [x] 5.1 `npm run build` y `node scripts/pruebas-humo.mjs`
- [x] 5.2 Playwright — candidata nueva recorre: registro → envía Parte 1 (En revisión) → admin observa (Con correcciones) → corrige (En revisión) → admin aprueba con agencia (Evaluación de la agencia); la línea de tiempo muestra cada hecho con fecha en Mi Destino, en su perfil y en la ficha
- [x] 5.3 Tablero: la candidata en su columna; arrastrarla a Elección de plan, luego "Mover a" Pago confirmado; intentar mover una etapa calculada no se permite
- [x] 5.4 No califica: sin motivo se rechaza; con motivo, la candidata ve que no continúa y no ve el motivo; revertir vuelve a En revisión
- [x] 5.5 Score: coincide con el cálculo a mano para una candidata
- [x] 5.6 Inicio, reuniones y recursos de la candidata siguen cargando sin errores de consola
- [x] 5.7 Limpiar datos de prueba

### Resultado de la verificación (2026-10-12, local, Playwright + API)

- Candidata nueva: Diligenciando → (envía Parte 1) En revisión → (observación) Con correcciones → (corrige) En revisión → (aprobada con «Luisana UNO800» desde la ficha) Evaluación de la agencia. Aprobar sin agencia → 400.
- La línea de tiempo muestra cada etapa con su fecha y la agencia, igual en Mi Destino, en la pestaña Recorrido del perfil y en la ficha del admin (con autor).
- Tablero: arrastrar a Elección de plan y a Pago confirmado (200); menú ⋯ "Mover a" (200); las tarjetas de etapas calculadas no se arrastran ni tienen menú.
- **Hallazgos del recorrido, corregidos:** el enlace de la tarjeta se arrastraba en lugar de la tarjeta (`draggable={false}`); una columna fuera de pantalla no recibía la tarjeta (el tablero ahora se desplaza al arrastrar cerca del borde); "Diligenciando" no tenía fecha (toma la del registro); revertir una decisión era invisible para la candidata, que seguía viendo "No califica".
- Pedido de Daniel durante el recorrido: sin selector "Mover a" fijo en cada tarjeta (pasa a menú ⋯), y la tarjeta con lo clave —nombre completo, teléfono, correo, ciudad— al estilo de la referencia que compartió.
- No califica: sin motivo → 400; la candidata ve "No califica para el programa" y no el motivo (ni en su historial ni en su perfil); revertir con la agencia ya avanzada → 409.
- Score: 45% para la candidata de prueba, con el cálculo de `camposQueAplican` + 12 documentos.
- Inicio, reuniones y recursos cargan; los errores de consola son los 403/404 que ya existían (mensajes y `/api/dashboard/reunion`).
- `npm run build` y `pruebas-humo.mjs`: 637 en verde, 0 en rojo.

## 6. Despliegue

- [ ] 6.1 Junto con `panel-agencia` (`deploy/desplegar.sh`, lleva migración 009)
