import { useState } from "react";
import Card from "../../components/cards/card";
import { PersonDTO } from "../../core/dto/person.dto";
import { TodoDTO } from "../../core/dto/todo.dto";
import MemberFilter from "./components/member_filter";
import TaskForm from "./components/task_form";
import TaskItem from "./components/task_item";
import classes from "./todo_list.module.css";

const SEED_PERSONS = [
  new PersonDTO({ id: 1, name: "Anna" }).toModel(),
  new PersonDTO({ id: 2, name: "Mark" }).toModel(),
  new PersonDTO({ id: 3, name: "Lena" }).toModel(),
];

const SEED_TODOS = [
  new TodoDTO({ id: 1, label: "Math homework", is_done: false, personId: 1, frequency: "none" }).toModel(),
  new TodoDTO({ id: 2, label: "Brush teeth", is_done: false, personId: 1, frequency: "daily" }).toModel(),
  new TodoDTO({ id: 3, label: "Tidy room", is_done: false, personId: 1, frequency: "weekly" }).toModel(),
  new TodoDTO({ id: 4, label: "Pay electricity bill", is_done: false, personId: 2, frequency: "none" }).toModel(),
  new TodoDTO({ id: 5, label: "Fix kitchen tap", is_done: true, personId: 2, frequency: "none" }).toModel(),
  new TodoDTO({ id: 6, label: "Clean room", is_done: false, personId: 3, frequency: "weekly" }).toModel(),
  new TodoDTO({ id: 7, label: "Pick up parcel", is_done: false, personId: 3, frequency: "none" }).toModel(),
];

export default function TodoList() {
  const [todos] = useState(SEED_TODOS);
  const [persons] = useState(SEED_PERSONS);
  const [selectedMember, setSelectedMember] = useState(null);

  // noop — toggle wiring handled once backend lands
  const toggleTodo = () => {};
  // noop — remove todo wiring handled once backend lands
  const removeTodo = () => {};
  // noop — add todo wiring handled once backend lands
  const addTodo = () => {};

  const toggleFilter = (personId) => {
    setSelectedMember((cur) => (cur === personId ? null : personId));
  };
  const showAll = () => setSelectedMember(null);

  const filtered =
    selectedMember == null
      ? todos
      : todos.filter((t) => t.personId === selectedMember);

  const open = filtered.filter((t) => !t.isDone);
  const done = filtered.filter((t) => t.isDone);

  const personName = (id) =>
    persons.find((p) => p.id === id)?.name ?? "Unassigned";

  const renderList = (items) => (
    <ul className={classes.list}>
      {items.map((todo) => (
        <TaskItem
          key={todo.id}
          todo={todo}
          personName={personName(todo.personId)}
          onToggle={() => toggleTodo(todo.id)}
          onRemove={() => removeTodo(todo.id)}
        />
      ))}
    </ul>
  );

  return (
    <div className={classes.view}>
      <h1 className={classes.page_title}>
        Todos
        <div className={classes.page_sub}>Tasks per family member</div>
      </h1>

      <MemberFilter
        persons={persons}
        selectedMember={selectedMember}
        onToggle={toggleFilter}
        onAll={showAll}
      />

      <div className={classes.board}>
        <Card title="TODO" badge={`${open.length}`}>
          {renderList(open)}
        </Card>
        <Card title="DONE" badge={`${done.length}`}>
          {renderList(done)}
        </Card>
      </div>

      <TaskForm persons={persons} onAdd={addTodo} />
    </div>
  );
}