import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../../../components/modal/modal";
import controls from "../../../components/forms/form_controls.module.css";

export default function FolderForm({ onClose, onSave }) {
  const { t } = useTranslation();
  const [name, setName] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onSave?.(name.trim());
    onClose();
  };

  return (
    <Modal
      title={t("files.newFolderTitle")}
      onClose={onClose}
      onSave={submit}
      saveDisabled={!name.trim()}
    >
      <label className={controls.row}>
        <span className={controls.lbl}>{t("files.nameLabel")}</span>
        <input
          className={controls.input}
          value={name}
          placeholder={t("files.folderNamePlaceholder")}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
      </label>
    </Modal>
  );
}
