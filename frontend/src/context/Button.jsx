import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  variant = "primary",
  size = "md",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 whitespace-nowrap";

  const variantStyles = {
    primary:
      "bg-sky-500 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-600 hover:shadow-xl hover:shadow-sky-500/30",
    secondary:
      "border border-white/10 bg-white/[0.04] text-slate-200 hover:border-sky-400/40 hover:bg-sky-500/10 hover:text-white",
    danger:
      "border border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:text-white",
  };

  const sizeStyles = {
    sm: "h-9 px-4 text-xs",
    md: "h-11 px-5 text-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
};

export default Button;
