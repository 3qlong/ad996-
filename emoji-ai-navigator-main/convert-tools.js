import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取jsonl文件
const jsonlContent = fs.readFileSync('/Volumes/Mac mini/CURSOR /AI导航/AI导航采集代码/ai_bot_tools.jsonl', 'utf8');

// 解析jsonl文件
const lines = jsonlContent.split('\n').filter(line => line.trim());
const tools = lines.map((line, index) => {
  const data = JSON.parse(line);
  
  // 为每个工具生成一个唯一的ID
  const id = index + 1;
  
  // 确定工具类别
  let category = 'AI写作';
  if (data.category.includes('图像')) {
    category = 'AI图像';
  } else if (data.category.includes('视频')) {
    category = 'AI视频';
  } else if (data.category.includes('办公')) {
    category = 'AI办公';
  } else if (data.category.includes('智能体')) {
    category = 'AI智能体';
  } else if (data.category.includes('聊天')) {
    category = 'AI聊天';
  } else if (data.category.includes('编程')) {
    category = 'AI编程';
  } else if (data.category.includes('设计')) {
    category = 'AI设计';
  } else if (data.category.includes('音频')) {
    category = 'AI音频';
  } else if (data.category.includes('搜索')) {
    category = 'AI搜索';
  } else if (data.category.includes('开发')) {
    category = 'AI开发';
  } else if (data.category.includes('学习')) {
    category = 'AI学习';
  } else if (data.category.includes('训练')) {
    category = 'AI训练';
  } else if (data.category.includes('检测')) {
    category = 'AI检测';
  } else if (data.category.includes('提示')) {
    category = 'AI提示';
  }
  
  // 生成emoji
  let emoji = '✍️';
  if (category === 'AI图像') {
    emoji = '🎨';
  } else if (category === 'AI视频') {
    emoji = '📹';
  } else if (category === 'AI办公') {
    emoji = '💼';
  } else if (category === 'AI智能体') {
    emoji = '🤖';
  } else if (category === 'AI聊天') {
    emoji = '💬';
  } else if (category === 'AI编程') {
    emoji = '💻';
  } else if (category === 'AI设计') {
    emoji = '🎯';
  } else if (category === 'AI音频') {
    emoji = '🎵';
  } else if (category === 'AI搜索') {
    emoji = '🔍';
  } else if (category === 'AI开发') {
    emoji = '🚀';
  } else if (category === 'AI学习') {
    emoji = '📚';
  } else if (category === 'AI训练') {
    emoji = '🏋️';
  } else if (category === 'AI检测') {
    emoji = '🔬';
  } else if (category === 'AI提示') {
    emoji = '💡';
  }
  
  // 转义字符串中的特殊字符
  const escapeString = (str) => {
    return str
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"');
  };

  return {
    id,
    logo: escapeString(data.icon_url),
    url: escapeString(data.url),
    emoji,
    name: escapeString(data.name),
    description: escapeString(data.description),
    tags: [data.category],
    category,
    upvotes: Math.floor(Math.random() * 1000), // 随机生成点赞数
    longDescription: escapeString(data.description),
    details: {
      usageTips: '直接访问网站使用。',
      productIntro: escapeString(data.description),
      awards: '暂无。'
    }
  };
});

// 生成新的tools.ts内容
const newToolsContent = `
export const allTools = [
  ${tools.map(tool => `
  { 
    id: ${tool.id},
    logo: '${tool.logo}', 
    url: '${tool.url}',
    emoji: '${tool.emoji}', 
    name: '${tool.name}', 
    description: '${tool.description}', 
    tags: ${JSON.stringify(tool.tags)}, 
    category: '${tool.category}', 
    upvotes: ${tool.upvotes},
    longDescription: '${tool.longDescription}',
    details: {
      usageTips: '${tool.details.usageTips}',
      productIntro: '${tool.details.productIntro}',
      awards: '${tool.details.awards}',
    },
  }`).join(',')}
];
`;

// 写入新的tools.ts文件
fs.writeFileSync('/Volumes/Mac mini/CURSOR /AI导航/emoji-ai-navigator-main/src/data/tools.ts', newToolsContent);

console.log('工具数据更新成功！');
console.log(`共添加了 ${tools.length} 个新工具`);
console.log(`总工具数量: ${tools.length}`);
