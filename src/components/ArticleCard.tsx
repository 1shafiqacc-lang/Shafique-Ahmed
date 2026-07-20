import React from 'react';
import { motion } from 'motion/react';
import { Eye, Heart, Calendar, User, ArrowRight } from 'lucide-react';
import { Article, Category } from '../types';

interface ArticleCardProps {
  key?: any;
  article: Article;
  categories: Category[];
  onClick: (slug: string) => void;
  onCategoryClick: (slug: string) => void;
}

export default function ArticleCard({ article, categories, onClick, onCategoryClick }: ArticleCardProps) {
  const categoryObj = categories.find(cat => cat.slug === article.category);
  
  // Format publish date beautifully
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700/60 flex flex-col h-full group"
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden aspect-video cursor-pointer" onClick={() => onClick(article.slug)}>
        <img
          src={article.image}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        {categoryObj && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCategoryClick(categoryObj.slug);
            }}
            className="absolute top-3 left-3 bg-blue-600/90 text-white text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md shadow-xs hover:bg-blue-700 transition"
          >
            {categoryObj.name}
          </button>
        )}
      </div>

      {/* Details body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-2.5">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center text-slate-400 dark:text-slate-400 text-xs gap-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(article.publishDate)}</span>
            </span>
            <span className="flex items-center gap-1 truncate max-w-[120px]">
              <User className="w-3.5 h-3.5" />
              <span className="truncate">{article.author}</span>
            </span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onClick(article.slug)}
            className="font-display font-bold text-lg text-slate-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer leading-snug transition"
          >
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        {/* Footer info & interactive stats */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5" title={`${article.views} views`}>
              <Eye className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>{article.views}</span>
            </span>
            <span className="flex items-center gap-1.5" title={`${article.likes} likes`}>
              <Heart className="w-4 h-4 text-red-400 dark:text-red-500 fill-red-400/10" />
              <span>{article.likes}</span>
            </span>
          </div>

          <button 
            onClick={() => onClick(article.slug)}
            className="flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-all group-hover:translate-x-1"
          >
            <span>Read Article</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
