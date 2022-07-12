import "./Button.scss";

import Icon from "../Icon/Icon";
import Spinner from "../Spinner/Spinner";

interface ButtonProps {
  color:
    | "primary"
    | "secondary"
    | "danger"
    | "success"
    | "warning"
    | "info"
    | "gradient-primary";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant: "text" | "contained" | "outlined";
  size?: "full" | "small" | "medium" | "large";
  onClick?: () => void;
  children?: React.ReactNode;
  startIcon?: React.ReactNode;
  isLoading?: Boolean;
  endIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
  let className = `${props.variant} ${props.color}`;
  if (props.size) {
    className += ` ${props.size}`;
  } else {
    className += ` medium`;
  }
  let content = (
    <>
      {props.startIcon}
      {props.children}
      {props.endIcon}
    </>
  );
  if (props.isLoading) {
    content = <Spinner white size={"small"} />;
  }
  return (
    <button
      className={className}
      onClick={props.onClick}
      disabled={props.disabled || (props.isLoading ? true : false)}
      type={props.type || "button"}
    >
      {content}
    </button>
  );
};

export default Button;
