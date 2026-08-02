## 1. Preparar la fuente de datos

- [x] 1.1 `lib/campos-perfil.js`: comprobar que las 15 secciones y todos sus campos tienen `label`; añadir el que falte
     *(63 campos sobre 60 columnas distintas. **Ninguno sin `label`** — no hubo que añadir nada.)*
- [x] 1.2 Añadir una función que, dado un campo y el perfil, devuelva su valor listo para mostrar y distinga explícitamente "sin diligenciar" de un valor vacío legítimo
     *(`valorParaMostrar()`. Devuelve `{tipo, texto}` con la clase deducida **del valor**, no declarada campo por campo: vacio · imagen · fecha · bloque · dato. Clave: `foto_url` es un campo de la sección "Fotos y videos" y guarda un data-URI base64 de hasta 42 KB — sin esto, la vista volcaría 42.000 caracteres en pantalla. Probado contra la candidata 6: 51 dato, 10 vacío, 1 fecha, 1 imagen.)*
- [x] 1.3 Comprobar que `/api/dashboard/perfil` devuelve todas las columnas que las 15 secciones necesitan
     *(Sí llegan los 63. Pero hace `SELECT *` y devuelve **119 columnas**, incluidas `password`, `reset_token` y `reset_token_expiry` — de ahí sale la 1.4.)*
- [x] 1.4 `GET /api/dashboard/perfil`: dejar de devolver `SELECT *`. Excluir `password`, los tokens de recuperación y las columnas de valoración interna
     *(De 119 columnas a 112. Fuera `password`, `reset_token`, `reset_token_expiry`, `score_dap`, `calificacion_dap`, `nota_dap` y `notas_agencia`. Verificado que los 63 campos de las secciones siguen llegando, y también `evaluacion_aprobada`, `perfil_completo` y `foto_url`, que la vista necesita.)*
- [x] 1.5 Verificar que ninguna pantalla del dashboard dependía de una columna que deje de llegar
     *(Ninguna. Las 4 apariciones de "password" en el dashboard son `type="password"` del formulario de configuración, que usa otra ruta. Los tres consumidores de `/api/dashboard/perfil` son las tres pantallas del módulo de perfil.)*

## 2. La vista consolidada

- [x] 2.1 `app/dashboard/perfil/page.jsx`: cabecera con foto, nombre y datos principales, siguiendo el estilo de `lib/tema-candidata.js`
     *(Foto, nombre, ciudad/país, edad calculada y correo.)*
- [x] 2.2 Recorrer `PARTE1` y `PARTE2` pintando cada sección con sus campos como etiqueta → valor; **generado, no escrito a mano**
     *(Las 15 secciones salen del recorrido; ni una etiqueta escrita a mano.)*
- [x] 2.2b **Las secciones son pestañas**, a petición del cliente: en una columna la vista medía 4.167 px —casi cinco pantallas—; con pestañas mide 783 px. Fila horizontal con icono por sección, la activa contorneada en borgoña sobre blanco, separador entre partes.
- [x] 2.3 Cada sección con su acción de editar, que lleva a su formulario y a su sección
     *(Verificado en el navegador: Salud → `/perfil/evaluacion?seccion=salud`, Fotos → `/perfil/agencia?seccion=fotos`, Referencias → `/perfil/agencia?seccion=referencias`. Cada parte a su formulario.)*
- [x] 2.4 Los campos sin diligenciar se muestran señalados como vacíos, no se omiten
     *(10 campos como "Sin diligenciar" en el perfil de prueba, en gris e itálica.)*
- [x] 2.5 Proteger la ruta con `useAccessGate("perfil")`, igual que el resto del módulo
- [x] 2.6 ~~Si el perfil no está completo, la vista redirige~~ → **La vista tiene dos estados**, revisado con el cliente
     *(Con el perfil a medias ya no redirige: muestra la tarjeta de perfil y el recorrido de las 15 secciones con qué falta en cada una. Verificado con la candidata 6 (87%): dos secciones marcadas "Continuar" con "Te falta: Estatura, Peso" y "Te falta: Nombre de tu primera referencia, Email de tu primera referencia". El motivo del cambio importa: ninguna candidata de producción tiene hoy el perfil completo, así que la versión con redirección habría sido inalcanzable para todas.)*
