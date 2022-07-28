import React from "react";
import HorizontalLoading from "../UI/HorizontalLoading/HorizontalLoading";

import "./SyncAlert.scss";

const SyncAlert = () => {
  return (
    <div style={{ width: "100%", position: "relative" }}>
      <p id="sync-title">Syncing Message</p>
      <HorizontalLoading />
    </div>
  );
};

export default SyncAlert;
