import { NavLink } from "react-router-dom";
import {
  BookOpen,
  BrainCircuit,
  FileText,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareHeart,
  Sparkles,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { to: "/dashboard", icon: LayoutDashboard, text: "Dashboard" },
  { to: "/documents", icon: FileText, text: "Documents" },
  { to: "/flashcards", icon: BookOpen, text: "Flashcards" },
  { to: "/about", icon: Info, text: "About" },
  { to: "/feedback", icon: MessageSquareHeart, text: "Feedback" },
];

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout, user } = useAuth();

  const handleNavClick = () => {
    if (window.innerWidth < 768) toggleSidebar();
  };

  return (
    <>
      <button
        type="button"
        aria-label="Close navigation"
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200 md:hidden ${isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={toggleSidebar}
      />

      <aside
        id="app-sidebar"
        aria-label="Primary navigation"
        className={`fixed left-0 top-0 z-50 flex h-full w-[268px] flex-col overflow-hidden border-r border-white/10 bg-[#111112] text-white shadow-2xl shadow-black/30 transition-all duration-300 ease-out md:sticky md:top-3 md:h-[calc(100vh-1.5rem)] md:shrink-0 md:rounded-[24px] md:border ${
          isSidebarOpen
            ? "translate-x-0 md:w-[268px] md:opacity-100"
            : "-translate-x-full md:w-0 md:translate-x-0 md:border-0 md:opacity-0"
        }`}
      >
        <div className="relative border-b border-white/10 px-5 py-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-blue-500/15 to-transparent" />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-lg shadow-blue-500/25">
                <BrainCircuit size={21} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-base font-extrabold tracking-[-0.02em] text-white">LearnQuick</h1>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">AI learning studio</p>
              </div>
            </div>
            <button type="button" onClick={toggleSidebar} className="flex h-10 w-10 items-center justify-center rounded-xl text-stone-400 hover:bg-white/5 hover:text-white md:hidden" aria-label="Close sidebar">
              <Menu size={21} />
            </button>
          </div>

          <div className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-2 flex items-center gap-2 text-blue-300">
              <Sparkles size={15} strokeWidth={2.5} />
              <span className="text-xs font-bold uppercase tracking-[0.14em]">AI workspace</span>
            </div>
            <p className="text-sm font-semibold text-white">Learn from what matters.</p>
            <p className="mt-1 text-xs leading-5 text-stone-400">Documents become explanations, recall, and practice.</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600">Workspace</p>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `group relative flex min-h-12 items-center gap-3 overflow-hidden rounded-xl px-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-blue-500/15 text-sky-200 ring-1 ring-inset ring-sky-400/25 before:absolute before:left-0 before:top-1/2 before:h-7 before:w-1 before:-translate-y-1/2 before:rounded-r-full before:bg-sky-400"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${isActive ? "bg-sky-400/15 text-sky-300" : "bg-white/[0.04] text-slate-400 group-hover:text-sky-300"}`}>
                    <link.icon size={18} strokeWidth={2.3} />
                  </span>
                  <span>{link.text}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300">
              <User size={17} strokeWidth={2.4} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user?.username || "Learner"}</p>
              <p className="truncate text-xs text-stone-500">{user?.email || "Your account"}</p>
            </div>
          </div>
          <button type="button" onClick={logout} className="group flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-stone-400 transition-colors hover:bg-red-500/10 hover:text-red-300">
            <LogOut size={18} strokeWidth={2.4} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
