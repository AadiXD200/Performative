import { Heart, Github, Twitter, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 px-6 bg-[#2A2A34] text-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Performative Male</h3>
            <p className="text-white/60 mb-4">
              Because you're self-aware about being self-aware.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-white/60">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
              <li><a href="#arcade" className="hover:text-white transition-colors">Arcade</a></li>
              <li><a href="#music" className="hover:text-white transition-colors">Music</a></li>
              <li><a href="#waitlist" className="hover:text-white transition-colors">Waitlist</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Resources</h4>
            <ul className="space-y-2 text-white/60">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-white/60">
          <p className="flex items-center justify-center gap-2">
            Made with <Heart size={16} className="text-[#F9DDE5] fill-current" /> by aesthetes, for aesthetes
          </p>
          <p className="mt-2 text-sm">
            © 2025 Performative Male. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
