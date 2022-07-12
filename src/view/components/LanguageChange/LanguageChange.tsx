import React from "react";
import useTranslation from "../../adapter/translation.adapter";
import "./LanguageChange.scss";

const LanguageChange = () => {
  const { t, changeLang, lang } = useTranslation();
  return (
    <div className="d-flex flex-center" style={{ marginTop: "8px" }}>
      <div
        className={`form-change-language ${lang === "eng" ? "selected" : ""}`}
        onClick={() => {
          changeLang("eng");
        }}
      >
        {t("English")}
      </div>
      <div
        className={`form-change-language ${lang === "vn" ? "selected" : ""}`}
        onClick={() => {
          changeLang("vn");
        }}
      >
        {t("Vietnamese")}
      </div>
    </div>
  );
};
export default LanguageChange;
