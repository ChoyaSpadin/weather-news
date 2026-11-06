# CONTEXT — weather-news

App de clima + previsão + mapa + notícias por cidade. React 19 + Vite 7 + Tailwind 4 + Motion; backend serverless na Vercel (`api/`).

## Mapa de arquivos
- `api/weather.js`, `api/geo.js`, `api/news.js`: funções Vercel (finas, só chamam `toVercel`).
- `api/_lib/handlers.js`: lógica real. `handler(query, env, fetch) -> { status, body, cache }`; `run()` converte erros (`HttpError`) em JSON `{ error }`.
- `api/_lib/devServer.js`: plugin do Vite que serve `/api/*` no dev; `MOCK_API=1` usa `mock.js`.
- `src/App.jsx`: layout, estado (unidade, recentes, última cidade em localStorage), geolocalização.
- `src/hooks/useWeather.js`: carrega clima e depois notícias; cancela requisições antigas.
- `src/lib/`: `api.js` (fetch do /api), `format.js` (datas no fuso da cidade), `forecast.js` (agrupa 3h em dias), `scene.js` (código OWM -> cenário/gradiente), `motion.js` (variants).
- `src/components/`: `Scene` (fundo animado), `SearchBar`, `CurrentWeather`, `HourlyForecast`, `DailyForecast`, `Details` (tiles + arco do sol), `MapCard` (Leaflet, lazy), `NewsList`, `Card`/`Skeleton`, `WeatherIcon` (SVG animado, feito pelo Antigravity).

## Contratos
- `/api/weather?q=` ou `?lat=&lon=` -> `{ current, forecast: { list, city } }` (OWM metric, pt_br).
- `/api/geo?q=` -> `[{ name, state, country, lat, lon }]`; `?lat=&lon=` -> reverso.
- `/api/news?q=` -> `[{ title, description, url, image, publishedAt, source }]`.
- Env (só servidor, sem prefixo VITE_): `OPENWEATHER_KEY`, `GNEWS_KEY`.

## Comandos
`npm run dev:mock` (sem chaves) · `npm run dev` · `npm test` · `npm run lint` · `npm run build`. CI em `.github/workflows/ci.yml`.

## Estado (2026-11-05)
- v2 reescrita do zero. Repo público desde 2026-11-05. Branch `site-desativado` (tinha chaves no bundle), deploys antigos e ambiente `github-pages` apagados; Pages desligado.
- Mapa usa tiles do OSM com filtro CSS escuro (CARTO passou a exigir chave).

## Próximos passos
- Chave do Google Maps apagada; trocar as do OpenWeather e GNews no deploy.
- Deploy na Vercel com as variáveis de ambiente; depois pôr link e print no README.
