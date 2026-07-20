import PageHeader from "../../components/page_header/page_header";
import layout from "../../components/layout/layout.module.css";
import ClockCard from "./components/clock_card";
import WeatherCard from "./components/weather_card";
import DishCard from "./components/dish_card";
import MembersCard from "./components/members_card";
import MemberForm from "./components/member_form";
import useDashboard from "./hooks/use_dashboard";
import classes from "./dashboard.module.css";

export default function Dashboard() {
  const {
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
  } = useDashboard();

  return (
    <div className={classes.view}>
      <PageHeader title="Home" subtitle={clock.greeting} />

      <div className={classes.stack}>
        <div className={layout.twoColGrid}>
          <ClockCard clock={clock} />
          <WeatherCard weather={weather} />
        </div>

        <div className={layout.twoColGrid}>
          <DishCard dish={todaysDish} />
          <MembersCard
            persons={persons}
            onAdd={openNewMember}
            onEdit={openEditMember}
            onRemove={removePerson}
          />
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