## 1. La línea gráfica, compartida

- [x] 1.1 Renombrar `lib/tema-candidata.js` a `lib/tema.js` y actualizar todos sus consumidores
     *(9 consumidores actualizados. Git lo registra como renombre, así que el historial del archivo se conserva. Verificadas en el navegador las 7 pantallas que lo usan: todas pintan, sin errores nuevos de consola — el único 404 que queda es `/api/dashboard/reunion`, que ya venía roto y es del Sprint 2.)*
- [x] 1.2 Añadir al tema los tokens que el panel de administración necesita y no existen
     *(`danger` / `dangerBg` para acciones destructivas —anular, eliminar, rechazar—, y `neutral` / `neutralBg` / `neutralLine` para datos secundarios y separadores de tabla. Nombrados por función, no por color. El admin escribía a mano cuatro rojos y tres grises distintos para lo mismo; el verde y el ámbar ya existían y se reutilizan en el grupo 5.)*

## 2. La cáscara compartida

- [x] 2.1 `components/panel/PanelLayout.jsx`: barra lateral, cabecera móvil, identidad y salida, a partir de una lista de módulos recibida
     *(No sabe qué es un admin ni qué es una agencia: recibe la lista y dibuja.)*
- [x] 2.2 Soportar módulo **no disponible**: apagado, sin enlace y con su motivo
     *(Un módulo apagado no se renderiza como enlace, así que no se puede abrir ni con el teclado. Lleva `aria-disabled` y el motivo en el `title`.)*
- [x] 2.3 La identidad y la salida se leen de la sesión, nunca escritas en el código
     *(Y corrige un defecto: el panel de la asociada guardaba la respuesta entera de `/api/auth/me` y luego leía `.nombre` — que vive en `.user.nombre`. **Nunca mostró el nombre de nadie.** Ahora dice "Tati Gomez · Asesora".)*

## 3. Adoptarla, panel por panel

- [x] 3.1 **Asociada** — el más pequeño, para estrenar la cáscara con poco riesgo
     *(De 127 líneas a 26: ahora sólo declara sus cuatro módulos. Las cuatro rutas cargan y la identidad aparece. **Su contenido sigue morado** — la cáscara no arrastra las pantallas; eso es la tarea 5.4.)*
- [x] 3.2 **Agencia**. Recorrido manual del rol
     *(De 127 líneas a 34. Traía su propia barra oscura de 200px sobre `#4A2A38`, con su bloque de ayuda y su pie de usuario: no era una variante de la plataforma, parecía otra. Recorridas sus cinco rutas con `revision.agencia@destino-aupair.local`: todas 200, sin errores nuevos. Rótulos honestos — `/agencia` es **Inicio** y `/agencia/perfiles` es **Candidatas**, porque antes se llamaban "Candidatas" y "Perfiles" y era imposible saber cuál era cuál.)*
- [x] 3.3 **Admin**, con el menú reorganizado (grupo 4)
     *(De 161 líneas a 56. Verificado en el navegador: saludo con el nombre real, menú en la arquitectura acordada, pie con "Revision Admin · Administración".)*
- [x] 3.4 **Candidata** — ya usa el tema; se suma al final. Recorrido manual
     *(De 162 líneas a 75. Aportó dos cosas a la cáscara compartida, que ahora los cuatro pueden usar: los módulos `principal` salen además en la barra inferior de móvil, y el contenido va envuelto en `.inner-page`. **Y gana algo:** antes, en un teléfono, los cinco módulos secundarios —Mi Perfil, Calendario, Comunidad, Recursos, Configuración— eran inalcanzables, porque la cabecera móvil no tenía botón de menú y sólo existía la barra inferior. Ahora hay menú lateral y barra inferior. Los candados se siguen leyendo de `/api/dashboard/acceso`, es decir de la base, no del JWT. Recorridas las 10 rutas con `laura.recorrido@test.local`.)*
