export function Button({ children, onClick, variant = "default", className = "" }) {
  const base = "px-4 py-2 rounded text-white";
  const styles = {
    default: "bg-blue-600 hover:bg-blue-700",
    outline: "bg-white border border-gray-400 text-black hover:bg-gray-100"
  };
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}