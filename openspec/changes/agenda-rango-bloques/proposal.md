## Por qué

Ítems **9** y **10** (reuniones e indicador de calendario reales). El objetivo del módulo (Daniel, 17 oct 2026): el equipo configura su disponibilidad por día —un rango (9:00–12:00) y un bloque por sesión (30 min)— y el sistema calcula solo los cupos que las candidatas reservan para resolver dudas.

Auditoría (17 oct):
- Cada «Horario disponible» es UN cupo con toda la franja: 9:00–12:00 es una cita de 3 horas. No hay bloque ni cálculo de cupos, ni validación de fin > inicio, cruces o fechas pasadas.
- **Doble reserva posible**: la reserva lee y escribe sin transacción y el UPDATE no exige `estado='disponible'`; no hay índice único de cupo activo. Cancelar dos veces una reunión libera el cupo que otra candidata reservó entretanto.
- **Zona horaria**: `CURDATE()` corre en UTC; desde las 7 p. m. de Bogotá desaparecen los cupos del día.
- La pantalla de la candidata está apagada («Próximamente») y, encendida, pide los eventos a una ruta de admin (403) y parsea mal las fechas.
- Los avisos de reunión sólo llegan a los admins; la candidata no recibe confirmación.
- `/api/admin/reuniones` consulta columnas que no existen (sin consumidor).

## Qué cambia

- **Franjas** (`agenda_franjas`, migración 015): dueño, fecha, hora inicio, hora fin, duración del bloque, enlace de la reunión y notas. Al guardarla se generan sus cupos en `disponibilidad` (`franja_id`), de `duracion` en `duracion`. Validaciones: fin > inicio, el rango alcanza al menos un bloque, sin cruces con otra franja del mismo dueño ese día, nada en el pasado (hora de Bogotá). Una franja con reservas no se edita ni se borra: primero se cancelan sus reservas.
- **Reserva atómica**: transacción con bloqueo de la candidata; el cupo se toma con `UPDATE … WHERE estado='disponible'` y un índice único de cupo activo (`reuniones.cupo_activo`) impide dos reservas del mismo cupo. Una reunión activa por candidata. Cancelar exige una reunión confirmada y futura, y sólo libera el cupo si sigue siendo de esa candidata.
- **El equipo cancela una reserva** desde el calendario: la candidata recibe un correo.
- **La candidata** ve los cupos libres del equipo (franjas con dueño admin), con su duración, y recibe un correo al reservar. La pantalla se enciende; los eventos visibles salen de `GET /api/dashboard/eventos`. «Agendar reunión» vuelve a llevar al calendario.
- **Hora de Bogotá** para «hoy» y «ahora» en todo el módulo (`lib/agenda-aupair.js`).
- **Horario semanal indefinido, como Google Calendar** (Daniel, 17 oct): «Administrar agenda» guarda por cada persona del equipo la duración de la cita y los horarios por día de la semana (`agenda_horario`, migración 016). Se repite sin fecha de fin: el sistema mantiene abiertos los cupos de los próximos 60 días (`sincronizar`, con candado de MySQL). Cambiar el horario rehace lo futuro sin reservas.
- **Editar este día** (como «Disponibilidad ajustada»): ese día deja de seguir el horario semanal (`agenda_excepciones`) y queda con sus horarios o como no disponible; «Volver al horario semanal» lo deshace. Lo reservado se respeta: un horario que se cruce con una reserva se rechaza, salvo dejarlo igual.
- **El equipo agenda a una candidata** desde su panel tocando un horario libre (`POST /api/admin/agenda/reservas`), con las mismas reglas de la reserva; ella recibe la confirmación. Cuando exista la agenda de cada agencia (R15), usará este mismo flujo.
- **La candidata agenda como en un agendador tipo Salesmate**: primero «¿Con quién quieres agendar?» (las personas del equipo con horarios libres, su duración y su próximo horario; con una sola persona entra directo) y luego la agenda de esa persona en tres columnas: quién y «¿Qué quieres resolver?», el mes con los días disponibles y los horarios del día; tocar un horario lo convierte en «Confirmar».
- **Pantalla del admin**: el mes compacto con puntos (se navega por él, sin atajos) y la agenda por día; editar una franja con rango, bloque y vista previa; el día muestra cada franja con sus cupos (libres y reservados con el nombre de la candidata) y permite cancelar una reserva, editar o borrar la franja. Los eventos siguen igual.
- **Se retiran** `/api/admin/disponibilidad` (cupos sueltos) y `/api/admin/reuniones` (roto). Los cupos sueltos anteriores (sin franja) dejan de ofrecerse.

## Fuera de alcance

- La agenda propia de cada agencia y que la candidata vea sólo la de su agencia (R15, se cotiza aparte). El modelo ya admite cualquier dueño.
- Recordatorios automáticos antes de la reunión.
- El calendario de la asesora (`/asociada/reuniones`, cruza la tabla heredada `referidos`): resto del ítem 8.
