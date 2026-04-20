export const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diff = target - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export const formatDate = (dateStr, format = "dd/MM") => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const pad = n => n.toString().padStart(2, "0");
  
  if (format === "dd/MM") return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
  if (format === "dd/MM/yyyy") return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  if (format === "MM/yyyy") return `${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
};

export const getMonthName = (monthNum) => {
  const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  return months[monthNum - 1] || "DEZ";
};

export const getMonthFromKey = (key) => {
  const months = { JAN:1, FEV:2, MAR:3, ABR:4, MAI:5, JUN:6, JUL:7, AGO:8, SET:9, OUT:10, NOV:11, DEZ:12 };
  return months[key] || 12;
};

export const isToday = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

export const isPast = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

export const isFuture = (dateStr) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d > today;
};