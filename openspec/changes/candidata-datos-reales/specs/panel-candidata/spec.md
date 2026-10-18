## ADDED Requirements

### Requirement: El panel no promete lo que no ocurre

El panel de la candidata SHALL mostrar sólo datos leídos de la base o acciones que funcionan. Ningún control SHALL quedar sin efecto ni mostrar cifras escritas a mano.

#### Scenario: Sin avisos dentro de la plataforma
- **WHEN** la candidata abre cualquier pantalla de su panel
- **THEN** no aparece una campana con un punto de aviso que no lleva a nada

#### Scenario: Comunidad sin enlace configurado
- **WHEN** `configuracion.comunidad_whatsapp` está vacío
- **THEN** la pantalla de comunidad no muestra el botón de unirse

### Requirement: Recursos reales

La biblioteca de recursos SHALL listar los archivos de `sesion_recursos` agrupados por sesión, sólo de las sesiones que la candidata puede ver.

#### Scenario: Sesión con recursos
- **WHEN** el admin subió una guía a la sesión 2
- **THEN** la candidata la ve bajo la sesión 2 en Recursos y la puede descargar

### Requirement: Agendar mientras el calendario esté apagado

«Agendar reunión» SHALL abrir el WhatsApp del programa con un mensaje listo, mientras el calendario no esté habilitado.

#### Scenario: Agendar desde el inicio
- **WHEN** la candidata toca «Agendar reunión»
- **THEN** se abre WhatsApp con el número de `configuracion.whatsapp` y un mensaje con su nombre

### Requirement: Certificado al terminar el curso

El certificado SHALL estar enlazado desde el inicio y el curso cuando la candidata completó todas las sesiones, SHALL usar el número real de sesiones y SHALL negarse si el curso no tiene sesiones.

#### Scenario: Curso terminado
- **WHEN** la candidata completa la última sesión
- **THEN** ve «Ver mi certificado» y el certificado dice cuántas sesiones completó

### Requirement: Indicadores coherentes

El porcentaje del curso SHALL ser 0 cuando no hay sesiones, y «Mi proceso» SHALL mostrar el mismo próximo paso que el inicio.

#### Scenario: Perfil sin enviar
- **WHEN** la candidata tiene acceso y documentos, pero no ha enviado su perfil
- **THEN** ninguna pantalla dice «Perfil en revisión»
