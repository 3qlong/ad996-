// 根据分类、二级分类、产品介绍、使用技巧自动生成 4-5 个标签（每个 ≤ 6 字）
// 优先级：一级分类必出 1 个 → 已有二级分类标签 → 产品介绍/使用技巧关键词命中 → 分类备选池补齐

interface ToolLike {
  name: string;
  description?: string;
  category?: string;
  longDescription?: string;
  details?: {
    usageTips?: string;
    productIntro?: string;
  };
  tags?: string[];
}

const MIN_TAGS = 3;
const MAX_TAGS = 3;

// 各大分类的关键词候选池（每个 ≤ 6 字，更具体更优先）
const CATEGORY_POOL: Record<string, string[]> = {
  'AI写作': ['智能写作', '文案生成', '内容创作', '文本润色', 'AI续写', '论文辅助'],
  'AI图像': ['图片生成', '图像编辑', 'AI绘画', '智能修图', '风格转换', '图像增强'],
  'AI视频': ['视频生成', '视频编辑', 'AI剪辑', '特效制作', '字幕生成', '动画创作'],
  'AI办公': ['办公提效', '文档处理', '智能助手', '会议记录', 'PPT生成', '数据分析'],
  'AI聊天': ['智能对话', 'AI问答', '多轮对话', '知识问答', '角色扮演', '语言理解'],
  'AI编程': ['代码生成', '编程辅助', '代码补全', 'Bug修复', '智能编码', '代码审查'],
  'AI设计': ['智能设计', 'UI生成', '创意设计', '海报制作', 'Logo设计', '排版布局'],
  'AI音频': ['语音合成', '音频编辑', '语音识别', 'AI配音', '音乐生成', '降噪处理'],
  'AI智能体': ['智能体', '自动化', '任务执行', '流程编排', '多模态', '知识库'],
  'AI搜索': ['智能搜索', '语义检索', '知识发现', '信息聚合', '精准查找', '内容推荐'],
  'AI学习': ['智能学习', '知识辅导', '练习生成', '学情分析', '个性教学', '自适应'],
  'AI开发': ['开发工具', 'API接口', '模型部署', '数据标注', '模型训练', '低代码'],
  '营销新闻': ['营销资讯', '行业热点', '案例分析', '数据洞察', '增长策略', '品牌动态'],
  '热榜指数': ['实时热榜', '数据报告', '行业监测', '舆情分析', '热点追踪', '数据可视化'],
};

// 关键词 → 标签 映射（命中即取）
const KEYWORD_TAGS: [string, string][] = [
  // 写作 / 文案
  ['翻译', '智能翻译'], ['PPT', 'PPT生成'], ['演示', '演示制作'],
  ['论文', '论文辅助'], ['学术', '学术写作'], ['公文', '公文写作'],
  ['小说', '小说创作'], ['文案', '文案生成'], ['SEO', 'SEO优化'],
  ['邮件', '邮件撰写'], ['报告', '报告生成'], ['润色', '文本润色'],
  ['写作', '智能写作'], ['续写', 'AI续写'],
  // 图像 / 设计
  ['绘画', 'AI绘画'], ['修图', '智能修图'], ['抠图', '智能抠图'],
  ['图像', '图像处理'], ['图片', '图片处理'], ['头像', '头像生成'],
  ['Logo', 'Logo设计'], ['海报', '海报制作'], ['UI', 'UI设计'],
  ['插画', '插画创作'], ['壁纸', '壁纸生成'],
  // 视频 / 动画
  ['视频', '视频生成'], ['剪辑', 'AI剪辑'], ['字幕', '字幕生成'],
  ['短视频', '短视频'], ['特效', '特效制作'], ['动画', '动画创作'],
  ['数字人', '数字人'],
  // 音频
  ['语音', '语音合成'], ['配音', 'AI配音'], ['音乐', '音乐生成'],
  ['降噪', '降噪处理'], ['翻唱', 'AI翻唱'],
  // 编程 / 开发
  ['编程', '代码辅助'], ['代码', '代码生成'], ['调试', 'Bug修复'],
  ['API', 'API接口'], ['部署', '模型部署'], ['训练', '模型训练'],
  ['低代码', '低代码'], ['插件', '插件扩展'],
  // 办公 / 助理
  ['办公', '办公提效'], ['表格', '表格处理'], ['会议', '会议助手'],
  ['日程', '日程管理'], ['笔记', '智能笔记'], ['总结', '内容总结'],
  // 营销 / 商业
  ['营销', '营销助手'], ['客服', '智能客服'], ['电商', '电商运营'],
  ['广告', '广告创意'], ['增长', '增长策略'], ['运营', '运营辅助'],
  // 数据 / 搜索
  ['数据', '数据分析'], ['搜索', '智能搜索'], ['问答', '智能问答'],
  ['对话', '智能对话'], ['爬虫', '数据采集'],
  // 教育 / 学习
  ['教育', '智能教育'], ['学习', '智能学习'], ['题库', '题库练习'],
  ['英语', '英语学习'], ['儿童', '儿童学习'],
  // 商业模式
  ['免费', '免费使用'], ['开源', '开源工具'], ['模板', '模板丰富'],
  ['协作', '团队协作'], ['多语言', '多语言'], ['企业', '企业级'],
];

