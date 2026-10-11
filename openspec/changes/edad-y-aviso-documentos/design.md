## Context

Todo ocurre en la capa Destino Au Pair (`lib/db-aupair.js`, `lib/session-aupair.js`).
La regla de la fecha vive en `lib/campos-perfil.js` desde `validar-fecha-nacimiento`:
`validaFechaNacimiento(valor)` se declara en el campo `fecha_nacimiento` de
`PARTE1` y la consumen `camposInvalidos()`, `seccionCompleta()` y
`validarSeccion()`. La firma `valida(valor, form)` ya recibe el formulario
completo, aunque hoy nadie usa el segundo argumento.

Quién escribe `fecha_nacimiento` hoy:

| Ruta | Quién | Valida |
|---|---|---|
| `PUT /api/dashboard/perfil` | candidata, Parte 1 | no |
| `PUT /api/dashboard/configuracion` | candidata, Configuración | no |
| `PUT /api/admin/perfiles/[id]` | admin, edición | no |
| `POST /api/auth/register` | nadie (no la recibe) | — |

`POST /api/auth/register` atiende dos flujos: el autorregistro público y la
creación de una candidata por el admin desde `/admin/usuarias` (se distingue por
`getSessionFromRequest(req)?.rol === "admin"`).

## Goals / Non-Goals

**Goals:** un solo validador para registro, perfil, configuración y admin; el
tope de 27 sin bloquear a nadie que ya esté adentro; que el servidor cumpla la
spec vigente; guiar a la candidata a documentos al terminar cada parte.

**Non-Goals:** bloquear la edición tras enviar (R3); validar otros campos;
reescribir las preguntas de requisitos por edad.

## Decisions

### 1. El tope se mide a la fecha de registro y sólo para cuentas nuevas

`validaFechaNacimiento(valor, form)` usa `form.created_at`:

- Sin `created_at` (la cuenta aún no existe: registro) → la referencia es hoy.
- `created_at` anterior a `TOPE_EDAD_DESDE` → sólo se exige el mínimo.
- `created_at` desde `TOPE_EDAD_DESDE` → la edad **en la fecha de registro**
  no puede pasar de `EDAD_MAXIMA`.

El mínimo de 18 se sigue midiendo a hoy, como ahora.

`TOPE_EDAD_DESDE` es una fecha `YYYY-MM-DD` declarada junto a `EDAD_MINIMA` y
`EDAD_MAXIMA`; se fija el día del despliegue.

*Alternativa descartada — medir el tope a hoy para todas:* bloquea a la
candidata en proceso que cumplió años (caso ya registrado en la bitácora) y a
cualquier candidata nueva que cumpla 28 a mitad del proceso. La clienta decidió
"sólo registros nuevos".

*Alternativa descartada — columna nueva `exenta_tope_edad`:* exige migración y
un dato más que mantener para algo que `created_at` ya dice.

### 2. Los formularios pasan `created_at` al validador

La Parte 1 arma su estado desde `FORM_INIT`, que sólo copia las claves que
declara: se añade `created_at`. No viaja de vuelta como dato útil: el servidor
lo descarta (`BLOQUEADAS` en la candidata, `EXCLUIR` en el admin). La Parte 2 y
la edición del admin ya cargan la fila entera.

### 3. Un validador de campo suelto para las rutas

Se añade a `lib/campos-perfil.js`:

```js
/** Errores de los campos con regla presentes en `cambios`, evaluados con el contexto de la cuenta. */
export function validarCambios(cambios, cuenta = {}) → [{ name, label, error }]
```

Recorre todos los campos de `PARTE1` y `PARTE2` con `valida`, toma sólo los que
vienen en `cambios` con valor, y los evalúa con `{ ...cuenta, ...cambios }`. Las
tres rutas lo llaman **antes** del `UPDATE` y responden 400 con
`{ error, invalidos }` si hay algo. Así no hay escrituras parciales.

*Alternativa descartada — guardar y sólo no marcar completo:* deja la fecha
imposible en la base, que es lo que leen la agencia (edad calculada con
`TIMESTAMPDIFF`) y el PDF de la hoja de vida.

### 4. `parteCompleta()` usa `seccionCompleta()`

```js
export function parteCompleta(parte, form = {}) {
  return PARTES[parte].every((s) => seccionCompleta(s, form));
}
```

Se añade `invalidosDeParte(parte, form)` para que `aprobar-evaluacion` diga qué
corregir. `faltantesDeParte()` no cambia.

### 5. Registro: el campo, y la regla según quién crea

`app/register/page.jsx` añade `fecha_nacimiento` (input `date`, con `max` de
hoy) y valida con `validaFechaNacimiento` antes de enviar. La ruta:

- Autorregistro: la fecha es obligatoria y se valida.
- Creación por admin: es opcional; si viene, se valida.
- Se inserta en el mismo `INSERT`.

La regla se importa de `lib/campos-perfil.js` (datos puros, sin dependencias
del servidor: se puede importar desde un componente de cliente).

### 6. El aviso de siguiente paso es un componente, no una página

`components/perfil/ModalSiguientePaso.jsx` recibe `parte` (1|2),
`ofrecerDocumentos`, `ofrecerParte2` y se pinta con `T` de `lib/tema.js`.
Los formularios, al finalizar con éxito, en lugar de `router.push("/dashboard/perfil")`:

1. Piden en paralelo `/api/dashboard/acceso` (¿`documentos`?) y
   `/api/dashboard/documentos` (→ `avanceDocumentacion`).
2. `ofrecerDocumentos = documentos && cargados < total`.
3. `ofrecerParte2 = parte === 1 && !parteCompleta(2, form)`.
4. Si no hay nada que ofrecer → `router.push("/dashboard/perfil")` como hoy.

*Alternativa descartada — reutilizar `ModalSubir` de `PestanaDocumentos`:* sube
un documento a la vez y necesita saber cuál; el aviso es una pregunta sobre el
siguiente paso, y el módulo de documentos ya es la pantalla para cargar.

## Risks / Trade-offs

- **Un perfil con una fecha guardada imposible no podrá guardar nada hasta
  corregirla**, porque el formulario reenvía el perfil entero. → Es el
  comportamiento deseado; el error nombra el campo. Medir antes en producción
  cuántos perfiles hay así (se conocía uno, de prueba).
- **`TOPE_EDAD_DESDE` mal fijada** deja exentas cuentas nuevas o somete a
  cuentas viejas. → Tarea explícita de fijarla el día del despliegue.
- **Zona horaria:** `created_at` llega como ISO con hora; la edad a esa fecha se
  calcula con la parte `YYYY-MM-DD`, como ya hace `edadDesde`.

## Migration Plan

Sin migraciones. Despliegue con `deploy/desplegar-codigo.sh` (no toca la base),
con `TOPE_EDAD_DESDE` igual al día del despliegue. Reversión: volver al commit
anterior; no quedan datos que deshacer.

## Open Questions

- Texto de las preguntas "si tienes 26 años…" y "entre 18-20 años…" con el rango
  ampliado — a la clienta.
