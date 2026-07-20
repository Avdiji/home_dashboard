import { useState, useEffect, useMemo } from "react";
import { SEED_PERSONS } from "../../../core/seeds/persons";
import { RecipeDTO } from "../../../core/dto/recipe.dto";
import { MealDTO } from "../../../core/dto/meal.dto";
import { WeatherDTO } from "../../../core/dto/weather.dto";
import {
  WEEKDAYS_LONG_SUN,
  formatDate,
  formatTime,
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
// geolocation resolves (or if permission is denied / offline).
const SEED_WEATHER = new WeatherDTO({
  temperature_2m: 18,
  weather_code: 2,
  wind_speed_10m: 12,
  is_day: 1,
}).toModel();

const greeting = (d) => {
  const h = d.getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

export default function useDashboard() {
  // Live clock — first ticking timer in the app.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const clock = useMemo(
    () => ({
      time: formatTime(now),
      weekday: WEEKDAYS_LONG_SUN[now.getDay()],
      date: formatDate(now),
      greeting: greeting(now),
    }),
    [now],
  );

  // Weather — live geolocation + Open-Meteo (free, no API key). Falls back to
  // the seed on denial / error / unsupported. Open-Meteo is a third-party API,
  // not the project backend — the "all data seeded" rule doesn't apply here.
  const [weather, setWeather] = useState(SEED_WEATHER);
  useEffect(() => {
    if (!navigator.geolocation) return;
    const onOk = (pos) => {
      const { latitude, longitude } = pos.coords;
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}` +
        `&longitude=${longitude}` +
        `&current=temperature_2m,weather_code,wind_speed_10m,is_day&timezone=auto`;
      fetch(url)
        .then((r) => r.json())
        .then((res) => {
          if (res?.current) {
            setWeather(new WeatherDTO(res.current).toModel());
          }
        })
        .catch(() => {});
    };
    navigator.geolocation.getCurrentPosition(onOk, () => {});
  }, []);

  // Today's planned dish (seeded). null when no meal matches today.
  const todaysDish = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (SEED_TODAY_MEAL.date !== today) return null;
    if (SEED_TODAY_MEAL.recipeId != null) {
      return { label: SEED_TODAY_RECIPE.title, recipe: SEED_TODAY_RECIPE };
    }
    return { label: SEED_TODAY_MEAL.label, recipe: null };
  }, []);

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
    clock,
    weather,
    todaysDish,
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