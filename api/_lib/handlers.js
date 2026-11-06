// Lógica do backend, independente de plataforma.
// Cada handler recebe (query, env) e devolve { status, body, cache }.
// As chaves ficam só no servidor: nunca use o prefixo VITE_ nelas.

const OWM = "https://api.openweathermap.org";
const GNEWS = "https://gnews.io/api/v4";
const TIMEOUT_MS = 8000;

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function requireKey(env, name) {
  const key = env[name];
  if (!key) throw new HttpError(500, `Variável ${name} não configurada no servidor`);
  return key;
}

function parseText(value, field, max = 80) {
  const text = String(value ?? "").trim();
  if (!text) throw new HttpError(400, `Parâmetro "${field}" é obrigatório`);
  if (text.length > max) throw new HttpError(400, `Parâmetro "${field}" muito longo`);
  return text;
}

function parseCoord(value, field, limit) {
  const n = Number(value);
  if (value === undefined || String(value).trim() === "" || !Number.isFinite(n) || Math.abs(n) > limit) {
    throw new HttpError(400, `Parâmetro "${field}" inválido`);
  }
  return n.toFixed(4);
}

/** Lê lat/lon se vierem, senão exige q. */
export function parseLocation(query) {
  if (query.lat !== undefined || query.lon !== undefined) {
    return { lat: parseCoord(query.lat, "lat", 90), lon: parseCoord(query.lon, "lon", 180) };
  }
  return { q: parseText(query.q, "q") };
}

async function getJson(url, fetchImpl) {
  let res;
  try {
    res = await fetchImpl(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch {
    throw new HttpError(502, "Serviço externo indisponível");
  }
  if (res.status === 404) throw new HttpError(404, "Cidade não encontrada");
  if (res.status === 401 || res.status === 403) {
    throw new HttpError(502, "Chave de API recusada pelo serviço externo");
  }
  if (res.status === 429) throw new HttpError(429, "Limite de requisições atingido, tente mais tarde");
  if (!res.ok) throw new HttpError(502, "Erro no serviço externo");
  return res.json();
}

function owmUrl(path, params, key) {
  const url = new URL(path, OWM);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("appid", key);
  return url;
}

/** Clima atual + previsão (3 em 3 horas, 5 dias). */
export async function weatherHandler(query, env, fetchImpl = fetch) {
  const key = requireKey(env, "OPENWEATHER_KEY");
  const loc = parseLocation(query);
  const params = { ...loc, units: "metric", lang: "pt_br" };
  const [current, forecast] = await Promise.all([
    getJson(owmUrl("/data/2.5/weather", params, key), fetchImpl),
    getJson(owmUrl("/data/2.5/forecast", params, key), fetchImpl),
  ]);
  return {
    status: 200,
    cache: 600,
    body: { current, forecast: { list: forecast.list, city: forecast.city } },
  };
}

/** Autocomplete (q) ou cidade a partir de coordenadas (lat/lon). */
export async function geoHandler(query, env, fetchImpl = fetch) {
  const key = requireKey(env, "OPENWEATHER_KEY");
  const loc = parseLocation(query);
  const url = loc.q
    ? owmUrl("/geo/1.0/direct", { q: loc.q, limit: 5 }, key)
    : owmUrl("/geo/1.0/reverse", { ...loc, limit: 1 }, key);
  const data = await getJson(url, fetchImpl);
  const places = data.map((p) => ({
    name: p.local_names?.pt ?? p.name,
    state: p.state ?? null,
    country: p.country,
    lat: p.lat,
    lon: p.lon,
  }));
  return { status: 200, cache: 86400, body: places };
}

/** Notícias sobre a cidade. */
export async function newsHandler(query, env, fetchImpl = fetch) {
  const key = requireKey(env, "GNEWS_KEY");
  const q = parseText(query.q, "q");
  const url = new URL(`${GNEWS}/search`);
  url.searchParams.set("q", `"${q.replaceAll('"', "")}"`);
  url.searchParams.set("lang", "pt");
  url.searchParams.set("max", "6");
  url.searchParams.set("apikey", key);
  const data = await getJson(url, fetchImpl);
  const articles = (data.articles ?? []).map((a) => ({
    title: a.title,
    description: a.description,
    url: a.url,
    image: a.image,
    publishedAt: a.publishedAt,
    source: a.source?.name ?? "",
  }));
  return { status: 200, cache: 1800, body: articles };
}

/** Executa um handler e converte erros em resposta JSON. */
export async function run(handler, query, env, fetchImpl) {
  try {
    return await handler(query, env, fetchImpl);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    const message = err instanceof HttpError ? err.message : "Erro interno";
    if (!(err instanceof HttpError)) console.error(err);
    return { status, cache: 0, body: { error: message } };
  }
}
