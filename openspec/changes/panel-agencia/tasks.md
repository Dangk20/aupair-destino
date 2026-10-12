## 1. Reglas y autorización

- [ ] 1.1 `lib/agencia-aupair.js`: `candidataDeAgencia()`
- [ ] 1.2 `lib/perfil.js`: modo `agencia`
- [ ] 1.3 `/api/documentos/[id]`: admitir a la agencia de la candidata

## 2. Rutas (declaradas en `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs` antes del handler)

- [ ] 2.1 `GET /api/agencia/tablero`
- [ ] 2.2 `GET /api/agencia/candidatas/[id]` y `GET .../documentos`
- [ ] 2.3 `PUT /api/agencia/candidatas/[id]/etapa`
- [ ] 2.4 `GET /api/agencia/candidatas/[id]/descargar`
- [ ] 2.5 Retirar `/api/agencia/candidatas` (vieja), `/api/agencia/perfiles`, `/api/agencia/perfiles/[id]`, `/api/agencia/[id]`

## 3. Interfaz

- [ ] 3.1 `FichaCandidata`: tabla de permisos (`propio`, `equipo`, `agencia`); `revision` como alias
- [ ] 3.2 `PestanaDocumentos`: modo agencia de sólo lectura
- [ ] 3.3 `/agencia`: tablero; `/agencia/candidatas/[id]`: ficha con etapa, mover, descargar y presentación
- [ ] 3.4 Menú de la agencia; retirar `perfiles`, `documentos`, `reportes`, `configuracion`

## 4. Verificación

- [ ] 4.1 `npm run build` y `node scripts/pruebas-humo.mjs`
- [ ] 4.2 Playwright — agencia A ve en su tablero sólo sus candidatas aprobadas; mueve una a Pago confirmado; la línea de tiempo de la candidata (y la del admin) lo muestran con la agencia como autora
- [ ] 4.3 Agencia A abre la ficha: sin Editar ni Observar, documentos sin aprobar/rechazar/quitar, ve la presentación y no las notas internas (comprobar también la respuesta JSON)
- [ ] 4.4 Agencia A descarga el ZIP de su candidata; agencia B recibe 404 en la ficha, los documentos, la descarga y al mover
- [ ] 4.5 Admin y candidata siguen viendo su ficha igual que antes
- [ ] 4.6 Limpiar datos de prueba

## 5. Despliegue

- [ ] 5.1 Contar `agencia_evaluaciones` en producción antes de desplegar
- [ ] 5.2 Junto con `etapas-candidata` (`deploy/desplegar.sh`)
