// Decide o "cenário" de fundo a partir do código de clima da OpenWeather.

export function isDaytime(current) {
  const { dt, sys } = current;
  return dt >= sys.sunrise && dt < sys.sunset;
}

export function getScene(code, isDay) {
  if (code >= 200 && code < 300) return "storm";
  if ((code >= 300 && code < 600 && code !== 511)) return isDay ? "rain" : "rain-night";
  if ((code >= 600 && code < 700) || code === 511) return "snow";
  if (code >= 700 && code < 800) return "mist";
  if (code === 800 || code === 801) return isDay ? "clear-day" : "clear-night";
  return isDay ? "clouds" : "clouds-night";
}

export const SCENES = {
  "clear-day": "from-sky-400 via-blue-500 to-indigo-700",
  "clear-night": "from-slate-950 via-indigo-950 to-violet-950",
  clouds: "from-slate-400 via-slate-500 to-slate-700",
  "clouds-night": "from-slate-800 via-slate-900 to-zinc-950",
  rain: "from-slate-600 via-blue-900 to-slate-900",
  "rain-night": "from-slate-900 via-blue-950 to-black",
  storm: "from-zinc-900 via-violet-950 to-black",
  snow: "from-slate-300 via-sky-500 to-slate-700",
  mist: "from-zinc-400 via-stone-500 to-zinc-700",
  idle: "from-indigo-950 via-slate-900 to-sky-950",
};
