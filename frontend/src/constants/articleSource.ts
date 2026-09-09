export const ARTICLE_SOURCE_LABELS: Record<string, string> = {
  ruanyifeng: '阮一峰的网络日志',
  coolshell: '酷壳',
  infoq: 'InfoQ 中文',
  solidot: 'Solidot',
};

export const ARTICLE_SOURCE_OPTIONS: {
  value: string | undefined;
  label: string;
}[] = [
  { value: undefined, label: '全部' },
  ...Object.entries(ARTICLE_SOURCE_LABELS).map(([value, label]) => ({
    value,
    label,
  })),
];

export function getArticleSourceLabel(source: string): string {
  return ARTICLE_SOURCE_LABELS[source] ?? source;
}
