---
name: Flexible Mode Feature — Design Decisions
description: User's answers about the flexible/strict house mode and bilateral task-swap system
type: project
---

Feature to implement: **modo flexible** vs **modo estricto** a nivel de casa.

**Why:** Users on flexible mode should be able to swap tasks with housemates to avoid punishment when they can't complete a task (e.g., away for the weekend).

**How to apply:** Use these decisions as the ground truth when implementing. Do not re-ask these questions.

---

## Decisions

**Castigos en modo flexible:** Siguen existiendo igual que en modo estricto. La diferencia es solo que en flexible se puede proponer un intercambio de tarea.

**Intercambio:** Bilateral — usuario A ofrece su ejecución X a cambio de la ejecución Y de usuario B. Solo se puede proponer si las dos ejecuciones tienen fechas dentro de un margen de 1 semana entre sí.

**¿Quién puede aceptar?** Cualquier miembro de la casa.

**¿Cómo se propone?** El usuario solicitante elige su tarea, el sistema muestra las tareas compatibles (margen 1 semana) de otros miembros, y el solicitante elige una → propuesta directa a ese usuario concreto.

**Plazo máximo para proponer:** El día anterior a la fecha de la ejecución del solicitante.

**Si nadie acepta y llega la fecha:** El usuario original (solicitante) asume la tarea y el castigo si no la hace.

**Flujo de notificaciones:**
- El destinatario recibe notificación con botones Aceptar / Rechazar en la pestaña de notificaciones.
- Tras aceptar o rechazar, el solicitante recibe notificación del resultado.

**Modo de la casa:**
- Lo elige el creador de la casa en el momento de creación (campo nuevo en la tabla `casa`).
- Se muestra en algún lugar visible de la UI (sidebar o cabecera de casa).
- Modal de creación: dropdown con explicación de cada modo.

**Scope:** A nivel de casa entera, no por tarea individual.

---

## Modo vacaciones (solo casas flexibles)

- Solo disponible en casas con `modo = 'flexible'`.
- El usuario lo declara él mismo (no hay admin).
- Mínimo 14 días de antelación antes de la fecha de inicio.
- Máximo 30 días consecutivos por periodo.
- Solo puede haber una vacación activa a la vez por usuario/casa.
- Las tareas pendientes del periodo se redistribuyen entre los demás usando el algoritmo FIFO de carga.
- Al cancelar anticipadamente, las tareas pendientes restantes vuelven al usuario original.
- Los castigos durante el periodo van al nuevo responsable asignado.
- Tabla `vacaciones` en BD; columna `vacacion_id` en `ejecucion` para rastrear qué ejecutó se reasignó por vacaciones.
- El algoritmo `assignUsers` fue refactorizado a FIFO priority queue (sort tras cada asignación) para reducir complejidad ciclomática.
