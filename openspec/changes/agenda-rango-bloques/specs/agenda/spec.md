## ADDED Requirements

### Requirement: Disponibilidad por rango y bloque

El equipo SHALL configurar su disponibilidad con una fecha, un rango horario y una duración por sesión; el sistema SHALL generar los cupos de esa duración dentro del rango. SHALL rechazar un fin anterior al inicio, un rango menor que un bloque, un cruce con otra franja del mismo dueño ese día y una franja en el pasado (hora de Bogotá).

#### Scenario: Rango de 3 horas con bloques de 30 minutos
- **WHEN** el admin crea una franja el martes de 9:00 a 12:00 con bloques de 30 minutos
- **THEN** quedan 6 cupos: 9:00, 9:30, 10:00, 10:30, 11:00 y 11:30

#### Scenario: Repetir semanalmente
- **WHEN** crea la franja repitiendo 3 semanas
- **THEN** la misma franja y sus cupos quedan en los 4 martes

#### Scenario: Franja con reservas
- **WHEN** intenta borrar o editar una franja que tiene cupos reservados
- **THEN** se rechaza hasta que cancele esas reservas

### Requirement: Reserva sin doble cupo

Una candidata con `acceso_reuniones` SHALL reservar un cupo libre y futuro; SHALL tener a lo sumo una reunión activa futura. Dos reservas simultáneas del mismo cupo SHALL dar exactamente una reunión. Cancelar SHALL exigir una reunión confirmada y futura de quien cancela.

#### Scenario: Dos candidatas al mismo cupo
- **WHEN** dos candidatas reservan el mismo cupo a la vez
- **THEN** una lo obtiene y la otra recibe «Ese horario ya lo tomó otra persona»

#### Scenario: Confirmación por correo
- **WHEN** la candidata reserva
- **THEN** recibe un correo con la fecha, la hora y el enlace de la reunión, y los admins reciben su aviso

### Requirement: El equipo cancela una reserva

El admin SHALL poder cancelar una reserva desde el calendario; el cupo SHALL volver a estar libre y la candidata SHALL recibir un correo.

#### Scenario: Cancelar desde el calendario
- **WHEN** el admin cancela la reserva de una candidata
- **THEN** el cupo queda libre y la candidata recibe el aviso
