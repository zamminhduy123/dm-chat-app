import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

const ImageViewer = ({ src, onClose }: { src: string; onClose: Function }) => {
  const newWindow = useMemo(() => {
    return window.open(
      "about:blank",
      "newWin",
      `width=400,height=300,left=${window.screen.availWidth / 2 - 200},top=${
        window.screen.availHeight / 2 - 150
      }`
    );
  }, []);
  if (newWindow)
    newWindow.onbeforeunload = () => {
      close();
    };
  useEffect(() => () => {
    newWindow?.close();
    onClose();
  });
  if (newWindow)
    return createPortal(
      <div>
        <img width={"100%"} height="100%" src={src} />
      </div>,
      newWindow.document.body
    );
  return null;
};

export default ImageViewer;
