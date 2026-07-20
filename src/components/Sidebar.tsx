import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, BookOpen, Clock, Activity, CheckCircle, Lightbulb } from 'lucide-react';
import { Article } from '../types';

interface SidebarProps {
  articles: Article[];
  onArticleClick: (slug: string) => void;
}

const studyTips = [
  "Use the Cornell Note-Taking System: Divide your page into notes, cues, and a summary section.",
  "Study for 25 minutes, then take a 5-minute break. This is the Pomodoro Technique.",
  "Teach what you've learned to someone else. It is the Feynman Technique, proving you understand it.",
  "Avoid studying in bed. Your brain associates your bed with sleep, making it harder to focus.",
  "Drink water and maintain stable blood sugar with nuts or fruits during intense study sessions.",
  "Write summaries by hand. Science shows handwriting boosts brain memory retention over typing.",
  "Do your hardest, most complex tasks in the morning when your mental energy is at its highest."
];

export default function Sidebar({ articles, onArticleClick }: SidebarProps) {
  const [tipOfDay, setTipOfDay] = useState('');

  useEffect(() => {
    // Generate a consistent tip based on the day of the month
    const day = new Date().getDate();
    setTipOfDay(studyTips[day % studyTips.length]);
  }, []);

  // Filter top 5 trending articles or simply top 5 viewed articles
  const trendingArticles = [...articles]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* 1. Trending Sidebar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-4.5 h-4.5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            Trending Articles
          </h3>
        </div>

        <div className="space-y-4">
          {trendingArticles.map((article, idx) => (
            <div 
              key={article.id} 
              onClick={() => onArticleClick(article.slug)}
              className="flex items-start gap-3.5 group cursor-pointer"
            >
              <span className="font-display font-extrabold text-2xl text-blue-100 dark:text-slate-700 group-hover:text-blue-500 transition-colors w-6 text-center pt-0.5">
                {idx + 1}
              </span>
              <div className="space-y-1">
                <h4 className="font-sans font-semibold text-xs text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 leading-snug transition-colors">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>{article.category.toUpperCase()}</span>
                  <span>•</span>
                  <span>{article.views} reads</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Study Tip of the Day */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-5 shadow-xs relative overflow-hidden">
        <div className="absolute right-[-10px] bottom-[-10px] opacity-10">
          <Lightbulb className="w-32 h-32" />
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100">Study Tip of the Day</span>
        </div>

        <p className="text-sm text-blue-50 leading-relaxed font-medium mb-3">
          "{tipOfDay}"
        </p>

        <div className="text-[10px] text-blue-200 font-semibold flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Proven Cognitive Strategy</span>
        </div>
      </div>

      {/* 3. Integration Status (SEO and Verification) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700/60 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-green-50 dark:bg-green-900/40 rounded-lg text-green-600 dark:text-green-400">
            <Activity className="w-4.5 h-4.5" />
          </div>
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            SEO & Analytics Status
          </h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-700/60 pb-2">
            <span className="text-slate-500 dark:text-slate-400">Google Analytics</span>
            <span className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
              <CheckCircle className="w-3.5 h-3.5" /> Ready
            </span>
          </div>
          <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-700/60 pb-2">
            <span className="text-slate-500 dark:text-slate-400">Search Console Schema</span>
            <span className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
              <CheckCircle className="w-3.5 h-3.5" /> Enabled
            </span>
          </div>
          <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-700/60 pb-2">
            <span className="text-slate-500 dark:text-slate-400">Dynamic Sitemap (XML)</span>
            <span className="flex items-center gap-1 font-semibold text-green-600 dark:text-green-400">
              <CheckCircle className="w-3.5 h-3.5" /> Live
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Google Crawlers Indexing</span>
            <span className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400">
              Robots.txt Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
