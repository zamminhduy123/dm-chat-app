import React from "react";
import useTranslation from "../../adapter/translation.adapter";

interface TimeDividerProps {
  date: Date;
}

const TimeDivider = ({ date }: TimeDividerProps) => {
  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const { t } = useTranslation();
  return (
    <div
      style={{
        width: "100%",
        margin: "20px 0px",
        fontSize: "small",
        textAlign: "center",
        color: "rgb(130 165 199)",
      }}
    >
      {`${t(weekday[date.getDay()])} ${date.getHours()}:${date.getMinutes()}`}
    </div>
  );
};
export default TimeDivider;
