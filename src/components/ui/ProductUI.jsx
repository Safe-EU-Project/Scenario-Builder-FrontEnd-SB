import "./ProductUI.css";

export function PageHeader({ eyebrow, title, description, actions, className = "" }) {
  return (
    <header className={`product-page-header ${className}`}>
      <div>
        {eyebrow && <p className="product-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="product-page-description">{description}</p>}
      </div>
      {actions && <div className="product-page-actions">{actions}</div>}
    </header>
  );
}

export function StatusBadge({ tone = "neutral", children, className = "" }) {
  return (
    <span className={`product-status product-status--${tone} ${className}`}>
      {children}
    </span>
  );
}

export function SurfaceCard({ children, className = "", as = "section" }) {
  const CardElement = as;
  return <CardElement className={`product-card ${className}`}>{children}</CardElement>;
}

export function ProductButton({
  variant = "secondary",
  className = "",
  type = "button",
  children,
  ...props
}) {
  return (
    <button type={type} className={`product-button product-button--${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function StatePanel({
  icon: Icon,
  tone = "neutral",
  title,
  description,
  action,
  compact = false,
}) {
  return (
    <div className={`product-state product-state--${tone} ${compact ? "product-state--compact" : ""}`}>
      {Icon && <Icon className="product-state-icon" />}
      <div>
        <strong>{title}</strong>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="product-state-action">{action}</div>}
    </div>
  );
}
