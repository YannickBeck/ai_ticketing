# AI Ticketing Buddy — Azure

KI-gestütztes Support-Ticketsystem auf Azure. n8n orchestriert Workflows zwischen Zammad, Azure OpenAI, pgvector und Azure AI Speech.

## Architektur

```
M365/Exchange Online (Graph API)
         ↓
Azure Container Apps
  ├── n8n            (Workflow Engine)
  ├── Zammad         (Ticket UI)
  ├── Redis          (Zammad Sessions)
  └── Elasticsearch  (Zammad Suche)
         ↓
Azure Database for PostgreSQL
  ├── DB: ai_buddy   (AI-Metadaten + pgvector)
  └── DB: zammad     (Tickets)
         ↓
Azure OpenAI (GPT-4o + text-embedding-3-large)
Azure AI Speech (Speech-to-Text)
Azure Blob Storage (Anhänge + Audio)
Azure Key Vault (Secrets)
```

## Deployment (Reihenfolge)

### Schritt 1: GitHub Repo + Secrets

```bash
# GitHub Actions Secrets setzen:
# AZURE_CREDENTIALS  → Service Principal JSON
# PG_ADMIN_PASSWORD  → PostgreSQL Admin Passwort
# PG_HOST            → Nach Bicep Deploy eintragen
# PG_AI_BUDDY_PASSWORD
# N8N_API_KEY        → Nach n8n Setup eintragen
# N8N_BASE_URL       → Nach Bicep Deploy eintragen
```

### Schritt 2: Azure Service Principal anlegen

```bash
az login

# Service Principal für GitHub Actions
az ad sp create-for-rbac \
  --name "sp-ai-ticketing-github" \
  --role contributor \
  --scopes /subscriptions/SUBSCRIPTION_ID \
  --sdk-auth \
  > azure-credentials.json
# Inhalt als AZURE_CREDENTIALS Secret in GitHub eintragen
# azure-credentials.json danach löschen!
```

### Schritt 3: Infrastruktur deployen

```bash
# Subscription ID in params.prod.json eintragen
# Dann push auf main oder manuell:
gh workflow run deploy-infra.yml
```

### Schritt 4: Key Vault befüllen

```bash
KEYVAULT=kv-aiticketing-prod

# PostgreSQL
az keyvault secret set --vault-name $KEYVAULT --name pg-admin-password --value "DEIN_PG_PASSWORD"
az keyvault secret set --vault-name $KEYVAULT --name pg-n8n-password --value "DEIN_PG_PASSWORD"
az keyvault secret set --vault-name $KEYVAULT --name pg-zammad-password --value "DEIN_PG_PASSWORD"

# n8n
az keyvault secret set --vault-name $KEYVAULT --name n8n-encryption-key --value "$(openssl rand -hex 16)"

# Zammad
az keyvault secret set --vault-name $KEYVAULT --name zammad-secret-token --value "$(openssl rand -hex 32)"

# Azure OpenAI Key (aus Azure Portal)
az keyvault secret set --vault-name $KEYVAULT --name openai-api-key --value "DEIN_OPENAI_KEY"

# Azure Speech Key (aus Azure Portal)
az keyvault secret set --vault-name $KEYVAULT --name speech-api-key --value "DEIN_SPEECH_KEY"

# Microsoft Graph
az keyvault secret set --vault-name $KEYVAULT --name graph-client-secret --value "DEIN_GRAPH_SECRET"

# Webhook Signing
az keyvault secret set --vault-name $KEYVAULT --name webhook-signing-secret --value "$(openssl rand -hex 32)"
```

### Schritt 5: DB Migrations ausführen

```bash
gh workflow run deploy-db-migrations.yml
```

Oder manuell:
```bash
for f in db/migrations/*.sql; do
  psql "$PG_AI_BUDDY_URL" -f "$f"
done
```

### Schritt 6: Entra ID App Registration (Microsoft Graph)

