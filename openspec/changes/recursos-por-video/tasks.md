## 1. La regla, en un solo lugar

- [ ] 1.1 `lib/curso-aupair.js` con `CURSO_LIBRE`, `estadosDeSesiones()` (el bucle de la ruta, sin cambios de comportamiento) y `sesionVisible()`
- [ ] 1.2 `GET /api/dashboard/sesiones` usa `estadosDeSesiones()`

## 2. Servidor

- [ ] 2.1 `GET /api/dashboard/sesiones` adjunta `recursos` (con `disponible` y la URL autenticada) sólo a las sesiones no bloqueadas
- [ ] 2.2 `/api/sesion-recursos/[id]/archivo`: `sesionVisible` en vez de `acceso_recursos`; `Content-Disposition: attachment` con el nombre y la extensión
- [ ] 2.3 `POST /api/admin/recursos`: rechazar con 400 lo que no sea PDF/Word o pase de 20 MB
- [ ] 2.4 `docs/rutas-y-acceso.md`: actualizar el nivel de `/sesion-recursos/[id]/archivo`

## 3. Interfaz

- [ ] 3.1 `/dashboard/curso`: sección "Recursos de esta clase" en la tarjeta de la sesión activa, con descarga y estado "No disponible"

## 4. Verificación

- [ ] 4.1 `npm run build`
- [ ] 4.2 `node scripts/pruebas-humo.mjs` contra local
- [ ] 4.3 Playwright — admin sube dos PDF a la sesión 1 desde `/admin/sesiones`; intenta subir un `.txt` por la API → 400
- [ ] 4.4 Playwright — candidata sin `acceso_recursos` abre `/dashboard/curso`: ve los dos recursos en la sesión 1, descarga uno y llega como adjunto con su nombre
- [ ] 4.5 Una sesión sin recursos no muestra la sección
- [ ] 4.6 La candidata pide por URL un recurso de una sesión bloqueada para ella → 403; la lista de sesiones no trae sus recursos
- [ ] 4.7 Un recurso cuyo archivo se borró del almacenamiento sale como "No disponible"
- [ ] 4.8 Limpiar los recursos y archivos de prueba

## 5. Despliegue

- [ ] 5.1 `bash deploy/desplegar-codigo.sh`; comprobar `sha256` de los archivos tocados en el VPS
- [ ] 5.2 Daniel sube un recurso real en producción y lo descarga con una cuenta de candidata
- [ ] 5.3 Anotar en la bitácora como trabajo adicional (R7) y avisar a la clienta que el material del curso queda abierto a quien ve el video
