## Context

Capa Destino Au Pair. Lo que hay y se usa:

- Decisión: `usuarios.evaluacion_aprobada` (booleano, sin fecha; dueño único
  `PUT /api/admin/aprobar-evaluacion`). Valoración: `calificacion_dap`,
  `score_dap`, `nota_dap`, `notas_agencia`, `estado_agencia` (texto libre, tres
  vocabularios).
- Envío y observaciones: `usuarios.parte1_enviada_at`, `parte2_enviada_at`,
  `observaciones_perfil` (change `bloqueo-y-observaciones-perfil`).
- Una agencia es un `usuarios` con `rol='agencia'` (sin entidad propia ni
  nombre de empresa: se muestra `nombre apellido`).
- `GET /api/dashboard/proceso` arma siete pasos (`curso`, `cuentanos_de_ti`,
  `evaluacion_perfil`, `perfil_agencia`, `match`, `visa`, `viaje`) y lo consumen
  `app/dashboard/proceso` (Mi Destino), `app/dashboard/page.jsx` (inicio),
  `app/dashboard/reuniones` y `app/dashboard/recursos` (cuentan fases por id).

## Goals / Non-Goals

**Goals:** un vocabulario, una fuente de verdad por etapa, fechas para todo, un
componente de línea de tiempo y un tablero.
**Non-Goals:** panel de la agencia (change `panel-agencia`); comisión R17;
varias agencias.

## Decisions

### 1. Datos — migración 009

```sql
ALTER TABLE usuarios
  ADD COLUMN decision_dap ENUM('aprobada','no_califica') NULL,
  ADD COLUMN decision_dap_at DATETIME NULL,
  ADD COLUMN decision_dap_motivo TEXT NULL;          -- interno (No califica)
CREATE TABLE candidata_agencia (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidata_id INT NOT NULL, agencia_id INT NOT NULL,
  etapa ENUM('evaluacion','plan','pago','visa','completada','no_continua') NOT NULL DEFAULT 'evaluacion',
  etapa_desde DATETIME DEFAULT CURRENT_TIMESTAMP, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_candidata (candidata_id),             -- una agencia por candidata, por ahora
  FOREIGN KEY (candidata_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (agencia_id)  REFERENCES usuarios(id)
);
CREATE TABLE historial_candidata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  candidata_id INT NOT NULL, evento VARCHAR(40) NOT NULL,
  agencia_id INT NULL, detalle TEXT NULL, interno TINYINT(1) NOT NULL DEFAULT 0,
  actor_id INT NULL, actor_rol VARCHAR(20) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (candidata_id, created_at),
  FOREIGN KEY (candidata_id) REFERENCES usuarios(id) ON DELETE CASCADE
);
```

Relleno en la misma migración, para que la línea de tiempo no arranque vacía:
`registro` (de `created_at`), `parte1_enviada`/`parte2_enviada` (de sus
fechas), y para quien tiene `evaluacion_aprobada = 1`: `decision_dap='aprobada'`
y un hecho `aprobada` con la fecha de la migración y el detalle "Aprobada antes
de que existiera el historial". No se crea `candidata_agencia` para ellas: su
etapa sale "Evaluación de la agencia" sin agencia, y el admin la asigna desde la
ficha.

*Alternativa descartada — seguir usando `estado_agencia`:* es una sola columna
para lo que ahora son dos cosas (la decisión del equipo y la etapa con una
agencia) y la escriben actores con vocabularios distintos.

*Alternativa descartada — `agencia_evaluaciones`:* modela el flujo heredado
(evaluación, plan de cuotas, pago) con upsert sin fechas; la clienta lo
reemplazó por las etapas nuevas. Se retira en `panel-agencia`.

`evaluacion_aprobada` se conserva y se mantiene sincronizada con
`decision_dap = 'aprobada'`: la leen la ficha, el proceso y los correos.

### 2. Las reglas — `lib/etapas-candidata.js` (puro)

