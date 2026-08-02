#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════
# deploy/respaldar.sh — Respaldo diario. Vive y se ejecuta EN EL VPS.
#
#   Instalación:  /opt/dap/deploy/respaldar.sh   (lo instala deploy/instalar-respaldo.sh)
#   Cron:         todos los días a las 03:15
#   Manual:       bash /opt/dap/deploy/respaldar.sh
#
# Respalda dos cosas, porque una sin la otra no sirve de nada:
#   · el volumen dap_uploads — documentos de las candidatas y recursos del curso
#   · la base destino_aupair — los registros que apuntan a esos archivos
#
# Un archivo sin su fila en `documentos_usuario` es un archivo huérfano, y una
# fila sin su archivo es el "archivo no disponible" que ya vimos en el Sprint
# 0.0. Se respaldan juntos y se restauran juntos.
#
# Los respaldos contienen pasaportes y cédulas: van a /var/respaldos-dap, que
# está fuera de /opt/dap y por tanto fuera de todo lo que sirve la aplicación,
# con permisos 700 para root.
#
# Procedimiento de restauración: deploy/RESTAURAR.md
# ════════════════════════════════════════════════════════════════════════
set -uo pipefail

DESTINO="/var/respaldos-dap"
RETENCION_DIAS=14
PROYECTO="/opt/dap"
REGISTRO="$DESTINO/respaldo.log"

sello() { date "+%Y-%m-%d %H:%M:%S"; }
anota() { echo "[$(sello)] $*" >> "$REGISTRO"; }

mkdir -p "$DESTINO"
chmod 700 "$DESTINO"

FECHA=$(date +%Y%m%d-%H%M)
TMP="$DESTINO/.en-curso-$FECHA"
mkdir -p "$TMP"

# Se construye en un directorio temporal y sólo al final se mueve al nombre
# definitivo. Así un respaldo a medias nunca se confunde con uno bueno, y un
# fallo no toca los respaldos anteriores.
fallo() {
  anota "✗ FALLO: $1 — no se generó respaldo. Los anteriores siguen intactos."
  rm -rf "$TMP"
  exit 1
}

# ── 1. Archivos ─────────────────────────────────────────────────────────
PUNTO=$(docker volume inspect -f '{{.Mountpoint}}' dap_uploads 2>/dev/null) \
  || fallo "no se pudo localizar el volumen dap_uploads"
[ -d "$PUNTO" ] || fallo "el punto de montaje $PUNTO no existe"

tar -czf "$TMP/archivos.tar.gz" -C "$PUNTO" . 2>/dev/null \
  || fallo "tar del volumen de archivos"

# ── 2. Base de datos ────────────────────────────────────────────────────
cd "$PROYECTO" || fallo "no existe $PROYECTO"
docker compose exec -T db sh -c \
  'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines destino_aupair' \
  > "$TMP/base.sql" 2>/dev/null \
  || fallo "mysqldump de destino_aupair"

# Un dump vacío o truncado pasa el código de salida pero no sirve. Se
# comprueba que termine como termina un dump completo.
tail -5 "$TMP/base.sql" | grep -q "Dump completed" \
  || fallo "el dump de la base quedó incompleto"

# ── 3. Cerrar ───────────────────────────────────────────────────────────
FINAL="$DESTINO/$FECHA"
mv "$TMP" "$FINAL" || fallo "no se pudo cerrar el respaldo"
chmod -R 600 "$FINAL"/* ; chmod 700 "$FINAL"

PESO=$(du -sh "$FINAL" | cut -f1)
anota "✓ $FECHA ($PESO) — archivos.tar.gz + base.sql"

# ── 4. Rotación ─────────────────────────────────────────────────────────
# Se borran los que superan la retención, pero NUNCA el último que quede:
# si algo va mal durante días, mejor un respaldo viejo que ninguno.
mapfile -t VIEJOS < <(find "$DESTINO" -maxdepth 1 -type d -name '20*' -mtime "+$RETENCION_DIAS" | sort)
TOTAL=$(find "$DESTINO" -maxdepth 1 -type d -name '20*' | wc -l)
for d in "${VIEJOS[@]}"; do
  [ "$TOTAL" -le 1 ] && break
  rm -rf "$d" && anota "  rotado: $(basename "$d")" && TOTAL=$((TOTAL-1))
done

exit 0
