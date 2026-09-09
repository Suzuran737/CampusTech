export interface RssSource {
  /** 存入 articles.source，用于筛选 */
  name: string;
  /** RSS / Atom 地址 */
  url: string;
  /** 中文展示名（注释/文档用） */
  label: string;
}

/**
 * 阶段 4 初始 RSS 源（写死在配置中，第一版不做管理后台）
 * URL 需在开发环境实测；单源失败不影响其他源
 */
export const RSS_SOURCES: RssSource[] = [
  {
    name: 'ruanyifeng',
    url: 'https://www.ruanyifeng.com/blog/atom.xml',
    label: '阮一峰的网络日志',
  },
  {
    name: 'coolshell',
    url: 'https://coolshell.cn/feed',
    label: '酷壳',
  },
  {
    name: 'infoq',
    url: 'https://www.infoq.cn/feed',
    label: 'InfoQ 中文',
  },
  {
    name: 'solidot',
    url: 'https://www.solidot.org/index.rss',
    label: 'Solidot',
  },
];
