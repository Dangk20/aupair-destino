## 1. Datos

- [ ] 1.1 `migrations/009_etapas_candidata.sql` (idempotente, con relleno) y registro en `deploy/desplegar.sh`; aplicar en local

## 2. Reglas y escritura

- [ ] 2.1 `lib/etapas-candidata.js`: `ETAPAS`, `SALIDAS`, `etapaDe`, `scoreInformacion`
- [ ] 2.2 `lib/historial-aupair.js`: `registrarHecho`, `moverEtapa`, `historialDe`, `contextoEtapa` (consulta perfil + abiertas + relación)
- [ ] 2.3 Registrar hechos en registro, `perfil/enviar` y observaciones

## 3. Rutas (declaradas en `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs` antes del handler)

- [ ] 3.1 `PUT /api/admin/perfiles/[id]/decision`; retirar `aprobar-evaluacion`
- [ ] 3.2 `PUT /api/admin/perfiles/[id]/etapa`
- [ ] 3.3 `GET /api/admin/perfiles/[id]/historial` y `GET /api/dashboard/historial`
- [ ] 3.4 `GET /api/admin/tablero` y `GET /api/admin/agencias`
- [ ] 3.5 Reescribir `GET /api/dashboard/proceso` sobre las etapas; retirar el `PUT` y `proceso_usuario`; actualizar ids en inicio, reuniones y recursos

## 4. Interfaz

- [ ] 4.1 `components/perfil/LineaDeTiempo.jsx`
- [ ] 4.2 Mi Destino y ficha propia con la línea de tiempo
- [ ] 4.3 Ficha del admin: decisión, etapa, score, notas, línea de tiempo
- [ ] 4.4 `components/panel/TableroEtapas.jsx` y `/admin/perfiles/tablero`, enlazado desde Candidatas

## 5. Verificación

- [ ] 5.1 `npm run build` y `node scripts/pruebas-humo.mjs`
- [ ] 5.2 Playwright — candidata nueva recorre: registro → envía Parte 1 (En revisión) → admin observa (Con correcciones) → corrige (En revisión) → admin aprueba con agencia (Evaluación de la agencia); la línea de tiempo muestra cada hecho con fecha en Mi Destino, en su perfil y en la ficha
- [ ] 5.3 Tablero: la candidata en su columna; arrastrarla a Elección de plan, luego "Mover a" Pago confirmado; intentar mover una etapa calculada no se permite
- [ ] 5.4 No califica: sin motivo se rechaza; con motivo, la candidata ve que no continúa y no ve el motivo; revertir vuelve a En revisión
- [ ] 5.5 Score: coincide con el cálculo a mano para una candidata
- [ ] 5.6 Inicio, reuniones y recursos de la candidata siguen cargando sin errores de consola
- [ ] 5.7 Limpiar datos de prueba

## 6. Despliegue

- [ ] 6.1 Junto con `panel-agencia` (`deploy/desplegar.sh`, lleva migración 009)
