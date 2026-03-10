export function safeDate(date?: Date | string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleString();
}
