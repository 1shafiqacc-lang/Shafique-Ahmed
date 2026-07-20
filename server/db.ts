import fs from 'fs';
import path from 'path';
import { Article, Category, Comment, NewsletterSubscriber, ContactMessage, User } from '../src/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const ARTICLES_FILE = path.join(DATA_DIR, 'articles.json');
const CATEGORIES_FILE = path.join(DATA_DIR, 'categories.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const NEWSLETTER_FILE = path.join(DATA_DIR, 'newsletter.json');
const CONTACTS_FILE = path.join(DATA_DIR, 'contacts.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Sample Categories
const defaultCategories: Category[] = [
  { id: 'cat-1', name: 'Education', slug: 'education', description: 'General education news, tips, and guidelines for students.', icon: 'BookOpen' },
  { id: 'cat-2', name: 'Science', slug: 'science', description: 'Exploring the natural world, biology, physics, and cosmic discoveries.', icon: 'Atom' },
  { id: 'cat-3', name: 'Technology', slug: 'technology', description: 'Software, hardware, internet innovations, and coding tutorials.', icon: 'Laptop' },
  { id: 'cat-4', name: 'Mathematics', slug: 'mathematics', description: 'Unlocking calculations, mathematical theories, and puzzle-solving.', icon: 'Calculator' },
  { id: 'cat-5', name: 'English', slug: 'english', description: 'Grammar tips, essay structure, literature reviews, and communication.', icon: 'PenTool' },
  { id: 'cat-6', name: 'Career', slug: 'career', description: 'Career path advice, internships, job hunting, and interview preparation.', icon: 'Briefcase' },
  { id: 'cat-7', name: 'Scholarships', slug: 'scholarships', description: 'Latest student scholarships, funding, and application guidelines.', icon: 'GraduationCap' },
  { id: 'cat-8', name: 'General Knowledge', slug: 'general-knowledge', description: 'Interesting facts, history, geography, and general quizzes.', icon: 'Compass' },
  { id: 'cat-9', name: 'AI Tools', slug: 'ai-tools', description: 'How to utilize modern AI responsibly to boost your learning speed.', icon: 'Sparkles' },
  { id: 'cat-10', name: 'Productivity', slug: 'productivity', description: 'Time management, focus techniques, and study planner templates.', icon: 'Clock' }
];

// Initial Sample Articles
const defaultArticles: Article[] = [
  {
    id: 'art-1',
    slug: 'science-of-effective-studying-spaced-repetition',
    title: 'The Science of Effective Studying: Spaced Repetition Explained',
    excerpt: 'Discover why cramming fails and how spacing your study sessions using active recall techniques can dramatically improve long-term memory retention.',
    content: `
      <h2>Why Cramming Fails Your Brain</h2>
      <p>Almost every student has been there: it is the night before a major exam, and you are surrounded by empty coffee cups, desperately trying to memorize 200 pages of lecture notes. While cramming might help you squeak through a test the next day, cognitive science proves that <strong>almost 90% of that information is forgotten within 72 hours</strong>.</p>
      
      <p>This phenomenon is described by the <strong>Ebbinghaus Forgetting Curve</strong>, which shows how mathematical retention drops exponentially over time. Without reinforcement, our brains prune away newly acquired facts to save energy.</p>

      <h2>The Solution: Spaced Repetition</h2>
      <p>Spaced repetition is a learning technique where you review material at increasing intervals. Instead of studying a concept for 5 hours in one night, you study it for 30 minutes across several days or weeks:</p>
      <ul>
        <li><strong>Review 1:</strong> 1 day after learning</li>
        <li><strong>Review 2:</strong> 3 days after learning</li>
        <li><strong>Review 3:</strong> 7 days after learning</li>
        <li><strong>Review 4:</strong> 14 days after learning</li>
        <li><strong>Review 5:</strong> 30 days after learning</li>
      </ul>

      <figure>
        <table class="min-w-full divide-y divide-gray-200 border my-4">
          <thead class="bg-blue-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-semibold text-blue-800">Study Strategy</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-blue-800">Time Spent</th>
              <th class="px-4 py-2 text-left text-xs font-semibold text-blue-800">1-Month Retention</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr>
              <td class="px-4 py-2">Cramming (Single session)</td>
              <td class="px-4 py-2">6 Hours</td>
              <td class="px-4 py-2 text-red-600 font-medium">&lt; 15%</td>
            </tr>
            <tr>
              <td class="px-4 py-2">Spaced Repetition (6 sessions)</td>
              <td class="px-4 py-2">6 Hours (6x 1 hr)</td>
              <td class="px-4 py-2 text-green-600 font-medium">&gt; 80%</td>
            </tr>
          </tbody>
        </table>
        <figcaption class="text-xs text-gray-500 italic text-center">Comparison of Cramming vs. Spaced Repetition Study Methods.</figcaption>
      </figure>

      <h2>How to Implement Spaced Repetition Today</h2>
      <ol>
        <li><strong>Flashcard Systems (Anki or Leitner):</strong> Use software like Anki, which employs a spaced repetition algorithm, or create physical Leitner boxes where correct cards move to less-frequently-reviewed folders.</li>
        <li><strong>Active Recall:</strong> Don't just re-read. Close the book and force your brain to retrieve the information from scratch. Active retrieval strengthens synaptic connections.</li>
        <li><strong>Calendar Blocking:</strong> Map out review sessions in advance. Keep a spreadsheet tracking the last review date and difficulty score for every topic.</li>
      </ol>

      <h2>Closing Thoughts</h2>
      <p>Working hard is admirable, but working smart is revolutionary. By utilizing active recall paired with spaced repetition intervals, you can cut your total study hours in half while achieving higher marks and building knowledge that lasts a lifetime.</p>
    `,
    category: 'education',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    author: 'Dr. Sarah Jenkins',
    publishDate: '2026-07-18T10:00:00.000Z',
    tags: ['study tips', 'cognitive science', 'learning hacks', 'education'],
    views: 1240,
    likes: 85,
    trending: true
  },
  {
    id: 'art-2',
    slug: 'ai-tools-every-student-should-use-responsibly',
    title: 'AI Tools Every Student Should Use for Academic Success in 2026',
    excerpt: 'AI is changing the face of education. Here are the top tools to boost your research, writing speed, and mathematics solving while maintaining academic integrity.',
    content: `
      <h2>The Rise of the AI Study Buddy</h2>
      <p>In 2026, artificial intelligence is no longer a futuristic gimmick. It is an essential component of modern student workflows. However, using AI successfully doesn't mean letting it write your essays for you—which is plagiarism and leads to poor learning outcomes—it means leveraging it as a personalized, ultra-capable tutor.</p>

      <h2>Top AI Tools for Students</h2>
      <p>Here are the top-tier AI applications categorized by the academic problems they solve:</p>

      <h3>1. For Research & Document Analysis: ChatPDF & Gemini</h3>
      <p>Instead of manually highlighting 50-page research papers, upload them into tool engines. You can ask: <em>"What are the main experimental limitations discussed in this paper?"</em> or <em>"Explain the methodology in simple terms."</em> This cuts down pre-reading research time by 70%.</p>

      <h3>2. For Science & Math: WolframAlpha & Gemini AI</h3>
      <p>When you get stuck on a complex differential equation or chemical synthesis problem, WolframAlpha and advanced reasoning models don't just give you the answer. They walk you through the structural step-by-step formula and show you the underlying proofs, converting a roadblock into an interactive tutoring session.</p>

      <h3>3. For Writing & Citations: QuillBot and Zotero</h3>
      <p>QuillBot helps you refine your sentence flow, while AI-powered citation managers like Zotero automatically compile perfectly formatted APA, MLA, or Chicago style bibliographies with a single click.</p>

      <h2>The Code of Academic Integrity</h2>
      <p>To ensure you don't violate your school's policies, follow this three-rule framework:</p>
      <pre><code>// 1. AI is for BRAINSTORMING, not final writing.
// 2. Always cross-verify facts (AI can hallucinate!).
// 3. Document your AI usage if requested by instructors.</code></pre>

      <h2>Practical Workflow Example</h2>
      <p>When writing a history essay, use Gemini to generate an outline of themes. Research those themes in primary sources, write your draft, and use AI to check grammar and point out areas where arguments could be made more cohesive. This is the ultimate hybrid human-AI academic workflow.</p>
    `,
    category: 'ai-tools',
    image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    author: 'Alex Rivera, Tech Analyst',
    publishDate: '2026-07-19T08:30:00.000Z',
    tags: ['artificial intelligence', 'productivity', 'educational apps', 'tools'],
    views: 950,
    likes: 67,
    trending: true
  },
  {
    id: 'art-3',
    slug: 'unveiling-the-beauty-of-fibonacci-sequence',
    title: 'Unveiling the Beauty of Mathematics: Why the Fibonacci Sequence is Everywhere',
    excerpt: 'From pinecones and seashells to spiral galaxies and classical art, explore the fascinating mathematical ratio that designs our natural universe.',
    content: `
      <h2>The Secret Code of Nature</h2>
      <p>Mathematics is often taught as a series of dry formulas and abstract definitions. But in reality, math is the design language of the cosmos. Nowhere is this more apparent than in the famous <strong>Fibonacci Sequence</strong>.</p>
      
      <p>Introduced to the Western world by Leonardo of Pisa (known as Fibonacci) in 1202, the sequence starts simply:</p>
      <pre><code>0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144...</code></pre>
      <p>Each number is the sum of the preceding two numbers. While it looks like a simple arithmetic game, the ratio between consecutive numbers (e.g., 89/55 or 144/89) rapidly converges to approximately <strong>1.618</strong>, known globally as the <strong>Golden Ratio</strong> (&Phi;).</p>

      <h2>Where Nature Uses Fibonacci</h2>
      <ul>
        <li><strong>Flower Petals:</strong> Flowers almost always have a Fibonacci number of petals. Lilies have 3, buttercups have 5, chicory has 21, and daisies have 34, 55, or even 89 petals.</li>
        <li><strong>Seed Heads:</strong> The seeds in the center of a sunflower are arranged in dual opposing spirals. If you count the clockwise and counterclockwise spirals, they are always consecutive Fibonacci numbers (typically 34 and 55). This arrangement provides maximum compact density.</li>
        <li><strong>Shells and Hurricanes:</strong> The logarithmic golden spiral coordinates perfectly with the shape of nautilus shells, the paths of weather hurricanes, and even the giant spiral arms of outer galaxies.</li>
      </ul>

      <h2>The Fibonacci Formula</h2>
      <p>The sequence can be expressed recursively:</p>
      <pre><code>F(n) = F(n-1) + F(n-2)
with F(0) = 0, F(1) = 1</code></pre>

      <h2>Why It Matters to Students</h2>
      <p>Studying Fibonacci helps us bridge the artificial gap between science, mathematics, and art. Architects like Le Corbusier and artists like Leonardo da Vinci explicitly used the Golden Ratio to create compositions that are naturally pleasing to the human eye. The next time you walk through a park, look closely at the spiral of a pinecone or the branchings of a tree—you are looking at live, growing mathematics in action.</p>
    `,
    category: 'mathematics',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
    author: 'Prof. Marcus Chen',
    publishDate: '2026-07-17T14:15:00.000Z',
    tags: ['mathematics', 'nature', 'geometry', 'science'],
    views: 820,
    likes: 49,
    trending: false
  },
  {
    id: 'art-4',
    slug: 'quantum-computing-demystified-for-beginners',
    title: 'Quantum Computing Demystified: A Beginner Student Guide',
    excerpt: 'What are qubits, superposition, and entanglement? Learn how quantum physics is powering the next generation of supercomputers without needing a PhD.',
    content: `
      <h2>The Limitations of Silicon Computers</h2>
      <p>The device you are reading this article on—whether a smartphone or a laptop—is a classical computer. It relies on microscopic transistors that can be in one of two states: <strong>0 (off)</strong> or <strong>1 (on)</strong>. These are called bits. While classical computers can perform billions of operations per second, there are complex mathematical problems that would take them longer than the age of the universe to solve.</p>

      <h2>Enter the Qubit</h2>
      <p>Quantum computers do not use bits. They use **qubits** (quantum bits). Qubits are built using subatomic particles like electrons or photons. Because they follow the strange laws of quantum mechanics, they possess two superpower behaviors:</p>

      <h3>1. Superposition</h3>
      <p>A classical bit is like a coin lying flat: it must be heads or tails. A qubit is like a coin spinning in the air: it is a combination of both 0 and 1 at the same time. This allows a quantum computer to evaluate millions of possibilities simultaneously.</p>

      <h3>2. Entanglement</h3>
      <p>Entanglement is what Albert Einstein called "spooky action at a distance." Two qubits can become linked so that whatever happens to one instantly influences the other, no matter how far apart they are. This creates a massive network of interconnected processing power.</p>

      <h2>Real-World Applications for the Future</h2>
      <p>Quantum computers won't replace your gaming laptop, but they will revolutionize society in several fields:</p>
      <ul>
        <li><strong>Medicine:</strong> Simulating molecular interactions at the atomic level to discover life-saving drugs in hours instead of decades.</li>
        <li><strong>Cryptography:</strong> Breaking modern encryption algorithms, forcing the development of new post-quantum secure networks.</li>
        <li><strong>Climate Science:</strong> Simulating catalyst materials to capture carbon directly from the atmosphere efficiently.</li>
      </ul>

      <h2>Summary Table</h2>
      <table class="min-w-full divide-y divide-gray-200 border my-4">
        <thead class="bg-blue-50">
          <tr>
            <th class="px-4 py-2 text-left text-xs font-semibold text-blue-800">Feature</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-blue-800">Classical Computer</th>
            <th class="px-4 py-2 text-left text-xs font-semibold text-blue-800">Quantum Computer</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 text-sm">
          <tr>
            <td class="px-4 py-2 font-medium">Basic Unit</td>
            <td class="px-4 py-2">Bit (0 or 1)</td>
            <td class="px-4 py-2">Qubit (Superposition of 0 and 1)</td>
          </tr>
          <tr>
            <td class="px-4 py-2 font-medium">Power Scaling</td>
            <td class="px-4 py-2">Linear (N bits = N states)</td>
            <td class="px-4 py-2 text-green-600 font-semibold">Exponential (N qubits = 2<sup>N</sup> states)</td>
          </tr>
          <tr>
            <td class="px-4 py-2 font-medium">Operating Temp</td>
            <td class="px-4 py-2">Room Temperature</td>
            <td class="px-4 py-2">Near Absolute Zero (-273&deg;C)</td>
          </tr>
        </tbody>
      </table>

      <h2>How Students Can Get Started Today</h2>
      <p>You don't need a multi-million dollar lab to learn quantum computing. IBM offers free, cloud-accessible quantum computers via its **IBM Quantum Composer** platform. You can drag and drop quantum gates, run experiments on real qubits, and write python scripts using the **Qiskit** library. Getting skilled in this field today makes you highly sought-after in tomorrow's tech job market.</p>
    `,
    category: 'science',
    image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
    author: 'Elena Rostova, Quantum Physicist',
    publishDate: '2026-07-16T09:00:00.000Z',
    tags: ['science', 'quantum physics', 'future tech', 'learning'],
    views: 1100,
    likes: 72,
    trending: false
  },
  {
    id: 'art-5',
    slug: 'essay-writing-guide-persuasive-academic',
    title: 'Mastering the Art of Writing: A Guide to Perfect Academic Essays',
    excerpt: 'Struggling with writing assignments? Learn how to structure a compelling thesis statement, outline arguments logically, and avoid common grammar traps.',
    content: `
      <h2>The Anatomy of a High-Scoring Essay</h2>
      <p>Many students view essay writing as an exercise in filling pages with complex-sounding vocabulary. However, college professors and high school graders look for three fundamental parameters: **Clarity, Structure, and Evidence**. A beautifully simple argument backed by rigorous evidence will always score higher than an overly complex essay that loses its path.</p>

      <h2>The Three-Part Blueprint</h2>
      <p>Every outstanding essay follows the classic structural skeleton, but executes it with precision:</p>

      <h3>1. The Introduction: Catch & Command</h3>
      <p>Your opening paragraph must accomplish two things. First, hook the reader's interest with a fascinating fact, quote, or historical paradox. Second, and most importantly, deliver a <strong>Thesis Statement</strong>. Your thesis is the single, clear, debatable sentence that states your primary argument. If your reader can't identify your thesis by line 10, your introduction needs a rewrite.</p>

      <h3>2. The Body Paragraphs: The PEEL Method</h3>
      <p>Each body paragraph should tackle one sub-argument supporting your thesis. Keep your paragraphs focused by applying the **PEEL formula**:</p>
      <ul>
        <li><strong>P (Point):</strong> Introduce the primary topic sentence of the paragraph.</li>
        <li><strong>E (Evidence):</strong> Provide factual data, direct citations, or statistics.</li>
        <li><strong>E (Explanation):</strong> Explain exactly *why* this evidence proves your topic sentence and supports the broader thesis.</li>
        <li><strong>L (Link):</strong> Transition smoothly to the next paragraph's main theme.</li>
      </ul>

      <h3>3. The Conclusion: Synthesize, Don't Summarize</h3>
      <p>Do not simply copy-paste your thesis in different words. A strong conclusion synthesizes your arguments, showing how they fit together to prove your point, and leaves the reader with a broader implication: why does this topic matter in the real world today?</p>

      <h2>Top Grammar Traps to Avoid</h2>
      <ol>
        <li><strong>Passive Voice:</strong> Instead of writing <em>"The active compound was discovered by the scientists,"</em> write <em>"Scientists discovered the active compound."</em> Active voice is stronger, shorter, and more engaging.</li>
        <li><strong>Comma Splices:</strong> Joining two independent clauses with a comma is incorrect. Use a semicolon, or split them into two sentences.</li>
        <li><strong>Run-on Sentences:</strong> Long sentences dilute arguments. Break down complex thoughts into crisp, readable statements.</li>
      </ol>

      <blockquote>
        "Clear writing is a sign of clear thinking. People who write obscurely are usually confused in their own minds." — Dr. William Zinsser, On Writing Well
      </blockquote>

      <h2>Putting It into Action</h2>
      <p>The next time you get a writing assignment, spend 30% of your time outlining, 40% drafting, and 30% editing. Giving yourself time to step away from your first draft before proofreading will make your final submission polished and clean.</p>
    `,
    category: 'english',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    author: 'Prof. Julianne Vance',
    publishDate: '2026-07-15T11:00:00.000Z',
    tags: ['english', 'writing tips', 'essays', 'literary studies'],
    views: 640,
    likes: 42,
    trending: false
  },
  {
    id: 'art-6',
    slug: 'how-to-secure-college-scholarships-full-guide',
    title: 'The Ultimate Guide to Securing College Scholarships in 2026',
    excerpt: 'Higher education is expensive, but billions in funding go unclaimed every year. Learn how to search, draft, and win scholarships successfully.',
    content: `
      <h2>The Untapped Goldmine of Student Funding</h2>
      <p>The cost of attending college continues to rise, causing many students to take on massive debts. However, thousands of corporate, academic, and non-profit scholarships go completely unclaimed every year simply because students believe the application process is too competitive or confusing.</p>

      <p>Winning scholarships is not about being a straight-A genius with perfect test scores. It is a game of strategy, volume, and storytelling.</p>

      <h2>Step 1: Know Where to Look</h2>
      <p>Instead of searching broad terms on search engines, leverage targeted platforms:</p>
      <ul>
        <li><strong>Fastweb & Scholarships.com:</strong> Massive databases matching your unique profile traits to active grants.</li>
        <li><strong>Local Foundations:</strong> Rotary clubs, community banks, and local businesses have smaller award pools (e.g., $1,000 - $3,000), but the competition is incredibly low. Winning three local awards matches one major national award!</li>
        <li><strong>University Financial Aid Offices:</strong> Many schools offer departmental scholarships once you are accepted, but you must ask for them directly.</li>
      </ul>

      <h2>Step 2: Create a Standout Application Portfolio</h2>
      <p>Most scholarship committees read hundreds of essays answering the same prompt: <em>"Why do you deserve this scholarship?"</em> To win, your application package must have:</p>

      <h3>1. A Compelling Personal Narrative</h3>
      <p>Do not write a boring list of achievements. Tell a cohesive story of a specific obstacle you faced, how you overcame it, and how your chosen field of study will help you solve that problem for others in the future.</p>

      <h3>2. Highly Specific Recommendation Letters</h3>
      <p>Provide your recommenders with a "brag sheet" highlighting your achievements and the specific scholarship criteria. This helps them write custom, high-impact reference letters instead of generic templates.</p>

      <h2>The Scholarship Application Tracker</h2>
      <p>Organization is key. Use this spreadsheet column framework to track your progress:</p>
      <pre><code>[Scholarship Name] | [Award Amount] | [Deadline Date] | [Requirements Checklist] | [Status (Draft/Submitted)]</code></pre>

      <h2>Conclusion</h2>
      <p>Think of applying for scholarships as a part-time job. If you spend 20 hours applying to 10 scholarships and win just one $2,000 award, you have successfully earned **$100 per hour** tax-free! Start early, stay organized, and refine your personal story.</p>
    `,
    category: 'scholarships',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    author: 'Marcus Vance, Financial Aid Advisor',
    publishDate: '2026-07-14T08:00:00.000Z',
    tags: ['scholarships', 'college tips', 'finance', 'student loans'],
    views: 1350,
    likes: 98,
    trending: true
  }
];

// Read/Write files with simple error fallback
function readData<T>(filePath: string, defaultValue: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as T;
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  // Write default value if file doesn't exist
  writeData(filePath, defaultValue);
  return defaultValue;
}

function writeData<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
  }
}

