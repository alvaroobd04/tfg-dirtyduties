-- Migration: flexible mode + task swaps
-- Run this against dirtyduties_db

ALTER TABLE casa
  ADD COLUMN modo ENUM('estricto', 'flexible') NOT NULL DEFAULT 'estricto';

CREATE TABLE intercambios (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  casa_id                 INT NOT NULL,
  solicitante_id          INT NOT NULL,
  ejecucion_solicitante_id INT NOT NULL,
  destinatario_id         INT NOT NULL,
  ejecucion_destinatario_id INT NOT NULL,
  estado                  ENUM('pendiente','aceptado','rechazado','cancelado') NOT NULL DEFAULT 'pendiente',
  created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (casa_id)                  REFERENCES casa(id)       ON DELETE CASCADE,
  FOREIGN KEY (solicitante_id)           REFERENCES usuarios(user_id),
  FOREIGN KEY (destinatario_id)          REFERENCES usuarios(user_id),
  FOREIGN KEY (ejecucion_solicitante_id) REFERENCES ejecucion(id),
  FOREIGN KEY (ejecucion_destinatario_id) REFERENCES ejecucion(id)
);

ALTER TABLE notificaciones
  MODIFY COLUMN tipo ENUM(
    'castigo',
    'recordatorio',
    'intercambio_propuesta',
    'intercambio_aceptado',
    'intercambio_rechazado'
  ) NOT NULL;

ALTER TABLE notificaciones
  ADD COLUMN intercambio_id INT NULL,
  ADD CONSTRAINT fk_notif_intercambio
    FOREIGN KEY (intercambio_id) REFERENCES intercambios(id) ON DELETE SET NULL;

-- Vacation mode

ALTER TABLE notificaciones
  MODIFY COLUMN tipo ENUM(
    'castigo',
    'recordatorio',
    'intercambio_propuesta',
    'intercambio_aceptado',
    'intercambio_rechazado',
    'vacaciones'
  ) NOT NULL;

CREATE TABLE vacaciones (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id   INT NOT NULL,
  casa_id      INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin    DATE NOT NULL,
  estado       ENUM('activa','cancelada') NOT NULL DEFAULT 'activa',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(user_id) ON DELETE CASCADE,
  FOREIGN KEY (casa_id)    REFERENCES casa(id)          ON DELETE CASCADE
);

ALTER TABLE ejecucion
  ADD COLUMN vacacion_id INT NULL,
  ADD CONSTRAINT fk_ejecucion_vacacion
    FOREIGN KEY (vacacion_id) REFERENCES vacaciones(id) ON DELETE SET NULL;
