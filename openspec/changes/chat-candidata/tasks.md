## 1. Base

- [ ] 1.1 `migrations/010_conversaciones.sql`: tablas, copia de `mensajes`, lecturas; idempotente
- [ ] 1.2 Registrar 010 en `deploy/desplegar.sh`
- [ ] 1.3 Aplicar en local dos veces (idempotencia) y comprobar que los 2 mensajes viejos quedan en la conversación del equipo

## 2. Reglas

- [ ] 2.1 `lib/conversaciones-aupair.js`: `puede()`, `conversacionesDe()`, `iniciar()`, `mensajes()` (marca leído), `escribir()`, `entrar()`, `noLeidosPorCandidata()`
- [ ] 2.2 `lib/tablero-aupair.js`: `fecha_nacimiento` y `no_leidos` por candidata para quien consulta

## 3. Rutas (declaradas en `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs` antes del handler)

- [ ] 3.1 `GET` y `POST /api/conversaciones`
- [ ] 3.2 `GET` y `POST /api/conversaciones/[id]/mensajes`
- [ ] 3.3 `POST /api/conversaciones/[id]/entrar`
- [ ] 3.4 Retirar `/api/admin/mensajes` y `/api/dashboard/mensajes`; los tableros pasan `no_leidos`

## 4. Interfaz

- [ ] 4.1 `components/chat/Conversacion.jsx`: hilo, evento de ingreso, campo de escritura, «Iniciar conversación», «Entrar a la conversación», sondeo de 5 s
- [ ] 4.2 `components/panel/VistaRapida.jsx`: chat + datos generales + «Ver perfil»; pestañas Equipo/Agencia para el admin
- [ ] 4.3 `TableroEtapas`: la tarjeta y «Ver» de la lista abren la vista rápida; punto de no leídos
- [ ] 4.4 `/admin/mensajes` y `/dashboard/mensajes` sobre `Conversacion`; conteo de no leídos en `app/dashboard/layout.jsx`

## 5. Verificación

- [ ] 5.1 `npm run build` y `node scripts/pruebas-humo.mjs`
- [ ] 5.2 Playwright — la agencia abre a su candidata desde el tablero y desde la lista, inicia la conversación y escribe; «Ver perfil» lleva a la ficha
- [ ] 5.3 La candidata ve la conversación de su agencia en «Mensajes» con el no leído y responde; el punto aparece en el tablero de la agencia y se va al abrir
- [ ] 5.4 El admin lee la conversación de agencia sin dejar rastro; pulsa «Entrar», la agencia y la candidata ven el evento; escribe
- [ ] 5.5 Otra agencia: 404 al leer, escribir, iniciar o entrar; la candidata no lee conversaciones ajenas; la agencia no puede «entrar»
- [ ] 5.6 La vista rápida de la agencia no trae notas internas, motivo ni score del equipo (revisar el JSON)
- [ ] 5.7 Limpiar datos de prueba

## 6. Despliegue

- [ ] 6.1 Contar `mensajes` en producción antes de desplegar
- [ ] 6.2 Con `deploy/desplegar.sh`, junto con o después de `etapas-candidata` y `panel-agencia`
- [ ] 6.3 Anotar R5/R16 en la bitácora y el cronograma como trabajo adicional cotizado
