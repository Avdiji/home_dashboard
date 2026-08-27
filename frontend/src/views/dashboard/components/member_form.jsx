import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../../components/modal/modal";
import controls from "../../../components/forms/form_controls.module.css";

export default function MemberForm({ person = null, onClose, onSave, onUpdate }) {
  const { t } = useTranslation();
  const [name, setName] = useState(person?.name ?? "");
  const [birthday, setBirthday] = useState(person?.birthday ?? "");

  const submit = () => {
    if (!name.trim()) return;
    const payload = { name: name.trim(), birthday: birthday || null };
    if (person) onUpdate?.(person.id, payload);
    else onSave?.(payload);
    onClose();
  };

  return (
    <Modal
      title={person ? t("dashboard.editMember") : t("dashboard.newMemberTitle")}
      onClose={onClose}
      onSave={submit}
      saveDisabled={!name.trim()}
    >
      <label className={controls.row}>
        <span className={controls.lbl}>{t("dashboard.nameLabel")}</span>
        <input
          className={controls.input}
          value={name}
          placeholder={t("dashboard.memberNamePlaceholder")}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label className={controls.row}>
        <span className={controls.lbl}>{t("dashboard.birthdayLabel")}</span>
        <input
          type="date"
          className={controls.input}
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />
      </label>
    </Modal>
  );
}