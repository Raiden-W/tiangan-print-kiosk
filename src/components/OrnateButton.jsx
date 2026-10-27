export default function OrnateButton({ children, className = '', ...props }) {
  return <button className={`ornate-button ${className}`} {...props}>
    <img className="button-frame" src="./ui/elements/main button border.png" alt="" draggable="false" /><span>{children}</span>
  </button>
}
