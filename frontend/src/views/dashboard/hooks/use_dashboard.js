import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePersons } from "../../../store/persons_store";
import { useEvents } from "../../../store/events_store";
import { useChecklists } from "../../../store/checklists_store";
import { useMeals } from "../../../store/meals_store";
import { useRecipes } from "../../../store/recipes_store";
import { CALENDAR_PATH, CHECKLIST_PATH, MEAL_PLAN_PATH } from "../../../core/nav_config";
import { WeatherDTO } from "../../../core/dto/weather.dto";
import {
  WEEKDAYS_LONG_SUN,
  formatDate,
  zonedParts,
  MS_DAY,
} from "../../../core/utils/date_utils";
import { expandAll } from "../../../core/utils/recurrence";
import {
  CLOCK_TICK_MS,
  WEATHER_REFETCH_MS,
  UPCOMING_LIMIT,
  UPCOMING_WINDOW_DAYS,
  HOURLY_FORECAST_COUNT,
  SECONDS_PER_MINUTE,
  SECONDS_PER_HOUR,
  SECONDS_PER_DAY,
  GREETING_AFTERNOON_HOUR,
  GREETING_EVENING_HOUR,
  STATE_KEY_EDIT_EVENT_ID,
  STATE_KEY_EVENT_START,
  STATE_KEY_EDIT_RECIPE_ID,
  OPEN_METEO_FORECAST_URL,
  OPEN_METEO_CURRENT_FIELDS,
  OPEN_METEO_HOURLY_FIELDS,
  OPEN_METEO_DAILY_FIELDS,
  OPEN_METEO_FORECAST_DAYS,
  OPEN_METEO_GEOCODE_SEARCH_URL,
  WEATHER_LOCATION_STORAGE_KEY,
} from "../../../core/constants";

const greetingKey = (h) => {
  if (h < GREETING_AFTERNOON_HOUR) return "dashboard.greetingMorning";
  if (h < GREETING_EVENING_HOUR) return "dashboard.greetingAfternoon";
  return "dashboard.greetingEvening";
};

