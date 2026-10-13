## Context

- Una agencia es un `usuarios` con `rol='agencia'`. Su relación con una
  candidata es `candidata_agencia` (change `etapas-candidata`), creada al
  aprobar. `moverEtapa({ agenciaId })` ya rechaza mover a una candidata ajena.
- La ficha (`components/perfil/FichaCandidata.jsx`) tiene dos modos (`propio`,
  `revision`) y un booleano `revision` repartido por el componente.
- El tablero (`components/panel/TableroEtapas.jsx`) recibe `movibles`,
  `onMover`, `hrefFicha` y `columnas`: ya sirve a la agencia sin cambios.
- La descarga (`lib/paquete-perfil.js`) arma el ZIP desde un perfil filtrado.
- `/api/documentos/[id]` deja pasar a la dueña o al admin.

## Decisions

### 1. Permisos en una tabla, no un booleano

```js
const PERMISOS = {
  propio:  { terceraPersona:false, editar:"si-no-enviada", observar:false, docs:"propios",  interno:false, descargar:false, moverEtapa:false },
  equipo:  { terceraPersona:true,  editar:true,            observar:true,  docs:"gestion",  interno:true,  descargar:true,  moverEtapa:true  },
  agencia: { terceraPersona:true,  editar:false,           observar:false, docs:"lectura",  interno:false, descargar:true,  moverEtapa:true  },
};
```

`modo="revision"` se conserva como alias de `equipo` para no tocar las páginas
existentes en el mismo paso. *Alternativa descartada — un componente de ficha
para la agencia:* es lo que había y por lo que el panel quedó "distinto y
horrible".

### 2. Qué sale hacia la agencia: `perfilPublicable(fila, "agencia")`

Oculta `SECRETOS` + notas internas (`notas_agencia`), `decision_dap_motivo`,
`score_dap` y `calificacion_dap` (ya sin uso). Deja `nota_dap` (la
presentación). Lo interno del historial se filtra con `paraCandidata: true`
(sin internos), pero se conserva el nombre de la agencia.

### 3. Rutas de la agencia: guard + relación

`lib/agencia-aupair.js · candidataDeAgencia(agenciaId, candidataId)` → fila de
`candidata_agencia` o null. Todas las rutas `/api/agencia/candidatas/[id]/**`
empiezan con `requiereRol(req, "agencia")` y esa comprobación; ajena → 404.

- `GET /api/agencia/tablero` → `tablero({ agenciaId })`.
- `GET /api/agencia/candidatas/[id]` → perfil (modo agencia) + etapa + historial.
- `GET /api/agencia/candidatas/[id]/documentos` → lista de documentos (sólo lectura).
- `PUT /api/agencia/candidatas/[id]/etapa` → `moverEtapa({ agenciaId })`.
- `GET /api/agencia/candidatas/[id]/descargar` → mismo ZIP que el admin.
- `/api/documentos/[id]`: además de dueña y admin, la agencia con relación.

### 4. Pantallas

- `/agencia` → tablero con `columnas` y `movibles` = etapas de la agencia.
- `/agencia/candidatas/[id]` → `FichaCandidata modo="agencia"` con un bloque
  propio arriba: etapa, mover etapa, descargar, presentación del equipo.
- Menú: Inicio (tablero). Se retiran Candidatas, Documentos, Reportes y
  Configuración (rota desde antes).

## Risks / Trade-offs

- **Las agencias pierden pantallas** (reportes, documentos sueltos). → Son
  vistas de un flujo que la clienta reemplazó; el tablero y la ficha cubren lo
  que la agencia hace. Reportes se rediseñan si la clienta los pide.
- **`agencia_evaluaciones` puede tener datos en producción.** → No se borra;
  se cuenta antes.

## Migration Plan

Sin migraciones. Despliegue conjunto con `etapas-candidata` (`deploy/desplegar.sh`).
