import { SizeProp } from "@fortawesome/fontawesome-svg-core";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import React, { RefObject } from "react";
import "./ScrollBottomButton.scss";
interface ScrollBottomButtonProps {
  bottomRef?: RefObject<HTMLDivElement>;
  size?: SizeProp;
  bottom: string;
  right: string;
  onClick?: Function;
}

const ScrollBottomButton = ({
  bottomRef,
  size = "1x",
  bottom,
  right,
  onClick = () => {},
}: ScrollBottomButtonProps) => {
  const scrollToBottom = () => {
    if (bottomRef) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    onClick();
  };
  return (
    <div
      className="d-flex flex-center scroll-bottom-button"
      onClick={scrollToBottom}
      style={{
        bottom: `${bottom}`,
        right: `${right}`,
      }}
    >
      <FontAwesomeIcon icon={faAngleDown} size={size} />
    </div>
  );
};

export default ScrollBottomButton;
