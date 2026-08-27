import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../../components/modal/modal";
import controls from "../../../components/forms/form_controls.module.css";
import classes from "./list_form.module.css";

export default function ListForm({ onClose, onSave }) {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");

  const submit = () => {
    if (!title.trim()) return;
    onSave?.({ title: title.trim(), personIds: [] });
    onClose();
  };

  return (
    <Modal
      title={t("checklist.newListTitle")}
      onClose={onClose}
      onSave={submit}
      saveDisabled={!title.trim()}
      className={classes.tallDialog}
    >
      <label className={controls.row}>
        <span className={controls.lbl}>{t("checklist.titleLabel")}</span>
        <input
          className={controls.input}
          value={title}
          placeholder={t("checklist.listNamePlaceholder")}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
    </Modal>
  );
}