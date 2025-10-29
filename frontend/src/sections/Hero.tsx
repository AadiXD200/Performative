import { ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [gifIndex, setGifIndex] = useState(0);

  const gifs = [
    '✨💫🌸',
    '🎀🦋💝',
    '🌙⭐️💜',
    '🍓🌺🎨'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setGifIndex(prev => (prev + 1) % gifs.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full text-sm text-[#2A2A34] font-medium">
            <Sparkles size={16} className="text-[#7AD39B]" />
            <span>Now in beta</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-[#2A2A34] leading-tight">
            Quantify your main-character energy.
          </h1>

          <p className="text-xl text-[#2A2A34]/70 leading-relaxed">
            Pass the performative password. Get a Gemini GIF. Ascend.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => scrollToSection('arcade')}
              className="group flex items-center gap-2 px-8 py-4 bg-[#2A2A34] text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-xl"
            >
              <span>Try the Demo</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('waitlist')}
              className="px-8 py-4 bg-white/60 backdrop-blur-sm text-[#2A2A34] font-bold rounded-2xl hover:bg-white/80 hover:scale-105 transition-all shadow-lg"
            >
              Join Waitlist
            </button>
          </div>
        </div>

        <div
          id="gif-frame"
          className="relative aspect-square bg-gradient-to-br from-[#E6D8FF] to-[#F9DDE5] rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl" />
          <div className="relative text-9xl animate-pulse">
            {gifs[gifIndex]}
          </div>
          <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/40 backdrop-blur-md rounded-2xl">
            <p className="text-sm text-[#2A2A34]/70 text-center">
              Your vibe-check GIF will appear here
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
