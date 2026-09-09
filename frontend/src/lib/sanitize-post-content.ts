import DOMPurify from 'dompurify';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';

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

const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt'];

let hooksRegistered = false;

function registerSanitizeHooks() {
  if (hooksRegistered || typeof window === 'undefined') {
    return;
  }

  DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    if (data.attrName === 'src' && node.tagName === 'IMG') {
      const src = data.attrValue;
      if (!src.startsWith('/uploads/')) {
        data.keepAttr = false;
      }
    }
  });

  hooksRegistered = true;
}

export function sanitizePostHtml(html: string): string {
  registerSanitizeHooks();
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
}

export function sanitizePostHtmlForDisplay(html: string): string {
  registerSanitizeHooks();

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });

  const template = document.createElement('template');
  template.innerHTML = sanitized;

  template.content.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src');
    if (src) {
      img.setAttribute('src', resolveAssetUrl(src) ?? src);
    }
  });

  template.content.querySelectorAll('a').forEach((link) => {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  return template.innerHTML;
}
