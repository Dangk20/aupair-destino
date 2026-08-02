# ── Dependencias ──────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# --legacy-peer-deps: react-simple-maps@3 declara peer react<=18, el proyecto usa react 19.
RUN npm ci --legacy-peer-deps

# ── Build (Next.js standalone) ────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ── Runtime ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Salida standalone + estáticos + public
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Pruebas de humo del control de acceso. Viajan en la imagen para que el
# despliegue las corra DENTRO del contenedor, donde JWT_AUPAIR_SECRET ya está
# en el entorno: así se verifican rol y permiso sin sacar el secreto del VPS.
COPY --from=builder /app/scripts ./scripts

# Almacenamiento de documentos: FUERA de public/.
# Bajo public/ los documentos quedaban accesibles sin sesión y, además, el
# servidor standalone resuelve los estáticos de public/ desde el build, así que
# los archivos subidos en runtime devolvían 404. Se sirven por /api/documentos.
ENV UPLOADS_DIR=/app/almacenamiento
RUN mkdir -p /app/almacenamiento && chown -R nextjs:nodejs /app/almacenamiento

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
