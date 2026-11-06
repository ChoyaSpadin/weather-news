import { useCallback, useEffect, useRef, useState } from "react";
import { fetchNews, fetchWeather } from "../lib/api.js";

/**
 * Carrega clima + previsão e, em seguida, as notícias da cidade.
 * Requisições antigas são canceladas quando uma nova busca começa.
 */
export function useWeather() {
  const [weather, setWeather] = useState({ status: "idle", data: null, error: null });
  const [news, setNews] = useState({ status: "idle", data: [], error: null });
  const controller = useRef(null);

  const load = useCallback(async (location) => {
    controller.current?.abort();
    const ctrl = new AbortController();
    controller.current = ctrl;

    setWeather((prev) => ({ ...prev, status: "loading", error: null }));
    setNews((prev) => ({ ...prev, status: "loading", error: null }));

    let data;
    try {
      data = await fetchWeather(location, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setWeather({ status: "success", data, error: null });
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setWeather((prev) => ({ ...prev, status: "error", error: err.message }));
      setNews((prev) => ({ ...prev, status: "idle" }));
      return;
    }

    try {
      const articles = await fetchNews(location.label ?? data.current.name, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setNews({ status: "success", data: articles, error: null });
    } catch (err) {
      if (ctrl.signal.aborted) return;
      setNews({ status: "error", data: [], error: err.message });
    }
  }, []);

  useEffect(() => () => controller.current?.abort(), []);

  return { weather, news, load };
}
