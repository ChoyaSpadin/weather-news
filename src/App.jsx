import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatTime } from "./utils/formatTime";

// Função que decide se usa lat/lon ou q=city
async function getWeather(city, lat = null, lon = null) {
  const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

  let url = "";

  if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${OPENWEATHER_KEY}`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&lang=pt_br&appid=${OPENWEATHER_KEY}`;
  }

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Cidade não encontrada");
  }

  return res.json();
}

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [news, setNews] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCoords, setSelectedCoords] = useState(null);

  const GNEWS_KEY = import.meta.env.VITE_GNEWS_KEY;
  const GOOGLEMAPS_KEY = import.meta.env.VITE_GOOGLEMAPS_KEY;

  // Dark mode
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  async function handleSearch(e) {
    e.preventDefault();
    setError(null);
    setWeather(null);

    try {
      const data = await getWeather(
        city,
        selectedCoords?.lat,
        selectedCoords?.lon
      );
      setWeather(data);
      fetchNews(city);
    } catch (err) {
      setError(err.message);
    }
  }

  // Autocomplete
  async function fetchSuggestions(query) {
    if (!query) {
      setSuggestions([]);
      return;
    }

    const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${OPENWEATHER_KEY}`
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Erro ao buscar sugestões:", err);
    }
  }

  // Notícias (GNews)
  async function fetchNews(cityName) {
    try {
      const res = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(
          cityName
        )}&lang=pt&max=5&token=${GNEWS_KEY}`
      );
      const data = await res.json();
      setNews(data.articles || []);
    } catch (err) {
      console.error("Erro ao buscar notícias:", err);
    }
  }

  // Animação do ícone de tema
  const iconVariants = {
    initial: { scale: 0.8, opacity: 0, rotate: -90 },
    animate: { scale: 1, opacity: 1, rotate: 0 },
    exit: { scale: 0.8, opacity: 0, rotate: 90 },
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-6">
      {/* HEADER */}
      <header className="w-full max-w-6xl flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">🌤️ Weather App</h1>

        <button
          onClick={() => setIsDark((prev) => !prev)}
          className="w-12 h-12 flex items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-md"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.span
                key="moon"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-lg"
              >
                🌙
              </motion.span>
            ) : (
              <motion.span
                key="sun"
                variants={iconVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="text-lg"
              >
                ☀️
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </header>

      {/* FORM */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-2 mb-6 relative w-72"
      >
        <input
          type="text"
          value={city}
          onChange={(e) => {
            const value = e.target.value;
            setCity(value);
            setSelectedCoords(null); // reset coords se o usuário digitar
            fetchSuggestions(value);
          }}
          placeholder="Digite o nome da cidade..."
          className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Buscar
        </button>

        {suggestions.length > 0 && (
          <ul className="absolute top-14 left-0 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg w-full max-h-60 overflow-y-auto z-10">
            {suggestions.map((s, i) => (
              <li
                key={i}
                onClick={() => {
                  setCity(s.name);
                  setSuggestions([]);
                  setSelectedCoords({ lat: s.lat, lon: s.lon }); // 🔹 salva coordenadas
                }}
                className="px-4 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                {s.name}, {s.country}
              </li>
            ))}
          </ul>
        )}
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {/* GRID RESPONSIVO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
        {/* CARD DO CLIMA */}
        {weather && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md text-center flex flex-col items-center gap-3"
          >
            <h2 className="text-xl font-semibold">
              {weather.name}, {weather.sys.country}
            </h2>

            <p className="text-3xl font-bold">
              {Math.round(weather.main.temp)}°C
            </p>

            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`}
              alt={weather.weather[0].description}
              className="w-28 h-28"
            />

            <p className="capitalize">{weather.weather[0].description}</p>

            <div className="flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-300">
              <p>Sensação térmica: {Math.round(weather.main.feels_like)}°C</p>
              <p>
                Mín: {Math.round(weather.main.temp_min)}°C | Máx:{" "}
                {Math.round(weather.main.temp_max)}°C
              </p>
              <p>Umidade: {weather.main.humidity}%</p>
            </div>

            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: weather.wind.deg }}
              transition={{ duration: 1 }}
              className="mt-2 flex flex-col items-center text-sm text-slate-600 dark:text-slate-300"
            >
              <p>Vento: {Math.round(weather.wind.speed * 3.6)} km/h</p>
              <span className="text-2xl">🧭</span>
            </motion.div>

            <div className="flex justify-between w-full mt-4 text-sm text-slate-600 dark:text-slate-300">
              <p>🌅 {formatTime(weather.sys.sunrise)}</p>
              <p>🌇 {formatTime(weather.sys.sunset)}</p>
            </div>

            <button
              onClick={() => setShowDetails((prev) => !prev)}
              className="mt-4 px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              {showDetails ? "Esconder detalhes ▲" : "Mostrar detalhes ▼"}
            </button>

            <motion.div
              initial={false}
              animate={{
                height: showDetails ? "auto" : 0,
                opacity: showDetails ? 1 : 0,
              }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden w-full mt-3 text-sm text-slate-600 dark:text-slate-300"
            >
              <div className="flex flex-col gap-2 text-left">
                <p>🌡️ Pressão: {weather.main.pressure} hPa</p>
                <p>👁️ Visibilidade: {weather.visibility / 1000} km</p>
                <p>☁️ Nuvens: {weather.clouds.all}%</p>
                <p>
                  📍 Coordenadas: {weather.coord.lat}, {weather.coord.lon}
                </p>
              </div>
            </motion.div>

            {/* Mapa */}
            <img
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${weather.coord.lat},${weather.coord.lon}&zoom=10&size=600x300&markers=color:red%7C${weather.coord.lat},${weather.coord.lon}&key=${GOOGLEMAPS_KEY}`}
              alt="Mapa da cidade"
              className="rounded-lg shadow-md mt-4"
            />
          </motion.div>
        )}

        {/* CARD DE NOTÍCIAS */}
        {news.length > 0 && (
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md flex flex-col gap-4 max-h-[600px] overflow-y-auto">
            <h2 className="text-xl font-semibold">📰 Notícias em {city}</h2>
            {news.map((article, i) => (
              <a
                key={i}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border-b border-slate-300 dark:border-slate-700 pb-3 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md p-2 transition"
              >
                <h3 className="font-medium">{article.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {article.source.name} -{" "}
                  {new Date(article.publishedAt).toLocaleDateString("pt-BR")}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
