import { Mail, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Waitlist() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Waitlist submission:', email);
  };

  return (
    <section id="waitlist" className="py-24 px-6 bg-gradient-to-br from-[#E6D8FF]/50 to-[#F9DDE5]/50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-2xl text-center">
          <div className="inline-flex p-4 bg-gradient-to-br from-[#7AD39B] to-[#DFF3FF] rounded-2xl mb-6">
            <Mail size={40} className="text-[#2A2A34]" />
          </div>

          <h2 className="text-5xl font-bold text-[#2A2A34] mb-4">Join the Waitlist</h2>
          <p className="text-xl text-[#2A2A34]/70 mb-8 max-w-2xl mx-auto">
            Be the first to quantify your main-character energy. Early access drops soon.
          </p>

          <form id="waitlist-form" onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 px-6 py-4 bg-white/60 backdrop-blur-sm border-2 border-[#2A2A34]/10 rounded-2xl text-[#2A2A34] placeholder:text-[#2A2A34]/40 focus:outline-none focus:border-[#7AD39B] transition-colors"
                required
              />
              <button
                type="submit"
                className="group flex items-center justify-center gap-2 px-8 py-4 bg-[#2A2A34] text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-xl"
              >
                <span>Join</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <p className="text-sm text-[#2A2A34]/60 mt-4">
              No spam. Just aesthetic updates and early access.
            </p>
          </form>

          <div className="mt-12 grid grid-cols-3 gap-8 max-w-md mx-auto">
            <div>
              <p className="text-3xl font-bold text-[#2A2A34]">2.4k</p>
              <p className="text-sm text-[#2A2A34]/60">On Waitlist</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#2A2A34]">847</p>
              <p className="text-sm text-[#2A2A34]/60">Beta Testers</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#2A2A34]">94%</p>
              <p className="text-sm text-[#2A2A34]/60">Vibe Score</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
