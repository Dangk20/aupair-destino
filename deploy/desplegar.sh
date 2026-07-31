#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════
# deploy/desplegar.sh — Despliegue del cierre del Sprint 0.0 al VPS
#
# Ejecuta, en orden y parando ante el primer error:
#   1. respaldo de la base y de los archivos actuales
#   2. sincronización del código (rsync — /opt/dap no es un repo git)
#   3. build y arranque de los contenedores
#   4. movimiento de los documentos al nuevo almacenamiento
#   5. migraciones 003, 004 y 005
#   6. verificación
#
# El respaldo va ANTES de tocar nada y los archivos de origen no se borran:
# hasta el último paso, la vuelta atrás no pierde información.
#
# Uso:  bash deploy/desplegar.sh
# ════════════════════════════════════════════════════════════════════════
set -euo pipefail

VPS="root@2.25.88.197"
REMOTO="/opt/dap"
LOCAL="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SELLO="$(date +%Y%m%d-%H%M%S)"
RESPALDOS="$LOCAL/respaldos/$SELLO"

paso() { printf "\n\033[1;35m━━ %s\033[0m\n" "$1"; }

cd "$LOCAL"

# ── 1. Respaldo ──────────────────────────────────────────────────────────
paso "1/6  Respaldo (base de datos + archivos actuales)"
mkdir -p "$RESPALDOS"

ssh "$VPS" "cd $REMOTO && docker compose exec -T db sh -c 'mysqldump -uroot -p\"\$MYSQL_ROOT_PASSWORD\" --no-tablespaces destino_aupair'" \
  > "$RESPALDOS/base-antes-del-despliegue.sql"
echo "   base → $RESPALDOS/base-antes-del-despliegue.sql ($(du -h "$RESPALDOS/base-antes-del-despliegue.sql" | cut -f1))"

ssh "$VPS" "cd $REMOTO && docker compose exec -T app sh -c 'cd /app/public && tar cf - uploads 2>/dev/null'" \
  > "$RESPALDOS/uploads.tar"
echo "   archivos → $RESPALDOS/uploads.tar ($(du -h "$RESPALDOS/uploads.tar" | cut -f1))"

# ── 2. Código ────────────────────────────────────────────────────────────
paso "2/6  Sincronizando el código (rsync)"
# --exclude .env: el .env del servidor tiene los secretos de producción.
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .git \
  --exclude .env --exclude .env.local --exclude almacenamiento \
  --exclude dump-railway.sql --exclude respaldos --exclude video1.mp4 \
  ./ "$VPS:$REMOTO/"
echo "   código sincronizado"

# ── 3. Build y arranque ──────────────────────────────────────────────────
paso "3/6  Construyendo la imagen y levantando los contenedores"
ssh "$VPS" "cd $REMOTO && docker compose build app && docker compose up -d"

echo "   esperando a que la app responda..."
for i in $(seq 1 30); do
  if ssh "$VPS" "curl -sf -o /dev/null http://127.0.0.1:3000/" 2>/dev/null; then
    echo "   app arriba"; break
  fi
  [ "$i" = 30 ] && { echo "   ✗ la app no respondió en 60s"; exit 1; }
  sleep 2
done

# ── 4. Mover los documentos al nuevo almacenamiento ──────────────────────
paso "4/6  Moviendo los documentos a /app/almacenamiento"
# Se copian desde el volumen viejo (que sigue montado en public/uploads) al
# nuevo. Los archivos de origen NO se borran todavía.
ssh "$VPS" "cd $REMOTO && \
  docker compose exec -T -u root app sh -c '
    mkdir -p /app/almacenamiento
    if [ -d /app/public/uploads/documentos ]; then
      cp -a /app/public/uploads/documentos /app/almacenamiento/ 2>/dev/null || true
    fi
    if [ -d /app/public/uploads/recursos ]; then
      cp -a /app/public/uploads/recursos /app/almacenamiento/ 2>/dev/null || true
    fi
    chown -R nextjs:nodejs /app/almacenamiento
    echo \"   archivos en el nuevo almacenamiento: \$(find /app/almacenamiento -type f | wc -l)\"
  '"

# ── 5. Migraciones ───────────────────────────────────────────────────────
paso "5/6  Migraciones (003 conteo de códigos, 004 rutas, 005 foto_url)"
for m in 003_conteo_usos_codigos 004_documentos_referencia_relativa 005_limpiar_foto_url_invalida; do
  echo "   → $m"
  ssh "$VPS" "cd $REMOTO && docker compose exec -T db sh -c 'mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" destino_aupair'" \
    < "migrations/$m.sql"
done

# ── 6. Verificación ──────────────────────────────────────────────────────
paso "6/6  Verificación"
viejo=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 \
  "https://destino-aupair.com/uploads/documentos/18/certificado_idioma_1784850061544.png" || echo "---")
nuevo=$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 \
  "https://destino-aupair.com/api/documentos/1" || echo "---")

echo "   ruta vieja /uploads/...   → $viejo   (se espera 404: ya no sirve documentos)"
echo "   ruta nueva /api/documentos → $nuevo   (se espera 401: exige sesión)"

ssh "$VPS" "cd $REMOTO && docker compose exec -T db sh -c 'mysql -uroot -p\"\$MYSQL_ROOT_PASSWORD\" destino_aupair -e \"
  SELECT codigo, usos_actuales, usos_max FROM codigos_promo;
  SELECT COUNT(*) AS documentos_sin_normalizar FROM documentos_usuario
   WHERE url LIKE \\\"/uploads/%\\\" OR url LIKE \\\"uploads/%\\\";
\"'"

printf "\n\033[1;32m✓ Despliegue terminado.\033[0m Respaldos en: %s\n" "$RESPALDOS"
cat <<'FIN'

Falta comprobar a mano (2 minutos):
  1. /admin/perfiles/18 → pestaña Documentos: los 12 deben abrirse con el ojito.
     Son los que hasta hoy daban 404 — es la prueba de que el arreglo funcionó.
  2. /admin/perfiles/15 (Maria Jose) → sus 12 documentos deben decir
     "Archivo no disponible": se perdieron antes y hay que pedirle la recarga.
  3. /admin/codigos-promo → los contadores de uso deben cuadrar con las ventas.

La limpieza de public/uploads en el servidor queda pendiente a propósito,
hasta que confirmes que todo se ve bien:
  ssh root@2.25.88.197 'cd /opt/dap && docker compose exec -u root app rm -rf /app/public/uploads'
FIN
