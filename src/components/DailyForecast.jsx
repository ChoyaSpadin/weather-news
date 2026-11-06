import { motion } from "motion/react";
import { CalendarDays, Droplets } from "lucide-react";
import Card from "./Card.jsx";
import WeatherIcon from "./WeatherIcon.jsx";
import { formatTemp, formatWeekday, localDayKey } from "../lib/format.js";
import { dailySummary } from "../lib/forecast.js";

export default function DailyForecast({ list, timezone, unit, now }) {
  const today = localDayKey(now, timezone);
  const days = dailySummary(list, timezone, 5);
  const lo = Math.min(...days.map((d) => d.min));
  const hi = Math.max(...days.map((d) => d.max));
  const span = hi - lo || 1;

  return (
    <Card title="Próximos 5 dias" icon={CalendarDays}>
      <ol className="divide-y divide-white/10">
        {days.map((d, i) => (
          <li key={d.dt} className="grid grid-cols-[3.5rem_2.5rem_1fr] items-center gap-3 py-2.5">
            <span className="font-medium capitalize">{localDayKey(d.dt, timezone) === today ? "Hoje" : formatWeekday(d.dt, timezone)}</span>
            <div className="flex flex-col items-center">
              <WeatherIcon code={d.weather.id} size={36} />
              {d.pop >= 0.2 && (
                <span className="flex items-center gap-0.5 text-[10px] text-sky-200">
                  <Droplets className="size-2.5" aria-hidden="true" />
                  {Math.round(d.pop * 100)}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm tabular-nums">
              <span className="w-9 text-right text-white/60">{formatTemp(d.min, unit)}</span>
              <div className="relative h-1.5 flex-1 rounded-full bg-white/10">
                <motion.div
                  className="absolute inset-y-0 rounded-full bg-gradient-to-r from-sky-300 via-amber-200 to-orange-400"
                  style={{ left: `${((d.min - lo) / span) * 100}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${((d.max - d.min) / span) * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.08, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <span className="w-9">{formatTemp(d.max, unit)}</span>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
