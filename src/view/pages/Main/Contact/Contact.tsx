import { t } from "i18next";
import React from "react";
import useTranslation from "../../../adapter/translation.adapter";
import Empty from "../../../components/Empty/Empty";
import LoadingList from "../../../components/LoadingSkeleton/LoadingList";

export interface MainProps {}

const Contact = (props: MainProps) => {
  const { t } = useTranslation();
  return (
    <div>
      {/* <LoadingList /> */}
      <Empty message={t("Friend list empty")} />
    </div>
  );
};
export default Contact;
