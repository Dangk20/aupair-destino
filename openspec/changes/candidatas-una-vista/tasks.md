## 1. Pantalla

- [x] 1.1 `app/admin/perfiles/page.jsx`: tablero por etapas con búsqueda, filtro por etapa y Exportar (CSV); mover etapas como hoy en el tablero
- [x] 1.2 `app/admin/perfiles/tablero/page.jsx`: redirección a `/admin/perfiles`
- [x] 1.3 `app/admin/perfiles/[id]/page.jsx`: botón «Descargar perfil»

## 2. Lo que queda muerto

- [x] 2.1 Borrar `app/api/admin/perfiles/route.js` y quitar `GET /admin/perfiles` de `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs` (antes de compilar, para que el inventario no la busque)
- [x] 2.2 `grep` de `/api/admin/perfiles?` y de `estado_agencia` en `app/admin` sin consumidores — sin resultados

## 3. Verificación

- [ ] 3.1 `npm run build` y `node scripts/pruebas-humo.mjs` sin rojos
- [ ] 3.2 Playwright como admin: «Candidatas» abre el tablero; buscar «Laura» deja sólo a Laura; filtrar «En revisión» deja sólo esas; la lista sigue cambiando la etapa desde la columna Etapa; Exportar descarga un CSV con las filas filtradas; `/admin/perfiles/tablero` redirige — 14 candidatas en el tablero; «laura» deja 2 de 14 (las dos Laura Recorrido, #14 y #25); «En revisión» deja sólo a #14; 3 botones «Cambiar de etapa» en la lista; CSV `candidatas-2026-10-13.csv` con BOM y la etapa «En revisión»; la redirección llega a `/admin/perfiles`
- [ ] 3.3 Ficha: «Descargar perfil» responde 200 con un ZIP
- [ ] 3.4 Sin errores en la consola

## 4. Despliegue

- [ ] 4.1 Sin migración: `deploy/desplegar-codigo.sh`, junto con `candidatas-por-cupon` y `proxima-reunion`
