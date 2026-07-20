/**
 * Parses simple, clean Markdown-like text formatting into HTML.
 * This completely avoids raw HTML writing by escaping < and > tags first,
 * then safely parsing markdown shortcuts for headings, bold, italic, lists, links, and images.
 */
export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  // If it already looks like HTML, return it directly to preserve existing articles and editor HTML
  const trimmed = markdown.trim();
  if (
    trimmed.startsWith('<') || 
    trimmed.includes('</') || 
    trimmed.includes('/>') || 
    /<(p|h1|h2|h3|h4|strong|em|ul|ol|li|blockquote|figure|img|table|tr|td|th|pre|code|div|span|br|a)\b/i.test(markdown)
  ) {
    return markdown;
  }

  // 1. Escape HTML characters to prevent raw HTML writing
  let html = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Headings (parse multiline safely)
  html = html.replace(/^### (.*?)$/gm, '<h3 class="font-display font-bold text-lg text-slate-800 dark:text-slate-200 mt-4 mb-2">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="font-display font-bold text-xl text-slate-900 dark:text-white mt-6 mb-3">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="font-display font-extrabold text-2xl text-slate-900 dark:text-white mt-8 mb-4">$1</h1>');

  // 3. Bold (**bold** or __bold__)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

  // 4. Italic (*italic* or _italic_)
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // 5. Code inline (`code`)
  html = html.replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-blue-600 dark:text-blue-400">$1</code>');

  // 6. Blockquotes (> citation)
  html = html.replace(/^> (.*?)$/gm, '<blockquote class="border-l-4 border-blue-500 pl-4 italic my-4 text-slate-600 dark:text-slate-400">$1</blockquote>');

  // 7. Lists
  // Unordered list items
  html = html.replace(/^\s*-\s+(.*?)$/gm, '<li class="list-disc ml-6 my-1">$1</li>');
  html = html.replace(/^\s*\*\s+(.*?)$/gm, '<li class="list-disc ml-6 my-1">$1</li>');
  // Ordered list items
  html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, '<li class="list-decimal ml-6 my-1">$1</li>');

  // 8. Images: ![alt description](url)
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<figure class="my-6 text-center"><img src="$2" alt="$1" class="rounded-xl max-h-96 mx-auto object-cover shadow-sm border border-slate-100 dark:border-slate-800" referrerPolicy="no-referrer" /><figcaption class="text-xs text-slate-400 italic mt-2">$1</figcaption></figure>');

  // 9. Links: [text](url)
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 font-bold hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');

  // 10. Paragraph wrapping based on blank lines
  const sections = html.split(/\n\s*\n/);
  const parsedSections = sections.map(section => {
    const s = section.trim();
    if (!s) return '';
    
    // If it is already structured HTML tags, do not wrap
    if (s.startsWith('<h') || s.startsWith('<li') || s.startsWith('<blockquote') || s.startsWith('<figure') || s.startsWith('<pre') || s.startsWith('<a')) {
      return s;
    }
    
    // Replace remaining single newlines inside paragraph with line breaks
    const innerContent = s.replace(/\n/g, '<br />');
    return `<p class="leading-relaxed mb-4 text-slate-700 dark:text-slate-300 text-sm sm:text-base">${innerContent}</p>`;
  });

  return parsedSections.filter(Boolean).join('\n');
}
