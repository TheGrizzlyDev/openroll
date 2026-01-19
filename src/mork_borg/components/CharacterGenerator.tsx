import { useNavigate } from "react-router-dom";
import { useGameContext } from "../../stores/GameContext";

export default function CharacterGenerator() {
  const {
    state: { sheet },
    createCharacter,
    finalizeCharacter,
  } = useGameContext();
  const navigate = useNavigate();

  const handleConfirm = () => {
    const index = finalizeCharacter();
    navigate(`/sheet/${index}`);
  };

  const handleReroll = () => {
    createCharacter();
  };

  return (
    <div className="antialiased selection:bg-black selection:text-yellow-400">
      <div className="mork-borg-grain"></div>
      <div className="relative flex min-h-screen flex-col p-4 pb-36 max-w-md mx-auto items-center">
        <div className="w-full mb-6 flex flex-col items-center text-center">
          <h2 className="text-[9px] font-black uppercase tracking-[0.3em] bg-black text-mb-yellow px-4 py-1.5 mb-4 inline-block rotate-1">
            Compact Scum Generator
          </h2>
          <div className="w-full max-w-[280px] mb-3">
            <input
              className="name-input text-6xl font-black uppercase leading-none italic tracking-tighter"
              spellCheck="false"
              type="text"
              defaultValue={sheet.name || "GURN"}
            />
          </div>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-gothic lowercase">
              {sheet.class || "Gutter Born Scum"}
            </span>
          </div>
          <button
            onClick={handleReroll}
            className="mt-4 bg-black text-mb-yellow px-8 py-3 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center gap-2 mb-border-jagged"
          >
            <span className="material-symbols-outlined text-xl">casino</span>
            <span className="text-[10px] font-black uppercase tracking-widest">
              Reroll All
            </span>
          </button>
        </div>
        <div className="w-full grid grid-cols-2 gap-2 mb-6">
          <div className="border-2 border-black p-2 flex flex-col items-center justify-center relative bg-white/10 aspect-video">
            <span className="text-[8px] font-black uppercase tracking-widest absolute top-1.5 text-center w-full">
              Strength
            </span>
            <span className="text-4xl font-black">{sheet.str}</span>
          </div>
          <div className="border-2 border-black p-2 flex flex-col items-center justify-center relative bg-white/10 aspect-video">
            <span className="text-[8px] font-black uppercase tracking-widest absolute top-1.5 text-center w-full">
              Agility
            </span>
            <span className="text-4xl font-black">{sheet.agi}</span>
          </div>
          <div className="border-2 border-black p-2 flex flex-col items-center justify-center relative bg-white/10 aspect-video">
            <span className="text-[8px] font-black uppercase tracking-widest absolute top-1.5 text-center w-full">
              Presence
            </span>
            <span className="text-4xl font-black">{sheet.pre}</span>
          </div>
          <div className="border-2 border-black p-2 flex flex-col items-center justify-center relative bg-white/10 aspect-video">
            <span className="text-[8px] font-black uppercase tracking-widest absolute top-1.5 text-center w-full">
              Toughness
            </span>
            <span className="text-4xl font-black">{sheet.tou}</span>
          </div>
        </div>
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black text-mb-yellow p-3 flex flex-col items-center justify-center relative mb-border-jagged aspect-[1.8/1]">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] absolute top-2">
              Hit Points
            </span>
            <span className="text-4xl font-black mt-2">{sheet.hp}</span>
          </div>
          <div className="border-[3px] border-black p-3 flex flex-col items-center justify-center relative italic aspect-[1.8/1]">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] absolute top-2">
              Omens
            </span>
            <span className="text-4xl font-black mt-2">d{sheet.omens}</span>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 w-full p-4 bg-mb-yellow/90 backdrop-blur-sm z-50 flex justify-center">
          <button
            onClick={handleConfirm}
            className="w-full max-w-md bg-black text-mb-yellow font-black py-4 px-4 uppercase tracking-[0.4em] text-xl hover:bg-zinc-900 active:translate-y-1 transition-all flex items-center justify-center gap-4 mb-border-jagged"
          >
            Finalize
            <span className="material-symbols-outlined text-3xl">skull</span>
          </button>
        </div>
      </div>
    </div>
  );
}