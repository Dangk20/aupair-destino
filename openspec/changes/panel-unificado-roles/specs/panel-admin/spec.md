## ADDED Requirements

### Requirement: Todos los paneles comparten la misma cáscara

Los paneles de los distintos roles SHALL construirse sobre un mismo componente de navegación. Cada panel SHALL declarar únicamente **qué módulos ofrece**; la forma —barra lateral, cabecera en móvil, identidad de quien entró, salida— SHALL ser la misma para todos.

Lo que distingue a un rol de otro SHALL ser a qué módulos accede y qué puede hacer en ellos, NO cómo se ve ni cómo se navega.

#### Scenario: Un rol cualquiera entra a su panel

- **WHEN** un usuario de cualquier rol entra a su panel
- **THEN** encuentra la misma disposición y la misma línea gráfica que los demás roles
- **AND** ve únicamente los módulos que le corresponden

#### Scenario: Un módulo se añade a un rol

- **WHEN** se añade un módulo a la lista de un rol
- **THEN** aparece en su panel sin tocar la cáscara

### Requirement: Un módulo que aún no existe se muestra apagado, no se esconde

El menú SHALL mostrar los módulos de la arquitectura acordada aunque todavía no estén construidos, **claramente marcados como no disponibles y sin poder abrirse**.

Un módulo apagado informa de a dónde va la plataforma. Esto NO SHALL confundirse con mostrar datos o acciones que aparentan funcionar: un módulo apagado declara que algo no está; una cifra inventada afirma algo falso.

#### Scenario: Módulo aún no construido

- **WHEN** la clienta abre su panel
- **THEN** ve los módulos pendientes marcados como no disponibles
- **AND** no puede entrar a ellos

#### Scenario: Módulo disponible

- **WHEN** un módulo pendiente se construye y se declara disponible
- **THEN** deja de estar apagado y se abre con normalidad

### Requirement: El menú del panel de administración sigue la arquitectura acordada

El menú SHALL presentar los módulos con los nombres y la agrupación definidos en el alcance: Dashboard, Asociadas, Finanzas, Usuarios, Candidatas, Sesiones, Calendario, Reportes y Configuración. Las funciones económicas —ventas, comisiones y códigos— SHALL agruparse bajo Finanzas en lugar de figurar sueltas.

#### Scenario: La clienta busca las comisiones

- **WHEN** la clienta busca lo relacionado con dinero
- **THEN** lo encuentra agrupado en un solo lugar del menú

#### Scenario: Nombres acordados

- **WHEN** la clienta recorre el menú
- **THEN** los módulos se llaman como se acordó en el alcance, no como los nombró el proveedor anterior
