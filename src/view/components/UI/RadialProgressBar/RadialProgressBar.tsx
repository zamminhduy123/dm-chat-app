import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import "./RadialProgressBar.scss";

interface RadialProgressBarProps {
  progress: number;
  finishIcon?: IconProp;
}

const RadialProgressBar = ({
  progress,
  finishIcon,
}: RadialProgressBarProps) => {
  return (
    <div className="set-size charts-container">
      <div className={`pie-wrapper progress-${progress}`}>
        <span className="label">
          {progress < 100 || !finishIcon ? (
            <>
              {progress}
              <span className="smaller">%</span>
            </>
          ) : (
            <FontAwesomeIcon icon={finishIcon} />
          )}
        </span>
        <div className="pie">
          <div className="left-side half-circle"></div>
          <div className="right-side half-circle"></div>
        </div>
      </div>
    </div>
  );
};
export default RadialProgressBar;
