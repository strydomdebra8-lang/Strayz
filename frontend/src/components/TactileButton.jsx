import React from "react";

export const TactileButton = React.forwardRef(function TactileButton(
  {
    children,
    color = "#38BDF8",
    textColor = "#FFFFFF",
    size = "md",
    className = "",
    onClick,
    disabled,
    type = "button",
    icon: Icon,
    ...rest
  },
  ref
) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  };
  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`tactile-btn font-display uppercase tracking-wide inline-flex items-center justify-center gap-2 ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: color, color: textColor }}
      {...rest}
    >
      {Icon ? <Icon className="w-5 h-5" strokeWidth={3} /> : null}
      <span>{children}</span>
    </button>
  );
});

export default TactileButton;
