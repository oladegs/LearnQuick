import { FileText, Plus } from "lucide-react";
import Button from "./Button";

const EmptyState = ({ onActionClick, title, description, buttonText, icon: Icon = FileText }) => (
  <div className="surface-card flex flex-col items-center justify-center rounded-[20px] border-dashed px-6 py-14 text-center">
    <div className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-300">
      <Icon className="h-8 w-8" strokeWidth={1.8} />
    </div>
    <h3 className="text-lg font-bold text-stone-950 dark:text-white">{title}</h3>
    <p className="mt-2 max-w-md text-sm leading-6 text-stone-600 dark:text-stone-400">{description}</p>
    {buttonText && onActionClick && (
      <Button onClick={onActionClick} className="mt-7"><Plus className="h-4 w-4" />{buttonText}</Button>
    )}
  </div>
);

export default EmptyState;