/**
 * 根据 category + 二级分类（tool.tags） + productIntro + usageTips + description 生成 4-5 个标签
 * 顺序：一级分类 → 已有二级分类标签 → 关键词命中 → 分类候选池补齐
 */
export function generateSmartTags(tool: ToolLike): string[] {
  const out: string[] = [];

  // 1. 一级分类作为首个固定标签
  if (tool.category) out.push(tool.category);

  // 2. 收录数据自带的二级分类标签（去重 + 跳过与一级分类重复的）
  if (Array.isArray(tool.tags)) {
    for (const t of tool.tags) {
      if (out.length >= MAX_TAGS) break;
      const trimmed = (t || '').trim();
      if (!trimmed) continue;
      if (trimmed === tool.category) continue; // 跳过与一级分类重复的
      if (!out.includes(trimmed)) out.push(trimmed);
    }
  }

  // 3. 拼接全部文本用于关键词匹配
  const text = [
    tool.description || '',
    tool.longDescription || '',
    tool.details?.usageTips || '',
    tool.details?.productIntro || '',
    tool.name || '',
  ].join(' ').toLowerCase();

  // 4. 关键词命中（顺序即优先级，已存在的不重复）
  for (const [kw, tag] of KEYWORD_TAGS) {
    if (out.length >= MAX_TAGS) break;
    if (text.includes(kw.toLowerCase()) && !out.includes(tag)) {
      out.push(tag);
    }
  }

  // 5. 若不足最少 4 个，用分类候选池补齐
  const pool = CATEGORY_POOL[tool.category || ''] || ['AI工具', '智能处理', '效率提升'];
  for (const t of pool) {
    if (out.length >= MIN_TAGS) break;
    if (!out.includes(t)) out.push(t);
  }

  return out.slice(0, MAX_TAGS);
}

/**
 * 判断某个工具是否命中给定标签（用于"点击标签 → 显示其他匹配站点"）
 * 命中规则：分类 / tags / 名称 / 描述 / 智能标签 任一包含即视为命中
 */
export function toolMatchesTag(tool: ToolLike, tag: string): boolean {
  if (!tag) return true;
  const t = tag.toLowerCase();
  if ((tool.category || '').toLowerCase() === t) return true;
  if (Array.isArray(tool.tags) && tool.tags.some(x => (x || '').toLowerCase().includes(t))) return true;
  if ((tool.name || '').toLowerCase().includes(t)) return true;
  if ((tool.description || '').toLowerCase().includes(t)) return true;
  // 反向兜底：根据该工具的智能标签集合判断
  const smart = generateSmartTags(tool).map(x => x.toLowerCase());
  return smart.includes(t);
}