```bash
# App anlegen
APP_ID=$(az ad app create --display-name "AI-Ticketing-Graph" --query appId -o tsv)

# Permissions: Mail.ReadWrite + Mail.Send (Application)
az ad app permission add \
  --id $APP_ID \
  --api 00000003-0000-0000-c000-000000000000 \
  --api-permissions 810c84a8-4a9e-49e6-bf7d-12d183f40d01=Role \
                    b633e1c5-b582-4048-a93e-9f11b44c7e96=Role

# Admin Consent erteilen (Global Admin erforderlich)
az ad app permission admin-consent --id $APP_ID

# Client Secret erstellen
az ad app credential reset --id $APP_ID --append
# Secret → in Key Vault speichern
```

### Schritt 7: n8n Setup

1. n8n URL aufrufen: `https://ca-n8n-prod.azurecontainerapps.io`
2. Admin-Account anlegen
3. Credentials anlegen:
   - **Azure OpenAI**: HTTP Header Auth → `api-key: [Key Vault Wert]`
   - **PostgreSQL AI Buddy**: Host, DB `ai_buddy`, SSL
   - **Zammad API**: HTTP Header Auth → `Authorization: Token token=...`
   - **Microsoft Graph OAuth2**: Client ID, Secret, Tenant ID
   - **Azure Speech**: HTTP Header Auth → `Ocp-Apim-Subscription-Key: ...`
4. Workflows importieren: alle JSONs aus `n8n/workflows/`
5. Alle 10 Workflows aktivieren

### Schritt 8: Zammad Setup

1. Zammad URL aufrufen: `https://ca-zammad-prod.azurecontainerapps.io`
2. Setup Wizard durchführen
3. E-Mail-Kanal: Microsoft 365 mit Graph API OAuth2
4. Gruppen anlegen: `Support`, `Eskalation`, `Admin`
5. SLA-Policies gemäß Konzept konfigurieren
6. Tags anlegen: `ai-draft-ready`, `escalated`, `feedback-given`
7. API Token generieren → in Key Vault als `zammad-api-token` speichern
8. Container App neu starten damit n8n den Token bekommt

### Schritt 9: E2E Test

```bash
# Test-Mail an Support-Mailbox senden
# Dann prüfen:
# 1. Zammad: Neues Ticket erscheint
# 2. n8n Executions: Workflow 01+02+03 erfolgreich
# 3. PostgreSQL ai_buddy: ai_analysis + ai_draft Einträge vorhanden
# 4. Zammad: Interne Notiz mit KI-Draft sichtbar
```

## Projektstruktur

```
ai-ticketing-buddy/
├── infra/               Azure Bicep IaC
│   ├── main.bicep
│   └── modules/
├── db/migrations/       PostgreSQL Migrations (ai_buddy DB)
├── n8n/workflows/       n8n Workflow JSON (importierbar)
├── .github/workflows/   CI/CD Pipeline
├── .env.example         Environment Template
└── README.md
```

## Kosten (Schätzung MVP)

| Dienst | ~Monat |
|---|---|
| Azure Container Apps (n8n+Zammad+Redis+ES) | 80–150 € |
| PostgreSQL Flexible Server (B2s) | 35–50 € |
| Azure Blob Storage | 5–15 € |
| Azure OpenAI (variabel, ~100 Tickets/Tag) | 50–200 € |
| Azure AI Speech | 1–10 € |
| Azure Key Vault | < 5 € |
| **Gesamt ohne OpenAI-Verbrauch** | **~120–220 €/Monat** |

## Sicherheitshinweise

- Alle Secrets ausschließlich über Azure Key Vault
- `.env` niemals committen
- Webhook-Signatur (HMAC-SHA256) in Workflow 04 validiert
- pgvector Similarity Threshold ≥ 0.75 → verhindert irrelevante RAG-Ergebnisse
- Auto-Antwort im MVP deaktiviert — Human Approval ist Standard

## Weiterführende Ressourcen

- [Zammad REST API Dokumentation](https://docs.zammad.org/en/latest/api/intro.html)
- [Azure OpenAI Service](https://learn.microsoft.com/azure/ai-services/openai/)
- [pgvector](https://github.com/pgvector/pgvector)
- [n8n Docs](https://docs.n8n.io/)
- [Azure Container Apps](https://learn.microsoft.com/azure/container-apps/)