export const dbService = {
  getArticles(): Article[] {
    return readData<Article[]>(ARTICLES_FILE, defaultArticles);
  },
  
  saveArticles(articles: Article[]): void {
    writeData(ARTICLES_FILE, articles);
  },

  getCategories(): Category[] {
    return readData<Category[]>(CATEGORIES_FILE, defaultCategories);
  },

  saveCategories(categories: Category[]): void {
    writeData(CATEGORIES_FILE, categories);
  },

  getComments(): Comment[] {
    return readData<Comment[]>(COMMENTS_FILE, []);
  },

  saveComments(comments: Comment[]): void {
    writeData(COMMENTS_FILE, comments);
  },

  getSubscribers(): NewsletterSubscriber[] {
    return readData<NewsletterSubscriber[]>(NEWSLETTER_FILE, []);
  },

  saveSubscribers(subscribers: NewsletterSubscriber[]): void {
    writeData(NEWSLETTER_FILE, subscribers);
  },

  getContacts(): ContactMessage[] {
    return readData<ContactMessage[]>(CONTACTS_FILE, []);
  },

  saveContacts(contacts: ContactMessage[]): void {
    writeData(CONTACTS_FILE, contacts);
  },

  getUsers(): User[] {
    return readData<User[]>(USERS_FILE, []);
  },

  saveUsers(users: User[]): void {
    writeData(USERS_FILE, users);
  }
};
