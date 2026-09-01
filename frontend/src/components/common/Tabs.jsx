import React from "react";

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="w-full">
      <div className="relative border-b border-white/10">
        <nav className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`relative shrink-0 px-3 pb-4 text-sm font-semibold transition-all duration-200 md:px-6 ${
                activeTab === tab.name
                  ? "text-sky-300"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="relative z-10">{tab.label}</span>

              {activeTab === tab.name && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-sky-400 shadow-lg shadow-sky-500/30" />
              )}

              {activeTab === tab.name && (
                <div
                  className="absolute inset-0 bg-gradient-to-b from-sky-500/10 to-transparent
                rounded-t-xl -z-10"
                />
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="py-6">
        {tabs.map((tab) => {
          if (tab.name === activeTab) {
            return (
              <div key={tab.name} className="min-w-0">
                {tab.content}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default Tabs;
