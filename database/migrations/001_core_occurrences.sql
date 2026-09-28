CREATE TABLE IF NOT EXISTS roles (
  code VARCHAR(32) PRIMARY KEY,
  display_name VARCHAR(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO roles (code, display_name) VALUES
  ('cidadao', 'Cidadão'),
  ('tecnico', 'Técnico'),
  ('gestor', 'Gestor'),
  ('instituicao', 'Instituição parceira'),
  ('admin', 'Administrador');

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(128) NOT NULL UNIQUE,
  email VARCHAR(254) NULL,
  display_name VARCHAR(160) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT UNSIGNED NOT NULL,
  role_code VARCHAR(32) NOT NULL,
  assigned_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  assigned_by BIGINT UNSIGNED NULL,
  PRIMARY KEY (user_id, role_code),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_code) REFERENCES roles(code),
  CONSTRAINT fk_user_roles_assigner FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  requested_role VARCHAR(32) NOT NULL,
  organization VARCHAR(180) NULL,
  province VARCHAR(80) NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  requested_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  reviewed_by BIGINT UNSIGNED NULL,
  reviewed_at TIMESTAMP(3) NULL,
  review_reason VARCHAR(500) NULL,
  CONSTRAINT fk_role_requests_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_role_requests_role FOREIGN KEY (requested_role) REFERENCES roles(code),
  CONSTRAINT fk_role_requests_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_role_requests_status_date (status, requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS data_sources (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  organization VARCHAR(180) NULL,
  source_type ENUM('OFFICIAL', 'TECHNICAL', 'COMMUNITY', 'SIMULATED', 'SYSTEM', 'AI') NOT NULL,
  url VARCHAR(1000) NULL,
  description TEXT NULL,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_at TIMESTAMP(3) NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE KEY uq_data_sources_name_type (name, source_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO data_sources (name, organization, source_type, description, verified)
VALUES ('ECO-MZ 360 - submissão comunitária', 'ECO-MZ 360', 'COMMUNITY', 'Submissão de ocorrência por utilizador autenticado; requer validação técnica.', FALSE);

CREATE TABLE IF NOT EXISTS occurrences (
  id CHAR(36) NOT NULL PRIMARY KEY,
  protocol VARCHAR(40) NOT NULL UNIQUE,
  title VARCHAR(180) NOT NULL,
  category VARCHAR(80) NOT NULL,
  severity ENUM('Baixo', 'Médio', 'Alto', 'Crítico') NOT NULL,
  province VARCHAR(80) NOT NULL,
  district VARCHAR(100) NOT NULL,
  location_details VARCHAR(500) NOT NULL DEFAULT '',
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  reporter_user_id BIGINT UNSIGNED NULL,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  occurred_at DATETIME(3) NOT NULL,
  status ENUM('Recebido', 'Em Validação', 'Validado', 'Em Intervenção', 'Resolvido') NOT NULL DEFAULT 'Recebido',
  description TEXT NOT NULL,
  image_url VARCHAR(1000) NULL,
  validation_score DECIMAL(5, 2) NOT NULL DEFAULT 0,
  assigned_team VARCHAR(180) NULL,
  action_summary TEXT NULL,
  data_source_id BIGINT UNSIGNED NOT NULL,
  verification_status ENUM('unverified', 'under_review', 'verified', 'rejected') NOT NULL DEFAULT 'unverified',
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_occurrences_reporter FOREIGN KEY (reporter_user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_occurrences_source FOREIGN KEY (data_source_id) REFERENCES data_sources(id),
  INDEX idx_occurrences_province_created (province, occurred_at),
  INDEX idx_occurrences_status_created (status, occurred_at),
  INDEX idx_occurrences_category_created (category, occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS occurrence_status_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  occurrence_id CHAR(36) NOT NULL,
  old_status VARCHAR(40) NULL,
  new_status VARCHAR(40) NOT NULL,
  changed_by BIGINT UNSIGNED NULL,
  reason VARCHAR(1000) NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_occurrence_history_occurrence FOREIGN KEY (occurrence_id) REFERENCES occurrences(id) ON DELETE CASCADE,
  CONSTRAINT fk_occurrence_history_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_occurrence_history_date (occurrence_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  actor_user_id BIGINT UNSIGNED NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(80) NOT NULL,
  before_json JSON NULL,
  after_json JSON NULL,
  request_id CHAR(36) NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_logs_entity (entity_type, entity_id, created_at),
  INDEX idx_audit_logs_actor_date (actor_user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;