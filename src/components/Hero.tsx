import { Search, Sparkles, BookOpen, Brain, Compass, School } from 'lucide-react';

interface HeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Hero({ searchQuery, onSearchChange }: HeroProps) {
  const popularKeywords = ['Spaced Repetition', 'Quantum Computing', 'Fibonacci', 'Scholarships', 'Essays', 'AI Tools', 'Productivity'];

  return (
    <div className="relative bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 py-16 overflow-hidden transition-colors">
      {/* Decorative background visual grids */}
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 rounded-full bg-blue-400/10 blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[5%] w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center space-y-6">
        
        {/* Modern high-contrast tag banner */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>Daily Insights for Lifetime Academic Success</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display font-black text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight leading-none">
          Daily Articles <span className="text-blue-600 dark:text-blue-400">for Students</span>
        </h1>

        {/* Hero Excerpt / Subtext */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
          Unlock your true academic potential. Explore scientific breakthroughs, verified study secrets, professional writing guidelines, productivity templates, and college funding advice.
        </p>

        {/* Big Search Bar */}
        <div className="max-w-xl mx-auto pt-2">
          <div className="relative flex items-center shadow-md rounded-full bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 p-1">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 absolute left-4.5 pointer-events-none" />
            <input
              type="text"
              placeholder="What do you want to learn today? Enter topic, category..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-transparent text-slate-800 dark:text-slate-100 text-sm pl-12 pr-4 py-2.5 rounded-full focus:outline-hidden placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-500 dark:text-slate-300 text-xs font-semibold rounded-full mr-1 transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Suggested Tags Row */}
        <div className="pt-2 flex flex-wrap justify-center items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <span className="font-semibold">Popular topics:</span>
          {popularKeywords.map((tag) => (
            <button
              key={tag}
              onClick={() => onSearchChange(tag)}
              className="px-3 py-1 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/40 dark:border-slate-700/40 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-900 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-all"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Highlighting 3 core pillars */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8 border-t border-slate-100 dark:border-slate-800 text-left">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200">Study Systems</h3>
              <p className="text-[10px] text-slate-400">Effective recall research</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200">Science & Tech</h3>
              <p className="text-[10px] text-slate-400">Discoveries & future trends</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
              <School className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xs text-slate-800 dark:text-slate-200">Admissions & Fund</h3>
              <p className="text-[10px] text-slate-400">Scholarships & essays tips</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
