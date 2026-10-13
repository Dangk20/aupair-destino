# registro-candidata Specification

## Purpose
TBD - created by archiving change edad-y-aviso-documentos. Update Purpose after archive.
## Requirements
### Requirement: El registro de una candidata pide su fecha de nacimiento

El formulario público de registro SHALL pedir la fecha de nacimiento como campo obligatorio, y el servidor SHALL rechazar un autorregistro que no la traiga.

La fecha que se acepta en el registro SHALL quedar guardada en el perfil, de modo que la candidata no tenga que escribirla de nuevo en la Parte 1.

#### Scenario: Registro sin fecha de nacimiento

- **WHEN** una persona intenta crear su cuenta en `/register` sin indicar la fecha de nacimiento
- **THEN** el formulario no la deja enviar y le señala el campo
- **AND** si la petición llega igual al servidor, este responde con error y no crea la cuenta

#### Scenario: La fecha del registro aparece en el perfil

- **WHEN** una candidata se registra con una fecha válida y abre la Parte 1 de su perfil
- **THEN** la fecha de nacimiento ya está diligenciada con la que dio al registrarse

### Requirement: Sólo se registran candidatas de 18 a 27 años

El sistema SHALL rechazar el registro de una persona menor de 18 años o mayor de 27 años, con un mensaje que diga el rango del programa, y NO SHALL crear la cuenta. La regla SHALL aplicarse en el formulario y en el servidor, y SHALL ser la misma que usa el perfil.

Cuando el admin crea una candidata desde el panel, la fecha SHALL ser opcional; si la indica, SHALL aplicarse la misma regla.

#### Scenario: Menor de 18 años

- **WHEN** una persona indica una fecha de nacimiento que le da 17 años
- **THEN** el registro se rechaza indicando que el programa es para personas de 18 a 27 años
- **AND** no se crea ninguna cuenta

#### Scenario: Mayor de 27 años

- **WHEN** una persona indica una fecha de nacimiento que le da 28 años
- **THEN** el registro se rechaza indicando que el programa es para personas de 18 a 27 años
- **AND** no se crea ninguna cuenta

#### Scenario: En los bordes del rango

- **WHEN** una persona indica una fecha que le da exactamente 18 años, o exactamente 27
- **THEN** el registro se acepta

#### Scenario: Petición directa al servidor con edad fuera de rango

- **WHEN** llega a `POST /api/auth/register` una petición de autorregistro con una fecha fuera del rango
- **THEN** el servidor responde 400 con el motivo y no crea la cuenta

