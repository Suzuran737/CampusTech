import type { PostCategory } from '../types/post';

export const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  STUDY: '学习心得',
  EXPERIENCE: '经验分享',
  RESOURCE: '资源推荐',
  QUESTION: '问答求助',
};

export const POST_CATEGORY_OPTIONS: {
  value: PostCategory | undefined;
  label: string;
}[] = [
  { value: undefined, label: '全部' },
  { value: 'STUDY', label: POST_CATEGORY_LABELS.STUDY },
  { value: 'EXPERIENCE', label: POST_CATEGORY_LABELS.EXPERIENCE },
  { value: 'RESOURCE', label: POST_CATEGORY_LABELS.RESOURCE },
  { value: 'QUESTION', label: POST_CATEGORY_LABELS.QUESTION },
];
