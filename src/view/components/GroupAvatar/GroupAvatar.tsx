import React from "react";
import Avatar from "../Avatar/Avatar";
import "./GroupAvatar.scss";

interface GroupAvatarProps {
  avatars: string[];
}

const GroupAvatar = ({ avatars }: GroupAvatarProps) => {
  return (
    <div className="group-avatar-container d-flex">
      {avatars
        .slice(0, avatars.length > 4 ? 4 : avatars.length)
        .map((avatar, index) => {
          let id = "";
          if (avatars.length === 3 && index === 0) {
            id = "first-avatar-expand";
          } else if (avatars.length > 4 && index === 3) {
            id = "last-avatar-number";
          }
          return (
            <div key={avatar} id={id}>
              {index < 3 || avatars.length === 4 ? (
                <Avatar size="extra-small" src={avatar} left={false} />
              ) : (
                <p>{avatars.length}</p>
              )}
            </div>
          );
        })}
    </div>
  );
};

export default GroupAvatar;
