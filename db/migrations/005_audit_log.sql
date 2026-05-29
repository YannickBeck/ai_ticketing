-- ============================================================
-- Migration 005: Audit Log (DSGVO / unveränderlich)
-- Alle relevanten Aktionen: KI-Ausgaben, Freigaben, Auto-Antworten
-- ============================================================

CREATE TYPE actor_type AS ENUM ('user','system','ai','n8n');

CREATE TABLE audit_log (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type    actor_type  NOT NULL,
  actor_id      VARCHAR(255),     -- Zammad User ID, 'n8n', 'system'
  action        VARCHAR(100) NOT NULL,  -- z.B. 'draft.approved', 'ticket.escalated', 'auto_response.sent'
  entity_type   VARCHAR(100),     -- 'ticket', 'draft', 'knowledge_document'
  entity_id     VARCHAR(255),
  metadata      JSONB,            -- Kontextdaten (prompt_version, confidence, etc.)
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Nur INSERT erlaubt — kein UPDATE/DELETE (Row Security)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_insert_only ON audit_log
  FOR INSERT WITH CHECK (true);

CREATE POLICY audit_log_select_all ON audit_log
  FOR SELECT USING (true);

-- Kein UPDATE / DELETE → Standard DENY ohne Policy

CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_action ON audit_log(action);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
CREATE INDEX idx_audit_log_ticket ON audit_log(entity_id) WHERE entity_type = 'ticket';
