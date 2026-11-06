import { motion } from "motion/react";
import { Clock, Droplets } from "lucide-react";
import Card from "./Card.jsx";
import WeatherIcon from "./WeatherIcon.jsx";
import { formatHour, formatTemp } from "../lib/format.js";
import { nextHours } from "../lib/forecast.js";

export default function HourlyForecast({ list, timezone, unit }) {
  const hours = nextHours(list, 8);
  return (
    <Card title="Próximas 24 horas" icon={Clock}>
      <ol className="scrollbar-none -mx-2 flex snap-x gap-2 overflow-x-auto px-2 pb-1">
        {hours.map((h, i) => (
          <motion.li
            key={h.dt}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            whileHover={{ y: -4 }}
            className="flex min-w-[4.75rem] snap-start flex-col items-center gap-1 rounded-2xl bg-white/5 px-2 py-3 ring-1 ring-white/10"
          >
            <span className="text-xs text-white/70">{formatHour(h.dt, timezone)}</span>
            <WeatherIcon code={h.weather[0].id} isDay={h.sys?.pod !== "n"} size={44} />
            <span className="text-lg font-medium tabular-nums">{formatTemp(h.main.temp, unit)}</span>
            <span
              className={`flex items-center gap-0.5 text-[11px] text-sky-200 ${h.pop >= 0.1 ? "" : "invisible"}`}
            >
              <Droplets className="size-3" aria-hidden="true" />
              {Math.round(h.pop * 100)}%
            </span>
          </motion.li>
        ))}
      </ol>
    </Card>
  );
}
