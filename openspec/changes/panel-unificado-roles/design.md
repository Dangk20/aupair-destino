## Context

Medido sobre el código el 2 de agosto de 2026:

- **Cuatro `layout.jsx`, 577 líneas, cero componentes compartidos.** `asociada` y `agencia` tienen 127 líneas cada uno y 203 distintas entre sí incluso neutralizando el nombre del rol: divergieron.
- **Sólo el panel de la candidata usa el tema.** `lib/tema-candidata.js` lo importa un layout de cuatro.
- **El panel de administración: 19 pantallas, 8.476 líneas, 158 colores distintos, ninguna importando el tema.** Pero el color más usado es `#a0435f` — 235 apariciones — que **ya es** `T.primary`. Igual con `#fce8ed` frente a `lilac` y `#f0dde2` frente a `border`. No hay que rediseñar: hay que consolidar la deriva.
- El panel de la candidata **ya resuelve** los módulos no disponibles: `locked` en su lista de navegación, con candado. La idea existe; falta compartirla.
- `docs/rutas-y-acceso.md` (sección "La agencia no tiene modelo de asignación") deja escrito que no hay forma de saber qué candidata corresponde a qué agencia.

## Goals / Non-Goals

**Goals:**

- Una sola cáscara de panel para los cuatro roles.
- Que el menú del admin sea la arquitectura acordada en el ítem 8.
- Que el panel de administración use la línea gráfica del producto.
- Que el Sprint 3 construya agencia y asociada **heredando**, no copiando.

**Non-Goals:**

- Unificar el módulo de candidatas: necesita el modelo de asignación de la agencia, que no existe.
- Desarrollar los módulos que faltan.
- Responsive (ítem 3, Sprint 4).
- Tocar los formularios del perfil de la candidata, que arrastran su propia paleta.

## Decisions

### 1. La cáscara recibe los módulos; no los conoce

El componente de panel acepta la lista de módulos —etiqueta, ruta, icono, disponible o no— y el usuario. No sabe qué es un admin ni qué es una agencia.

*Alternativa descartada:* que la cáscara decida los módulos según el rol, con un `switch`. Concentra el conocimiento de los cuatro roles en un archivo que además dibuja, y obliga a tocarlo cada vez que un rol gana un módulo. Con la lista fuera, cada panel declara lo suyo y la cáscara sólo dibuja.

### 2. Un módulo no disponible se declara, no se omite

La cáscara ya sabe pintarlos apagados, reutilizando la idea del panel de la candidata.

*Alternativa descartada:* omitirlos, como se hizo en el Sprint 0.0 comentándolos en el código. Es lo que había, y tiene un costo: la clienta no ve a dónde va la plataforma y el equipo pierde el mapa. Un módulo apagado informa; una métrica inventada engaña. No es el mismo caso que lo retirado del Resumen.

*Riesgo asumido:* una entrada apagada durante meses deja de informar y pasa a estorbar. Se revisa al cierre del MVP.

### 3. El tema se renombra a `lib/tema.js`

Llamarse "de candidata" hizo que tres paneles no lo usaran: el nombre decía que no era suyo.

*Alternativa descartada:* dejar el nombre y usarlo igual. Funciona, pero el nombre seguiría desaconsejando su uso a quien llegue nuevo.

### 4. Los colores del admin se consolidan por frecuencia, no de golpe

Se sustituyen primero los diez colores dominantes —que cubren la mayoría de las apariciones— y después la cola. Cada pantalla se revisa a ojo tras cambiarla.

*Alternativa descartada:* sustituir los 158 de una pasada automática. Muchos de la cola son de estados —verde de confirmado, rojo de error— que no tienen token equivalente y quedarían mal mapeados sin que nadie lo note.

### 5. El módulo de candidatas NO se unifica todavía

Es el mayor ahorro disponible y aun así espera. Un módulo único filtrado por rol exige saber qué ve cada rol, y para la agencia eso no está definido. Unificar hoy congelaría "la agencia lo ve todo" en un solo sitio, en vez de en tres.

*Consecuencia:* el Sprint 3 no construye "el panel de la agencia": construye **el módulo de candidatas con permisos por rol**, y de paso retira las tres versiones actuales.

## Risks / Trade-offs

- **Tocar los cuatro layouts a la vez** → Es el punto de entrada de todos los roles. Se hace panel por panel, con un recorrido manual por rol antes de pasar al siguiente.
- **Renombrar el tema toca todos sus consumidores** → Mecánico y lo verifica el build.
- **158 colores es mucha superficie** → Por eso se hace por frecuencia y con revisión visual, no de una pasada.
- **El menú cambia lo que la clienta ve todos los días** → Se avisa antes de desplegar, no después.

## Migration Plan

1. `lib/tema.js` y sus consumidores.
2. La cáscara compartida, estrenada en **asociada** — el panel más pequeño y de menor riesgo.
3. Agencia.
4. Admin, con el menú reorganizado.
5. La candidata, que ya usa el tema, se suma a la cáscara al final.
6. Los colores del panel de administración, por frecuencia.

Cada paso es un commit y un recorrido manual del rol afectado. Reversión: ningún paso toca datos.

## Open Questions

- **¿"Finanzas" es un módulo con su propia pantalla o un agrupador del menú?** Se asume agrupador: lleva a Ventas y desde ahí se navega. Una pantalla de finanzas de verdad sería desarrollo nuevo, fuera del ítem 8.
- **¿Configuración se muestra ya?** Existe (`/admin/configuracion`) pero está oculta desde el Sprint 0.0. Se asume mostrarla; conviene revisarla antes.
