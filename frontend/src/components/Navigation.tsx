import { Camera } from 'lucide-react';

interface NavigationProps {
  onOpenCamera: () => void;
}

export default function Navigation({ onOpenCamera }: NavigationProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#2A2A34]/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-[#2A2A34]">
          Performative Male
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="text-[#2A2A34] hover:text-[#7AD39B] transition-colors font-medium"
          >
            How it works
          </button>
          <button
            onClick={() => scrollToSection('arcade')}
            className="text-[#2A2A34] hover:text-[#7AD39B] transition-colors font-medium"
          >
            Arcade
          </button>
          <button
            onClick={() => scrollToSection('music')}
            className="text-[#2A2A34] hover:text-[#7AD39B] transition-colors font-medium"
          >
            Music
          </button>
          <button
            onClick={() => scrollToSection('waitlist')}
            className="text-[#2A2A34] hover:text-[#7AD39B] transition-colors font-medium"
          >
            Waitlist
          </button>
        </div>

        <button
          id="open-camera-nav"
          onClick={onOpenCamera}
          className="flex items-center gap-2 px-6 py-3 bg-[#7AD39B] text-[#2A2A34] font-bold rounded-full hover:bg-[#7AD39B]/90 hover:scale-105 transition-all shadow-lg"
        >
          <Camera size={20} />
          <span>Camera / Sign In</span>
        </button>
      </div>
    </nav>
  );
}
