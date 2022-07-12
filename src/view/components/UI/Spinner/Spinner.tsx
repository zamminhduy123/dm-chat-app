import "./Spinner.scss";

interface SpinnerProps {
  size?: "small" | "medium" | "large";
  white?: Boolean;
}

const Spinner = ({ size = "medium", white = false }: SpinnerProps) => {
  return (
    <div className={`lds-ring lds-${size} ${white ? "lds-white" : ""}`}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default Spinner;
