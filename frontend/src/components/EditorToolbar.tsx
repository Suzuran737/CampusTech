import type { ReactNode } from 'react';
import type { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor | null;
  disabled?: boolean;
  uploadingImage?: boolean;
  onImageClick: () => void;
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded px-2.5 text-sm ${
        active
          ? 'bg-slate-900 text-white'
          : 'text-slate-700 hover:bg-slate-100'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({
  editor,
  disabled = false,
  uploadingImage = false,
  onImageClick,
}: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  const isDisabled = disabled || uploadingImage;

  function setLink() {
    const previousUrl = editor!.getAttributes('link').href as string | undefined;
    const url = window.prompt('请输入链接 URL', previousUrl ?? 'https://');

    if (url === null) {
      return;
    }

    if (url === '') {
      editor!.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor!.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
      <ToolbarButton
        title="二级标题"
        disabled={isDisabled}
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        title="三级标题"
        disabled={isDisabled}
        active={editor.isActive('heading', { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        title="粗体"
        disabled={isDisabled}
        active={editor.isActive('bold')}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        B
      </ToolbarButton>
      <ToolbarButton
        title="斜体"
        disabled={isDisabled}
        active={editor.isActive('italic')}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        I
      </ToolbarButton>
      <ToolbarButton
        title="无序列表"
        disabled={isDisabled}
        active={editor.isActive('bulletList')}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • 列表
      </ToolbarButton>
      <ToolbarButton
        title="有序列表"
        disabled={isDisabled}
        active={editor.isActive('orderedList')}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. 列表
      </ToolbarButton>
      <ToolbarButton
        title="引用"
        disabled={isDisabled}
        active={editor.isActive('blockquote')}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        引用
      </ToolbarButton>
      <ToolbarButton
        title="代码块"
        disabled={isDisabled}
        active={editor.isActive('codeBlock')}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        代码
      </ToolbarButton>
      <ToolbarButton
        title="链接"
        disabled={isDisabled}
        active={editor.isActive('link')}
        onClick={setLink}
      >
        链接
      </ToolbarButton>
      <ToolbarButton
        title="图片"
        disabled={isDisabled}
        onClick={onImageClick}
      >
        {uploadingImage ? '上传中…' : '图片'}
      </ToolbarButton>
    </div>
  );
}
