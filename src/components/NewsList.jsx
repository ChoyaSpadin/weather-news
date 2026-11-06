import { motion } from "motion/react";
import { ExternalLink, Newspaper } from "lucide-react";
import Card, { Skeleton } from "./Card.jsx";
import { formatRelative } from "../lib/format.js";

function Article({ a, i }) {
  return (
    <motion.a
      href={a.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.06 }}
      whileHover={{ y: -4 }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 transition hover:bg-white/10"
    >
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-white/10 to-white/0">
        <Newspaper className="absolute inset-0 m-auto size-10 text-white/20" aria-hidden="true" />
        {a.image && (
          <img
            src={a.image}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => (e.currentTarget.style.display = "none")}
            className="relative size-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-3 font-medium leading-snug">{a.title}</h3>
        <p className="mt-auto flex items-center justify-between gap-2 text-xs text-white/60">
          <span className="truncate">
            {a.source} · {formatRelative(a.publishedAt)}
          </span>
          <ExternalLink className="size-3.5 shrink-0 opacity-0 transition group-hover:opacity-100" aria-hidden="true" />
        </p>
      </div>
    </motion.a>
  );
}

export default function NewsList({ city, news }) {
  return (
    <Card title={`Notícias${city ? ` · ${city}` : ""}`} icon={Newspaper}>
      {news.status === "loading" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-60" />
          ))}
        </div>
      )}
      {news.status === "error" && <p className="text-sm text-white/70">{news.error}</p>}
      {news.status === "success" && news.data.length === 0 && (
        <p className="text-sm text-white/70">Nenhuma notícia recente encontrada para esta cidade.</p>
      )}
      {news.status === "success" && news.data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {news.data.map((a, i) => (
            <Article key={a.url} a={a} i={i} />
          ))}
        </div>
      )}
    </Card>
  );
}
