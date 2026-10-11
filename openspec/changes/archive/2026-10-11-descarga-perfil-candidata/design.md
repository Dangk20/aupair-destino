## Context

Se opera sobre la única capa del repositorio: Destino Au Pair (`lib/db-aupair.js`,
cookie `dap_token`). Project Center y la plantilla Saasly se retiraron en el
Sprint 1; no hay una segunda app sobre la que dudar.

Estado verificado en el código el 2026-08-05:

| Dónde | Qué hay hoy |
|---|---|
| `app/admin/perfiles/page.jsx` | `toggleAprobar()` + `botonAprobar`, un círculo de 32 px. Acciones de la fila: aprobar · ver · editar. |
| `app/admin/perfiles/[id]/page.jsx` | `BloqueInterno` con un `<select>` "Evaluación del perfil" que guarda junto a otras cinco columnas. |
| `app/api/admin/aprobar-evaluacion/route.js` | `PUT`, admin, escribe sólo `evaluacion_aprobada`. |
| `app/api/admin/perfiles/[id]/route.js` | `PUT` que acepta **cualquier** columna existente salvo `id, email, password, rol, created_at`. También `evaluacion_aprobada`. |

Dos hechos que mandan sobre el diseño:

- **`usuarios.foto_url` es un data-URI base64 en MySQL**, de 9 a 43 KB en las
  candidatas de la base local. No hay archivo en disco que leer.
- **Los documentos sí son archivos**, bajo `UPLOADS_DIR` (`raizAlmacenamiento()`),
  fuera de `public/`, resolubles con `resolverRuta()` de
  `lib/almacenamiento-archivos.js`. Hasta 10 MB cada uno, doce tipos.

Restricción que manda sobre lo demás: **la plataforma está viva** y la clienta usa
`/admin/perfiles` a diario.

## Goals / Non-Goals

**Goals**

- Que aprobar se decida donde está la información: en la ficha.
- Que `evaluacion_aprobada` tenga un solo dueño en el servidor.
- Que la clienta pueda enviarle a una agencia un solo archivo.
- Que el PDF se derive de `lib/campos-perfil.js`, como todo lo demás.

**Non-Goals**

- Enviar el paquete por correo.
- Descarga desde el panel de agencia, o de varias candidatas a la vez.
- Reproducir la plantilla rosa de referencia.
- Rehacer el flujo de aprobación: sigue siendo un booleano.

## Decisions

### 1. El PDF se dibuja en el servidor con `pdfkit`, no en el navegador

`GET /api/admin/perfiles/[id]/descargar` arma el paquete entero en el servidor y
devuelve el ZIP. El navegador sólo dispara la descarga.

*Alternativa descartada:* generar el PDF en el cliente (`window.print()` sobre una
página oculta, o `html2pdf`). Obligaría a que el navegador tuviera ya todos los
datos y **todos los documentos** en memoria para comprimirlos, y los documentos
sólo se sirven de a uno por ruta autenticada. Además el resultado dependería del
navegador de la clienta.

*Alternativa descartada:* renderizar HTML con un navegador headless (Puppeteer).
Daría el mejor control tipográfico y es lo que usaría un equipo con holgura, pero
mete Chromium —cientos de megas— en un VPS pequeño para generar un PDF de dos
páginas. Es desproporcionado.

### 2. El ZIP se escribe en flujo con `archiver`, no en memoria

El handler devuelve un `ReadableStream` alimentado por `archiver`. Los documentos
se añaden desde disco por ruta, sin cargarlos enteros.

*Alternativa descartada:* `jszip` en memoria. Es más simple de escribir, pero doce
documentos de hasta 10 MB dan un techo teórico de 120 MB retenidos por petición en
un VPS que también corre MySQL. Los archivos reales son mucho menores, pero el
techo lo fija el límite de subida, no la costumbre.

### 3. El PDF se genera desde `lib/campos-perfil.js`, igual que la ficha

`lib/cv-candidata.js` recorre `PARTE1` y `PARTE2` y usa `valorParaMostrar()` —el
mismo helper que pinta la ficha— para decidir cómo se muestra cada valor. No hay
ni una etiqueta escrita a mano.

*Alternativa descartada:* una plantilla del CV con sus propios títulos y su propio
orden. Sería la cuarta lista de campos, que es exactamente el defecto que el change
anterior vino a matar. El precio es que el PDF hereda el orden de la declaración;
se acepta.

Los campos de tipo `imagen` (hoy `foto_url`) no se imprimen como texto: la foto va
al encabezado y el campo se omite de su sección, porque volcar cuarenta mil
caracteres de data-URI arruinaría el documento.

### 4. La foto sale del data-URI, y su ausencia no rompe nada

`pdfkit` embebe JPEG y PNG desde un `Buffer`. Se decodifica el data-URI y se
intenta embeber dentro de un `try`: si el dato está corrupto —y en producción llegó
a quedar `data:img` en esa columna— se dibuja el círculo con la inicial y el PDF
sale igual.

*Alternativa descartada:* validar la imagen antes con `sharp`. `sharp` ya está en
el proyecto, pero sólo como dependencia de desarrollo; subirla a producción por
esto es más peso del que ahorra. El `try` cubre el caso.

### 5. Poppins entra al repositorio como `.ttf`

`pdfkit` sólo lee TTF/OTF. Lo único que hay hoy son `woff2` bajo `.next/`, que son
artefactos de compilación y no fuentes del proyecto. Se añaden `Poppins-Regular.ttf`
y `Poppins-Bold.ttf` bajo `assets/fuentes/`, fuera de `public/` —no son recursos
web—, con su licencia OFL.

