-- ============================================================
-- Migration 002: AI Draft Responses
-- Antwortvorschläge der KI — mit Human Approval Tracking
-- ============================================================

CREATE TABLE ai_draft (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  zammad_ticket_id        BIGINT      NOT NULL,
  analysis_id             UUID        REFERENCES ai_analysis(id) ON DELETE SET NULL,
  -- Draft Inhalt
  draft_body              TEXT,
  tone                    VARCHAR(50),     -- friendly, formal, brief
  language                VARCHAR(10),
  -- Status-Flow: draft → edited/approved/rejected → sent
  status                  VARCHAR(30) DEFAULT 'draft'
                          CHECK (status IN ('draft','edited','approved','rejected','sent')),
  confidence              FLOAT,
  needs_human_approval    BOOLEAN     DEFAULT true,
  -- RAG Quellen
  used_sources            JSONB,           -- [{document_id, title, section, score}]
  missing_context         JSONB,           -- [] oder [{"reason": "..."}]
  -- Approval
  approved_by             VARCHAR(255),    -- Zammad User ID
  approved_at             TIMESTAMPTZ,
  sent_at                 TIMESTAMPTZ,
  -- Timestamps
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_draft_ticket ON ai_draft(zammad_ticket_id);
CREATE INDEX idx_ai_draft_status ON ai_draft(status);

-- Updated_at automatisch setzen
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_draft_updated_at
  BEFORE UPDATE ON ai_draft
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
