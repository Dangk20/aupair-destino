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

paso "3/3  Verificación: ninguna ruta de admin debe responder sin sesión"
fallos=0
for p in /api/admin/pagos/movimientos /api/admin/pagos/stats /api/admin/referidos \
         /api/admin/referidos/inscripciones /api/admin/usuarios/actividad \
         /api/admin/usuarios/top-referentes /api/admin/stats; do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://destino-aupair.com$p" || echo "---")
  if [ "$code" = "401" ] || [ "$code" = "403" ]; then
    printf "   ✓ %-44s %s\n" "$p" "$code"
  else
    printf "   ✗ %-44s %s  ← SIGUE ABIERTA\n" "$p" "$code"; fallos=$((fallos+1))
  fi
done

# La app pública debe seguir viva
home=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "https://destino-aupair.com/")
printf "   %s home pública                                 %s\n" "$([ "$home" = 200 ] && echo ✓ || echo ✗)" "$home"

if [ "$fallos" -gt 0 ]; then
  printf "\n\033[1;31m✗ Quedan %s ruta(s) abiertas.\033[0m\n" "$fallos"; exit 1
fi
printf "\n\033[1;32m✓ Desplegado y verificado.\033[0m\n"
