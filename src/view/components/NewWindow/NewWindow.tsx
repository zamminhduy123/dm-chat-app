import React from "react";
import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

interface RenderInWindowProps {
  children: React.ReactNode;

  close: Function;
}

const NewWindow = (props: RenderInWindowProps) => {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const newWindow = React.useRef<Window | null>(window);

  useEffect(() => {
    const div = document.createElement("div");
    setContainer(div);
  }, []);

  useEffect(() => {
    let curWindow: any;
    console.log(newWindow);
    if (container) {
      if (newWindow && newWindow.current !== null) {
        newWindow.current = window.open(
          "",
          "image-viewer",
          "popup,width=600,height=400,left=200,top=200"
        );
        newWindow.current?.document.body.appendChild(container);
        curWindow = newWindow.current;
      }
      return () => {
        curWindow.close();
        props.close();
      };
    }
  }, [container]);

  return container && createPortal(props.children, container);
};
export default NewWindow;
