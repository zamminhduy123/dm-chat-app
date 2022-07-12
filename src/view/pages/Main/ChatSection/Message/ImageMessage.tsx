import React, { useMemo } from "react";
import noImageUrl from "../../../../../assets/no-image.png";
import { FileEntity, MessageEntity } from "../../../../../entities";

interface ImageMessageProps {
  message: MessageEntity;
  onLoad: any;
}

const ImageMessage = ({ message, onLoad }: ImageMessageProps) => {
  const messageContent = message.content as FileEntity;
  const src = messageContent.content;
  return (
    <div
      style={{
        height: "200px",
      }}
    >
      <img
        style={{
          objectFit: "cover",
          maxWidth: "300px",
          maxHeight: "200px",
          justifySelf: "flex-start",
          borderRadius: "4px",
          cursor: "pointer",
        }}
        onLoad={onLoad}
        onClick={() => {
          if (message) window.electronAPI.photo.viewPhoto(message);
        }}
        src={src}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null; // prevents looping
          currentTarget.src = noImageUrl;
        }}
      />
    </div>
  );
};

export default React.memo(ImageMessage);
