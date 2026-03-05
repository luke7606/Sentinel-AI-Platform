// --- CONFIGURACIÓN DE USUARIOS DEMO ---
export const DEMO_USERS = {
  "client@demo.com": { pass: "demo", role: "client", name: "Alex Chen" },
  "agent@demo.com": { pass: "demo", role: "agent", name: "María Rodríguez" },
};

// --- TIEMPOS DE SLA (ms) ---
export const SLA_MS = {
  High: 4 * 3600000,
  Medium: 8 * 3600000,
  Low: 24 * 3600000,
};

// --- BASE DE CONOCIMIENTO POR DEFECTO (Para la IA) ---
export const DEFAULT_KB = `Project: Nova Commerce Platform | Client: RetailCo S.A.
Stack: Node.js 18, React 18, PostgreSQL 14, Redis 6, AWS EC2 t3.medium
Deploy: Feb 15 2025 | Environment: production (us-east-1)

== PAYMENTS MODULE ==
Provider: Stripe v3
Webhook endpoint: POST /api/payments/webhook
Current Issue: Some Visa cards are failing due to 3D Secure 2.0 validation rules.

== LOGIN / AUTH ==
Method: JWT + HttpOnly Cookies
MFA: Enabled via Authy.`;

// --- TICKETS DE EJEMPLO (Lo que pedía Vercel) ---
export const DEMO_TICKETS = [
  {
    id: "TKT-0001",
    title: "Error en pasarela de pagos",
    summary: "El usuario reporta que el checkout falla al procesar tarjetas Visa.",
    severity: "High",
    status: "open",
    createdAt: Date.now() - 3600000,
    conversation: []
  },
  {
    id: "TKT-0002",
    title: "Actualización de Webhooks",
    summary: "Consulta técnica sobre cómo configurar los webhooks de Stripe.",
    severity: "Low",
    status: "resolved",
    createdAt: Date.now() - 86400000,
    conversation: []
  }
];

// --- DEFINICIÓN DE INTEGRACIONES ---
export const INTEGRATION_DEFS = {
  manual: { id: "manual", name: "Manual Entry" },
  github: { id: "github", name: "GitHub Docs" },
  confluence: { id: "confluence", name: "Confluence" },
};