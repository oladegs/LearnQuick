const PageHeader = ({ title, subtitle, eyebrow, children }) => (
  <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h1 className="text-3xl font-extrabold tracking-[-0.035em] text-stone-950 dark:text-white sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 dark:text-stone-400">{subtitle}</p>}
    </div>
    {children && <div className="shrink-0">{children}</div>}
  </header>
);

export default PageHeader;
