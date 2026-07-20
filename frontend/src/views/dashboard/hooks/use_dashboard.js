import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { SEED_PERSONS } from "../../../core/seeds/persons";
import { SEED_EVENTS } from "../../../core/seeds/events";
import { CALENDAR_PATH, MEAL_PLAN_PATH } from "../../../core/nav_config";
import { RecipeDTO } from "../../../core/dto/recipe.dto";
import { MealDTO } from "../../../core/dto/meal.dto";
import { WeatherDTO } from "../../../core/dto/weather.dto";
import {
  WEEKDAYS_LONG_SUN,
  formatDate,
  formatTime24,
} from "../../../core/utils/date_utils";

// Demo recipe for today's dish (mirrors the meal plan seed: 2026-07-20 → Pasta
// Pomodoro). Dashboard's own seed — converges with the meal plan once both fetch
// from the backend.
const SEED_TODAY_RECIPE = new RecipeDTO({
  id: 1,
  title: "Pasta Pomodoro",
  description: "Quick weeknight pasta.",
  ingredients: ["400g pasta", "1 can tomatoes", "garlic", "basil", "olive oil"],
  servings: 4,
  minutes: 25,
}).toModel();

// Date the seed dish is planned for = today at module load, so the demo always
// shows a dish on the dashboard. Backend swap makes this a real fetch.
const SEED_TODAY_MEAL = new MealDTO({
  id: 1,
  date: new Date().toISOString().slice(0, 10),
  recipe_id: 1,
  label: "",
}).toModel();

// Seeded weather fallback so the card always renders something even before
// geolocation resolves (or if permission is denied / offline). Sunrise/sunset
// are seeded relative to today; hours is a 4-step plausible hourly forecast.
const todayISO = new Date().toISOString().slice(0, 10);
const seedHours = (startHour, temps, codes) =>
  temps.map((t, i) => {
    // Build via a Date so startHour + i rolls past midnight correctly
    // (startHour 23 + 2 -> 01:00 next day, not "25:00" -> NaN).
    const d = new Date(`${todayISO}T00:00:00`);
    d.setHours(startHour + i);
    const pad = (n) => String(n).padStart(2, "0");
    const dateISO = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    return {
      time: `${dateISO}T${pad(d.getHours())}:00`,
      temperature: t,
      weatherCode: codes[i],
    };
  });
const SEED_WEATHER = new WeatherDTO({
  temperature_2m: 18,
  apparent_temperature: 17,
  relative_humidity_2m: 64,
  weather_code: 2,
  wind_speed_10m: 12,
  is_day: 1,
  sunrise: `${todayISO}T06:24`,
  sunset: `${todayISO}T21:08`,
  hours: seedHours(new Date().getHours() + 1, [18, 19, 20, 19], [2, 1, 0, 0]),
}).toModel();

// Upcoming events = the next 3 calendar events (start >= now), derived from the
// shared SEED_EVENTS so a row click deep-links to that event's edit modal in the
// calendar. Computed once at module load; the card renders live relative-time
// labels against the ticking `now`. (Recurring events with a past base start are
// filtered out here — no occurrence expansion in the dashboard; the backend
// fetch will handle recurrence when it lands.)
const personById = new Map(SEED_PERSONS.map((p) => [p.id, p]));
const nowMs0 = Date.now();
const SEED_UPCOMING_EVENTS = SEED_EVENTS
  .filter((e) => e.start.getTime() >= nowMs0)
  .sort((a, b) => a.start.getTime() - b.start.getTime())
  .slice(0, 3)
  .map((e) => ({
    id: e.id,
    title: e.title,
    start: e.start,
    personIds: e.personIds,
    persons: e.personIds.map((id) => personById.get(id)).filter(Boolean),
  }));

const greeting = (d) => {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export default function useDashboard() {
  // Live clock — first ticking timer in the app. Ticks every second so the
  // seconds readout, day-progress bar and upcoming relative times stay live.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const clock = useMemo(() => {
    const secs = now.getSeconds();
    const elapsed = now.getHours() * 3600 + now.getMinutes() * 60 + secs;
    return {
      time: formatTime24(now),
      seconds: String(secs).padStart(2, "0"),
      weekday: WEEKDAYS_LONG_SUN[now.getDay()],
      date: formatDate(now),
      greeting: greeting(now),
      dayProgress: (elapsed / 86400) * 100,
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
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day` +
      `&hourly=temperature_2m,weather_code&forecast_days=2` +
      `&daily=sunrise,sunset&timezone=auto`;
    fetch(url)
      .then((r) => r.json())
      .then((res) => {
        if (!res?.current) return;
        // Extract the next 4 hourly entries starting at the current hour.
        const hours = [];
        const h = res?.hourly;
        if (h?.time && h.temperature_2m && h.weather_code) {
          const nowMs = Date.now();
          const startIdx = h.time.findIndex((t) => new Date(t).getTime() >= nowMs);
          const from = startIdx < 0 ? 0 : startIdx;
          for (let i = from; i < Math.min(from + 4, h.time.length); i++) {
            hours.push({
              time: h.time[i],
              temperature: h.temperature_2m[i],
              weatherCode: h.weather_code[i],
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
    }, 15 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchWeather]);

  // Today's planned dish (seeded). null when no meal matches today.
  const todaysDish = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (SEED_TODAY_MEAL.date !== today) return null;
    if (SEED_TODAY_MEAL.recipeId != null) {
      return { label: SEED_TODAY_RECIPE.title, recipe: SEED_TODAY_RECIPE };
    }
    return { label: SEED_TODAY_MEAL.label, recipe: null };
  }, []);

  // Upcoming events (seeded, starts relative to module-load now). Returned as-is;
  // the card computes live relative times against the ticking `now`.
  const upcoming = SEED_UPCOMING_EVENTS;

  // Deep-link navigation: clicking an upcoming row / the dish jumps to the
  // owning feature and opens its edit modal (the target view reads the state
  // on mount).
  const navigate = useNavigate();
  const goToEvent = (eventId) =>
    navigate(CALENDAR_PATH, { state: { editEventId: eventId } });
  const goToRecipe = (recipeId) =>
    navigate(MEAL_PLAN_PATH, { state: { editRecipeId: recipeId } });

  // Members — the backend is the single source of truth, so roster mutations are
  // noops with full signatures (the spec for the future backend call). The list
  // won't visually update until the backend lands — same as item toggle / addList
  // elsewhere. Calendar/checklist keep their own seeded SEED_PERSONS until the
  // backend unifies the rosters.
  const [persons] = useState(SEED_PERSONS);

  // noop — add person wiring handled once backend lands
  const addPerson = ({ name }) => {};
  // noop — update person wiring handled once backend lands
  const updatePerson = (personId, { name }) => {};
  // noop — remove person wiring handled once backend lands
  const removePerson = (personId) => {};

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