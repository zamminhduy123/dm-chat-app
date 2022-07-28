import React from "react";
import "./LoadingList.scss";

const OneLoadingItem = () => {
  return (
    <div className="loading-list-container" style={{ padding: "0px 16px" }}>
      <div className="ph-item">
        <div className="ph-col-2">
          <div className="ph-avatar"></div>
        </div>
        <div style={{ marginLeft: "8px" }}>
          <div className="ph-row">
            <div className="ph-col-8"></div>
            <div className="ph-col-4 empty"></div>
            <div className="ph-col-10" style={{ marginTop: "16px" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneLoadingItem;
