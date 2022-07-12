import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Icon from "../UI/Icon/Icon";

interface SideBarItemProps {
  icon: IconProp;
  onClick?: () => void;
  selected?: boolean;
}

const SideBarItem: React.FC<SideBarItemProps> = ({
  icon,
  selected = false,
}: SideBarItemProps) => {
  let className = "side-bar-btn-icon d-flex flex-center";
  if (selected) className += " selected";
  return (
    <div className={"side-bar-btn"}>
      <div className={`selector ${selected && "selected"}`}></div>
      <div className={className}>
        <FontAwesomeIcon icon={icon} />
      </div>
    </div>
  );
};

export default SideBarItem;
