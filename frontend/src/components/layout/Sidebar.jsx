import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Info,
  User,
  LogOut,
  BrainCircuit,
  BookOpen,
  X,
} from "lucide-react";

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const navLinks = [
    { to: "/dashboard", icon: LayoutDashboard, text: "Dashboard" },
    { to: "/documents", icon: FileText, text: "Documents" },
    { to: "/flashcards", icon: BookOpen, text: "Flashcards" },
    { to: "/about", icon: Info, text: "About" },
    { to: "/profile", icon: User, text: "Profile" },
  ];

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity duration-200 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
        aria-hidden="true"
      ></div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 overflow-hidden bg-white/90 backdrop-blur-lg border-r border-slate-200/60 z-50 transition-all duration-300 dark:bg-slate-900/95 dark:border-slate-800
          md:relative md:shrink-0 md:flex md:flex-col ease-in-out ${
            isSidebarOpen
              ? "translate-x-0 md:w-64"
              : "-translate-x-full md:w-0 md:translate-x-0 md:border-r-0"
          }`}
      >
        {/* Logo and Close button for mobile */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className="flex items center justify-center w-9 h-9 rounded-xl 
            bg-linear-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/20"
            >
              <BrainCircuit
                className="text-white"
                size={20}
                strokeWidth={2.5}
              />
            </div>
            <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight dark:text-slate-100">
              LearnQuick
            </h1>
          </div>

          <button
            onClick={toggleSidebar}
            className="md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1.5">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-xl ${
                  isActive
                    ? "bg-linear-to-r from-emerald-500 to-teal-500 text-white shadow"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon
                    size={18}
                    strokeWidth={2.5}
                    className={`transition-transform duration-200 ${
                      isActive ? "" : "group-hover:scale-110"
                    }`}
                  />
                  {link.text}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout Section */}
        <div className="px-3 py-4 border-t border-slate-200/60 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 w-full px-4 py-2.5
          text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 dark:text-slate-300 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          >
            <LogOut
              size={18}
              strokeWidth={2.5}
              className="transition-transform duration-200 group-hover:scale-110"
            />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
