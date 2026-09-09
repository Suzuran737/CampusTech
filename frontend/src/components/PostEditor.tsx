import { EditorContent, useEditor } from '@tiptap/react';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { uploadImage } from '../api/upload';
import { createTiptapExtensions } from '../lib/tiptap-extensions';
import { sanitizePostHtml } from '../lib/sanitize-post-content';
import {
  POST_CONTENT_MAX_PLAIN_TEXT_LENGTH,
  stripHtmlToPlainText,
} from '../utils/stripHtmlToPlainText';
import { EditorToolbar } from './EditorToolbar';

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

interface PostEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
  placeholder?: string;
  maxCharacters?: number;
  editorKey?: string | number;
}

export function PostEditor({
  value,
  onChange,
  disabled = false,
  placeholder = '开始撰写正文…',
  maxCharacters = POST_CONTENT_MAX_PLAIN_TEXT_LENGTH,
  editorKey,
}: PostEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const editor = useEditor({
    extensions: createTiptapExtensions({ placeholder, maxCharacters }),
    content: value,
    editable: !disabled && !uploadingImage,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(sanitizePostHtml(currentEditor.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!disabled && !uploadingImage);
  }, [editor, disabled, uploadingImage]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const currentHtml = sanitizePostHtml(editor.getHTML());
    const nextHtml = sanitizePostHtml(value);

    if (currentHtml !== nextHtml) {
      editor.commands.setContent(nextHtml, { emitUpdate: false });
    }
  }, [editor, value]);

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || !editor) {
      return;
    }

    setUploadError('');

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      setUploadError('图片仅支持 jpg、jpeg、png、webp 格式');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setUploadError('图片大小不能超过 2MB');
      return;
    }

    setUploadingImage(true);

    try {
      const result = await uploadImage(file);
      editor.chain().focus().setImage({ src: result.url }).run();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : '图片上传失败');
    } finally {
      setUploadingImage(false);
    }
  }

  const characterCount = editor?.storage.characterCount?.characters() ?? 0;
  const isOverLimit = characterCount > maxCharacters;
  const plainTextLength = stripHtmlToPlainText(value).length;

  return (
    <div key={editorKey} className="overflow-hidden rounded-lg border border-slate-300">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        aria-label="选择正文图片"
        disabled={disabled || uploadingImage}
        onChange={handleImageChange}
      />

      <EditorToolbar
        editor={editor}
        disabled={disabled}
        uploadingImage={uploadingImage}
        onImageClick={() => fileInputRef.current?.click()}
      />

      <EditorContent
        editor={editor}
        className="tiptap-editor min-h-[280px] px-4 py-3 text-sm text-slate-800"
      />

      <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs">
        <span className={isOverLimit ? 'font-medium text-red-600' : 'text-slate-500'}>
          {plainTextLength} / {maxCharacters} 字
          {isOverLimit && '（已超出上限）'}
        </span>
        {uploadError && <span className="text-red-600">{uploadError}</span>}
      </div>
    </div>
  );
}

export function isPostEditorContentValid(
  html: string,
  maxCharacters = POST_CONTENT_MAX_PLAIN_TEXT_LENGTH,
): boolean {
  const plainText = stripHtmlToPlainText(html);
  return plainText.length >= 1 && plainText.length <= maxCharacters;
}
