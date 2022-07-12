import React from "react";
import Avatar from "../../../components/Avatar/Avatar";

import Notification from "../../../components/UI/Notification/Notification";

type AutoLoginProps = {
  type: string;
  message: string;
};

const AutoLogin = ({ type, message }: AutoLoginProps) => {
  return (
    <div className="form flex-center">
      <div className="auto-authenticate">
        <h2 className="mb-2 text-primary font-500">DM</h2>
        <Notification
          variant="outlined"
          border={false}
          vertical={true}
          type={type}
          message={message}
        />
      </div>
    </div>
  );
};

export default AutoLogin;
