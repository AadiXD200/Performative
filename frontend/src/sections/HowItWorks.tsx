import { Coffee, Sparkles, TrendingUp } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Coffee,
      title: 'Performative Password',
      description: 'Show any 2 items: matcha, wired earphones, plushie (lababus), camera, or books.',
      color: 'from-[#D9F0E3] to-[#7AD39B]'
    },
    {
      icon: Sparkles,
      title: 'Gemini GIF',
      description: 'We vibe-check your snapshot and fetch a pastel mood that matches your energy.',
      color: 'from-[#E6D8FF] to-[#F9DDE5]'
    },
    {
      icon: TrendingUp,
      title: 'Rank & Tips',
      description: 'We score your performativity and give you personalized tips to raise it.',
      color: 'from-[#FFF1BF] to-[#DFF3FF]'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-[#2A2A34] mb-4">How It Works</h2>
          <p className="text-xl text-[#2A2A34]/70">Three simple steps to unlock your aesthetic potential</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="group relative bg-white/60 backdrop-blur-sm rounded-3xl p-8 hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                <div className="absolute top-0 right-0 w-16 h-16 text-6xl font-bold text-[#2A2A34]/5">
                  {index + 1}
                </div>

                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.color} mb-6`}>
                  <Icon size={32} className="text-[#2A2A34]" />
                </div>

                <h3 className="text-2xl font-bold text-[#2A2A34] mb-4">{step.title}</h3>
                <p className="text-[#2A2A34]/70 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
