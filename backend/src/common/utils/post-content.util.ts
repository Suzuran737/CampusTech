export const POST_CONTENT_MAX_HTML_LENGTH = 50000;
export const POST_CONTENT_MAX_PLAIN_TEXT_LENGTH = 10000;

const ALLOWED_TAGS = [
  'p',
  'h2',
  'h3',
  'strong',
  'em',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'a',
  'img',
  'br',
];

/** 提取 HTML 纯文本，用于长度校验 */
export function stripHtmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function isValidPostPlainText(html: string): boolean {
  const length = stripHtmlToPlainText(html).length;
  return length >= 1 && length <= POST_CONTENT_MAX_PLAIN_TEXT_LENGTH;
}
