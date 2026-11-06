import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Clock, LoaderCircle, LocateFixed, MapPin, Search, X } from "lucide-react";
import { searchPlaces } from "../lib/api.js";
import { useDebounce } from "../hooks/useDebounce.js";

const placeLabel = (p) => [p.name, p.state, p.country].filter(Boolean).join(", ");

/**
 * Busca com autocomplete, navegação por teclado, buscas recentes e botão de localização.
 * onSelect recebe { lat, lon, label } ou { q, label }.
 */
export default function SearchBar({ onSelect, onLocate, locating, recent = [] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ query: "", places: [] });
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const debounced = useDebounce(query.trim(), 300);
  const listId = useId();
  const inputRef = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => {
    if (debounced.length < 2) {
      setResults({ query: "", places: [] });
      return;
    }
    const ctrl = new AbortController();
    setSearching(true);
    searchPlaces(debounced, ctrl.signal)
      .then((places) => {
        setResults({ query: debounced, places });
        setActive(places.length ? 0 : -1);
      })
      .catch(() => !ctrl.signal.aborted && setResults({ query: debounced, places: [] }))
      .finally(() => !ctrl.signal.aborted && setSearching(false));
    return () => ctrl.abort();
  }, [debounced]);

  // Fecha ao clicar fora
  useEffect(() => {
    const onDown = (e) => !boxRef.current?.contains(e.target) && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const typed = query.trim();
  // só mostra resultados que correspondem ao texto atual
  const fresh = results.query === typed ? results.places : [];
  const showRecent = open && typed.length < 2 && recent.length > 0;
  const options = showRecent ? recent : fresh;
  const showList = open && options.length > 0;

  function choose(place) {
    onSelect({ lat: place.lat, lon: place.lon, label: place.name });
    setQuery("");
    setResults({ query: "", places: [] });
    setOpen(false);
    inputRef.current?.blur();
  }

  function onSubmit(e) {
    e.preventDefault();
    if (showList && options[active]) return choose(options[active]);
    if (typed) {
      onSelect({ q: typed, label: typed });
      setQuery("");
      setOpen(false);
    }
  }

  function onKeyDown(e) {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % options.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="relative w-full max-w-xl">
      <form onSubmit={onSubmit} role="search" className="flex gap-2">
        <div className="glass flex flex-1 items-center gap-3 rounded-2xl px-4 transition focus-within:bg-white/15 focus-within:ring-white/30">
          {searching ? (
            <LoaderCircle className="size-5 shrink-0 animate-spin text-white/60" aria-hidden="true" />
          ) : (
            <Search className="size-5 shrink-0 text-white/60" aria-hidden="true" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => {
              setOpen(true);
              setActive(-1);
            }}
            onKeyDown={onKeyDown}
            placeholder="Buscar cidade…"
            aria-label="Buscar cidade"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            autoComplete="off"
            className="h-12 w-full bg-transparent text-base placeholder:text-white/50 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
              className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <motion.button
          type="button"
          onClick={onLocate}
          disabled={locating}
          whileTap={{ scale: 0.92 }}
          aria-label="Usar minha localização"
          title="Usar minha localização"
          className="glass grid size-12 shrink-0 place-items-center rounded-2xl transition hover:bg-white/20 disabled:opacity-60"
        >
          {locating ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <LocateFixed className="size-5" />
          )}
        </motion.button>
      </form>

      <AnimatePresence>
        {showList && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-14 z-50 overflow-hidden rounded-2xl bg-slate-900/80 p-1.5 shadow-2xl ring-1 ring-white/15 backdrop-blur-2xl"
          >
            {showRecent && (
              <li className="px-3 pt-2 pb-1 text-xs font-medium tracking-wider text-white/50 uppercase">
                Recentes
              </li>
            )}
            {options.map((p, i) => {
              const Icon = showRecent ? Clock : MapPin;
              return (
                <li
                  key={`${p.lat},${p.lon}`}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  onPointerDown={(e) => e.preventDefault()}
                  onClick={() => choose(p)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                    i === active ? "bg-white/15" : ""
                  }`}
                >
                  <Icon className="size-4 shrink-0 text-white/60" aria-hidden="true" />
                  <span className="truncate">{placeLabel(p)}</span>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
