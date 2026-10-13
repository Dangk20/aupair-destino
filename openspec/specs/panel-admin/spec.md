# panel-admin Specification

## Purpose
TBD - created by archiving change sprint-1-operacion-segura. Update Purpose after archive.
## Requirements
### Requirement: El panel no muestra cifras que no puede sostener

El panel de administración NO SHALL presentar métricas, gráficas ni totales que no provengan de datos vivos de la plataforma. Una cifra que no se puede sostener con una consulta a la base SHALL retirarse, no rellenarse con un valor de muestra.

Esta regla existe porque la clienta toma decisiones de negocio con lo que ve en pantalla: una cifra inventada es peor que ninguna cifra.

#### Scenario: Pantalla de entrada al panel

- **WHEN** el admin entra a `/admin`
- **THEN** no ve ninguna gráfica sin datos detrás
- **AND** no ve ningún indicador cuyo valor contradiga a otro de la misma pantalla

#### Scenario: Datos del sistema de referidos

- **WHEN** el admin entra a `/admin`
- **THEN** la pantalla no muestra la tabla de referidos ni sus totales
- **AND** la pantalla no ofrece crear un referente

### Requirement: El panel no ofrece acciones que no existen

El panel NO SHALL presentar controles —botones, filtros o selectores— que no ejecuten ninguna acción. Un control visible SHALL responder al usarse.

#### Scenario: Controles de la pantalla de entrada

- **WHEN** el admin recorre `/admin` y usa cada control visible
- **THEN** cada uno produce un efecto observable
- **AND** no encuentra filtros de rango de fechas, comparación entre periodos ni exportación de reportes, porque ninguno de los tres está implementado

### Requirement: El punto de entrada del panel orienta hacia los módulos operativos

Mientras el resumen general no exista, `/admin` SHALL declarar explícitamente que está en rediseño y SHALL ofrecer acceso directo a cada módulo del panel que sí opera: Ventas, Comisiones, Códigos promo, Usuarios, Perfiles y Sesiones.

El punto de entrada NO SHALL ser un callejón sin salida ni una redirección que elimine la pantalla de inicio del panel.

#### Scenario: La clienta entra al panel

- **WHEN** el admin inicia sesión y llega a `/admin`
- **THEN** lee que el resumen general está en rediseño
- **AND** ve un acceso por cada módulo operativo del panel

#### Scenario: Los accesos llevan a donde dicen

- **WHEN** el admin usa cada acceso directo de `/admin`
- **THEN** cada uno abre el módulo que anuncia
- **AND** ese módulo carga con los datos reales de la plataforma

#### Scenario: Los módulos que comparten datos con el Resumen siguen vivos

- **WHEN** el admin abre `/admin/sesiones`, `/admin/pagos` o `/admin/referidos` después del cambio
- **THEN** cada uno sigue cargando sus datos con normalidad, porque las rutas que el Resumen dejó de consumir siguen sirviendo a esas pantallas

### Requirement: El panel se dirige a la persona que inició sesión

El panel SHALL identificar al usuario con el nombre de su sesión. NO SHALL usarse un nombre escrito en el código.

#### Scenario: Saludo del panel

- **WHEN** cualquier admin inicia sesión y llega a `/admin`
- **THEN** el saludo usa su propio nombre, tomado de la sesión

#### Scenario: Un admin distinto

- **WHEN** entra un admin cuyo nombre no es el de la cuenta principal
- **THEN** el saludo muestra su nombre y no el de otra persona

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

