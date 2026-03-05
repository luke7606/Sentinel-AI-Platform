
export const DEMO_USERS = {
  "client@demo.com": { pass: "demo", role: "client", name: "Alex Chen" },
  "agent@demo.com": { pass: "demo", role: "agent", name: "María Rodríguez" },
};

export const SLA_MS = { High: 14400000, Medium: 28800000, Low: 86400000 };

export const DEFAULT_KB = `Project: Sentinel Platform. Stack: React, Node.js. 
IA: Gemini 1.5 Flash. Soporte técnico para Nova Commerce.`;

export const DEMO_TICKETS = [
  {
    id: "TKT-0001",
    title: "Error de conexión",
    summary: "Falla al conectar con la base de datos.",
    severity: "High",
    status: "open",
    createdAt: Date.now(),
    conversation: []
  }
];

export const INTEGRATION_DEFS = { manual: { id: "manual", name: "Manual" } };