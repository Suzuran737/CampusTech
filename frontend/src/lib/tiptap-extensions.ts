import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from '@tiptap/starter-kit';
import { POST_CONTENT_MAX_PLAIN_TEXT_LENGTH } from '../utils/stripHtmlToPlainText';

interface CreateTiptapExtensionsOptions {
  placeholder?: string;
  maxCharacters?: number;
}

export function createTiptapExtensions({
  placeholder = '开始撰写正文…',
  maxCharacters = POST_CONTENT_MAX_PLAIN_TEXT_LENGTH,
}: CreateTiptapExtensionsOptions = {}) {
  return [
    StarterKit.configure({
      heading: {
        levels: [2, 3],
      },
    }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      defaultProtocol: 'https',
    }),
    Image.configure({
      inline: false,
      allowBase64: false,
    }),
    Placeholder.configure({
      placeholder,
    }),
    CharacterCount.configure({
      limit: maxCharacters,
    }),
  ];
}
