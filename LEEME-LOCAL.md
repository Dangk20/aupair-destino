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

## 3. Correr la app

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

## Notas
- Los correos (recuperar contraseña, notificaciones de reunión) **no se envían** en local porque `RESEND_API_KEY` va vacío. Es esperado.
- Fotos y documentos se guardan como base64 dentro de MySQL (deuda técnica conocida, ver auditoría).
