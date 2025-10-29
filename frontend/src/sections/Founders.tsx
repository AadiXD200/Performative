export default function Founders() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Animated background sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-2xl md:text-4xl animate-bounce opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {['✨', '🌟', '💫', '🎉', '💖', '🌈', '⭐'][Math.floor(Math.random() * 7)]}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-[#2A2A34] mb-4">
            <span className="bg-gradient-to-r from-[#FF1493] via-[#FF69B4] via-[#DA70D6] to-[#FF1493] bg-clip-text text-transparent animate-pulse">
              Our Founders
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-[#2A2A34]/70 font-medium">
            The performative minds behind the aesthetic revolution
          </p>
          <div className="flex justify-center gap-2 mt-4 text-3xl">
            {['✨', '🌟', '💫'].map((emoji, i) => (
              <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                {emoji}
              </span>
            ))}
          </div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main card with image */}
          <div className="relative bg-white/90 backdrop-blur-xl rounded-[40px] p-8 md:p-12 shadow-2xl border-4 border-[#FF69B4]/30 overflow-hidden">
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-[40px] bg-gradient-to-r from-[#FF1493] via-[#FF69B4] via-[#DA70D6] to-[#FF1493] opacity-20 animate-pulse"></div>
            
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#FF1493] to-transparent opacity-15 rounded-br-[40px]"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#DA70D6] to-transparent opacity-15 rounded-tl-[40px]"></div>

            <div className="relative z-10">
              {/* Image */}
              <div className="relative mb-8 rounded-[30px] overflow-hidden shadow-xl border-4 border-white/50">
                {/* Glow effect */}
                <div className="absolute -inset-4 bg-gradient-to-r from-[#FF1493] via-[#FF69B4] to-[#DA70D6] rounded-[34px] blur-2xl opacity-40 animate-pulse"></div>
                
                <img
                  src="/static/group.png"
                  alt="Our Founders"
                  className="relative w-full h-auto rounded-[26px] object-cover transform hover:scale-[1.02] transition-transform duration-500"
                  loading="lazy"
                />
                
                {/* Overlay sparkles on image */}
                <div className="absolute inset-0 pointer-events-none">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-2xl animate-pulse opacity-30"
                      style={{
                        left: `${20 + Math.random() * 60}%`,
                        top: `${20 + Math.random() * 60}%`,
                        animationDelay: `${i * 0.3}s`,
                      }}
                    >
                      ✨
                    </div>
                  ))}
                </div>
              </div>

              {/* Text content */}
              <div className="text-center space-y-6">
                <h3 className="text-3xl md:text-4xl font-black text-[#2A2A34]">
                  <span className="bg-gradient-to-r from-[#FF1493] via-[#FF69B4] to-[#DA70D6] bg-clip-text text-transparent">
                    The Performative Collective
                  </span>
                </h3>
                
                <p className="text-lg md:text-xl text-[#2A2A34]/80 leading-relaxed max-w-2xl mx-auto">
                  We believe that performativity isn't just an aesthetic—it's a lifestyle. 
                  From matcha lattes to wired earphones, from indie vinyl to feminist literature, 
                  we're here to help you quantify your main-character energy.
                </p>

                {/* Stats or highlights */}
                <div className="flex flex-wrap justify-center gap-6 mt-8">
                  <div className="px-6 py-3 bg-gradient-to-r from-[#FF1493] via-[#FF69B4] to-[#DA70D6] rounded-full text-white font-bold text-sm md:text-base shadow-lg">
                    ✨ Aesthetic Validators
                  </div>
                  <div className="px-6 py-3 bg-gradient-to-r from-[#DA70D6] via-[#FF69B4] to-[#FF1493] rounded-full text-white font-bold text-sm md:text-base shadow-lg">
                    🎨 Performance Artists
                  </div>
                  <div className="px-6 py-3 bg-gradient-to-r from-[#E6D8FF] via-[#FFD6E8] to-[#DFF3FF] rounded-full text-[#2A2A34] font-bold text-sm md:text-base shadow-lg border-2 border-[#FF69B4]/30">
                    💖 Matcha Enthusiasts
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating decorative elements */}
          <div className="absolute -top-8 -left-8 text-6xl opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}>
            🌟
          </div>
          <div className="absolute -bottom-8 -right-8 text-6xl opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>
            ✨
          </div>
        </div>
      </div>
    </section>
  );
}

