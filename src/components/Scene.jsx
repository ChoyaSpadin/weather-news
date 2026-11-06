import { useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SCENES } from "../lib/scene.js";

// Números pseudoaleatórios estáveis (mesmo desenho a cada render).
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function useParticles(count, seed) {
  return useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, () => ({
      left: rand() * 110,
      top: rand() * 100,
      delay: -rand() * 10,
      duration: rand(),
      size: rand(),
    }));
  }, [count, seed]);
}

function Rain({ heavy }) {
  const drops = useParticles(heavy ? 90 : 55, 7);
  return drops.map((d, i) => (
    <span
      key={i}
      className="animate-fall absolute top-0 w-px rounded-full bg-gradient-to-b from-transparent to-white/50"
      style={{
        left: `${d.left}%`,
        height: `${40 + d.size * 50}px`,
        animationDuration: `${0.6 + d.duration * 0.6}s`,
        animationDelay: `${d.delay}s`,
      }}
    />
  ));
}

function Snow() {
  const flakes = useParticles(70, 11);
  return flakes.map((f, i) => (
    <span
      key={i}
      className="animate-snowfall absolute top-0 rounded-full bg-white/80 blur-[0.5px]"
      style={{
        left: `${f.left}%`,
        width: `${2 + f.size * 5}px`,
        height: `${2 + f.size * 5}px`,
        animationDuration: `${8 + f.duration * 10}s`,
        animationDelay: `${f.delay}s`,
      }}
    />
  ));
}

function Stars() {
  const stars = useParticles(80, 3);
  return stars.map((s, i) => (
    <span
      key={i}
      className="animate-twinkle absolute rounded-full bg-white"
      style={{
        left: `${s.left}%`,
        top: `${s.top * 0.7}%`,
        width: `${1 + s.size * 2}px`,
        height: `${1 + s.size * 2}px`,
        animationDuration: `${2 + s.duration * 4}s`,
        animationDelay: `${s.delay}s`,
      }}
    />
  ));
}

function Glow({ className, duration = 18 }) {
  return (
    <div
      className={`animate-float absolute rounded-full blur-3xl ${className}`}
      style={{ animationDuration: `${duration}s` }}
    />
  );
}

function Layer({ scene }) {
  switch (scene) {
    case "clear-day":
      return (
        <>
          <Glow className="-top-40 -right-20 size-[38rem] bg-amber-300/40" />
          <Glow className="bottom-0 -left-40 size-[30rem] bg-cyan-300/20" duration={24} />
        </>
      );
    case "clear-night":
      return (
        <>
          <Stars />
          <Glow className="-top-32 right-10 size-[26rem] bg-indigo-400/20" />
        </>
      );
    case "rain":
    case "rain-night":
      return <Rain />;
    case "storm":
      return (
        <>
          <Rain heavy />
          <div className="animate-flash absolute inset-0 bg-white" />
        </>
      );
    case "snow":
      return <Snow />;
    case "clouds":
    case "clouds-night":
    case "mist":
      return (
        <>
          <Glow className="top-10 -left-32 h-64 w-[50rem] bg-white/15" duration={26} />
          <Glow className="top-1/2 -right-40 h-72 w-[46rem] bg-white/10" duration={32} />
        </>
      );
    default:
      return (
        <>
          <Glow className="-top-40 left-1/4 size-[34rem] bg-sky-500/25" />
          <Glow className="bottom-0 right-0 size-[28rem] bg-violet-500/20" duration={22} />
        </>
      );
  }
}

/** Fundo em tela cheia que muda (com fade) conforme o clima. */
export default function Scene({ scene = "idle" }) {
  return (
    <div aria-hidden="true" className="fixed inset-0 -z-10 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={scene}
          className={`absolute inset-0 bg-gradient-to-br ${SCENES[scene] ?? SCENES.idle}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <Layer scene={scene} />
        </motion.div>
      </AnimatePresence>
      {/* véu para garantir contraste do texto */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/5 to-black/30" />
    </div>
  );
}
