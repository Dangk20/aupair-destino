# vista-candidatas-admin Specification

## Purpose
TBD - created by archiving change candidatas-una-vista. Update Purpose after archive.
## Requirements
### Requirement: Una sola pantalla de candidatas con las etapas del recorrido

La sección «Candidatas» del admin SHALL mostrar todas las candidatas con la
etapa calculada por `lib/etapas-candidata.js`, en vista de tablero o de lista,
y MUST NOT mostrar estados calculados con otro vocabulario.

#### Scenario: Entrar a Candidatas
- **WHEN** el admin abre `/admin/perfiles`
- **THEN** ve el tablero por etapas (o la lista, si fue la última que eligió) con todas las candidatas

#### Scenario: Enlace viejo al tablero
- **WHEN** el admin abre `/admin/perfiles/tablero`
- **THEN** llega a `/admin/perfiles`

### Requirement: Buscar, filtrar y exportar

La pantalla SHALL permitir buscar por nombre, correo o ciudad, filtrar por
etapa y exportar a CSV lo que esté filtrado, con nombre, correo, teléfono,
ciudad, etapa, porcentaje diligenciado y agencia.

#### Scenario: Búsqueda
- **WHEN** el admin escribe parte del nombre de una candidata
- **THEN** el tablero y la lista muestran sólo las que coinciden, y los conteos de cada columna se ajustan

#### Scenario: Filtro por etapa
- **WHEN** el admin elige «En revisión»
- **THEN** sólo aparecen las candidatas en esa etapa

#### Scenario: Exportar
- **WHEN** el admin pulsa Exportar
- **THEN** descarga un CSV con una fila por candidata filtrada y la etapa con el mismo nombre que ve en pantalla

### Requirement: Descargar el perfil desde la ficha

La ficha del admin SHALL ofrecer «Descargar perfil» (PDF y documentos en un ZIP).

#### Scenario: Descargar
- **WHEN** el admin pulsa «Descargar perfil» en `/admin/perfiles/<id>`
- **THEN** el navegador recibe el ZIP de `/api/admin/perfiles/<id>/descargar`

