import { BookOpen, Github, Twitter, Linkedin, ArrowUp, Mail, ShieldAlert } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top Footer Segment */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand/Logo Info */}
          <div className="space-y-4 col-span-1 md:col-span-1.5">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="p-2 bg-blue-600 rounded-lg text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-display font-extrabold text-lg text-white tracking-tight">
                Daily Articles
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering students globally with daily high-quality academic insights, scientific discoveries, productivity guidelines, exam prep resources, and verified study tips.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a href="#" className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg transition text-slate-400">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg transition text-slate-400">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg transition text-slate-400">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="mailto:info@dailyarticles.edu" className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded-lg transition text-slate-400">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Hub Navigation */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm text-white tracking-wider uppercase">
              Study Hub
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('study-tips')} className="hover:text-blue-400 transition text-slate-400">
                  Study Tips & Methods
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('exam-prep')} className="hover:text-blue-400 transition text-slate-400">
                  Exam Preparation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('notes')} className="hover:text-blue-400 transition text-slate-400">
                  Syllabus Notes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-blue-400 transition text-slate-400">
                  Latest Articles
                </button>
              </li>
            </ul>
          </div>

          {/* About & Legal Hub */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-sm text-white tracking-wider uppercase">
              Support & Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-blue-400 transition text-slate-400">
                  About the Platform
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-blue-400 transition text-slate-400">
                  Contact Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('privacy-policy')} className="hover:text-blue-400 transition text-slate-400">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('terms-of-service')} className="hover:text-blue-400 transition text-slate-400">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('disclaimer')} className="hover:text-blue-400 transition text-slate-400">
                  Educational Disclaimer
                </button>
              </li>
            </ul>
          </div>

          {/* SEO & Sitemap quick info */}
          <div className="space-y-4 col-span-1">
            <h4 className="font-display font-bold text-sm text-white tracking-wider uppercase">
              Web Crawlers
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Google bots and index engines read this educational platform continuously. Site maps, structured schemas (JSON-LD), breadcrumbs, and keywords are automatically refreshed daily for maximal search performance.
            </p>
            <div className="flex items-center gap-1.5 p-2 bg-slate-800/50 rounded-lg text-slate-400 border border-slate-800">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[10px]">WCAG 2.1 & SEO Compliant</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Segment */}
      <div className="border-t border-slate-800 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <span>
            © {currentYear} Daily Articles for Students. All rights reserved. Made with ❤️ for lifelong learners.
          </span>
          <div className="flex items-center gap-4">
            <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              Sitemap.xml
            </a>
            <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400">
              Robots.txt
            </a>
            <button
              onClick={scrollToTop}
              className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-lg transition hover:bg-slate-700 flex items-center justify-center"
              title="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
