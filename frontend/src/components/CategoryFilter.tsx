import { POST_CATEGORY_OPTIONS } from '../constants/postCategory';
import type { PostCategory } from '../types/post';

interface CategoryFilterProps {
  value: PostCategory | undefined;
  onChange: (category: PostCategory | undefined) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {POST_CATEGORY_OPTIONS.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition ${
              isActive
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
