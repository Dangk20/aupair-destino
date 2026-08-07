# Despliegue en VPS (Hostinger) — Destino Au Pair

Stack: Docker Compose (MySQL 8 + app Next.js standalone) + nginx y certbot en el host.
VPS: Ubuntu 24.04, Docker ya instalado, ufw (22/80/443), swap 4 GB. IP `2.25.88.197`.

## 1. Traer el código al VPS
```bash
ssh root@2.25.88.197
git clone git@github.com:Dangk20/aupair-destino.git /opt/dap   # o https + token
cd /opt/dap
git checkout main   # o la rama a desplegar
```

## 2. Variables de entorno
```bash
cp deploy/.env.production.example .env
openssl rand -hex 48   # → JWT_AUPAIR_SECRET
openssl rand -hex 48   # → JWT_SECRET
# editar .env: DB_ROOT_PASSWORD, JWT_*, RESEND_API_KEY, NOTIF_EXCLUIR_EMAILS, NEXT_PUBLIC_APP_URL
#
# RESEND_API_KEY NO es opcional. Vacía = no sale ningún correo, ni los avisos
# ni la recuperación de contraseña, y el fallo no se ve por ningún lado.
# Producción estuvo así desde el despliegue del 2026-07-23: comprobarla es
# parte del despliegue, no un detalle.
#
# NOTIF_EXCLUIR_EMAILS: direcciones que no deben recibir avisos de admin
# aunque tengan rol admin en la base (cuentas heredadas o de prueba).
nano .env
```

## 3. Levantar la base y cargar datos
```bash
docker compose up -d db
# esperar a que el healthcheck esté "healthy":
docker compose ps
# cargar el dump (subir dump-railway.sql al VPS antes, NO va en el repo):
docker compose exec -T db mysql -uroot -p"$DB_ROOT_PASSWORD" destino_aupair < dump-railway.sql
# migraciones + fix de rol:
for f in migrations/0*.sql; do
  docker compose exec -T db mysql -uroot -p"$DB_ROOT_PASSWORD" destino_aupair < "$f"
done
docker compose exec -T db mysql -uroot -p"$DB_ROOT_PASSWORD" destino_aupair \
  -e "UPDATE usuarios SET rol='usuaria' WHERE rol IS NULL;"
```

## 4. Construir y levantar la app
```bash
docker compose up -d --build app   # el build tarda (1 vCPU + swap); no correr build con la BD bajo estrés
docker compose logs -f app         # verificar "Ready"
curl -I http://127.0.0.1:3000       # 200/307
```

## 5. nginx + TLS (en el host)
```bash
apt-get update && apt-get install -y nginx certbot python3-certbot-nginx
cp deploy/nginx-destino-aupair.conf /etc/nginx/sites-available/destino-aupair
ln -sf /etc/nginx/sites-available/destino-aupair /etc/nginx/sites-enabled/destino-aupair
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
# TLS (requiere que el DNS ya apunte al VPS — ver paso 6):
certbot --nginx -d destino-aupair.com -d www.destino-aupair.com --agree-tos -m <correo> --redirect
```

## 6. DNS (Squarespace) — apuntar el dominio al VPS
**NO tocar los registros de correo (MX @ → smtp.google.com, TXT SPF/DKIM/DMARC).**
Cambiar / agregar solo:
- `A`  `@`    → `2.25.88.197`
- `A`  `www`  → `2.25.88.197`   (o quitar el CNAME www→railway y poner A)
Quitar cuando ya no se use Railway: `CNAME www→railway.app` y `TXT _railway-verify.www`.
Propagación: minutos a unas horas. Verificar: `dig +short destino-aupair.com`.

## 7. Post-deploy
- `certbot renew --dry-run` (auto-renovación).
- Backups: cron con `docker compose exec -T db mysqldump ...` a almacenamiento externo.
- Rotar el admin de prueba y limpiar usuarias de prueba si el dump es de local.
