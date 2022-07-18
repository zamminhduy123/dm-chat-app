import React from "react";
import "./LoadingList.scss";

const LoadingMessage = () => {
  return (
    <div className="loading-list-container">
      <div className="ph-item reverse">
        <div className="ph-row-small">
          <div className="ph-avatar-small"></div>
        </div>
        <div style={{ marginRight: "8px" }}>
          <div className="ph-row big" style={{ justifyContent: "flex-end" }}>
            <div className="ph-col-4" style={{ marginTop: "0px" }}></div>
          </div>
        </div>
      </div>
      <div className="ph-item">
        <div className="ph-row-small">
          <div className="ph-avatar-small"></div>
        </div>
        <div style={{ marginLeft: "8px" }}>
          <div className="ph-row big">
            <div className="ph-col-4" style={{ marginTop: "0px" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
