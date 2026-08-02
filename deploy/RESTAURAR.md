# Restaurar desde un respaldo

Procedimiento para recuperar los documentos de las candidatas y la base de
datos. **Probado de verdad**, no supuesto — la constancia está al final.

## Qué hay y dónde

| | |
|---|---|
| Script | `/opt/dap/deploy/respaldar.sh` en el VPS (fuente: `deploy/respaldar.sh`) |
| Cron | `15 3 * * *` — todos los días a las 3:15 |
| Destino | `/var/respaldos-dap/AAAAMMDD-HHMM/` — permisos 700, sólo root |
| Retención | 14 días, y **nunca borra el último que quede** |
| Registro | `/var/respaldos-dap/respaldo.log` (éxitos y fallos) · `cron.log` (salida del cron) |

Cada respaldo tiene dos piezas, y se restauran **juntas**:

- `archivos.tar.gz` — el volumen `dap_uploads`: documentos y recursos del curso
- `base.sql` — la base `destino_aupair`

Un archivo sin su fila en `documentos_usuario` es un huérfano invisible; una
fila sin su archivo es el "archivo no disponible" que ya apareció en el
Sprint 0.0. Restaurar sólo una mitad deja la plataforma incoherente.

Los respaldos están **fuera** de `/opt/dap`, así que no los alcanza nada de lo
que sirve la aplicación. Comprobado: pedirlos por web devuelve 404.

## Antes de restaurar nada

```bash
ssh root@2.25.88.197
ls -la /var/respaldos-dap/          # ¿cuál es el último respaldo bueno?
tail -20 /var/respaldos-dap/respaldo.log
```

Si el último respaldo aparece como `✗ FALLO`, usa el anterior: un fallo nunca
sobrescribe ni borra los buenos.

## Caso 1 — Se perdió un documento suelto

El más frecuente: alguien borró un archivo por error.

```bash
ssh root@2.25.88.197
VOL=$(docker volume inspect -f '{{.Mountpoint}}' dap_uploads)
R=$(ls -d /var/respaldos-dap/20* | tail -1)

# Ver qué contiene el respaldo
tar -tzf "$R/archivos.tar.gz" | grep pasaporte

# Sacar SÓLO ese archivo
tar -xzf "$R/archivos.tar.gz" -C "$VOL" ./documentos/18/pasaporte_1784850007290.png
chown -R 1001:1001 "$VOL/documentos/18"
```

Comprueba entrando al panel: `/admin/perfiles/18` → pestaña Documentos → el
documento debe abrirse. No hace falta reiniciar nada.

## Caso 2 — Se perdió el volumen entero

```bash
ssh root@2.25.88.197
cd /opt/dap
R=$(ls -d /var/respaldos-dap/20* | tail -1)

docker compose stop app
docker volume create dap_uploads          # sin efecto si ya existe
VOL=$(docker volume inspect -f '{{.Mountpoint}}' dap_uploads)
tar -xzf "$R/archivos.tar.gz" -C "$VOL"
chown -R 1001:1001 "$VOL"
docker compose start app
```

`1001:1001` es el usuario `nextjs` del contenedor (ver `Dockerfile`). Sin ese
`chown`, la aplicación no puede leer lo que acabas de restaurar.

## Caso 3 — Hay que restaurar la base

**Destruye los datos posteriores al respaldo.** Antes de hacerlo, saca una
copia del estado actual, aunque esté dañado:

```bash
ssh root@2.25.88.197
cd /opt/dap
bash deploy/respaldar.sh                  # copia de seguridad del "antes"

R=$(ls -d /var/respaldos-dap/20* | tail -2 | head -1)   # el respaldo bueno
docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "
  DROP DATABASE destino_aupair; CREATE DATABASE destino_aupair;"'
docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" destino_aupair' < "$R/base.sql"
docker compose restart app
```

Restaura **el mismo respaldo** para archivos y base, o quedarán descuadrados.

## Comprobar sin arriesgar nada

Para verificar que un respaldo sirve, sin tocar producción:

```bash
# Archivos: comparar contra el volumen vivo
rm -rf /tmp/verif && mkdir -p /tmp/verif
tar -xzf "$R/archivos.tar.gz" -C /tmp/verif
diff -rq "$(docker volume inspect -f '{{.Mountpoint}}' dap_uploads)" /tmp/verif

# Base: restaurar a un nombre de prueba y contar
cd /opt/dap
docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "
  DROP DATABASE IF EXISTS prueba_restauracion; CREATE DATABASE prueba_restauracion;"'
docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" prueba_restauracion' < "$R/base.sql"
docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "
  SELECT (SELECT COUNT(*) FROM destino_aupair.usuarios) AS produccion,
         (SELECT COUNT(*) FROM prueba_restauracion.usuarios) AS restaurada;"'
docker compose exec -T db sh -c 'mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "
  DROP DATABASE prueba_restauracion;"'
rm -rf /tmp/verif
```

---

## Constancia de la prueba

**2 de agosto de 2026** — restauración probada sobre el respaldo
`20260802-2117` en el servidor de producción:

| Qué se probó | Resultado |
|---|---|
| Integridad del `tar` | 14 archivos, 5.597.048 bytes · `diff -rq` contra el volumen vivo: **sin una sola diferencia** |
| Restauración de la base | Restaurada a `prueba_restauracion`; conteos idénticos a producción en `usuarios` (18), `documentos_usuario` (26), `ventas` (1), `comisiones` (0) y `codigos_promo` (4) |
| **Ciclo completo de un documento** | Documento 15 (pasaporte de la usuaria 18): abre por `/api/documentos/15` → **200**; archivo apartado → **404**; restaurado del respaldo → **200**; idéntico byte a byte al original |
| Camino de fallo | Con el volumen inaccesible, el script sale con código 1, deja `✗ FALLO` en el registro, **no genera un respaldo a medias y no toca los anteriores** |
| Exposición web | `base.sql`, `respaldo.log` y `respaldar.sh` pedidos desde internet: **404** los cuatro intentos, incluido uno con `../` |

**Lo que este respaldo no cubre:** vive en el mismo disco que la plataforma.
Protege contra el borrado accidental —el escenario probable— pero no contra
la pérdida del VPS. El respaldo externo (S3/R2) queda como deuda anotada, con
su razón: implica cuenta, credenciales y costo, y no estaba en el alcance.
