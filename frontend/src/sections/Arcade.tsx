import { Gamepad2, Apple, Ghost } from 'lucide-react';

export default function Arcade() {
  return (
    <section id="arcade" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-[#2A2A34] mb-4">The Arcade</h2>
          <p className="text-xl text-[#2A2A34]/70">Dodge the bodybuilders. Collect the matcha.</p>
        </div>

        <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-sm rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-8 bg-gradient-to-r from-[#D9F0E3] to-[#DFF3FF]">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/60 rounded-xl">
                <Gamepad2 size={32} className="text-[#2A2A34]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#2A2A34]">Performative Pac</h3>
                <p className="text-[#2A2A34]/70">Your face is the character</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/60 rounded-xl p-4 text-center">
                <div className="text-3xl mb-2">👤</div>
                <p className="text-sm text-[#2A2A34] font-medium">You = Pac</p>
              </div>
              <div className="bg-white/60 rounded-xl p-4 text-center">
                <Ghost size={32} className="mx-auto mb-2 text-[#2A2A34]" />
                <p className="text-sm text-[#2A2A34] font-medium">Ghosts = Bodybuilders</p>
              </div>
              <div className="bg-white/60 rounded-xl p-4 text-center">
                <Apple size={32} className="mx-auto mb-2 text-[#7AD39B]" />
                <p className="text-sm text-[#2A2A34] font-medium">Apple = Matcha</p>
              </div>
            </div>
          </div>

          <div
            id="game-canvas"
            className="aspect-video bg-[#2A2A34] relative overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🎮</div>
                <p className="text-white/60 text-lg">Game canvas</p>
                <p className="text-white/40 text-sm">OpenCV + game logic will be integrated here</p>
              </div>
            </div>

            <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white/60 text-sm">Score</p>
                <p className="text-white text-2xl font-bold">0</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white/60 text-sm">Level</p>
                <p className="text-white text-2xl font-bold">1</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-[#2A2A34] text-center">
            <button className="px-8 py-3 bg-[#7AD39B] text-[#2A2A34] font-bold rounded-xl hover:bg-[#7AD39B]/90 transition-all">
              Start Game
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
