import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import CommandPalette from "./CommandPalette";

const AppLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.innerWidth >= 768;
  });
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandPaletteOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);

  return (
    <div className="app-shell relative flex min-h-screen overflow-hidden p-0 md:gap-3 md:p-3">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_4%,rgba(37,99,235,0.11),transparent_27rem)]" />
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white">
        Skip to main content
      </a>
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="app-content-shell relative flex min-w-0 flex-1 flex-col overflow-hidden md:rounded-[24px] md:border">
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} onOpenCommandPalette={() => setIsCommandPaletteOpen(true)} />
        <main id="main-content" tabIndex={-1} className="flex-1 overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="page-enter mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
        <Footer />
      </div>
      <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
    </div>
  );
};

export default AppLayout;
