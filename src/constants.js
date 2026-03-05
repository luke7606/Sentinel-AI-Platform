// ── DEMO USERS ──
export const DEMO_USERS = {
  "client@demo.com": { pass: "demo", role: "client", name: "Alex Chen" },
  "agent@demo.com":  { pass: "demo", role: "agent",  name: "María Rodríguez" },
};

// ── SLA TIMES in ms ──
export const SLA_MS = {
  High: 4*3600000, Alta: 4*3600000, Haute: 4*3600000, Hoch: 4*3600000,
  Med: 8*3600000, Media: 8*3600000, Média: 8*3600000, Moyenne: 8*3600000, Mittel: 8*3600000,
  Low: 24*3600000, Baja: 24*3600000, Baixa: 24*3600000, Basse: 24*3600000, Niedrig: 24*3600000,
};

// ── DEFAULT KNOWLEDGE BASE ──
export const DEFAULT_KB = `Project: Nova Commerce Platform | Client: RetailCo S.A.
Stack: Node.js 18, React 18, PostgreSQL 14, Redis 6, AWS EC2 t3.medium
Deploy: Feb 15 2025 | Environment: production (us-east-1)

== PAYMENTS MODULE ==
Provider: Stripe v3
Webhook endpoint: POST /api/payments/webhook
Config file: config/payments.js
Timeout: 30 seconds
Secret key rotation: every 90 days (next: May 15 2025)
Common errors:
  - "signature_verification_failed" → check STRIPE_WEBHOOK_SECRET in .env
  - "timeout" → increase timeout in config/payments.js line 14
  - "card_declined" → check Stripe dashboard for decline reason

== INVENTORY MODULE ==
Sync cron: every 5 minutes (/etc/cron.d/inventory-sync)
Cache: Redis TTL 300 seconds
Manual flush: redis-cli FLUSHDB (WARNING: clears all cache)
Sync script: node scripts/sync-inventory.js
Common errors:
  - "stale data" → flush Redis cache and wait 5 min
  - "sync timeout" → check cron status: pm2 logs inventory-cron

== REPORTS MODULE ==
Worker: pm2 process "report-worker"
Storage path: /storage/reports (requires 10GB free)
Queue: async Bull queue (Redis-backed)
Row limit: 50,000 rows per export
Common errors:
  - "worker not running" → pm2 restart report-worker
  - "export timeout" → reduce date range or split by month
  - "disk full" → clean /storage/reports/*.old files

== INFRASTRUCTURE ==
Server: AWS EC2 t3.medium
Process manager: PM2 v5
Logs: /var/log/nova-commerce/ or pm2 logs
Restart all: pm2 restart all
Health check: GET /api/health → should return {"status":"ok"}
Database: PostgreSQL on RDS (endpoint in .env DB_HOST)
Redis: ElastiCache (endpoint in .env REDIS_URL)

== CONTACTS ==
Tech Lead: carlos.mendez@retailco.com
DevOps: devops@retailco.com
On-call Slack: #nova-incidents`;

