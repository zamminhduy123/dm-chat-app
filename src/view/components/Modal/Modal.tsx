import { faXmark } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import ReactDOM from "react-dom";
import useTranslation from "../../adapter/translation.adapter";
import Backdrop from "../UI/Backdrop/Backdrop";
import Icon from "../UI/Icon/Icon";
import "./Modal.scss";

interface ModalProps {
  children: React.ReactNode;
  isOpen: Boolean;
  hasBackdrop?: Boolean;
  top?: Boolean;
  handleClose: () => void;
  title?: string;
  style?: "normal" | "dark";
}

const modalRoot = document.getElementById("modal-root") as HTMLElement;

function Modal({
  children,
  isOpen,
  handleClose,
  hasBackdrop = false,
  top = false,
  title = "",
  style = "normal",
}: ModalProps) {
  if (!isOpen) return null;

  const el = React.useRef(document.createElement("div"));

  React.useEffect(() => {
    while (modalRoot!.firstChild) {
      modalRoot!.removeChild(modalRoot!.firstChild);
    }
    // Use this in case CRA throws an error about react-hooks/exhaustive-deps
    const current = el.current;

    // We assume `modalRoot` exists with '!'
    modalRoot!.appendChild(current);
    return () => {
      console.log("Modal unmount");
      while (modalRoot!.firstChild) {
        modalRoot!.removeChild(modalRoot!.firstChild);
      }
    };
  }, []);

  React.useEffect(() => {
    const closeOnEscapeKey = (e: any) =>
      e.key === "Escape" ? handleClose() : null;
    document.body.addEventListener("keydown", closeOnEscapeKey);
    return () => {
      document.body.removeEventListener("keydown", closeOnEscapeKey);
    };
  }, [handleClose]);

  const { t } = useTranslation();

  return ReactDOM.createPortal(
    <>
      {hasBackdrop ? (
        <Backdrop show={hasBackdrop} onClick={() => handleClose()} />
      ) : null}
      <div className={`modal`}>
        <div
          className={`modal-container ${style === "dark" ? "dark" : "normal"}`}
        >
          {title ? (
            <div className="modal-title">
              <h2 className="text-primary font-500 mb-1">{t(title)}</h2>
              <Icon icon={faXmark} onClick={() => handleClose()} />
            </div>
          ) : null}
          {children}
        </div>
      </div>
    </>,
    el.current
  );
}
export default Modal;
