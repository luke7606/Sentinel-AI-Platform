import { useState, useRef, useEffect } from "react";
import "./styles/App.css";
import { I18N } from "./i18n";
import { DEMO_USERS, DEFAULT_KB, DEMO_TICKETS } from "./constants";

export default function SentinelApp() {
  const [lang] = useState("en");
  const [user, setUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [tickets] = useState(DEMO_TICKETS);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  const T = I18N[lang] || I18N.en;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const doLogin = () => {
    // Login simplificado para la demo
    setUser(DEMO_USERS["client@demo.com"]);
    setChatMessages([{ id: Date.now(), type: "bot", text: T.greeting }]);
  };

  async function sendMsg() {
    if (!inputText.trim() || isThinking) return;
    
    const msg = inputText.trim();
    setInputText("");
    const newHistory = [...chatHistory, { role: "user", parts: [{ text: msg }] }];
    
    setChatMessages(prev => [...prev, { id: Date.now(), type: "user", text: msg }]);
    setIsThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: chatHistory,
          systemPrompt: T.sysPrompt(DEFAULT_KB, true)
        }),
      });

      const data = await res.json();
      setChatMessages(prev => [...prev, { id: Date.now(), type: "bot", text: data.text }]);
      setChatHistory([...newHistory, { role: "model", parts: [{ text: data.text }] }]);
    } catch (e) {
      setChatMessages(prev => [...prev, { id: Date.now(), type: "bot", text: "Error: No se pudo conectar con la IA." }]);
    } finally {
      setIsThinking(false);
    }
  }

  if (!user) {
    return (
      <div className="login-wrap">
        <div className="login-card">
          <h1>SENTINEL AI</h1>
          <button className="login-btn" onClick={doLogin}>ENTRAR A DEMO</button>
        </div>
      </div>
    );
  }

  return (
    <div className="sentinel-app">
      <div className="chat-area">
        {chatMessages.map(m => (
          <div key={m.id} className={`msg ${m.type}`}>{m.text}</div>
        ))}
        {isThinking && <div className="msg bot">Pensando...</div>}
        <div ref={chatEndRef} />
      </div>
      <div className="input-box">
        <input 
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && sendMsg()}
        />
        <button onClick={sendMsg}>Enviar</button>
      </div>
    </div>
  );
}