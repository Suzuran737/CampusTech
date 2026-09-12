interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  message,
  onRetry,
  className = '',
}: ErrorMessageProps) {
  return (
    <div
      className={`rounded-2xl bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-100 ${className}`}
      role="alert"
    >
      <p>{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex min-h-11 items-center rounded-lg border border-red-200 bg-white px-4 text-red-700 hover:bg-red-50"
        >
          重试
        </button>
      )}
    </div>
  );
}