// ── DEMO TICKETS (pre-loaded for agent view) ──
export const DEMO_TICKETS = [
  {
    id: "TKT-0001",
    title: "Payment webhook failing with signature_verification_failed...",
    summary: "Payment webhook is rejecting all incoming Stripe events with signature_verification_failed error. Client cannot process any orders. Production impact: HIGH.",
    severity: "High",
    steps: 3,
    conversation: [
      { role: "user", text: "Our payment webhook stopped working. We're getting signature_verification_failed errors on every Stripe event. We haven't changed anything in the code." },
      { role: "assistant", text: "I checked the documentation. This error typically occurs when the STRIPE_WEBHOOK_SECRET in your .env file is outdated. According to the project docs, the Stripe secret key rotates every 90 days — the next rotation was scheduled for May 15, 2025. Please verify the webhook secret in your Stripe dashboard matches the STRIPE_WEBHOOK_SECRET value in config/payments.js." },
      { role: "user", text: "We checked and the secret looks the same but still failing. We tried restarting the server too." },
      { role: "assistant", text: "Since the secret matches and restart didn't help, I've exhausted the available diagnostic steps for this case. Your issue will be escalated to the technical team (Level 2). An agent will review the full history and contact you shortly." },
    ],
    status: "open",
    createdAt: Date.now() - 2 * 3600000, // 2 hours ago
    resolvedAt: null,
  },
  {
    id: "TKT-0002",
    title: "Inventory data showing stale stock counts for 3+ hours...",
    summary: "Inventory sync is not updating. Stock counts are 3 hours stale. Customers seeing incorrect availability. Redis cache flush did not resolve the issue.",
    severity: "Med",
    steps: 2,
    conversation: [
      { role: "user", text: "The inventory hasn't updated in 3 hours. Stock counts are completely wrong. Customers are placing orders for out-of-stock items." },
      { role: "assistant", text: "According to the documentation, inventory syncs every 5 minutes via cron. First step: flush the Redis cache with redis-cli FLUSHDB and wait 5 minutes for the next sync cycle." },
      { role: "user", text: "We flushed the cache but still showing old data after 20 minutes." },
      { role: "assistant", text: "If flushing cache didn't resolve it, the cron job may have stopped. Your issue will be escalated to Level 2 to check the pm2 inventory-cron process status." },
    ],
    status: "open",
    createdAt: Date.now() - 5 * 3600000, // 5 hours ago — SLA warn
    resolvedAt: null,
  },
  {
    id: "TKT-0003",
    title: "Monthly sales report export timing out at 45,000 rows...",
    summary: "Report worker times out when generating monthly export with ~45,000 rows. Worker process was restarted but issue persists.",
    severity: "Low",
    steps: 2,
    conversation: [
      { role: "user", text: "Every time we try to export the monthly sales report it times out. It was working fine last month." },
      { role: "assistant", text: "The documentation states a 50,000 row limit per export. You're at 45,000 rows which is close to the limit. First, check if the report-worker is running: pm2 status report-worker. If it shows stopped, restart it: pm2 restart report-worker." },
      { role: "user", text: "Worker is running. Still timing out." },
      { role: "assistant", text: "Since the worker is running but still timing out near the row limit, this needs deeper investigation. Escalating to Level 2 — the team may need to optimize the query or split the export." },
      { role: "agent", text: "✅ Ticket resolved. We identified the issue: a missing database index on the sales_date column was causing a full table scan. Added index in migration 20250301_add_sales_date_index.sql. Export now completes in ~8 seconds. Time: 2h 15m" },
    ],
    status: "resolved",
    createdAt: Date.now() - 26 * 3600000,
    resolvedAt: Date.now() - 24 * 3600000,
  },
];

// ── INTEGRATION DEFINITIONS ──
export const INTEGRATION_DEFS = [
  { id: "manual",     icon: "📄", name: "Manual Files",  sub: "PDF, TXT, MD, CSV, JSON", type: "upload" },
  { id: "script",     icon: "⚙",  name: "Script / URL",  sub: "JSON API, custom endpoint", type: "script" },
  { id: "notion",     icon: "◻",  name: "Notion",        sub: "Pages & databases",   type: "oauth",  fields: ["apiKey"] },
  { id: "confluence", icon: "✦",  name: "Confluence",    sub: "Docs & spaces",       type: "oauth",  fields: ["apiKey","url"] },
  { id: "clickup",    icon: "⚡",  name: "ClickUp",       sub: "Tasks & tickets",     type: "oauth",  fields: ["apiKey"] },
  { id: "jira",       icon: "⬡",  name: "Jira / Linear", sub: "Issues & sprints",    type: "oauth",  fields: ["apiKey","url"] },
  { id: "drive",      icon: "△",  name: "Google Drive",  sub: "Docs & sheets",       type: "oauth",  fields: ["apiKey"] },
  { id: "github",     icon: "⌥",  name: "GitHub",        sub: "READMEs & wikis",     type: "oauth",  fields: ["apiKey","url"] },
];
