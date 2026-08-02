## Context

Verificado sobre el código el 2 de agosto de 2026:

- **`lib/campos-perfil.js`** ya declara las 14 secciones (`PARTE1` con 6, `PARTE2` con 8) y, por cada campo, su `name` —la columna en `usuarios`— y su `label`, la etiqueta que la candidata reconoce. Ese archivo es desde el Sprint 0.0 la fuente única de la validación y del progreso.
- **Los dos formularios son asistentes por pasos** con el paso en estado interno (`paso` en el de evaluación, `seccion` en el de agencia), siempre inicializado en `0`. **Ninguno lee la URL.**
- Ambos validan al avanzar: retroceder a una sección anterior es libre, saltar hacia adelante exige que la actual esté completa (`validarSeccion`).
- **`/api/dashboard/perfil`** ya devuelve el perfil entero más `evaluacion_aprobada`, `score_dap`, `calificacion_dap` y `nota_dap`.
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

### 5. El estado de la evaluación se dice tal cual es

Tres estados y ninguno inventado: **sin evaluar** ("tu perfil está en revisión"), **aprobada** (con calificación y nota si existen) y **con observaciones** (la nota del equipo). Se derivan de `evaluacion_aprobada` y `nota_dap`, que ya llegan del API.

*Alternativa descartada:* mostrar siempre una calificación, con un valor por defecto cuando no hay evaluación. Es la clase de dato inventado que este equipo acaba de retirar del panel de la clienta. Si no hay evaluación, se dice.

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

- ¿La candidata debería poder ver la vista consolidada **con el perfil a medias**, como forma de saber qué le falta? Se asume que no —el índice de `/dashboard/perfil` ya cumple esa función con su progreso por secciones— pero es una decisión de producto que conviene confirmar con la clienta.
- ¿Qué se hace con `score_dap` y `calificacion_dap`? Se asume mostrarlos cuando existan. Si la clienta prefiere que la candidata no vea una calificación numérica, se muestra sólo el estado y la nota.
