## 1. Preparar la fuente de datos

- [ ] 1.1 `lib/campos-perfil.js`: comprobar que las 14 secciones y todos sus campos tienen `label`; añadir el que falte
- [ ] 1.2 Añadir una función que, dado un campo y el perfil, devuelva su valor listo para mostrar y distinga explícitamente "sin diligenciar" de un valor vacío legítimo
- [ ] 1.3 Comprobar que `/api/dashboard/perfil` devuelve todas las columnas que las 14 secciones necesitan — hoy devuelve una lista fija; contrastarla contra `campos-perfil.js` y completar lo que falte

## 2. La vista consolidada

- [ ] 2.1 `app/dashboard/perfil/vista/page.jsx`: cabecera con foto, nombre y datos principales, siguiendo el estilo de `lib/tema-candidata.js`
- [ ] 2.2 Recorrer `PARTE1` y `PARTE2` pintando cada sección con sus campos como etiqueta → valor; **generado, no escrito a mano**
- [ ] 2.3 Cada sección con su acción de editar, que lleva a su formulario y a su sección
- [ ] 2.4 Los campos sin diligenciar se muestran señalados como vacíos, no se omiten
- [ ] 2.5 Proteger la ruta con `useAccessGate("perfil")`, igual que el resto del módulo
- [ ] 2.6 Si el perfil no está completo, la vista redirige a `/dashboard/perfil` en vez de mostrarse a medias

## 3. Abrir un formulario en una sección

- [ ] 3.1 `app/dashboard/perfil/evaluacion/page.jsx`: aceptar `?seccion=<id>` y arrancar en esa sección; identificador desconocido o ausente → sección cero
- [ ] 3.2 Lo mismo en `app/dashboard/perfil/agencia/page.jsx`
- [ ] 3.3 Verificar que la validación por pasos sigue intacta: con el perfil a medias no se puede avanzar dejando obligatorios sin diligenciar

## 4. Reapuntar los caminos que engañan

- [ ] 4.1 `app/dashboard/perfil/page.jsx`: con el perfil completo, "Revisar mi perfil" abre la vista consolidada
- [ ] 4.2 Las seis tarjetas de sección de la Parte 1 llevan cada una a su sección
- [ ] 4.3 Retirar el botón "Revisar" suelto de la Parte 2; se llega desde la vista consolidada
- [ ] 4.4 Comprobar que con el perfil a medias los textos y destinos siguen siendo los de "continuar", no los de "revisar"

## 5. El resultado de la evaluación

- [ ] 5.1 Bloque de evaluación en la vista consolidada, con los tres estados: en revisión, aprobado, con observaciones
- [ ] 5.2 Sin evaluación no se muestra calificación alguna
- [ ] 5.3 Verificar los tres estados contra datos reales, cambiando `evaluacion_aprobada` y `nota_dap` en la base local

## 6. Verificación y cierre

- [ ] 6.1 Recorrido con un perfil **completo**: la vista muestra las 14 secciones, cada editar abre su sección, y lo que se guarda se ve al volver
- [ ] 6.2 Recorrido con un perfil **a medias**: no aparece la vista consolidada, y el formulario sigue sin dejar avanzar con obligatorios vacíos
- [ ] 6.3 Recorrido con un perfil **sin empezar**: el módulo invita a empezar y nada se rompe
- [ ] 6.4 Comprobar en la base que ningún campo de las 14 secciones queda sin mostrar en la vista
- [ ] 6.5 `npm run build` sin errores
- [ ] 6.6 `node scripts/pruebas-humo.mjs` en verde — si se tocó `/api/dashboard/perfil`, su nivel de acceso sigue siendo el declarado en `docs/rutas-y-acceso.md`
- [ ] 6.7 Desplegar con `deploy/desplegar-codigo.sh` (no hay migración) y verificar en producción
- [ ] 6.8 Actualizar la bitácora de `tech/cronograma-sprints-aupair.md`
