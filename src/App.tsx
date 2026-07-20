import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Search, Sun, Moon, Calendar, User, Eye, Heart, 
  Share2, MessageSquare, Send, CheckCircle, ChevronRight, 
  Trash2, Plus, Edit3, ArrowLeft, RefreshCw, Layers, ShieldCheck, 
  Sparkles, FileText, Play, Pause, RotateCcw, AlertTriangle, ExternalLink, HelpCircle,
  LogOut, X
} from 'lucide-react';

// Import Types
import { Article, Category, Comment, NewsletterSubscriber, ContactMessage, User as UserType } from './types';

// Import Custom Modular Components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ArticleCard from './components/ArticleCard';
import RichEditor from './components/RichEditor';
import SEOManager from './components/SEOManager';

export default function App() {
  // Core Navigation Router States
  const [view, setView] = useState<string>('home');
  const [param, setParam] = useState<string>(''); // Slug/Id parameter
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Authentication & Session States
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => {
    const saved = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'verification' | 'forgot-password' | 'reset-password'>('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '', fullName: '', email: '' });
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [redirectAfterAuth, setRedirectAfterAuth] = useState<string | null>(null);

  // Extended Authentication States
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [verificationCodeInput, setVerificationCodeInput] = useState<string>('');
  const [resetTokenInput, setResetTokenInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [simulatedAlert, setSimulatedAlert] = useState<{ type: 'verification' | 'reset' | 'success'; message: string; code: string } | null>(null);

  // Focus Keyword for SEO Scoring
  const [focusKeyword, setFocusKeyword] = useState<string>('');
  
  // Local Drafts Array State
  const [localDrafts, setLocalDrafts] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('educational_drafts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Writer Hub State
  const [writerArticle, setWriterArticle] = useState<Partial<Article>>({
    title: '',
    category: '',
    excerpt: '',
    content: '',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    tags: []
  });
  const [imageUploadMode, setImageUploadMode] = useState<'preset' | 'url' | 'file'>('preset');
  const [selectedPresetImage, setSelectedPresetImage] = useState<string>('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80');

  // Core Data States
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [adminArticles, setAdminArticles] = useState<Article[]>([]);

  // Loader & Submit States
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [commentForm, setCommentForm] = useState({ author: '', email: '', content: '' });
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [newsletterStatus, setNewsletterStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Admin Panel Tab Control
  const [adminTab, setAdminTab] = useState<'articles' | 'categories' | 'comments' | 'subscribers' | 'messages'>('articles');
  
  // Admin Editing Form State
  const [editingArticle, setEditingArticle] = useState<Partial<Article> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  
  // Admin stats / data logs (fetched only on-demand for Admin panel)
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  
  // Interactive Widgets States
  // 1. Pomodoro Timer
  const [pomodoroTime, setPomodoroTime] = useState(1500); // 25 mins
  const [timerRunning, setTimerRunning] = useState(false);
  // 2. Exam stress questionnaire
  const [stressScore, setStressScore] = useState<number | null>(null);
  const [stressAnswers, setStressAnswers] = useState<number[]>([3, 3, 3]);

  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState<{ success: boolean; message: string } | null>(null);

  // ----------------------------------------------------
  // Initial Hydration & Router Syncer
  // ----------------------------------------------------

  useEffect(() => {
    // 1. Sync theme Class
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Read current URL path to set router view on mount
  useEffect(() => {
    const handleInitialRoute = () => {
      const path = window.location.pathname;
      if (path === '/' || path === '') {
        setView('home');
        setParam('');
      } else if (path.startsWith('/article/')) {
        setView('article');
        setParam(path.substring(9));
      } else if (path.startsWith('/category/')) {
        setView('category');
        setParam(path.substring(10));
      } else {
        const viewName = path.substring(1);
        setView(viewName || 'home');
        setParam('');
      }
    };

    fetchCategories();
    fetchArticles();
    handleInitialRoute();

    window.addEventListener('popstate', handleInitialRoute);
    return () => window.removeEventListener('popstate', handleInitialRoute);
  }, []);

  // Fetch Category List
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch Published Articles
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Admin Articles (All, including future/scheduled)
  const fetchAdminArticles = async () => {
    try {
      const res = await fetch('/api/articles?admin=true');
      if (res.ok) {
        const data = await res.json();
        setAdminArticles(data);
      }
    } catch (err) {
      console.error('Error fetching admin articles:', err);
    }
  };

  // Fetch Comments for current article
  const fetchArticleComments = async (articleId: string) => {
    try {
      const res = await fetch(`/api/comments/${articleId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // Router Navigate helper
  const navigate = (viewName: string, parameter: string | null = null) => {
    setView(viewName);
    setParam(parameter || '');
    setSearchQuery(''); // Reset search on direct view navigations
    
    let path = '/';
    if (viewName === 'article' && parameter) {
      path = `/article/${parameter}`;
      fetchArticleComments(parameter);
    } else if (viewName === 'category' && parameter) {
      path = `/category/${parameter}`;
    } else if (viewName !== 'home') {
      path = `/${viewName}`;
    }

    window.history.pushState({}, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ----------------------------------------------------
  // Authentication, Registration, and Write Gated Flow
  // ----------------------------------------------------

  // Auto-save active draft to localStorage
  useEffect(() => {
    if (view !== 'write-article' || !currentUser) return;
    
    // Auto-save every 8 seconds if title or content exists
    const timer = setTimeout(() => {
      if (writerArticle.title || writerArticle.content) {
        const activeDraft = {
          id: writerArticle.id || 'draft-active',
          title: writerArticle.title || '',
          category: writerArticle.category || '',
          excerpt: writerArticle.excerpt || '',
          content: writerArticle.content || '',
          tags: writerArticle.tags || [],
          image: writerArticle.image || '',
          lastSaved: new Date().toISOString()
        };
        
        setLocalDrafts(prev => {
          const list = prev.filter(d => d.id !== activeDraft.id);
          const updated = [activeDraft, ...list];
          localStorage.setItem('educational_drafts', JSON.stringify(updated));
          return updated;
        });
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [writerArticle, view, currentUser]);

  const handleSaveDraftManual = () => {
    const activeId = writerArticle.id || `draft-${Date.now()}`;
    const activeDraft = {
      id: activeId,
      title: writerArticle.title || 'Untitled Draft',
      category: writerArticle.category || 'education',
      excerpt: writerArticle.excerpt || '',
      content: writerArticle.content || '',
      tags: writerArticle.tags || [],
      image: writerArticle.image || '',
      lastSaved: new Date().toISOString()
    };

    setLocalDrafts(prev => {
      const list = prev.filter(d => d.id !== activeId);
      const updated = [activeDraft, ...list];
      localStorage.setItem('educational_drafts', JSON.stringify(updated));
      return updated;
    });

    if (!writerArticle.id) {
      setWriterArticle(prev => ({ ...prev, id: activeId }));
    }

    alert('📝 Draft saved successfully to local storage! You can access it anytime in the sidebar.');
  };

  const handleLoadDraft = (draft: any) => {
    if (confirm('Load this saved draft? Your current editor state will be overwritten.')) {
      setWriterArticle(draft);
      // Detect image upload mode
      const presets = [
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80'
      ];
      if (presets.includes(draft.image)) {
        setImageUploadMode('preset');
        setSelectedPresetImage(draft.image);
      } else if (draft.image && draft.image.startsWith('data:image/')) {
        setImageUploadMode('file');
      } else {
        setImageUploadMode('url');
      }
    }
  };

  const handleDeleteDraft = (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this draft permanently from local storage?')) {
      setLocalDrafts(prev => {
        const updated = prev.filter(d => d.id !== draftId);
        localStorage.setItem('educational_drafts', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const calculateSEOScore = () => {
    let score = 0;
    const checks = {
      titleLength: false,
      excerptPresence: false,
      keywordCount: 0,
      headingsStructure: false,
      imageCount: 0,
      linkDensity: false
    };

    const title = writerArticle.title || '';
    const excerpt = writerArticle.excerpt || '';
    const content = writerArticle.content || '';

    // 1. Title Length Check (ideal 30-60 chars)
    if (title.length >= 30 && title.length <= 60) {
      score += 20;
      checks.titleLength = true;
    } else if (title.length > 0) {
      score += 10;
    }

    // 2. Excerpt presence & length (ideal 80-180 chars)
    if (excerpt.length >= 80 && excerpt.length <= 180) {
      score += 15;
      checks.excerptPresence = true;
    } else if (excerpt.length > 0) {
      score += 5;
    }

    // 3. Focus keyword count (if set, ideal is 3 to 8 counts)
    if (focusKeyword.trim() !== '') {
      const regex = new RegExp(focusKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
      const matches = content.match(regex);
      const count = matches ? matches.length : 0;
      checks.keywordCount = count;
      if (count >= 3 && count <= 8) {
        score += 25;
      } else if (count > 0) {
        score += 15;
      }
    } else {
      checks.keywordCount = 0;
    }

    // 4. Heading structure check (contains H2 or H3 tags)
    if (content.includes('<h2') || content.includes('<h3') || content.includes('##')) {
      score += 15;
      checks.headingsStructure = true;
    }

    // 5. Image check (at least 1 image either body or banner)
    const imgMatches = content.match(/<img/g);
    const imgCount = (imgMatches ? imgMatches.length : 0) + (writerArticle.image ? 1 : 0);
    checks.imageCount = imgCount;
    if (imgCount >= 1) {
      score += 15;
    }

    // 6. Link check (contains anchor links or URLs)
    if (content.includes('<a') || content.includes('http://') || content.includes('https://') || content.includes('[')) {
      score += 10;
      checks.linkDensity = true;
    }

    return { score, checks };
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: authForm.username,
            password: authForm.password
          })
        });
        const data = await res.json();
        if (res.ok) {
          setCurrentUser(data.user);
          if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
          } else {
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
          }
          setAuthModalOpen(false);
          setAuthForm({ username: '', password: '', fullName: '', email: '' });
          setSimulatedAlert(null);
          
          if (redirectAfterAuth) {
            navigate(redirectAfterAuth);
            setRedirectAfterAuth(null);
          }
        } else {
          setAuthError(data.error || 'Authentication failed. Please check credentials.');
        }
      } else if (authMode === 'signup') {
        if (!authForm.email) {
          setAuthError('Email is required during registration.');
          setAuthLoading(false);
          return;
        }
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: authForm.username,
            password: authForm.password,
            fullName: authForm.fullName,
            email: authForm.email
          })
        });
        const data = await res.json();
        if (res.ok) {
          // Pre-save unverified user
          setCurrentUser(data.user);
          if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
          } else {
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
          }
          // Set simulated alert for email verification
          setSimulatedAlert({
            type: 'verification',
            message: `📧 [SIMULATED EMAIL INBOX] A registration code has been generated. Enter this 6-digit code to verify your profile:`,
            code: data.simulatedCode || '123456'
          });
          setAuthMode('verification');
        } else {
          setAuthError(data.error || 'Signup failed. Please try again.');
        }
      } else if (authMode === 'verification') {
        const res = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUser?.username || authForm.username,
            code: verificationCodeInput
          })
        });
        const data = await res.json();
        if (res.ok) {
          setCurrentUser(data.user);
          if (rememberMe) {
            localStorage.setItem('currentUser', JSON.stringify(data.user));
          } else {
            sessionStorage.setItem('currentUser', JSON.stringify(data.user));
          }
          setAuthModalOpen(false);
          setVerificationCodeInput('');
          setSimulatedAlert(null);
          alert('✅ Success! Your email is verified, and you have been logged in automatically.');
          
          if (redirectAfterAuth) {
            navigate(redirectAfterAuth);
            setRedirectAfterAuth(null);
          }
        } else {
          setAuthError(data.error || 'Invalid code. Please try again.');
        }
      } else if (authMode === 'forgot-password') {
        const res = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authForm.email })
        });
        const data = await res.json();
        if (res.ok) {
          setSimulatedAlert({
            type: 'reset',
            message: `🔑 [SIMULATED INBOX] A password reset security token has been generated. Copy this code to proceed:`,
            code: data.simulatedResetToken || ''
          });
          setResetTokenInput(data.simulatedResetToken || '');
          setAuthMode('reset-password');
        } else {
          setAuthError(data.error || 'No account registered with this email.');
        }
      } else if (authMode === 'reset-password') {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: resetTokenInput,
            newPassword: newPasswordInput
          })
        });
        const data = await res.json();
        if (res.ok) {
          setNewPasswordInput('');
          setResetTokenInput('');
          setSimulatedAlert({
            type: 'success',
            message: '🎉 Your password has been updated! Please sign in using your new credentials.',
            code: ''
          });
          setAuthMode('login');
        } else {
          setAuthError(data.error || 'Reset failed. Token might be invalid or expired.');
        }
      }
    } catch (err: any) {
      setAuthError('Connection error to auth server. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    navigate('home');
  };

  const handleWriteArticleClick = () => {
    if (currentUser) {
      navigate('write-article');
    } else {
      setRedirectAfterAuth('write-article');
      setAuthMode('signup'); // "first he signup then write article" - show signup first
      setAuthForm({ username: '', password: '', fullName: '', email: '' });
      setAuthError('');
      setSimulatedAlert(null);
      setAuthModalOpen(true);
    }
  };

  const handleWriterArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    if (!writerArticle.title || !writerArticle.category || !writerArticle.content) {
      alert('Title, subject, and article body are required.');
      return;
    }

    // Double check email verification on the frontend before submitting
    if (currentUser.isVerified === false) {
      setRedirectAfterAuth('write-article');
      setAuthMode('verification');
      setAuthError('');
      // Trigger a simulated verification code just in case they don't have one
      try {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: currentUser.username,
            password: 'placeholder_password_resend_code',
            fullName: currentUser.fullName,
            email: currentUser.email
          })
        });
        const data = await res.json();
        setSimulatedAlert({
          type: 'verification',
          message: `📧 Your profile is unverified. Use this simulated 6-digit code to verify your email instantly before publishing:`,
          code: data.simulatedCode || '123456'
        });
      } catch {
        setSimulatedAlert({
          type: 'verification',
          message: `📧 Your profile is unverified. Use this simulated 6-digit code to verify your email instantly before publishing:`,
          code: '123456'
        });
      }
      setAuthModalOpen(true);
      return;
    }

    const isEdit = !!writerArticle.id;
    const url = isEdit ? `/api/articles/${writerArticle.id}` : '/api/articles';
    const method = isEdit ? 'PUT' : 'POST';

    const articlePayload = {
      ...writerArticle,
      author: currentUser.fullName || currentUser.username,
      image: imageUploadMode === 'preset' ? selectedPresetImage : writerArticle.image,
      publishDate: writerArticle.publishDate || new Date().toISOString()
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articlePayload)
      });
      if (res.ok) {
        // Clear active drafts on local storage on successful publish
        if (writerArticle.id) {
          setLocalDrafts(prev => {
            const updated = prev.filter(d => d.id !== writerArticle.id);
            localStorage.setItem('educational_drafts', JSON.stringify(updated));
            return updated;
          });
        }
        setWriterArticle({
          title: '',
          category: categories[0]?.slug || 'education',
          excerpt: '',
          content: '',
          image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
          tags: []
        });
        fetchArticles(); // sync home feed
        navigate('writer-hub');
      } else {
        const errData = await res.json();
        if (res.status === 403) {
          // Gated! Open Verification
          setAuthMode('verification');
          setAuthError(errData.error || 'Your email must be verified first.');
          setAuthModalOpen(true);
        } else {
          alert(errData.error || 'Failed to publish article.');
        }
      }
    } catch (err) {
      console.error(err);
      alert('Network error submitting article.');
    }
  };

  const handleEditWriterArticle = (art: Article) => {
    setWriterArticle(art);
    // Detect image upload mode
    const presets = [
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80'
    ];
    if (presets.includes(art.image)) {
      setImageUploadMode('preset');
      setSelectedPresetImage(art.image);
    } else if (art.image && art.image.startsWith('data:image/')) {
      setImageUploadMode('file');
    } else {
      setImageUploadMode('url');
    }
    navigate('write-article');
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // limit to 2MB
      alert('Please upload an image file smaller than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setWriterArticle(prev => ({ ...prev, image: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // ----------------------------------------------------
  // Interactive Helpers & Operations
  // ----------------------------------------------------

  // Increment Likes count
  const handleLikeArticle = async (articleId: string) => {
    try {
      const res = await fetch(`/api/articles/${articleId}/like`, { method: 'POST' });
      if (res.ok) {
        // Optimistic UI updates
        setArticles(prev => prev.map(art => art.id === articleId ? { ...art, likes: art.likes + 1 } : art));
        if (param === articleId || articles.some(a => a.slug === param && a.id === articleId)) {
          // If we are viewing that specific article, increment there too
          setArticles(prev => prev.map(art => {
            if (art.slug === param || art.id === param) {
              return { ...art, likes: art.likes + 1 };
            }
            return art;
          }));
        }
      }
    } catch (err) {
      console.error('Error liking article:', err);
    }
  };

  // Submit Comments
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentForm.author || !commentForm.content || !commentForm.email) return;

    setSubmittingComment(true);
    try {
      // Find current article ID
      const activeArticle = articles.find(art => art.slug === param || art.id === param);
      if (!activeArticle) return;

      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: activeArticle.id,
          author: commentForm.author,
          email: commentForm.email,
          content: commentForm.content
        })
      });

      if (res.ok) {
        setCommentForm({ author: '', email: '', content: '' });
        fetchArticleComments(activeArticle.id);
      }
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Newsletter Signup
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setNewsletterStatus({ type: 'success', message: data.message });
        setNewsletterEmail('');
      } else {
        setNewsletterStatus({ type: 'error', message: data.error || 'Failed to subscribe' });
      }
    } catch {
      setNewsletterStatus({ type: 'error', message: 'Failed to subscribe. Please try again later.' });
    }

    setTimeout(() => {
      setNewsletterStatus({ type: null, message: '' });
    }, 5000);
  };

  // Submit Contact message
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      const data = await res.json();
      if (res.ok) {
        setContactStatus({ success: true, message: data.message });
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setContactStatus({ success: false, message: data.error || 'Submission failed.' });
      }
    } catch {
      setContactStatus({ success: false, message: 'Server communication error.' });
    }
  };

  // ----------------------------------------------------
  // Admin Panel Operations (CRUD)
  // ----------------------------------------------------

  // Fetch admin supplementary logs
  useEffect(() => {
    if (view === 'admin') {
      fetchAdminArticles();
      fetchAdminSubscribers();
      fetchAdminContacts();
    }
  }, [view]);

  const fetchAdminSubscribers = async () => {
    try {
      const res = await fetch('/api/newsletter');
      if (res.ok) setSubscribers(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchAdminContacts = async () => {
    try {
      const res = await fetch('/api/contact');
      if (res.ok) setContacts(await res.json());
    } catch (err) { console.error(err); }
  };

  // Delete Article
  const handleDeleteArticle = async (id: string) => {
    if (!confirm('Are you absolutely sure you want to delete this article?')) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminArticles();
        fetchArticles(); // sync home lists
      }
    } catch (err) { console.error(err); }
  };

  // Create or Update Article Form Submit
  const handleSaveArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle?.title || !editingArticle?.category || !editingArticle?.content) {
      alert('Title, category, and content are required.');
      return;
    }

    const isEdit = !!editingArticle.id;
    const url = isEdit ? `/api/articles/${editingArticle.id}` : '/api/articles';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingArticle)
      });
      if (res.ok) {
        setEditingArticle(null);
        fetchAdminArticles();
        fetchArticles();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to save article.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create or Update Category Form Submit
  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;

    const isEdit = !!editingCategory.id;
    const url = isEdit ? `/api/categories/${editingCategory.id}` : '/api/categories';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory)
      });
      if (res.ok) {
        setEditingCategory(null);
        fetchCategories();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to save category.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Deleting this category will not delete articles in it, but they might become un-categorized. Continue?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) fetchCategories();
    } catch (err) { console.error(err); }
  };

  // ----------------------------------------------------
  // Interactive Pomodoro Clock Widget
  // ----------------------------------------------------
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            alert('🍅 Study interval finished! Take a well-deserved 5-minute break.');
            return 1500;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ----------------------------------------------------
  // Exam Stress scale calculator
  // ----------------------------------------------------
  const handleStressSurvey = (index: number, value: number) => {
    const updated = [...stressAnswers];
    updated[index] = value;
    setStressAnswers(updated);
  };

  const calculateStress = () => {
    const sum = stressAnswers.reduce((a, b) => a + b, 0);
    setStressScore(sum);
  };

  // ----------------------------------------------------
  // Automatic Internal Linking Renderer
  // ----------------------------------------------------
  const applyInternalLinks = (html: string) => {
    const linkMap = [
      { phrase: 'spaced repetition', slug: 'science-of-effective-studying-spaced-repetition' },
      { phrase: 'AI Tools', slug: 'ai-tools-every-student-should-use-responsibly' },
      { phrase: 'Fibonacci Sequence', slug: 'unveiling-the-beauty-of-fibonacci-sequence' },
      { phrase: 'quantum computing', slug: 'quantum-computing-demystified-for-beginners' },
      { phrase: 'academic essays', slug: 'essay-writing-guide-persuasive-academic' },
      { phrase: 'scholarships', slug: 'how-to-secure-college-scholarships-full-guide' }
    ];

    let modified = html;
    linkMap.forEach(({ phrase, slug }) => {
      // Regex to target the phrase only if it's NOT inside HTML tag attributes (e.g., <img alt="phrase">)
      const regex = new RegExp(`\\b(${phrase})\\b(?![^<]*>)`, 'gi');
      modified = modified.replace(regex, `<a href="/article/${slug}" class="text-blue-600 dark:text-blue-400 font-bold hover:underline transition-all">$1</a>`);
    });
    return modified;
  };

  // Click Interceptor for dynamic internal routes
  const handleRichContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'A') {
      const href = target.getAttribute('href');
      if (href && href.startsWith('/article/')) {
        e.preventDefault();
        const slug = href.substring(9);
        navigate('article', slug);
      }
    }
  };

  // Filter articles based on search queries and category filters
  const filteredArticles = articles.filter(art => {
    const matchesSearch = searchQuery === '' ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
    if (view === 'category') {
      return matchesSearch && art.category === param;
    }
    return matchesSearch;
  });

  const featuredArticle = articles.find(art => art.trending) || articles[0];

  // Schema LD generator for SEO
  const generateSchemaMarkup = () => {
    if (view === 'article') {
      const activeArticle = articles.find(art => art.slug === param || art.id === param);
      if (activeArticle) {
        return {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": activeArticle.title,
          "image": [activeArticle.image],
          "datePublished": activeArticle.publishDate,
          "author": [{
            "@type": "Person",
            "name": activeArticle.author
          }],
          "description": activeArticle.excerpt
        };
      }
    }
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Daily Articles for Students",
      "url": window.location.origin
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-200">
      
      {/* Dynamic SEO Meta Tag Injector */}
      <SEOManager
        title={
          view === 'article' 
            ? (articles.find(a => a.slug === param || a.id === param)?.title || 'Article')
            : view === 'category'
            ? (`Subject: ${categories.find(c => c.slug === param)?.name || 'Category'}`)
            : view.charAt(0).toUpperCase() + view.slice(1)
        }
        description={
          view === 'article'
            ? (articles.find(a => a.slug === param || a.id === param)?.excerpt || 'Read educational insights.')
            : "An outstanding responsive educational website with daily high-quality articles, syllabus notes, and study guides for students."
        }
        canonicalUrl={window.location.href}
        ogType={view === 'article' ? 'article' : 'website'}
        ogImage={
          view === 'article'
            ? (articles.find(a => a.slug === param || a.id === param)?.image)
            : undefined
        }
        schemaMarkup={generateSchemaMarkup()}
      />

      {/* 1. Header & Navigation */}
      <Navbar
        currentView={view}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigate={navigate}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        currentUser={currentUser}
        onAuthClick={() => {
          setAuthMode('login');
          setAuthForm({ username: '', password: '', fullName: '' });
          setAuthError('');
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onWriteArticleClick={handleWriteArticleClick}
      />

      {/* 2. Page Content Manager */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          
          {/* A. HOMEPAGE */}
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-0"
            >
              <Hero searchQuery={searchQuery} onSearchChange={setSearchQuery} />
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Left Main Feed */}
                  <div className="lg:col-span-2 space-y-10">
                    
                    {/* Featured Article Spot */}
                    {!searchQuery && featuredArticle && (
                      <div className="space-y-4">
                        <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Featured Article
                        </h2>
                        <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 group">
                          <div className="relative aspect-video md:aspect-auto overflow-hidden">
                            <img
                              src={featuredArticle.image}
                              alt={featuredArticle.title}
                              className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                              referrerPolicy="no-referrer"
                            />
                            <span className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-md uppercase">
                              {featuredArticle.category.toUpperCase()}
                            </span>
                          </div>
                          <div className="p-6 flex flex-col justify-between">
                            <div className="space-y-3">
                              <span className="text-slate-400 text-xs font-semibold uppercase flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(featuredArticle.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <h3 
                                onClick={() => navigate('article', featuredArticle.slug)}
                                className="font-display font-extrabold text-xl text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer leading-snug"
                              >
                                {featuredArticle.title}
                              </h3>
                              <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 leading-relaxed">
                                {featuredArticle.excerpt}
                              </p>
                            </div>
                            <button
                              onClick={() => navigate('article', featuredArticle.slug)}
                              className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-xs text-center inline-block"
                            >
                              Read Full Article
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subject Category Quick Grid */}
                    {!searchQuery && (
                      <div className="space-y-4">
                        <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          Explore Subjects
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                          {categories.map((cat) => (
                            <div
                              key={cat.id}
                              onClick={() => navigate('category', cat.slug)}
                              className="p-4 bg-white dark:bg-slate-800 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer text-center space-y-2 group transition"
                            >
                              <div className="mx-auto w-9 h-9 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center font-bold">
                                <BookOpen className="w-4.5 h-4.5" />
                              </div>
                              <h3 className="font-display font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {cat.name}
                              </h3>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* General Latest Articles List */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="font-display font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
                          {searchQuery ? `Search Results for "${searchQuery}"` : 'Latest Educational Articles'}
                        </h2>
                        <span className="text-xs font-semibold text-slate-400">
                          Showing {filteredArticles.length} items
                        </span>
                      </div>

                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                          <p className="text-xs text-slate-400 font-medium">Loading educational feed...</p>
                        </div>
                      ) : filteredArticles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {filteredArticles.map((article) => (
                            <ArticleCard
                              key={article.id}
                              article={article}
                              categories={categories}
                              onClick={(slug) => navigate('article', slug)}
                              onCategoryClick={(slug) => navigate('category', slug)}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6">
                          <AlertTriangle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                          <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-1">No articles found</p>
                          <p className="text-xs text-slate-400">Try adjusting your keywords or category filter.</p>
                        </div>
                      )}
                    </div>

                    {/* Subscription Newsletter Banner */}
                    <div className="bg-blue-600 dark:bg-blue-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
                      <div className="absolute top-[-20px] left-[-20px] w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
                      <div className="space-y-2 text-center md:text-left">
                        <h3 className="font-display font-bold text-lg sm:text-xl">Never Miss an Academic Update</h3>
                        <p className="text-xs text-blue-100 max-w-sm">Join 5,000+ students receiving weekly study planners, tips, and summaries directly in their inbox.</p>
                      </div>
                      <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                        <input
                          type="email"
                          placeholder="Enter your student email..."
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          className="px-4 py-2.5 text-xs rounded-lg text-slate-800 bg-white placeholder:text-slate-400 focus:outline-hidden min-w-[220px]"
                          required
                        />
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer text-center shrink-0"
                        >
                          Subscribe Free
                        </button>
                      </form>
                      {newsletterStatus.type && (
                        <div className={`absolute bottom-2 right-6 text-[10px] font-semibold ${newsletterStatus.type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                          {newsletterStatus.message}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Sidebar column */}
                  <div className="space-y-6">
                    <Sidebar articles={articles} onArticleClick={(slug) => navigate('article', slug)} />
                  </div>

                </div>
              </div>
            </motion.div>
          )}

          {/* B. CATEGORY FILTER VIEW */}
          {view === 'category' && (
            <motion.div
              key="category"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-6">
                <button onClick={() => navigate('home')} className="hover:text-blue-600">Home</button>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-600 dark:text-slate-300 font-semibold">Category</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-slate-800 dark:text-slate-100">{categories.find(c => c.slug === param)?.name || param}</span>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 mb-10">
                <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white">
                  Subject: {categories.find(c => c.slug === param)?.name || param}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-xl">
                  {categories.find(c => c.slug === param)?.description || 'Explore our latest academic summaries and study guides.'}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {filteredArticles.map(art => (
                        <ArticleCard
                          key={art.id}
                          article={art}
                          categories={categories}
                          onClick={(slug) => navigate('article', slug)}
                          onCategoryClick={(slug) => navigate('category', slug)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-850 p-6">
                      <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No articles in this category yet</p>
                      <button onClick={() => navigate('home')} className="mt-4 text-xs font-bold text-blue-600 underline">
                        Back to Homepage
                      </button>
                    </div>
                  )}
                </div>
                <div className="space-y-6">
                  <Sidebar articles={articles} onArticleClick={(slug) => navigate('article', slug)} />
                </div>
              </div>
            </motion.div>
          )}

          {/* C. ARTICLE DETAIL VIEW */}
          {view === 'article' && (() => {
            const activeArticle = articles.find(art => art.slug === param || art.id === param);
            if (!activeArticle) {
              return (
                <div className="text-center py-20">
                  <p className="text-red-500">Article not found.</p>
                  <button onClick={() => navigate('home')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md">Home</button>
                </div>
              );
            }

            const relatedArticles = articles
              .filter(art => art.category === activeArticle.category && art.id !== activeArticle.id)
              .slice(0, 3);

            return (
              <motion.div
                key="article-detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
              >
                {/* Breadcrumbs */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mb-6">
                  <button onClick={() => navigate('home')} className="hover:text-blue-600 transition">Home</button>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <button onClick={() => navigate('category', activeArticle.category)} className="hover:text-blue-600 transition uppercase">
                    {activeArticle.category}
                  </button>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-slate-600 dark:text-slate-400 truncate max-w-xs font-semibold">{activeArticle.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Core content */}
                  <div className="lg:col-span-2 space-y-8 bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
                    
                    {/* Header */}
                    <div className="space-y-4">
                      <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-bold tracking-wider uppercase">
                        {activeArticle.category}
                      </span>
                      <h1 className="font-display font-black text-2xl sm:text-4xl text-slate-900 dark:text-white leading-tight">
                        {activeArticle.title}
                      </h1>
                      
                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 border-y border-slate-100 dark:border-slate-700/60 py-3">
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{activeArticle.author}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(activeArticle.publishDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5">
                          <Eye className="w-4 h-4" />
                          <span>{activeArticle.views} reads</span>
                        </span>
                      </div>
                    </div>

                    {/* Hero Thumbnail */}
                    <div className="rounded-xl overflow-hidden aspect-video relative">
                      <img
                        src={activeArticle.image}
                        alt={activeArticle.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Rich Styled Article Content */}
                    <div 
                      className="article-rich-content text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base space-y-4"
                      onClick={handleRichContentClick}
                      dangerouslySetInnerHTML={{ __html: applyInternalLinks(activeArticle.content) }}
                    />

                    {/* Social Shares & Interactivity Section */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-700/60">
                      
                      {/* Like button */}
                      <button
                        onClick={() => handleLikeArticle(activeArticle.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-full text-sm font-bold transition cursor-pointer"
                      >
                        <Heart className="w-4.5 h-4.5 fill-red-600/10" />
                        <span>Like Article ({activeArticle.likes})</span>
                      </button>

                      {/* Social Sharing triggers */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-slate-400">Share:</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.href);
                            alert('🔗 Article link copied to clipboard successfully!');
                          }}
                          className="p-2 bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-slate-500 dark:text-slate-300 transition"
                          title="Copy link"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <a 
                          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(activeArticle.title)}&url=${encodeURIComponent(window.location.href)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg text-slate-500 dark:text-slate-300 transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Related Articles Carousel */}
                    <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                      <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Related Academic Articles</h3>
                      {relatedArticles.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {relatedArticles.map(art => (
                            <div 
                              key={art.id} 
                              onClick={() => navigate('article', art.slug)}
                              className="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800 cursor-pointer hover:border-blue-400 dark:hover:border-blue-600 transition group space-y-2.5"
                            >
                              <img src={art.image} alt={art.title} className="rounded-lg h-24 w-full object-cover" />
                              <h4 className="font-sans font-bold text-xs text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {art.title}
                              </h4>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No related articles found in this category.</p>
                      )}
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                        <h3 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                          Comments ({comments.length})
                        </h3>
                      </div>

                      {/* Comment feed */}
                      <div className="space-y-4">
                        {comments.length > 0 ? (
                          comments.map((com) => (
                            <div key={com.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-700 dark:text-slate-200">{com.author}</span>
                                <span className="text-slate-400">{new Date(com.date).toLocaleDateString()}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                {com.content}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-400 italic">No comments submitted yet. Start the academic discussion below!</p>
                        )}
                      </div>

                      {/* Comment form */}
                      <form onSubmit={handleSubmitComment} className="space-y-3.5 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
                        <h4 className="font-sans font-bold text-xs text-slate-700 dark:text-slate-200">Post an Educational Response</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Your Name*"
                            value={commentForm.author}
                            onChange={(e) => setCommentForm({ ...commentForm, author: e.target.value })}
                            className="bg-white dark:bg-slate-800 text-xs px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                            required
                          />
                          <input
                            type="email"
                            placeholder="Your Email* (Not published)"
                            value={commentForm.email}
                            onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                            className="bg-white dark:bg-slate-800 text-xs px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                            required
                          />
                        </div>
                        <textarea
                          placeholder="Your educational review, questions, or ideas..."
                          value={commentForm.content}
                          onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 text-xs p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden min-h-[100px] resize-none"
                          required
                        />
                        <button
                          type="submit"
                          disabled={submittingComment}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{submittingComment ? 'Posting...' : 'Post Comment'}</span>
                        </button>
                      </form>
                    </div>

                  </div>

                  {/* Right Column Sidebar */}
                  <div className="space-y-6">
                    <Sidebar articles={articles} onArticleClick={(slug) => navigate('article', slug)} />
                  </div>
                </div>

              </motion.div>
            );
          })()}

          {/* D. STUDY TIPS VIEW WITH POMODORO TIMER */}
          {view === 'study-tips' && (
            <motion.div
              key="study-tips"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
            >
              <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold">Active Study Techniques</span>
                <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white">Study Secrets for Students</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Explore scientifically-backed methods to study smarter, retain more facts, and master critical subjects.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Methodologies */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Feynman Technique */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h2 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">The Feynman Technique</h2>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      Formulated by Nobel-winning physicist Richard Feynman, this technique assumes that you do not truly understand a concept unless you can explain it in simple terms to a child.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-xs">
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="font-bold text-blue-600">Step 1</span>
                        <h4 className="font-bold text-slate-700 dark:text-slate-200">Choose Topic</h4>
                        <p className="text-[10px] text-slate-400">Write down everything you know about it.</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="font-bold text-blue-600">Step 2</span>
                        <h4 className="font-bold text-slate-700 dark:text-slate-200">Teach a Child</h4>
                        <p className="text-[10px] text-slate-400">Explain it simply, avoid jargon.</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="font-bold text-blue-600">Step 3</span>
                        <h4 className="font-bold text-slate-700 dark:text-slate-200">Identify Gaps</h4>
                        <p className="text-[10px] text-slate-400">Go back to sources where you got stuck.</p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 space-y-1">
                        <span className="font-bold text-blue-600">Step 4</span>
                        <h4 className="font-bold text-slate-700 dark:text-slate-200">Simplify & Analogy</h4>
                        <p className="text-[10px] text-slate-400">Create analogies to simplify explanation.</p>
                      </div>
                    </div>
                  </div>

                  {/* Leitner Flashcard system */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl">
                        <Layers className="w-5 h-5" />
                      </div>
                      <h2 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">The Leitner Flashcard Box System</h2>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                      A highly efficient way to study flashcards using spaced repetitions. Cards are sorted into groups based on how well you know each one.
                    </p>
                    <ul className="space-y-2 text-xs text-slate-500 pl-4 list-disc">
                      <li><strong>Box 1 (Every day):</strong> Contains cards you frequently get wrong.</li>
                      <li><strong>Box 2 (Every 3 days):</strong> Cards you got right once. Getting a card right moves it up to Box 3!</li>
                      <li><strong>Box 3 (Every 5 days):</strong> Highly confident items. If you get it wrong in Box 3, it immediately returns to Box 1!</li>
                    </ul>
                  </div>

                </div>

                {/* Interactive Pomodoro Timer Widget Column */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs text-center space-y-4">
                    <h3 className="font-display font-extrabold text-base text-slate-900 dark:text-white">Interactive Pomodoro Timer</h3>
                    <p className="text-xs text-slate-400">Study with extreme focus. Rest for 5 mins after the count.</p>
                    
                    {/* Clock face */}
                    <div className="font-mono text-5xl font-black text-blue-600 dark:text-blue-400 bg-slate-50 dark:bg-slate-900/50 py-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                      {formatTimer(pomodoroTime)}
                    </div>

                    {/* Clock Controls */}
                    <div className="flex justify-center items-center gap-3">
                      <button
                        onClick={() => setTimerRunning(!timerRunning)}
                        className={`p-3 rounded-full cursor-pointer transition ${
                          timerRunning ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        title={timerRunning ? 'Pause' : 'Start'}
                      >
                        {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => { setTimerRunning(false); setPomodoroTime(1500); }}
                        className="p-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full cursor-pointer text-slate-500 dark:text-slate-300 transition"
                        title="Reset"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex justify-center gap-2 pt-2">
                      <button onClick={() => { setTimerRunning(false); setPomodoroTime(1500); }} className="px-3 py-1 bg-slate-50 dark:bg-slate-700 rounded-md text-[10px] font-bold text-slate-500 hover:text-blue-500">25 min study</button>
                      <button onClick={() => { setTimerRunning(false); setPomodoroTime(300); }} className="px-3 py-1 bg-slate-50 dark:bg-slate-700 rounded-md text-[10px] font-bold text-slate-500 hover:text-blue-500">5 min break</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* E. EXAM PREPARATION HUB WITH STRESS CALCULATOR */}
          {view === 'exam-prep' && (
            <motion.div
              key="exam-prep"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
            >
              <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold">Ready for Finals</span>
                <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white">Exam Preparation Hub</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Strategic guidelines, countdowns, and tools to ace your finals without burning out.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revision templates */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Revision Matrix */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
                    <h2 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">Revision Priority Matrix</h2>
                    <p className="text-xs text-slate-500">How to allocate revision time efficiently across subjects:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/40 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600">Quadrant 1</span>
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-xs">High Weakness & High Exam Weight</h4>
                        <p className="text-[10px] text-slate-400">Do these first. Spend 50% of your revision blocks practicing active recall on these topics.</p>
                      </div>
                      <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Quadrant 2</span>
                        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-xs">High Strength & High Exam Weight</h4>
                        <p className="text-[10px] text-slate-400">Keep refined with lightweight weekly reviews. Maintain peak retrieval speed.</p>
                      </div>
                    </div>
                  </div>

                  {/* Syllabus breakdown checklist */}
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
                    <h2 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">The Exam stress Buster Framework</h2>
                    <ol className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                      <li><strong>Practice on Past Papers:</strong> Simulating real exam environments is the most effective stress reducer. It eliminates fear of the unknown.</li>
                      <li><strong>Create Cheat Sheets:</strong> Condense entire subjects onto a single page. The process of deciding what is important forces critical comprehension.</li>
                      <li><strong>Stop Studying 2 Hours Before:</strong> Give your brain time to settle. Enter the examination hall clear-headed, hydrated, and focused.</li>
                    </ol>
                  </div>

                </div>

                {/* Exam Stress questionnaire */}
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-800 shadow-xs space-y-4 text-xs">
                    <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">Exam Stress Assessment</h3>
                    <p className="text-slate-400 text-[11px]">Evaluate your stress index and unlock tailored academic anxiety strategies.</p>
                    
                    <div className="space-y-3 pt-2">
                      <div>
                        <p className="font-medium text-slate-600 dark:text-slate-300 mb-1.5">1. How often do you lose sleep thinking about upcoming exams?</p>
                        <div className="flex justify-between gap-1">
                          {[1, 2, 3, 4, 5].map(v => (
                            <button
                              key={v}
                              onClick={() => handleStressSurvey(0, v)}
                              className={`w-7 h-7 rounded-md font-bold transition ${stressAnswers[0] === v ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-600 dark:text-slate-300 mb-1.5">2. Do you experience brain-block during timed mock tests?</p>
                        <div className="flex justify-between gap-1">
                          {[1, 2, 3, 4, 5].map(v => (
                            <button
                              key={v}
                              onClick={() => handleStressSurvey(1, v)}
                              className={`w-7 h-7 rounded-md font-bold transition ${stressAnswers[1] === v ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-slate-600 dark:text-slate-300 mb-1.5">3. Are you struggling to organize your study calendar?</p>
                        <div className="flex justify-between gap-1">
                          {[1, 2, 3, 4, 5].map(v => (
                            <button
                              key={v}
                              onClick={() => handleStressSurvey(2, v)}
                              className={`w-7 h-7 rounded-md font-bold transition ${stressAnswers[2] === v ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={calculateStress}
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition"
                    >
                      Analyze Stress Level
                    </button>

                    {stressScore !== null && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg space-y-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">Result: {stressScore} / 15</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed">
                          {stressScore > 10 
                            ? "Anxiety is High. Pro tip: Cut revision blocks down to 20 mins, do deep breathing loops, and practice past papers without timers first."
                            : stressScore > 5
                            ? "Anxiety is Moderate. Pro tip: Utilize Pomodoros to maintain stable pacing, and ensure 8 hours of sleep before finals."
                            : "Stable Mind. Pro tip: You are doing great! Maintain active recall and help other students to reinforce your learning."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* F. NOTE TEMPLATES VIEW */}
          {view === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
            >
              <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold">Cornell & Templates</span>
                <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white">Academic Notes & Syllabus Templates</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Downloadable structure formats and Cornell outlines to boost lecture reading comprehensions.</p>
              </div>

              {/* Grid of notes structures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {/* Cornell outline block */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Cornell Note-Taking Grid</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Designed at Cornell University in the 1940s, this structured layout is scientifically proven to enhance critical thinking and memory recall during lectures.
                  </p>
                  
                  {/* Miniature simulation map */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-[10px] space-y-1.5 font-mono">
                    <div className="bg-slate-50 dark:bg-slate-900 p-1 rounded-sm text-center font-bold text-slate-400 uppercase tracking-wider">Title of the Lecture / Date</div>
                    <div className="grid grid-cols-3 gap-1.5 h-32">
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 p-1 rounded-sm flex flex-col justify-between">
                        <span className="font-bold text-blue-600">Cues Column</span>
                        <p className="text-[8px] text-slate-400">Formulate questions, keywords, and retrieval triggers here during or after study.</p>
                      </div>
                      <div className="col-span-2 bg-slate-50 dark:bg-slate-900 p-1 rounded-sm flex flex-col justify-between">
                        <span className="font-bold text-slate-500">Active Notes Area</span>
                        <p className="text-[8px] text-slate-400">Jot down main ideas, definitions, bullet formulas, and bullet schemas during lectures.</p>
                      </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/40 p-1.5 rounded-sm flex flex-col justify-between">
                      <span className="font-bold text-green-600">Summary Section</span>
                      <p className="text-[8px] text-slate-400">Synthesize the entire sheet into 3 short sentences. Forces complete cognitive chunking.</p>
                    </div>
                  </div>
                </div>

                {/* Feynman Note Template */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-800/80 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">Feynman Technique Organizer</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Designed to map out topics and identify exactly where your conceptual comprehension falters.
                  </p>
                  
                  {/* Mini outline simulation */}
                  <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-[10px] space-y-1.5">
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-1.5 text-slate-400">
                      <span>Concept name: ___________</span>
                      <span>Target Audience: Child (Age 10)</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-500">1. Plain Explanation (No complex jargon Allowed):</p>
                      <div className="bg-slate-50 dark:bg-slate-900/50 h-10 rounded border border-dashed border-slate-200 dark:border-slate-800"></div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-500">2. Analogies to explain the mechanism:</p>
                      <div className="bg-slate-50 dark:bg-slate-900/50 h-8 rounded border border-dashed border-slate-200 dark:border-slate-800"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* G. ABOUT VIEW */}
          {view === 'about' && (
            <motion.div
              key="about"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8"
            >
              <div className="text-center space-y-3">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase">About Daily Articles</span>
                <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white">Daily Articles for Students</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Our platform is dedicated to simplifying complex academic subjects and providing reliable resources to students worldwide.</p>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xs space-y-6 text-sm">
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">Our Mission</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  At "Daily Articles for Students," we believe that education should be accessible, engaging, and scientifically optimized. Too often, learning is presented as tedious memorization or complex theories. Our writing team of educators, researchers, and tech enthusiasts translate dense material into clear, readable, and beautiful summaries.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-slate-800 dark:text-slate-200">Who We Serve</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      High school scholars, college majors, lifelong learners, and teachers searching for neat syllabus templates and educational summaries.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-display font-bold text-slate-800 dark:text-slate-200">How We Maintain Quality</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Every single article goes through academic proofing. We ensure all equations, dates, and guides match current verified curriculums.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* H. CONTACT VIEW */}
          {view === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8"
            >
              <div className="text-center space-y-3">
                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold uppercase">Get In Touch</span>
                <h1 className="font-display font-black text-3xl sm:text-4xl text-slate-900 dark:text-white">Contact Our Team</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Have feedback, suggestions for articles, or support queries? We are here to help.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact info card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-850 shadow-xs space-y-5 text-xs">
                  <h2 className="font-display font-bold text-base text-slate-900 dark:text-white">Platform Information</h2>
                  <p className="text-slate-500 leading-relaxed font-medium">
                    We respond to student and teacher correspondence within 24-48 business hours. For partnerships, sponsorship queries, or school integrations, reach out to our email.
                  </p>
                  
                  <div className="space-y-3.5 border-t border-slate-100 dark:border-slate-700/60 pt-4">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <User className="w-4.5 h-4.5 text-blue-600" />
                      <span>Shafique Ahmed, Director of Education</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Send className="w-4.5 h-4.5 text-blue-600" />
                      <span>info@dailyarticles.edu</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <ShieldCheck className="w-4.5 h-4.5 text-blue-600" />
                      <span>WCAG 2.1 Compliant & Secure API</span>
                    </div>
                  </div>
                </div>

                {/* Form container */}
                <form onSubmit={handleContactSubmit} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-850 shadow-xs space-y-4">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">Send Message</h3>
                  <div className="space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Your Name*</label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden text-xs"
                          placeholder="Name"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Your Email*</label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden text-xs"
                          placeholder="Email"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Subject</label>
                      <input
                        type="text"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden text-xs"
                        placeholder="Subject (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">Message*</label>
                      <textarea
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden text-xs min-h-[120px] resize-none"
                        placeholder="Message content..."
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition"
                    >
                      Send Message
                    </button>
                  </div>

                  {contactStatus && (
                    <div className={`p-3 rounded-lg text-xs font-semibold ${contactStatus.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700'}`}>
                      {contactStatus.message}
                    </div>
                  )}
                </form>
              </div>
            </motion.div>
          )}

          {/* I. ADMIN VIEW & PANEL */}
          {view === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
                <div>
                  <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-bold uppercase tracking-wider">
                    Educational Moderator View
                  </span>
                  <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white mt-1.5">
                    Moderator Dashboard
                  </h1>
                </div>

                {/* Quick Add Article Trigger */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingArticle({
                        title: '',
                        excerpt: '',
                        content: '',
                        category: categories[0]?.slug || 'education',
                        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
                        author: 'Shafique Ahmed',
                        publishDate: new Date().toISOString().substring(0, 16),
                        tags: ['education', 'study tips'],
                        trending: false
                      });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Article</span>
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategory({ name: '', description: '', icon: 'BookOpen' });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 cursor-pointer transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Category</span>
                  </button>
                </div>
              </div>

              {/* Sub-tab navigation controllers */}
              <div className="flex flex-wrap border-b border-slate-100 dark:border-slate-800 mb-6 gap-1">
                {(['articles', 'categories', 'comments', 'subscribers', 'messages'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setAdminTab(tab)}
                    className={`px-4 py-2 text-xs font-bold capitalize transition border-b-2 -mb-px ${
                      adminTab === tab
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Editing Form: CATEGORY OVERLAY */}
              {editingCategory && (
                <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6 border border-slate-100 dark:border-slate-700 space-y-4">
                    <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                      {editingCategory.id ? 'Edit Category' : 'Create Subject Category'}
                    </h3>
                    <form onSubmit={handleSaveCategorySubmit} className="space-y-4 text-xs">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Category Name*</label>
                        <input
                          type="text"
                          required
                          value={editingCategory.name || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700"
                          placeholder="e.g. Physics, History"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Description</label>
                        <textarea
                          value={editingCategory.description || ''}
                          onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[80px]"
                          placeholder="Subject coverage info..."
                        />
                      </div>
                      
                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                        >
                          Save Category
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Editing Form: ARTICLE OVERLAY (Full View) */}
              {editingArticle ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-4">
                    <h2 className="font-display font-extrabold text-lg text-slate-900 dark:text-white">
                      {editingArticle.id ? `Edit Article: ${editingArticle.title}` : 'Create Educational Article'}
                    </h2>
                    <button
                      onClick={() => setEditingArticle(null)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-700 rounded-lg text-xs"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
                    </button>
                  </div>

                  <form onSubmit={handleSaveArticleSubmit} className="space-y-5 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Article Title*</label>
                        <input
                          type="text"
                          required
                          value={editingArticle.title || ''}
                          onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold"
                          placeholder="Enter catchy informative title..."
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Author Name*</label>
                        <input
                          type="text"
                          required
                          value={editingArticle.author || ''}
                          onChange={(e) => setEditingArticle({ ...editingArticle, author: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Subject Category*</label>
                        <select
                          value={editingArticle.category || ''}
                          onChange={(e) => setEditingArticle({ ...editingArticle, category: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold"
                        >
                          {categories.map(c => (
                            <option key={c.id} value={c.slug}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Featured Image (URL)*</label>
                        <input
                          type="text"
                          required
                          value={editingArticle.image || ''}
                          onChange={(e) => setEditingArticle({ ...editingArticle, image: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Publish Date / Scheduled*</label>
                        <input
                          type="datetime-local"
                          required
                          value={editingArticle.publishDate ? new Date(editingArticle.publishDate).toISOString().substring(0, 16) : ''}
                          onChange={(e) => setEditingArticle({ ...editingArticle, publishDate: new Date(e.target.value).toISOString() })}
                          className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Excerpt (Short description)*</label>
                      <input
                        type="text"
                        required
                        value={editingArticle.excerpt || ''}
                        onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700"
                        placeholder="Brief summary appearing on feed cards..."
                      />
                    </div>

                    {/* Rich Editor Component */}
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Article Body (HTML Rich Text)*</label>
                      <RichEditor
                        value={editingArticle.content || ''}
                        onChange={(val) => setEditingArticle({ ...editingArticle, content: val })}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700/60">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="trendingCheck"
                          checked={!!editingArticle.trending}
                          onChange={(e) => setEditingArticle({ ...editingArticle, trending: e.target.checked })}
                          className="w-4.5 h-4.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="trendingCheck" className="text-slate-600 dark:text-slate-300 font-bold">Mark as Trending/Featured Article</label>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingArticle(null)}
                          className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shadow-xs"
                        >
                          Save Article Status
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                /* Tab Panels displaying tables of database objects */
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                  
                  {/* ARTICLES TAB */}
                  {adminTab === 'articles' && (
                    <div className="overflow-x-auto text-xs">
                      <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                          <tr>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Views / Likes</th>
                            <th className="px-6 py-3 text-center font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                          {adminArticles.map((art) => (
                            <tr key={art.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                              <td className="px-6 py-4 truncate max-w-xs font-bold text-slate-800 dark:text-slate-200">{art.title}</td>
                              <td className="px-6 py-4 uppercase text-blue-600 font-bold">{art.category}</td>
                              <td className="px-6 py-4">{art.author}</td>
                              <td className="px-6 py-4 text-slate-400">{new Date(art.publishDate).toLocaleDateString()}</td>
                              <td className="px-6 py-4">👁️ {art.views} / ❤️ {art.likes}</td>
                              <td className="px-6 py-4 text-center space-x-2">
                                <button
                                  onClick={() => setEditingArticle(art)}
                                  className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-md"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteArticle(art.id)}
                                  className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-md"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* CATEGORIES TAB */}
                  {adminTab === 'categories' && (
                    <div className="overflow-x-auto text-xs">
                      <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                          <tr>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Icon</th>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Subject Name</th>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Slug</th>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-center font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                          {categories.map((cat) => (
                            <tr key={cat.id}>
                              <td className="px-6 py-4">🗂️</td>
                              <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">{cat.name}</td>
                              <td className="px-6 py-4 font-mono text-slate-400">{cat.slug}</td>
                              <td className="px-6 py-4 truncate max-w-sm">{cat.description}</td>
                              <td className="px-6 py-4 text-center space-x-2">
                                <button
                                  onClick={() => setEditingCategory(cat)}
                                  className="p-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-md"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="p-1.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 rounded-md"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* COMMENTS TAB */}
                  {adminTab === 'comments' && (
                    <div className="p-6 text-center text-xs text-slate-400 italic">
                      <p>Comments are managed directly in the sidebar panel of active Article pages to prevent orphaned reviews.</p>
                      <button onClick={() => navigate('home')} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg">
                        Go to Homepage Articles
                      </button>
                    </div>
                  )}

                  {/* NEWSLETTER TAB */}
                  {adminTab === 'subscribers' && (
                    <div className="overflow-x-auto text-xs">
                      <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                          <tr>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Subscriber Email</th>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Registered Date</th>
                            <th className="px-6 py-3 text-center font-bold text-slate-500 uppercase tracking-wider">Type</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium">
                          {subscribers.length > 0 ? (
                            subscribers.map((sub) => (
                              <tr key={sub.id}>
                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">{sub.email}</td>
                                <td className="px-6 py-4 text-slate-400">{new Date(sub.date).toLocaleString()}</td>
                                <td className="px-6 py-4"><span className="px-2 py-0.5 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 rounded">Verified Student</span></td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="text-center py-8 text-slate-400 italic">No newsletter subscribers yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* MESSAGES TAB */}
                  {adminTab === 'messages' && (
                    <div className="overflow-x-auto text-xs">
                      <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-900">
                          <tr>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Contact Sender</th>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Message Content</th>
                            <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Date Received</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium text-slate-600 dark:text-slate-300">
                          {contacts.length > 0 ? (
                            contacts.map((msg) => (
                              <tr key={msg.id}>
                                <td className="px-6 py-4">
                                  <div className="font-bold text-slate-800 dark:text-slate-100">{msg.name}</div>
                                  <div className="text-[10px] text-slate-400">{msg.email}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">{msg.subject}</td>
                                <td className="px-6 py-4 max-w-sm whitespace-normal leading-relaxed">{msg.message}</td>
                                <td className="px-6 py-4 text-slate-400">{new Date(msg.date).toLocaleString()}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="text-center py-8 text-slate-400 italic">No messages received yet.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                </div>
              )}
            </motion.div>
          )}

          {/* J. LEGAL PAGES */}
          {view === 'privacy-policy' && (
            <div className="max-w-3xl mx-auto px-4 py-12 text-sm space-y-4">
              <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">Privacy Policy</h1>
              <p className="text-slate-500">Last updated: July 2026</p>
              <p className="leading-relaxed">At Daily Articles for Students, we prioritize the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Daily Articles for Students and how we use it. We only collect the student names and emails explicitly entered in our contact, newsletter, or comment forms to provide the educational features. We never trade, share, or sell this data.</p>
            </div>
          )}

          {view === 'terms-of-service' && (
            <div className="max-w-3xl mx-auto px-4 py-12 text-sm space-y-4">
              <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">Terms of Service</h1>
              <p className="text-slate-500">Last updated: July 2026</p>
              <p className="leading-relaxed">By accessing this educational platform, you agree to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. The materials contained in this website are protected by applicable copyright and trademark law.</p>
            </div>
          )}

          {view === 'disclaimer' && (
            <div className="max-w-3xl mx-auto px-4 py-12 text-sm space-y-4">
              <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white">Educational Disclaimer</h1>
              <p className="text-slate-500">Last updated: July 2026</p>
              <p className="leading-relaxed">The contents of this platform—including scientific explanations, mathematical theories, exam tips, and study templates—are provided purely for educational and motivational purposes. While we strive for extreme accuracy, we do not guarantee specific marks, academic percentages, or admissions success. Always consult directly with school counselors and official guidelines before making financial scholarship choices.</p>
            </div>
          )}

          {/* K. WRITER HUB VIEW */}
          {view === 'writer-hub' && currentUser && (
            <motion.div
              key="writer-hub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8"
            >
              {/* Header profile welcome card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-black text-xl flex items-center justify-center">
                    {currentUser.username.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      Academic Writer
                    </span>
                    <h1 className="font-display font-black text-xl sm:text-2xl text-slate-900 dark:text-white mt-1">
                      Welcome, {currentUser.fullName || currentUser.username}!
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Manage and draft your academic summaries, study notes, and student resources.</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => {
                      setWriterArticle({
                        title: '',
                        category: categories[0]?.slug || 'education',
                        excerpt: '',
                        content: '',
                        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
                        tags: []
                      });
                      setImageUploadMode('preset');
                      setSelectedPresetImage('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80');
                      navigate('write-article');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Write New Article</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-red-50 hover:text-red-600 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg cursor-pointer transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Writer Stats Quick grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-xs text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Publications</span>
                  <p className="font-display font-black text-2xl text-blue-600 dark:text-blue-400">
                    {articles.filter(a => a.author === (currentUser.fullName || currentUser.username)).length}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-xs text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Combined Reads</span>
                  <p className="font-display font-black text-2xl text-slate-800 dark:text-white">
                    {articles.filter(a => a.author === (currentUser.fullName || currentUser.username)).reduce((acc, a) => acc + (a.views || 0), 0)}
                  </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-xs text-center space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Combined Likes</span>
                  <p className="font-display font-black text-2xl text-red-500">
                    {articles.filter(a => a.author === (currentUser.fullName || currentUser.username)).reduce((acc, a) => acc + (a.likes || 0), 0)}
                  </p>
                </div>
              </div>

              {/* Writer Publication feed */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="p-5 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-sm text-slate-900 dark:text-white">Your Publications</h3>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Status: Live</span>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-900">
                      <tr>
                        <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Thumbnail</th>
                        <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Publish Date</th>
                        <th className="px-6 py-3 text-left font-bold text-slate-500 uppercase tracking-wider">Reads / Likes</th>
                        <th className="px-6 py-3 text-center font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium text-slate-600 dark:text-slate-300">
                      {articles.filter(a => a.author === (currentUser.fullName || currentUser.username)).length > 0 ? (
                        articles.filter(a => a.author === (currentUser.fullName || currentUser.username)).map((art) => (
                          <tr key={art.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10">
                            <td className="px-6 py-4">
                              <img src={art.image} alt={art.title} className="w-12 h-8 rounded-md object-cover border border-slate-100 dark:border-slate-700" referrerPolicy="no-referrer" />
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100 max-w-xs truncate">{art.title}</td>
                            <td className="px-6 py-4 text-blue-600 font-bold uppercase">{art.category}</td>
                            <td className="px-6 py-4 text-slate-400">{new Date(art.publishDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 font-semibold">👁️ {art.views} / ❤️ {art.likes}</td>
                            <td className="px-6 py-4 text-center space-x-2">
                              <button
                                onClick={() => navigate('article', art.slug)}
                                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 font-bold rounded-md transition"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleEditWriterArticle(art)}
                                className="px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-md transition font-bold"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-slate-400 italic">
                            You haven't written any articles yet. Let's write your first academic article!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* L. WRITE ARTICLE VIEW */}
          {view === 'write-article' && currentUser && (
            <motion.div
              key="write-article"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6"
            >
              {/* Top Bar Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-4">
                <div>
                  <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider">
                    Distraction-Free Workspace
                  </span>
                  <h1 className="font-display font-black text-2xl text-slate-900 dark:text-white mt-1">
                    {writerArticle.id && !writerArticle.id.startsWith('draft-') ? 'Edit Your Article' : 'Write Educational Article'}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveDraftManual}
                    className="flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg transition"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => navigate('writer-hub')}
                    className="flex items-center gap-1 px-3 py-2 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Hub
                  </button>
                </div>
              </div>

              {/* Two-Column Workspace Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Writing Inputs & Visual Editor (prose/rich writing editor) */}
                <form onSubmit={handleWriterArticleSubmit} className="lg:col-span-8 space-y-6 text-xs">
                  
                  {/* Title & Subject */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Article Title*</label>
                      <input
                        type="text"
                        required
                        value={writerArticle.title || ''}
                        onChange={(e) => setWriterArticle({ ...writerArticle, title: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold"
                        placeholder="e.g. 5 Memory Techniques Proven by Cognitive Science"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Subject Category*</label>
                      <select
                        value={writerArticle.category || ''}
                        onChange={(e) => setWriterArticle({ ...writerArticle, category: e.target.value })}
                        className="w-full bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        <option value="" disabled>-- Choose a Subject --</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Teaser Excerpt */}
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Short Teaser Excerpt* (Appears on feeds & cards)</label>
                    <input
                      type="text"
                      required
                      value={writerArticle.excerpt || ''}
                      onChange={(e) => setWriterArticle({ ...writerArticle, excerpt: e.target.value })}
                      className="w-full bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                      placeholder="Brief 1-2 sentence description that hooks student readers..."
                    />
                  </div>

                  {/* Advanced Thumbnail selector */}
                  <div className="bg-slate-50/50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-xs">Set Thumbnail Image</span>
                      
                      {/* Image mode switcher */}
                      <div className="flex bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300/30">
                        <button
                          type="button"
                          onClick={() => setImageUploadMode('preset')}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${imageUploadMode === 'preset' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'}`}
                        >
                          Presets
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageUploadMode('url')}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${imageUploadMode === 'url' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'}`}
                        >
                          Image URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageUploadMode('file')}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded cursor-pointer ${imageUploadMode === 'file' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500'}`}
                        >
                          Upload Local File
                        </button>
                      </div>
                    </div>

                    {/* Presets Grid */}
                    {imageUploadMode === 'preset' && (
                      <div className="space-y-3">
                        <p className="text-[10px] text-slate-400 font-semibold">Select an education-themed visual template compiled by researchers:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                          {[
                            { name: 'Studying', url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80' },
                            { name: 'Science', url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80' },
                            { name: 'Coding', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80' },
                            { name: 'Writing', url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80' },
                            { name: 'Workspace', url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' },
                            { name: 'Scholarships', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80' }
                          ].map((img) => (
                            <button
                              key={img.name}
                              type="button"
                              onClick={() => setSelectedPresetImage(img.url)}
                              className={`cursor-pointer group relative rounded-lg overflow-hidden aspect-video border-2 transition ${selectedPresetImage === img.url ? 'border-blue-600 shadow-md scale-102' : 'border-transparent opacity-75 hover:opacity-100'}`}
                            >
                              <img src={img.url} alt={img.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              <div className="absolute inset-x-0 bottom-0 bg-black/60 py-0.5 text-center text-[9px] font-bold text-white uppercase tracking-wider">{img.name}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Image URL Input */}
                    {imageUploadMode === 'url' && (
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Enter Public Web Image URL*</label>
                        <input
                          type="url"
                          required={imageUploadMode === 'url'}
                          value={writerArticle.image || ''}
                          onChange={(e) => setWriterArticle({ ...writerArticle, image: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs"
                          placeholder="https://images.unsplash.com/photo-..."
                        />
                      </div>
                    )}

                    {/* File Upload Mode */}
                    {imageUploadMode === 'file' && (
                      <div className="space-y-2">
                        <label className="block text-slate-400 font-bold mb-1">Select Local Image File (PNG, JPG, max 2MB)*</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="w-full bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs"
                        />
                        {writerArticle.image && writerArticle.image.startsWith('data:image/') && (
                          <div className="flex items-center gap-2 pt-2">
                            <img src={writerArticle.image} alt="Upload preview" className="w-16 h-12 rounded object-cover border" />
                            <span className="text-[10px] text-green-600 dark:text-green-400 font-semibold">✓ Image uploaded and compressed successfully</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Body Content with Visual RichEditor */}
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1.5">Article Body content*</label>
                    <RichEditor
                      value={writerArticle.content || ''}
                      onChange={(val) => setWriterArticle({ ...writerArticle, content: val })}
                      placeholder="Start drafting your article using simple text formatting shortcuts. Highlight text to apply colors, highlights, bullet lists, custom fonts, or horizontal breaks. No HTML required!"
                    />
                  </div>

                  {/* Scheduled Publishing */}
                  <div className="p-4 bg-slate-50/40 dark:bg-slate-900/40 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Scheduled Publishing Option (Optional)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Hold this article back until a specific date. Leave empty to publish instantly and make visible immediately on student dashboards.
                    </p>
                    <input
                      type="datetime-local"
                      value={writerArticle.publishDate ? new Date(writerArticle.publishDate).toISOString().substring(0, 16) : ''}
                      onChange={(e) => setWriterArticle({ ...writerArticle, publishDate: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                      className="max-w-xs w-full bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs outline-hidden"
                    />
                  </div>

                  {/* Keywords Tags */}
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Keywords / Tags (Comma Separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(writerArticle.tags) ? writerArticle.tags.join(', ') : ''}
                      onChange={(e) => setWriterArticle({ ...writerArticle, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                      className="w-full bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold"
                      placeholder="e.g. study skills, memory science, high school, focus tips"
                    />
                  </div>

                  {/* Form Submission Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                    <button
                      type="button"
                      onClick={() => navigate('writer-hub')}
                      className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold rounded-lg cursor-pointer transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg cursor-pointer shadow-xs transition"
                    >
                      {writerArticle.id && !writerArticle.id.startsWith('draft-') ? 'Save Changes' : 'Publish Article'}
                    </button>
                  </div>

                </form>

                {/* Right Side: Writing Companion & SEO Assistant & Drafts Manager */}
                <div className="lg:col-span-4 space-y-6">

                  {/* SEO scorecard panel */}
                  {(() => {
                    const seoResult = calculateSEOScore();
                    return (
                      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-750 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
                          <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>SEO Score & Checklist</span>
                          </h3>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${seoResult.score >= 80 ? 'bg-green-50 text-green-600' : seoResult.score >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                            {seoResult.score >= 80 ? 'Excellent' : seoResult.score >= 50 ? 'Needs Work' : 'Incomplete'}
                          </span>
                        </div>

                        {/* Circular progress equivalent or scorecard indicator */}
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                          <div className="w-14 h-14 rounded-full border-4 border-slate-200 dark:border-slate-750 flex items-center justify-center font-display font-black text-slate-800 dark:text-white text-base relative">
                            {/* SVG Ring background indicator */}
                            <div className="absolute inset-0 flex items-center justify-center font-black">
                              {seoResult.score}%
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Student SEO Rank</span>
                            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                              {seoResult.score === 100 && '🥇 Perfect 100/100 score! Ready to go!'}
                              {seoResult.score < 100 && seoResult.score >= 80 && '🥈 Great performance! Minor optimization left.'}
                              {seoResult.score < 80 && seoResult.score >= 50 && '🥉 Moderate quality. Try adding missing items.'}
                              {seoResult.score < 50 && '⚠️ Poor SEO layout. Work on content density.'}
                            </p>
                          </div>
                        </div>

                        {/* Focus Keyword box */}
                        <div className="space-y-1.5 pt-1">
                          <label className="block text-[10px] font-bold uppercase text-slate-400">Target Focus Keyword</label>
                          <input
                            type="text"
                            value={focusKeyword}
                            onChange={(e) => setFocusKeyword(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold"
                            placeholder="e.g. spaced repetition"
                          />
                        </div>

                        {/* Checklist items */}
                        <div className="space-y-2.5 pt-2 text-xs">
                          
                          {/* Title check */}
                          <div className="flex items-start justify-between">
                            <span className="text-slate-500 font-medium">Title length (30-60 chars)</span>
                            <span className="font-semibold text-right flex items-center gap-1 font-mono">
                              {seoResult.checks.titleLength ? '✓ 20pts' : '✗ 0pts'}
                              <span className={`w-2 h-2 rounded-full ${seoResult.checks.titleLength ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                            </span>
                          </div>

                          {/* Excerpt check */}
                          <div className="flex items-start justify-between">
                            <span className="text-slate-500 font-medium">Excerpt presence (80-180 chars)</span>
                            <span className="font-semibold text-right flex items-center gap-1 font-mono">
                              {seoResult.checks.excerptPresence ? '✓ 15pts' : '✗ 0pts'}
                              <span className={`w-2 h-2 rounded-full ${seoResult.checks.excerptPresence ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                            </span>
                          </div>

                          {/* Keyword check */}
                          <div className="flex items-start justify-between">
                            <span className="text-slate-500 font-medium">Focus Keyword density (3-8 times)</span>
                            <span className="font-semibold text-right flex items-center gap-1 font-mono">
                              {seoResult.checks.keywordCount >= 3 && seoResult.checks.keywordCount <= 8 ? '✓ 25pts' : '✗ 0pts'}
                              <span className="text-[10px] text-slate-400">({seoResult.checks.keywordCount}x)</span>
                              <span className={`w-2 h-2 rounded-full ${seoResult.checks.keywordCount >= 3 && seoResult.checks.keywordCount <= 8 ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                            </span>
                          </div>

                          {/* Headings check */}
                          <div className="flex items-start justify-between">
                            <span className="text-slate-500 font-medium">Semantic Headings (H2 / H3 present)</span>
                            <span className="font-semibold text-right flex items-center gap-1 font-mono">
                              {seoResult.checks.headingsStructure ? '✓ 15pts' : '✗ 0pts'}
                              <span className={`w-2 h-2 rounded-full ${seoResult.checks.headingsStructure ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                            </span>
                          </div>

                          {/* Image presence check */}
                          <div className="flex items-start justify-between">
                            <span className="text-slate-500 font-medium">Media checklist (Img present)</span>
                            <span className="font-semibold text-right flex items-center gap-1 font-mono">
                              {seoResult.checks.imageCount >= 1 ? '✓ 15pts' : '✗ 0pts'}
                              <span className={`w-2 h-2 rounded-full ${seoResult.checks.imageCount >= 1 ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                            </span>
                          </div>

                          {/* Link check */}
                          <div className="flex items-start justify-between">
                            <span className="text-slate-500 font-medium">Anchor hyperlink present</span>
                            <span className="font-semibold text-right flex items-center gap-1 font-mono">
                              {seoResult.checks.linkDensity ? '✓ 10pts' : '✗ 0pts'}
                              <span className={`w-2 h-2 rounded-full ${seoResult.checks.linkDensity ? 'bg-green-500' : 'bg-amber-400'}`}></span>
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })()}

                  {/* Local drafts lists panel */}
                  <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-750 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
                      <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <span>Saved Local Drafts ({localDrafts.length})</span>
                      </h3>
                      <span className="animate-pulse flex items-center gap-1 text-[9px] text-green-600 dark:text-green-400 font-bold uppercase">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Auto-Save Active
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Your changes are auto-saved locally in your browser cache every 8 seconds so your hard work is always protected.
                    </p>

                    {/* Drafts List items */}
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {localDrafts.length > 0 ? (
                        localDrafts.map((draft) => (
                          <div
                            key={draft.id}
                            onClick={() => handleLoadDraft(draft)}
                            className="p-2.5 rounded-lg bg-slate-50 hover:bg-blue-50/50 dark:bg-slate-900 dark:hover:bg-blue-900/10 border border-slate-150 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-900 cursor-pointer transition text-[11px] group relative"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-bold text-slate-700 dark:text-slate-300 line-clamp-1 group-hover:text-blue-600">
                                {draft.title || 'Untitled Draft'}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteDraft(draft.id, e)}
                                className="p-1 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded transition"
                                title="Delete draft"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="text-[9px] text-slate-400 block mt-1 font-semibold">
                              Saved {new Date(draft.lastSaved).toLocaleTimeString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-slate-400 italic text-[11px]">
                          No local drafts saved yet. Auto-saves appear here as soon as you type.
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* 4. USER AUTHENTICATION PROMPT OVERLAY MODAL */}
      {authModalOpen && (
        <div className="fixed inset-0 z-100 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 sm:p-8 border border-slate-100 dark:border-slate-700 shadow-2xl relative space-y-5"
          >
            {/* Close trigger */}
            <button
              onClick={() => {
                setAuthModalOpen(false);
                setSimulatedAlert(null);
                setAuthError('');
              }}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Title / Info card based on current active mode */}
            <div className="text-center space-y-2">
              <div className="mx-auto w-10 h-10 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h2 className="font-display font-black text-xl text-slate-900 dark:text-white">
                {authMode === 'login' && 'Welcome Back!'}
                {authMode === 'signup' && 'Create Writer Account'}
                {authMode === 'verification' && 'Verify Your Email'}
                {authMode === 'forgot-password' && 'Reset Password'}
                {authMode === 'reset-password' && 'Enter New Password'}
              </h2>
              <p className="text-xs text-slate-400">
                {authMode === 'login' && 'Sign in to write summaries, check revision tools, and contribute.'}
                {authMode === 'signup' && 'Register to write educational articles. Signup takes less than a minute.'}
                {authMode === 'verification' && 'Enter the 6-digit confirmation code we simulated to activate your account.'}
                {authMode === 'forgot-password' && 'Enter your registered email and we will generate a recovery code.'}
                {authMode === 'reset-password' && 'Provide the security token along with your new password.'}
              </p>
            </div>

            {/* Simulated Inbox Box */}
            {simulatedAlert && (
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-1.5">
                <p className="font-semibold">{simulatedAlert.message}</p>
                {simulatedAlert.code && (
                  <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 font-mono text-base font-black tracking-wider text-center text-blue-600 dark:text-blue-400">
                    <span>{simulatedAlert.code}</span>
                    <button 
                      type="button" 
                      onClick={() => {
                        navigator.clipboard.writeText(simulatedAlert.code);
                        alert('Copied code to clipboard!');
                      }}
                      className="text-[10px] font-sans font-bold text-slate-400 hover:text-blue-600 hover:underline"
                    >
                      Copy
                    </button>
                  </div>
                )}
              </div>
            )}

            {authError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg border border-red-100 dark:border-red-900/40">
                ⚠️ {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
              
              {/* Signup view field additions */}
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={authForm.fullName}
                      onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                      placeholder="e.g. Shafique Ahmed"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Email Address* (Required)</label>
                    <input
                      type="email"
                      required
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                      placeholder="e.g. student@university.edu"
                    />
                  </div>
                </>
              )}

              {/* standard username field for login and signup */}
              {(authMode === 'login' || authMode === 'signup') && (
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Username*</label>
                  <input
                    type="text"
                    required
                    value={authForm.username}
                    onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold lowercase text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                    placeholder="e.g. shafique_edu"
                  />
                </div>
              )}

              {/* standard password field for login and signup */}
              {(authMode === 'login' || authMode === 'signup') && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-slate-500 dark:text-slate-400 font-bold">Password*</label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot-password');
                          setAuthError('');
                          setSimulatedAlert(null);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                    placeholder="••••••"
                  />
                </div>
              )}

              {/* Verification form specific fields */}
              {authMode === 'verification' && (
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">6-Digit Code*</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={verificationCodeInput}
                    onChange={(e) => setVerificationCodeInput(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono text-center text-lg font-bold tracking-widest focus:ring-1 focus:ring-blue-500 outline-hidden"
                    placeholder="123456"
                  />
                </div>
              )}

              {/* Forgot password specific fields */}
              {authMode === 'forgot-password' && (
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Registered Email Address*</label>
                  <input
                    type="email"
                    required
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                    placeholder="e.g. student@university.edu"
                  />
                </div>
              )}

              {/* Reset password specific fields */}
              {authMode === 'reset-password' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Security Reset Token*</label>
                    <input
                      type="text"
                      required
                      value={resetTokenInput}
                      onChange={(e) => setResetTokenInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono text-center text-sm font-semibold tracking-wider focus:ring-1 focus:ring-blue-500 outline-hidden"
                      placeholder="Token"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">Choose New Password* (min 6 characters)</label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold text-xs focus:ring-1 focus:ring-blue-500 outline-hidden"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me Option */}
              {(authMode === 'login' || authMode === 'signup') && (
                <div className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-xs border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="rememberMe" className="text-slate-500 dark:text-slate-400 font-medium select-none cursor-pointer">
                    Remember Me (Keep session active across visits)
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-lg transition-all text-xs cursor-pointer shadow-xs"
              >
                {authLoading ? 'Processing...' : (
                  <>
                    {authMode === 'login' && 'Sign In'}
                    {authMode === 'signup' && 'Create Account'}
                    {authMode === 'verification' && 'Verify and Log In'}
                    {authMode === 'forgot-password' && 'Generate Reset Token'}
                    {authMode === 'reset-password' && 'Update Password'}
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 text-xs space-y-2">
              <div>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError('');
                    }}
                    className="text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Don't have an account? Sign Up First
                  </button>
                )}
                {authMode === 'signup' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                    }}
                    className="text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    Already have a writer account? Sign In
                  </button>
                )}
                {authMode === 'verification' && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthError('');
                    }}
                    className="text-slate-500 hover:underline font-medium cursor-pointer"
                  >
                    ← Back to Sign Up Registration
                  </button>
                )}
                {(authMode === 'forgot-password' || authMode === 'reset-password') && (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError('');
                    }}
                    className="text-blue-600 hover:underline font-bold cursor-pointer"
                  >
                    ← Back to Sign In Screen
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 3. Footer Segment */}
      <Footer onNavigate={navigate} />

    </div>
  );
}
