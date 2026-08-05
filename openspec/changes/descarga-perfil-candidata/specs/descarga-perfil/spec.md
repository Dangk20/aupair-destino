## ADDED Requirements

### Requirement: El perfil de una candidata se puede llevar fuera de la plataforma

El sistema SHALL permitir al personal descargar el perfil completo de una
candidata en un único archivo comprimido, que SHALL contener su hoja de vida en
PDF y los documentos que ella cargó.

La descarga SHALL exigir sesión de admin, con las mismas reglas que rigen la
ficha. NO SHALL existir enlace público, adivinable ni de un solo uso que permita
obtener el paquete sin sesión.

#### Scenario: El admin descarga el perfil desde el listado

- **WHEN** un admin pulsa Descargar en la fila de una candidata en `/admin/perfiles`
- **THEN** el navegador recibe un archivo `.zip` cuyo nombre identifica a la
  candidata
- **AND** dentro está su hoja de vida en PDF y una carpeta con sus documentos

#### Scenario: Quien no es admin no puede descargar

- **WHEN** una candidata, una asociada o una agencia solicitan la ruta de descarga
- **THEN** el sistema responde 403 y no devuelve dato alguno

#### Scenario: Sin sesión tampoco

- **WHEN** se solicita la ruta de descarga sin sesión
- **THEN** el sistema responde 401

#### Scenario: Candidata que no existe

- **WHEN** un admin solicita la descarga de un identificador que no corresponde a
  ninguna candidata
- **THEN** el sistema responde 404 y no genera archivo alguno

### Requirement: El PDF es la hoja de vida de la candidata

El PDF SHALL presentar a la candidata como una hoja de vida: su foto, su nombre y
sus datos de contacto, y a continuación las **quince secciones** del perfil tal
como se declaran en la fuente única de campos, con la etiqueta y el valor de cada
campo.

El PDF SHALL dibujarse en la línea gráfica del producto. NO SHALL escribirse en él
ninguna etiqueta que no venga de la declaración de campos: un campo nuevo declarado
allí aparece en el PDF sin tocar el generador.

#### Scenario: La candidata tiene foto

- **WHEN** se genera el PDF de una candidata con foto de perfil cargada
- **THEN** la foto aparece en el encabezado del documento

#### Scenario: La candidata no tiene foto

- **WHEN** se genera el PDF de una candidata sin foto
- **THEN** el documento se genera igual, con la inicial de su nombre en lugar de
  la foto, y no falla

#### Scenario: Campos sin diligenciar

- **WHEN** una candidata tiene campos vacíos
- **THEN** el PDF los muestra señalados como sin diligenciar, con el mismo
  criterio que la ficha, y NO los omite en silencio

#### Scenario: Se declara un campo nuevo en el perfil

- **WHEN** se añade un campo a una sección de la declaración única de campos
- **THEN** ese campo aparece en el PDF sin modificar el generador

#### Scenario: El PDF y la ficha dicen lo mismo

- **WHEN** se comparan el PDF y la ficha de la misma candidata
- **THEN** las secciones, su orden, las etiquetas y los valores coinciden

### Requirement: La valoración interna no sale en el paquete

El paquete descargado SHALL contener las quince secciones del perfil, incluidas
salud y visas. NO SHALL contener los campos de valoración interna del equipo
—`score_dap`, `calificacion_dap`, `nota_dap`, `notas_agencia`— ni el hash de
contraseña ni los testigos de recuperación.

#### Scenario: El PDF de una candidata con valoración interna diligenciada

- **WHEN** un admin descarga el perfil de una candidata que tiene `score_dap`,
  `nota_dap` y `notas_agencia` escritos
- **THEN** ninguno de esos valores aparece en ninguna página del PDF

#### Scenario: El PDF lleva las secciones sensibles del perfil

- **WHEN** un admin descarga el perfil de una candidata que respondió las
  preguntas de salud y de visas
- **THEN** esas respuestas sí aparecen en el PDF, porque son parte del perfil que
  la agencia evalúa

### Requirement: Los documentos van dentro del paquete

El paquete SHALL incluir, en una carpeta propia, cada documento que la candidata
cargó y cuyo archivo exista en el almacenamiento, con un nombre que identifique
de qué documento se trata.

Un documento registrado cuyo archivo se haya perdido NO SHALL impedir la
descarga, y su ausencia SHALL quedar constatada dentro del paquete.

#### Scenario: Candidata con documentos cargados

- **WHEN** un admin descarga el perfil de una candidata con documentos cargados
- **THEN** el ZIP trae una carpeta con esos documentos, cada uno con su extensión
  original y un nombre legible

#### Scenario: Candidata sin ningún documento

- **WHEN** un admin descarga el perfil de una candidata que no ha cargado nada
- **THEN** el ZIP se genera igual, con el PDF dentro, y no falla

#### Scenario: Un documento cuyo archivo se perdió

- **WHEN** una candidata tiene un `documentos_usuario` cuyo archivo no está en el
  almacenamiento
- **THEN** la descarga se completa con el resto
- **AND** el paquete deja constancia por escrito de qué documento faltó
