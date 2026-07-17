import Card from "../../components/cards/card";
import PageHeader from "../../components/page_header/page_header";
import MemberFilter from "./components/member_filter";
import TaskForm from "./components/task_form";
import TaskItem from "./components/task_item";
import useTodoList from "./hooks/use_todo_list";
import classes from "./todo_list.module.css";

export default function TodoList() {
  const {
    persons,
    activeFilters,
    toggleTodo,
    removeTodo,
    addTodo,
    toggleFilter,
    showAll,
    open,
    done,
    personName,
  } = useTodoList();

  const renderItem = (todo, showNames) => (
    <TaskItem
      key={todo.id}
      todo={todo}
      personNames={showNames ? todo.personIds.map(personName) : []}
      onToggle={() => toggleTodo(todo.id)}
      onRemove={() => removeTodo(todo.id)}
    />
  );

  // Group tasks: joint (multi-member) + unassigned first with no subtitle,
  // then each member's solo tasks under a member-name subtitle.
  const renderGrouped = (items) => {
    const joint = items.filter((t) => t.personIds.length !== 1);
    const solo = items.filter((t) => t.personIds.length === 1);
    const byMember = new Map();
    for (const t of solo) {
      const pid = t.personIds[0];
      if (!byMember.has(pid)) byMember.set(pid, []);
      byMember.get(pid).push(t);
    }
    return (
      <div className={classes.groups}>
        {joint.length > 0 && (
          <ul className={classes.list}>
            {joint.map((t) => renderItem(t, true))}
          </ul>
        )}
        {persons.map((p) => {
          const list = byMember.get(p.id);
          if (!list || list.length === 0) return null;
          return (
            <div className={classes.group} key={p.id}>
              <div className={classes.group_title}>{p.name}</div>
              <ul className={classes.list}>
                {list.map((t) => renderItem(t, false))}
              </ul>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={classes.view}>
      <PageHeader title="Todos" subtitle="Tasks per family member" />

      <MemberFilter
        persons={persons}
        activeFilters={activeFilters}
        onToggle={toggleFilter}
        onAll={showAll}
      />

      <div className={classes.board}>
        <Card title="TODO" badge={`${open.length}`}>
          {renderGrouped(open)}
        </Card>
        <Card title="DONE" badge={`${done.length}`}>
          {renderGrouped(done)}
        </Card>
      </div>

      <TaskForm persons={persons} onAdd={addTodo} />
    </div>
  );
}