- [x] 2.7 El enlace de una sección pendiente lleva a su sección
     *(Resuelto con 3.3: el enlace apunta siempre a su sección y el formulario decide si puede honrarlo.)*

## 3. Abrir un formulario en una sección

- [x] 3.1 `app/dashboard/perfil/evaluacion/page.jsx`: aceptar `?seccion=<id>` y arrancar en esa sección; identificador desconocido o ausente → sección cero
     *(El paso inicial se calcula **después** de cargar el perfil: la regla depende de qué secciones estén completas. Se lee de `window.location.search` y no con `useSearchParams`, que en el App Router exigiría un límite de Suspense.)*
- [x] 3.2 Lo mismo en `app/dashboard/perfil/agencia/page.jsx`
     *(Ojo: sus `SECCIONES` son **10**, no 9 — incluye "Estado del perfil", que llena el equipo y no tiene obligatorios. Los nueve primeros ids coinciden con `PARTE2`, así que el enlace por id resuelve igual en los dos sitios.)*
- [x] 3.3 Verificar que la validación por pasos sigue intacta
     *(La regla vive en `seccionInicial()` de `campos-perfil.js`, un solo sitio para los dos formularios: honra la sección pedida **sólo si todas las anteriores están completas**; si no, abre en la primera que falte. Probada contra perfiles reales, 8 casos en verde, y confirmada en el navegador: con Dani (completo) `?seccion=visas` abre en la 6 de 6 y `?seccion=referencias` en la 8 de 10; con Juan —a quien le falta la primera sección de la Parte 2— `?seccion=referencias` abre en la 1 de 10, no en la 8.)*

## 4. Reapuntar los caminos que engañan

- [x] 4.1 ~~"Revisar mi perfil" abre la vista consolidada~~ → **No hay a dónde ir: la vista ES `/dashboard/perfil`**
     *(Revisado con el cliente al verlo funcionando: el índice y la vista mostraban lo mismo con dos diseños. Se fusionaron y `/dashboard/perfil/vista` se eliminó — hoy da 404. Verificado en el navegador que la pantalla única resuelve los dos estados: 794 px con el perfil completo, 1.638 px a medias.)*
- [x] 4.2 Las seis tarjetas de sección de la Parte 1 llevan cada una a su sección
     *(Ahora son las pestañas y las tarjetas del recorrido, cada una con su `?seccion=`. Antes las seis iban al mismo sitio sin anclar.)*
- [x] 4.3 Retirar el botón "Revisar" suelto de la Parte 2
     *(Desapareció con el índice al fusionarse las pantallas.)*
- [x] 4.4 Comprobar que con el perfil a medias los textos y destinos siguen siendo los de "continuar", no los de "revisar"
     *(Sin empezar → "Empezar a contarte". A medias → "Ver qué me falta". Completo → "Revisar mi perfil". Los tres llevan a la vista, que se adapta.)*

## 5. El resultado de la evaluación

- [ ] 5.1 Bloque de evaluación con **dos** estados: en revisión y aprobado. No hay tercero: `nota_dap` no lo escribe nadie
- [ ] 5.2 Sin aprobación no se muestra calificación ni puntaje
- [ ] 5.3 Verificar los dos estados contra datos reales, cambiando `evaluacion_aprobada` en la base local y comprobando que retirar la aprobación devuelve a "en revisión"

## 6. Verificación y cierre

- [ ] 6.1 Recorrido con un perfil **completo**: la vista muestra las 15 secciones, cada editar abre su sección, y lo que se guarda se ve al volver
- [ ] 6.2 Recorrido con un perfil **a medias**: no aparece la vista consolidada, y el formulario sigue sin dejar avanzar con obligatorios vacíos
- [ ] 6.3 Recorrido con un perfil **sin empezar**: el módulo invita a empezar y nada se rompe
- [ ] 6.4 Comprobar en la base que ningún campo de las 15 secciones queda sin mostrar en la vista
- [ ] 6.5 `npm run build` sin errores
- [ ] 6.6 `node scripts/pruebas-humo.mjs` en verde — si se tocó `/api/dashboard/perfil`, su nivel de acceso sigue siendo el declarado en `docs/rutas-y-acceso.md`
- [ ] 6.7 Desplegar con `deploy/desplegar-codigo.sh` (no hay migración) y verificar en producción
- [ ] 6.8 Actualizar la bitácora de `tech/cronograma-sprints-aupair.md`
