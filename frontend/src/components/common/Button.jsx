const Button = ({
  children,
  type = "button",
  disabled = false,
  loading = false,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}) => {
  const variants = {
    primary: "bg-blue-500 text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 hover:bg-blue-600 hover:shadow-blue-500/30",
    secondary: "border border-stone-200 bg-white text-stone-800 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-200",
    ghost: "bg-transparent text-stone-600 hover:bg-blue-50 hover:text-blue-800 dark:text-stone-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-200",
    destructive: "border border-red-300/40 bg-red-500/10 text-red-700 hover:bg-red-600 hover:text-white dark:text-red-300",
    outline: "border border-stone-200 bg-transparent text-stone-700 hover:border-blue-300 hover:bg-blue-50 dark:border-white/10 dark:text-stone-300 dark:hover:bg-blue-500/10",
    danger: "border border-red-300/40 bg-red-500/10 text-red-700 hover:bg-red-600 hover:text-white dark:text-red-300",
  };
  const sizes = { sm: "h-9 px-4 text-xs", md: "h-11 px-5 text-sm", lg: "h-12 px-6 text-sm" };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-bold transition-all duration-200 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
      <span className={loading ? "opacity-80" : ""}>{children}</span>
    </button>
  );
};

export default Button;
