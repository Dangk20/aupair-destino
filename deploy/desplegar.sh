#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════
# deploy/desplegar.sh — Despliegue completo, con migraciones.
#
#   1. respaldo (el mismo deploy/respaldar.sh del cron: volumen + base)
#   2. sincronización del código (rsync — /opt/dap no es un repo git)
#   3. build y arranque
#   4. migraciones pendientes
#   5. pruebas de humo del control de acceso · si fallan, el despliegue no se
#      da por bueno
#
# Para cambios que NO tocan la base, usa deploy/desplegar-codigo.sh.
#
# ── Migraciones ─────────────────────────────────────────────────────────
# No hay tabla de migraciones aplicadas: se llevan a mano. Cada una declara
# aquí abajo una CONDICIÓN que dice si todavía hace falta, de modo que
# reejecutar el despliegue no la aplique dos veces. Es deuda anotada: cuando
# haya media docena más, toca una tabla `migraciones_aplicadas`.
#
# Uso:  bash deploy/desplegar.sh
# ════════════════════════════════════════════════════════════════════════
set -euo pipefail

VPS="root@2.25.88.197"
REMOTO="/opt/dap"
LOCAL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

paso() { printf "\n\033[1;35m━━ %s\033[0m\n" "$1"; }
sql()  { ssh "$VPS" "cd $REMOTO && docker compose exec -T db sh -c 'mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" -N -B destino_aupair'"; }

cd "$LOCAL"

# Cada línea: <archivo sin .sql>|<consulta que devuelve >0 si HACE FALTA aplicarla>
MIGRACIONES=(
  "006_retirar_columnas_muertas_usuarios|SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='destino_aupair' AND table_name='usuarios' AND column_name='experiencia_ninos'"
)

# ── 1. Respaldo ──────────────────────────────────────────────────────────
paso "1/5  Respaldo previo (volumen + base)"
ssh "$VPS" "bash $REMOTO/deploy/respaldar.sh"
ssh "$VPS" "tail -1 /var/respaldos-dap/respaldo.log"
ANTES=$(ssh "$VPS" "ls -d /var/respaldos-dap/20* | tail -1")
echo "   respaldo previo: $ANTES"

# ── 2. Código ────────────────────────────────────────────────────────────
paso "2/5  Sincronizando el código (rsync)"
# --exclude .env: el .env del servidor tiene los secretos de producción.
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .git \
  --exclude .env --exclude .env.local --exclude almacenamiento \
  --exclude dump-railway.sql --exclude respaldos --exclude video1.mp4 \
  --exclude .claude --exclude .playwright-mcp \
  ./ "$VPS:$REMOTO/"
echo "   código sincronizado"

# ── 3. Build y arranque ──────────────────────────────────────────────────
paso "3/5  Construyendo la imagen y levantando los contenedores"
ssh "$VPS" "cd $REMOTO && docker compose build app && docker compose up -d"

echo "   esperando a que la app responda..."
for i in $(seq 1 30); do
  if ssh "$VPS" "curl -sf -o /dev/null http://127.0.0.1:3000/" 2>/dev/null; then
    echo "   app arriba"; break
  fi
  [ "$i" = 30 ] && { echo "   ✗ la app no respondió en 60s"; exit 1; }
  sleep 2
done

# ── 4. Migraciones pendientes ────────────────────────────────────────────
paso "4/5  Migraciones"
for entrada in "${MIGRACIONES[@]}"; do
  nombre="${entrada%%|*}"
  condicion="${entrada#*|}"
  hace_falta=$(echo "$condicion;" | sql | tr -d '[:space:]')
  if [ "${hace_falta:-0}" -gt 0 ]; then
    echo "   → aplicando $nombre"
    ssh "$VPS" "cd $REMOTO && docker compose exec -T db sh -c 'mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" destino_aupair'" \
      < "migrations/$nombre.sql"
    echo "     aplicada"
  else
    echo "   · $nombre ya estaba aplicada, se omite"
  fi
done

# ── 5. Verificación ──────────────────────────────────────────────────────
paso "5/5  Pruebas de humo del control de acceso"
# Ojo con la URL: Next standalone se ata a \$HOSTNAME, que Docker fija al
# nombre del contenedor, así que DENTRO del contenedor la app escucha en su
# propia IP y NO en 127.0.0.1. Por eso se apunta a \$(hostname).
if ! ssh "$VPS" "cd $REMOTO && docker compose exec -T app sh -c 'node scripts/pruebas-humo.mjs http://\$(hostname):3000'"; then
  printf "\n\033[1;31m✗ Las pruebas de humo fallaron. El despliegue NO se da por bueno.\033[0m\n"
  printf "  Respaldo previo a este despliegue: %s\n" "$ANTES"
  printf "  Procedimiento de vuelta atrás: deploy/RESTAURAR.md\n"
  exit 1
fi

home=$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "https://destino-aupair.com/")
printf "   %s home pública → %s\n" "$([ "$home" = 200 ] && echo ✓ || echo ✗)" "$home"
[ "$home" = 200 ] || { printf "\n\033[1;31m✗ La home pública no responde 200.\033[0m\n"; exit 1; }

printf "\n\033[1;32m✓ Desplegado y verificado.\033[0m Respaldo previo: %s\n" "$ANTES"
