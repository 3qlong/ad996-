/**
 * Emoji 炸开特效 - 仅在指定节日/特殊日期生效
 *
 * 规则：
 * - 每个星期四: 🍟🍔🍗
 * - 中秋节: 🥮
 * - 520 (5月20日): 💑
 * - 419 (4月19日): 🔞
 * - 春节 (除夕~初七): 🧧
 * - 龙抬头 (农历二月二): 🐲
 * - 五一劳动节: 🧑‍🏭
 * - 六一儿童节: 🍼
 * - 其他日期: 无特效
 */

// 春节（除夕到初七）
const SPRING_FESTIVAL_RANGES: Record<number, [string, string]> = {
  2025: ['2025-01-28', '2025-02-04'],
  2026: ['2026-02-16', '2026-02-23'],
  2027: ['2027-02-05', '2027-02-12'],
  2028: ['2028-01-25', '2028-02-01'],
  2029: ['2029-02-12', '2029-02-19'],
  2030: ['2030-02-02', '2030-02-09'],
};

// 中秋节
const MID_AUTUMN: Record<number, string> = {
  2025: '2025-10-06',
  2026: '2026-09-25',
  2027: '2027-10-15',
  2028: '2028-10-03',
  2029: '2029-09-22',
  2030: '2030-10-11',
};

// 龙抬头（农历二月初二）
const DRAGON_HEAD: Record<number, string> = {
  2025: '2025-03-01',
  2026: '2026-02-19',
  2027: '2027-03-10',
  2028: '2028-02-28',
  2029: '2029-02-16',
  2030: '2030-03-07',
};

function dateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * 获取今天应掉落的 emoji 集合，非特殊日期返回 null（不触发特效）
 */
export function getTodayEmojis(): string[] | null {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const dayOfWeek = now.getDay();
  const today = dateStr(now);

  // 春节（除夕~初七）
  const springRange = SPRING_FESTIVAL_RANGES[year];
  if (springRange && today >= springRange[0] && today <= springRange[1]) {
    return ['🧧'];
  }

  // 中秋节
  if (MID_AUTUMN[year] === today) return ['🥮'];

  // 龙抬头
  if (DRAGON_HEAD[year] === today) return ['🐲'];

  // 520
  if (month === 5 && day === 20) return ['💑'];

  // 419
  if (month === 4 && day === 19) return ['🔞'];

  // 五一劳动节
  if (month === 5 && day === 1) return ['🧑‍🏭'];

  // 六一儿童节
  if (month === 6 && day === 1) return ['🍼'];

  // 每周四
  if (dayOfWeek === 4) return ['🍟', '🍔', '🍗'];

  // 非特殊日期 → 不触发
  return null;
}

/**
 * 触发 emoji 炸开动画（从鼠标位置向四周散开）
 * 数量 3~8 个，短距离散射后消失
 */
export function triggerEmojiRain(
  emojis?: string[] | null,
  originX?: number,
  originY?: number
) {
  const emojiSet = emojis ?? getTodayEmojis();
  if (!emojiSet) return; // 非特殊日期，不触发

  const count = 3 + Math.floor(Math.random() * 6); // 3~8 个

  // 注入 CSS keyframes（只注入一次）
  if (!document.getElementById('emoji-burst-style')) {
    const style = document.createElement('style');
    style.id = 'emoji-burst-style';
    style.textContent = `
      @keyframes emoji-burst {
        0% {
          transform: translate(0, 0) scale(1) rotate(0deg);
          opacity: 1;
        }
        60% {
          opacity: 1;
        }
        100% {
          transform: translate(var(--dx), var(--dy)) scale(0.2) rotate(var(--rot));
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const cx = originX ?? window.innerWidth / 2;
  const cy = originY ?? window.innerHeight / 2;

  for (let i = 0; i < count; i++) {
    const emoji = emojiSet[Math.floor(Math.random() * emojiSet.length)];
    const el = document.createElement('div');
    el.textContent = emoji;

    // 随机散射方向和距离
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8;
    const dist = 60 + Math.random() * 80; // 散射 60~140px
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 30; // 整体偏上
    const rot = (Math.random() - 0.5) * 360;
    const duration = 0.6 + Math.random() * 0.5; // 0.6~1.1s
    const size = 20 + Math.random() * 12;

    el.style.cssText = `
      position: fixed;
      left: ${cx}px;
      top: ${cy}px;
      font-size: ${size}px;
      pointer-events: none;
      z-index: 99999;
      user-select: none;
      --dx: ${dx}px;
      --dy: ${dy}px;
      --rot: ${rot}deg;
      animation: emoji-burst ${duration}s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    `;

    document.body.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000 + 100);
  }
}

/**
 * 从点击事件触发 emoji 炸开（获取点击坐标）
 */
export function triggerEmojiRainFromEvent(e: React.MouseEvent | MouseEvent) {
  const emojis = getTodayEmojis();
  if (!emojis) return; // 非特殊日期，不触发

  // 使用鼠标点击位置作为炸开中心
  const x = e.clientX;
  const y = e.clientY;
  triggerEmojiRain(emojis, x, y);
}
