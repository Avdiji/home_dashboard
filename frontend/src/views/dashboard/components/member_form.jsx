import { useState } from "react";
import Modal from "../../../components/modal/modal";
import controls from "../../../components/forms/form_controls.module.css";

export default function MemberForm({ person = null, onClose, onSave, onUpdate }) {
  const [name, setName] = useState(person?.name ?? "");

  const submit = () => {
    if (!name.trim()) return;
    if (person) onUpdate?.(person.id, { name: name.trim() });
    else onSave?.({ name: name.trim() });
    onClose();
  };

  return (
    <Modal
      title={person ? "Edit member" : "New member"}
      onClose={onClose}
      onSave={submit}
      saveDisabled={!name.trim()}
    >
      <label className={controls.row}>
        <span className={controls.lbl}>Name</span>
        <input
          className={controls.input}
          value={name}
          placeholder="Member name"
          onChange={(e) => setName(e.target.value)}
        />
      </label>
    </Modal>
  );
}