```js
export const ETAPAS = [ {id:"diligenciando", label:"Diligenciando", calculada:true}, …,
  {id:"evaluacion", label:"Evaluación de la agencia", agencia:true}, {id:"plan", label:"Elección de plan", agencia:true},
  {id:"pago", label:"Pago confirmado", agencia:true}, {id:"visa", …}, {id:"completada", …} ];
export const SALIDAS = [ {id:"no_califica", …}, {id:"no_continua", …} ];
export function etapaDe({ perfil, abiertas, relacion })        // precedencia del spec
export function scoreInformacion(perfil, tiposDocCargados)     // 0–100
```

"En revisión" para quien terminó la Parte 1 antes de que existiera el envío: se
toma `parte1_enviada_at`, o la Parte 1 completa con `created_at` anterior a
`ENVIO_DESDE = "2026-10-12"`.

Score: campos únicos de `PARTE1 ∪ PARTE2` que aplican (sin `requeridoSi`, con
`requeridoSi` opcional, o condicional cumplido), contados como diligenciados si
tienen valor válido, más los 12 `DOCS_REQUERIDOS`; `round(llenos/total*100)`.

### 3. Escritura — `lib/historial-aupair.js`

`registrarHecho({ candidataId, evento, agenciaId, detalle, interno, actor })`
nunca lanza (un fallo de historial no tumba la operación, igual que el correo).
Lo llaman: registro, `perfil/enviar`, `POST observaciones` (`correcciones`, una
vez por tanda de observaciones del mismo día), `decision`, `etapa`.

`moverEtapa({ candidataId, etapa, actor })` valida que la etapa sea de la
agencia, actualiza `candidata_agencia` y registra el hecho. Es el dueño único
del cambio de etapa: la ruta del admin la usa aquí y la de la agencia en
`panel-agencia`.

### 4. Rutas

- `PUT /api/admin/perfiles/[id]/decision { accion: aprobar|no_califica|revertir, agencia_id?, motivo? }`
  reemplaza a `aprobar-evaluacion`; conserva su regla (Parte 1 completa) y su
  aviso por correo.
- `PUT /api/admin/perfiles/[id]/etapa { etapa }` → `moverEtapa`.
- `GET /api/admin/perfiles/[id]/historial`, `GET /api/dashboard/historial` (sin
  `interno`, sin autor).
- `GET /api/admin/tablero` → candidatas con etapa, score, agencia, `desde`.
- `GET /api/admin/agencias` → lista para elegir al aprobar.
- `GET /api/dashboard/proceso` reescrita: pasos `curso`, `perfil`, `revision`,
  `agencia`, `plan`, `pago`, `visa`, `completada`, con la misma forma de
  respuesta. Se actualizan los ids que leen inicio, reuniones y recursos.

### 5. Componentes compartidos

- `components/perfil/LineaDeTiempo.jsx` (`modo`: propio | revision): las ocho
  etapas en vertical (cumplida / actual / pendiente, con fecha) y debajo los
  hechos. Se monta en Mi Destino (reemplaza su lista de pasos), en la ficha
  propia y en la ficha del admin.
- `components/panel/TableroEtapas.jsx`: columnas por etapa con scroll
  horizontal; arrastrar entre columnas de la agencia (HTML5 nativo, sin
  librería) y "Mover a" en la tarjeta para móvil. Recibe `columnasMovibles` y
  `onMover`: el mismo componente servirá a la agencia.

### 6. Ficha del admin

El `BloqueInterno` pasa a: etapa + agencia + score en el encabezado; tres
botones de decisión (Aprobar abre la elección de agencia, preseleccionada si
hay una sola; No califica abre el motivo); si está aprobada, "Mover etapa"; las
dos notas con su visibilidad. Se retiran los selects de calificación y estado y
el score manual.

## Risks / Trade-offs

- **El panel heredado de la agencia lee `estado_agencia` y `calificacion_dap`**,
  que dejan de escribirse. → Se despliega junto con `panel-agencia`, que lo
  reemplaza.
- **Historial reconstruido a medias** para hechos sin fecha. → Se dice en el
  propio hecho.
- **Arrastrar en móvil** no es fiable. → "Mover a" en la tarjeta.

## Migration Plan

`009_etapas_candidata.sql` (idempotente, con relleno) registrada en
`deploy/desplegar.sh`. Despliegue conjunto con `panel-agencia`.
