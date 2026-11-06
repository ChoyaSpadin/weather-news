import { useId } from "react";
import { motion, useReducedMotion } from "motion/react";

const LABELS = {
  "clear-day": "Céu limpo",
  "clear-night": "Céu limpo à noite",
  "few-day": "Poucas nuvens",
  "few-night": "Poucas nuvens à noite",
  clouds: "Nublado",
  drizzle: "Garoa",
  rain: "Chuva",
  storm: "Trovoada",
  snow: "Neve",
  mist: "Névoa",
};

// Classifica o código da OpenWeather nas 10 categorias visuais
// eslint-disable-next-line react-refresh/only-export-components
export function getCategory(code, isDay = true) {
  const num = typeof code === "number" ? code : Number(code);
  if (!Number.isFinite(num)) return "clouds";
  if (num === 800) return isDay ? "clear-day" : "clear-night";
  if (num === 801) return isDay ? "few-day" : "few-night";
  if (num >= 802 && num <= 804) return "clouds";
  if (num >= 200 && num < 300) return "storm";
  if (num >= 300 && num < 400) return "drizzle";
  if (num === 511 || (num >= 600 && num < 700)) return "snow";
  if (num >= 500 && num < 600) return "rain";
  if (num >= 700 && num < 800) return "mist";
  return "clouds";
}

const RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

