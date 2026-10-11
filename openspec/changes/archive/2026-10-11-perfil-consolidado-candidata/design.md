## Context

Verificado sobre el código el 2 de agosto de 2026:

- **`lib/campos-perfil.js`** ya declara las 15 secciones (`PARTE1` con 6, `PARTE2` con 9) y sus 63 campos sobre 60 columnas distintas y, por cada campo, su `name` —la columna en `usuarios`— y su `label`, la etiqueta que la candidata reconoce. Ese archivo es desde el Sprint 0.0 la fuente única de la validación y del progreso.
- **Los dos formularios son asistentes por pasos** con el paso en estado interno (`paso` en el de evaluación, `seccion` en el de agencia), siempre inicializado en `0`. **Ninguno lee la URL.**
- Ambos validan al avanzar: retroceder a una sección anterior es libre, saltar hacia adelante exige que la actual esté completa (`validarSeccion`).
- **`/api/dashboard/perfil`** hace `SELECT *`: devuelve **119 columnas**, así que los 63 campos llegan todos — pero también el hash de la contraseña y los tokens de recuperación. La lista de columnas que nunca deben salir ya existe en ese archivo (`BLOQUEADAS`), pero sólo la usa el `PUT`.
- **No existe ninguna vista de lectura** del perfil para la candidata. La única consolidación que existe en el repositorio está dentro de `exportPDF()` en `app/admin/perfiles/[id]/agencia/page.jsx`: una plantilla HTML con `campo` / `lbl` / `val` que se abre en una ventana nueva para imprimir.

Restricción: 10–15 h/semana. La plataforma está viva y la candidata la usa mientras se trabaja.

## Goals / Non-Goals

**Goals:**

- Que la candidata pueda ver su perfil entero de una vez, sin entrar a un formulario.
- Que cada botón lleve a donde dice que lleva.
- Que la candidata vea el resultado de su evaluación cuando exista.
- Que la vista no pueda quedar desincronizada de los formularios.

**Non-Goals:**

- El PDF (ítem 14, Sprint 4) — aunque esta vista sea su cimiento.
- Responsive mobile (ítem 3, Sprint 4).
- Rediseñar los formularios de edición.
- Presentar de forma bonita los campos de lista o de texto largo; se muestran crudos y se anota.

## Decisions

### 1. La vista se genera desde `campos-perfil.js`, no se escribe a mano

Se recorren `PARTE1` y `PARTE2` y se pinta, por cada sección, su título y cada campo como `label` → valor leído del perfil.

*Alternativa descartada:* escribir la vista a mano, sección por sección, como hace `exportPDF()` en el panel del admin. Es más control sobre cómo se ve cada dato, pero crea una segunda lista de campos que hay que acordarse de actualizar. Ese es exactamente el defecto que el Sprint 0.0 corrigió al centralizar la validación: había dos criterios y un perfil podía figurar al 100% con campos vacíos. No se vuelve a abrir esa puerta.

*Consecuencia:* añadir un campo al formulario lo hace aparecer solo en la vista. Y un campo sin `label` se nota de inmediato, porque sale sin rótulo.

### 2. Un valor vacío se muestra, no se esconde

Un campo sin diligenciar aparece con su etiqueta y una marca de vacío.

*Alternativa descartada:* omitir los campos vacíos para que la vista se vea limpia. Se ve mejor y engaña: la candidata cree que su perfil está completo porque no ve huecos. La vista existe justamente para que sepa qué le falta.

### 3. La sección inicial viaja por la URL, y el formulario decide si la honra

Los formularios aceptan `?seccion=<id>` y arrancan ahí. El identificador es el `id` que ya tiene cada sección en `campos-perfil.js` (`personal`, `salud`, `visas`…), no un número: un índice se rompe en cuanto se reordena una sección.

**El formulario sólo honra el salto si todas las secciones anteriores están completas.** Si no lo están, abre en la primera que falte. Así el enlace profundo funciona siempre que sea seguro y nunca evade la validación por pasos del Sprint 0.0, que existe para que nadie llegue al final con secciones a medias.

Si el `id` no existe o no viene, se arranca en cero, como hoy.

*Alternativa descartada:* ofrecer el salto sólo con el perfil completo. Era la decisión inicial, y se cayó al añadir el estado incompleto de la vista (decisión 4): ahí el enlace de "Continuar" apunta justo a la sección que falta, que es cuando más falta hace. Validar en el formulario cubre los dos casos con una sola regla.

### 4. La vista tiene dos estados, y ninguno es esconderla

**Perfil completo:** pestañas con los datos de cada sección.
**Perfil a medias:** la misma tarjeta de perfil arriba, y debajo el recorrido de las 15 secciones con su estado y **qué falta exactamente en cada una** ("Te falta: Estatura, Peso"), cada una enlazando a su sección.

*Alternativa descartada:* redirigir al índice de `/dashboard/perfil` mientras el perfil esté incompleto. Era la decisión inicial. Se cayó por dos motivos. Uno de producto: la tarjeta de perfil —foto, nombre, datos— es lo que la candidata quiere ver desde el primer día, no una recompensa por terminar. Y uno de realidad: **ninguna candidata de producción tiene hoy el perfil completo** —las tres que figuran como completas están al 87–95%—, así que la vista habría sido inalcanzable para todas.

