import { Link, Outlet } from "react-router-dom";

export const MainLayout = () => (
  <div className="flex flex-col h-screen">
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
    <nav className="fixed bottom-0 left-0 right-0 bg-deep-charcoal border-t border-border-subtle pb-safe-area-inset-bottom z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        <Link
          to="/"
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">groups</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.05em]">
            Roster
          </span>
        </Link>
        <Link
          to="/armory"
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">shield</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.05em]">
            Armory
          </span>
        </Link>
        <Link
          to="/settings"
          className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <span className="material-symbols-outlined text-[24px]">settings</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.05em]">
            Settings
          </span>
        </Link>
      </div>
    </nav>
  </div>
);