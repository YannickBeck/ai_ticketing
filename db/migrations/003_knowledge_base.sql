-- ============================================================
-- Migration 003: RAG Knowledge Base
-- Wissensquellen + Chunks + pgvector Embeddings
-- ============================================================

CREATE TABLE knowledge_document (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT        NOT NULL,
  source_type       VARCHAR(50),     -- pdf, url, markdown, sharepoint, confluence
  source_uri        TEXT,            -- URL oder Blob Storage Pfad
  version           VARCHAR(50),
  status            VARCHAR(20) DEFAULT 'active'
                    CHECK (status IN ('active','inactive','archived')),
  owner             VARCHAR(255),
  category_filter   VARCHAR(100),    -- optional: nur für bestimmte Kategorien relevant
  last_ingested_at  TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_doc_status ON knowledge_document(status);

-- Dokumentabschnitte mit Vektor-Embeddings
-- text-embedding-3-large → 3072 Dimensionen
CREATE TABLE knowledge_chunk (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID        NOT NULL REFERENCES knowledge_document(id) ON DELETE CASCADE,
  chunk_index   INTEGER     NOT NULL,
  text          TEXT        NOT NULL,
  token_count   INTEGER,
  metadata      JSONB,       -- {section, page, heading, source_url}
  embedding     vector(3072),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_knowledge_chunk_document ON knowledge_chunk(document_id);

-- Vektor-Index für Similarity Search (IVFFlat — für MVP effizient)
-- Hinweis: Erst anlegen wenn > 1000 Einträge vorhanden sind
-- ALTER INDEX später auf HNSW umstellen für Produktionslast
CREATE INDEX idx_knowledge_chunk_embedding
  ON knowledge_chunk USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Hilfsfunktion: Similarity Search
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding vector(3072),
  similarity_threshold FLOAT DEFAULT 0.75,
  max_results INTEGER DEFAULT 5,
  category_hint TEXT DEFAULT NULL
)
RETURNS TABLE (
  chunk_id UUID,
  document_id UUID,
  document_title TEXT,
  source_uri TEXT,
  chunk_text TEXT,
  metadata JSONB,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.document_id,
    kd.title,
    kd.source_uri,
    kc.text,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunk kc
  JOIN knowledge_document kd ON kd.id = kc.document_id
  WHERE kd.status = 'active'
    AND (category_hint IS NULL OR kd.category_filter = category_hint OR kd.category_filter IS NULL)
    AND 1 - (kc.embedding <=> query_embedding) > similarity_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;
