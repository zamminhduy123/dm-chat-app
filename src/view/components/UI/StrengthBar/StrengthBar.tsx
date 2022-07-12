import React from "react";
import "./StrengthBar.scss";
export type StrengthBarProps = {
  dataStrength: number;
  length: number;
  strength: string;
  message: string;
};

const StrengthBar = ({
  dataStrength,
  length,
  strength,
  message,
}: StrengthBarProps) => {
  const strengthClass = ["strength-bar", length > 0 ? "" : "invisible"]
    .join(" ")
    .trim();

  return (
    <div
      className={strengthClass}
      style={{ fontSize: "11px", padding: "0px 1px" }}
    >
      <div className="d-flex flex-between">
        <p className="strength-value" data-strength={dataStrength}>
          {strength}
        </p>
        <p className="strength-message" data-strength={dataStrength}>
          {message}
        </p>
      </div>
      <div className="strength-meter">
        <div className="strength-meter-fill" data-strength={dataStrength}></div>
      </div>
    </div>
  );
};

export default StrengthBar;
