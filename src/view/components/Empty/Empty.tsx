import React from "react";
import search_empty_image from "../../../assets/No-data-pana.png";
import useTranslation from "../../adapter/translation.adapter";

interface EmptyProps {
  src?: string;
  title?: string;
  message?: string;
}
const Empty = ({ src, message, title }: EmptyProps) => {
  const { t } = useTranslation();
  return (
    <div className="w-100 d-flex flex-center mt-2 flex-column">
      <img height="300px" src={src || search_empty_image} />
      <b className="mt-2 text-s font-500 color-info">
        {title || t("Search empty")}
      </b>
      <b className="text-s font-500 color-info">
        {message || t("Please try other keyword")}
      </b>
    </div>
  );
};
export default Empty;
