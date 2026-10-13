# observaciones-perfil Specification

## Purpose
TBD - created by archiving change bloqueo-y-observaciones-perfil. Update Purpose after archive.
## Requirements
### Requirement: La candidata envía cada parte del perfil de forma explícita

En la última sección de la Parte 1 y de la Parte 2, el formulario SHALL ofrecer "Enviar" en lugar de sólo guardar, y SHALL pedir confirmación explicando que después sólo podrá corregir lo que el equipo le pida. El servidor SHALL registrar la fecha de envío sólo si la parte está completa.

#### Scenario: Enviar la Parte 1 completa

- **WHEN** la candidata completa la última sección de la Parte 1, pulsa "Enviar Parte 1" y confirma
- **THEN** la parte queda registrada como enviada con su fecha
- **AND** ve el aviso de siguiente paso

#### Scenario: Intentar enviar una parte incompleta

- **WHEN** llega a `POST /api/dashboard/perfil/enviar` la petición de enviar una parte con obligatorios vacíos o inválidos
- **THEN** el servidor responde 400 con lo que falta y la parte no queda enviada

### Requirement: Una parte enviada no se puede editar salvo lo observado

Después de enviar una parte, el sistema NO SHALL aceptar cambios a sus campos desde ninguna ruta de la candidata —perfil, configuración, foto, cédula— salvo los cubiertos por una observación abierta: la del propio campo o la de su sección. Un intento de cambiar un campo cerrado SHALL rechazarse con 403, indicando qué campo, sin guardar nada de esa petición.

El formulario de una parte enviada SHALL mostrar que fue enviada y llevar a la candidata a su perfil, donde están sus correcciones.

#### Scenario: Cambiar un campo cerrado por la API

- **WHEN** la candidata con la Parte 1 enviada manda a `PUT /api/dashboard/perfil` un cambio en su ciudad sin observación
- **THEN** el servidor responde 403 indicando que "Ciudad" está cerrada y no guarda nada

#### Scenario: Cambiar un campo cerrado desde Configuración

- **WHEN** la candidata con la Parte 1 enviada cambia su teléfono en `/dashboard/configuracion`
- **THEN** ve que ese dato ya fue enviado y no se puede cambiar, y el dato guardado no cambia

#### Scenario: Reenviar el formulario sin cambios

- **WHEN** llega una petición que trae campos de una parte enviada con los mismos valores que ya tienen
- **THEN** el servidor la acepta: sólo cuenta como cambio un valor distinto del guardado

#### Scenario: Abrir el formulario de una parte enviada

- **WHEN** la candidata abre `/dashboard/perfil/evaluacion` con la Parte 1 enviada
- **THEN** ve que la parte fue enviada y un acceso a su perfil, y no ve campos editables

### Requirement: Un documento cargado no se puede quitar ni reemplazar salvo con observación

Un documento cargado NO SHALL poder quitarse ni reemplazarse por la candidata, salvo que exista una observación abierta sobre ese tipo de documento. El servidor SHALL rechazarlo con 403.

#### Scenario: Quitar un documento cargado

- **WHEN** la candidata intenta quitar su pasaporte ya cargado, sin observación
- **THEN** la interfaz no le ofrece "Quitar" y el servidor responde 403 si la petición llega

#### Scenario: Cargar un documento que falta

- **WHEN** la candidata carga un documento que aún no había cargado
- **THEN** se acepta normalmente

### Requirement: El admin abre a corrección un campo, una sección o un documento con una observación

Desde la ficha de la candidata, el admin SHALL poder escribir una observación sobre un campo, sobre una sección completa o sobre un documento. Guardar la observación SHALL dejar ese elemento editable para la candidata de inmediato, sin otro paso. Una observación SHALL tener un texto no vacío.

La candidata SHALL recibir un aviso por correo de que tiene correcciones pendientes, respetando su preferencia de correo.

#### Scenario: Observación sobre un campo

- **WHEN** el admin escribe "La cédula no coincide con el documento" sobre el campo Cédula
- **THEN** la candidata puede editar Cédula, y sólo Cédula, de la Parte 1

#### Scenario: Observación sobre una sección

- **WHEN** el admin observa la sección "Referencias" de la Parte 2
- **THEN** la candidata puede editar todos los campos de esa sección, y ninguno más

#### Scenario: Observación sobre un documento

- **WHEN** el admin observa el documento "Antecedentes judiciales"
- **THEN** la candidata puede reemplazarlo, y ningún otro documento cargado

### Requirement: La candidata corrige desde su perfil y lo corregido se vuelve a cerrar

En `/dashboard/perfil`, la candidata SHALL ver sus observaciones abiertas con el texto del equipo y, junto a cada una, el campo, los campos de la sección o el documento a corregir. Al guardar un cambio que la cubre, la observación SHALL pasar a "atendida" y el elemento SHALL volver a quedar cerrado.

#### Scenario: Corregir un campo observado

- **WHEN** la candidata corrige la Cédula desde su perfil y guarda
- **THEN** el valor se guarda, la observación queda "atendida"
- **AND** un nuevo intento de cambiar la Cédula se rechaza

#### Scenario: Reemplazar un documento observado

- **WHEN** la candidata sube un nuevo archivo de antecedentes
- **THEN** reemplaza al anterior, vuelve a "pendiente" de revisión y la observación queda "atendida"

### Requirement: El admin ve el estado de cada observación y la cierra

La ficha de revisión SHALL mostrar las observaciones de la candidata con su estado (abierta, atendida, cerrada), su texto y su elemento. El admin SHALL poder cerrar una observación atendida o retirar una abierta; cerrar o retirar NO SHALL dejar nada editable.

#### Scenario: Revisar una corrección

- **WHEN** la candidata atendió una observación
- **THEN** el admin la ve como "atendida" junto al elemento y puede cerrarla

#### Scenario: Retirar una observación abierta

- **WHEN** el admin retira una observación que la candidata aún no atendió
- **THEN** el elemento vuelve a quedar cerrado para la candidata

