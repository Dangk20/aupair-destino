## Why

Una candidata tiene hoy **tres fichas distintas** según quién la mire, y las tres
dicen cosas diferentes de la misma persona. La candidata ve en `/dashboard/perfil`
una ficha consolidada de sólo lectura, generada desde `lib/campos-perfil.js`. La
clienta ve en `/admin/perfiles/[id]` un asistente de edición de seis pasos, con su
propia lista de secciones y su propio cálculo de progreso. Y en
`/admin/perfiles/[id]/agencia` hay una tercera lista, con diez secciones más y una
regla propia según la cual una sección está completa **con la mitad de sus campos
llenos**.

No es un problema estético. Se verificó en el código: hay tres definiciones
independientes de "qué es una sección de perfil" y tres funciones distintas para
calcular si está completa —`calcProgreso()`, `seccionCompleta()`,
`calcProgresoAgencia()` y `progresoTotal()`—. Por eso el admin muestra
**"100% completado"** sobre una candidata cuyo propio perfil no lo está. Es la
misma raíz del hallazgo del Sprint 0.0 sobre `perfil_completo`: cuando hay tres
listas, la respuesta depende de a cuál le preguntes.

Y falta lo que sí importa para decidir: la **documentación** de la candidata no
aparece en su ficha. Está en un módulo aparte, así que revisar a alguien obliga a
saltar entre pantallas.

## What Changes

- La ficha consolidada se extrae a un **componente compartido** y se usa en las dos
  pantallas. La candidata sigue viendo exactamente lo que ve hoy.
- **BREAKING (para el admin):** `/admin/perfiles/[id]` deja de ser un asistente de
  seis pasos. Pasa a ser la misma ficha que ve la candidata —tarjeta de identidad,
  estado de la evaluación, pestañas por sección— con el lápiz de cada sección
  abriendo su formulario. El progreso deja de calcularse aparte: sale de
  `campos-perfil.js`, así que el número que ve la clienta pasa a ser el real.
- Nueva pestaña **Documentos**, al final de la fila, en las dos vistas. La
  candidata ve el estado de cada documento requerido y puede subirlo; el admin ve
  lo mismo y además aprueba, rechaza y deja nota.
- Las tres definiciones de sección pasan a ser **una**. Los campos que hoy sólo
  muestra el admin (`religion`, `estado_civil`, `numero_pasaporte`,
  `carrera_graduada`, `tiene_visa_j1`, `fumadora`, `acepta_mascotas`,
  `video_presentacion_url`) se declaran en `campos-perfil.js` como **opcionales**:
  no desaparecen del admin y no se vuelven obligatorios de golpe para nadie que ya
  tenga su perfil terminado.
- Lo que es del admin y no de la candidata —`estado_agencia`, `notas_agencia`,
  `score_dap`, el selector de Estado admin— queda en un bloque propio, visible sólo
  para el admin.
- **Se cierra una fuga:** `GET /api/admin/perfiles/[id]` hace `SELECT *` y sólo
  borra `password`; sigue devolviendo `reset_token` y `reset_token_expiry` al
  navegador. Se le aplica la misma lista negra `NUNCA_SE_DEVUELVEN` que ya cerró la
  ruta equivalente de la candidata en el Sprint 1.

### Fuera de alcance

Explícito, porque el contrato es de alcance cerrado:

- **Exportar el perfil a PDF** — ítem 14, Sprint 4.
- **El responsive móvil de estas pantallas** — ítem 3, Sprint 4. Se cuida no
  romper lo que ya funciona, pero no se rediseña para teléfono.
- **Rehacer el flujo de aprobación de perfiles.** Hoy sólo se registra
  `evaluacion_aprobada`, un booleano, y no hay dónde escribir una observación
  cuando un perfil no se aprueba. Es una carencia real, ya señalada, y necesita
  taller de descubrimiento con la clienta.
- **`/api/dashboard/reunion`**, la ruta que no existe y que deja el recuadro "Tu
  próxima reunión" siempre vacío. Documentada, con su propia propuesta.
- El resto del Sprint 2: dashboard con datos reales, indicadores de calendario,
  módulo de recursos.

### Qué queda muerto

- **`app/admin/perfiles/[id]/agencia/page.jsx` (709 líneas) se retira por
  completo.** Su contenido pasa a ser pestañas de la ficha única. Con él se van su
  `SECCIONES` de diez entradas, su `seccionCompleta()` de la mitad de los campos y
  su `calcProgresoAgencia()`. El botón "Perfil agencia" desaparece porque ya no
  hay una segunda pantalla a la que ir.
- De `app/admin/perfiles/[id]/page.jsx` se retiran `SECCIONES`, `CAMPOS_PROGRESO`
  y `calcProgreso()` — la segunda copia de la definición de campos.
- No hay tablas ni columnas que retirar: este cambio unifica lectura y
  presentación, no toca el esquema.

## Capabilities

### New Capabilities

- `ficha-candidata`: la ficha de una candidata es una sola vista, idéntica para la
  candidata y para el personal que la revisa; incluye su documentación; y lo que
  muestra —secciones, campos y progreso— se deriva de una única declaración.

### Modified Capabilities

- `perfil-candidata`: la fuente única de campos deja de gobernar sólo los
  formularios de la candidata y pasa a gobernar también lo que ve el admin,
  incluidos su progreso y sus campos propios.
- `documentos-candidata`: la documentación se consulta además desde la ficha de la
  candidata, con las mismas reglas de acceso que ya rigen su descarga.

## Impact

**Código**

- Nuevo: `components/perfil/FichaCandidata.jsx` (la ficha compartida) y
  `components/perfil/PestanaDocumentos.jsx`.
- Reescritos: `app/dashboard/perfil/page.jsx`, `app/admin/perfiles/[id]/page.jsx`.
- Eliminado: `app/admin/perfiles/[id]/agencia/page.jsx`.
- Ampliado: `lib/campos-perfil.js` con los campos que hoy sólo vivían en el admin.

**APIs**

- `GET /api/admin/perfiles/[id]` — deja de filtrar sólo `password`.
- `GET /api/admin/perfiles/[id]/documentos` — se consume desde la nueva pestaña; no
  cambia su contrato.
- `DOCS_REQUERIDOS` sale de `app/api/dashboard/documentos/route.js` a un módulo
  propio, para que la ficha no dependa de importar desde una ruta de API.

**Riesgo**

El que importa: la clienta usa `/admin/perfiles/[id]` a diario para revisar
candidatas y esa pantalla cambia de forma. Hay que avisarle antes de desplegar,
como se hizo con el menú.
