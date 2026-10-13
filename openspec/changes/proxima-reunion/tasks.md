## 1. Código

- [x] 1.1 `lib/reuniones.js`: `proximaReunion(reuniones)` y su formato de fecha y hora
- [x] 1.2 `app/dashboard/page.jsx` y `app/dashboard/proceso/page.jsx`: pedir `/api/dashboard/reuniones` y mostrar la próxima
- [x] 1.3 `docs/rutas-y-acceso.md`: retirar «Una ruta que se llama y no existe» y actualizar el párrafo de `asesora_asignada_id`

## 2. Verificación

- [x] 2.1 `npm run build` y `node scripts/pruebas-humo.mjs` sin rojos — humo 626 en verde, 0 en rojo
- [x] 2.2 Playwright como una candidata con una reunión futura confirmada: el recuadro muestra su fecha y hora en `/dashboard` y `/dashboard/proceso`; ninguna petición 404 en la consola — usuaria #4 con su reunión movida al 20 de octubre (luego devuelta al 17 de julio): «martes, 20 de octubre · 4:55 p. m.» en las dos páginas; 0 respuestas 404
- [x] 2.3 Con sólo reuniones pasadas o canceladas: el recuadro invita a agendar — usuaria #6 (cuatro canceladas): «Aún no tienes una agendada»

## 3. Despliegue

- [x] 3.1 Sin migración: `deploy/desplegar-codigo.sh`, junto con `candidatas-por-cupon` y `candidatas-una-vista` — desplegado el 13 oct con `deploy/desplegar-codigo.sh`; humo en producción 626 en verde, 0 en rojo
