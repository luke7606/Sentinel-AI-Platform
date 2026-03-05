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
  const [kmText, setKmText] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [toast, setToast] = useState(null);
  const [slaTime, setSlaTime] = useState({});
  const [selectedInt, setSelectedInt] = useState("manual");
  const [isDrag, setIsDrag] = useState(false);
  const [tabAlert, setTabAlert] = useState(false);
  const [intCredentials, setIntCredentials] = useState({});
  const [connectedInts, setConnectedInts] = useState({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [scriptInput, setScriptInput] = useState("");
  const [isLoadingScript, setIsLoadingScript] = useState(false);

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

  const showToast = useCallback((msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  function scrollToTop() { chatAreaRef.current?.scrollTo({ top: 0, behavior: "smooth" }); }
  function scrollToBottom() { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }

  const INTEGRATIONS = INTEGRATION_DEFS.map(int => ({
    ...int,
    name: int.id === "manual" ? T_fn("manualFiles") : int.name,
    sub: int.id === "manual" ? "PDF, TXT, MD, CSV, JSON" : "Integration",
    active: int.active || !!connectedInts[int.id],
  }));

  function setLang(l) {
    setLangState(l);
    setTickets(prev => {
      const fresh = getDemoTickets(l);
      const demoIds = fresh.map(t => t.id);
      const sessionTickets = prev.filter(t => !demoIds.includes(t.id));
      return [...fresh, ...sessionTickets];
    });
    if (user?.role === "client" && chatMessages.length === 0) initChat(l);
  }

  function doLogin() {
    const u = DEMO_USERS[loginEmail.toLowerCase()];
    if (!u || u.pass !== loginPass || u.role !== currentRole) {
      setLoginError("Credenciales incorrectas");
      return;
    }
    setUser({ ...u, email: loginEmail });
    if (u.role === "client") { setActiveView("chat"); initChat(lang); }
    else { setActiveView("agent"); }
  }

  function doLogout() {
    setUser(null); setChatMessages([]); setChatHistory([]);
    setEscalated(false); setActiveTicket(null); setActiveView("chat");
    setTickets(getDemoTickets(lang));
  }

  function initChat(l) {
    const T2 = I18N[l] || I18N.en;
    setChatMessages([{ id: Date.now(), type: "bot", text: T2.greeting, quick: T2.quickStarters }]);
  }

  function buildDocsContext() {
    const localDocs = kbDocs.filter(d => d.status === "indexed");
    const connDocs = Object.values(connectedInts).flatMap(c => c.docs || []);
    const all = [...localDocs, ...connDocs];
    if (all.length === 0) return { docs: DEFAULT_KB, hasCustomDocs: false };
    return { docs: all.map(d => `=== ${d.name} ===\n${d.content}`).join("\n\n"), hasCustomDocs: true };
  }

  // ── FUNCIÓN DE IA CORREGIDA ──
  async function sendMsg(text) {
    if (escalated || isThinking) return;
    const msg = text || inputText.trim();
    if (!msg) return;
    setInputText("");
    
    const newHistory = [...chatHistory, { role: "user", content: msg }];
    setChatMessages(prev => [...prev, { id: Date.now(), type: "user", text: msg }]);
    setChatHistory(newHistory);
    setN1Steps(prev => prev + 1);
    setIsThinking(true);

    try {
      const { docs, hasCustomDocs } = buildDocsContext();
      const sysPrompt = (I18N[lang] || I18N.en).sysPrompt(docs, hasCustomDocs);

      const res = await fetch("https://cors-anywhere.herokuapp.com/https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY, // USA .ENV
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 800,
          system: sysPrompt,
          messages: newHistory,
        }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.content[0].text;
      setIsThinking(false);

      const prefix = (I18N[lang] || I18N.en).escalatePrefix;
      if (reply.trim().toUpperCase().startsWith(prefix.toUpperCase())) {
        const summary = reply.replace(new RegExp("^" + prefix + "[:\\s]*", "i"), "").trim();
        setChatMessages(prev => [...prev, { id: Date.now(), type: "bot", text: (I18N[lang] || I18N.en).escalateBotMsg }]);
        triggerEscalate(summary, n1Steps + 1);
      } else {
        setChatHistory(prev => [...prev, { role: "assistant", content: reply }]);
        const fmt = parseReply(reply);
        setChatMessages(prev => [...prev, { id: Date.now(), type: "bot", text: fmt.text, steps: fmt.steps }]);
      }
    } catch (e) {
      setIsThinking(false);
      setChatMessages(prev => [...prev, { id: Date.now(), type: "bot", text: `⚠ Error de conexión: Verifica tu API Key.` }]);
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
        conversation: [...chatHistory.map(m => ({ role: m.role, text: m.content }))],
        status: "open", createdAt: Date.now()
    };
    setTickets(prev => [...prev, tkt]);
    setChatMessages(prev => [...prev, { id: Date.now(), type: "sys", text: `🔴 Escalado a Nivel 2: ${tkt.id}` }]);
  }

  // ── VISTA DEL AGENTE ──
  function agentSend() {
    if (!agtInput.trim() || !activeTicket) return;
    const updated = { ...activeTicket, conversation: [...activeTicket.conversation, { role: "agent", text: agtInput.trim() }] };
    setActiveTicket(updated);
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    setChatMessages(prev => [...prev, { id: Date.now(), type: "sys-ok", text: `💬 Agente: ${agtInput.trim()}` }]);
    setAgtInput("");
  }

  async function suggestReply() {
    if (!activeTicket || isSuggesting) return;
    setIsSuggesting(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": process.env.REACT_APP_ANTHROPIC_API_KEY, // USA .ENV
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 400,
          messages: [{ role: "user", content: `Suggest a technical reply for: ${activeTicket.summary}` }],
        }),
      });
      const data = await res.json();
      setAgtInput(data.content[0].text);
    } catch (e) { showToast("Error de IA", "err"); }
    setIsSuggesting(false);
  }

  function resolveTicket() {
    if (!activeTicket) return;
    const updated = { ...activeTicket, status: "resolved", resolvedAt: Date.now() };
    setActiveTicket(updated);
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    setChatMessages(prev => [...prev, { id: Date.now(), type: "sys-ok", text: "✅ Caso resuelto." }]);
  }

  // ── EL RENDER SIGUE IGUAL (OMITIDO PARA BREVEDAD, USA EL DE TU ARCHIVO) ──
  // ... pega aquí todo el bloque del return() de tu App.jsx original ...
  return (
    <div className="sentinel-app">
        {/* Aquí va toda la estructura HTML de tu archivo original */}
        {/* Asegúrate de no borrar el bloque de LOGIN y MAIN que ya tenías */}
    </div>
  );
}