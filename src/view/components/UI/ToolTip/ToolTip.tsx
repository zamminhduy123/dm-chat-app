import React from "react";

import "./ToolTip.scss";

interface ToolTipProps {}

const ToolTip = () => {
  return (
    <div className="tooltip">
      Hover over me
      <span className="tooltiptext">Tooltip text</span>
    </div>
  );
};

export default ToolTip;
