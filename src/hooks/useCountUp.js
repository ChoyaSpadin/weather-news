import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

/** Anima um número do valor anterior até o novo. */
export function useCountUp(value) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (reduced) {
      from.current = value;
      setDisplay(value);
      return;
    }
    const controls = animate(from.current, value, {
      duration: 1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(v),
    });
    from.current = value;
    return () => controls.stop();
  }, [value, reduced]);
  return display;
}
