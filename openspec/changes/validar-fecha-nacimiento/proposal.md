## Why

El formulario acepta **cualquier** fecha de nacimiento. En producción hay hoy una candidata con fecha **23 de julio de 2026**, que da **0 años**. Entró al perfil, se guardó y ahí sigue.

Nadie la rechazó porque la validación del Sprint 0.0 sólo comprueba **presencia**: que el campo no esté vacío. Un campo lleno con un disparate pasa igual que uno correcto.

Y la edad no es un dato cosmético: el programa au pair tiene requisito de edad, y el propio formulario lo reconoce al preguntar por "Requisitos entre 18 y 20 años" y "Requisitos si tienes 26 años". Una fecha que da 0 años deja el perfil formalmente completo con un dato que ninguna agencia puede usar.

## What Changes

### La fecha de nacimiento se valida, no sólo se exige

- Una fecha **futura** se rechaza.
- Una fecha que da **menos de 18 años** se rechaza. Es la edad mínima del programa, coherente con lo que el formulario ya pregunta.
- Una fecha **absurda** —más de 120 años— se rechaza.
- El mensaje dice **qué pasa y qué se espera**, no "campo inválido".

### La validación deja de ser sólo de presencia

- **BREAKING (interno)**: `validarSeccion()` pasa a devolver también los campos **con valor inválido**, no sólo los vacíos. Una sección con un campo mal diligenciado deja de contar como completa.
- La regla se declara **junto al campo**, en `lib/campos-perfil.js`, igual que los obligatorios. Así el formulario, el cálculo de progreso y el servidor la heredan del mismo sitio y no pueden discrepar — que es lo que el Sprint 0.0 estableció al centralizar la validación.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `perfil-candidata`: hoy declara qué campos son obligatorios y que el servidor valida antes de dar el perfil por completo. Se le añade que un campo puede exigir además **una forma válida**, y la regla concreta de la fecha de nacimiento.

## Impact

**Código afectado**

- `lib/campos-perfil.js` — la regla del campo y el concepto de "campo inválido".
- `app/dashboard/perfil/evaluacion/page.jsx` — mostrar el mensaje.
- El servidor hereda la regla sin cambios: `/api/dashboard/perfil` ya calcula lo completo con estas mismas funciones.

**Datos**

Ninguna migración. **Los datos ya guardados no se corrigen solos**: la candidata con la fecha imposible tendrá que corregirla la próxima vez que abra esa sección, y hasta entonces su perfil deja de figurar como completo. Es el efecto correcto y hay que avisarlo.

## Qué queda muerto

Nada. Este cambio sólo añade.

**Fuera de alcance**

- Edad **máxima**. El programa parece llegar a 26, pero bloquear por arriba podría dejar fuera a una candidata que ya está en proceso y cumplió años. Se decide con la clienta.
- Validar el resto de campos. Se construye el mecanismo y se estrena con la fecha; los demás se añaden cuando haya una regla escrita para cada uno.
