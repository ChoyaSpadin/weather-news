import { motion } from "motion/react";
import { item } from "../lib/motion.js";


/** Cartão de vidro com animação de entrada (usa o stagger do pai). */
export default function Card({ title, icon: Icon, className = "", children, as = "section" }) {
  const Tag = motion[as];
  return (
    <Tag variants={item} className={`glass p-5 ${className}`}>
      {title && (
        <h2 className="mb-4 flex items-center gap-2 text-xs font-semibold tracking-widest text-white/60 uppercase">
          {Icon && <Icon className="size-4" aria-hidden="true" />}
          {title}
        </h2>
      )}
      {children}
    </Tag>
  );
}

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-white/10 ${className}`} />;
}
