import React, { useMemo } from "react";
import noImageUrl from "../../../../../assets/no-image.png";
import { FileEntity, MessageEntity } from "../../../../../entities";
import ImageViewer from "../../../../components/ImageViewer/ImageViewer";
import NewWindow from "../../../../components/NewWindow/NewWindow";

interface ImageMessageProps {
  message: MessageEntity;
  onLoad?: any;
}

const ImageMessage = ({ message, onLoad }: ImageMessageProps) => {
  const messageContent = message.content as FileEntity;
  const src = messageContent.content;
  const [openImageViewer, setOpenImageViewer] = React.useState(false);
  return (
    <div
      style={{
        minHeight: "50px",
        height: "fit-content",
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
        onClick={() => {
          if (message) {
            if (window.electronAPI) window.electronAPI.photo.viewPhoto(message);
            else {
              setOpenImageViewer(true);
            }
          }
        }}
        src={src}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null; // prevents looping
          currentTarget.src = noImageUrl;
        }}
      />
      {openImageViewer ? (
        <NewWindow url={src} close={() => setOpenImageViewer(false)}>
          <img width={"100%"} height="100%" src={src} />
        </NewWindow>
      ) : null}
    </div>
  );
};

export default React.memo(ImageMessage);
