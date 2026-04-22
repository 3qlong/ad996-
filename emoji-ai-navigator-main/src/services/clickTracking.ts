/**
 * Click tracking service for hot ranking feature.
 * Records one click per tool per IP per day via the admin API.
 */

export function recordToolClick(tool: {
  id: number;
  name: string;
  category: string;
}) {
  // Fire-and-forget: don't block the UI
  fetch('/api/click', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tool_id: tool.id,
      tool_name: tool.name,
      category: tool.category,
    }),
  }).catch(() => {
    // silently ignore tracking errors
  });
}

export interface HotTool {
  tool_id: number;
  tool_name: string;
  category: string;
  clicks: number;
}

export async function fetchHotTools(
  category: string = '',
  days: number = 7,
  limit: number = 50,
): Promise<HotTool[]> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  params.set('days', String(days));
  params.set('limit', String(limit));
  const res = await fetch(`/api/hot-tools?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.items || [];
}

export interface HotCategory {
  category: string;
  clicks: number;
}

export async function fetchHotCategories(
  days: number = 7,
): Promise<HotCategory[]> {
  const res = await fetch(`/api/hot-categories?days=${days}`);
  if (!res.ok) return [];
  return res.json();
}
