import sanitizeHtml from 'sanitize-html';
import { stripHtmlToPlainText } from './post-content.util';

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

/** 消毒帖子 HTML 正文后再入库 */
export function sanitizePostContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: 'a',
        attribs: {
          href: attribs.href,
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      img: (_tagName, attribs) => ({
        tagName: 'img',
        attribs: {
          src: attribs.src,
          alt: attribs.alt ?? '',
        },
      }),
    },
    exclusiveFilter: (frame) => {
      if (frame.tag === 'img') {
        const src = frame.attribs.src ?? '';
        return !src.startsWith('/uploads/');
      }
      return false;
    },
  });
}

/** 消毒后若纯文本为空则视为无效正文 */
export function preparePostContentForStorage(html: string): string {
  const sanitized = sanitizePostContent(html);
  if (stripHtmlToPlainText(sanitized).length < 1) {
    return '';
  }
  return sanitized;
}
