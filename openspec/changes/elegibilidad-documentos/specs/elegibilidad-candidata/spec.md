## ADDED Requirements

### Requirement: En revisión exige la Parte 1 y los documentos obligatorios

Una candidata SHALL estar «En revisión» sólo si envió la Parte 1 (o la completó antes del envío explícito) **y** tiene cargados los documentos marcados como obligatorios en `lib/documentos.js`. Si le falta cualquiera de las dos cosas, SHALL estar en «Diligenciando». Las candidatas con decisión del equipo o con agencia SHALL conservar la etapa que les da la decisión o la agencia.

#### Scenario: Envía la Parte 1 sin documentos

- **WHEN** la candidata envía la Parte 1 y tiene 5 de los 8 documentos obligatorios
- **THEN** sigue en «Diligenciando» y su próximo paso le dice que le faltan 3 documentos, con acceso a cargarlos

#### Scenario: Carga el último documento

- **WHEN** la candidata con la Parte 1 enviada carga el octavo documento obligatorio
- **THEN** pasa a «En revisión» y el historial registra «Completó la Parte 1 y sus documentos» con esa fecha

#### Scenario: Una aprobada sin documentos no retrocede

- **WHEN** una candidata aprobada antes de este cambio no tiene los documentos
- **THEN** sigue en «Evaluación de la agencia»

### Requirement: El paso a revisión queda una vez en el historial

El hecho «Completó la Parte 1 y sus documentos» SHALL registrarse la primera vez que se cumplen las dos condiciones, sea al enviar la Parte 1 o al cargar un documento, y no SHALL repetirse.

#### Scenario: Quita y vuelve a subir un documento

- **WHEN** una candidata en revisión quita un documento obligatorio y lo vuelve a subir
- **THEN** mientras falta está en «Diligenciando», vuelve a «En revisión» al subirlo y el historial no duplica el hecho
