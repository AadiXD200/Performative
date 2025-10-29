import { useEffect, useState, useRef } from 'react';
import { convertToPerformative } from '../services/api';
import { playMusic, stopMusic } from '../utils/music';

interface CongratulationsProps {
  capturedImage: string;
  detectedItems: Set<string>;
  onGoToGames: () => void;
}

export default function Congratulations({ capturedImage, detectedItems, onGoToGames }: CongratulationsProps) {
  const [performativeImage, setPerformativeImage] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(true);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const musicPlayedRef = useRef(false);

  // Aggressive music playback - play immediately and keep trying
  useEffect(() => {
    // Play immediately - user already clicked sign in, so we have user gesture
    playMusic();
    musicPlayedRef.current = true;
    
    // Keep retrying every second for 15 seconds
    const retryInterval = setInterval(() => {
      playMusic();
    }, 1000);
    
    // Also try on any user interaction
    const handleInteraction = () => {
      playMusic();
    };
    
    document.addEventListener('click', handleInteraction);
    document.addEventListener('touchstart', handleInteraction);
    document.addEventListener('keydown', handleInteraction);
    
    // Stop retrying after 15 seconds
    setTimeout(() => clearInterval(retryInterval), 15000);
    
    return () => {
      clearInterval(retryInterval);
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  // Convert image with Gemini
  useEffect(() => {
    const convertImage = async () => {
      setIsConverting(true);
      setConversionError(null);
      
      try {
        console.log('🎨 Starting Gemini conversion...');
        const taskHint = "Add wired earphones (one bud dangling), iced matcha in right hand, A24-style tote on left shoulder, dark cuffed denim + loafers, show 'All About Love' on table.";
        
        const convertResult = await convertToPerformative(capturedImage, taskHint);
        
        console.log('🎨 Gemini result:', convertResult);
        
        if (convertResult.ok && convertResult.image) {
          console.log('✅ Gemini conversion successful!');
          setPerformativeImage(convertResult.image);
          // Save to localStorage for use in games (especially Pac-Man)
          localStorage.setItem('performativeImage', convertResult.image);
          if ((convertResult as any).saved_url) {
            localStorage.setItem('performativeImageUrl', (convertResult as any).saved_url);
            console.log('💾 Saved performative image URL to localStorage:', (convertResult as any).saved_url);
          }
          console.log('💾 Saved performative image to localStorage');
        } else {
          console.error('❌ Gemini conversion failed:', convertResult.error);
          setConversionError(convertResult.error || 'Conversion failed');
          // Don't fallback to original - show error state
        }
      } catch (err: any) {
        console.error('❌ Image conversion error:', err);
        setConversionError(err?.message || 'Network error');
      } finally {
        setIsConverting(false);
      }
    };

    if (capturedImage) {
      convertImage();
    }
  }, [capturedImage]);

  const sparkles = ['✨', '🌟', '💫', '🎉', '🦄', '💖', '🌈', '⭐', '🔮', '💎'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFB6D9] via-[#FFD6E8] via-[#E8C5FF] via-[#FFF1BF] to-[#FFD6E8] flex items-center justify-center p-4 md:p-8 relative overflow-hidden animate-gradient-shift">
      {/* Animated background sparkles - more of them */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-3xl md:text-5xl animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
              opacity: 0.6 + Math.random() * 0.4,
            }}
          >
            {sparkles[Math.floor(Math.random() * sparkles.length)]}
          </div>
        ))}
      </div>

      {/* Floating hearts/bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`bubble-${i}`}
            className="absolute rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-50px',
              width: `${20 + Math.random() * 40}px`,
              height: `${20 + Math.random() * 40}px`,
              background: `linear-gradient(135deg, rgba(255, 182, 217, 0.8), rgba(232, 197, 255, 0.8))`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-center">
        {/* Main Card - Centered */}
        <div className="bg-white/98 backdrop-blur-2xl rounded-[40px] p-6 md:p-12 lg:p-16 shadow-[0_30px_100px_rgba(255,105,180,0.4)] border-[6px] border-[#FF69B4] relative overflow-hidden w-full flex flex-col items-center">
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-[40px] bg-gradient-to-r from-[#FF1493] via-[#FF69B4] via-[#DA70D6] to-[#FF1493] opacity-20 animate-pulse"></div>
          
          {/* Decorative corners - bigger */}
          <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-[#FF1493] to-transparent opacity-20 rounded-br-[40px] animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-[#DA70D6] to-transparent opacity-20 rounded-tl-[40px] animate-pulse"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#FF69B4] to-transparent opacity-15 rounded-bl-[40px]"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#FF1493] to-transparent opacity-15 rounded-tr-[40px]"></div>

          {/* Title Section - More Dramatic - Centered */}
          <div className="text-center mb-10 md:mb-12 relative z-10 flex flex-col items-center justify-center">
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black mb-4 leading-tight w-full">
              <span className="bg-gradient-to-r from-[#FF1493] via-[#FF69B4] via-[#DA70D6] via-[#FF69B4] to-[#FF1493] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-text block text-center">
                CONGRATULATIONS
              </span>
            </h1>
            
            <div className="mb-6 flex flex-col items-center justify-center w-full">
              <p className="text-2xl md:text-4xl lg:text-5xl text-[#2A2A34] font-black mb-2 text-center">
                You are a
              </p>
              <p className="text-3xl md:text-5xl lg:text-7xl font-black text-center">
                <span className="bg-gradient-to-r from-[#FF1493] via-[#FF69B4] to-[#DA70D6] bg-clip-text text-transparent animate-pulse block">
                  PERFORMATIVE MALE
                </span>
              </p>
            </div>
            
            <div className="flex justify-center items-center gap-2 mb-4 text-4xl">
              {['✨', '🌟', '💫', '🎉', '🌈'].map((emoji, i) => (
                <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                  {emoji}
                </span>
              ))}
            </div>
            
            <p className="text-lg md:text-xl text-[#2A2A34]/80 font-semibold">
              Your aesthetic has been validated!
            </p>
          </div>

          {/* Image Display - Center Stage */}
          <div className="flex justify-center mb-8 md:mb-12 relative z-10">
            <div className="relative">
              {/* Triple glow effect */}
              <div className="absolute -inset-4 md:-inset-8 bg-gradient-to-r from-[#FF1493] via-[#FF69B4] to-[#DA70D6] rounded-[40px] blur-3xl opacity-40 animate-pulse"></div>
              <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-r from-[#DA70D6] via-[#FF69B4] to-[#FF1493] rounded-[35px] blur-2xl opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              
              {/* Image container */}
              <div className="relative bg-gradient-to-br from-[#FFF0F5] via-[#FFE6F5] to-[#E6E6FA] rounded-[35px] p-4 md:p-8 shadow-[0_20px_60px_rgba(255,105,180,0.5)] border-4 border-[#FF69B4]/50">
                {isConverting ? (
                  <div className="w-full max-w-lg aspect-[3/4] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-[30px] relative overflow-hidden">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FFB6D9] via-[#FFD6E8] to-[#E8C5FF] animate-gradient-shift opacity-50"></div>
                    
                    {/* Rotating sparkles loader */}
                    <div className="relative w-40 h-40 mb-8">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div
                          key={i}
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            transform: `rotate(${i * 45}deg) translateY(-60px)`,
                            animation: `spin 3s linear infinite`,
                          }}
                        >
                          <span className="text-5xl">{sparkles[i % sparkles.length]}</span>
                        </div>
                      ))}
                      {/* Center sparkle */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl animate-pulse">✨</span>
                      </div>
                    </div>
                    
                    {/* Loading text */}
                    <div className="relative z-10 text-center">
                      <p className="text-2xl md:text-3xl text-[#2A2A34] font-black mb-2 animate-pulse">
                        Making you ultra performative...
                      </p>
                      <p className="text-sm md:text-base text-[#2A2A34]/70 font-semibold">
                        ✨ Gemini is transforming you into the ultimate performative male ✨
                      </p>
                      <p className="text-xs md:text-sm text-[#2A2A34]/60 mt-2">
                        This may take 10-30 seconds
                      </p>
                      <div className="mt-4 flex justify-center gap-2">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-[#FF69B4] animate-bounce"
                            style={{ animationDelay: `${i * 0.2}s` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : conversionError ? (
                  <div className="w-full max-w-lg aspect-[3/4] flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-[30px] p-8 text-center">
                    <p className="text-xl text-[#2A2A34] mb-4 font-bold">⚠️ Conversion failed</p>
                    <p className="text-sm text-[#2A2A34]/70 mb-4">{conversionError}</p>
                    <p className="text-xs text-[#2A2A34]/60 mb-6">Set GEMINI_API_KEY in run.sh</p>
                    <img
                      src={capturedImage}
                      alt="You"
                      className="w-full rounded-2xl shadow-xl opacity-50"
                    />
                  </div>
                ) : performativeImage ? (
                  <img
                    src={performativeImage}
                    alt="Your performative transformation"
                    className="w-full max-w-lg aspect-auto rounded-[30px] shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
                    onLoad={() => console.log('✅ Performative image loaded!')}
                  />
                ) : (
                  <div className="w-full max-w-lg aspect-[3/4] flex items-center justify-center">
                    <p className="text-[#2A2A34]/70">Loading...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detected Items - Styled Better */}
          {detectedItems.size > 0 && (
            <div className="text-center mb-8 md:mb-12 relative z-10">
              <p className="text-xl md:text-2xl text-[#2A2A34] mb-4 font-black">Your performative items:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {Array.from(detectedItems).map((item, i) => (
                  <span
                    key={i}
                    className="px-6 py-3 bg-gradient-to-r from-[#FF1493] via-[#FF69B4] to-[#DA70D6] text-white rounded-full font-black text-sm md:text-base shadow-lg transform hover:scale-110 transition-all hover:shadow-[#FF69B4]/50 animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    ✨ {item} ✨
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Go to Games Button - More Dramatic */}
          <div className="text-center relative z-10">
            <button
              onClick={() => {
                stopMusic();
                onGoToGames();
              }}
              disabled={isConverting}
              className="px-10 md:px-16 py-5 md:py-6 bg-gradient-to-r from-[#FF1493] via-[#FF69B4] via-[#DA70D6] to-[#FF1493] text-white text-xl md:text-3xl font-black rounded-[25px] shadow-[0_20px_60px_rgba(255,105,180,0.6)] hover:scale-110 transform transition-all hover:shadow-[0_25px_80px_rgba(255,105,180,0.8)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden border-4 border-white/30"
              style={{
                backgroundSize: '200% auto',
              }}
            >
              <span className="relative z-10 flex items-center gap-3 md:gap-4">
                🎮 GO TO GAMES 🎮
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              {/* Pulsing glow */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#FF1493] via-[#FF69B4] to-[#DA70D6] rounded-[25px] blur-xl opacity-50 animate-pulse"></div>
            </button>
            
            {isConverting && (
              <p className="text-sm text-[#2A2A34]/60 mt-4 font-semibold">
                Wait for your performative transformation to complete...
              </p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes gradient-text {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%) translateY(-50%) rotate(45deg); }
          100% { transform: translateX(200%) translateY(-50%) rotate(45deg); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        
        .animate-gradient-shift {
          animation: gradient-shift 10s ease infinite;
          background-size: 400% 400%;
        }
        
        .animate-gradient-text {
          animation: gradient-text 3s ease infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        
        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
}
