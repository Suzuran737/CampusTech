import { sanitizePostHtmlForDisplay } from '../lib/sanitize-post-content';

interface RichTextContentProps {
  content: string;
}

export function RichTextContent({ content }: RichTextContentProps) {
  const html = sanitizePostHtmlForDisplay(content);

  return (
    <div
      className="prose prose-slate max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-code:text-slate-800 prose-img:rounded-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
