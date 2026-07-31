# Migración de documentos al almacenamiento de datos

Los documentos de las candidatas dejan de vivir en `public/uploads/` y pasan a
`UPLOADS_DIR` (`/app/almacenamiento` en el contenedor), servidos por la ruta
autenticada `/api/documentos/<id>`.

**Por qué:** bajo `public/` cualquiera con el enlace abría el pasaporte o la
cédula de una candidata sin iniciar sesión, y además el servidor `standalone` de
Next resuelve los estáticos de `public/` a partir del build — por eso en
producción los documentos subidos en runtime devolvían **404**.

El movimiento de archivos y la normalización de la base **van en la misma
ventana de despliegue**. Si se despliega el código nuevo sin mover los archivos,
todos los documentos aparecerán como "archivo no disponible" hasta completarlo.

---

## 1. Antes de tocar nada: inventariar qué hay

En el VPS, con los contenedores como están:

```bash
cd /ruta/del/proyecto

# ¿Qué archivos hay hoy en el volumen?
docker compose exec app sh -c 'ls -R /app/public/uploads 2>/dev/null | head -50'
docker compose exec app sh -c 'find /app/public/uploads -type f | wc -l'

# ¿Qué espera la base de datos?
docker compose exec db mysql -uroot -p"$DB_ROOT_PASSWORD" destino_aupair \
  -e "SELECT COUNT(*) AS registros FROM documentos_usuario;"
```

Compara los dos números y **anota el resultado** antes de seguir:

- **Archivos ≈ registros** → los documentos están; la migración los deja
  accesibles y nadie tiene que volver a subir nada.
- **Volumen vacío o muy por debajo** → los archivos se perdieron (el volumen se
  montó vacío sobre lo que había en la imagen). La aplicación no puede
  recuperarlos: quedarán marcados como "archivo no disponible" y hay que pedirle
  a las candidatas afectadas que los vuelvan a cargar.

Para saber a quiénes hay que pedirles la recarga:

```bash
docker compose exec db mysql -uroot -p"$DB_ROOT_PASSWORD" destino_aupair -e "
  SELECT u.id, u.nombre, u.apellido, u.email, COUNT(d.id) AS documentos
    FROM documentos_usuario d
    JOIN usuarios u ON u.id = d.usuario_id
   GROUP BY u.id ORDER BY u.id;"
```

## 2. Respaldar

```bash
docker compose exec db sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" destino_aupair' \
  > respaldo-antes-migracion-documentos.sql

# Copiar los archivos actuales del volumen al host, por si acaso
docker compose cp app:/app/public/uploads ./respaldo-uploads
```

## 3. Desplegar el código nuevo

`/opt/dap` **no es un repositorio git**: el código se sincroniza con rsync desde
la máquina local (el VPS no tiene credenciales de GitHub).

Desde local, en la raíz del proyecto:

```bash
rsync -az --delete \
  --exclude node_modules --exclude .next --exclude .git \
  --exclude .env --exclude almacenamiento --exclude dump-railway.sql \
  ./ root@2.25.88.197:/opt/dap/
```

`--exclude .env` es importante: el `.env` del servidor tiene los secretos de
producción y no debe pisarse con el local.

Luego, en el VPS:

```bash
cd /opt/dap
docker compose build app
docker compose up -d
```

El `docker-compose.yml` ya monta el volumen `uploads` en `/app/almacenamiento` y
declara `UPLOADS_DIR`.

## 4. Mover los archivos al nuevo directorio

Si el respaldo del paso 2 trajo archivos, cargarlos en el nuevo directorio
conservando la estructura `documentos/<usuario_id>/<archivo>`:

```bash
docker compose cp ./respaldo-uploads/documentos app:/app/almacenamiento/documentos
docker compose exec -u root app sh -c 'chown -R nextjs:nodejs /app/almacenamiento'

# Verificar
docker compose exec app sh -c 'find /app/almacenamiento -type f | wc -l'
```

## 5. Normalizar las referencias en la base

```bash
docker compose exec -T db mysql -uroot -p"$DB_ROOT_PASSWORD" destino_aupair \
  < migrations/004_documentos_referencia_relativa.sql
```

La consulta final debe devolver `filas_sin_normalizar = 0`.

Aprovechar la misma ventana para el conteo de códigos:

```bash
docker compose exec -T db mysql -uroot -p"$DB_ROOT_PASSWORD" destino_aupair \
  < migrations/003_conteo_usos_codigos.sql
```

## 6. Verificar

1. Entrar como admin a `/admin/perfiles/<id>` → pestaña **Documentos**.
   - Los documentos con archivo presente abren con el ojito.
   - Los perdidos muestran "Archivo no disponible" en rojo, no un 404.
2. Entrar como candidata a `/dashboard/documentos`: los perdidos aparecen como
   "Vuelve a subirlo" con el botón de recarga.
3. Comprobar que la ruta vieja ya no sirve documentos — debe dar 404:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" \
     https://destino-aupair.com/uploads/documentos/18/certificado_idioma_1784850061544.png
   ```
4. Comprobar que la ruta nueva exige sesión — debe dar 401:
   ```bash
   curl -s -o /dev/null -w "%{http_code}\n" https://destino-aupair.com/api/documentos/1
   ```

## 7. Limpieza (sólo después de verificar)

```bash
docker compose exec -u root app sh -c 'rm -rf /app/public/uploads'
```

Conservar `respaldo-uploads/` y el dump SQL hasta confirmar con la clienta que
todo se ve bien.

---

## Reversión

El cambio se revierte volviendo al commit anterior y restaurando el dump del
paso 2. Los archivos no se borran del origen hasta el paso 7, así que hasta ese
punto la vuelta atrás no pierde nada.
