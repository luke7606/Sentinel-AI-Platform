# Sentinel v4 — AI Support Platform

## Estructura del proyecto

```
sentinel-app/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx          ← Componente principal
│   ├── index.js         ← Entry point
│   ├── i18n.js          ← Traducciones (EN, ES, PT, FR, DE)
│   ├── constants.js     ← Usuarios demo, KB, tickets demo, integraciones
│   ├── utils.js         ← Funciones utilitarias
│   └── styles/
│       └── App.css      ← Estilos globales
├── package.json
└── README.md
```

## Instalación y uso

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en desarrollo
npm start

# Abre en http://localhost:3000
```

## Credenciales demo

| Rol    | Email                | Password |
|--------|----------------------|----------|
| Cliente | client@demo.com     | demo     |
| Agente  | agent@demo.com      | demo     |

## Features

### 🌐 Multi-idioma (5 idiomas)
- Español, English, Português, Français, Deutsch
- Selector en login y en el topbar
- La IA responde en el idioma seleccionado

### 🧠 IA basada en KB
- Si hay documentos cargados → responde exclusivamente desde esos docs
- Si no hay docs → usa la documentación predeterminada del proyecto
- Sistema prompt adaptado por idioma

### 🔌 Integraciones
- **Manual Files** — Drag & drop de PDF, TXT, MD, CSV, JSON
- **Script / URL** — Carga KB desde una URL o JSON pegado
- **Confluence, Jira, ClickUp, Notion, GitHub, Google Drive** — Conectar con API Key

### 📜 Chat con scroll
- Botones ↑ / ↓ para ir al inicio o al final del chat
- Auto-scroll al recibir nuevos mensajes
- Scroll manual libre en cualquier momento

### 🎫 Tickets pre-cargados para demo del agente
- TKT-0001: Payment webhook failure (High, open)
- TKT-0002: Inventory sync stale (Med, open — SLA warning)
- TKT-0003: Report export timeout (Low, resolved)

## Personalización

### Cambiar el proyecto / cliente
Editar `src/constants.js` → `DEFAULT_KB`

### Agregar más usuarios
Editar `src/constants.js` → `DEMO_USERS`

### Agregar más idiomas
Agregar la clave en `src/i18n.js` → `I18N` y en `LANGS`

### Ajustar SLA times
Editar `src/constants.js` → `SLA_MS`

## API Key de Anthropic

La app llama directamente a `https://api.anthropic.com/v1/messages`.
En producción, **nunca expongas la API key en el frontend**.
Usá un backend proxy en su lugar.

Para desarrollo local, podés agregar un proxy en `src/setupProxy.js`
o modificar las llamadas fetch para pasar por tu propio servidor.
