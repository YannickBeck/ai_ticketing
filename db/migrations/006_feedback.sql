-- ============================================================
-- Migration 006: Feedback
-- KI-Qualitätsbewertung durch Support-Mitarbeiter
-- ============================================================

CREATE TYPE correction_type AS ENUM (
  'factual',        -- fachlich falsch
  'tone',           -- Tonalität falsch
  'length',         -- zu lang / zu kurz
  'source_missing', -- Quelle fehlt oder falsch
  'wrong_category', -- Kategorie falsch klassifiziert
  'other'
);

CREATE TABLE feedback (
  id                UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  zammad_ticket_id  BIGINT          NOT NULL,
  draft_id          UUID            REFERENCES ai_draft(id) ON DELETE SET NULL,
  -- Wer bewertet
  user_id           VARCHAR(255),   -- Zammad User ID
  -- Bewertung
  rating            SMALLINT        CHECK (rating BETWEEN 1 AND 5),
  correction_type   correction_type,
  comment           TEXT,
  -- Draft Vergleich
  draft_was_used    BOOLEAN         DEFAULT true,    -- false = vollständig verworfen
  edit_extent       VARCHAR(20),                     -- none, minor, major, complete_rewrite
  -- Timestamps
  created_at        TIMESTAMPTZ     DEFAULT NOW()
);

CREATE INDEX idx_feedback_ticket ON feedback(zammad_ticket_id);
CREATE INDEX idx_feedback_draft ON feedback(draft_id);
CREATE INDEX idx_feedback_created ON feedback(created_at);

-- View: KI-Qualitäts-KPIs (für Reporting Workflow 10)
CREATE VIEW ai_quality_kpis AS
SELECT
  DATE_TRUNC('week', f.created_at)          AS week,
  COUNT(*)                                   AS total_drafts_reviewed,
  AVG(f.rating)                              AS avg_rating,
  COUNT(*) FILTER (WHERE f.draft_was_used AND f.edit_extent = 'none')    AS accepted_unchanged,
  COUNT(*) FILTER (WHERE f.draft_was_used AND f.edit_extent != 'none')   AS accepted_with_edits,
  COUNT(*) FILTER (WHERE NOT f.draft_was_used)                           AS rejected,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE f.draft_was_used) / NULLIF(COUNT(*), 0), 1
  )                                          AS acceptance_rate_pct
FROM feedback f
GROUP BY DATE_TRUNC('week', f.created_at)
ORDER BY week DESC;
