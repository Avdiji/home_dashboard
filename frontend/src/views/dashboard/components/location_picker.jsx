import { useState, useRef, useEffect } from "react";
import classes from "./location_picker.module.css";

// Manual location picker for the dashboard weather section. Shown when no
// location is set (or the user asked to change). The user types a place name;
// a debounced forward-geocode query fills the dropdown; clicking a result calls
// onSelect with the Open-Meteo geocoding hit (name, latitude, longitude,
// country_code, admin1).
export default function LocationPicker({ searching, results, onSearch, onSelect }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const debounceRef = useRef(null);

  // Outside-click closes the dropdown.
  useEffect(() => {
    const onDown = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const onChange = (v) => {
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(v);
      setOpen(true);
    }, 300);
  };

  const pick = (hit) => {
    setOpen(false);
    setQuery("");
    onSelect(hit);
  };

  const onKey = (e) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      onSearch(query);
      setOpen(true);
    }
    if (e.key === "Escape") setOpen(false);
  };

  return (
    <div className={classes.box} ref={boxRef}>
      <div className={classes.head}>📍 Set a location for the weather</div>
      <div className={classes.field}>
        <input
          className={classes.input}
          type="text"
          value={query}
          placeholder="Search a city…"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKey}
          onFocus={() => results.length && setOpen(true)}
        />
      </div>
      {open && (
        <div className={classes.results}>
          {searching && <div className={classes.row}>Searching…</div>}
          {!searching && results.length === 0 && query.trim() && (
            <div className={classes.row}>No matches</div>
          )}
          {!searching &&
            results.map((hit) => (
              <button
                key={`${hit.id}-${hit.latitude}-${hit.longitude}`}
                type="button"
                className={classes.row}
                onClick={() => pick(hit)}
              >
                <span className={classes.name}>{hit.name}</span>
                <span className={classes.sub}>
                  {[hit.admin1, hit.country].filter(Boolean).join(", ")}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}