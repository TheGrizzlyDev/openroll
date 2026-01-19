import { Link } from "react-router-dom";
import { useState } from "react";

const mockCharacters = [
  {
    id: "1",
    name: "Varg the Accursed",
    system: "Mörk Borg",
    hp: "4/12",
    strength: "+2",
    level: "1",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBrpsRN__U36Ntqp5pm_Oni91DgfvHTbSmnnQ2GZWAdvg_sO2MP3g-EISk-1jry8vFTqSLFhXXubHSA5zjXmrZTQWGvOX0HYEk9YUYt0BryBbZeAn4c-0uDTnXXpqswHwtRP7UdCiq26TFs-Psh-3RlAlFooDtsLQTU2L2APIygtmocYEC4oBKleXXG8FsagHJyE4mC4RHlcIqQkFlL1PRkyRYHhFzKsXg99ZTH-sGMgJZryXvilHGWvotbgsH5WL_Ia0Cc_QEA0_4",
  },
  {
    id: "2",
    name: "Eldrin Swiftwind",
    system: "D&D 5e",
    hp: "45/45",
    ac: "16",
    class: "Ranger",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCPkFiyoClOYJIxoag9NlN-FAH8lmUVM580hEs-ySXLX8O0vMmSbO7hvegp4PviqY-_M6MTluHRlmsL3C6u-pkaM7aZC2NWL0EibXO2kIGdQ2R6imtMUAbbyzKgZZHv17gxAmcx7DZIZtpjJKa_QzPJDSq5ASZSmYOPBsXf4yEWYgvigYA1TzN1hmJ8ntXJDiUDLnYbTHSv5zQCG_S4rsZrIWoIU2MAxo8i38v0KQnUO0J_801ZjocSDOLylUEettA3wzvqYa4n_PE",
  },
  {
    id: "3",
    name: "K-2SO",
    system: "Star Wars",
    wounds: "0/15",
    strain: "2/12",
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD11whxxT6QKBG1GcNPz8-EAZe-7RURs7DF4vU2KaZbFN0Udhch4aKbxyAaSJ7tY57u439CRxPI_vUZLdd9RQxTIa3ZxD_SMVD1tNEkEjC-laI08gtbbYkR5h296BeXAsRk6aROnMWeCbArRu_ySycYa-xCkzDjScseDZamepdn8jDUgCSKFXPVBUsHQdkEomm4661h936yWCNenTwSmoiCxkxV_PqKkwORZjl_Y49Bxeuav5Io9EosFJVbwJkL6X0JwO7Rk0nC-JU",
  },
];

export const RosterPage = () => {
  const [characters, setCharacters] = useState([]);

  if (characters.length === 0) {
    return (
      <div className="dark">
        <header className="sticky top-0 z-10 bg-background-dark/80 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center p-4 justify-between h-16">
            <div className="w-10"></div>
            <h1 className="text-lg font-bold leading-tight tracking-tight text-center flex-1 text-white">
              RPG Companion
            </h1>
            <div className="w-10 flex justify-end">
              <span className="material-symbols-outlined cursor-pointer text-white">
                notifications
              </span>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-10">
          <div className="w-full max-w-md bg-[#1c2331] rounded-xl shadow-2xl overflow-hidden border border-slate-800 p-8 flex flex-col items-center gap-8">
            <div className="relative w-full aspect-square max-w-[240px] rounded-lg overflow-hidden bg-slate-900 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-primary/10 opacity-50"></div>
              <div className="relative z-10 flex flex-col items-center text-slate-600">
                <span className="material-symbols-outlined !text-7xl mb-2 opacity-40">
                  auto_stories
                </span>
                <div className="w-16 h-1 bg-primary/30 rounded-full"></div>
              </div>
              <div
                className="sr-only"
                data-alt="Stylized illustration of blank scrolls inside a mysterious portal"
              >
                Portal Illustration
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 text-center">
              <h2 className="text-xl font-bold tracking-widest text-white uppercase">
                THE ROSTER IS EMPTY
              </h2>
              <p className="text-sm font-normal leading-relaxed text-slate-400 max-w-[280px]">
                Your journey has not yet begun. No wretches, crew, or warriors
                are under your command.
              </p>
            </div>
            <Link
              to="/select-system"
              className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-primary text-white text-sm font-bold tracking-wider hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 uppercase"
            >
              <span className="material-symbols-outlined !text-lg">
                person_add
              </span>
              CREATE CHARACTER
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dark">
      <header className="sticky top-0 z-50 bg-deep-charcoal/80 backdrop-blur-md border-b border-border-subtle">
        <div className="flex items-center h-14 px-4 justify-between max-w-lg mx-auto">
          <div className="w-10 flex items-center">
            <button className="flex size-8 items-center justify-center rounded-full bg-card-bg border border-border-subtle">
              <span className="material-symbols-outlined text-sm">
                account_circle
              </span>
            </button>
          </div>
          <h1 className="text-[17px] font-semibold tracking-tight">
            Roster Hub
          </h1>
          <div className="w-10 flex items-center justify-end">
            <Link
              to="/select-system"
              className="flex size-8 items-center justify-center rounded-full bg-card-bg border border-border-subtle"
            >
              <span className="material-symbols-outlined text-sm text-primary">
                add
              </span>
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-lg mx-auto pb-32">
        <div className="px-4 pt-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-500 text-xl">
                search
              </span>
            </div>
            <input
              className="block w-full bg-card-bg border border-border-subtle rounded-xl py-2.5 pl-10 pr-3 text-sm placeholder:text-slate-500 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Search characters..."
              type="text"
            />
          </div>
        </div>
        <div className="flex gap-2 px-4 pt-6 overflow-x-auto no-scrollbar">
          <button className="px-4 py-1.5 rounded-full bg-primary text-white text-[13px] font-medium whitespace-nowrap">
            All Systems
          </button>
          <button className="px-4 py-1.5 rounded-full bg-card-bg border border-border-subtle text-slate-400 text-[13px] font-medium whitespace-nowrap">
            Mörk Borg
          </button>
          <button className="px-4 py-1.5 rounded-full bg-card-bg border border-border-subtle text-slate-400 text-[13px] font-medium whitespace-nowrap">
            D&D 5e
          </button>
          <button className="px-4 py-1.5 rounded-full bg-card-bg border border-border-subtle text-slate-400 text-[13px] font-medium whitespace-nowrap">
            Star Wars
          </button>
        </div>
        <div className="px-4 pt-8 space-y-6">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">
            Active Characters
          </h2>
          <div className="space-y-3">
            {mockCharacters.map((character) => (
              <div
                key={character.id}
                className="bg-card-bg border border-border-subtle rounded-2xl overflow-hidden active:bg-slate-800 transition-colors"
              >
                <div className="p-4 flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-xl bg-center bg-cover border border-border-subtle flex-shrink-0"
                    style={{ backgroundImage: `url("${character.imageUrl}")` }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] font-bold text-[#e5e500] uppercase tracking-wider">
                        {character.system}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white truncate">
                      {character.name}
                    </h3>
                    <p className="text-[12px] text-slate-400 mt-1">
                      {character.system === "Mörk Borg"
                        ? `HP: ${character.hp} • STR: ${character.strength} • Level ${character.level}`
                        : character.system === "D&D 5e"
                        ? `HP: ${character.hp} • AC: ${character.ac} • ${character.class}`
                        : `Wounds: ${character.wounds} • Strain: ${character.strain}`}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-500">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};