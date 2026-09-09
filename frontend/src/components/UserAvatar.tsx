import { useEffect, useState } from 'react';
import { resolveAssetUrl } from '../utils/resolveAssetUrl';

interface UserAvatarProps {
  avatarUrl: string | null;
  nickname?: string | null;
  username: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-20 w-20 text-2xl',
};

function getInitial(nickname: string | null | undefined, username: string) {
  const source = nickname?.trim() || username;
  return source.charAt(0).toUpperCase();
}

export function UserAvatar({
  avatarUrl,
  nickname,
  username,
  size = 'md',
}: UserAvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const className = `${sizeClasses[size]} shrink-0 rounded-full object-cover`;
  const resolvedUrl = resolveAssetUrl(avatarUrl);

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  if (resolvedUrl && !imageFailed) {
    return (
      <img
        src={resolvedUrl}
        alt={nickname || username}
        className={className}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div
      className={`${className} flex items-center justify-center bg-slate-200 font-semibold text-slate-600`}
      aria-hidden
    >
      {getInitial(nickname, username)}
    </div>
  );
}
