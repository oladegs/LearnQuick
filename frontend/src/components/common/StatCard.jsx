const StatCard = ({ label, value, detail, icon: Icon }) => (
  <article className="surface-card group relative overflow-hidden rounded-[18px] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl dark:hover:border-blue-400/30 sm:p-6">
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-700" />
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500 dark:text-stone-500">{label}</p>
        <p className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-stone-950 dark:text-white">{value}</p>
        {detail && <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">{detail}</p>}
      </div>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 transition-transform group-hover:scale-105 dark:text-blue-300">
        <Icon size={21} strokeWidth={2.3} />
      </span>
    </div>
  </article>
);

export default StatCard;
