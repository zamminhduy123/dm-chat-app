import React from "react";
import useTranslation from "../../adapter/translation.adapter";
import "./DropContainer.scss";

export default function DropContainer() {
  const { t } = useTranslation();
  const onImageDrop = () => {};
  return (
    <div
      id="dragOverlayMessageView"
      className="drag-over-overlay"
      onDrop={onImageDrop}
    >
      <div className="drag-title" data-translate-inner="STR_QUICK_SEND">
        {t("Quick send")}
      </div>
      <div className="drag-desc" data-translate-inner="STR_DROP_FILE_HERE">
        {t("Drop image here to send")}
      </div>
    </div>
  );
}
