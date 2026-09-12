interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  inline?: boolean;
}

const SIZE_CLASS = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-10 w-10 border-[3px]',
} as const;

export function LoadingSpinner({
  size = 'md',
  label = '加载中...',
  className = '',
  inline = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <span
      className={`inline-block animate-spin rounded-full border-slate-200 border-t-slate-600 ${SIZE_CLASS[size]}`}
      role="status"
      aria-hidden="true"
    />
  );

  if (inline) {
    return (
      <div className={`flex items-center gap-2 text-sm text-slate-500 ${className}`}>
        {spinner}
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-16 text-slate-500 ${className}`}
      role="status"
      aria-live="polite"
    >
      {spinner}
      <span className="text-sm">{label}</span>
    </div>
  );
}