export default function useDashboard() {
  const { t, i18n } = useTranslation();
  // Entity state lives in the centralized stores — the dashboard is a view
  // over the same persons/events/checklists/meals/recipes the other features
  // mutate, so it re-renders when any of them changes (once the backend lands
  // and the noop actions fill in). Noop action signatures come from the store.
  const persons = usePersons((s) => s.persons);
  const addPerson = usePersons((s) => s.addPerson);
  const updatePerson = usePersons((s) => s.updatePerson);
  const removePerson = usePersons((s) => s.removePerson);

  const events = useEvents((s) => s.events);
  const lists = useChecklists((s) => s.lists);
  const meals = useMeals((s) => s.meals);
  const recipes = useRecipes((s) => s.recipes);

  // Live clock — first ticking timer in the app. Ticks every second so the
  // seconds readout, day-progress bar and upcoming relative times stay live.
  // The clock displays the selected weather location's local time (via its
  // IANA timezone); with no location set it falls back to the browser's zone.
  const [now, setNow] = useState(() => new Date());
  const [location, setLocation] = useState(() => {
    try {
      const raw = localStorage.getItem(WEATHER_LOCATION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const clock = useMemo(() => {
    const pad = (n) => String(n).padStart(2, "0");
    const zp = location?.timezone ? zonedParts(now, location.timezone) : null;
    const hours = zp ? zp.hours : now.getHours();
    const minutes = zp ? zp.minutes : now.getMinutes();
    const seconds = zp ? zp.seconds : now.getSeconds();
    const wd = zp && zp.weekday >= 0 ? zp.weekday : now.getDay();
    const elapsed = hours * SECONDS_PER_HOUR + minutes * SECONDS_PER_MINUTE + seconds;
    const date = zp
      ? `${pad(zp.day)}-${pad(zp.month + 1)}-${zp.year}`
      : formatDate(now);
    return {
      time: `${pad(hours)}:${pad(minutes)}`,
      seconds: pad(seconds),
      weekday: WEEKDAYS_LONG_SUN[wd],
      date,
      greetingKey: greetingKey(hours),
      dayProgress: (elapsed / SECONDS_PER_DAY) * 100,
    };
  }, [now, location]);

  // Weather — manual location + Open-Meteo (free, no API key). The user picks a
  // place via a forward-geocode search; it's persisted in localStorage so it
  // survives reloads. No browser geolocation, no IP-geo guess: if no place is
  // set, the dashboard shows a location picker instead of weather. Open-Meteo
  // is a third-party API, not the project backend — the "all data seeded" rule
  // doesn't apply. The 15-min refetch reuses the stored place; 15 min matches
  // Open-Meteo's `current` update cadence.
  const [weather, setWeather] = useState(null);
  // Place label is derived from the stored location so it survives reloads
  // (restoring `location` from localStorage restores the label too — a
  // separate state would reset to null on every client restart).
  const place = useMemo(() => {
    if (!location) return null;
    return location.countryCode
      ? t("dashboard.placeFormat", { name: location.name, countryCode: location.countryCode })
      : location.name;
  }, [location, t, i18n.language]);
  const [locationResults, setLocationResults] = useState([]);
  const [locSearching, setLocSearching] = useState(false);

  const fetchWeather = useCallback((latitude, longitude) => {
    const url =
      `${OPEN_METEO_FORECAST_URL}?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=${OPEN_METEO_CURRENT_FIELDS}` +
      `&hourly=${OPEN_METEO_HOURLY_FIELDS}&forecast_days=${OPEN_METEO_FORECAST_DAYS}` +
      `&daily=${OPEN_METEO_DAILY_FIELDS}&timezone=auto`;
    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        if (!res?.current) return;
        // Extract the next HOURLY_FORECAST_COUNT entries starting at the current hour.
        const hours = [];
        const h = res?.hourly;
        if (h?.time && h.temperature_2m && h.weather_code) {
          const nowMs = Date.now();
          const startIdx = h.time.findIndex((t) => new Date(t).getTime() >= nowMs);
          const from = startIdx < 0 ? 0 : startIdx;
          for (let i = from; i < Math.min(from + HOURLY_FORECAST_COUNT, h.time.length); i++) {
            hours.push({
              time: h.time[i],
              temperature: h.temperature_2m[i],
              weatherCode: h.weather_code[i],
              isDay: h.is_day?.[i],
            });
          }
        }
        setWeather(
          new WeatherDTO({
            ...res.current,
            sunrise: res?.daily?.sunrise?.[0],
            sunset: res?.daily?.sunset?.[0],
            hours,
          }).toModel(),
        );
      })
      .catch((e) => console.error("Open-Meteo fetch failed", e));
  }, []);

  // Forward-geocode a typed query → candidate places (name → coords).
  const searchLocation = useCallback((query) => {
    const q = query.trim();
    if (!q) {
      setLocationResults([]);
      return;
    }
    setLocSearching(true);
    const url =
      `${OPEN_METEO_GEOCODE_SEARCH_URL}?name=${encodeURIComponent(q)}` +
      `&count=6&language=en&format=json`;
    fetch(url)
      .then((r) => r.json())
      .then((res) => setLocationResults(res?.results ?? []))
      .catch((e) => console.error("Open-Meteo geocode search failed", e))
      .finally(() => setLocSearching(false));
  }, []);

  // Pick a search result: persist it, label the card with the place name (the
  // result carries the name — no separate reverse-geocode hop), and the location
  // effect below fetches weather for it.
  const chooseLocation = useCallback((hit) => {
    const next = {
      name: hit.name,
      latitude: hit.latitude,
      longitude: hit.longitude,
      countryCode: hit.country_code ?? null,
      admin1: hit.admin1 ?? null,
      timezone: hit.timezone ?? null,
    };
    try {
      localStorage.setItem(WEATHER_LOCATION_STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* localStorage may be unavailable (private mode) — weather still works in-session */
    }
    setLocation(next);
    setLocationResults([]);
  }, []);

  // Clear the saved place → the picker reappears so the user can set a new one.
  const changeLocation = useCallback(() => {
    try {
      localStorage.removeItem(WEATHER_LOCATION_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setLocation(null);
    setWeather(null);
    setLocationResults([]);
  }, []);

  // Initial fetch + re-fetch whenever the saved location changes.
  useEffect(() => {
    if (location) fetchWeather(location.latitude, location.longitude);
  }, [location, fetchWeather]);

  // Refetch every 15 min using the stored place.
  useEffect(() => {
    if (!location) return;
    const id = setInterval(
      () => fetchWeather(location.latitude, location.longitude),
      WEATHER_REFETCH_MS,
    );
    return () => clearInterval(id);
  }, [location, fetchWeather]);

  // personById — derived from the store roster so it stays in sync as members
  // change (once the backend lands). Used to resolve the person chips on
  // upcoming event rows.
  const personById = useMemo(
    () => new Map(persons.map((p) => [p.id, p])),
    [persons],
  );

  // Today's planned dish — derived from the shared meals + recipes stores, so
  // it tracks meal-plan mutations. Finds the meal whose date is today; if it
  // links to a recipe, resolves the recipe (label = recipe title, clickable →
  // deep-link). A free-text dish (no recipeId) is plain text, not clickable.
  // null when no meal matches today.
  const todaysDish = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const meal = meals.find((m) => m.date === today);
    if (!meal) return null;
    if (meal.recipeId != null) {
      const recipe = recipes.find((r) => r.id === meal.recipeId);
      if (recipe) return { label: recipe.title, recipe };
    }
    return { label: meal.label, recipe: null };
  }, [meals, recipes]);

  // Upcoming events — next 3 occurrences starting at/after `now`, recomputed
  // every tick so past events drop off and later ones roll in. Read from the
  // shared events store so a calendar mutation reflects here too. expandAll
  // over a 90-day forward window is enough to cover monthly recurrences.
  const upcoming = useMemo(() => {
    const from = now;
    const to = new Date(now.getTime() + UPCOMING_WINDOW_DAYS * MS_DAY);
    return expandAll(events, from, to)
      .slice(0, UPCOMING_LIMIT)
      .map((occ) => ({
        id: occ.event.id,
        title: occ.event.title,
        start: occ.start,
        location: occ.event.location,
        personIds: occ.event.personIds,
        persons: occ.event.personIds
          .map((id) => personById.get(id))
          .filter(Boolean),
      }));
  }, [now, events, personById]);

  // Deep-link navigation: clicking an upcoming row / the dish jumps to the
  // owning feature and opens its edit modal (the target view reads the state
  // on mount). The upcoming row passes the occurrence start so the calendar
  // lands on that day (recurring events: occurrence start != base start).
  const navigate = useNavigate();
  const goToEvent = (eventId, start) =>
    navigate(CALENDAR_PATH, {
      state: {
        [STATE_KEY_EDIT_EVENT_ID]: eventId,
        [STATE_KEY_EVENT_START]: start.toISOString(),
      },
    });
  const goToRecipe = (recipeId) =>
    navigate(MEAL_PLAN_PATH, {
      state: { [STATE_KEY_EDIT_RECIPE_ID]: recipeId },
    });
  const goToChecklist = () => navigate(CHECKLIST_PATH);

  // Checklist glance — view-only summary of the shared lists store: each
  // list's title + remaining/total + done pct (drives a progress bar). Read
  // from the store so it tracks checklist mutations. Clicking the card
  // navigates to the checklist feature. No mutations here.
  const checklists = useMemo(
    () =>
      lists.map((l) => {
        const total = l.items.length;
        const done = total - l.remainingItems;
        return {
          id: l.id,
          title: l.title,
          total,
          done,
          remaining: l.remainingItems,
          pct: total ? Math.round((done / total) * 100) : 0,
        };
      }),
    [lists],
  );

  // Members — roster mutations are noops with full signatures (the spec for
  // the future backend call). The list won't visually update until the
  // backend lands — same as every other entity. The roster is shared via the
  // persons store, so calendar/checklist pickers read the same data.
  const [memberFormOpen, setMemberFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const openNewMember = () => {
    setEditingMember(null);
    setMemberFormOpen(true);
  };
  const openEditMember = (person) => {
    setEditingMember(person);
    setMemberFormOpen(true);
  };
  const closeMemberForm = () => setMemberFormOpen(false);

  return {
    now,
    clock,
    weather,
    place,
    location,
    locationResults,
    locSearching,
    searchLocation,
    chooseLocation,
    changeLocation,
    todaysDish,
    upcoming,
    goToEvent,
    goToRecipe,
    goToChecklist,
    checklists,
    persons,
    addPerson,
    updatePerson,
    removePerson,
    memberFormOpen,
    editingMember,
    openNewMember,
    openEditMember,
    closeMemberForm,
  };
}