export default function Testimonials() {
  const testimonials = [
    {
      text: "It told me to read in public. I'm insufferable now.",
      color: 'from-[#F9DDE5] to-[#E6D8FF]',
      emoji: '📚'
    },
    {
      text: "My matcha intake has tripled. Worth it for the leaderboard.",
      color: 'from-[#D9F0E3] to-[#7AD39B]',
      emoji: '🍵'
    },
    {
      text: "Finally, an app that gets my wired earphones aesthetic.",
      color: 'from-[#DFF3FF] to-[#FFF1BF]',
      emoji: '🎧'
    },
    {
      text: "I bought three more plushies. No regrets. Team lababus.",
      color: 'from-[#E6D8FF] to-[#F9DDE5]',
      emoji: '🧸'
    },
    {
      text: "The Gemini GIF feature understands me better than my therapist.",
      color: 'from-[#FFF1BF] to-[#DFF3FF]',
      emoji: '✨'
    },
    {
      text: "My performativity score went up 47 points. I'm winning at life.",
      color: 'from-[#7AD39B] to-[#D9F0E3]',
      emoji: '📈'
    }
  ];

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-[#2A2A34] mb-4">What People Say</h2>
          <p className="text-xl text-[#2A2A34]/70">Real testimonials from self-aware aesthetes</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`group relative bg-gradient-to-br ${testimonial.color} rounded-3xl p-8 hover:scale-105 hover:shadow-xl transition-all duration-300`}
            >
              <div className="absolute top-4 right-4 text-4xl opacity-20">
                {testimonial.emoji}
              </div>

              <div className="relative">
                <p className="text-[#2A2A34] text-lg leading-relaxed italic">
                  "{testimonial.text}"
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/40 flex items-center justify-center text-xl">
                  {testimonial.emoji}
                </div>
                <div>
                  <p className="text-[#2A2A34] font-semibold">Anonymous User</p>
                  <p className="text-[#2A2A34]/60 text-sm">Verified Aesthetic</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
