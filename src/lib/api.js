// Chamadas ao nosso backend (/api/*). As chaves nunca passam pelo navegador.

async function request(path, params, signal) {
  const qs = new URLSearchParams(params);
  const res = await fetch(`${path}?${qs}`, { signal });
  const data = await res.json().catch((err) => {
    if (signal?.aborted) throw err;
    return null;
  });
  if (!res.ok || data == null) throw new Error(data?.error ?? "Não foi possível carregar os dados");
  return data;
}

/** location: { lat, lon } ou { q } */
const toParams = (loc) => (loc.lat != null ? { lat: loc.lat, lon: loc.lon } : { q: loc.q });

export const fetchWeather = (loc, signal) => request("/api/weather", toParams(loc), signal);
export const searchPlaces = (q, signal) => request("/api/geo", { q }, signal);
export const reversePlace = (lat, lon, signal) => request("/api/geo", { lat, lon }, signal);
export const fetchNews = (q, signal) => request("/api/news", { q }, signal);
