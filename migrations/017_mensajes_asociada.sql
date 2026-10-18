-- ════════════════════════════════════════════════════════════════════════
-- 017_mensajes_asociada.sql — la candidata conversa con su asesora
--
-- Daniel (17 oct 2026): la candidata tiene hasta tres contactos en su
-- recorrido: el equipo, la asociada dueña del cupón con que entró y su
-- agencia. La contraparte sigue en `conversaciones.agencia_id` (agencia o
-- asociada; el rol del usuario dice cuál). Aquí sólo cambia quién firma un
-- mensaje: ahora también la asociada.
-- ════════════════════════════════════════════════════════════════════════
ALTER TABLE conversacion_mensajes
  MODIFY autor_rol ENUM('usuaria','agencia','asociada','admin') NOT NULL;
