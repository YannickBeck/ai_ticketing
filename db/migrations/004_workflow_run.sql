-- ============================================================
-- Migration 004: Workflow Run Tracking
-- n8n Execution Spiegel für Auditierbarkeit
-- ============================================================

CREATE TYPE workflow_status AS ENUM ('running','success','failed','retrying','skipped');

CREATE TABLE workflow_run (
  id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name       VARCHAR(100)    NOT NULL,
  n8n_execution_id    VARCHAR(255),
  zammad_ticket_id    BIGINT,
  correlation_id      UUID            DEFAULT gen_random_uuid(),
  status              workflow_status DEFAULT 'running',
  -- Deduplizierung
  idempotency_key     VARCHAR(255)    UNIQUE,  -- z.B. graph_message_id für E-Mail Intake
  -- Timing
  started_at          TIMESTAMPTZ     DEFAULT NOW(),
  finished_at         TIMESTAMPTZ,
  duration_ms         INTEGER,
  -- Fehler
  error_type          VARCHAR(100),
  error_message       TEXT,
  retry_count         SMALLINT        DEFAULT 0
);

CREATE INDEX idx_workflow_run_ticket ON workflow_run(zammad_ticket_id);
CREATE INDEX idx_workflow_run_status ON workflow_run(status);
CREATE INDEX idx_workflow_run_idempotency ON workflow_run(idempotency_key);
CREATE INDEX idx_workflow_run_started ON workflow_run(started_at);

-- View: Fehlerzusammenfassung (für Admin Dashboard)
CREATE VIEW workflow_error_summary AS
SELECT
  workflow_name,
  error_type,
  COUNT(*) AS error_count,
  MAX(started_at) AS last_error_at
FROM workflow_run
WHERE status = 'failed'
  AND started_at > NOW() - INTERVAL '7 days'
GROUP BY workflow_name, error_type
ORDER BY error_count DESC;
