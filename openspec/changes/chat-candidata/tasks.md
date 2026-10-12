## 1. Base

- [x] 1.1 `migrations/010_conversaciones.sql`: tablas, copia de `mensajes`, lecturas; idempotente
- [x] 1.2 Registrar 010 en `deploy/desplegar.sh`
- [x] 1.3 Aplicar en local dos veces (idempotencia) y comprobar que los 2 mensajes viejos quedan en la conversación del equipo

## 2. Reglas

- [x] 2.1 `lib/conversaciones-aupair.js`: `puede()`, `conversacionesDe()`, `iniciar()`, `mensajes()` (marca leído), `escribir()`, `entrar()`, `noLeidosPorCandidata()`
- [x] 2.2 `lib/tablero-aupair.js`: `fecha_nacimiento` y `no_leidos` por candidata para quien consulta

## 3. Rutas (declaradas en `docs/rutas-y-acceso.md` y `scripts/pruebas-humo.mjs` antes del handler)

- [x] 3.1 `GET` y `POST /api/conversaciones`
- [x] 3.2 `GET` y `POST /api/conversaciones/[id]/mensajes`
- [x] 3.3 `POST /api/conversaciones/[id]/entrar`
- [x] 3.4 Retirar `/api/admin/mensajes` y `/api/dashboard/mensajes`; los tableros pasan `no_leidos`

## 4. Interfaz

- [x] 4.1 `components/chat/Conversacion.jsx`: hilo, evento de ingreso, campo de escritura, «Iniciar conversación», «Entrar a la conversación», sondeo de 5 s
- [x] 4.2 `components/panel/VistaRapida.jsx`: chat + datos generales + «Ver perfil»; pestañas Equipo/Agencia para el admin
- [x] 4.3 `TableroEtapas`: la tarjeta y «Ver» de la lista abren la vista rápida; punto de no leídos
- [x] 4.4 `/admin/mensajes` y `/dashboard/mensajes` sobre `Conversacion`; conteo de no leídos en `app/dashboard/layout.jsx`

## 4b. Ajustes tras la revisión de Daniel (2026-10-12)

- [x] 4b.1 En la lista, dos íconos por fila: ojo → perfil completo; burbuja → vista rápida (chat). Se queda el ⋯ para mover
- [x] 4b.2 Los mensajes del equipo de Destino Au Pair, en ámbar (`T.amberBg` / `T.amberLine`), como su aviso de ingreso
- [x] 4b.4 Sólo el admin y la agencia inician conversaciones (botón «Iniciar conversación»); la candidata no: 403 en la API y sin conversación por iniciar en su bandeja
- [x] 4b.3 «Mensajes» en el menú de la agencia (R16) y del admin, con el conteo de no leídos

## 5. Verificación

- [x] 5.1 `npm run build` y `node scripts/pruebas-humo.mjs`
- [x] 5.2 Playwright — la agencia abre a su candidata desde el tablero y desde la lista, inicia la conversación y escribe; «Ver perfil» lleva a la ficha
- [x] 5.3 La candidata ve la conversación de su agencia en «Mensajes» con el no leído y responde; el punto aparece en el tablero de la agencia y se va al abrir
- [x] 5.4 El admin lee la conversación de agencia sin dejar rastro; pulsa «Entrar», la agencia y la candidata ven el evento; escribe
- [x] 5.5 Otra agencia: 404 al leer, escribir, iniciar o entrar; la candidata no lee conversaciones ajenas; la agencia no puede «entrar»
- [x] 5.6 La vista rápida de la agencia no trae notas internas, motivo ni score del equipo (revisar el JSON)
- [ ] 5.7 Limpiar datos de prueba

### Resultado de la verificación (2026-10-12, local, Playwright + API con tokens firmados)

- Migración 010 aplicada dos veces: los 2 mensajes viejos quedaron una sola vez en la conversación del equipo, con su fecha.
- Agencia 22 en el navegador: la tarjeta abre la vista rápida («Iniciar conversación» → escribe); «Ver perfil» → `/agencia/candidatas/15`; en la lista, el ojo lleva a la ficha y la burbuja abre el chat.
- Candidata 15 (API): ve la conversación de la agencia con 1 no leído y responde; el tablero de la agencia da `no_leidos: 1` y vuelve a 0 al abrirla.
- Admin: lee la conversación de agencia sin ingreso en el hilo; escribir sin entrar → 409; en el navegador ve «Estás leyendo…», pulsa «Entrar», aparece «Entraste a la conversación» y se habilita la caja; entrar dos veces deja un solo ingreso; la candidata ve «Revision Admin del equipo de Destino Au Pair entró a la conversación».
- Regla «sólo el admin y la agencia inician»: la candidata 14, sin conversaciones, ve «Todavía no tienes conversaciones…» sin caja ni botón; `POST /api/conversaciones` como candidata → 403. El admin abre la vista rápida de Laura, ve «Iniciar conversación», la inicia y escribe; Laura la ve en «Mensajes» con 1 no leído y puede responder. La candidata 15 sigue respondiendo en la de su agencia.
- Agencia 12 (ajena) sobre la conversación 5: leer, escribir, iniciar, entrar y `?candidata_id=15` → 404. Candidata 14 sobre la 5 → 404. Asociada: bandeja vacía y 404. La agencia no puede entrar (400).
- La fila del tablero que alimenta la vista rápida no trae notas internas, motivo ni score del equipo.
- `npm run build` bien; `pruebas-humo.mjs`: 632 en verde, 0 en rojo. (Los íconos de la lista y el color del equipo se hicieron después del build; cargan sin errores en dev.)

## 6. Despliegue

- [ ] 6.1 Contar `mensajes` en producción antes de desplegar
- [ ] 6.2 Con `deploy/desplegar.sh`, junto con o después de `etapas-candidata` y `panel-agencia`
- [ ] 6.3 Anotar R5/R16 en la bitácora y el cronograma como trabajo adicional cotizado
