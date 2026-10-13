## ADDED Requirements

### Requirement: La ficha se dibuja según los permisos de quien la mira

La ficha SHALL recibir el rol de quien la mira (propio, equipo o agencia) y decidir qué acciones mostrar con una tabla de permisos declarada en un único lugar: editar, observar, gestionar documentos, ver lo interno, descargar y mover la etapa. Los permisos de la ficha SHALL ser sólo una guía para dibujar: la autorización la deciden las rutas.

#### Scenario: Mismos datos, distintas acciones

- **WHEN** la candidata, el equipo y la agencia abren la misma ficha
- **THEN** ven el mismo perfil con la misma presentación, y cada uno sólo las acciones de su rol
