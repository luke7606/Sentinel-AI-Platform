import { useState, useRef, useEffect, useCallback } from "react";
import "./styles/App.css";
import { I18N, LANGS, LANG_LABELS } from "./i18n";
import { DEMO_USERS, SLA_MS, DEFAULT_KB, getDemoTickets, INTEGRATION_DEFS } from "./constants";
import { fmtDur, fmtAge, detectSev, getSevClass } from "./utils";

export default function SentinelApp() {
  const [lang, setLangState] = useState("en");
  const [currentRole, setCurrentRole] = useState("client");
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState("chat");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [escalated, setEscalated] = useState(false);
  const [n1Steps, setN1Steps] = useState(0);

  const [tickets, setTickets] = useState(() => getDemoTickets("en"));
  const [activeTicket, setActiveTicket] = useState(null);
  const [tktFilter, setTktFilter] = useState("all");
  const [kbDocs, setKbDocs] = useState([]);
  const [inputText, setInputText] = useState("");
  const [agtInput, setAgtInput] = useState("");
  const [kmName, setKmName] = useState("");
  const [kmText, setKbText] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [toast, setToast] = useState(null);
  const [slaTime, setSlaTime] = useState({});
  const [selectedInt, setSelectedInt] = useState("manual");
  const [connectedInts, setConnectedInts] = useState({});

  const chatAreaRef = useRef(null);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const slaIntervalRef = useRef(null);

  const T = I18N[lang] || I18N.en;
  const T_fn = useCallback((key) => (T[key] !== undefined ? T[key] : (I18N.en[key] || key)), [T]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (slaIntervalRef.current) clearInterval(slaIntervalRef.current);
    if (activeTicket && activeTicket.status === "open") {
      slaIntervalRef.current = setInterval(() => setSlaTime({}), 1000);
    }
    return () => { if (slaIntervalRef.current) clearInterval(slaIntervalRef.current); };
  }, [activeTicket]);

  const setLang = (l) => {
    setLangState(l);
    setTickets(getDemoTickets(l));
    if (user?.role === "client" && chatMessages.length === 0) initChat(l);
  };

  const doLogin = () => {
    const u = DEMO_USERS[loginEmail.toLowerCase()];
    if (!u || u.pass !== loginPass || u.role !== currentRole) {
      setLoginError("Credenciales incorrectas");
      return;
    }
    setUser({ ...u, email: loginEmail });
    if (u.role === "client") { setActiveView("chat"); initChat(lang); }
    else { setActiveView("agent"); }
  };

  const initChat = (l) => {
    const T2 = I18N[l] || I18N.en;
    setChatMessages([{ id: Date.now(), type: "bot", text: T2.greeting, quick: T2.quickStarters }]);
  };

  const buildDocsContext = () => {
    const localDocs = kbDocs.filter(d => d.status === "indexed");
    const all = [...localDocs, ...Object.values(connectedInts).flatMap(c => c.docs || [])];
    if (all.length === 0) return { docs: DEFAULT_KB, hasCustomDocs: false };
    return { docs: all.map(d => `=== ${d.name} ===\n${d.content}`).join("\n\n"), hasCustomDocs: true };
  };

  // ── LÓGICA DE IA CON GEMINI (VIA BACKEND) ──
  async function sendMsg(text) {
    if (escalated || isThinking) return;
    const msg = text || inputText.trim();
    if (!msg) return;
    setInputText("");
    
    const newHistory = [...chatHistory, { role: "user", parts: [{ text: msg }] }];
    setChatMessages(prev => [...prev, { id: Date.now(), type: "user", text: msg }]);
    setIsThinking(true);

    try {
      const { docs, hasCustomDocs } = buildDocsContext();
      const sysPrompt = (I18N[lang] || I18N.en).sysPrompt(docs, hasCustomDocs);

      // LLAMADA A TU PROPIO SERVER (Evita problemas de CORS de Anthropic)
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: chatHistory,
          systemPrompt: sysPrompt
        }),
      });

      const data = await res.json();
      const reply = data.text;
      
      setIsThinking(false);
      const prefix = (I18N[lang] || I18N.en).escalatePrefix;

      if (reply.trim().toUpperCase().startsWith(prefix.toUpperCase())) {
        const summary = reply.replace(new RegExp("^" + prefix + "[:\\s]*", "i"), "").trim();
        setChatMessages(prev => [...prev, { id: Date.now(), type: "bot", text: (I18N[lang] || I18N.en).escalateBotMsg }]);
        triggerEscalate(summary, n1Steps + 1);
      } else {
        setChatHistory(prev => [...prev, ...newHistory, { role: "model", parts: [{ text: reply }] }]);
        const fmt = parseReply(reply);
        setChatMessages(prev => [...prev, { id: Date.now(), type: "bot", text: fmt.text, steps: fmt.steps }]);
      }
    } catch (e) {
      setIsThinking(false);
      setChatMessages(prev => [...prev, { id: Date.now(), type: "bot", text: "⚠ Error conectando con Sentinel Server." }]);
    }
  }

  function parseReply(text) {
    const lines = text.split("\n");
    const steps = [], rest = [];
    lines.forEach(l => /^\d+\.\s+/.test(l.trim()) ? steps.push(l.trim().replace(/^\d+\.\s+/, "")) : rest.push(l));
    return { text: rest.join("\n").trim(), steps: steps.length ? steps : null };
  }

  function triggerEscalate(summary, steps) {
    setEscalated(true);
    const tkt = {
      id: "TKT-" + String(tickets.length + 1).padStart(4, "0"),
      title: summary.substring(0, 60),
      summary, severity: detectSev(summary, lang), steps,
      conversation: chatHistory.map(m => ({ role: m.role, text: m.parts[0].text })),
      status: "open", createdAt: Date.now()
    };
    setTickets(prev => [...prev, tkt]);
    setChatMessages(prev => [...prev, { id: Date.now(), type: "sys", text: `🔴 Escalado a Nivel 2: ${tkt.id}` }]);
  }

  // ... (Aquí irían el resto de funciones de la interfaz como agentSend, etc.) ...

  return (
    <div className="sentinel-app">
      {/* ... Estructura visual igual a la anterior ... */}
      {!user ? (
        <div className="login-wrap">
          {/* Bloque de login omitido por brevedad, usa el que ya tienes */}
          <button className="login-btn cl" onClick={doLogin}>ENTRAR</button>
        </div>
      ) : (
        <div className="main">
          {/* Vista de Chat, Agent y KB igual a tu versión anterior */}
        </div>
      )}
    </div>
  );
}