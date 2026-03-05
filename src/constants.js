export const DEMO_USERS = {
  "client@demo.com": { pass: "demo", role: "client", name: "Alex Chen" },
  "agent@demo.com": { pass: "demo", role: "agent", name: "María Rodríguez" },
};

export const DEFAULT_KB = `Project: Sentinel Platform. IA: Gemini 1.5 Flash.`;

export const DEMO_TICKETS = [
  {
    id: "TKT-0001",
    title: "Acceso Inicial",
    summary: "Ticket de prueba para validar la interfaz.",
    severity: "Low",
    status: "open",
    createdAt: Date.now(),
    conversation: []
  }
];