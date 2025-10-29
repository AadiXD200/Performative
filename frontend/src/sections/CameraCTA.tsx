import { Camera, Sparkles } from 'lucide-react';

interface CameraCTAProps {
  onOpenCamera: () => void;
}

export default function CameraCTA({ onOpenCamera }: CameraCTAProps) {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="relative bg-gradient-to-br from-[#7AD39B] via-[#DFF3FF] to-[#E6D8FF] rounded-3xl p-12 md:p-16 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 text-9xl opacity-10">📸</div>
          <div className="absolute bottom-0 left-0 text-9xl opacity-10">✨</div>

          <div className="relative text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-sm rounded-full text-sm text-[#2A2A34] font-medium">
              <Sparkles size={16} />
              <span>Ready to ascend?</span>
            </div>

            <h2 className="text-5xl md:text-6xl font-bold text-[#2A2A34]">
              Show us your aesthetic
            </h2>

            <p className="text-xl text-[#2A2A34]/70 max-w-2xl mx-auto">
              Open your camera, show any two performative items, and unlock your main-character potential.
            </p>

            <button
              id="open-camera-footer"
              onClick={onOpenCamera}
              className="group inline-flex items-center gap-3 px-10 py-5 bg-[#2A2A34] text-white font-bold text-lg rounded-2xl hover:scale-105 transition-all shadow-xl"
            >
              <Camera size={28} className="group-hover:rotate-12 transition-transform" />
              <span>Open Camera to Sign In</span>
            </button>

            <p className="text-sm text-[#2A2A34]/60">
              Matcha • Wired Earphones • Plushie • Camera • Books
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