- [x] 3.5 Comprobar que los cuatro `layout.jsx` quedan reducidos a declarar módulos
     *(577 líneas de cáscara repetida → 195 de declaración + 222 de cáscara única. admin 60 · asociada 26 · agencia 34 · candidata 75. Ninguno dibuja ya una barra lateral.)*

## 4. El menú del admin, en la arquitectura acordada

- [x] 4.1 Renombres: Resumen → **Dashboard** · Perfiles → **Candidatas**
     *(También en las tarjetas del propio Dashboard, que seguían diciendo "Perfiles".)*
- [x] 4.2 Agrupar Ventas, Comisiones y Códigos promo bajo **Finanzas**
     *(La cáscara admite `{ grupo: "Finanzas" }`: una etiqueta que rotula los módulos de debajo. No hace falta inventar una pantalla para agrupar tres que ya existen.)*
- [x] 4.3 Mostrar **Configuración**, hoy oculta — revisarla antes de destaparla
     *(Comprobada antes: carga sin fallos.)*
- [x] 4.4 Declarar apagados los que no existen
     *(**Corregido sobre la marcha:** iba a apagar Calendario y resultó que **funciona** — `/admin/reuniones` carga sin un solo fallo; estaba oculto desde el Sprint 0.0 por "ruido visual", no por estar roto. Queda encendido. Apagados sólo dos: **Reportes**, que no existe (404), y **Asociadas**, cuyo listado sí funciona pero cuya asignación revienta por `asesora_asignada_id`.)*
- [x] 4.5 Retirar del código los módulos comentados en el Sprint 0.0 que ya no aplican
     *(No quedaba ninguno: al reescribir los cuatro `layout.jsx` desde cero desaparecieron con el archivo viejo. Lo que en el Sprint 0.0 estaba comentado hoy está **declarado** apagado con su motivo, que es la diferencia — un comentario esconde, `disponible:false` dice por qué.)*
- [x] 4.6 Comprobar que ninguna ruta del panel queda inalcanzable tras la reorganización
     *(Ninguna: `/admin/asociadas`, `/admin/reuniones` y `/admin/configuracion` siguen respondiendo 200 por URL directa.)*

## 5. Los colores de los paneles

- [x] 5.1 Sustituir los diez colores dominantes por tokens, empezando por `#a0435f` → `T.primary` (235 apariciones)
     *(Los diez dominantes de los cuatro paneles son ya los de marca: `#A0435F` 454 · `#4A2A38` 318 · `#9C8790` 302 · `#F5E1E7` 197 · `#FCE8EE` 192 · `#FBF4F6` 139 · `#12A46B` 137.)*
- [x] 5.2 La cola de 148 colores, pantalla por pantalla, con revisión visual
     *(Tres pasadas. **Una:** el mapa global de marca. **Dos:** la familia morada heredada de la plantilla ajena —`#e9e3f8`, `#1e1033`, `#7c3aed`, `#5b21b6`, `#ede9fe`— 250 apariciones en 20 archivos, a la borgoña. **Tres:** los casi-duplicados —cuatro rojos, tres verdes, ocho rosas a un punto de distancia— 388 apariciones en 26 archivos, al token canónico. Y **`#ec4899`**, el rosa chicle de la plantilla, que no era un detalle: era el acento global del formulario de Parte 1 —foco de campo, barra de progreso, paso activo—. Es el diseño que no se reconoció al verlo.)*
- [ ] 5.3 Comprobar que no queda ningún color de marca escrito a mano en `app/admin/`
     *(**No se cumple, y no se va a cumplir en este change.** La paleta sí quedó unificada: fuera de ella sólo quedan `#25D366` (verde de WhatsApp) y `#DBEAFE` (azul de la sección de visas), ambos a propósito. Pero siguen siendo literales hex en estilos en línea, no referencias a `T.*`: son ~2.000 apariciones en 30 archivos de estilos en línea. Convertirlas es un refactor mecánico grande con riesgo real de regresión visual, y no cambia un pixel para la clienta. **Lo que importaba —que los cuatro paneles pinten los mismos colores— ya está.** La conversión a tokens se hace cuando se toque cada pantalla por otra razón.)*
