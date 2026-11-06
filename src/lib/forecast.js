import { localDayKey } from "./format.js";

/** Próximas `count` entradas da previsão (de 3 em 3 horas). */
export function nextHours(list, count = 8) {
  return list.slice(0, count);
}

/**
 * Agrupa a previsão de 3h por dia local da cidade.
 * Retorna até `days` dias com min, max, chance máxima de chuva e o clima mais perto do meio-dia.
 */
export function dailySummary(list, tz = 0, days = 5) {
  const groups = new Map();
  for (const item of list) {
    const key = localDayKey(item.dt, tz);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return [...groups.values()].slice(0, days).map((items) => {
    const noon = items.reduce((best, it) => {
      const hour = new Date((it.dt + tz) * 1000).getUTCHours();
      const bestHour = new Date((best.dt + tz) * 1000).getUTCHours();
      return Math.abs(hour - 12) < Math.abs(bestHour - 12) ? it : best;
    });
    return {
      dt: items[0].dt,
      min: Math.min(...items.map((i) => i.main.temp_min)),
      max: Math.max(...items.map((i) => i.main.temp_max)),
      pop: Math.max(...items.map((i) => i.pop ?? 0)),
      weather: noon.weather[0],
    };
  });
}
