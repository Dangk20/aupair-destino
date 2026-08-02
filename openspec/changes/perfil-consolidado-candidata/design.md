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

### 3. La sección inicial viaja por la URL, y sólo con el perfil completo

Los formularios aceptan `?seccion=<id>` y arrancan ahí. El identificador es el `id` que ya tiene cada sección en `campos-perfil.js` (`personal`, `salud`, `visas`…), no un número: un índice se rompe en cuanto se reordena una sección.

Si el `id` no existe o no viene, se arranca en cero, como hoy.

*Alternativa descartada:* permitir el salto siempre. Rompería la validación por pasos del Sprint 0.0, que existe para que nadie llegue al final con secciones a medias. El enlace profundo sólo se ofrece desde la vista consolidada, y la vista consolidada sólo aparece con el perfil completo — momento en el que todas las secciones ya están validadas y saltar no se salta nada.

### 4. La vista vive en su propia ruta, no reemplaza a `/dashboard/perfil`

`/dashboard/perfil` sigue siendo el índice con el progreso; la consolidada es `/dashboard/perfil/vista`.

*Alternativa descartada:* convertir `/dashboard/perfil` en la vista consolidada cuando el perfil esté completo. Menos rutas, pero la misma dirección mostraría dos cosas muy distintas según el estado, y el índice con su progreso sigue siendo útil mientras se diligencia. Separadas, cada una tiene un solo trabajo.

### 5. La evaluación sólo puede decir lo que el sistema registra

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

- **¿La vista consolidada con el perfil a medias?** No. Mientras diligencia, la candidata sigue en el índice de `/dashboard/perfil`, que ya muestra el progreso por secciones. La consolidada aparece al completar. Así cada pantalla tiene un solo trabajo, y el salto directo a una sección sólo se ofrece cuando todas están validadas.
- **¿La candidata ve `score_dap` / `calificacion_dap`?** No. Y además resultó que **nadie los escribe**: están siempre vacíos.
- **Pendiente con la clienta:** hoy no hay dónde escribirle una observación a la candidata cuando su perfil no se aprueba. Si lo quiere, es funcionalidad nueva (un campo, y dónde lo llena el equipo), no parte de esta vista.