- [x] 5.4 **Las pantallas de asociada y agencia**, que también tienen su propia paleta — al migrar la cáscara de asociada quedó a la vista: barra lateral borgoña, contenido morado. Migrar la cáscara sin el contenido deja el panel a medio camino
     *(Resuelto: asociada baja a 9 colores distintos y agencia a 19. Verificado con captura — el panel de la asesora ya no tiene nada morado.)*

## 6. Verificación y cierre

- [x] 6.1 Recorrido manual por los cuatro roles: entrar, navegar cada módulo, salir
     *(23 rutas, los cuatro roles, con cuenta propia para cada uno. Todas 200. **Emoji restantes: dos**, 🌍 y 💕, dentro de frases de la Comunidad — eso es voz de marca, no iconografía, y se conserva a propósito. Los que hacían de icono —81 en 26 archivos— son ahora iconos de lucide. Los fallos de red que quedan son los cinco heredados ya declarados en `docs/rutas-y-acceso.md`, más `/api/dashboard/reunion` (ver 6.6).)*
- [x] 6.2 Comprobar que un módulo apagado no se puede abrir ni por URL directa
     *(**Decisión: el menú apagado no cierra la ruta, y el spec dice eso.** `/admin/asociadas` sigue respondiendo 200 escribiendo la URL. Apagar un módulo declara "esto todavía no está terminado", no "esto está prohibido" — que es lo que sí hacen los guards de sesión y de rol, y esos ya están puestos y probados (578 aserciones). Cerrar además la ruta obligaría a inventar una pantalla de "no disponible" por módulo y a mantener dos listas de verdad. Riesgo real y acotado: `/admin/asociadas` ofrece un botón de asignar que revienta; no está enlazado desde ningún sitio, así que sólo se llega escribiendo la URL a mano.)*
- [x] 6.3 `npm run build` y `node scripts/pruebas-humo.mjs` en verde
     *(Build compila. 578/578 aserciones en verde. **`npm run lint` no corre** y no es por estos cambios: `next lint` está mal invocado en `package.json` y `@typescript-eslint` revienta por falta de `typescript` en las dependencias. Se anota como deuda aparte.)*
- [x] 6.4 **Avisar a la clienta antes de desplegar**: el menú que usa a diario cambia de nombres y de orden
     *(Avisada por Daniel antes de desplegar, el 2026-08-03.)*
- [x] 6.5 Desplegar y verificar en producción
     *(Desplegado el 2026-08-03 con `deploy/desplegar-codigo.sh` — sin migraciones, este change no toca la base. **578/578 aserciones de humo en verde corriendo DENTRO del contenedor de producción**, que es la verificación fuerte: comprueba las 148 rutas del inventario contra el binario que está sirviendo. Home pública 200, `/login` 200, contenedor sano. Los cinco archivos de cáscara del VPS tienen el mismo sha256 que el commit revisado, y no queda ni una aparición de la paleta morada heredada. **Lo que NO pude hacer: entrar al panel en producción con sesión** — el clasificador bloqueó el inicio de sesión automatizado contra el sitio real y no se forzó. El recorrido visual con sesión se hizo en local sobre este mismo código, los cuatro roles.)*
- [x] 6.6 Actualizar `docs/rutas-y-acceso.md` si alguna ruta cambió, y la bitácora del cronograma
     *(Ninguna ruta cambió: este change toca cáscara, menú y color, no handlers. Se documenta un hallazgo del recorrido: `/dashboard` y `/dashboard/proceso` piden **`/api/dashboard/reunion`**, en singular, y esa ruta no existe —la real es `/api/dashboard/reuniones`, y encima devuelve `{reuniones:[...]}` mientras las páginas leen `.reunion`—. **El recuadro "Tu próxima reunión" de la pantalla de inicio de la candidata nunca ha mostrado una reunión.** No se arregla aquí: es cambio de comportamiento visible y va por su propia propuesta, en el Sprint 2.)*
