// Formatação de datas no fuso da cidade pesquisada (offset em segundos vindo da OpenWeather).

const shift = (unix, tz) => new Date((unix + tz) * 1000);

const fmt = (opts) => new Intl.DateTimeFormat("pt-BR", { ...opts, timeZone: "UTC" });
const timeFmt = fmt({ hour: "2-digit", minute: "2-digit" });
const hourFmt = fmt({ hour: "2-digit" });
const weekdayFmt = fmt({ weekday: "short" });
const longDateFmt = fmt({ weekday: "long", day: "numeric", month: "long" });

export const formatTime = (unix, tz = 0) => timeFmt.format(shift(unix, tz));
export const formatHour = (unix, tz = 0) => {
  const d = shift(unix, tz);
  return d.getUTCMinutes() ? timeFmt.format(d) : `${hourFmt.format(d)}h`;
};
export const formatWeekday = (unix, tz = 0) => weekdayFmt.format(shift(unix, tz)).replace(".", "");
export const formatLongDate = (unix, tz = 0) => {
  const text = longDateFmt.format(shift(unix, tz));
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/** Chave AAAA-MM-DD do dia local da cidade. */
export const localDayKey = (unix, tz = 0) => shift(unix, tz).toISOString().slice(0, 10);

const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
export function formatRelative(iso, now = Date.now()) {
  const diff = (new Date(iso).getTime() - now) / 1000;
  const units = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return "agora";
}

export const toUnit = (celsius, unit) => (unit === "F" ? celsius * 1.8 + 32 : celsius);
export const formatTemp = (celsius, unit) => `${Math.round(toUnit(celsius, unit))}°`;

const DIRECTIONS = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];
export const windDirection = (deg) => DIRECTIONS[Math.round(((deg % 360) / 45)) % 8];
