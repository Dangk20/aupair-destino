## 1. Código

- [x] 1.1 Retirar la campana falsa de inicio, Mi proceso, documentos y curso
- [x] 1.2 Comunidad: enlace desde `configuracion.comunidad_whatsapp` (oculto si está vacío) y sin la cifra inventada
- [x] 1.3 Recursos: `GET /api/dashboard/recursos` lee `sesion_recursos` por sesión con la regla de acceso del curso; la página los lista; corregir `GUIA_BD_ROLES.md`
- [x] 1.4 «Agendar reunión» abre WhatsApp del programa mientras el calendario esté apagado
- [x] 1.5 Certificado: enlace al terminar el curso, total real, sin certificado con 0 sesiones, botón «Guardar como PDF»
- [x] 1.6 Sin `NaN` en el porcentaje; «Mi proceso» usa `proximoPaso` del servidor
- [x] 1.7 `docs/rutas-y-acceso.md` al día si cambia alguna ruta

## 2. Verificación

- [x] 2.1 `npm run build` y `node scripts/pruebas-humo.mjs` sin rojos — build en verde; humo 625 en verde, 0 en rojo
- [x] 2.2 Recorrido como candidata: inicio, Mi proceso, curso, recursos, comunidad y certificado sin controles muertos ni cifras inventadas — navegador oculto como la candidata #4: 0 campanas en 6 pantallas, «Agendar reunión» → wa.me/13478886836 con su nombre, sin NaN; «Mi proceso» y el inicio dicen el mismo próximo paso; con el curso completo aparece «Ver mi certificado» en inicio y curso y el certificado dice «8 sesiones» (progreso restaurado)
- [x] 2.3 Recursos: subir uno como admin a una sesión y verlo y descargarlo como candidata — el admin subió un PDF a la sesión 1; la candidata lo vio en Recursos bajo «Clase 1» y la descarga respondió 200 application/pdf (dato de prueba borrado)

## 3. Despliegue

- [ ] 3.1 Clave `comunidad_whatsapp` en producción con el enlace real del grupo
- [ ] 3.2 Desplegar con `deploy/desplegar-codigo.sh` y humo en verde
