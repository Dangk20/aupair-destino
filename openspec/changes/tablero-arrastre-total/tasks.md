## 1. Código
- [x] 1.1 `TableroEtapas`: prop `onSoltar(c, destino)`; con ella toda tarjeta se arrastra y toda columna recibe
- [x] 1.2 `admin/perfiles`: decisiones al soltar (mover, aprobar con agencia, No califica, correcciones, revertir, explicar)

## 2. Verificación
- [x] 2.1 `npm run build` y humo sin rojos — build en verde; humo 625/0
- [x] 2.2 Arrastres en el navegador: agencia→agencia, En revisión→Evaluación (aprobar), →No califica, Evaluación→En revisión (revertir), Diligenciando→En revisión (explica) — navegador oculto: Diligenciando→En revisión explica; Laura En revisión→Evaluación aprobada con agencia y de vuelta a En revisión revertida; →No califica pide motivo; Dani plan↔evaluación se mueve; Diligenciando→Visa pide aprobar primero; aprobar un perfil incompleto lo rechaza el servidor sin cambiar nada
