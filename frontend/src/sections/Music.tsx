import { Music as MusicIcon, Play } from 'lucide-react';

export default function Music() {
  const artists = [
    'Laufey',
    'Beabadoobee',
    'boygenius',
    'Clairo',
    'Mitski',
    'Phoebe Bridgers',
    'Soccer Mommy',
    'Snail Mail'
  ];

  return (
    <section id="music" className="py-24 px-6 bg-gradient-to-br from-[#E6D8FF]/30 to-[#F9DDE5]/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-[#2A2A34] mb-4">After the Gate: Music</h2>
          <p className="text-xl text-[#2A2A34]/70">The soundtrack to your main-character moment</p>
        </div>

        <div className="mb-12 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap py-6">
            <span className="text-3xl font-semibold text-[#2A2A34]/50 inline-block">
              {artists.map((artist, i) => (
                <span key={i}>
                  Now playing: {artist}
                  <span className="mx-8">•</span>
                </span>
              ))}
              {artists.map((artist, i) => (
                <span key={`dup-${i}`}>
                  Now playing: {artist}
                  <span className="mx-8">•</span>
                </span>
              ))}
            </span>
          </div>
        </div>

        <div
          id="music-embed"
          className="max-w-3xl mx-auto bg-white/60 backdrop-blur-sm rounded-3xl p-12 shadow-xl"
        >
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0 w-32 h-32 bg-gradient-to-br from-[#E6D8FF] to-[#7AD39B] rounded-2xl flex items-center justify-center shadow-lg">
              <MusicIcon size={48} className="text-white" />
            </div>

            <div className="flex-1">
              <h3 className="text-2xl font-bold text-[#2A2A34] mb-2">Curated Playlist</h3>
              <p className="text-[#2A2A34]/70 mb-4">
                Soft indie, bedroom pop, and main-character anthems
              </p>
              <button className="flex items-center gap-2 px-6 py-3 bg-[#7AD39B] text-[#2A2A34] font-bold rounded-xl hover:bg-[#7AD39B]/90 transition-all">
                <Play size={20} />
                <span>Play on Spotify</span>
              </button>
            </div>
          </div>

          <div className="mt-8 p-4 bg-[#2A2A34]/5 rounded-xl">
            <p className="text-sm text-[#2A2A34]/60 italic text-center">
              Spotify embed will be integrated here
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
