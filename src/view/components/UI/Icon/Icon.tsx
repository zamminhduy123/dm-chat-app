import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";

import "./Icon.scss";

interface IconProps {
  type?: string;
  size?: "small" | "medium" | "large";
  icon: IconProp;
  selected?: Boolean;
  onClick?: () => void;
  colorNotActive?: string;
  rounded?: Boolean;
  style?: "contained" | "normal";
}

const Icon: React.FC<IconProps> = ({
  type,
  size = "medium",
  rounded = false,
  icon,
  onClick = () => {},
  selected = false,
  colorNotActive = "",
  style = "normal",
}: IconProps) => {
  const iconClassName = ["icon", "icon-" + size, type].join(" ");

  const containerClassName = [
    "icon-container",
    rounded ? "rounded" : "",
    "icon-container-" + size,
    selected ? "selected" : "",
    type,
    style,
  ].join(" ");
  return (
    <div
      className={containerClassName}
      style={{ color: `${colorNotActive} !important` }}
      onClick={onClick}
    >
      <FontAwesomeIcon className={iconClassName} icon={icon} />
    </div>
  );
};

export default Icon;
