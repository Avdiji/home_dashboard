import { useTranslation } from "react-i18next";
import layout from "../../components/layout/layout.module.css";
import ClockCard from "./components/clock_card";
import WeatherCard from "./components/weather_card";
import LocationPicker from "./components/location_picker";
import PrayerTimesCard from "./components/prayer_times_card";
import UpcomingCard from "./components/upcoming_card";
import RecentFilesCard from "./components/recent_files_card";
import ChecklistCard from "./components/checklist_card";
import MembersCard from "./components/members_card";
import MemberForm from "./components/member_form";
import useDashboard from "./hooks/use_dashboard";
import classes from "./dashboard.module.css";

const Section = ({ children }) => <section className={classes.section}>{children}</section>;

export default function Dashboard() {
  const { t } = useTranslation();
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
    prayers,
    recentFiles,
    upcoming,
    goToEvent,
    goToFile,
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
      <div className={classes.mega}>
        <div className={classes.stack}>
          <div className={classes.now}>
            <div className={classes.clockCol}>
              <ClockCard clock={clock} />
            </div>
            <div className={classes.divider} />
            <div className={classes.weatherCol}>
              {location ? (
                weather ? (
                  <WeatherCard
                    weather={weather}
                    place={place}
                    hours={weather.hours}
                    onChangeLocation={changeLocation}
                  />
                ) : (
                  <div className={classes.pending}>
                    <span className={classes.weatherPending}>{t("dashboard.loadingWeather")}</span>
                    <button
                      type="button"
                      className={classes.changeLoc}
                      onClick={changeLocation}
                    >
                      {t("dashboard.changeLocation")}
                    </button>
                  </div>
                )
              ) : (
                <LocationPicker
                  searching={locSearching}
                  results={locationResults}
                  onSearch={searchLocation}
                  onSelect={chooseLocation}
                />
              )}
            </div>
          </div>

          <Section>
            <PrayerTimesCard prayers={prayers} hasLocation={!!location} />
          </Section>

          <div className={layout.twoColGrid}>
            <Section>
              <UpcomingCard now={now} events={upcoming} onEventClick={goToEvent} />
            </Section>
            <Section>
              <RecentFilesCard files={recentFiles} onFileClick={goToFile} />
            </Section>
          </div>

          <Section>
            <ChecklistCard lists={checklists} onOpen={goToChecklist} />
          </Section>

          <Section>
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