import "./Backdrop.scss";

interface Backdrop {
  show: Boolean;
  onClick?: () => void;
}

const BackDrop = ({ show, onClick }: Backdrop) => {
  return show ? <div className="backdrop" onClick={onClick}></div> : null;
};

export default BackDrop;
