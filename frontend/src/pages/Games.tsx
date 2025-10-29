import { useState } from 'react';
import MatchaGame from '../components/MatchaGame';

interface GamesPageProps {
  onBack: () => void;
}

type GameView = 'menu' | 'matcha' | 'pacman';

export default function Games({ onBack }: GamesPageProps) {
  const [currentGame, setCurrentGame] = useState<GameView>('menu');

  const games = [
    {
      id: 'matcha',
      name: 'Matcha Man',
      description: 'Craft the perfect matcha latte with precision. Become one with the matcha.',
      emoji: '🍵',
      color: 'from-green-400 via-emerald-500 to-teal-600',
    },
    {
      id: 'pacman',
      name: 'Performative Pac',
      description: 'Your face as Pac-Man, bodybuilders as ghosts, matcha as power-ups. The ultimate performative arcade experience.',
      emoji: '👾',
      color: 'from-yellow-400 via-amber-500 to-orange-600',
    },
  ];

  if (currentGame === 'matcha') {
    return <MatchaGame onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'pacman') {
    // TODO: Implement Performative Pac game
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F9DDE5] via-[#E6D8FF] to-[#DFF3FF] pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-[#2A2A34] mb-4">👾 Performative Pac</h1>
          <p className="text-xl text-[#2A2A34]/70 mb-8">Coming soon...</p>
          <button
            onClick={() => setCurrentGame('menu')}
            className="px-6 py-3 bg-[#7AD39B] text-white font-bold rounded-xl hover:bg-[#7AD39B]/90"
          >
            Back to Games
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9DDE5] via-[#E6D8FF] to-[#DFF3FF] pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12 mt-8">
          <button
            onClick={onBack}
            className="mb-6 text-[#2A2A34] hover:text-[#7AD39B] transition-colors font-semibold flex items-center gap-2"
          >
            ← Back to Home
          </button>
          <h1 className="text-6xl font-bold text-[#2A2A34] mb-4">
            🎮 Games Arcade
          </h1>
          <p className="text-xl text-[#2A2A34]/70">
            Choose your performative adventure
          </p>
        </div>

        {/* Games Grid - Large Creative Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => {
                if (game.id === 'matcha') {
                  window.location.href = '/games/matcha';
                } else if (game.id === 'pacman') {
                  window.location.href = '/games/pacman';
                } else {
                  setCurrentGame(game.id as GameView);
                }
              }}
              className={`group relative bg-white/90 backdrop-blur-xl rounded-3xl p-12 shadow-2xl hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] transition-all hover:scale-[1.02] border-4 border-transparent hover:border-[#FF69B4] overflow-hidden min-h-[400px] flex flex-col items-center justify-center`}
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-20 rounded-3xl transition-opacity duration-500`} />
              
              {/* Sparkle decorations */}
              <div className="absolute top-4 right-4 text-3xl opacity-30 group-hover:opacity-60 transition-opacity">
                ✨
              </div>
              <div className="absolute bottom-4 left-4 text-3xl opacity-30 group-hover:opacity-60 transition-opacity">
                🌟
              </div>
              
              <div className="relative z-10 text-center w-full">
                {/* Large Emoji */}
                <div className="text-9xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  {game.emoji}
                </div>
                
                {/* Game Name */}
                <h2 className="text-4xl md:text-5xl font-black text-[#2A2A34] mb-4 group-hover:text-[#FF69B4] transition-colors">
                  {game.name}
                </h2>
                
                {/* Description */}
                <p className="text-lg text-[#2A2A34]/70 max-w-md mx-auto leading-relaxed">
                  {game.description}
                </p>

                {/* Play Button Hint */}
                <div className="mt-8 flex items-center justify-center gap-2 text-[#7AD39B] font-bold text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>PLAY NOW</span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>

              {/* Border glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-30 rounded-3xl blur-xl -z-10 transition-opacity duration-500`}></div>
            </button>
          ))}
        </div>

        {/* Coming Soon Badge */}
        <div className="mt-12 text-center">
          <p className="text-[#2A2A34]/50 text-sm">
            More games coming soon... 🚀
          </p>
        </div>
      </div>
    </div>
  );
}

// Matcha Game Component
function MatchaGame({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9DDE5] via-[#E6D8FF] to-[#DFF3FF] pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-6">
        <button
          onClick={onBack}
          className="mb-6 text-[#2A2A34] hover:text-[#7AD39B] transition-colors font-semibold flex items-center gap-2"
        >
          ← Back to Games
        </button>
        
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <MatchaGameCanvas />
        </div>
      </div>
    </div>
  );
}

// Matcha Game Canvas Component
function MatchaGameCanvas() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [instruction, setInstruction] = React.useState('Click the matcha tub to open it.');
  const [showStopButton, setShowStopButton] = React.useState(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 600;

    // Import matcha game logic here
    // For now, we'll need to convert the vanilla JS to React hooks
    // This is a placeholder - we'll implement the full game next

    return () => {
      // Cleanup
    };
  }, []);

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold text-green-700 mb-6">🍵 Make Your Matcha</h1>
      <canvas
        ref={canvasRef}
        className="bg-gradient-to-br from-amber-200 to-amber-300 rounded-xl cursor-pointer shadow-lg mx-auto"
        style={{ display: 'block' }}
      />
      {showStopButton && (
        <button
          className="mt-4 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
        >
          Done Measuring
        </button>
      )}
      <p className="mt-4 text-lg text-[#2A2A34]">{instruction}</p>
    </div>
  );
}

