## ADDED Requirements

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
