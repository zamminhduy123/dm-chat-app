import React from "react";
import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { isValidHttpUrl } from "../../../utils/utils";

interface RenderInWindowProps {
  children: React.ReactNode;
  url?: string;
  close: Function;
}

const NewWindow = (props: RenderInWindowProps) => {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const newWindow = React.useRef<Window | null>(window);

  useEffect(() => {
    const div = document.createElement("div");
    setContainer(div);

    return () => {
      props.close();
    };
  }, []);

  useEffect(() => {
    let curWindow: any;
    if (container) {
      if (newWindow && newWindow.current !== null) {
        newWindow.current = window.open(
          props.url ? (isValidHttpUrl(props.url) ? props.url : "") : "",
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

  useEffect(() => {
    if (newWindow.current)
      newWindow.current.onbeforeunload = () => {
        close();
        props.close();
      };
  });

  return container && createPortal(props.children, container);
};
export default NewWindow;
