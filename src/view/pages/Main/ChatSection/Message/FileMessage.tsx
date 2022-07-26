import {
  faDownload,
  faFile,
  faFileCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { Link } from "react-router-dom";
import {
  FileEntity,
  MessageEntity,
  MessageStatus,
} from "../../../../../entities";
import useTranslation from "../../../../adapter/translation.adapter";
import Icon from "../../../../components/UI/Icon/Icon";
import RadialProgressBar from "../../../../components/UI/RadialProgressBar/RadialProgressBar";

import EventEmitter from "../../../../../utils/event-emitter";
import { messageConstants } from "../../../../action";
import { humanFileSize } from "../../../../../utils/fileSizeConverter";

interface FileMessageProps {
  message: MessageEntity;
}

const FileMessage = ({ message }: FileMessageProps) => {
  const [progress, setProgress] = React.useState(0);
  const { t } = useTranslation();
  // React.useEffect(() => {
  //   let interval = setInterval(() => {
  //     setProgress((prev) => {
  //       if (prev < 90) {
  //         return prev + 30;
  //       }
  //       return prev;
  //     });
  //   }, 1000);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, []);

  const uploadProgressUpdate = ({ progress, clientId }: any) => {
    console.log(progress, clientId);
    if (clientId === message.clientId) {
      setProgress(progress);
    }
  };

  const listener = EventEmitter.addListener(
    messageConstants.PROGRESS_UPLOAD,
    uploadProgressUpdate
  );

  let name = "",
    size = 0,
    content = "#";
  if (typeof message.content !== "string") {
    name = message.content.name;
    size = message.content.size;
    content = message.content.content;
  }
  const [downloadProgress, setDownloadProgress] = React.useState(0);
  React.useEffect(() => {
    let timeout: any;
    if (downloadProgress === 100) {
      timeout = setTimeout(() => {
        setDownloadProgress(0);
      }, 1000);
    }
    return () => {
      timeout ?? clearTimeout(timeout);
      listener.remove();
    };
  }, [downloadProgress]);

  return (
    <div className="d-flex flex-center" style={{ padding: "4px" }}>
      <div style={{ flex: 0, marginRight: "8px" }}>
        {!message.id ? (
          <RadialProgressBar
            progress={progress}
            finishIcon={faFileCircleCheck}
          />
        ) : (
          <div>
            <FontAwesomeIcon
              style={{ color: "inherit", width: "20px", height: "20px" }}
              icon={faFile}
            />
          </div>
        )}
      </div>
      <div
        className="d-flex flex-column"
        style={{
          flex: 1,
          height: "100%",
          alignItems: "space-between",
          marginRight: "16px",
        }}
      >
        <p style={{ fontSize: "small", lineHeight: "25px" }}>
          {t("name")}: {name}
        </p>
        <p style={{ fontSize: "x-small", letterSpacing: "1px" }}>
          size: {humanFileSize(size)} byte
        </p>
      </div>
      {message.id && +message.status !== MessageStatus.ERROR ? (
        <div
          className="d-flex flex-center"
          style={{
            width: "30px",
            height: "30px",
            cursor: "pointer",
          }}
          onClick={async () => {
            if (window.electronAPI) {
              // console.log(window.electronAPI.files.downloadFile, content, name);
              await window.electronAPI.files.downloadFile(
                content,
                name,
                message.id || message.clientId!
              );
              window.electronAPI.files.onDownloadProgress(
                (progress: number, id: string) => {
                  if (id === message.id)
                    setDownloadProgress(Math.ceil(progress));
                }
              );
              window.electronAPI.files.onDownloadComplete(
                (item: string, id: string) => {
                  if (id === message.id) setDownloadProgress(100);
                }
              );
            }
          }}
        >
          {downloadProgress === 0 ? (
            <Icon icon={faDownload} rounded />
          ) : (
            <RadialProgressBar
              progress={downloadProgress}
              finishIcon={faDownload}
            />
          )}
        </div>
      ) : null}
    </div>
  );
};
export default React.memo(FileMessage);
