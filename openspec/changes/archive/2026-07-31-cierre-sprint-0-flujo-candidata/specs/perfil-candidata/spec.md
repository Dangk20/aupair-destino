## ADDED Requirements

### Requirement: Los campos obligatorios del perfil se declaran en una fuente única

El sistema SHALL definir en un módulo único, compartido por el cliente, el servidor y el cálculo de progreso, qué campos del perfil son obligatorios en cada sección de la Parte 1 ("Cuéntanos de ti") y de la Parte 2 (perfil para la agencia), incluidos los campos que se vuelven obligatorios según la respuesta a otro campo.

#### Scenario: Un campo condicional se vuelve obligatorio

- **WHEN** la candidata responde que sí le han negado una visa
- **THEN** el detalle de esa negación pasa a ser obligatorio para completar la sección

#### Scenario: Un campo condicional no aplica

- **WHEN** la candidata responde que no le han negado una visa
- **THEN** el detalle de esa negación no se exige y no bloquea el avance

#### Scenario: Coherencia entre progreso y validación

- **WHEN** una sección se muestra como completa en el indicador de progreso
- **THEN** esa misma sección pasa la validación al guardar, sin discrepancias entre ambos cálculos

### Requirement: El formulario impide avanzar con campos obligatorios sin diligenciar

El sistema NO SHALL permitir avanzar a la siguiente sección, saltar a otra sección desde el navegador lateral, ni dar por terminado el formulario mientras haya campos obligatorios vacíos en la sección activa. El trabajo parcial SHALL poder guardarse sin bloquear a la candidata.

#### Scenario: Intento de avanzar con campos vacíos

- **WHEN** la candidata pulsa "Guardar y continuar" con campos obligatorios vacíos
- **THEN** el sistema no avanza de sección
- **AND** muestra la alerta indicando que faltan campos por diligenciar

#### Scenario: Intento de saltar a otra sección con campos vacíos

- **WHEN** la candidata intenta ir a otra sección desde el navegador lateral dejando campos obligatorios vacíos
- **THEN** el sistema no cambia de sección y señala los campos que faltan

#### Scenario: Guardado parcial permitido

- **WHEN** la candidata pulsa "Guardar" sin avanzar y quedan campos obligatorios vacíos
- **THEN** el sistema guarda lo diligenciado hasta el momento
- **AND** le indica qué campos siguen pendientes sin impedirle salir

#### Scenario: Sección final

- **WHEN** la candidata completa la última sección con todos sus campos obligatorios
- **THEN** el sistema guarda y la devuelve al resumen de su perfil

### Requirement: Cada campo faltante se señala en rojo con su mensaje

El sistema SHALL marcar visualmente en rojo cada campo obligatorio vacío al validar, SHALL mostrar junto a él un mensaje que indique qué falta, SHALL presentar un resumen de los campos pendientes por su nombre visible y SHALL llevar el foco al primer campo con error. La marca de error de un campo SHALL desaparecer en cuanto la candidata lo diligencia.

#### Scenario: Validación fallida en una sección

- **WHEN** la validación falla por tres campos vacíos
- **THEN** los tres campos aparecen con borde rojo y su mensaje
- **AND** el resumen nombra los tres campos pendientes con la etiqueta que la candidata ve en pantalla
- **AND** el foco se ubica en el primero de ellos

#### Scenario: Corrección de un campo marcado

- **WHEN** la candidata diligencia un campo que estaba marcado en rojo
- **THEN** ese campo deja de mostrarse en error y sale del resumen de pendientes

#### Scenario: Campos obligatorios señalizados antes de validar

- **WHEN** la candidata abre una sección del formulario
- **THEN** los campos obligatorios se distinguen de los opcionales en su etiqueta

### Requirement: El servidor valida el perfil antes de darlo por completo

El sistema SHALL validar en el servidor los campos obligatorios al guardar el perfil y SHALL rechazar con detalle de los campos faltantes cualquier intento de marcar el perfil como completo sin cumplirlos, de modo que el estado que ve la agencia no dependa de la validación del navegador.

#### Scenario: Petición que pretende completar el perfil sin cumplir requisitos

- **WHEN** llega una petición de guardado que marcaría el perfil como completo con campos obligatorios vacíos
- **THEN** el servidor responde con error indicando la lista de campos faltantes
- **AND** el perfil no queda marcado como completo

#### Scenario: Guardado parcial legítimo

- **WHEN** llega una petición de guardado parcial con campos obligatorios aún vacíos
- **THEN** el servidor guarda los datos recibidos y responde indicando qué campos siguen pendientes

### Requirement: La Parte 2 se valida con el mismo criterio que la Parte 1

El sistema SHALL aplicar al perfil de agencia (Parte 2) las mismas reglas de bloqueo, marcado en rojo y resumen de pendientes que a la Parte 1, y SHALL considerar una sección completa sólo cuando todos sus campos obligatorios estén diligenciados.

#### Scenario: Avance bloqueado en el perfil de agencia

- **WHEN** la candidata intenta avanzar en el perfil de agencia con campos obligatorios vacíos
- **THEN** el sistema la bloquea y señala los campos igual que en la Parte 1

#### Scenario: Sección parcialmente diligenciada

- **WHEN** una sección del perfil de agencia tiene la mitad de sus campos obligatorios diligenciados
- **THEN** esa sección NO se considera completa para el progreso ni para el estado del perfil
