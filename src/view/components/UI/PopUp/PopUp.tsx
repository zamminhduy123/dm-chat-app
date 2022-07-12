import React from "react";
import "./PopUp.scss";

interface ToolTipProps {
  children?: React.ReactNode;
  isOpen: Boolean;
  closeHandler: () => void;
  top?: Boolean;
  right?: Boolean;
}

export default function PopUp({
  children,
  isOpen,
  closeHandler,
  top = true,
  right = false,
}: ToolTipProps) {
  if (!isOpen) return null;
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const handleClickOutside = React.useCallback((event: any) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      closeHandler();
    }
  }, []);

  React.useEffect(() => {
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };

    return () => {};
  }, [wrapperRef]);

  const position = [top ? "top" : "down", right ? "right" : "left"].join(" ");

  return (
    <div ref={wrapperRef} id="popup" className={position}>
      {children}
    </div>
  );
}
