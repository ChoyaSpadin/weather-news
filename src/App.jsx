import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CloudOff, Map as MapIcon, RotateCw } from "lucide-react";
import Scene from "./components/Scene.jsx";
import SearchBar from "./components/SearchBar.jsx";
import CurrentWeather from "./components/CurrentWeather.jsx";
import HourlyForecast from "./components/HourlyForecast.jsx";
import DailyForecast from "./components/DailyForecast.jsx";
import Details from "./components/Details.jsx";
import NewsList from "./components/NewsList.jsx";
import Card, { Skeleton } from "./components/Card.jsx";
import { useWeather } from "./hooks/useWeather.js";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import { getScene, isDaytime } from "./lib/scene.js";
import { container } from "./lib/motion.js";

// O mapa (Leaflet) só é baixado quando for exibido.
const MapCard = lazy(() => import("./components/MapCard.jsx"));

const DEFAULT_LOCATION = { lat: -23.5505, lon: -46.6333, label: "São Paulo" };
const MAX_RECENT = 5;

function UnitToggle({ unit, setUnit }) {
  return (
    <div role="radiogroup" aria-label="Unidade de temperatura" className="glass relative flex rounded-full p-1">
      {["C", "F"].map((u) => (
        <button
          key={u}
          role="radio"
          aria-checked={unit === u}
          onClick={() => setUnit(u)}
          className="relative z-10 grid size-9 place-items-center rounded-full text-sm font-medium"
        >
          {unit === u && (
            <motion.span
              layoutId="unit-pill"
              className="absolute inset-0 -z-10 rounded-full bg-white/25"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          °{u}
        </button>
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid gap-4 lg:grid-cols-3" aria-busy="true" aria-label="Carregando">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-44 rounded-3xl" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-80 rounded-3xl" />
        <Skeleton className="h-36 rounded-3xl" />
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass mx-auto flex max-w-md flex-col items-center gap-3 p-8 text-center"
      role="alert"
    >
      <CloudOff className="size-10 text-white/70" aria-hidden="true" />
      <p className="text-lg font-medium">{message}</p>
      <p className="text-sm text-white/60">Confira o nome da cidade ou tente novamente.</p>
      <button
        onClick={onRetry}
        className="mt-2 flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/30"
      >
        <RotateCw className="size-4" aria-hidden="true" /> Tentar de novo
      </button>
    </motion.div>
  );
}

export default function App() {
  const { weather, news, load } = useWeather();
  const [unit, setUnit] = useLocalStorage("unit", "C");
  const [recent, setRecent] = useLocalStorage("recent-places", []);
  const [lastLocation, setLastLocation] = useLocalStorage("last-location", DEFAULT_LOCATION);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const searchSeq = useRef(0); // invalida pedidos de localização antigos

  const search = useCallback(
    (location) => {
      searchSeq.current += 1;
      setGeoError(null);
      setLastLocation(location);
      load(location);
    },
    [load, setLastLocation],
  );

  // Primeira carga: última cidade vista (ou São Paulo).
  useEffect(() => {
    load(lastLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guarda as cidades carregadas com sucesso como "recentes".
  const data = weather.data;
  useEffect(() => {
    if (weather.status !== "success") return;
    const { name, coord, sys } = data.current;
    const place = { name, country: sys.country, lat: coord.lat, lon: coord.lon };
    setRecent((prev) =>
      [place, ...prev.filter((p) => p.name !== name || p.country !== sys.country)].slice(0, MAX_RECENT),
    );
  }, [weather.status, data, setRecent]);

  function locate() {
    if (!("geolocation" in navigator)) {
      setGeoError("Seu navegador não permite localização.");
      return;
    }
    setLocating(true);
    const seq = searchSeq.current;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        if (seq !== searchSeq.current) return; // usuário já buscou outra cidade
        search({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        if (seq !== searchSeq.current) return;
        setGeoError("Não foi possível obter sua localização. Verifique a permissão do navegador.");
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  }

  const current = data?.current;
  const timezone = current?.timezone ?? 0;
  const isDay = current ? isDaytime(current) : true;
  const scene = current ? getScene(current.weather[0].id, isDay) : "idle";
  const firstLoad = weather.status === "loading" && !data;

  return (
    <>
      <Scene scene={scene} />

      <div className="mx-auto flex min-h-dvh max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-10">
        <header className="flex flex-wrap items-center gap-4">
          <a href="./" className="mr-auto flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="grid size-9 place-items-center rounded-xl bg-white/15 text-xl ring-1 ring-white/20">
              🌤️
            </span>
            Weather News
          </a>
          <div className="order-last w-full sm:order-none sm:w-auto sm:flex-1 sm:justify-center sm:flex">
            <SearchBar onSelect={search} onLocate={locate} locating={locating} recent={recent} />
          </div>
          <UnitToggle unit={unit} setUnit={setUnit} />
        </header>

        <AnimatePresence>
          {geoError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              role="status"
              className="text-center text-sm text-amber-100"
            >
              {geoError}
            </motion.p>
          )}
        </AnimatePresence>

        <main className="flex-1">
          {firstLoad && <LoadingState />}

          {weather.status === "error" && (
            <ErrorState message={weather.error} onRetry={() => load(lastLocation)} />
          )}

          {current && weather.status !== "error" && (
            <motion.div
              key={current.id}
              variants={container}
              initial="hidden"
              animate="show"
              className={`grid gap-4 transition-opacity lg:grid-cols-3 ${
                weather.status === "loading" ? "opacity-60" : ""
              }`}
            >
              <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
                <CurrentWeather current={current} timezone={timezone} isDay={isDay} unit={unit} />
                <HourlyForecast list={data.forecast.list} timezone={timezone} unit={unit} />
                <Details current={current} timezone={timezone} unit={unit} />
              </div>

              <div className="flex min-w-0 flex-col gap-4">
                <DailyForecast list={data.forecast.list} timezone={timezone} unit={unit} now={current.dt} />
                <Card title="Mapa" icon={MapIcon} className="flex flex-1 flex-col overflow-hidden">
                  <div className="-mx-5 -mb-5 flex-1 overflow-hidden rounded-b-3xl">
                    <Suspense fallback={<Skeleton className="h-64 rounded-none" />}>
                      <MapCard lat={current.coord.lat} lon={current.coord.lon} />
                    </Suspense>
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-3">
                <NewsList city={current.name} news={news} />
              </div>
            </motion.div>
          )}
        </main>

        <footer className="text-center text-xs text-white/50">
          Dados de{" "}
          <a className="underline hover:text-white" href="https://openweathermap.org/" target="_blank" rel="noreferrer">
            OpenWeather
          </a>
          ,{" "}
          <a className="underline hover:text-white" href="https://gnews.io/" target="_blank" rel="noreferrer">
            GNews
          </a>{" "}
          e{" "}
          <a className="underline hover:text-white" href="https://www.openstreetmap.org/" target="_blank" rel="noreferrer">
            OpenStreetMap
          </a>
          {" · "}
          <a
            className="underline hover:text-white"
            href="https://github.com/ChoyaSpadin/weather-news"
            target="_blank"
            rel="noreferrer"
          >
            Código no GitHub
          </a>
        </footer>
      </div>
    </>
  );
}
