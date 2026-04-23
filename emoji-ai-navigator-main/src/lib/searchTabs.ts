// 搜索标签配置 - 由后台「搜索标签管理」维护，前端 Header 订阅
// 站内搜索走站内导航，所有其它标签走外部搜索 URL（关键词会被 URL-encode 后拼到 url 末尾）

export interface SearchTab {
  id: string;
  name: string;          // 标签显示名称
  url: string;           // 搜索 URL 前缀；站内搜索留空
  internal?: boolean;    // true = 站内搜索（无法删除）
  visible: boolean;      // 是否在前台显示
}

const STORAGE_KEY = 'site.searchTabs.v1';
export const SEARCH_TABS_EVENT = 'search-tabs-changed';

export const DEFAULT_SEARCH_TABS: SearchTab[] = [
  { id: 'internal', name: '站内搜索', url: '', internal: true, visible: true },
  { id: 'baidu',    name: '百度',     url: 'https://www.baidu.com/s?wd=', visible: true },
  { id: 'google',   name: '谷歌',     url: 'https://www.google.com/search?q=', visible: true },
  { id: 'huaban',   name: '花瓣',     url: 'https://huaban.com/search?q=', visible: true },
  { id: 'zcool',    name: '站酷',     url: 'https://www.zcool.com.cn/search/content?word=', visible: true },
  { id: 'taobao',   name: '淘宝',     url: 'https://s.taobao.com/search?page=', visible: true },
  { id: 'civitai',  name: 'C站',      url: 'https://civitai.com/?query=', visible: true },
  { id: 'github',   name: 'Github',   url: 'https://github.com/search?q=', visible: true },
  { id: 'lexica',   name: 'lexica',   url: 'https://lexica.art/?q=', visible: true },
  { id: 'deviant',  name: 'deviantar',url: 'https://www.deviantart.com/search?q=', visible: true },
  { id: 'perplex',  name: 'perplexity',url: 'https://www.perplexity.ai/search?q=', visible: true },
];

export function loadSearchTabs(): SearchTab[] {
  if (typeof window === 'undefined') return DEFAULT_SEARCH_TABS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SEARCH_TABS;
    const parsed = JSON.parse(raw) as SearchTab[];
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_SEARCH_TABS;
    // 保证始终存在一个 internal 标签
    if (!parsed.some(t => t.internal)) {
      return [DEFAULT_SEARCH_TABS[0], ...parsed];
    }
    return parsed;
  } catch {
    return DEFAULT_SEARCH_TABS;
  }
}

export function saveSearchTabs(tabs: SearchTab[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
  window.dispatchEvent(new CustomEvent(SEARCH_TABS_EVENT));
}

export function resetSearchTabs(): SearchTab[] {
  saveSearchTabs(DEFAULT_SEARCH_TABS);
  return DEFAULT_SEARCH_TABS;
}
