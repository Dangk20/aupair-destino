# Levantar Destino Au Pair en local

Ambiente de pruebas con una copia de la base de datos de producción (Railway).

## Requisitos
- Node 18+ y npm
- Docker (Colima o Docker Desktop) para la base de datos

## 1. Base de datos local (MySQL en Docker)

Levantar el contenedor MySQL en el puerto 3307:

```bash
docker run -d --name dap-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=destino_aupair \
  -p 3307:3306 mysql:8
```

Cargar el dump de la base (pedir el archivo `dump-railway.sql` al equipo — **no se versiona**, contiene datos reales):

```bash
docker exec -i dap-mysql mysql -uroot -proot destino_aupair < dump-railway.sql
```

> Para volver a sacar un dump fresco desde Railway (requiere la URL pública del MySQL):
> ```bash
> docker run --rm mysql:8 mysqldump -h <HOST> -P <PUERTO> -u root -p<PASS> \
>   --no-tablespaces --set-gtid-purged=OFF --column-statistics=0 --single-transaction \
>   railway > dump-railway.sql
> ```

## 2. Variables de entorno

```bash
cp .env.example .env.local
```

Los valores por defecto ya apuntan al MySQL local del paso 1. No hace falta tocar nada para desarrollo.

## 3. Migraciones

Las migraciones son idempotentes: se pueden correr varias veces. Aplicarlas en orden sobre la BD local recién cargada:

```bash
for f in migrations/*.sql; do
  echo "→ $f"
  docker exec -i dap-mysql mysql -uroot -proot destino_aupair < "$f"
done
```

> `004` normaliza las rutas de documentos y recursos al nuevo almacenamiento. Si el dump trae documentos, sus archivos deben estar en `almacenamiento/documentos/<usuario_id>/`; los que falten aparecerán en la app como "archivo no disponible", que es el comportamiento esperado.

## 4. Correr la app

```bash
npm install
npm run dev
```

Abrir http://localhost:3000

## Usuario de prueba (solo en la BD local)

Se cambió la contraseña de un admin **únicamente en la copia local** para poder entrar:

- **Usuario:** `admin@destinoaupair.com`
- **Contraseña:** `Local1234!`

Para fijar/cambiar la contraseña de cualquier usuario en local:

```bash
HASH=$(node -e "console.log(require('bcryptjs').hashSync('TU_PASSWORD',10))")
docker exec dap-mysql mysql -uroot -proot destino_aupair \
  -e "UPDATE usuarios SET password='$HASH' WHERE email='EMAIL@AQUI';"
```

## Reiniciar en otra sesión

El contenedor persiste. Para retomar el trabajo:

```bash
docker start dap-mysql   # arranca la BD si estaba detenida
npm run dev
```

## Archivos subidos

Documentos de las candidatas y recursos del curso se guardan en `almacenamiento/`
(fuera de `public/`, sin versionar) y se sirven autenticados por
`/api/documentos/<id>` y `/api/sesion-recursos/<id>/archivo`. Configurable con
`UPLOADS_DIR`.

## Notas
- Los correos (recuperar contraseña, notificaciones de reunión) **no se envían** en local porque `RESEND_API_KEY` va vacío. Es esperado.
- Las **fotos de perfil** siguen guardándose como base64 dentro de MySQL (deuda técnica conocida, ver auditoría). Los documentos ya no: viven en `almacenamiento/`.
- `npm run lint` está roto de antes (llama a `next lint`, retirado en Next 16). Usar `npm run build` para verificar.
