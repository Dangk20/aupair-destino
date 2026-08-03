## Why

Los cuatro paneles de la plataforma —candidata, admin, asociada, agencia— hacen el mismo trabajo: barra lateral con módulos, cabecera en móvil, identidad del usuario y salida. **No comparten ni una línea.**

Medido el 2 de agosto de 2026:

- 577 líneas repartidas en cuatro `layout.jsx` y **cero componentes compartidos**.
- `asociada` y `agencia` tienen **127 líneas cada uno y 203 líneas distintas entre sí**, incluso neutralizando el nombre del rol. No son copias: divergieron. Es el mismo problema resuelto de tres formas.
- Sólo el panel de la candidata usa `lib/tema-candidata.js`. Los otros tres escriben los colores a mano.
- El panel de administración son 19 pantallas y 8.476 líneas con **158 colores distintos**, ninguna importando el tema.

Y la duplicación no está sólo en la cáscara. **El módulo "candidatas" está implementado tres veces**, una por rol:

| Rol | Interfaz | API |
|---|---|---|
| admin | 3 pantallas · 1.751 líneas | 328 líneas |
| agencia | 1 pantalla · 853 líneas | 312 líneas |
| asociada | 2 pantallas · 404 líneas | 74 líneas |

Unas **3.000 líneas de interfaz y 714 de API para un solo concepto**: ver la lista de candidatas y abrir una. Divergen en lo que permiten —el admin aprueba, la agencia evalúa, la asociada sólo mira—, que es precisamente lo que debería resolver un permiso, no una pantalla aparte.

Lo que la plataforma tiene no son cuatro productos: es **uno con cuatro niveles de acceso**. Lo que cambia entre roles es a qué módulos se entra y qué puede hacerse con cada registro, no cómo se ve ni cómo se navega.

Y esto no es una deuda estética. **El Sprint 3 tiene que construir agencia y asociada de verdad.** Hacerlo sobre una cáscara compartida significa que hereden; hacerlo después significa rehacerlo, con la copia 4 y la 5 ya escritas.

## What Changes

### Una sola cáscara para los cuatro paneles

- Un componente de panel que reciba **qué módulos mostrar** y a quién, y resuelva barra lateral, cabecera móvil, identidad y salida. Los cuatro `layout.jsx` pasan a declarar su lista de módulos y poco más.
- **BREAKING (interno)**: `lib/tema-candidata.js` pasa a `lib/tema.js`. Deja de llamarse "de candidata" porque es la línea gráfica del producto, no la de un rol.
- Módulos que aún no existen: la cáscara ya sabe mostrarlos **deshabilitados**, porque el panel de la candidata lleva esa idea desde el Sprint 0.0 con su candado. Se reutiliza en vez de inventarla.

### El menú del admin, en la arquitectura acordada

Pasa a `Dashboard · Asociadas · Finanzas · Usuarios · Candidatas · Sesiones · Calendario · Reportes · Configuración`, que es el ítem 8 del alcance.

- **Finanzas agrupa** Ventas, Comisiones y Códigos promo, hoy tres entradas sueltas.
- **Candidatas** es el nombre nuevo de Perfiles. **Dashboard**, el de Resumen.
- Los cuatro módulos que todavía no existen —Asociadas, Calendario, Reportes y lo que falte de Finanzas— aparecen **apagados y sin enlace**, para que la clienta vea a dónde va la plataforma.

**Un módulo apagado no miente; una métrica inventada sí.** Es la diferencia con lo que se retiró del Resumen: aquello afirmaba datos falsos, esto declara que algo todavía no está.

### El panel de administración adopta la línea gráfica

Los 158 colores escritos a mano pasan a tokens del tema. No es un rediseño: el color más usado del panel es `#a0435f`, 235 veces, que **ya es** `T.primary`. Lo que hay es deriva acumulada alrededor de la línea correcta.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `panel-admin`: hoy dice qué puede y qué no puede mostrar el panel. Se le añade **cómo se organiza su menú** y que un módulo aún no disponible se declare como tal en vez de omitirse.

## Impact

**Código afectado**

- `components/panel/` (nuevo) — la cáscara compartida.
- `lib/tema.js` — renombre de `tema-candidata.js`; todos sus consumidores.
- `app/{admin,asociada,agencia,dashboard}/layout.jsx` — pasan a declarar módulos.
- Las 19 pantallas de `app/admin/` — colores a tokens.

**Datos**

Ninguna migración.

**Infraestructura**

Ninguna.

## Qué queda muerto

| Qué | Dónde | Por qué |
|---|---|---|
| Tres implementaciones de la barra lateral | `app/{admin,asociada,agencia}/layout.jsx` | Las sustituye la cáscara compartida |
| El nombre `tema-candidata` | `lib/tema-candidata.js` | La línea gráfica es del producto, no de un rol |
| Los módulos comentados del menú de admin | `app/admin/layout.jsx` | Se decidieron en el Sprint 0.0 comentándolos; ahora se declaran apagados o se retiran |

**Deuda nueva:** las entradas apagadas son una promesa visible. Si en tres meses siguen apagadas, dejan de informar y pasan a estorbar. Se revisan al cierre del MVP.

## Lo que este change NO hace, y por qué importa

**Unificar el módulo de candidatas queda fuera, a propósito.** Es la consecuencia natural de todo lo anterior y el mayor ahorro que hay sobre la mesa —3.000 líneas de interfaz que deberían ser una— pero **no se puede hacer todavía**.

Un módulo único filtrado por rol necesita saber **qué ve cada rol**. Para el admin y la asociada está definido. Para la agencia no: no existe modelo de asignación agencia↔candidata, como quedó documentado en `docs/rutas-y-acceso.md` durante el Sprint 1. Unificar hoy congelaría en el código "la agencia lo ve todo", que es justo el defecto que hay que corregir.

El orden correcto es: **esta cáscara ahora → los talleres definen el modelo de la agencia (ítems 7 y 12) → el Sprint 3 construye el módulo único de candidatas en vez de una cuarta versión.**

**Fuera de alcance**

- **Unificar el módulo de candidatas** — Sprint 3, después de los talleres.
- **Desarrollar** los módulos que faltan: dependen de los talleres del ítem 12 y se cotizan aparte.
- Responsive mobile (ítem 3, Sprint 4).
- Rediseñar los formularios del perfil de la candidata, que tienen su propia paleta heredada.
