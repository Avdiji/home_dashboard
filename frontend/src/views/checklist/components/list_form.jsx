import { useState } from "react";
import Modal from "../../../components/modal/modal";
import controls from "../../../components/forms/form_controls.module.css";
import classes from "./list_form.module.css";

export default function ListForm({ onClose, onSave }) {
  const [title, setTitle] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    onSave?.({ title: title.trim(), personIds: [] });
    onClose();
  };

  return (
    <Modal
      title="New list"
      onClose={onClose}
      onSave={submit}
      saveDisabled={!title.trim()}
      className={classes.tallDialog}
    >
      <label className={controls.row}>
        <span className={controls.lbl}>Title</span>
        <input
          className={controls.input}
          value={title}
          placeholder="List name"
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
    </Modal>
  );
}