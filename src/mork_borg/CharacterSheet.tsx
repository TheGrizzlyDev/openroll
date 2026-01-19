import { useGameContext } from "../../stores/GameContext";

export default function CharacterSheet() {
  const {
    state: { sheet },
  } = useGameContext();

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24 space-y-8 scroll-smooth">
      <section className="flex flex-col items-center text-center">
        <h2 className="text-6xl font-extrabold uppercase jagged-title leading-none mb-1 text-primary">
          {sheet.name || "Vile Snot-Eater"}
        </h2>
        <p className="text-primary/80 italic text-sm">
          {sheet.class || "Gutterborn Scum"}
        </p>
      </section>
      <section className="grid grid-cols-2 gap-4">
        <div className="relative flex flex-col items-center justify-center p-6 bg-primary text-black">
          <div className="absolute top-2 left-2 opacity-30">
            <span className="material-symbols-outlined text-sm">favorite</span>
          </div>
          <p className="text-xs font-black uppercase tracking-tighter mb-1">
            Hit Points
          </p>
          <p className="text-5xl font-black leading-none tracking-tighter">
            {String(sheet.hp).padStart(2, "0")}
            <span className="text-2xl opacity-60">/{sheet.maxHp}</span>
          </p>
        </div>
        <div className="relative flex flex-col items-center justify-center p-6 bg-black border-4 border-primary text-primary">
          <div className="absolute top-2 left-2 opacity-50">
            <span className="material-symbols-outlined text-sm">
              auto_fix_high
            </span>
          </div>
          <p className="text-xs font-black uppercase tracking-tighter mb-1">
            Omens
          </p>
          <p className="text-5xl font-black leading-none tracking-tighter">
            {String(sheet.omens).padStart(2, "0")}
          </p>
        </div>
      </section>
      <section className="grid grid-cols-2 gap-3">
        <div className="stat-card p-4 flex flex-col items-start bg-card-dark border-l-8 border-l-primary">
          <span className="material-symbols-outlined text-primary mb-2 text-xl">
            swords
          </span>
          <h3 className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">
            Strength
          </h3>
          <p className="text-4xl font-black tracking-tighter text-white">
            {sheet.str}
          </p>
        </div>
        <div className="stat-card p-4 flex flex-col items-start bg-card-dark border-l-8 border-l-primary">
          <span className="material-symbols-outlined text-primary mb-2 text-xl">
            bolt
          </span>
          <h3 className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">
            Agility
          </h3>
          <p className="text-4xl font-black tracking-tighter text-white">
            {sheet.agi}
          </p>
        </div>
        <div className="stat-card p-4 flex flex-col items-start bg-card-dark border-l-8 border-l-primary">
          <span className="material-symbols-outlined text-primary mb-2 text-xl">
            visibility
          </span>
          <h3 className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">
            Presence
          </h3>
          <p className="text-4xl font-black tracking-tighter text-white">
            {sheet.pre}
          </p>
        </div>
        <div className="stat-card p-4 flex flex-col items-start bg-card-dark border-l-8 border-l-primary">
          <span className="material-symbols-outlined text-primary mb-2 text-xl">
            shield
          </span>
          <h3 className="text-[10px] font-bold text-primary/70 uppercase tracking-widest">
            Toughness
          </h3>
          <p className="text-4xl font-black tracking-tighter text-white">
            {sheet.tou}
          </p>
        </div>
      </section>
    </main>
  );
}