function Sun({ uid, cx = 32, cy = 32, r = 11, rayInner = 15, rayOuter = 21, reduced }) {
  return (
    <g>
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={reduced ? undefined : { rotate: 360 }}
        transition={reduced ? undefined : { duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {RAYS.map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = cx + Math.cos(rad) * rayInner;
          const y1 = cy + Math.sin(rad) * rayInner;
          const x2 = cx + Math.cos(rad) * rayOuter;
          const y2 = cy + Math.sin(rad) * rayOuter;
          return (
            <line
              key={angle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={`url(#${uid}-sun-ray)`}
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          );
        })}
      </motion.g>
      <motion.circle
        cx={cx}
        cy={cy}
        r={r}
        fill={`url(#${uid}-sun-core)`}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        animate={reduced ? undefined : { scale: [1, 1.07, 1] }}
        transition={reduced ? undefined : { duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </g>
  );
}

function Moon({ uid, small = false, reduced }) {
  const stars = small
    ? [
        { cx: 14, cy: 16, r: 1.3, duration: 2.4, delay: 0 },
        { cx: 48, cy: 14, r: 1.5, duration: 3.1, delay: 0.8 },
      ]
    : [
        { cx: 15, cy: 18, r: 1.5, duration: 2.3, delay: 0 },
        { cx: 49, cy: 15, r: 1.8, duration: 3.2, delay: 0.6 },
        { cx: 46, cy: 28, r: 1.3, duration: 2.7, delay: 1.3 },
      ];

  return (
    <g>
      {stars.map((s, idx) => (
        <motion.circle
          key={idx}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#FEF9C3"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={reduced ? undefined : { opacity: [0.25, 1, 0.25], scale: [0.85, 1.15, 0.85] }}
          transition={
            reduced
              ? undefined
              : { duration: s.duration, delay: s.delay, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}
      <g transform={small ? "translate(10, 4) scale(0.72)" : undefined}>
        <path
          d="M36.5 16c-7.5 1.2-13 7.7-13 15.5 0 8.7 7 15.7 15.7 15.7 5.2 0 9.8-2.5 12.7-6.4-1.8.6-3.7.9-5.7.9-9.1 0-16.5-7.4-16.5-16.5 0-3.4 1-6.6 2.8-9.2Z"
          fill={`url(#${uid}-moon)`}
        />
      </g>
    </g>
  );
}

function Cloud({
  uid,
  variant = "white",
  transform,
  drift = 2,
  duration = 6,
  delay = 0,
  reduced,
}) {
  const fillMap = {
    white: `url(#${uid}-cloud-white)`,
    light: `url(#${uid}-cloud-light)`,
    dark: `url(#${uid}-cloud-dark)`,
    storm: `url(#${uid}-cloud-storm)`,
  };

  return (
    <motion.g
      animate={reduced ? undefined : { x: [-drift, drift, -drift] }}
      transition={
        reduced ? undefined : { duration, delay, repeat: Infinity, ease: "easeInOut" }
      }
    >
      <g transform={transform}>
        <path
          d="M19 42h25.5a8.5 8.5 0 0 0 1.3-16.9A11.5 11.5 0 0 0 23.6 21a8.5 8.5 0 0 0-4.6 21Z"
          fill={fillMap[variant] || fillMap.white}
        />
      </g>
    </motion.g>
  );
}

function DrizzleDrops({ uid, reduced }) {
  const drops = [
    { x: 23, y: 45, delay: 0 },
    { x: 32, y: 46, delay: 0.45 },
    { x: 41, y: 45, delay: 0.9 },
  ];

  return (
    <g>
      {drops.map((d, idx) => (
        <motion.line
          key={idx}
          x1={d.x}
          y1={d.y}
          x2={d.x - 1}
          y2={d.y + 4}
          stroke={`url(#${uid}-rain)`}
          strokeWidth="2.4"
          strokeLinecap="round"
          animate={reduced ? undefined : { y: [0, 8], opacity: [0, 1, 0] }}
          transition={
            reduced
              ? undefined
              : { duration: 1.4, delay: d.delay, repeat: Infinity, ease: "easeIn" }
          }
        />
      ))}
    </g>
  );
}

function RainDrops({ uid, count = 5, reduced }) {
  const allDrops = [
    { x: 20, y: 44, delay: 0 },
    { x: 26, y: 45, delay: 0.25 },
    { x: 32, y: 44, delay: 0.5 },
    { x: 38, y: 45, delay: 0.75 },
    { x: 44, y: 44, delay: 1.0 },
  ];
  const drops = count === 3 ? [allDrops[0], allDrops[2], allDrops[4]] : allDrops;

  return (
    <g>
      {drops.map((d, idx) => (
        <motion.line
          key={idx}
          x1={d.x}
          y1={d.y}
          x2={d.x - 2.5}
          y2={d.y + 7}
          stroke={`url(#${uid}-rain)`}
          strokeWidth="2.3"
          strokeLinecap="round"
          animate={reduced ? undefined : { x: [0, -2.5], y: [0, 9], opacity: [0, 1, 0] }}
          transition={
            reduced
              ? undefined
              : { duration: 1.1, delay: d.delay, repeat: Infinity, ease: "linear" }
          }
        />
      ))}
    </g>
  );
}

function Lightning({ uid, reduced }) {
  return (
    <motion.path
      d="M33 38 26.5 48.5h5.2L29.5 58 40 46.2h-5.3L37 38Z"
      fill={`url(#${uid}-bolt)`}
      animate={reduced ? undefined : { opacity: [0, 1, 0.25, 1, 0, 0] }}
      transition={
        reduced
          ? undefined
          : {
              duration: 3,
              times: [0, 0.06, 0.12, 0.18, 0.28, 1],
              repeat: Infinity,
              ease: "easeInOut",
            }
      }
    />
  );
}

function SnowFlakes({ reduced }) {
  const flakes = [
    { cx: 21, cy: 46, delay: 0 },
    { cx: 29, cy: 48, delay: 0.5 },
    { cx: 37, cy: 46, delay: 1.0 },
    { cx: 44, cy: 48, delay: 1.5 },
  ];

  return (
    <g>
      {flakes.map((f, idx) => (
        <motion.g
          key={idx}
          animate={
            reduced
              ? undefined
              : { y: [0, 9], x: [-1.8, 1.8, -1.8], opacity: [0, 1, 1, 0] }
          }
          transition={
            reduced
              ? undefined
              : { duration: 2.6, delay: f.delay, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <circle cx={f.cx} cy={f.cy} r="2" fill="#E0F2FE" />
          <line
            x1={f.cx - 2.8}
            y1={f.cy}
            x2={f.cx + 2.8}
            y2={f.cy}
            stroke="#BAE6FD"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <line
            x1={f.cx}
            y1={f.cy - 2.8}
            x2={f.cx}
            y2={f.cy + 2.8}
            stroke="#BAE6FD"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </motion.g>
      ))}
    </g>
  );
}

function MistLines({ uid, reduced }) {
  const lines = [
    { x1: 14, x2: 48, y: 24, drift: 3, duration: 5 },
    { x1: 18, x2: 52, y: 33, drift: -3, duration: 6 },
    { x1: 12, x2: 45, y: 42, drift: 2.5, duration: 5.5 },
  ];

  return (
    <g>
      {lines.map((l, idx) => (
        <motion.line
          key={idx}
          x1={l.x1}
          y1={l.y}
          x2={l.x2}
          y2={l.y}
          stroke={`url(#${uid}-mist)`}
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.82"
          animate={reduced ? undefined : { x: [-l.drift, l.drift, -l.drift] }}
          transition={
            reduced
              ? undefined
              : { duration: l.duration, repeat: Infinity, ease: "easeInOut" }
          }
        />
      ))}
    </g>
  );
}

export default function WeatherIcon({ code, isDay = true, size = 96, className = "" }) {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const uid = `wi-${rawId}`;
  const reduced = Boolean(useReducedMotion());
  const category = getCategory(code, isDay);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      role="img"
      aria-label={LABELS[category]}
      className={`drop-shadow-md ${className}`.trim()}
    >
      <defs>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0F172A" floodOpacity="0.28" />
        </filter>
        <radialGradient id={`${uid}-sun-core`} cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFF7AE" />
          <stop offset="55%" stopColor="#FFC72C" />
          <stop offset="100%" stopColor="#FF8C00" />
        </radialGradient>
        <linearGradient id={`${uid}-sun-ray`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#FF9800" />
        </linearGradient>
        <linearGradient id={`${uid}-moon`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="55%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
        <linearGradient id={`${uid}-cloud-white`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#DCE6F2" />
        </linearGradient>
        <linearGradient id={`${uid}-cloud-light`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
        <linearGradient id={`${uid}-cloud-dark`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id={`${uid}-cloud-storm`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id={`${uid}-rain`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id={`${uid}-bolt`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        {/* userSpaceOnUse: linhas horizontais têm altura 0 e somem com o padrão objectBoundingBox */}
        <linearGradient id={`${uid}-mist`} gradientUnits="userSpaceOnUse" x1="10" y1="0" x2="54" y2="0">
          <stop offset="0%" stopColor="#E2E8F0" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
      </defs>

      <g filter={`url(#${uid}-shadow)`}>
        {category === "clear-day" && <Sun uid={uid} reduced={reduced} />}

        {category === "clear-night" && <Moon uid={uid} reduced={reduced} />}

        {category === "few-day" && (
          <>
            <Sun
              uid={uid}
              cx={24}
              cy={22}
              r={8}
              rayInner={11}
              rayOuter={15}
              reduced={reduced}
            />
            <Cloud
              uid={uid}
              variant="white"
              transform="translate(2, 4)"
              drift={2}
              duration={6}
              reduced={reduced}
            />
          </>
        )}

        {category === "few-night" && (
          <>
            <Moon uid={uid} small reduced={reduced} />
            <Cloud
              uid={uid}
              variant="white"
              transform="translate(2, 4)"
              drift={2}
              duration={6}
              reduced={reduced}
            />
          </>
        )}

        {category === "clouds" && (
          <>
            <Cloud
              uid={uid}
              variant="light"
              transform="translate(6, -6) scale(0.88)"
              drift={-2.5}
              duration={7.5}
              reduced={reduced}
            />
            <Cloud
              uid={uid}
              variant="white"
              transform="translate(-2, 3)"
              drift={2}
              duration={5.5}
              reduced={reduced}
            />
          </>
        )}

        {category === "drizzle" && (
          <>
            <Cloud
              uid={uid}
              variant="light"
              transform="translate(0, -2)"
              drift={1.8}
              duration={6}
              reduced={reduced}
            />
            <DrizzleDrops uid={uid} reduced={reduced} />
          </>
        )}

        {category === "rain" && (
          <>
            <Cloud
              uid={uid}
              variant="dark"
              transform="translate(0, -3)"
              drift={1.8}
              duration={5.5}
              reduced={reduced}
            />
            <RainDrops uid={uid} count={5} reduced={reduced} />
          </>
        )}

        {category === "storm" && (
          <>
            <Cloud
              uid={uid}
              variant="storm"
              transform="translate(0, -4)"
              drift={1.8}
              duration={5}
              reduced={reduced}
            />
            <RainDrops uid={uid} count={3} reduced={reduced} />
            <Lightning uid={uid} reduced={reduced} />
          </>
        )}

        {category === "snow" && (
          <>
            <Cloud
              uid={uid}
              variant="light"
              transform="translate(0, -3)"
              drift={1.8}
              duration={6}
              reduced={reduced}
            />
            <SnowFlakes reduced={reduced} />
          </>
        )}

        {category === "mist" && <MistLines uid={uid} reduced={reduced} />}
      </g>
    </svg>
  );
}
