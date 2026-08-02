# Destino Au Pair

Plataforma que prepara, evalúa y conecta candidatas au pair colombianas con
agencias aliadas. **Está en producción**, con candidatas y pagos reales.

- **Guía para trabajar en el código:** [`CLAUDE.md`](CLAUDE.md) — reglas de
  ingeniería, arquitectura y convenciones.
- **Control de acceso de la API:** [`docs/rutas-y-acceso.md`](docs/rutas-y-acceso.md)
  — el nivel que exige cada ruta. Es la fuente de las pruebas de humo.
- **Base de datos:** [`GUIA_BD_ROLES.md`](GUIA_BD_ROLES.md) y
  [`COMANDOS_SQL_UTILES.sql`](COMANDOS_SQL_UTILES.sql).
- **Despliegue:** [`deploy/DEPLOY.md`](deploy/DEPLOY.md).
- **Cambios en curso:** `openspec/changes/` — todo cambio de comportamiento
  pasa por una propuesta antes de tocar código.

## Arrancar en local

```bash
npm i
docker start dap-mysql      # MySQL en 127.0.0.1:3307, base destino_aupair
npm run dev                 # http://localhost:3000
```

Detalle del entorno y las variables en [`LEEME-LOCAL.md`](LEEME-LOCAL.md) y
`.env.example`.

## Comprobar antes de dar algo por terminado

```bash
npm run build                  # tiene que pasar
node scripts/pruebas-humo.mjs  # 541 aserciones de control de acceso
```

Las pruebas de humo también corren en cada despliegue, dentro del contenedor:
si alguna falla, el despliegue no se da por bueno.

> `npm run lint` está roto desde antes: llama a `next lint`, que Next 16
> retiró.

## Stack

Next.js 16 (App Router, JavaScript — no TypeScript), React 19, Tailwind 4,
MySQL con SQL crudo vía `mysql2` (sin ORM), sesión por JWT en cookie.
Todo —interfaz, comentarios, tablas y columnas— está en español.
