export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML format
  category: string; // Slug of the category
  image: string; // URL or base64
  author: string;
  publishDate: string; // ISO date-time string
  scheduledDate?: string; // ISO date-time string if scheduled in the future
  tags: string[];
  views: number;
  likes: number;
  trending: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string; // Lucide icon name
}

export interface Comment {
  id: string;
  articleId: string;
  author: string;
  email: string;
  content: string;
  date: string; // ISO date string
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  date: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string; // Stored securely
  fullName?: string;
  createdAt: string;
  isVerified?: boolean;
  verificationCode?: string;
  resetToken?: string;
}

