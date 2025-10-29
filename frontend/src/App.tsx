import { useState } from 'react';
import Navigation from './components/Navigation';
import CameraModal from './components/CameraModal';
import Games from './pages/Games';
import Congratulations from './pages/Congratulations';
import Hero from './sections/Hero';
import HowItWorks from './sections/HowItWorks';
import Music from './sections/Music';
import Arcade from './sections/Arcade';
import FeatureGrid from './sections/FeatureGrid';
import Testimonials from './sections/Testimonials';
import Founders from './sections/Founders';
import Waitlist from './sections/Waitlist';
import CameraCTA from './sections/CameraCTA';
import Footer from './sections/Footer';

type View = 'home' | 'games' | 'congratulations';

function App() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>(() => {
    // Check if we should show games view (from matcha game back button)
    if (typeof window !== 'undefined') {
      const showGames = sessionStorage.getItem('showGames');
      if (showGames === 'true') {
        sessionStorage.removeItem('showGames');
        return 'games';
      }
    }
    return 'home';
  });
  const [signInData, setSignInData] = useState<{ image: string; items: Set<string> } | null>(null);

  const handleSignIn = (imageDataUrl: string, detectedItems: Set<string>) => {
    setSignInData({ image: imageDataUrl, items: detectedItems });
    setCurrentView('congratulations');
  };

  if (currentView === 'games') {
    return (
      <Games onBack={() => setCurrentView('home')} />
    );
  }

  if (currentView === 'congratulations' && signInData) {
    return (
      <Congratulations
        capturedImage={signInData.image}
        detectedItems={signInData.items}
        onGoToGames={() => setCurrentView('games')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9DDE5] via-[#E6D8FF] to-[#DFF3FF]">
      <Navigation onOpenCamera={() => setIsCameraOpen(true)} />
      <CameraModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)}
        onSignIn={handleSignIn}
      />

      <main className="pt-20">
        <Hero />
        <HowItWorks />
        <Music />
        <Arcade />
        <FeatureGrid />
        <Testimonials />
        <Founders />
        <Waitlist />
        <CameraCTA onOpenCamera={() => setIsCameraOpen(true)} />
        <Footer />
      </main>
    </div>
  );
}

export default App;
