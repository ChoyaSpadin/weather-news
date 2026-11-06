import { motion } from "motion/react";
import { Cloud, Droplet, Eye, Gauge, Navigation, Sunrise, Thermometer } from "lucide-react";
import { item } from "../lib/motion.js";
import { formatTemp, formatTime, windDirection } from "../lib/format.js";

function Tile({ icon: Icon, label, children, className = "" }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ y: -3 }}
      className={`glass flex flex-col gap-2 rounded-2xl p-4 ${className}`}
    >
      <span className="flex items-center gap-1.5 text-xs font-medium tracking-wider text-white/60 uppercase">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </span>
      {children}
    </motion.div>
  );
}

function Bar({ value }) {
  return (
    <div className="mt-auto h-1.5 rounded-full bg-white/10">
      <motion.div
        className="h-full rounded-full bg-white/80"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

/** Arco do sol: mostra onde o sol está entre o nascer e o pôr. */
function SunArc({ sunrise, sunset, now }) {
  const progress = Math.min(1, Math.max(0, (now - sunrise) / (sunset - sunrise)));
  const angle = Math.PI * (1 - progress);
  const x = 50 + 40 * Math.cos(angle);
  const y = 50 - 40 * Math.sin(angle);
  return (
    <svg viewBox="0 0 100 56" className="w-full" aria-hidden="true">
      <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="2 3" />
      <motion.path
        d="M10 50 A40 40 0 0 1 90 50"
        fill="none"
        stroke="url(#arc)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: progress }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />
      <defs>
        <linearGradient id="arc">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#fb923c" />
        </linearGradient>
      </defs>
      <line x1="4" y1="50" x2="96" y2="50" stroke="currentColor" strokeOpacity="0.3" />
      {progress > 0 && progress < 1 && (
        <motion.circle
          r="4"
          fill="#fde047"
          initial={{ cx: 10, cy: 50, opacity: 0 }}
          animate={{ cx: x, cy: y, opacity: 1 }}
          transition={{ duration: 1.4, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 4px #fde047)" }}
        />
      )}
    </svg>
  );
}

export default function Details({ current, timezone, unit }) {
  const { main, wind, sys, clouds, visibility } = current;
  const kmh = Math.round(wind.speed * 3.6);

  return (
    <section aria-label="Detalhes" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Tile icon={Thermometer} label="Sensação">
        <span className="text-3xl font-light">{formatTemp(main.feels_like, unit)}</span>
        <span className="text-xs text-white/60">
          {main.feels_like > main.temp + 1
            ? "Parece mais quente"
            : main.feels_like < main.temp - 1
              ? "Parece mais frio"
              : "Igual à real"}
        </span>
      </Tile>

      <Tile icon={Droplet} label="Umidade">
        <span className="text-3xl font-light">{main.humidity}%</span>
        <Bar value={main.humidity} />
      </Tile>

      <Tile icon={Navigation} label="Vento">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-light">
            {kmh}
            <span className="ml-1 text-sm text-white/60">km/h</span>
          </span>
          <div className="relative grid size-11 place-items-center rounded-full ring-1 ring-white/20">
            <span className="absolute top-0.5 text-[8px] text-white/50">N</span>
            <motion.div
              initial={{ rotate: 0 }}
              // o ícone aponta para nordeste (45°); a seta mostra para onde o vento sopra
              animate={{ rotate: (wind.deg + 180 - 45) % 360 }}
              transition={{ type: "spring", stiffness: 40, damping: 8 }}
            >
              <Navigation className="size-4 fill-white" aria-hidden="true" />
            </motion.div>
          </div>
        </div>
        <span className="text-xs text-white/60">
          De {windDirection(wind.deg)}
          {wind.gust ? ` · rajadas ${Math.round(wind.gust * 3.6)} km/h` : ""}
        </span>
      </Tile>

      <Tile icon={Gauge} label="Pressão">
        <span className="text-3xl font-light">
          {main.pressure}
          <span className="ml-1 text-sm text-white/60">hPa</span>
        </span>
      </Tile>

      <Tile icon={Eye} label="Visibilidade">
        <span className="text-3xl font-light">
          {visibility != null ? (visibility / 1000).toFixed(visibility < 10000 ? 1 : 0) : "—"}
          <span className="ml-1 text-sm text-white/60">km</span>
        </span>
      </Tile>

      <Tile icon={Cloud} label="Nuvens">
        <span className="text-3xl font-light">{clouds.all}%</span>
        <Bar value={clouds.all} />
      </Tile>

      <Tile icon={Sunrise} label="Sol" className="col-span-2 sm:col-span-3">
        <div className="mx-auto w-full max-w-xs">
          <SunArc sunrise={sys.sunrise} sunset={sys.sunset} now={current.dt} />
        </div>
        <div className="flex justify-between text-sm">
          <span>
            <span className="text-white/60">Nascer </span>
            {formatTime(sys.sunrise, timezone)}
          </span>
          <span>
            <span className="text-white/60">Pôr </span>
            {formatTime(sys.sunset, timezone)}
          </span>
        </div>
      </Tile>
    </section>
  );
}
