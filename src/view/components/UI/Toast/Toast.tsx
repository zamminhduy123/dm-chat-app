import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import ReactDOM from "react-dom";
import "./Toast.scss";

export interface Toast {
  id: string;
  title: string;
  message: string;
  color: "primary" | "secondary" | "danger" | "success" | "warning" | "info";
  icon: IconProp;
}

export interface ToastProps {
  toastList: Toast[];
  position?: string;
  autoDelete?: Boolean;
  autoDeleteTime?: number;
}

const modalRoot = document.getElementById("modal-root") as HTMLElement;

const Toast: React.FC<ToastProps> = ({
  toastList,
  position = "bottom-middle",
  autoDelete = true,
  autoDeleteTime = 3000,
}: ToastProps) => {
  const el = React.useRef(document.createElement("div"));
  const [list, setList] = React.useState(toastList);
  const deleteToast = () => {
    list.splice(0, 1);
    setList([...list]);
  };
  React.useEffect(() => {
    setList(toastList);
    const interval = setInterval(() => {
      if (autoDelete && list.length) {
        deleteToast();
      }
    }, autoDeleteTime);

    const current = el.current;

    // We assume `modalRoot` exists with '!'
    modalRoot!.appendChild(current);
    return () => {
      clearInterval(interval);
      modalRoot!.removeChild(current);
    };
  }, []);

  const component = list.length ? (
    <div className="toast-container">
      {list.map((el, id) => (
        <div key={el.id} id="toast" className={`${el.color} show`}>
          <div className="toast-img">
            <FontAwesomeIcon icon={el.icon} />
          </div>
          <div>
            <p className="toast-title">{el.title}</p>
            <p className="toast-message">{el.message}</p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <></>
  );

  return ReactDOM.createPortal(component, el.current);
};
export default Toast;
