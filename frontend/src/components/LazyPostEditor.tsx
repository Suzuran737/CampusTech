import { lazy, Suspense } from 'react';
import type { PostEditorProps } from './PostEditor';
import { LoadingSpinner } from './LoadingSpinner';

const PostEditor = lazy(() =>
  import('./PostEditor').then((module) => ({ default: module.PostEditor })),
);

export function LazyPostEditor(props: PostEditorProps) {
  return (
    <Suspense
      fallback={
        <LoadingSpinner
          label="编辑器加载中..."
          className="min-h-[200px] rounded-xl border border-slate-200 bg-white"
        />
      }
    >
      <PostEditor {...props} />
    </Suspense>
  );
}
