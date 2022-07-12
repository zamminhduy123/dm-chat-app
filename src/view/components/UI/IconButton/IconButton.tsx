import React from "react";
import "./IconButton.scss";

interface IconButtonProps {
  icon: React.ReactNode;
}

const IconButton: React.FC<IconButtonProps> = ({ icon }: IconButtonProps) => {
  return <div className="icon-btn">{icon}</div>;
};

export default IconButton;
