// Display title for an event. Birthday events (auto-created by the backend when
// a member is added with a birthday) are rendered via a localized template
// using the assigned person's name — but only while the stored title still
// matches that name (i.e. the user hasn't retitled it). A retitled event, or a
// deleted/renamed person, falls back to the raw stored title. `persons` is an
// array of { id, name } (e.g. event.personIds resolved, or a store roster).
export function eventDisplayTitle(event, persons, t) {
  if (event?.isBirthday) {
    const name = persons?.find((p) => p.id === event.personIds?.[0])?.name;
    if (name && event.title === name) {
      return t("event.birthdayTitle", { name });
    }
  }
  return event?.title ?? "";
}