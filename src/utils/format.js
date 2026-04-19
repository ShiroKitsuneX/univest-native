export const timeAgo = (timestamp) => {
  if (!timestamp) return "";
  const now = Date.now();
  const ms = typeof timestamp === "number" ? timestamp : timestamp?.toMillis?.() || timestamp?.seconds ? timestamp.seconds*1000 : new Date(timestamp).getTime();
  if (!ms || isNaN(ms)) return "";
  const diff = now - ms;
  const mins = Math.floor(diff/60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins/60);
  if (hrs < 24) return `${hrs}h atrás`;
  const days = Math.floor(hrs/24);
  if (days < 2) return `${days}d atrás`;
  const d = new Date(ms);
  const pad = n => n.toString().padStart(2,"0");
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const fmtCount = (n) => {
  if (typeof n === "string") return n;
  if (!n || isNaN(n)) return "0";
  if (n >= 1000000) return (n/1000000).toFixed(1).replace(/\.0$/,"")+"M";
  if (n >= 1000) return (n/1000).toFixed(n>=10000?0:1).replace(/\.0$/,"")+"k";
  return n.toString();
};
