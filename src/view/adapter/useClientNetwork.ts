import React from "react";
import SocketController from "../../controller/SocketController/SocketController";

const useClientNetwork = () => {
  const [networkError, setNetworkError] = React.useState(false);
  const netwrokOnl = () => {
    setNetworkError(false);
  };
  const netwrokOff = () => {
    setNetworkError(true);
  };
  React.useEffect(() => {
    setNetworkError(!window.navigator.onLine);
  }, [window.navigator.onLine]);
  React.useEffect(() => {
    window.addEventListener("online", netwrokOnl);
    window.addEventListener("offline", netwrokOff);

    return () => {
      window.removeEventListener("online", netwrokOnl);
      window.removeEventListener("offline", netwrokOff);
    };
  }, []);
  return networkError;
};
export default useClientNetwork;
