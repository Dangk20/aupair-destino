## 0. Antes de tocar código

- [ ] 0.1 Medir en producción (lo corre Daniel; la sesión automatizada no tiene lectura de producción): candidatas por edad, cuántas con más de 27 y cuántas con una fecha que hoy ya rechaza la regla (futura, menor de 18). Anotar el resultado en este archivo.

## 1. La regla, en un solo lugar (`lib/campos-perfil.js`)

- [ ] 1.1 Declarar `EDAD_MAXIMA = 27` y `TOPE_EDAD_DESDE` junto a `EDAD_MINIMA`, con comentario de por qué y desde cuándo
- [ ] 1.2 `edadEn(valor, referencia)` y `validaFechaNacimiento(valor, form)`: mínimo a hoy; tope a la fecha de registro sólo si `form.created_at` es desde `TOPE_EDAD_DESDE` o no existe; mensaje con el rango 18–27. Exportar el validador
- [ ] 1.3 `parteCompleta()` con `seccionCompleta()`; añadir `invalidosDeParte()`
- [ ] 1.4 `validarCambios(cambios, cuenta)` para las rutas

## 2. Servidor

- [ ] 2.1 `PUT /api/dashboard/perfil`: leer la fila, `validarCambios` antes del `UPDATE`, 400 con `invalidos` si falla
- [ ] 2.2 `PUT /api/dashboard/configuracion`: lo mismo para `fecha_nacimiento`
- [ ] 2.3 `PUT /api/admin/perfiles/[id]`: lo mismo
- [ ] 2.4 `PUT /api/admin/aprobar-evaluacion`: el error lista faltantes e inválidos
- [ ] 2.5 `POST /api/auth/register`: fecha obligatoria en autorregistro, opcional en creación por admin; validar e insertar

## 3. Interfaz

- [ ] 3.1 `app/register/page.jsx`: campo de fecha de nacimiento, validación antes de enviar con el mensaje del validador
- [ ] 3.2 Parte 1: `created_at` en `FORM_INIT`; mostrar el error del servidor si responde 400 con `invalidos`
- [ ] 3.3 Parte 2: mostrar el error del servidor si responde 400 con `invalidos`
- [ ] 3.4 `/dashboard/configuracion`: mostrar el motivo si el servidor rechaza la fecha
- [ ] 3.5 Edición del admin: mostrar el motivo si el servidor rechaza
- [ ] 3.6 `components/perfil/ModalSiguientePaso.jsx` con la paleta `T`
- [ ] 3.7 Parte 1 y Parte 2: al finalizar, decidir qué ofrecer y mostrar el aviso o ir al perfil

## 4. Verificación

- [ ] 4.1 `npm run build`
- [ ] 4.2 `node scripts/pruebas-humo.mjs` contra local
- [ ] 4.3 Playwright — registro: 17 años rechazado, 28 años rechazado, 18 y 27 exactos aceptados, sin fecha rechazado; la fecha aparece en la Parte 1 de la cuenta creada
- [ ] 4.4 Petición directa a `POST /api/auth/register` con 30 años → 400, sin cuenta creada
- [ ] 4.5 Cuenta anterior al tope con 30 años: abre su Parte 1, la sección personal está completa y guarda sin error
- [ ] 4.6 Cuenta nueva registrada con 27 y `fecha_nacimiento` que hoy da 28: sigue válida
- [ ] 4.7 Configuración: fecha de 15 años → motivo en pantalla, la base no cambia
- [ ] 4.8 Admin edita una fecha futura → rechazada; admin intenta aprobar un perfil con fecha inválida → rechazado con el motivo
- [ ] 4.9 Playwright — candidata con documentos pendientes y módulo habilitado termina la Parte 1: aviso con las tres opciones; "Cargar documentos" lleva a `/dashboard/documentos`
- [ ] 4.10 Termina la Parte 2 con documentos pendientes: aviso con dos opciones; con todos los obligatorios cargados: va directo al perfil
- [ ] 4.11 Candidata sin el módulo de documentos termina la Parte 1: el aviso no ofrece documentos
- [ ] 4.12 Limpiar las cuentas y datos de prueba creados

## 5. Despliegue

- [ ] 5.1 Fijar `TOPE_EDAD_DESDE` al día del despliegue, commit
- [ ] 5.2 `bash deploy/desplegar-codigo.sh`; comprobar `sha256` de los archivos tocados en el VPS
- [ ] 5.3 Daniel recorre en producción el registro con una fecha fuera de rango (el clasificador bloquea el inicio de sesión automatizado contra producción)
- [ ] 5.4 Anotar en la bitácora del cronograma; preguntar a la clienta por el texto de las preguntas de requisitos por edad
