## Por qué

Ítems **9** (panel de la candidata con datos reales) y **10** (indicadores de progreso reales) del alcance. Auditoría del código y de la base local (17 oct 2026):

- La mayoría del inicio ya es real (próximo paso, ruta, progreso, próxima reunión, chat). Lo que queda **promete algo que no pasa**:
  - **Campana de notificaciones falsa** con el punto rojo fijo y un botón que no hace nada, en cuatro pantallas (`dashboard/page.jsx:118`, `proceso/page.jsx:76`, `documentos/page.jsx:144`, `curso/page.jsx:164`). No existe un listado de avisos para la candidata: la tabla `notificaciones` sólo evita correos repetidos.
  - **Comunidad**: el botón lleva a `https://chat.whatsapp.com/TU-LINK-AQUI` y afirma «Más de 500 chicas», un número escrito a mano.
  - **Recursos** (`/dashboard/recursos`): «Próximamente» sobre una tabla `recursos` que no existe; su API la consulta y se traga el error. Los recursos reales viven en `sesion_recursos` (change `recursos-por-video`).
  - **«Agendar reunión»** (inicio y Mi proceso) lleva a un calendario apagado desde julio: «Por ahora las coordinamos por WhatsApp». Quién publica disponibilidad (asesoras) depende del taller de Asesoras.
  - **Certificado**: ninguna pantalla enlaza a él; «8 sesiones» está escrito a mano y con 0 sesiones deja pasar la validación.
- **Indicadores**: el porcentaje del curso da `NaN` si no hay sesiones (`api/dashboard/sesiones:41`), y «Mi proceso» calcula un próximo paso propio que se salta el perfil (puede decir «Perfil en revisión» sin perfil enviado), distinto del inicio.

## Qué cambia

- **Se retira la campana falsa** de las cuatro pantallas. Los avisos a la candidata siguen saliendo por correo (ya real).
- **Comunidad**: el enlace se lee de `configuracion` (clave `comunidad_whatsapp`); sin enlace configurado no se muestra el botón. Sale la cifra inventada.
- **Recursos**: la biblioteca muestra los recursos reales de `sesion_recursos`, agrupados por sesión (sólo de las sesiones que la candidata puede ver), y la sección conserva su permiso `acceso_recursos`. Se retira `GET /api/dashboard/recursos`, que consultaba la tabla inexistente.
- **Contacto**: nueva `GET /api/dashboard/contacto` (sesión) con el WhatsApp del programa y, sólo con `acceso_comunidad`, el enlace del grupo.
- **Agendar**: mientras el calendario siga apagado, «Agendar reunión» abre el WhatsApp del programa (`configuracion.whatsapp`) con un mensaje listo, en vez de llevar a una pantalla «Próximamente».
- **Certificado**: aparece al terminar el curso (inicio y curso), usa el total real de sesiones, no se emite con 0 sesiones y su botón dice lo que hace («Guardar como PDF»).
- **Indicadores**: sin `NaN`, y «Mi proceso» usa el mismo `proximoPaso` del servidor que el inicio.

- **Chat flotante** (Daniel, 17 oct): «Mensajes» deja de ser una pestaña; una burbuja fija abajo a la derecha, en todas las pestañas, con los no leídos, abre un panel desde la derecha con las conversaciones y el chat (`components/chat/ChatFlotante`). `/dashboard/mensajes` y sus enlaces abren ese panel.
- **Certificado**: la impresión salía en blanco (la regla de impresión apuntaba a una clase escapada que no coincidía); ahora imprime sólo el certificado, horizontal.

- **Tres contactos en el chat** (Daniel, 17 oct): el equipo (aparece solo, con la bienvenida de `configuracion.mensaje_bienvenida`), la asociada dueña del cupón con que entró y, cuando pasa a una, su agencia (`asegurarContactos` en `lib/conversaciones-aupair`). La asociada tiene la burbuja en su panel y el admin la supervisa como a las agencias. Migración 017: `autor_rol` admite `asociada`.
- **Varias reuniones** (Daniel, 17 oct): la candidata ya no queda bloqueada tras agendar; puede tener hasta 3 futuras, nunca dos a la misma hora. El calendario muestra «Próximas reuniones» y el inicio y Mi Destino las listan todas.

## Fuera de alcance

- Notificaciones dentro de la plataforma (listado de avisos): funcionalidad nueva.
- Encender el calendario de reuniones: depende del taller de Asesoras (ítem 12).
- Referidos heredados (ítem 8) y botón de ingresar (ítem 2): changes aparte.
