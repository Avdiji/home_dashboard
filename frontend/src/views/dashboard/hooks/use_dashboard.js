import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  formatTime24,
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
} from "../../../core/constants";

// Seeded weather fallback so the card always renders something even before
// geolocation resolves (or if permission is denied / offline). Sunrise/sunset
// are seeded relative to today; hours is a 4-step plausible hourly forecast.
// Weather is dashboard-only lifecycle state (not a shared entity), so it stays
// in this hook rather than the centralized store.
const todayISO = new Date().toISOString().slice(0, 10);
// isDay for a seed hour = 1 when the hour falls between sunrise and sunset,
// else 0 (night). Mirrors Open-Meteo's per-hour is_day so the hourly strip
// shows moon icons after sunset instead of sun.
const seedIsDay = (hourISO, sunriseISO, sunsetISO) => {
  if (!sunriseISO || !sunsetISO) return 1;
  const t = new Date(hourISO).getTime();
  return t >= new Date(sunriseISO).getTime() && t < new Date(sunsetISO).getTime()
    ? 1
    : 0;
};
const seedHours = (startHour, temps, codes, sunriseISO, sunsetISO) =>
  temps.map((t, i) => {
    // Build via a Date so startHour + i rolls past midnight correctly
    // (startHour 23 + 2 -> 01:00 next day, not "25:00" -> NaN).
    const d = new Date(`${todayISO}T00:00:00`);
    d.setHours(startHour + i);
    const pad = (n) => String(n).padStart(2, "0");
    const dateISO = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const time = `${dateISO}T${pad(d.getHours())}:00`;
    return {
      time,
      temperature: t,
      weatherCode: codes[i],
      isDay: seedIsDay(time, sunriseISO, sunsetISO),
    };
  });
const SEED_SUNRISE = `${todayISO}T06:24`;
const SEED_SUNSET = `${todayISO}T21:08`;
const SEED_WEATHER = new WeatherDTO({
  temperature_2m: 18,
  apparent_temperature: 17,
  relative_humidity_2m: 64,
  weather_code: 2,
  wind_speed_10m: 12,
  is_day: 1,
  sunrise: SEED_SUNRISE,
  sunset: SEED_SUNSET,
  hours: seedHours(
    new Date().getHours() + 1,
    [18, 19, 20, 19],
    [2, 1, 0, 0],
    SEED_SUNRISE,
    SEED_SUNSET,
  ),
}).toModel();

const greeting = (d) => {
  const h = d.getHours();
  if (h < GREETING_AFTERNOON_HOUR) return "Good morning";
  if (h < GREETING_EVENING_HOUR) return "Good afternoon";
  return "Good evening";
};

export default function useDashboard() {
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
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(id);
  }, []);

  const clock = useMemo(() => {
    const secs = now.getSeconds();
    const elapsed =
      now.getHours() * SECONDS_PER_HOUR +
      now.getMinutes() * SECONDS_PER_MINUTE +
      secs;
    return {
      time: formatTime24(now),
      seconds: String(secs).padStart(2, "0"),
      weekday: WEEKDAYS_LONG_SUN[now.getDay()],
      date: formatDate(now),
      greeting: greeting(now),
      dayProgress: (elapsed / SECONDS_PER_DAY) * 100,
    };
  }, [now]);

  // Weather — live geolocation + Open-Meteo (free, no API key). Falls back to
  // the seed on denial / error / unsupported. Open-Meteo is a third-party API,
  // not the project backend — the "all data seeded" rule doesn't apply here.
  // Coords are captured once (after the first geolocation grant) and reused —
  // the 15-min refetch does NOT re-prompt for location. 15 min matches Open-Meteo's
  // `current` update cadence (more frequent just returns cached data).
  const [weather, setWeather] = useState(SEED_WEATHER);
  const coordsRef = useRef(null);

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
      .catch(() => {});
  }, []);

  // First fetch: geolocation → store coords → fetch.
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        coordsRef.current = { latitude, longitude };
        fetchWeather(latitude, longitude);
      },
      () => {},
    );
  }, [fetchWeather]);

  // Refetch every 15 min using the stored coords (no re-prompt).
  useEffect(() => {
    const id = setInterval(() => {
      const c = coordsRef.current;
      if (c) fetchWeather(c.latitude, c.longitude);
    }, WEATHER_REFETCH_MS);
    return () => clearInterval(id);
  }, [fetchWeather]);

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