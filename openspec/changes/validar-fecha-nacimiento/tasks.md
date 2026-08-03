## 1. El mecanismo y la regla

- [x] 1.1 `lib/campos-perfil.js`: permitir que un campo declare `valida(valor, form)` que devuelve un mensaje de error o `null`
- [x] 1.2 `camposInvalidos(seccion, form)` y que `seccionCompleta()` exija además que no haya inválidos
- [x] 1.3 `validarSeccion()` devuelve también los inválidos, sin romper a quien sólo lee `ok` y `faltantes`
- [x] 1.4 La regla de `fecha_nacimiento`: no futura, no menor de `EDAD_MINIMA` (18), no más de 120 años. La constante, con nombre y en un solo sitio

## 2. El formulario

- [x] 2.1 `app/dashboard/perfil/evaluacion/page.jsx`: mostrar el mensaje del campo inválido, igual que se señalan hoy los obligatorios vacíos
- [x] 2.2 Comprobar que no se puede avanzar de sección con la fecha inválida

## 3. Verificación y cierre

- [x] 3.1 Probar las fechas que se rechazan y una válida
     *(7 casos en verde: 0 años, hoy mismo, 17 años, 1850, texto que no es fecha → rechazadas con su motivo; 18 años justos y 26 → aceptadas. En el navegador: con 0 y con 17 años el formulario no deja pasar de la sección 1 y muestra "Para el programa necesitas tener al menos 18 años. Con esa fecha tienes N"; con 26 avanza.)*
- [x] 3.2 Comprobar contra los perfiles reales de producción que ninguna candidata válida queda bloqueada
     *(De las 4 con fecha, las 3 de 26 años pasan. Sólo queda bloqueada la de 0 años, que es la cuenta de prueba del equipo — el caso que motivó la regla.)*
- [ ] 3.3 Comprobar que la candidata con fecha futura deja de figurar como completa y ve el motivo
- [x] 3.4 `npm run build` y `node scripts/pruebas-humo.mjs` en verde
- [ ] 3.5 Desplegar con `deploy/desplegar-codigo.sh` y verificar en producción
- [ ] 3.6 Avisar del efecto: un perfil ya guardado con fecha imposible retrocede de estado
