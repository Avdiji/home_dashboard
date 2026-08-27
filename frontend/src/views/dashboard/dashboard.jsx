import PageHeader from "../../components/page_header/page_header";
import layout from "../../components/layout/layout.module.css";
import ClockCard from "./components/clock_card";
import WeatherCard from "./components/weather_card";
import LocationPicker from "./components/location_picker";
import HourlyStrip from "./components/hourly_strip";
import UpcomingCard from "./components/upcoming_card";
import DishCard from "./components/dish_card";
import ChecklistCard from "./components/checklist_card";
import MembersCard from "./components/members_card";
import MemberForm from "./components/member_form";
import useDashboard from "./hooks/use_dashboard";
import classes from "./dashboard.module.css";

const Section = ({ label, children }) => (
  <section className={classes.section}>
    {label && <h3 className={classes.sectionLabel}>{label}</h3>}
    {children}
  </section>
);

export default function Dashboard() {
  const {
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
  } = useDashboard();

  return (
    <div className={classes.view}>
      <PageHeader title="Home" subtitle={clock.greeting} />

      <div className={classes.mega}>
        <div className={classes.stack}>
          <div className={classes.now}>
            <ClockCard clock={clock} />
            {location ? (
              <div className={classes.nowRight}>
                <div className={classes.nowWeather}>
                  {weather ? (
                    <WeatherCard weather={weather} place={place} />
                  ) : (
                    <span className={classes.weatherPending}>Loading weather…</span>
                  )}
                  <button
                    type="button"
                    className={classes.changeLoc}
                    onClick={changeLocation}
                  >
                    Change location
                  </button>
                </div>
                {weather && (
                  <>
                    <div className={classes.sep} />
                    <div className={classes.nowHourly}>
                      <HourlyStrip hours={weather.hours} />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className={classes.nowRight}>
                <LocationPicker
                  searching={locSearching}
                  results={locationResults}
                  onSearch={searchLocation}
                  onSelect={chooseLocation}
                />
              </div>
            )}
          </div>

          <div className={layout.twoColGrid}>
            <Section label="Upcoming">
              <UpcomingCard now={now} events={upcoming} onEventClick={goToEvent} />
            </Section>
            <Section label="Today's dish">
              <DishCard
                dish={todaysDish}
                onClick={todaysDish?.recipe ? goToRecipe : undefined}
              />
            </Section>
          </div>

          <Section label="Checklists">
            <ChecklistCard lists={checklists} onOpen={goToChecklist} />
          </Section>

          <Section label="Members">
            <MembersCard
              persons={persons}
              onAdd={openNewMember}
              onEdit={openEditMember}
              onRemove={removePerson}
            />
          </Section>
        </div>
      </div>

      {memberFormOpen && (
        <MemberForm
          person={editingMember}
          onClose={closeMemberForm}
          onSave={addPerson}
          onUpdate={updatePerson}
        />
      )}
    </div>
  );
}