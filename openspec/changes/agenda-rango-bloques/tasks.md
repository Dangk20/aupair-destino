## 1. Base
- [x] 1.1 Migración `015_agenda.sql`: `agenda_franjas`, `disponibilidad.franja_id`, `reuniones.cupo_activo` único (idempotente)
- [x] 1.2 `lib/agenda-aupair.js`: hora de Bogotá, cálculo de cupos, crear/editar/borrar franjas, cupos libres, reservar, cancelar

## 2. API
- [x] 2.1 `/api/admin/agenda` (GET mes, POST, PUT, DELETE) y `/api/admin/agenda/reservas/[id]/cancelar`
- [x] 2.2 `/api/dashboard/disponibilidad` y `/api/dashboard/reuniones` sobre la librería; `GET /api/dashboard/eventos`
- [x] 2.3 Correos: reserva confirmada (candidata) y reserva cancelada por el equipo (candidata)
- [x] 2.4 Se retiran `/api/admin/disponibilidad` y `/api/admin/reuniones`; docs y humo al día

## 3. Pantallas
- [x] 3.1 Admin: nueva disponibilidad con rango, bloque y vista previa; día con franjas y cupos; cancelar reserva, editar y borrar franja
- [x] 3.2 Candidata: calendario encendido con cupos y duración, eventos visibles; «Agendar reunión» lleva al calendario

- [x] 3.3 Disponibilidad semanal estilo Google (`ModalHorario` + `crearPlanSemanal`), el equipo agenda a una candidata, vista de reserva por semana para la candidata; sin atajos Hoy/Semana — recorrido en navegador oculto: plan L–V 2–5 p. m. + sábado, 2 semanas → 64 sesiones; el admin agendó a una candidata desde un horario libre; el modal de eventos abre (faltaba importar `X`); candidata en computador y celular sin errores

- [x] 3.4 Horario semanal indefinido (`agenda_horario`, `sincronizar` a 60 días) y «Editar este día» (`agenda_excepciones`), «Administrar agenda» arriba a la derecha, sin «Lo que viene»; la hora se elige o se escribe — 16 comprobaciones por API en verde (repetición sin fin a 7 semanas, sin duplicados, día ajustado que no se pisa, reserva respetada, volver al semanal, cambio de horario rehace lo libre); pantallas sin errores de consola

## 4. Verificación
- [x] 4.1 `npm run build` y humo sin rojos — build en verde; humo 599/0
- [x] 4.2 Franja 9–12 con 30 min = 6 cupos; repetir; cruces, pasado y fin < inicio rechazados; reservas simultáneas al mismo cupo = 1; cancelar libera; doble cancelación no libera el cupo de otra; franja con reservas no se borra; hora de Bogotá después de las 7 p. m. — 22 comprobaciones por API en verde (17 oct, 10:34 p. m. de Bogotá: una franja de hoy a las 11:30 p. m. se abre y la candidata la ve; dos reservas simultáneas del mismo cupo → 200/409). Pantallas del admin (agenda, nueva disponibilidad con vista previa, detalle de reserva) y de la candidata (computador y celular: reservar, próxima reunión, cancelar) sin errores de consola. Datos de prueba borrados
