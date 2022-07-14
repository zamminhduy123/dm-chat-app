import React, { useMemo } from "react";
import noImageUrl from "../../../../../assets/no-image.png";
import { FileEntity, MessageEntity } from "../../../../../entities";

interface ImageMessageProps {
  message: MessageEntity;
  onLoad?: any;
}

const VideoMessage = ({ message, onLoad }: ImageMessageProps) => {
  const messageContent = message.content as FileEntity;
  const src = messageContent.content;
  return (
    <div
      style={{
        height: "300px",
      }}
    >
      <video
        controls
        style={{
          height: "300px",
        }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
};

export default React.memo(VideoMessage);
