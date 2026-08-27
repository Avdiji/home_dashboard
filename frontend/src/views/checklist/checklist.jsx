import { useTranslation } from "react-i18next";
import AddButton from "../../components/buttons/add_button";
import PageHeader from "../../components/page_header/page_header";
import layout from "../../components/layout/layout.module.css";
import ListCard from "./components/list_card";
import ListForm from "./components/list_form";
import useChecklist from "./hooks/use_checklist";
import classes from "./checklist.module.css";

export default function Checklist() {
  const { t } = useTranslation();
  const {
    visibleLists,
    persons,
    memberFilter,
    setMemberFilter,
    listFormOpen,
    openNewList,
    closeListForm,
    toggleItem,
    removeItem,
    addItem,
    updateTitle,
    addList,
    removeList,
    toggleListAssignee,
  } = useChecklist();

  const toggleMember = (id) => {
    setMemberFilter((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearMembers = () => setMemberFilter(new Set());
  const allActive = memberFilter.size === 0;

  return (
    <div className={classes.view}>
      <div className={classes.header}>
        <PageHeader title={t("checklist.title")} subtitle={t("checklist.subtitle")} />
        <AddButton onClick={openNewList}>
          {t("checklist.newList")}
        </AddButton>
      </div>

      <div className={classes.filter}>
        <button
          type="button"
          className={`${classes.filterBtn} ${allActive ? classes.active : ""}`}
          onClick={clearMembers}
        >
          <span className={classes.label}>{t("checklist.all")}</span>
        </button>
        {persons.map((p) => (
          <button
            key={p.id}
            type="button"
            title={p.name}
            className={`${classes.filterBtn} ${
              memberFilter.has(p.id) ? classes.active : ""
            }`}
            onClick={() => toggleMember(p.id)}
          >
            <span className={classes.label}>{p.name}</span>
          </button>
        ))}
      </div>

      <div className={layout.twoColGrid}>
        {visibleLists.map((list) => (
          <ListCard
            key={list.id}
            list={list}
            persons={persons}
            onToggleItem={toggleItem}
            onRemoveItem={removeItem}
            onUpdateTitle={updateTitle}
            onRemoveList={removeList}
            onAddItem={addItem}
            onToggleAssignee={toggleListAssignee}
          />
        ))}
      </div>

      {listFormOpen && (
        <ListForm
          onClose={closeListForm}
          onSave={addList}
        />
      )}
    </div>
  );
}