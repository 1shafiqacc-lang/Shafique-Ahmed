import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { dbService } from './server/db';
import { Article, Category, Comment, NewsletterSubscriber, ContactMessage, User } from './src/types';

const hashPassword = (password: string): string => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with 10mb limit for rich images/content
  app.use(express.json({ limit: '10mb' }));

  // Helper to generate a slug from a string
  const generateSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')         // Replace spaces with -
      .replace(/-+/g, '-')          // Replace multiple - with single -
      .trim();
  };

  // ----------------------------------------------------
  // Dynamic SEO XML Sitemap & Robots.txt
  // ----------------------------------------------------
  
  app.get('/robots.txt', (req, res) => {
    const hostUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const robots = [
      'User-agent: *',
      'Allow: /',
      `Sitemap: ${hostUrl}/sitemap.xml`
    ].join('\n');
    
    res.type('text/plain');
    res.send(robots);
  });

  app.get('/sitemap.xml', (req, res) => {
    const hostUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const articles = dbService.getArticles();
    const categories = dbService.getCategories();
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Homepage
    xml += '  <url>\n';
    xml += `    <loc>${hostUrl}/</loc>\n`;
    xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    xml += '    <changefreq>daily</changefreq>\n';
    xml += '    <priority>1.0</priority>\n';
    xml += '  </url>\n';

    // About Page
    xml += '  <url>\n';
    xml += `    <loc>${hostUrl}/about</loc>\n`;
    xml += `    <lastmod>2026-07-19</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.6</priority>\n';
    xml += '  </url>\n';

    // Contact Page
    xml += '  <url>\n';
    xml += `    <loc>${hostUrl}/contact</loc>\n`;
    xml += `    <lastmod>2026-07-19</lastmod>\n`;
    xml += '    <changefreq>monthly</changefreq>\n';
    xml += '    <priority>0.6</priority>\n';
    xml += '  </url>\n';

    // Category Pages
    categories.forEach(cat => {
      xml += '  <url>\n';
      xml += `    <loc>${hostUrl}/category/${cat.slug}</loc>\n`;
      xml += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.8</priority>\n';
      xml += '  </url>\n';
    });

    // Article Pages
    articles.forEach(art => {
      xml += '  <url>\n';
      xml += `    <loc>${hostUrl}/article/${art.slug}</loc>\n`;
      xml += `    <lastmod>${new Date(art.publishDate).toISOString().split('T')[0]}</lastmod>\n`;
      xml += '    <changefreq>weekly</changefreq>\n';
      xml += '    <priority>0.7</priority>\n';
      xml += '  </url>\n';
    });

    xml += '</urlset>';
    
    res.type('application/xml');
    res.send(xml);
  });

  // ----------------------------------------------------
  // API Routes
  // ----------------------------------------------------

  // AUTH API
  app.post('/api/auth/signup', (req, res) => {
    try {
      const users = dbService.getUsers();
      const { username, password, fullName, email } = req.body;

      if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, password and email are required.' });
      }

      const cleanUsername = username.trim().toLowerCase();
      if (cleanUsername.length < 3) {
        return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail.includes('@') || cleanEmail.length < 5) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
        return res.status(400).json({ error: 'Username is already taken.' });
      }

      if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
        return res.status(400).json({ error: 'Email is already registered.' });
      }

      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      const newUser: User = {
        id: `usr-${Date.now()}`,
        username: cleanUsername,
        email: cleanEmail,
        passwordHash: hashPassword(password),
        fullName: fullName || username,
        createdAt: new Date().toISOString(),
        isVerified: false,
        verificationCode
      };

      users.push(newUser);
      dbService.saveUsers(users);

      const { passwordHash, ...userResponse } = newUser;
      // In a real app we'd email this, but we return it in response to show standard interactive simulation
      return res.status(201).json({ 
        success: true, 
        user: userResponse,
        simulatedCode: verificationCode // Return so the frontend can display/simulate receipt
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const users = dbService.getUsers();
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
      }

      const cleanUsername = username.trim().toLowerCase();
      const user = users.find(u => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername);

      if (!user || user.passwordHash !== hashPassword(password)) {
        return res.status(401).json({ error: 'Invalid username/email or password.' });
      }

      const { passwordHash, ...userResponse } = user;
      return res.json({ success: true, user: userResponse });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/verify', (req, res) => {
    try {
      const users = dbService.getUsers();
      const { username, code } = req.body;

      if (!username || !code) {
        return res.status(400).json({ error: 'Username and verification code are required.' });
      }

      const cleanUsername = username.trim().toLowerCase();
      const userIndex = users.findIndex(u => u.username.toLowerCase() === cleanUsername);

      if (userIndex === -1) {
        return res.status(404).json({ error: 'User not found.' });
      }

      const user = users[userIndex];
      if (user.verificationCode !== code) {
        return res.status(400).json({ error: 'Invalid verification code. Please try again.' });
      }

      user.isVerified = true;
      delete user.verificationCode;
      users[userIndex] = user;
      dbService.saveUsers(users);

      const { passwordHash, ...userResponse } = user;
      return res.json({ success: true, message: 'Email verified successfully!', user: userResponse });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    try {
      const users = dbService.getUsers();
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email address is required.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const userIndex = users.findIndex(u => u.email.toLowerCase() === cleanEmail);

      if (userIndex === -1) {
        return res.status(404).json({ error: 'No user found with this email address.' });
      }

      // Generate a mock reset token
      const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
      users[userIndex].resetToken = resetToken;
      dbService.saveUsers(users);

      return res.json({ 
        success: true, 
        message: 'Password reset code generated.',
        simulatedResetToken: resetToken // Return for simulation
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/reset-password', (req, res) => {
    try {
      const users = dbService.getUsers();
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Reset token and new password are required.' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const userIndex = users.findIndex(u => u.resetToken === token);
      if (userIndex === -1) {
        return res.status(400).json({ error: 'Invalid or expired password reset token.' });
      }

      users[userIndex].passwordHash = hashPassword(newPassword);
      delete users[userIndex].resetToken;
      dbService.saveUsers(users);

      return res.json({ success: true, message: 'Your password has been reset successfully!' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ARTICLES API
  app.get('/api/articles', (req, res) => {
    try {
      const articles = dbService.getArticles();
      const isAdmin = req.query.admin === 'true';
      
      if (isAdmin) {
        // Return everything including future scheduled ones
        return res.json(articles);
      } else {
        // Return only published ones
        const now = new Date();
        const published = articles.filter(art => {
          const pubDate = new Date(art.publishDate);
          return pubDate <= now;
        });
        return res.json(published);
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/articles/:slugOrId', (req, res) => {
    try {
      const articles = dbService.getArticles();
      const { slugOrId } = req.params;
      
      const articleIndex = articles.findIndex(art => art.slug === slugOrId || art.id === slugOrId);
      if (articleIndex === -1) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Increment views count
      articles[articleIndex].views += 1;
      dbService.saveArticles(articles);

      return res.json(articles[articleIndex]);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/articles/:id/like', (req, res) => {
    try {
      const articles = dbService.getArticles();
      const { id } = req.params;
      
      const articleIndex = articles.findIndex(art => art.id === id || art.slug === id);
      if (articleIndex === -1) {
        return res.status(404).json({ error: 'Article not found' });
      }

      articles[articleIndex].likes += 1;
      dbService.saveArticles(articles);

      return res.json({ success: true, likes: articles[articleIndex].likes });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/articles', (req, res) => {
    try {
      const articles = dbService.getArticles();
      const { title, excerpt, content, category, image, author, tags, trending, publishDate } = req.body;

      if (!title || !content || !category) {
        return res.status(400).json({ error: 'Title, Content and Category are required.' });
      }

      // Check user verification before publishing
      const users = dbService.getUsers();
      const authorUser = users.find(u => u.username.toLowerCase() === author?.toLowerCase() || u.fullName?.toLowerCase() === author?.toLowerCase());
      if (authorUser && authorUser.isVerified === false) {
        return res.status(403).json({ error: 'Your email must be verified before publishing articles.' });
      }

      let slug = generateSlug(title);
      // Ensure unique slug
      let uniqueSlug = slug;
      let counter = 1;
      while (articles.some(art => art.slug === uniqueSlug)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      const newArticle: Article = {
        id: `art-${Date.now()}`,
        slug: uniqueSlug,
        title,
        excerpt: excerpt || title.substring(0, 150) + '...',
        content,
        category,
        image: image || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80',
        author: author || 'Guest Educator',
        publishDate: publishDate || new Date().toISOString(),
        tags: Array.isArray(tags) ? tags : [],
        views: 0,
        likes: 0,
        trending: !!trending
      };

      articles.unshift(newArticle);
      dbService.saveArticles(articles);

      return res.status(201).json(newArticle);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/articles/:id', (req, res) => {
    try {
      const articles = dbService.getArticles();
      const { id } = req.params;
      const { title, excerpt, content, category, image, author, tags, trending, publishDate } = req.body;

      // Check user verification before updating
      if (author) {
        const users = dbService.getUsers();
        const authorUser = users.find(u => u.username.toLowerCase() === author.toLowerCase() || u.fullName?.toLowerCase() === author.toLowerCase());
        if (authorUser && authorUser.isVerified === false) {
          return res.status(403).json({ error: 'Your email must be verified before updating articles.' });
        }
      }

      const articleIndex = articles.findIndex(art => art.id === id);
      if (articleIndex === -1) {
        return res.status(404).json({ error: 'Article not found' });
      }

      const existingArticle = articles[articleIndex];

      // Re-generate slug if title changed
      let slug = existingArticle.slug;
      if (title && title !== existingArticle.title) {
        slug = generateSlug(title);
        let uniqueSlug = slug;
        let counter = 1;
        while (articles.some(art => art.slug === uniqueSlug && art.id !== id)) {
          uniqueSlug = `${slug}-${counter}`;
          counter++;
        }
        slug = uniqueSlug;
      }

      const updatedArticle: Article = {
        ...existingArticle,
        title: title !== undefined ? title : existingArticle.title,
        slug,
        excerpt: excerpt !== undefined ? excerpt : existingArticle.excerpt,
        content: content !== undefined ? content : existingArticle.content,
        category: category !== undefined ? category : existingArticle.category,
        image: image !== undefined ? image : existingArticle.image,
        author: author !== undefined ? author : existingArticle.author,
        publishDate: publishDate !== undefined ? publishDate : existingArticle.publishDate,
        tags: tags !== undefined ? (Array.isArray(tags) ? tags : []) : existingArticle.tags,
        trending: trending !== undefined ? !!trending : existingArticle.trending
      };

      articles[articleIndex] = updatedArticle;
      dbService.saveArticles(articles);

      return res.json(updatedArticle);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/articles/:id', (req, res) => {
    try {
      let articles = dbService.getArticles();
      const { id } = req.params;

      const articleIndex = articles.findIndex(art => art.id === id);
      if (articleIndex === -1) {
        return res.status(404).json({ error: 'Article not found' });
      }

      articles = articles.filter(art => art.id !== id);
      dbService.saveArticles(articles);

      return res.json({ success: true, message: 'Article deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // CATEGORIES API
  app.get('/api/categories', (req, res) => {
    try {
      const categories = dbService.getCategories();
      return res.json(categories);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/categories', (req, res) => {
    try {
      const categories = dbService.getCategories();
      const { name, description, icon } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const slug = generateSlug(name);
      if (categories.some(cat => cat.slug === slug)) {
        return res.status(400).json({ error: 'Category with a similar name already exists' });
      }

      const newCategory: Category = {
        id: `cat-${Date.now()}`,
        name,
        slug,
        description: description || '',
        icon: icon || 'BookOpen'
      };

      categories.push(newCategory);
      dbService.saveCategories(categories);

      return res.status(201).json(newCategory);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/categories/:id', (req, res) => {
    try {
      const categories = dbService.getCategories();
      const { id } = req.params;
      const { name, description, icon } = req.body;

      const categoryIndex = categories.findIndex(cat => cat.id === id);
      if (categoryIndex === -1) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const existingCategory = categories[categoryIndex];
      let slug = existingCategory.slug;
      if (name && name !== existingCategory.name) {
        slug = generateSlug(name);
        if (categories.some(cat => cat.slug === slug && cat.id !== id)) {
          return res.status(400).json({ error: 'Another category has this name already' });
        }
      }

      const updatedCategory: Category = {
        ...existingCategory,
        name: name !== undefined ? name : existingCategory.name,
        slug,
        description: description !== undefined ? description : existingCategory.description,
        icon: icon !== undefined ? icon : existingCategory.icon
      };

      categories[categoryIndex] = updatedCategory;
      dbService.saveCategories(categories);

      return res.json(updatedCategory);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/categories/:id', (req, res) => {
    try {
      let categories = dbService.getCategories();
      const { id } = req.params;

      const categoryIndex = categories.findIndex(cat => cat.id === id);
      if (categoryIndex === -1) {
        return res.status(404).json({ error: 'Category not found' });
      }

      categories = categories.filter(cat => cat.id !== id);
      dbService.saveCategories(categories);

      return res.json({ success: true, message: 'Category deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // COMMENTS API
  app.get('/api/comments', (req, res) => {
    try {
      const comments = dbService.getComments();
      return res.json(comments);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/comments/:articleId', (req, res) => {
    try {
      const comments = dbService.getComments();
      const { articleId } = req.params;
      const filtered = comments.filter(c => c.articleId === articleId);
      return res.json(filtered);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/comments', (req, res) => {
    try {
      const comments = dbService.getComments();
      const { articleId, author, email, content } = req.body;

      if (!articleId || !author || !email || !content) {
        return res.status(400).json({ error: 'All fields are required.' });
      }

      const newComment: Comment = {
        id: `com-${Date.now()}`,
        articleId,
        author,
        email,
        content,
        date: new Date().toISOString()
      };

      comments.push(newComment);
      dbService.saveComments(comments);

      return res.status(201).json(newComment);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/comments/:id', (req, res) => {
    try {
      let comments = dbService.getComments();
      const { id } = req.params;

      comments = comments.filter(c => c.id !== id);
      dbService.saveComments(comments);

      return res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // NEWSLETTER SUBSCRIBERS
  app.get('/api/newsletter', (req, res) => {
    try {
      const subs = dbService.getSubscribers();
      return res.json(subs);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/newsletter', (req, res) => {
    try {
      const subs = dbService.getSubscribers();
      const { email } = req.body;

      if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email is required' });
      }

      if (subs.some(s => s.email.toLowerCase() === email.toLowerCase())) {
        return res.json({ success: true, message: 'Already subscribed!' });
      }

      const newSub: NewsletterSubscriber = {
        id: `sub-${Date.now()}`,
        email,
        date: new Date().toISOString()
      };

      subs.push(newSub);
      dbService.saveSubscribers(subs);

      return res.status(201).json({ success: true, message: 'Successfully subscribed to newsletter!' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // CONTACT MESSAGE API
  app.get('/api/contact', (req, res) => {
    try {
      const contacts = dbService.getContacts();
      return res.json(contacts);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/contact', (req, res) => {
    try {
      const contacts = dbService.getContacts();
      const { name, email, subject, message } = req.body;

      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email and message are required' });
      }

      const newMessage: ContactMessage = {
        id: `msg-${Date.now()}`,
        name,
        email,
        subject: subject || 'No Subject',
        message,
        date: new Date().toISOString()
      };

      contacts.push(newMessage);
      dbService.saveContacts(contacts);

      return res.status(201).json({ success: true, message: 'Message sent successfully!' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ----------------------------------------------------
  // Vite Middleware Setup
  // ----------------------------------------------------

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Daily Articles Server] Running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Daily Articles Server] Failed to start:', err);
});
