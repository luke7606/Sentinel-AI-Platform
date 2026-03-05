import { useState, useRef, useEffect } from "react";
import "./styles/App.css";
import { DEMO_USERS, DEFAULT_KB, DEMO_TICKETS } from "./constants";

export default function SentinelApp() {
  const [user, setUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const doLogin = () => {
    setUser(DEMO_USERS["client@demo.com"]);
    setChatMessages([{ id: Date.now(), type: "bot", text: "Bienvenido a Sentinel. ¿En qué puedo ayudarte?" }]);
  };

  async function sendMsg() {
    if (!inputText.trim() || isThinking) return;
    
    const msg = inputText.trim();
    setInputText("");
    setChatMessages(prev => [...prev, { id: Date.now(), type: "user", text: msg }]);
    setIsThinking(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: chatHistory,
          systemPrompt: `Eres un experto de soporte. Contexto: ${DEFAULT_KB}`
        }),
      });

      const data = await res.json();
      setChatMessages(prev => [...prev, { id: Date.now(), type: "bot", text: data.text }]);
      setChatHistory(prev => [...prev, 
        { role: "user", parts: [{ text: msg }] },
        { role: "model", parts: [{ text: data.text }] }
      ]);
    } catch (e) {
      setChatMessages(prev => [...prev, { id: Date.now(), type: "bot", text: "Error de conexión con la IA." }]);
    } finally {
      setIsThinking(false);
    }
  }

  if (!user) {
    return (
      <div className="login-wrap" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#05070a' }}>
        <button 
          onClick={doLogin}
          style={{ padding: '20px 50px', fontSize: '20px', cursor: 'pointer', background: '#00f2ff', border: 'none', fontWeight: 'bold' }}
        >
          ENTRAR A LA DEMO
        </button>
      </div>
    );
  }

  return (
    <div className="sentinel-app" style={{ color: 'white', padding: '20px' }}>
      <div className="chat-area" style={{ height: '70vh', overflowY: 'auto', marginBottom: '20px' }}>
        {chatMessages.map(m => (
          <div key={m.id} style={{ margin: '10px 0', textAlign: m.type === 'user' ? 'right' : 'left' }}>
            <span style={{ background: m.type === 'user' ? '#0055ff' : '#333', padding: '8px 12px', borderRadius: '10px' }}>
              {m.text}
            </span>
          </div>
        ))}
        {isThinking && <div>IA pensando...</div>}
        <div ref={chatEndRef} />
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          style={{ flex: 1, padding: '10px' }}
          value={inputText} 
          onChange={(e) => setInputText(e.target.value)} 
          onKeyDown={(e) => e.key === "Enter" && sendMsg()}
        />
        <button onClick={sendMsg} style={{ padding: '10px 20px' }}>Enviar</button>
      </div>
    </div>
  );
}