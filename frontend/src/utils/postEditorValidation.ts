import {
  POST_CONTENT_MAX_PLAIN_TEXT_LENGTH,
  stripHtmlToPlainText,
} from './stripHtmlToPlainText';

export function isPostEditorContentValid(
  html: string,
  maxCharacters = POST_CONTENT_MAX_PLAIN_TEXT_LENGTH,
): boolean {
  const plainText = stripHtmlToPlainText(html);
  return plainText.length >= 1 && plainText.length <= maxCharacters;
}
