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
- [ ] 3.2 **Agencia**. Recorrido manual del rol
- [ ] 3.3 **Admin**, con el menú reorganizado (grupo 4). Recorrido manual
- [ ] 3.4 **Candidata** — ya usa el tema; se suma al final. Recorrido manual
- [ ] 3.5 Comprobar que los cuatro `layout.jsx` quedan reducidos a declarar módulos

## 4. El menú del admin, en la arquitectura acordada

- [ ] 4.1 Renombres: Resumen → **Dashboard** · Perfiles → **Candidatas**
- [ ] 4.2 Agrupar Ventas, Comisiones y Códigos promo bajo **Finanzas**
- [ ] 4.3 Mostrar **Configuración**, hoy oculta — revisarla antes de destaparla
- [ ] 4.4 Declarar apagados los que no existen: **Asociadas, Calendario, Reportes**
- [ ] 4.5 Retirar del código los módulos comentados en el Sprint 0.0 que ya no aplican
- [ ] 4.6 Comprobar que ninguna ruta del panel queda inalcanzable tras la reorganización

## 5. Los colores de los paneles

- [ ] 5.1 Sustituir los diez colores dominantes por tokens, empezando por `#a0435f` → `T.primary` (235 apariciones)
- [ ] 5.2 La cola de 148 colores, pantalla por pantalla, con revisión visual
- [ ] 5.3 Comprobar que no queda ningún color de marca escrito a mano en `app/admin/`
- [ ] 5.4 **Las pantallas de asociada y agencia**, que también tienen su propia paleta — al migrar la cáscara de asociada quedó a la vista: barra lateral borgoña, contenido morado. Migrar la cáscara sin el contenido deja el panel a medio camino

## 6. Verificación y cierre

- [ ] 6.1 Recorrido manual por los cuatro roles: entrar, navegar cada módulo, salir
- [ ] 6.2 Comprobar que un módulo apagado no se puede abrir ni por URL directa
- [ ] 6.3 `npm run build` y `node scripts/pruebas-humo.mjs` en verde
- [ ] 6.4 **Avisar a la clienta antes de desplegar**: el menú que usa a diario cambia de nombres y de orden
- [ ] 6.5 Desplegar y verificar en producción
- [ ] 6.6 Actualizar `docs/rutas-y-acceso.md` si alguna ruta cambió, y la bitácora del cronograma
