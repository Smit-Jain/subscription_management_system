export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-paper rounded-2xl border border-border shadow-warm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
