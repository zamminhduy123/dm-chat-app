import React from "react";
import "./Avatar.scss";

import defaultPicUrl from "../../../assets/default-avatar.png";

interface AvatarProps {
  src?: string;
  style?: "normal" | "rounded";
  left?: Boolean;
  right?: Boolean;
  notify?: Boolean;
  size?: "extra-small" | "small" | "medium" | "large" | "extra-large";
}

const Avatar: React.FC<AvatarProps> = ({
  src = defaultPicUrl,
  style = "rounded",
  left = true,
  right = false,
  notify = false,
  size = "large",
}: AvatarProps) => {
  const className = [
    "avatar",
    size,
    style,
    notify ? "notify" : "",
    left ? "left" : right ? "right" : "",
  ].join(" ");
  return (
    <div className={className}>
      <img className={style} src={src || defaultPicUrl} alt="avatar" />
    </div>
  );
};

export default Avatar;
