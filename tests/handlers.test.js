import { describe, expect, it, vi } from "vitest";
import { geoHandler, newsHandler, parseLocation, run, weatherHandler } from "../api/_lib/handlers.js";

const env = { OPENWEATHER_KEY: "owm-test", GNEWS_KEY: "gnews-test" };
const ok = (data) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(data) });

describe("parseLocation", () => {
  it("aceita coordenadas válidas", () => {
    expect(parseLocation({ lat: "-23.55", lon: "-46.63" })).toEqual({ lat: "-23.5500", lon: "-46.6300" });
  });

  it("rejeita coordenadas fora do intervalo ou incompletas", () => {
    expect(() => parseLocation({ lat: "91", lon: "0" })).toThrow();
    expect(() => parseLocation({ lat: "10" })).toThrow();
  });

  it("exige q quando não há coordenadas", () => {
    expect(() => parseLocation({})).toThrow();
    expect(() => parseLocation({ q: "x".repeat(200) })).toThrow();
  });
});

describe("weatherHandler", () => {
  it("busca clima e previsão com a chave do servidor", async () => {
    const fetch = vi.fn((url) => ok(String(url).includes("forecast") ? { list: [1], city: {} } : { name: "X" }));
    const res = await weatherHandler({ q: "São Paulo" }, env, fetch);
    expect(res.body.current.name).toBe("X");
    expect(res.body.forecast.list).toEqual([1]);
    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.searchParams.get("appid")).toBe("owm-test");
    expect(url.searchParams.get("q")).toBe("São Paulo");
  });

  it("devolve 404 amigável", async () => {
    const fetch = () => Promise.resolve({ ok: false, status: 404 });
    const res = await run(weatherHandler, { q: "Atlantis" }, env, fetch);
    expect(res).toMatchObject({ status: 404, body: { error: "Cidade não encontrada" } });
  });

  it("acusa chave ausente sem chamar a API", async () => {
    const fetch = vi.fn();
    const res = await run(weatherHandler, { q: "Rio" }, {}, fetch);
    expect(res.status).toBe(500);
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("geo e news", () => {
  it("prefere o nome em português", async () => {
    const fetch = () => ok([{ name: "Lisbon", local_names: { pt: "Lisboa" }, country: "PT", lat: 1, lon: 2 }]);
    const res = await geoHandler({ q: "lis" }, env, fetch);
    expect(res.body[0].name).toBe("Lisboa");
  });

  it("normaliza artigos do GNews", async () => {
    const fetch = () => ok({ articles: [{ title: "T", url: "u", source: { name: "S" }, publishedAt: "d" }] });
    const res = await newsHandler({ q: "Rio" }, env, fetch);
    expect(res.body[0]).toMatchObject({ title: "T", source: "S" });
  });
});

describe("regressões", () => {
  it("coordenada em branco não vira 0", () => {
    expect(() => parseLocation({ lat: " ", lon: " " })).toThrow();
  });
});