*Alternativa descartada:* usar la Helvetica que `pdfkit` trae incorporada. No cuesta
nada y el PDF sale legible, pero el documento que la clienta manda a una agencia
dejaría de parecerse a su marca justo en el único artefacto que sale de la
plataforma.

### 6. `evaluacion_aprobada` tiene un solo dueño

Se añade `evaluacion_aprobada` a la lista `EXCLUIR` de
`PUT /api/admin/perfiles/[id]`. La única ruta que la escribe pasa a ser
`PUT /api/admin/aprobar-evaluacion`.

Es la misma regla que ya rige las ventas: `lib/ventas-aupair.js` es el dueño único
de encender permisos, y ninguna ruta los enciende por su cuenta. Dos dueños de una
columna es cómo se llega a que dependa de a quién le preguntes.

*Alternativa descartada:* retirar `/api/admin/aprobar-evaluacion` y dejar que la
ficha escriba por el `PUT` general. Aprobar dejaría de ser un acto con nombre en el
servidor y quedaría indistinguible de editar la estatura. Cuando haya que auditar
quién aprobó qué —y lo habrá—, no habría dónde engancharlo.

### 7. La comprobación de "perfil completo" es del servidor, no del botón

El botón se deshabilita con `perfilCompleto()` para no ofrecer lo que no se puede,
pero **la ruta también lo verifica** antes de escribir. Hoy no lo hace: acepta
aprobar cualquier perfil, y la única defensa es que el botón del listado esté
apagado.

Es la regla ya escrita en el `CLAUDE.md`: lo que llega al cliente es una pista para
pintar, nunca la autorización.

### 8. El nombre del ZIP y su estructura

```
perfil-<nombre-apellido>-<id>.zip
├── <nombre-apellido>-hoja-de-vida.pdf
├── documentos/
│   ├── pasaporte.pdf
│   ├── cedula.jpg
│   └── …
└── LEEME.txt        (sólo si faltó algún archivo)
```

El nombre de cada documento sale de su `tipo_doc`, no del `nombre` que subió la
candidata: en la base hay filas cuyo `nombre` es la cadena `"null"`. La extensión
se conserva de la referencia guardada.

`LEEME.txt` sólo aparece cuando algún `documentos_usuario` apunta a un archivo que
ya no está, y dice cuáles faltaron. Un ZIP silenciosamente incompleto es peor que
uno que avisa.

## Riesgos / Trade-offs

**El PDF contiene datos clínicos y de historial migratorio de una persona real.**
→ Fue la decisión tomada: la agencia los evalúa. La mitigación es de acceso: ruta
sólo admin, declarada en `docs/rutas-y-acceso.md` y cubierta por las pruebas de
humo, sin enlace público ni token de descarga. Lo que pase con el ZIP una vez
descargado ya no lo controla la plataforma, y conviene decírselo a la clienta.

**Dos dependencias nuevas en un proyecto que no había añadido ninguna.** → Las dos
son JavaScript puro, sin compilación nativa, así que no cambian la imagen de Docker
más allá de su peso. Se fija la versión y se anota en la bitácora.

**Generar el PDF bloquea el hilo mientras dibuja.** → Son dos páginas y una imagen
de 40 KB; el orden de magnitud son decenas de milisegundos. No se añade cola ni
trabajo en segundo plano por algo que la clienta dispara unas pocas veces al día.

**El PDF hereda el orden de `campos-perfil.js`, que se declaró para formularios y
no para un CV.** → Es el precio de no fundar una cuarta lista. Si el orden molesta,
se reordena la declaración y se mueven las tres pantallas a la vez, que es
justamente lo que se quiere.

**Quitar `evaluacion_aprobada` del `PUT` general puede romper algo que la escribía
por ahí.** → Se comprobó: el único que la enviaba es el `<select>` del bloque
interno, que este change retira. Se verifica con `grep` antes de tocar la ruta.

## Plan de despliegue

1. `npm i pdfkit archiver` y las fuentes al repositorio.
2. Declarar `GET /api/admin/perfiles/[id]/descargar` en `docs/rutas-y-acceso.md`
   **antes** de escribir el handler, o las pruebas de humo fallan por cobertura.
3. `npm run build` y `node scripts/pruebas-humo.mjs` en verde.
4. Recorrido manual: aprobar y desaprobar desde la ficha; descargar el perfil de
   una candidata con documentos, de una sin ninguno y de una con un archivo
   perdido; abrir el PDF y compararlo contra la ficha.
5. `bash deploy/desplegar-codigo.sh` — sin migraciones, este change no toca la base.
6. Verificar en producción con una candidata real.

**Vuelta atrás:** `git revert` del commit y desplegar de nuevo. No hay migración
que deshacer ni dato que restaurar. La única huella son las dos dependencias en
`package.json`, que el revert también retira.

## Preguntas abiertas

- **Qué hace el admin cuando un perfil no le convence.** Sigue sin haber dónde
  escribir por qué se rechaza; `evaluacion_aprobada` es un booleano. Este change
  hace la aprobación más visible y por eso la carencia se nota más. Va a taller.
- **Si la agencia debe poder descargar el perfil desde su panel.** Hoy la descarga
  es del admin. El componente y el generador ya lo permitirían; falta decidir si el
  aliado debe llevarse los datos clínicos, que es la misma pregunta de fondo.
- **Cuánto tiempo debe vivir un ZIP descargado.** No se guarda en el servidor: se
  genera y se entrega. Si algún día hay que auditar qué se envió y a quién, habrá
  que registrar la descarga.
