import { Link } from "react-router-dom";

export const SystemSelectionPage = () => (
  <div className="dark">
    <header className="sticky top-0 z-50 flex items-center bg-background-dark p-4 pb-2 justify-between border-b border-gray-800">
      <Link
        to="/"
        aria-label="Back to Roster"
        className="text-primary flex size-12 shrink-0 items-center justify-start focus:outline-none"
      >
        <span className="material-symbols-outlined text-[28px]">
          arrow_back_ios
        </span>
      </Link>
      <h2 className="text-white text-base font-bold leading-tight tracking-widest flex-1 text-center pr-12 uppercase">
        Choose a System
      </h2>
    </header>
    <div className="flex flex-col gap-3 p-4">
      <div className="flex gap-6 justify-between items-end">
        <p className="text-white text-sm font-medium leading-normal uppercase tracking-wider">
          Step 1 of 5
        </p>
        <p className="text-primary text-xs font-bold leading-normal">
          20% COMPLETE
        </p>
      </div>
      <div className="rounded-full bg-gray-800 h-1-5 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: "20%" }}
        ></div>
      </div>
    </div>
    <main className="flex-1 px-4 pb-8 space-y-4">
      <Link to="/generator" className="w-full text-left focus:outline-none group">
        <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl transition-all active:scale-[0.98] group-hover:border-primary/50">
          <div className="flex items-stretch justify-between gap-4">
            <div className="flex flex-col gap-1 flex-[2_2_0px]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500 text-sm">
                  skull
                </span>
                <p className="text-white text-base font-bold leading-tight">
                  Mörk Borg
                </p>
              </div>
              <p className="text-[#9da6b9] text-sm font-normal leading-normal">
                A doom-laden artpunk RPG about a dying world.
              </p>
            </div>
            <div
              className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-lg shrink-0 grayscale group-hover:grayscale-0 transition-all"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBtsNufr1_hDZn1fBqkmBWI0YDgdVpCkjveE3RjCObRSU9OV1d8kpk6k2QQhNPwKDAZqLSUU_0OX8X9xQduTaIMsWXwkS63-kg6OsrMjBy4c3FQWZwk1aEF6_kvcI1TAygKoXnTVcQBBdDVNYy-Bj860FONvawsRPHmljbxZKE-J7TtW2gQsTTGUTA9YmLOipXyG9Mk2RHv3BaSiQCnQBYFloLJInjNgW0NAYIzs5tpmZFdMxHK75bfb37JxmBpLkkihTw4oqTGlYU")',
              }}
            ></div>
          </div>
        </div>
      </Link>
    </main>
    <div className="fixed bottom-0 left-1-2 -translate-x-1/2 w-full max-w-[430px] p-6 bg-gradient-to-t from-background-dark via-background-dark/90 to-transparent">
      <button className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 active:bg-primary/90 transition-colors uppercase tracking-widest text-sm">
        Confirm Selection
      </button>
    </div>
  </div>
);