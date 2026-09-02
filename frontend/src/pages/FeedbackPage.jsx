import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, MessageSquareHeart, Send, Sparkles, Star } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/common/Button";
import PageHeader from "../components/common/PageHeader";
import Skeleton from "../components/common/Skeleton";
import { useAuth } from "../context/AuthContext";
import feedbackService from "../services/feedbackService";
import { formatDate } from "../utils/formatDate";

const categories = ["General", "Feature request", "Bug", "UI/UX", "AI quality", "Other"];

const FeedbackPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: "", category: "General", rating: 5, message: "" });
  const [feedback, setFeedback] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [historyError, setHistoryError] = useState("");

  const loadFeedback = useCallback(async () => {
    setHistoryError("");
    try { const response = await feedbackService.getMyFeedback(); setFeedback(response.data || []); }
    catch (error) { setHistoryError(error.error || error.message || "We couldn't load your feedback history."); }
    finally { setLoadingHistory(false); }
  }, []);

  useEffect(() => { loadFeedback(); }, [loadFeedback]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setSubmitting(true);
    try {
      const response = await feedbackService.submitFeedback(form);
      setSuccessMessage(response.message);
      setFeedback((current) => [response.data, ...current]);
      setForm({ subject: "", category: "General", rating: 5, message: "" });
      toast.success(response.message);
    } catch (error) {
      toast.error(error.error || error.message || "Feedback could not be submitted.");
    } finally { setSubmitting(false); }
  };

  const inputClass = "mt-2 h-12 w-full rounded-xl border border-stone-300 bg-white px-4 text-sm text-stone-950 transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white";

  return (
    <div>
      <PageHeader eyebrow="Shape the product" title="Help us improve LearnQuick" subtitle="Tell us what is working, what is not, or what you would love to see next." />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="surface-card rounded-[20px] p-5 sm:p-7">
          <div className="mb-6 flex items-start gap-4 rounded-2xl bg-[#171717] p-5 text-white">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white"><MessageSquareHeart size={21} /></span>
            <div><h2 className="font-extrabold">Your perspective matters</h2><p className="mt-1 text-sm leading-6 text-stone-400">Your account identity is attached securely. We only ask for the feedback itself.</p></div>
          </div>

          <div className="mb-6 grid gap-3 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-2">
            <div><span className="block text-xs font-bold uppercase tracking-wide text-stone-500">Name</span><span className="mt-1 block truncate font-semibold text-stone-900 dark:text-white">{user?.username}</span></div>
            <div><span className="block text-xs font-bold uppercase tracking-wide text-stone-500">Email</span><span className="mt-1 block truncate font-semibold text-stone-900 dark:text-white">{user?.email}</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Category<select value={form.category} onChange={(event) => updateField("category", event.target.value)} className={inputClass}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Subject <span className="font-normal text-stone-500">(optional)</span><input type="text" value={form.subject} onChange={(event) => updateField("subject", event.target.value)} maxLength={120} placeholder="A short summary" className={inputClass} /></label>
            </div>

            <fieldset>
              <legend className="text-xs font-bold text-stone-700 dark:text-stone-300">How would you rate your experience?</legend>
              <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Experience rating">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button key={rating} type="button" onClick={() => updateField("rating", rating)} className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all hover:-translate-y-0.5 ${rating <= form.rating ? "border-blue-300 bg-blue-50 text-blue-500 dark:border-blue-400/30 dark:bg-blue-500/10" : "border-stone-200 text-stone-300 dark:border-white/10 dark:text-stone-600"}`} role="radio" aria-checked={form.rating === rating} aria-label={`${rating} star${rating === 1 ? "" : "s"}`}><Star size={20} fill={rating <= form.rating ? "currentColor" : "none"} /></button>
                ))}
              </div>
            </fieldset>

            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">Message<textarea value={form.message} onChange={(event) => updateField("message", event.target.value)} minLength={10} maxLength={2000} required rows={7} placeholder="Share what happened, what you expected, or what would make LearnQuick better..." className="mt-2 w-full resize-y rounded-xl border border-stone-300 bg-white p-4 text-sm leading-6 text-stone-950 transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 dark:border-white/10 dark:bg-black/20 dark:text-white" /><span className="mt-1 block text-right text-[11px] font-medium text-stone-500">{form.message.length}/2000</span></label>

            {successMessage && <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-300/50 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200"><CheckCircle2 className="h-5 w-5 shrink-0" /><span>{successMessage}</span></div>}
            <Button type="submit" size="lg" loading={submitting} className="w-full sm:w-auto"><Send className="h-4 w-4" />Submit feedback</Button>
          </form>
        </section>

        <section className="surface-card rounded-[20px] p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between"><div><p className="eyebrow mb-2">Your voice</p><h2 className="text-xl font-extrabold text-stone-950 dark:text-white">Recent feedback</h2></div><Sparkles className="h-5 w-5 text-blue-500" /></div>
          {loadingHistory ? <div className="space-y-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-28" />)}</div> : historyError ? <div className="rounded-xl border border-red-300/40 bg-red-50 p-4 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-200">{historyError}<button type="button" onClick={loadFeedback} className="ml-2 font-bold underline">Try again</button></div> : feedback.length === 0 ? <div className="rounded-2xl border border-dashed border-stone-300 px-6 py-12 text-center dark:border-white/10"><MessageSquareHeart className="mx-auto h-9 w-9 text-blue-500" /><h3 className="mt-4 font-bold text-stone-950 dark:text-white">You haven&apos;t submitted feedback yet.</h3><p className="mt-1 text-sm text-stone-500">Your recent responses will appear here.</p></div> : (
            <div className="space-y-3">
              {feedback.map((item) => (
                <article key={item._id} className="rounded-2xl border border-stone-200 p-4 dark:border-white/10">
                  <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:text-blue-300">{item.category}</span><time className="text-[11px] text-stone-500">{formatDate(item.createdAt)}</time></div>
                  {item.subject && <h3 className="mt-3 text-sm font-bold text-stone-950 dark:text-white">{item.subject}</h3>}
                  <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-6 text-stone-600 dark:text-stone-400">{item.message}</p>
                  <div className="mt-3 flex items-center justify-between"><span className="flex gap-0.5 text-blue-500">{Array.from({ length: item.rating }, (_, index) => <Star key={index} size={12} fill="currentColor" />)}</span><span className="text-[10px] font-bold uppercase tracking-wide text-stone-500">{item.status}</span></div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default FeedbackPage;
