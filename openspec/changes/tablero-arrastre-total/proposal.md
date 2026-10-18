## Por qué

En el tablero de Candidatas sólo se arrastran las tarjetas que ya están con la agencia; las de Diligenciando, En revisión y Con correcciones no se mueven, y la decisión se toma entrando a la ficha. El admin quiere operar todo el recorrido desde el tablero, arrastrando (pedido de Daniel, 17 oct 2026).

Las tres primeras etapas no se guardan: se calculan de los datos (envío de la Parte 1, observaciones abiertas, decisión del equipo). Por eso arrastrar no puede "cambiar la etapa" sin más: tiene que disparar la decisión que la produce.

## Qué cambia

- Todas las tarjetas del tablero del admin se arrastran, y todas las columnas reciben.
- Soltar en una etapa de la agencia desde otra de la agencia: se mueve, como hoy.
- Soltar en **Evaluación de la agencia** una candidata que aún no está con la agencia: abre «Aprobar y enviar a la agencia» con la lista de agencias (la misma decisión y validación de la ficha: Parte 1 completa).
- Soltar en **No califica**: pide el motivo interno (decisión No califica).
- Soltar en **Con correcciones**: explica que las correcciones se escriben como observaciones y ofrece ir a la ficha.
- Soltar en **En revisión** o **Diligenciando** una candidata con decisión (aprobada sin avanzar, o No califica): confirma y revierte la decisión.
- Soltar en **En revisión** o **Diligenciando** sin decisión: explica que esas etapas las marca la candidata al enviar su perfil; no cambia nada.
- Soltar en una etapa de la agencia posterior a Evaluación sin estar aprobada: pide aprobarla primero.
- El tablero de la agencia y el de la asociada no cambian.

## Impacto

`components/panel/TableroEtapas.jsx` (prop `onSoltar`), `app/admin/perfiles/page.jsx` (las decisiones al soltar). Sin cambios de API: usa `/api/admin/perfiles/[id]/etapa`, `/decision` y `/api/admin/agencias`.
