import { useState, useRef, useEffect } from 'react';
import { BookOpen, Search, Sun, Moon, Menu, X, ChevronDown, UserCheck, Edit3, LogOut, LogIn } from 'lucide-react';
import { Category } from '../types';

interface NavbarProps {
  currentView: string;
  categories: Category[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate: (view: string, params?: any) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: { id: string; username: string; fullName?: string } | null;
  onAuthClick: () => void;
  onLogout: () => void;
  onWriteArticleClick: () => void;
}

export default function Navbar({
  currentView,
  categories,
  searchQuery,
  onSearchChange,
  onNavigate,
  darkMode,
  onToggleDarkMode,
  currentUser,
  onAuthClick,
  onLogout,
  onWriteArticleClick
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCatDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { label: 'Home', view: 'home' },
    { label: 'Study Tips', view: 'study-tips' },
    { label: 'Exam Preparation', view: 'exam-prep' },
    { label: 'Notes', view: 'notes' },
    { label: 'About', view: 'about' },
    { label: 'Contact', view: 'contact' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                Daily Articles
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase mt-0.5">
                For Students
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Standard Nav Items */}
            <button
              onClick={() => onNavigate('home')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                currentView === 'home'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              Home
            </button>

            {/* Categories Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <span>Categories</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${catDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {catDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-60 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 p-2 py-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/60 mb-1.5">
                    Select Subject
                  </div>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onNavigate('category', cat.slug);
                        setCatDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-900/60 rounded-md transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {navItems.slice(1).map((item) => (
              <button
                key={item.view}
                onClick={() => onNavigate(item.view)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === item.view
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                    : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                {item.label}
              </button>
            ))}

            {currentUser && (
              <>
                <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                {/* Write Article trigger */}
                <button
                  onClick={onWriteArticleClick}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold rounded-md transition-all ${
                    currentView === 'write-article'
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                      : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Write Article</span>
                </button>

                {/* Moderator/Admin view link */}
                <button
                  onClick={() => onNavigate('admin')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-md transition-colors ${
                    currentView.startsWith('admin')
                      ? 'text-slate-950 dark:text-white bg-slate-100 dark:bg-slate-800'
                      : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
                  }`}
                  title="Moderator Administration Panel"
                >
                  <span>Admin</span>
                </button>
              </>
            )}
          </nav>

          {/* Search Box */}
          <div className="hidden md:flex items-center relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search educational articles..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-9 pr-4 py-1.5 text-xs rounded-full border border-slate-200/60 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-[10px] text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* User Profile / Login status for Desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              {currentUser ? (
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 pr-3 rounded-full border border-slate-200/50 dark:border-slate-700">
                  <button 
                    onClick={() => onNavigate('writer-hub')}
                    className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs cursor-pointer hover:bg-blue-700 transition"
                    title="Go to Writer Hub"
                  >
                    {currentUser.username.substring(0, 2).toUpperCase()}
                  </button>
                  <span 
                    onClick={() => onNavigate('writer-hub')}
                    className="text-xs font-bold text-slate-700 dark:text-slate-300 max-w-[100px] truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {currentUser.fullName || currentUser.username}
                  </span>
                  <button
                    onClick={onLogout}
                    className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 rounded-full transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Dark Mode Button */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-blue-600" />
              )}
            </button>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          {/* User Profile / Login status for Mobile */}
          <div className="border-b border-slate-100 dark:border-slate-800/80 pb-3">
            {currentUser ? (
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl">
                <div className="flex items-center gap-2.5" onClick={() => { onNavigate('writer-hub'); setMobileMenuOpen(false); }}>
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold font-mono">
                    {currentUser.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-white leading-none">
                      {currentUser.fullName || currentUser.username}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Logged in Writer</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => { onNavigate('writer-hub'); setMobileMenuOpen(false); }}
                    className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-md"
                  >
                    My Hub
                  </button>
                  <button
                    onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                    className="p-1.5 text-slate-400 hover:text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { onAuthClick(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </div>

          {/* Mobile Search */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search educational articles..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 pl-9 pr-4 py-2 text-xs rounded-full border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                currentView === 'home'
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              Home
            </button>

            {/* Sub-categories segment */}
            <div className="px-3 py-2 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Subjects / Categories
              </div>
              <div className="grid grid-cols-2 gap-1 pl-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onNavigate('category', cat.slug);
                      setMobileMenuOpen(false);
                    }}
                    className="text-left py-1 px-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-blue-600"
                  >
                    • {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {navItems.slice(1).map((item) => (
              <button
                key={item.view}
                onClick={() => { onNavigate(item.view); setMobileMenuOpen(false); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentView === item.view
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            ))}

            {currentUser && (
              <>
                <button
                  onClick={() => { onWriteArticleClick(); setMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold ${
                    currentView === 'write-article'
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Write Article</span>
                </button>

                <button
                  onClick={() => { onNavigate('admin'); setMobileMenuOpen(false); }}
                  className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-bold ${
                    currentView.startsWith('admin')
                      ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
