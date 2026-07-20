import React, { useState, useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Quote, Image as ImageIcon, Link as LinkIcon, Eye, Edit3, 
  RotateCcw, RotateCw, Smile, Table as TableIcon, Type, Plus, ChevronDown, Check
} from 'lucide-react';

interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [activeFontFamily, setActiveFontFamily] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showBgDropdown, setShowBgDropdown] = useState(false);
  const [showEmojiDropdown, setShowEmojiDropdown] = useState(false);
  const [showTableDropdown, setShowTableDropdown] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const colors = [
    { name: 'Default', value: '#1e293b' },
    { name: 'Blue', value: '#2563eb' },
    { name: 'Green', value: '#16a34a' },
    { name: 'Orange', value: '#ea580c' },
    { name: 'Red', value: '#dc2626' },
    { name: 'Purple', value: '#9333ea' },
    { name: 'Gray', value: '#64748b' }
  ];

  const bgColors = [
    { name: 'None', value: 'transparent' },
    { name: 'Yellow Highlight', value: '#fef08a' },
    { name: 'Green Highlight', value: '#bbf7d0' },
    { name: 'Blue Highlight', value: '#bfdbfe' },
    { name: 'Red Highlight', value: '#fecaca' },
    { name: 'Purple Highlight', value: '#e9d5ff' }
  ];

  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', 
    '😍', '🥰', '😘', '😋', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥳', '😏', '😒', '😔', 
    '🥺', '😭', '🤯', '🥱', '😴', '✍️', '💡', '🎓', '📚', '✏️', '📝', '📓', '📁', '📅', 
    '🚀', '🌟', '✨', '🔥', '🏆', '🎉', '❤️', '👍', '👎', '👏', '🙌', '🙏', '💻', '🧪'
  ];

  // Keep contentEditable sync with the value prop
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value || '<p><br></p>';
      }
    }
  }, [value, activeTab]);

  const handleEditorInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCmd = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
    handleEditorInput();
  };

  // Safe header command to keep standard styling
  const handleHeading = (level: string) => {
    if (level === 'p') {
      execCmd('formatBlock', 'p');
    } else {
      execCmd('formatBlock', `<${level}>`);
    }
  };

  const handleLink = () => {
    const url = prompt('Enter the link destination URL:');
    if (url) {
      execCmd('createLink', url);
    }
  };

  const handleAddImage = () => {
    const url = prompt('Enter Image URL:', 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80');
    if (url) {
      const imgHtml = `<img src="${url}" alt="Article Image" class="max-w-full h-auto rounded-lg my-4 shadow-xs mx-auto block" />`;
      execCmd('insertHTML', imgHtml);
    }
  };

  const handleLocalImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imgHtml = `<img src="${event.target.result}" alt="${file.name}" class="max-w-full h-auto rounded-lg my-4 shadow-xs mx-auto block" />`;
          execCmd('insertHTML', imgHtml);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files) as File[];
    const imageFiles = files.filter(f => f.type && f.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      const file = imageFiles[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const imgHtml = `<img src="${event.target.result}" alt="${file.name}" class="max-w-full h-auto rounded-lg my-4 shadow-xs mx-auto block" />`;
          execCmd('insertHTML', imgHtml);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Professional Paste formatting preservation for Word/Google Docs
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');
    
    if (html) {
      let cleanedHtml = html;
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Sanitize Word styles/schemas and retain semantic structure
        const cleanElement = (el: Element) => {
          const attrs = Array.from(el.attributes);
          attrs.forEach(attr => {
            if (attr.name !== 'src' && attr.name !== 'href' && attr.name !== 'style' && attr.name !== 'colspan' && attr.name !== 'rowspan') {
              el.removeAttribute(attr.name);
            }
          });
          
          const style = el.getAttribute('style');
          if (style) {
            const preserved: string[] = [];
            if (style.includes('text-align')) {
              const match = style.match(/text-align\s*:\s*([^;]+)/i);
              if (match) preserved.push(`text-align: ${match[1]}`);
            }
            if (style.includes('color')) {
              const match = style.match(/color\s*:\s*([^;]+)/i);
              if (match) preserved.push(`color: ${match[1]}`);
            }
            if (style.includes('font-weight')) {
              const match = style.match(/font-weight\s*:\s*([^;]+)/i);
              if (match) preserved.push(`font-weight: ${match[1]}`);
            }
            if (style.includes('font-style')) {
              const match = style.match(/font-style\s*:\s*([^;]+)/i);
              if (match) preserved.push(`font-style: ${match[1]}`);
            }
            if (preserved.length > 0) {
              el.setAttribute('style', preserved.join('; '));
            } else {
              el.removeAttribute('style');
            }
          }
          
          Array.from(el.children).forEach(cleanElement);
        };
        
        if (doc.body) {
          cleanElement(doc.body);
          cleanedHtml = doc.body.innerHTML;
        }
      } catch (err) {
        console.error('Paste cleanup failed, inserting fallback:', err);
      }
      
      execCmd('insertHTML', cleanedHtml);
    } else {
      const paragraphs = text
        .split(/\r?\n/)
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => `<p>${p}</p>`)
        .join('');
      execCmd('insertHTML', paragraphs || text);
    }
  };

  const handleInsertTable = (rows: number, cols: number) => {
    let tableHtml = '<table class="w-full border-collapse border border-slate-300 dark:border-slate-600 my-4">';
    for (let i = 0; i < rows; i++) {
      tableHtml += '<tr>';
      for (let j = 0; j < cols; j++) {
        if (i === 0) {
          tableHtml += '<th class="border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/50 p-2 font-bold text-slate-800 dark:text-slate-100 text-left">Header</th>';
        } else {
          tableHtml += '<td class="border border-slate-300 dark:border-slate-600 p-2 text-slate-700 dark:text-slate-300">Data</td>';
        }
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</table><p><br></p>';
    execCmd('insertHTML', tableHtml);
    setShowTableDropdown(false);
  };

  const handleInsertCodeBlock = () => {
    const codeHtml = `<pre class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-lg my-4 text-xs font-mono text-slate-800 dark:text-slate-200 leading-relaxed overflow-x-auto"><code>// Write your code snippet here\nconsole.log("Hello study helper!");</code></pre><p><br></p>`;
    execCmd('insertHTML', codeHtml);
  };

  const handleInsertQuote = () => {
    const quoteHtml = `<blockquote class="border-l-4 border-blue-500 pl-4 py-1.5 my-4 italic text-slate-600 dark:text-slate-400 font-serif">"This is an academic blockquote. Write your quotation text here."</blockquote><p><br></p>`;
    execCmd('insertHTML', quoteHtml);
  };

  const handleFontFamily = (family: 'sans' | 'serif' | 'mono') => {
    setActiveFontFamily(family);
    setShowFontDropdown(false);
    
    let fontName = 'Inter, sans-serif';
    if (family === 'serif') fontName = 'Georgia, serif';
    if (family === 'mono') fontName = 'JetBrains Mono, Courier New, monospace';
    
    execCmd('fontName', fontName);
  };

  const handleInsertEmoji = (emoji: string) => {
    execCmd('insertHTML', emoji);
    setShowEmojiDropdown(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Custom shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') {
        e.preventDefault();
        execCmd('bold');
      }
      if (e.key === 'i') {
        e.preventDefault();
        execCmd('italic');
      }
      if (e.key === 'u') {
        e.preventDefault();
        execCmd('underline');
      }
    }
  };

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm transition-all flex flex-col min-h-[450px]">
      
      {/* Editor Navbar */}
      <div className="flex flex-wrap items-center justify-between bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-2 gap-2 shrink-0">
        
        {/* Left segment - Switcher */}
        <div className="flex bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-300/30 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('edit')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'edit'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>WYSIWYG Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>

        {/* History tools */}
        {activeTab === 'edit' && (
          <div className="flex items-center gap-0.5 border-l border-slate-200 dark:border-slate-700 pl-2">
            <button
              type="button"
              onClick={() => execCmd('undo')}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('redo')}
              className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Editor Toolbar (Only in WYSIWYG mode) */}
      {activeTab === 'edit' && (
        <div className="flex flex-wrap items-center bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700 p-2 gap-1 select-none shrink-0">
          
          {/* Typography Sizes */}
          <div className="flex items-center space-x-0.5">
            <button
              type="button"
              onClick={() => handleHeading('h1')}
              className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded transition cursor-pointer"
              title="Heading 1"
            >
              H1
            </button>
            <button
              type="button"
              onClick={() => handleHeading('h2')}
              className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded transition cursor-pointer"
              title="Heading 2"
            >
              H2
            </button>
            <button
              type="button"
              onClick={() => handleHeading('h3')}
              className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded transition cursor-pointer"
              title="Heading 3"
            >
              H3
            </button>
            <button
              type="button"
              onClick={() => handleHeading('p')}
              className="px-2 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded transition cursor-pointer"
              title="Normal Paragraph"
            >
              P
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

          {/* Font Family Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowFontDropdown(!showFontDropdown);
                setShowColorDropdown(false);
                setShowBgDropdown(false);
                setShowEmojiDropdown(false);
                setShowTableDropdown(false);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded transition cursor-pointer"
              title="Font Family"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="capitalize">{activeFontFamily}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showFontDropdown && (
              <div className="absolute left-0 mt-1.5 w-36 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 p-1 z-50">
                <button
                  type="button"
                  onClick={() => handleFontFamily('sans')}
                  className="w-full flex items-center justify-between text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded font-sans cursor-pointer"
                >
                  <span>Sans Serif (Inter)</span>
                  {activeFontFamily === 'sans' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleFontFamily('serif')}
                  className="w-full flex items-center justify-between text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded font-serif cursor-pointer"
                >
                  <span>Serif (Georgia)</span>
                  {activeFontFamily === 'serif' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
                <button
                  type="button"
                  onClick={() => handleFontFamily('mono')}
                  className="w-full flex items-center justify-between text-left px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 rounded font-mono cursor-pointer"
                >
                  <span>Monospace (Mono)</span>
                  {activeFontFamily === 'mono' && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

          {/* Formatters */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => execCmd('bold')}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer font-bold"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('italic')}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer italic"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('underline')}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer underline"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('strikeThrough')}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer line-through"
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

          {/* Color pickers */}
          <div className="flex items-center space-x-1">
            {/* Fore Color */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowColorDropdown(!showColorDropdown);
                  setShowBgDropdown(false);
                  setShowEmojiDropdown(false);
                  setShowTableDropdown(false);
                  setShowFontDropdown(false);
                }}
                className="flex items-center space-x-1 p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded transition cursor-pointer"
                title="Text Color"
              >
                <span className="text-xs font-bold border-b-2 border-slate-800 dark:border-white px-0.5">A</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>
              {showColorDropdown && (
                <div className="absolute left-0 mt-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 p-2.5 grid grid-cols-4 gap-2 z-50 w-36">
                  {colors.map(col => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => {
                        execCmd('foreColor', col.value);
                        setShowColorDropdown(false);
                      }}
                      className="w-6 h-6 rounded-full border border-slate-200/60 dark:border-slate-700 cursor-pointer flex items-center justify-center transition hover:scale-110"
                      style={{ backgroundColor: col.value }}
                      title={col.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Back Color / Highlight */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowBgDropdown(!showBgDropdown);
                  setShowColorDropdown(false);
                  setShowEmojiDropdown(false);
                  setShowTableDropdown(false);
                  setShowFontDropdown(false);
                }}
                className="flex items-center space-x-1 p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded transition cursor-pointer"
                title="Text Highlight Color"
              >
                <span className="text-xs font-bold bg-amber-200 px-1 text-slate-900 rounded">ab</span>
                <ChevronDown className="w-2.5 h-2.5 text-slate-400" />
              </button>
              {showBgDropdown && (
                <div className="absolute left-0 mt-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 p-2.5 grid grid-cols-3 gap-2 z-50 w-44">
                  {bgColors.map(col => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => {
                        execCmd('hiliteColor', col.value);
                        setShowBgDropdown(false);
                      }}
                      className="w-full h-7 rounded border border-slate-200/60 dark:border-slate-700 cursor-pointer transition hover:bg-slate-100 dark:hover:bg-slate-900 text-[10px] font-medium"
                      style={{ backgroundColor: col.value === 'transparent' ? 'white' : col.value, color: '#1e293b' }}
                    >
                      {col.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

          {/* Alignments */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => execCmd('justifyLeft')}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyCenter')}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyRight')}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('justifyFull')}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
              title="Justify"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

          {/* Lists */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => execCmd('insertUnorderedList')}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => execCmd('insertOrderedList')}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

          {/* Academic Elements */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleInsertQuote}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
              title="Insert Quote Block"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleInsertCodeBlock}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer text-xs font-mono font-bold"
              title="Insert Code Block"
            >
              {"{ }"}
            </button>
            <button
              type="button"
              onClick={() => execCmd('insertHorizontalRule')}
              className="px-1.5 py-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded transition cursor-pointer"
              title="Insert Line Break"
            >
              — HR
            </button>

            {/* Table Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowTableDropdown(!showTableDropdown);
                  setShowColorDropdown(false);
                  setShowBgDropdown(false);
                  setShowEmojiDropdown(false);
                  setShowFontDropdown(false);
                }}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer flex items-center"
                title="Insert Table Grid"
              >
                <TableIcon className="w-4 h-4" />
              </button>
              {showTableDropdown && (
                <div className="absolute left-0 mt-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 p-2 space-y-1 z-50 w-40">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-2 pb-1.5 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                    Select Table Size
                  </div>
                  <button
                    type="button"
                    onClick={() => handleInsertTable(2, 2)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-900 rounded cursor-pointer"
                  >
                    2x2 Grid (Small)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTable(3, 3)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-900 rounded cursor-pointer"
                  >
                    3x3 Grid (Medium)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertTable(5, 4)}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-900 rounded cursor-pointer"
                  >
                    5x4 Grid (Large)
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1"></div>

          {/* Links & Emojis & Images */}
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleLink}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
              title="Add Hyperlink"
            >
              <LinkIcon className="w-4 h-4" />
            </button>

            {/* Emoji Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowEmojiDropdown(!showEmojiDropdown);
                  setShowColorDropdown(false);
                  setShowBgDropdown(false);
                  setShowTableDropdown(false);
                  setShowFontDropdown(false);
                }}
                className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md transition cursor-pointer"
                title="Add Emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
              {showEmojiDropdown && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 p-2.5 z-50">
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pb-1.5 border-b border-slate-100 dark:border-slate-700/60 mb-1.5">
                    Click to Insert Emoji
                  </div>
                  <div className="grid grid-cols-7 gap-1.5 max-h-40 overflow-y-auto">
                    {emojis.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleInsertEmoji(emoji)}
                        className="w-6 h-6 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-900 rounded text-base cursor-pointer transition-transform hover:scale-115"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Image trigger & input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            <div className="flex items-center gap-0.5 bg-blue-50/50 dark:bg-blue-900/10 rounded-md px-1 py-0.5 border border-blue-100/30">
              <button
                type="button"
                onClick={handleAddImage}
                className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100/40 rounded transition cursor-pointer"
                title="Insert Image by Web URL"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleLocalImageUpload}
                className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100/40 rounded transition cursor-pointer"
                title="Upload Local File"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Editor Content Box */}
      <div className="flex-1 min-h-[300px] relative flex flex-col">
        {activeTab === 'edit' ? (
          <div 
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onKeyDown={handleKeyDown}
            className="flex-1 w-full min-h-[320px] p-6 text-sm bg-slate-50/20 dark:bg-slate-900/10 text-slate-800 dark:text-slate-100 focus:outline-hidden leading-relaxed font-sans overflow-y-auto article-rich-content prose dark:prose-invert max-w-none"
            style={{ minHeight: '320px' }}
            data-placeholder={placeholder || "Start writing your educational paper here..."}
          />
        ) : (
          <div className="flex-1 p-6 bg-white dark:bg-slate-800 min-h-[320px] max-w-none prose dark:prose-invert overflow-y-auto">
            <div 
              className="article-rich-content text-slate-700 dark:text-slate-300"
              dangerouslySetInnerHTML={{ 
                __html: value || '<p class="text-slate-400 italic">No content written yet. Start typing to preview in real-time!</p>' 
              }}
            />
          </div>
        )}
      </div>

      {/* Footer helper */}
      {activeTab === 'edit' && (
        <div className="bg-slate-50 dark:bg-slate-900 px-3.5 py-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 flex justify-between select-none shrink-0">
          <span className="flex items-center gap-1">
            <span>🖱️ drag-and-drop local images into editor</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span>📋 paste rich text directly from Google Docs</span>
          </span>
          <span className="font-mono text-[10px] uppercase text-blue-600 dark:text-blue-400 font-bold">Visual Rich Editor</span>
        </div>
      )}
    </div>
  );
}
