import AddButton from "../../components/buttons/add_button";
import PageHeader from "../../components/page_header/page_header";
import layout from "../../components/layout/layout.module.css";
import ListCard from "./components/list_card";
import ListForm from "./components/list_form";
import useChecklist from "./hooks/use_checklist";
import classes from "./checklist.module.css";

export default function Checklist() {
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
      <PageHeader title="Checklist" subtitle="Shared checklists" />

      <div className={classes.toolbar}>
        <div className={classes.filter}>
          <button
            type="button"
            className={`${classes.filterBtn} ${allActive ? classes.active : ""}`}
            onClick={clearMembers}
          >
            All
          </button>
          {persons.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`${classes.filterBtn} ${
                memberFilter.has(p.id) ? classes.active : ""
              }`}
              onClick={() => toggleMember(p.id)}
            >
              {p.name}
            </button>
          ))}
        </div>
        <div className={classes.toolbar_right}>
          <AddButton onClick={openNewList}>
            + New list
          </AddButton>
        </div>
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