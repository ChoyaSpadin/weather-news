import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, MapPin } from "lucide-react";
import WeatherIcon from "./WeatherIcon.jsx";
import { item } from "../lib/motion.js";
import { useCountUp } from "../hooks/useCountUp.js";
import { formatLongDate, formatTemp, formatTime, toUnit } from "../lib/format.js";

export default function CurrentWeather({ current, timezone, isDay, unit }) {
  const w = current.weather[0];
  const temp = useCountUp(toUnit(current.main.temp, unit));

  return (
    <motion.section
      variants={item}
      className="glass relative overflow-hidden p-6 sm:p-8"
      aria-labelledby="current-city"
    >
      <div className="flex flex-col-reverse items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm text-white/70">
            <MapPin className="size-4" aria-hidden="true" />
            {current.sys.country}
            <span aria-hidden="true">·</span>
            <span>{formatLongDate(current.dt, timezone)}</span>
            <span aria-hidden="true">·</span>
            {formatTime(current.dt, timezone)}
          </p>
          <AnimatePresence mode="wait">
            <motion.h1
              key={current.id}
              id="current-city"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              className="mt-1 truncate text-3xl font-semibold tracking-tight sm:text-4xl"
            >
              {current.name}
            </motion.h1>
          </AnimatePresence>

          <div className="mt-4 flex items-start">
            <span
              className="text-8xl leading-none font-extralight tracking-tighter tabular-nums sm:text-9xl"
              aria-label={`${Math.round(toUnit(current.main.temp, unit))} graus`}
            >
              {Math.round(temp)}
            </span>
            <span className="mt-2 text-4xl font-light text-white/80">°{unit}</span>
          </div>

          <p className="mt-3 text-lg first-letter:uppercase">{w.description}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70">
            <span className="flex items-center gap-1">
              <ArrowUp className="size-3.5" aria-hidden="true" />
              Máx {formatTemp(current.main.temp_max, unit)}
            </span>
            <span className="flex items-center gap-1">
              <ArrowDown className="size-3.5" aria-hidden="true" />
              Mín {formatTemp(current.main.temp_min, unit)}
            </span>
            <span>Sensação {formatTemp(current.main.feels_like, unit)}</span>
          </p>
        </div>

        <motion.div
          key={`${w.id}-${isDay}`}
          initial={{ scale: 0.6, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 90, damping: 12 }}
          className="self-center sm:self-auto"
        >
          <WeatherIcon code={w.id} isDay={isDay} size={176} />
        </motion.div>
      </div>
    </motion.section>
  );
}
