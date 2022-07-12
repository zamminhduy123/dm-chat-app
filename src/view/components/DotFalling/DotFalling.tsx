import React from "react";

import "./DotFalling.scss";

interface DotFallingProps {
  size?: "small" | "medium" | "large";
}

const DotFalling = ({ size = "large" }: DotFallingProps) => {
  return <div className={`dot-falling ${size}`}></div>;
};
export default DotFalling;
