## ADDED Requirements

### Requirement: El recuadro muestra la próxima reunión de la candidata

El inicio y «Mi proceso» SHALL mostrar la reunión no cancelada más cercana
de hoy en adelante, con fecha y hora, leída de `GET /api/dashboard/reuniones`.

#### Scenario: Tiene una reunión agendada
- **WHEN** la candidata tiene una reunión confirmada para una fecha futura
- **THEN** el recuadro muestra su fecha y hora

#### Scenario: Sólo reuniones pasadas o canceladas
- **WHEN** todas sus reuniones son pasadas o están canceladas
- **THEN** el recuadro dice que aún no tiene una agendada e invita a agendar

#### Scenario: Sin 404
- **WHEN** la candidata abre `/dashboard` o `/dashboard/proceso`
- **THEN** ninguna petición responde 404
