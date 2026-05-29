-- ============================================================
-- Migration 001: AI Analysis
-- Speichert KI-Klassifikationsergebnisse je Zammad-Ticket
-- ============================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE ai_analysis (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  zammad_ticket_id        BIGINT      NOT NULL,
  model                   VARCHAR(100),
  prompt_version          VARCHAR(50),
  -- Klassifikation
  language                VARCHAR(10),
  category                VARCHAR(100),
  priority                VARCHAR(20),
  sentiment               VARCHAR(50),     -- neutral, positive, frustrated, angry, critical
  urgency                 VARCHAR(20),     -- low, normal, high, critical
  needs_clarification     BOOLEAN     DEFAULT false,
  is_automatable          BOOLEAN     DEFAULT false,
  escalation_required     BOOLEAN     DEFAULT false,
  confidence              FLOAT,
  -- Text
  summary                 TEXT,            -- 3-6 Stichpunkte für Support-Mitarbeiter
  reasoning_short         TEXT,            -- max 2 Sätze Begründung (intern)
  -- Timestamps
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_analysis_ticket ON ai_analysis(zammad_ticket_id);
CREATE INDEX idx_ai_analysis_created ON ai_analysis(created_at);
