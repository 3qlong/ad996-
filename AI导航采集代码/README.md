# AI Navigation Crawler

一个模块化、可扩展的 Python 爬虫项目，用于从多个 AI 工具导航站抓取结构化数据，并合并输出为统一的 JSON 文件。

---

## 项目结构

```
ai_crawler/
├── main.py              # 主入口脚本
├── config.yaml          # 网站配置、选择器、分类映射表
├── requirements.txt     # 依赖库清单
├── data_cleaner.py      # 数据清洗、去重、分类统一
├── crawlers/
│   ├── __init__.py
│   ├── base_crawler.py  # 抽象基类（请求/重试/robots/图标）
│   ├── ai_bot_cn.py     # ai-bot.cn 爬虫
│   ├── futurepedia.py   # futurepedia.io 爬虫（API + HTML 回退）
│   ├── topai_tools.py   # topai.tools 爬虫
│   └── generic_static.py # 通用静态爬虫（ailetsgo.cn、ai-dh.com）
├── output/              # 输出目录（自动创建）
└── logs/                # 日志目录（自动创建）
```

---

## 快速开始

### 1. 安装依赖

```bash
pip install -r requirements.txt
```

### 2. 运行全部爬虫

```bash
python main.py
```

### 3. 只运行指定站点

```bash
python main.py --sites ai_bot_cn futurepedia
```

可用站点标识符：
| 标识符 | 网站 |
|---|---|
| `ai_bot_cn` | https://ai-bot.cn |
| `futurepedia` | https://www.futurepedia.io |
| `topai_tools` | https://topai.tools |
| `ailetsgo` | https://ailetsgo.cn |
| `ai_dh` | https://www.ai-dh.com |

### 4. 自定义输出路径

```bash
python main.py --output output/my_data.json
```

### 5. 使用自定义配置文件

```bash
python main.py --config my_config.yaml
```

---

## 输出格式

生成的 `ai_navigation.json` 结构如下：

```json
[
  {
    "category": "图像生成",
    "name": "Midjourney",
    "description": "基于 AI 的图像生成工具，支持文字转图片。",
    "url": "https://www.midjourney.com",
    "icon": "https://www.google.com/s2/favicons?domain=midjourney.com&sz=64",
    "source": "AI工具集"
  }
]
```

---

## 配置说明

`config.yaml` 包含以下主要部分：

| 配置项 | 说明 |
|---|---|
| `general` | 超时、重试次数、延迟范围、日志级别 |
| `user_agents` | 随机 UA 池 |
| `favicon_fallback` | 图标回退 URL 模板 |
| `sites` | 每个站点的 URL、选择器、类型（static/dynamic） |
| `category_mapping` | 分类名称统一映射表 |

---

## 新增站点

1. 在 `config.yaml` 的 `sites` 节点添加配置：

```yaml
sites:
  my_new_site:
    name: "我的新站"
    base_url: "https://example.com"
    enabled: true
    type: "static"
    card_selector: ".tool-card"
    title_selector: "h3 a"
    desc_selector: ".desc"
    url_selector: "a[href]"
    icon_selector: "img.icon"
```

2. 在 `crawlers/` 目录下创建爬虫类（继承 `BaseCrawler` 或 `GenericStaticCrawler`）：

```python
from .generic_static import GenericStaticCrawler

class MyNewSiteCrawler(GenericStaticCrawler):
    pass  # 通用逻辑已在基类中实现
```

3. 在 `crawlers/__init__.py` 中注册并导出。

4. 在 `main.py` 的 `CRAWLER_REGISTRY` 中添加：

```python
CRAWLER_REGISTRY = {
    ...
    "my_new_site": MyNewSiteCrawler,
}
```

---

## 反爬机制说明

| 机制 | 实现方式 |
|---|---|
| 随机 User-Agent | 每次请求前从 UA 池中随机选取 |
| 访问间隔 | 每个分类/页面之间随机延迟 1~3 秒（可配置） |
| 请求重试 | 失败后自动重试 3 次，带指数退避 |
| robots.txt | 爬取前自动解析，跳过 Disallow 路径 |
| 异常隔离 | 单个站点失败不中断整体流程 |

---

## 动态页面支持

对于 JavaScript 渲染的页面（如 Futurepedia），爬虫优先尝试 API 接口获取 JSON 数据。
若需要完整动态渲染支持，可取消 `requirements.txt` 中 `playwright` 的注释并安装：

```bash
pip install playwright
playwright install chromium
```

---

## 日志

每次运行会在 `logs/` 目录生成带时间戳的日志文件，同时在控制台实时输出进度。

---

## 注意事项

- 请遵守各站点的 `robots.txt` 及使用条款，仅用于个人学习和研究目的。
- 部分站点可能有 IP 限速，建议适当增大 `delay_min` / `delay_max` 配置值。
- 若某站点结构发生变化，更新 `config.yaml` 中对应的 CSS 选择器即可，无需修改代码。
