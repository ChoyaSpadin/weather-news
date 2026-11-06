import { describe, expect, it } from "vitest";
import { dailySummary, nextHours } from "../src/lib/forecast.js";
import { formatTime, localDayKey, windDirection } from "../src/lib/format.js";
import { getScene } from "../src/lib/scene.js";

const item = (dt, temp, id = 800, pop = 0) => ({
  dt,
  main: { temp, temp_min: temp - 1, temp_max: temp + 1 },
  weather: [{ id }],
  pop,
});

// 2025-01-01 00:00 UTC
const BASE = 1735689600;

describe("dailySummary", () => {
  it("agrupa pelo dia local da cidade, não pelo UTC", () => {
    // 01:00 UTC em UTC-3 ainda é o dia anterior
    const days = dailySummary([item(BASE + 3600, 20), item(BASE + 4 * 3600, 22)], -10800);
    expect(days).toHaveLength(2);
    expect(localDayKey(days[0].dt, -10800)).toBe("2024-12-31");
  });

  it("calcula mínima, máxima, chuva e o clima do meio-dia", () => {
    const list = [item(BASE, 10, 800, 0.1), item(BASE + 12 * 3600, 25, 500, 0.8), item(BASE + 21 * 3600, 15, 801)];
    const [day] = dailySummary(list, 0);
    expect(day.min).toBe(9);
    expect(day.max).toBe(26);
    expect(day.pop).toBe(0.8);
    expect(day.weather.id).toBe(500);
  });

  it("limita a quantidade de dias e de horas", () => {
    const list = Array.from({ length: 48 }, (_, i) => item(BASE + i * 10800, 20));
    expect(dailySummary(list, 0, 5)).toHaveLength(5);
    expect(nextHours(list, 8)).toHaveLength(8);
  });
});

describe("format", () => {
  it("mostra a hora no fuso da cidade", () => {
    expect(formatTime(BASE, -10800)).toBe("21:00");
  });

  it("converte graus em ponto cardeal", () => {
    expect(windDirection(0)).toBe("N");
    expect(windDirection(90)).toBe("L");
    expect(windDirection(350)).toBe("N");
  });
});

describe("getScene", () => {
  it("mapeia códigos da OpenWeather", () => {
    expect(getScene(800, true)).toBe("clear-day");
    expect(getScene(800, false)).toBe("clear-night");
    expect(getScene(211, true)).toBe("storm");
    expect(getScene(511, true)).toBe("snow");
    expect(getScene(741, true)).toBe("mist");
    expect(getScene(804, false)).toBe("clouds-night");
  });
});

describe("fusos com minutos", () => {
  it("mostra minutos quando o horário local não é hora cheia", async () => {
    const { formatHour } = await import("../src/lib/format.js");
    // UTC+5:30
    expect(formatHour(BASE, 19800)).toBe("05:30");
    expect(formatHour(BASE, -10800)).toBe("21h");
  });
});
