import { ARTICLE_SOURCE_OPTIONS } from '../constants/articleSource';

interface SourceFilterProps {
  value: string | undefined;
  onChange: (source: string | undefined) => void;
}

export function SourceFilter({ value, onChange }: SourceFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {ARTICLE_SOURCE_OPTIONS.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.label}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
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
