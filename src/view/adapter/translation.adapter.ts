import i18n from "../../utils/i18n/i18n";

export default function useTranslation() {
  return {
    lang: i18n.language,
    changeLang: i18n.changeLanguage,
    t: i18n.t,
  };
}
