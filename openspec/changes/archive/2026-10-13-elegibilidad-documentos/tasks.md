## 1. Regla

- [x] 1.1 `lib/etapas-candidata.js`: `documentosCompletos()`, `documentosFaltantes()`; `etapaDe()` recibe `tiposDoc` y exige ambas condiciones para «En revisión»
- [x] 1.2 `lib/historial-aupair.js`: hecho `lista_revision`; `parte1_enviada` sin etapa; `contextoEtapa()` pasa los tipos y devuelve los faltantes; `registrarSiListaParaRevision()`
- [x] 1.3 `lib/tablero-aupair.js`: pasar los tipos a `etapaDe()`

## 2. Disparadores e interfaz

- [x] 2.1 `POST /api/dashboard/perfil/enviar` y `POST /api/dashboard/documentos` llaman a `registrarSiListaParaRevision()`
- [x] 2.2 `GET /api/dashboard/proceso`: con la Parte 1 enviada y documentos pendientes, el próximo paso dice cuántos faltan y lleva a `/dashboard/documentos`

## 3. Verificación

- [x] 3.1 `npm run build` y `node scripts/pruebas-humo.mjs`
- [x] 3.2 Candidata local con la Parte 1 enviada y documentos incompletos: «Diligenciando» en el tablero y en Mi Destino, con el próximo paso de documentos
- [x] 3.3 Sube el último obligatorio: pasa a «En revisión», el historial registra el hecho una vez; quitar y volver a subir no lo duplica
- [x] 3.4 Las aprobadas sin documentos siguen en «Evaluación de la agencia»

### Resultado de la verificación (2026-10-12, local, API)

- Laura (#14), con la Parte 1 completa antes del envío explícito y 1 de 8 documentos: pasó de «En revisión» a «Diligenciando»; su próximo paso dice «Te faltan 7 documentos obligatorios para pasar a revisión» con la lista y «Cargar documentos».
- Al subir los 7 restantes, el hecho `lista_revision` aparece justo con el octavo y la etapa pasa a «En revisión».
- Sin un documento (fila borrada en la base: la candidata no puede quitarlo por el bloqueo de R3) vuelve a «Diligenciando» con «Te falta 1 documento»; al resubirlo regresa a «En revisión» y el hecho sigue siendo uno.
- Las aprobadas #6 y #7 (2 y 0 documentos) siguen en «Evaluación de la agencia».
- `npm run build` bien; `pruebas-humo.mjs`: 632 en verde, 0 en rojo.

## 4. Despliegue

- [x] 4.1 Medir en producción cuántas pasan de «En revisión» a «Diligenciando» y decirlo al desplegar
- [x] 4.2 Desplegado el 2026-10-13 con `divisa-cop` (`deploy/desplegar.sh`). De las 9 no aprobadas, sólo una tiene los 8 obligatorios: las otras 8 quedan en «Diligenciando»
