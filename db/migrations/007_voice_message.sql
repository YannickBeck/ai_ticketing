-- ============================================================
-- Migration 007: Voice Messages
-- Audio-Eingänge mit Transkription und Zusammenfassung
-- ============================================================

CREATE TABLE voice_message (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  zammad_ticket_id        BIGINT,               -- wird nach Ticketerstellung gesetzt
  -- Blob Storage Referenz
  storage_url             TEXT        NOT NULL,  -- Azure Blob URL
  storage_container       VARCHAR(50) DEFAULT 'voice-audio',
  blob_name               TEXT,
  -- Audio Metadaten
  original_filename       TEXT,
  mime_type               VARCHAR(100),
  file_size_bytes         BIGINT,
  duration_seconds        INTEGER,
  -- Transkription (Azure AI Speech)
  transcript              TEXT,
  transcript_confidence   FLOAT,                -- 0.0 - 1.0
  language                VARCHAR(10),
  stt_provider            VARCHAR(50) DEFAULT 'azure_speech',
  stt_processed_at        TIMESTAMPTZ,
  -- KI-Zusammenfassung
  ai_summary              TEXT,
  -- Timestamps
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_voice_message_ticket ON voice_message(zammad_ticket_id);
CREATE INDEX idx_voice_message_created ON voice_message(created_at);
