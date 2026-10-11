## 0. Antes de tocar código

- [ ] 0.1 Medir en producción (lo corre Daniel; la sesión automatizada no tiene lectura de producción): candidatas por edad, cuántas con más de 27 y cuántas con una fecha que hoy ya rechaza la regla (futura, menor de 18). Anotar el resultado en este archivo.

## 1. La regla, en un solo lugar (`lib/campos-perfil.js`)

- [x] 1.1 Declarar `EDAD_MAXIMA = 27` y `TOPE_EDAD_DESDE` junto a `EDAD_MINIMA`, con comentario de por qué y desde cuándo
- [x] 1.2 `edadEn(valor, referencia)` y `validaFechaNacimiento(valor, form)`: mínimo a hoy; tope a la fecha de registro sólo si `form.created_at` es desde `TOPE_EDAD_DESDE` o no existe; mensaje con el rango 18–27. Exportar el validador
- [x] 1.3 `parteCompleta()` con `seccionCompleta()`; añadir `invalidosDeParte()`
- [x] 1.4 `validarCambios(cambios, cuenta)` para las rutas

## 2. Servidor

- [x] 2.1 `PUT /api/dashboard/perfil`: leer la fila, `validarCambios` antes del `UPDATE`, 400 con `invalidos` si falla
- [x] 2.2 `PUT /api/dashboard/configuracion`: lo mismo para `fecha_nacimiento`
- [x] 2.3 `PUT /api/admin/perfiles/[id]`: lo mismo
- [x] 2.4 `PUT /api/admin/aprobar-evaluacion`: el error lista faltantes e inválidos
- [x] 2.5 `POST /api/auth/register`: fecha obligatoria en autorregistro, opcional en creación por admin; validar e insertar

## 3. Interfaz

- [x] 3.1 `app/register/page.jsx`: campo de fecha de nacimiento, validación antes de enviar con el mensaje del validador
- [x] 3.2 Parte 1: `created_at` en `FORM_INIT`; mostrar el error del servidor si responde 400 con `invalidos`
- [x] 3.3 Parte 2: mostrar el error del servidor si responde 400 con `invalidos`
- [x] 3.4 `/dashboard/configuracion`: mostrar el motivo si el servidor rechaza la fecha
- [x] 3.5 Edición del admin: mostrar el motivo si el servidor rechaza
- [x] 3.6 `components/perfil/ModalSiguientePaso.jsx` con la paleta `T`
- [x] 3.7 Parte 1 y Parte 2: al finalizar, decidir qué ofrecer y mostrar el aviso o ir al perfil

## 4. Verificación

- [x] 4.1 `npm run build`
- [x] 4.2 `node scripts/pruebas-humo.mjs` contra local
- [x] 4.3 Playwright — registro: 17 años rechazado, 28 años rechazado, 18 y 27 exactos aceptados, sin fecha rechazado; la fecha aparece en la Parte 1 de la cuenta creada
- [x] 4.4 Petición directa a `POST /api/auth/register` con 30 años → 400, sin cuenta creada
- [x] 4.5 Cuenta anterior al tope con 30 años: abre su Parte 1, la sección personal está completa y guarda sin error
- [x] 4.6 Cuenta nueva registrada con 27 y `fecha_nacimiento` que hoy da 28: sigue válida
- [x] 4.7 Configuración: fecha de 15 años → motivo en pantalla, la base no cambia
- [x] 4.8 Admin edita una fecha futura → rechazada; admin intenta aprobar un perfil con fecha inválida → rechazado con el motivo
- [x] 4.9 Playwright — candidata con documentos pendientes y módulo habilitado termina la Parte 1: aviso con las tres opciones; "Cargar documentos" lleva a `/dashboard/documentos`
- [x] 4.10 Termina la Parte 2 con documentos pendientes: aviso con dos opciones; con todos los obligatorios cargados: va directo al perfil
- [x] 4.11 Candidata sin el módulo de documentos termina la Parte 1: el aviso no ofrece documentos
- [x] 4.12 Limpiar las cuentas y datos de prueba creados

### Resultado de la verificación (2026-10-10, local, Playwright)

- Registro: 17 y 28 años rechazados con "El programa es para personas de 18 a 27 años. Con esa fecha tienes N."; sin fecha, el navegador no deja enviar; 18 exactos y 27 (cumple 28 al día siguiente) entran a `/dashboard`. La fecha aparece en la Parte 1.
- `POST /api/auth/register` directo: 30 años → 400; sin fecha → 400 "Indica tu fecha de nacimiento."; ninguna cuenta creada.
- Cuenta de julio con 30 años: guarda la Parte 1 con 200 y `perfil_completo = 1`.
- 4.6 se verificó con la regla aislada simulando la fecha (registrada con 27 en 2026-10, consultada en 2027-12 → válida) y con el caso real de la víspera.
- Configuración con 15 años: aviso con el motivo, la base no cambia. Admin con fecha futura: 400 con el motivo, la base no cambia. Aprobar un perfil con fecha de 0 años: 400 que nombra el campo; el botón de la ficha ya salía deshabilitado, pero su ayuda decía "Falta: " en blanco — corregido para listar también los inválidos.
- Aviso: Parte 1 con documentos pendientes → tres opciones y "Cargar documentos" lleva a `/dashboard/documentos`; sin el módulo → sólo Parte 2 y "Más tarde"; Parte 2 con pendientes → dos opciones; con los 8 obligatorios → directo al perfil.
- **Hallazgo durante el recorrido:** `created_at` se guarda en UTC, y un registro de la noche en Colombia queda con fecha del día siguiente. La cuenta registrada la víspera de cumplir 28 aparecía con 28 "al registrarse". Se mide el tope un día antes de `created_at` (ver design, decisión 1).
- `npm run build` y `pruebas-humo.mjs`: 586 en verde, 0 en rojo.

## 5. Despliegue

- [ ] 5.1 Fijar `TOPE_EDAD_DESDE` al día del despliegue, commit
- [ ] 5.2 `bash deploy/desplegar-codigo.sh`; comprobar `sha256` de los archivos tocados en el VPS
- [ ] 5.3 Daniel recorre en producción el registro con una fecha fuera de rango (el clasificador bloquea el inicio de sesión automatizado contra producción)
- [ ] 5.4 Anotar en la bitácora del cronograma; preguntar a la clienta por el texto de las preguntas de requisitos por edad
