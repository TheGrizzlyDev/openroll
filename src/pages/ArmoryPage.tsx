export const ArmoryPage = () => (
  <div className="dark">
    <header className="sticky top-0 z-50 bg-deep-charcoal border-b border-border-subtle">
      <div className="flex items-center h-14 px-4 justify-between max-w-lg mx-auto">
        <div className="w-10 flex items-center"></div>
        <h1 className="text-[13px] font-bold tracking-[0.2em] uppercase text-white">
          Armory
        </h1>
        <div className="w-10"></div>
      </div>
    </header>
    <main className="max-w-lg mx-auto px-6 flex flex-col items-center justify-center min-h-[calc(100dvh-120px)] pb-24">
      <div className="w-full bg-card-bg border border-border-subtle rounded-[40px] p-10 flex flex-col items-center text-center shadow-2xl">
        <div className="size-16 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
          <span
            className="material-symbols-outlined text-white text-[32px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            construction
          </span>
        </div>
        <h2 className="text-[20px] font-bold text-white tracking-tight mb-4 uppercase">
          MASTERING THE FORGE
        </h2>
        <p className="text-slate-400 text-[15px] leading-relaxed max-w-[260px]">
          Our master smiths are forging your dice and trays. Coming soon.
        </p>
      </div>
      <div className="mt-12 text-center">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.25em]">
          Realm Synergy V2.4.0 • Centralized Hub
        </p>
      </div>
    </main>
  </div>
);