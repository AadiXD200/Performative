import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { detectItems } from '../services/api';
import { playMusic } from '../utils/music';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: (imageDataUrl: string, detectedItems: Set<string>) => void;
}

const PERFORMATIVE_ITEMS = [
  { id: 'Matcha', label: 'Matcha', emoji: '🍵' },
  { id: 'Wired Earphones', label: 'Wired Earphones', emoji: '🎧' },
  { id: 'Plushie', label: 'Plushie', emoji: '🧸' },
  { id: 'Camera', label: 'Camera', emoji: '📷' },
  { id: 'Books', label: 'Books', emoji: '📚' },
];

export default function CameraModal({ isOpen, onClose, onSignIn }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [persistentItems, setPersistentItems] = useState<Set<string>>(new Set());
  const [currentItems, setCurrentItems] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const detectionTimeoutRef = useRef<number | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (video.readyState < 2) return null;
    
    const w = video.videoWidth || 640;
    const h = video.videoHeight || 480;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', 0.8);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(err => {
              console.error('Error playing video:', err);
            });
            setIsStreaming(true);
            startDetectionLoop();
          }
        };
        
        // Fallback: if metadata already loaded
        if (videoRef.current.readyState >= 2) {
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
          });
          setIsStreaming(true);
          startDetectionLoop();
        }
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setLastError('Camera permission denied. Please allow camera access.');
      } else if (err.name === 'NotFoundError') {
        setLastError('No camera found. Please connect a camera.');
      } else {
        setLastError(`Failed to access camera: ${err.message}`);
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsStreaming(false);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
    if (detectionTimeoutRef.current) {
      clearTimeout(detectionTimeoutRef.current);
      detectionTimeoutRef.current = null;
    }
  };

  const startDetectionLoop = () => {
    if (detectionTimeoutRef.current) return;
    
    const detect = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        detectionTimeoutRef.current = window.setTimeout(detect, 400);
        return;
      }
      
      if (isProcessing || isSigningIn) {
        detectionTimeoutRef.current = window.setTimeout(detect, 400);
        return;
      }
      
      const frame = captureFrame();
      if (!frame) {
        detectionTimeoutRef.current = window.setTimeout(detect, 400);
        return;
      }

      try {
        setIsProcessing(true);
        const result = await detectItems(frame);
        
        if (result.ok) {
          setLastError(null);
          const labels = result.labels || [];
          const newItems = new Set(labels);
          setCurrentItems(newItems);
          
          // PERSISTENT: Once detected, add to persistent set (never remove)
          setPersistentItems(prev => {
            const updated = new Set(prev);
            labels.forEach(label => updated.add(label));
            return updated;
          });
        } else {
          setLastError(result.error || 'Detection failed');
        }
      } catch (err: any) {
        console.warn('Detection loop error', err);
        setLastError(err?.message || 'Network error');
      } finally {
        setIsProcessing(false);
        detectionTimeoutRef.current = window.setTimeout(detect, 400);
      }
    };
    
    detect();
  };

  const handleSignIn = async () => {
    if (persistentItems.size === 0) return;
    
    setIsSigningIn(true);
    // Blast music immediately on sign-in click
    playMusic();
    
    // Capture final image
    const finalImage = captureFrame();
    if (!finalImage) {
      setIsSigningIn(false);
      return;
    }
    
    // Stop camera immediately
    stopCamera();
    
    // Small delay for smooth transition
    setTimeout(() => {
      onSignIn(finalImage, persistentItems);
      onClose();
    }, 100);
  };

  useEffect(() => {
    if (isOpen) {
      setPersistentItems(new Set());
      setCurrentItems(new Set());
      setLastError(null);
      setIsStreaming(false);
      // Small delay to ensure video element is mounted
      setTimeout(() => {
        startCamera();
      }, 100);
    } else {
      stopCamera();
      setIsSigningIn(false);
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasItems = persistentItems.size > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A2A34]/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-white transition-colors shadow-lg"
        >
          <X size={24} className="text-[#2A2A34]" />
        </button>

        <div className="flex h-[90vh] max-h-[800px]">
          {/* Camera Feed - Left Side */}
          <div className="flex-1 relative bg-[#2A2A34] flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
              style={{ display: isStreaming ? 'block' : 'none' }}
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center text-white text-center p-8">
                <div>
                  <div className="animate-spin text-4xl mb-4">📷</div>
                  <p className="text-xl mb-4">Starting camera...</p>
                  {lastError && (
                    <p className="text-red-300 text-sm max-w-md">{lastError}</p>
                  )}
                  {!lastError && (
                    <p className="text-white/60 text-sm">Please allow camera permissions</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Checklist Sidebar - Right Side */}
          <div className="w-80 bg-gradient-to-br from-[#F9DDE5] via-[#E6D8FF] to-[#FFF1BF] p-6 flex flex-col">
            <h2 className="text-2xl font-bold text-[#2A2A34] mb-6">
              Performative Checklist
            </h2>

            {/* Items List */}
            <div className="flex-1 space-y-3 mb-6 overflow-y-auto">
              {PERFORMATIVE_ITEMS.map((item) => {
                const isDetected = persistentItems.has(item.id);
                const isCurrentlyVisible = currentItems.has(item.id);
                
                return (
                  <div
                    key={item.id}
                    className={`relative flex items-center gap-3 p-4 rounded-xl transition-all ${
                      isDetected
                        ? 'bg-white/60 backdrop-blur-sm shadow-md border-2 border-[#10B981]'
                        : 'bg-white/30 backdrop-blur-sm border-2 border-transparent'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg transition-all ${
                      isDetected
                        ? 'border-[#10B981] bg-[#10B981] scale-110'
                        : 'border-[#2A2A34]/30 bg-white/50'
                    }`}>
                      {isDetected ? (
                        <span className="text-white font-bold">✓</span>
                      ) : (
                        <span className="opacity-50">{item.emoji}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className={`font-semibold ${
                        isDetected ? 'text-[#2A2A34]' : 'text-[#2A2A34]/60'
                      }`}>
                        {item.label}
                      </span>
                      {isCurrentlyVisible && isDetected && (
                        <div className="mt-1 flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></div>
                          <span className="text-xs text-[#10B981]">Detected</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sign In Button */}
            {hasItems ? (
              <button
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#FF1493] via-[#FF69B4] to-[#DA70D6] text-white font-bold text-lg rounded-xl shadow-xl hover:scale-105 transform transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSigningIn ? 'Signing In...' : `Sign In (${persistentItems.size} item${persistentItems.size > 1 ? 's' : ''})`}
              </button>
            ) : (
              <div className="w-full px-6 py-4 bg-[#2A2A34]/20 text-[#2A2A34]/60 font-semibold text-center rounded-xl border-2 border-dashed border-[#2A2A34]/30">
                Show at least one performative item to sign in
              </div>
            )}
          </div>
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
