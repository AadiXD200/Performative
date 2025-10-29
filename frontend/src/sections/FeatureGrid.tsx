import { Camera, Palette, Trophy, BookOpen } from 'lucide-react';

export default function FeatureGrid() {
  const features = [
    {
      icon: Camera,
      title: 'Live Detection (OpenCV)',
      description: 'Real-time object detection identifies your aesthetic items through your webcam.',
      color: 'from-[#DFF3FF] to-[#7AD39B]'
    },
    {
      icon: Palette,
      title: 'Pastel UI',
      description: 'Soft, fem-coded design with glassy cards and gentle gradients throughout.',
      color: 'from-[#F9DDE5] to-[#E6D8FF]'
    },
    {
      icon: Trophy,
      title: 'Aesthetic Leaderboard',
      description: 'See how your main-character energy ranks against other soft indie enthusiasts.',
      color: 'from-[#FFF1BF] to-[#D9F0E3]'
    },
    {
      icon: BookOpen,
      title: 'Anonymous Diary',
      description: 'Document your performative journey without judgment. Track your growth.',
      color: 'from-[#E6D8FF] to-[#DFF3FF]'
    }
  ];

  return (
    <section className="py-24 px-6 bg-white/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-[#2A2A34] mb-4">Features</h2>
          <p className="text-xl text-[#2A2A34]/70">Everything you need to cultivate your aesthetic</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group bg-white/60 backdrop-blur-sm rounded-3xl p-8 hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon size={32} className="text-[#2A2A34]" />
                </div>

                <h3 className="text-2xl font-bold text-[#2A2A34] mb-4">{feature.title}</h3>
                <p className="text-[#2A2A34]/70 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