*Consecuencia:* el índice de `/dashboard/perfil` y el estado incompleto de la vista se solapaban — mostraban lo mismo con dos diseños distintos. Se resolvió fusionándolos (decisión 6).

### 5. Las 15 secciones son pestañas, no una columna

Sólo se pinta la sección activa. En una sola columna la vista medía **4.167 px** de alto —casi cinco pantallas— y había que recorrerla entera para llegar a Referencias o a Fotos. Con pestañas mide **885 px**.

Las pestañas van agrupadas por parte, con su etiqueta encima, para que no se pierda de vista que el perfil tiene dos mitades con formularios distintos.

*Alternativa descartada:* secciones plegables (acordeón). Deja ver el índice completo y abrir varias a la vez, pero devuelve el problema del alto en cuanto se abren dos o tres, y en móvil obliga a plegar antes de bajar.

*Alternativa descartada:* pestañas de primer nivel para las partes y de segundo para las secciones. Más ordenado sobre el papel, pero son dos clics para llegar a cualquier sección de la Parte 2 y esconde nueve de las quince.

### 6. Una sola pantalla: la vista **es** `/dashboard/perfil`

No hay ruta aparte. `/dashboard/perfil/vista` se construyó, se probó y **se eliminó**: el índice y esa vista mostraban lo mismo —las secciones, su estado, cómo editarlas— con dos diseños distintos, y obligaban a un salto entre pantallas para ver el propio perfil.

*Alternativa descartada:* mantener las dos, el índice para diligenciar y la vista para consultar. Era la decisión inicial y se cayó al verlas juntas: en cuanto la vista ganó su estado incompleto (decisión 4), la separación dejó de tener sentido. Dos pantallas que muestran lo mismo son una de más, aunque cada una esté bien resuelta.

*Consecuencia:* `/dashboard/perfil` cambia de forma según el estado. Es aceptable porque el trabajo es el mismo —ver y completar tu perfil— y lo que cambia es cuánto hay que ver.

### 7. La evaluación sólo puede decir lo que el sistema registra

Al investigar apareció que **`score_dap`, `calificacion_dap` y `nota_dap` no los escribe nadie** en todo el repositorio: los lee el panel de la agencia, pero ninguna pantalla los graba, así que están siempre en `null`. Lo único que sí se escribe es `evaluacion_aprobada`, un booleano, desde `/api/admin/aprobar-evaluacion`.

Por tanto el bloque tiene **dos** estados, no tres: **en revisión** y **aprobado**.

*Alternativa descartada:* usar `notas_agencia` como la observación para la candidata. Se escribe de verdad desde el panel del admin, así que habría contenido — pero es la nota **interna** sobre el proceso con la agencia, no un mensaje dirigido a ella. Mostrarla filtraría comentarios internos a la persona sobre la que se escriben.

*Consecuencia:* el ítem 11 del alcance ("detalle de evaluación de perfil funcional") queda cubierto en lo que el sistema sabe hoy. Si la clienta quiere que la candidata reciba una observación al no ser aprobada, hay que **crear dónde escribirla** — no existe. Queda como pregunta para ella.

## Risks / Trade-offs

- **La vista muestra campos crudos** (listas, textos largos) → Se acepta a propósito: presentarlos bien exige decidir caso por caso y no hay ninguno que lo pida todavía. Queda anotado en el proposal.
- **Añadir `?seccion=` toca los dos formularios**, que son el corazón del flujo de la candidata → El cambio es acotado —de qué valor parte el paso inicial— y no toca la validación. El recorrido manual de las dos partes es obligatorio antes de cerrar.
- **La vista y el `exportPDF()` del admin quedan conviviendo** → Es duplicación consciente y temporal: el PDF del Sprint 4 debe salir de esta vista y entonces la plantilla del admin se retira. Anotado en el proposal para que no se olvide.

## Migration Plan

1. `campos-perfil.js`: lo que falte para rotular un valor.
2. La vista consolidada, contra un perfil completo real.
3. `?seccion=` en los dos formularios.
4. Reapuntar los caminos de `/dashboard/perfil`.
5. El bloque de evaluación.
6. Recorrido manual con las tres clases de perfil: sin empezar, a medias y completo.

Reversión: cada bloque es un commit y ninguno toca datos. La vista es una ruta nueva; retirarla no afecta a los formularios.

## Open Questions

Resueltas antes de implementar (2026-08-02):

- **¿La vista consolidada con el perfil a medias?** **Sí** — revisado el 2026-08-02 con el cliente, después de verla funcionando. La vista no se esconde: cambia de forma. Ver decisión 4.
- **¿La candidata ve `score_dap` / `calificacion_dap`?** No. Y además resultó que **nadie los escribe**: están siempre vacíos.
- **Pendiente con la clienta:** hoy no hay dónde escribirle una observación a la candidata cuando su perfil no se aprueba. Si lo quiere, es funcionalidad nueva (un campo, y dónde lo llena el equipo), no parte de esta vista.


