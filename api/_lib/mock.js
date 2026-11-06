// Dados falsos para rodar o app sem chaves: npm run dev:mock
// Só usado pelo servidor local (nunca em produção).

const TZ = -10800; // UTC-3

const CODES = [800, 801, 802, 500, 501, 803, 800, 211, 600, 741];
const DESCRIPTIONS = {
  800: "céu limpo",
  801: "poucas nuvens",
  802: "nuvens dispersas",
  803: "nublado",
  500: "chuva leve",
  501: "chuva moderada",
  211: "trovoada",
  600: "neve fraca",
  741: "névoa",
};

const PLACES = [
  { name: "São Paulo", state: "São Paulo", country: "BR", lat: -23.5505, lon: -46.6333 },
  { name: "Rio de Janeiro", state: "Rio de Janeiro", country: "BR", lat: -22.9068, lon: -43.1729 },
  { name: "Curitiba", state: "Paraná", country: "BR", lat: -25.4284, lon: -49.2733 },
  { name: "Lisboa", state: null, country: "PT", lat: 38.7223, lon: -9.1393 },
];

const SOURCES = ["G1", "Folha", "Estadão", "UOL", "CNN Brasil", "Metrópoles"];

const weatherOf = (code) => [{ id: code, main: "", description: DESCRIPTIONS[code] ?? "nublado", icon: "" }];

function current(place, code, now) {
  const midnight = now - ((now + TZ) % 86400);
  return {
    id: Math.round(place.lat * 1000 + place.lon),
    name: place.name,
    dt: now,
    timezone: TZ,
    coord: { lat: place.lat, lon: place.lon },
    weather: weatherOf(code),
    main: { temp: 24.6, feels_like: 26.1, temp_min: 19.2, temp_max: 28.4, pressure: 1014, humidity: 68 },
    wind: { speed: 4.2, deg: 135, gust: 7.1 },
    clouds: { all: 40 },
    visibility: 10000,
    sys: { country: place.country, sunrise: midnight + 5.5 * 3600, sunset: midnight + 18.25 * 3600 },
  };
}

function forecast(now) {
  const start = now - (now % 10800) + 10800;
  const list = Array.from({ length: 40 }, (_, i) => {
    const dt = start + i * 10800;
    const hour = new Date((dt + TZ) * 1000).getUTCHours();
    const temp = 20 + 6 * Math.sin(((hour - 9) / 24) * 2 * Math.PI) + (i % 7);
    const code = CODES[Math.floor(i / 4) % CODES.length];
    return {
      dt,
      main: { temp, temp_min: temp - 1.5, temp_max: temp + 1.5 },
      weather: weatherOf(code),
      pop: code < 700 ? 0.3 + (i % 5) / 10 : 0,
      sys: { pod: hour >= 6 && hour < 18 ? "d" : "n" },
    };
  });
  return { list, city: { timezone: TZ } };
}

/** query.code (vindo de MOCK_CODE) força o clima atual. */
export function mockResponse(path, query) {
  const now = Math.floor(Date.now() / 1000);
  const code = Number(query.code) || 800;
  const q = String(query.q ?? "").toLowerCase();

  if (path === "/api/weather") {
    const place =
      PLACES.find((p) => q && p.name.toLowerCase().startsWith(q)) ??
      PLACES.find((p) => Math.abs(p.lat - Number(query.lat)) < 0.01) ??
      PLACES[0];
    return { current: current(place, code, now), forecast: forecast(now) };
  }
  if (path === "/api/geo") {
    return query.lat ? [PLACES[0]] : PLACES.filter((p) => p.name.toLowerCase().includes(q));
  }
  if (path === "/api/news") {
    return SOURCES.map((source, i) => ({
      title: `Notícia de exemplo ${i + 1} sobre ${query.q}: um título com tamanho realista para testar o layout`,
      description: "",
      url: `https://example.com/noticia-${i + 1}`,
      image: null,
      publishedAt: new Date(Date.now() - (i + 1) * 5400 * 1000).toISOString(),
      source,
    }));
  }
  return null;
}
