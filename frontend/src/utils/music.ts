let audioEl: HTMLAudioElement | null = null;
let isPlaying = false;

export function ensureAudio(): HTMLAudioElement {
  if (!audioEl) {
    audioEl = new Audio('/static/perfectpair.mp3');
    audioEl.loop = true;
    audioEl.volume = 1.0;
    audioEl.preload = 'auto';
    
    // Handle audio errors
    audioEl.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      console.error('Audio error details:', audioEl?.error);
    });
    
    // Log when playing starts
    audioEl.addEventListener('play', () => {
      console.log('🎵 Music started playing');
      isPlaying = true;
    });
    
    audioEl.addEventListener('pause', () => {
      console.log('🎵 Music paused');
      isPlaying = false;
    });
  }
  return audioEl;
}

export function playMusic(): void {
  try {
    const a = ensureAudio();
    
    // If already playing, don't restart
    if (!a.paused && isPlaying) {
      console.log('🎵 Music already playing');
      return;
    }
    
    // Force load the audio first
    a.load();
    
    // Attempt to play - more aggressive
    const playPromise = a.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('🎵 Music playback started successfully');
          isPlaying = true;
          a.volume = 1.0; // Ensure volume is max
        })
        .catch((error) => {
          console.error('🎵 Failed to play music:', error);
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          
          // Try multiple strategies
          if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
            console.warn('🎵 Autoplay blocked - will retry on next interaction');
            
            // Add click handler to play on next user interaction
            const playOnInteraction = () => {
              a.play().then(() => {
                console.log('🎵 Music started after user interaction');
                isPlaying = true;
                document.removeEventListener('click', playOnInteraction);
                document.removeEventListener('touchstart', playOnInteraction);
              }).catch(() => {});
            };
            
            document.addEventListener('click', playOnInteraction, { once: true });
            document.addEventListener('touchstart', playOnInteraction, { once: true });
          } else {
            // For other errors, try again after a short delay
            setTimeout(() => {
              a.play().catch(() => {
                console.error('🎵 Second attempt also failed');
              });
            }, 500);
          }
        });
    }
  } catch (error) {
    console.error('🎵 Error in playMusic:', error);
  }
}

export function stopMusic(): void {
  if (audioEl && !audioEl.paused) {
    audioEl.pause();
    audioEl.currentTime = 0;
    isPlaying = false;
    console.log('🎵 Music stopped');
  }
}

export function isMusicPlaying(): boolean {
  return isPlaying;
}


