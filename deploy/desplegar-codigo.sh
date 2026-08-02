#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════
# deploy/desplegar-codigo.sh — Despliegue rápido de sólo código
#
# Para cambios que NO tocan la base ni los archivos: sincroniza, construye
# y levanta. Sin migraciones ni movimiento de archivos.
#
# Si el cambio incluye migraciones, usar deploy/desplegar.sh.
#
# Uso:  bash deploy/desplegar-codigo.sh
# ════════════════════════════════════════════════════════════════════════
set -euo pipefail

VPS="root@2.25.88.197"
REMOTO="/opt/dap"
LOCAL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

paso() { printf "\n\033[1;35m━━ %s\033[0m\n" "$1"; }
cd "$LOCAL"

paso "1/3  Sincronizando el código (rsync)"
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .git \
  --exclude .env --exclude .env.local --exclude almacenamiento \
  --exclude dump-railway.sql --exclude respaldos --exclude video1.mp4 \
  ./ "$VPS:$REMOTO/"

paso "2/3  Construyendo y levantando"
ssh "$VPS" "cd $REMOTO && docker compose build app && docker compose up -d"

echo "   esperando a que la app responda..."
for i in $(seq 1 30); do
  if ssh "$VPS" "curl -sf -o /dev/null http://127.0.0.1:3000/" 2>/dev/null; then
    echo "   app arriba"; break
  fi
  [ "$i" = 30 ] && { echo "   ✗ la app no respondió en 60s"; exit 1; }
  sleep 2
done

paso "3/3  Pruebas de humo del control de acceso"

# Corren DENTRO del contenedor: ahí JWT_AUPAIR_SECRET ya está en el entorno,
# así que se verifican también rol y permiso sin sacar el secreto del VPS.
# El script sale distinto de cero si alguna regla falla y `set -e` corta aquí.
# Ojo con la URL: Next standalone se ata a \$HOSTNAME, que Docker fija al
# nombre del contenedor, así que DENTRO del contenedor la app escucha en su
# propia IP y NO en 127.0.0.1. Por eso se apunta a \$(hostname).
if ! ssh "$VPS" "cd $REMOTO && docker compose exec -T app sh -c 'node scripts/pruebas-humo.mjs http://\$(hostname):3000'"; then
  printf "\n\033[1;31m✗ Las pruebas de humo fallaron. El despliegue NO se da por bueno.\033[0m\n"
  printf "  El código ya está arriba: revisa lo que reportaron y corrige, o revierte.\n"
  exit 1
fi

# La app pública debe seguir viva
home=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://destino-aupair.com/")
printf "   %s home pública → %s\n" "$([ "$home" = 200 ] && echo ✓ || echo ✗)" "$home"
[ "$home" = 200 ] || { printf "\n\033[1;31m✗ La home pública no responde 200.\033[0m\n"; exit 1; }

printf "\n\033[1;32m✓ Desplegado y verificado.\033[0m\n"
