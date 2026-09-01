import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Clock3,
  FilePlus2,
  FileText,
  MessageSquareText,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import progressService from "../../services/progressService";
import Button from "../../components/common/Button";
import Skeleton from "../../components/common/Skeleton";
import StatCard from "../../components/common/StatCard";

const DashboardPage = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await progressService.getDashboardData();
      setDashboardData(data.data);
    } catch (requestError) {
      setError(requestError.message || "We couldn't load your learning overview.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const recentActivities = useMemo(() => [
    ...(dashboardData?.recentActivity?.documents || []).map((doc) => ({
      id: doc._id,
      title: doc.title,
      label: "Opened document",
      timestamp: doc.lastAccessed,
      link: `/documents/${doc._id}`,
      icon: FileText,
    })),
    ...(dashboardData?.recentActivity?.quizzes || []).map((quiz) => ({
      id: quiz._id,
      title: quiz.title,
      label: quiz.completedAt ? "Completed quiz" : "Created quiz",
      timestamp: quiz.completedAt || quiz.createdAt,
      link: `/quizzes/${quiz._id}`,
      icon: BrainCircuit,
    })),
  ].filter((activity) => activity.timestamp).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 6), [dashboardData]);

  if (loading) {
    return (
      <div role="status" aria-label="Loading dashboard" className="space-y-6">
        <Skeleton className="h-56 w-full rounded-[24px]" />
        <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-36" />)}</div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><Skeleton className="h-80" /><Skeleton className="h-80" /></div>
        <span className="sr-only">Loading your learning workspace...</span>
      </div>
    );
  }

  if (error || !dashboardData?.overview) {
    return (
      <section className="surface-card mx-auto flex min-h-80 max-w-xl flex-col items-center justify-center rounded-[22px] p-8 text-center">
        <RefreshCw className="mb-5 h-10 w-10 text-orange-500" />
        <h1 className="text-xl font-bold text-stone-950 dark:text-white">We couldn&apos;t load your dashboard.</h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">{error || "Please try again in a moment."}</p>
        <Button onClick={fetchDashboardData} className="mt-6">Try again</Button>
      </section>
    );
  }

  const { overview, recentActivity } = dashboardData;
  const latestDocument = recentActivity?.documents?.[0];
  const firstName = user?.username?.split(/[\s_-]/)[0] || "Learner";
  const stats = [
    { label: "Documents", value: overview.totalDocuments, detail: "Sources in your library", icon: FileText },
    { label: "Flashcards", value: overview.totalFlashcards, detail: `${overview.reviewedFlashcards || 0} reviewed`, icon: BookOpen },
    { label: "Quizzes", value: overview.totalQuizzes, detail: `${overview.completedQuizzes || 0} completed`, icon: BrainCircuit },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[24px] bg-[#171717] p-7 text-white shadow-2xl shadow-stone-950/15 sm:p-9 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_18%,rgba(249,115,22,0.38),transparent_22rem),linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-size-[auto,32px_32px,32px_32px]" />
        <div className="relative max-w-3xl">
          <p className="eyebrow mb-3">Your learning command center</p>
          <h1 className="text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl lg:text-5xl">Welcome back, {firstName}.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-400 sm:text-base">Pick up where you left off, or turn a new document into explanations, flashcards, and quizzes.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/documents?upload=1" className="inline-flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5 hover:bg-orange-600"><FilePlus2 size={17} />Upload a document</Link>
            {latestDocument && <Link to={`/documents/${latestDocument._id}`} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 text-sm font-bold text-white transition-colors hover:bg-white/10">Continue learning<ArrowRight size={16} /></Link>}
          </div>
        </div>
      </section>

      <section aria-label="Learning statistics" className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="surface-card rounded-[20px] p-5 sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div><p className="eyebrow mb-2">Your momentum</p><h2 className="text-xl font-extrabold text-stone-950 dark:text-white">Recent activity</h2></div>
            <Clock3 className="h-5 w-5 text-orange-500" />
          </div>
          {recentActivities.length ? (
            <div className="divide-y divide-stone-200 dark:divide-white/10">
              {recentActivities.map((activity) => (
                <Link key={`${activity.label}-${activity.id}`} to={activity.link} className="group flex min-h-16 items-center gap-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-300"><activity.icon size={18} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-stone-500">{activity.label}</span><span className="block truncate text-sm font-bold text-stone-900 group-hover:text-orange-700 dark:text-stone-100 dark:group-hover:text-orange-300">{activity.title}</span></span>
                  <span className="hidden text-xs text-stone-500 sm:block">{new Date(activity.timestamp).toLocaleDateString()}</span>
                  <ArrowRight size={16} className="text-stone-400 transition-transform group-hover:translate-x-1 group-hover:text-orange-500" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-300 p-8 text-center dark:border-white/10">
              <p className="font-bold text-stone-900 dark:text-white">Nothing here yet.</p>
              <p className="mt-1 text-sm text-stone-500">Start studying and your recent activity will appear here.</p>
            </div>
          )}
        </section>

        <section className="surface-card rounded-[20px] p-5 sm:p-7">
          <p className="eyebrow mb-2">Move quickly</p>
          <h2 className="text-xl font-extrabold text-stone-950 dark:text-white">Quick actions</h2>
          <div className="mt-5 space-y-3">
            {[
              { icon: FilePlus2, label: "Upload document", detail: "Add new study material", to: "/documents?upload=1" },
              { icon: BookOpen, label: "Generate flashcards", detail: latestDocument ? `From ${latestDocument.title}` : "Choose a document first", to: latestDocument ? `/documents/${latestDocument._id}?tab=Flashcards` : "/documents" },
              { icon: BrainCircuit, label: "Create a quiz", detail: "Test your understanding", to: latestDocument ? `/documents/${latestDocument._id}?tab=Quizzes` : "/documents" },
              { icon: MessageSquareText, label: "Ask AI", detail: "Explore your latest source", to: latestDocument ? `/documents/${latestDocument._id}?tab=Chat` : "/documents" },
            ].map((action) => (
              <Link key={action.label} to={action.to} className="group flex min-h-15 items-center gap-3 rounded-xl border border-stone-200 p-3 transition-all hover:border-orange-300 hover:bg-orange-50 dark:border-white/10 dark:hover:bg-orange-500/10">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-700 group-hover:bg-orange-500 group-hover:text-white dark:bg-white/[0.05] dark:text-stone-300"><action.icon size={17} /></span>
                <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-stone-900 dark:text-white">{action.label}</span><span className="block truncate text-xs text-stone-500">{action.detail}</span></span>
                <Sparkles size={15} className="text-orange-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
