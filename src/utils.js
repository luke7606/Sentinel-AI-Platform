export function fmtDur(ms) {
  if (ms <= 0) return "0s";
  const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function fmtAge(ts, lang) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) {
    return { en:`${s}s ago`, es:`hace ${s}s`, pt:`${s}s atrás`, fr:`il y a ${s}s`, de:`vor ${s}s` }[lang] || `${s}s ago`;
  }
  const mi = Math.floor(s / 60);
  if (mi < 60) {
    return { en:`${mi}m ago`, es:`hace ${mi}m`, pt:`${mi}m atrás`, fr:`il y a ${mi}m`, de:`vor ${mi}m` }[lang] || `${mi}m ago`;
  }
  const hr = Math.floor(mi / 60);
  return { en:`${hr}h ago`, es:`hace ${hr}h`, pt:`${hr}h atrás`, fr:`il y a ${hr}h`, de:`vor ${hr}h` }[lang] || `${hr}h ago`;
}

export function detectSev(text, lang) {
  const t = text.toLowerCase();
  if (["payment","pago","pagamento","paiement","zahlung","stripe","critical","production","infra"].some(k => t.includes(k))) {
    return { en:"High", es:"Alta", pt:"Alta", fr:"Haute", de:"Hoch" }[lang] || "High";
  }
  if (["inventory","inventario","inventário","inventaire","inventar","report","reporte","relatório","rapport","bericht","performance"].some(k => t.includes(k))) {
    return { en:"Med", es:"Media", pt:"Média", fr:"Moyenne", de:"Mittel" }[lang] || "Med";
  }
  return { en:"Low", es:"Baja", pt:"Baixa", fr:"Basse", de:"Niedrig" }[lang] || "Low";
}

export function getSevClass(sev) {
  if (["Alta","High","Haute","Hoch"].includes(sev)) return "sc-h";
  if (["Baja","Low","Basse","Niedrig"].includes(sev)) return "sc-l";
  return "sc-m";
}
