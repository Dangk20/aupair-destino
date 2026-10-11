## Context

- `lib/campos-perfil.js` es desde el Sprint 0.0 la fuente única de qué se exige en el perfil. De ahí salen el formulario, el cálculo de progreso **y la validación del servidor**: `/api/dashboard/perfil` decide `perfil_completo` llamando a `parteCompleta()`.
- Esa validación comprueba **presencia y nada más**: `tieneValor()` mira que el campo no esté vacío.
- Consecuencia comprobada en producción: la candidata 18 tiene `fecha_nacimiento = 2026-07-23`, que da **0 años**, y su perfil pasó la validación.
- El formulario ya usa `type="date"`, que impide escribir texto libre pero no impide elegir una fecha futura.

## Goals / Non-Goals

**Goals:**

- Que una fecha de nacimiento imposible no pueda entrar.
- Que la regla viva en un solo sitio y la hereden formulario y servidor.
- Que el mensaje diga qué se espera.

**Non-Goals:**

- Edad máxima (se decide con la clienta).
- Validar los demás campos: se construye el mecanismo, no se aplica a todo.
- Corregir los datos ya guardados con una migración.

## Decisions

### 1. La regla se declara junto al campo, no en el formulario

Un campo puede llevar `valida(valor, form)` que devuelve un mensaje de error o `null`. La fecha de nacimiento estrena el mecanismo.

*Alternativa descartada:* validar en el `onChange` del formulario. Es lo más rápido, pero deja al servidor sin la regla — y el servidor es quien decide `perfil_completo`. Volveríamos al problema que el Sprint 0.0 corrigió: dos criterios distintos y un perfil "completo" con datos que no lo están.

*Alternativa descartada:* un `min`/`max` en el `<input type="date">`. El navegador lo respeta, pero una petición directa al API no, y el servidor seguiría aceptándolo.

### 2. Un campo inválido cuenta como incompleto

`seccionCompleta()` pasa a exigir dos cosas: que no falte ningún obligatorio y que ninguno tenga valor inválido.

*Consecuencia buscada:* la candidata con la fecha futura deja de figurar como completa y el formulario le pide corregirla. *Consecuencia asumida:* su perfil retrocede de estado sin que ella haya hecho nada. Es preferible a que siga marcada como lista con un dato imposible, pero hay que avisarlo.

### 3. El mínimo es 18 y vive en una constante con nombre

`EDAD_MINIMA = 18`, coherente con las dos preguntas que el formulario ya hace ("Requisitos entre 18 y 20 años", "Requisitos si tienes 26 años"). Se confirmó con el cliente el 2026-08-02: la propuesta inicial fue 21 y se corrigió al ver que el propio formulario contempla candidatas de 18 a 20.

Está en una constante para que cambiarlo sea una línea, no una búsqueda.

## Risks / Trade-offs

- **Un perfil hoy completo puede dejar de serlo** → Es el punto. Afecta a **una sola** candidata en producción, la de los 0 años, que además es una cuenta de prueba del propio equipo: las otras tres tienen 26 y pasan. Verificado antes de desplegar.
- **`validarSeccion()` cambia lo que devuelve** → Se añade una clave; quien sólo lee `ok` y `faltantes` sigue funcionando. Los dos formularios se revisan igualmente.

## Migration Plan

1. El mecanismo y la regla en `campos-perfil.js`.
2. El mensaje en el formulario.
3. Comprobar contra los perfiles reales que nadie válido queda bloqueado.
4. Desplegar y verificar que la candidata con fecha futura deja de figurar completa.

Reversión: un commit; no toca datos.

## Open Questions

- **Edad máxima.** El programa parece llegar a 26. Bloquear por arriba dejaría fuera a una candidata que ya está en proceso y cumplió años, así que no se hace sin decidirlo con la clienta.
