# Yadong 个人博客 — 项目档案（AGENTS.md）

> 这是本项目的**唯一入口文档**。任何 agent（Codex / Trae / Claude Code / Hermes）动手前先读这里；
> 完整的坑位与细节在 Hermes skill `blog-deploy`（`C:\Users\wang\AppData\Local\hermes\skills\blog-deploy\`，SKILL.md 是索引，references/ 按需读）。

## 1. 项目信息

| 项 | 值 |
|---|---|
| 域名 | https://yadongw118.dpdns.org |
| 本机路径 | `C:\Users\wang\workspace\yadong-blog` |
| GitHub | `github.com/2326239842/my-bok`（分支 main） |
| 构建 | `node scripts/build.js` —— **不是 Hugo**（hugo.toml / themes/ / layouts/ / public/ 都是废弃残留） |
| 部署 | Cloudflare Pages 项目 `yadong-blog`；线上靠 `wrangler pages deploy`，另有 blog-poller（PM2，每 2 分钟轮询 GitHub）作为自动兜底 |
| API | `functions/api/comments.js`（Cloudflare Pages Function）+ KV |
| 架构 | 单页 SPA（`index.html` + hash 路由 `#/post/{slug}`），正文按篇加载 `content/{slug}.json` |

## 2. 常用命令

```bash
export PATH="/c/Program Files/nodejs:$PATH"          # git-bash 里需要
cd ~/workspace/yadong-blog

node scripts/build.js                                 # 构建（重新注入文章元数据 + slugMap）
python "C:\Users\wang\Desktop\工作文件夹\deploy-blog.py"   # 一键：构建 + 部署 + 线上验证（推荐）
git add <只加自己的路径> ; git commit -m "ascii message" ; git push origin main
```

验证线上：首页必须 200，且 `curl -sS https://yadongw118.dpdns.org/ | grep -c "新文章标题"` > 0。

## 3. 硬规则（违反会出事故）

1. **图片放根目录 `images/`**（不是 `static/images/`），正文引用 `/images/x.png`。
2. **`&` 转义**：正文与表格单元格写 `&amp;`；**代码块 / 行内代码写原字符 `&`**（build 的 `escapeHtml()` 会自动转义）。漏写 → 手机端（Android WebView）文章“加载失败”。
3. **frontmatter 日期用 `YYYY-MM-DD`**（`YYYY-MM-DD HH` 会让列表排序变 NaN）。
4. **`articles-content.json` 用文章标题做 key**，永远不要改回数字 id。
5. **对外链接/分享一律用稳定 slug**：`#/post/{md5(title).slice(0,8)}`；路由 `findArticleByKey()` 兼容数字 id 与 slug。数字 id 会随新文章整体前移。
6. **改 API 只改 `functions/api/comments.js`**（Pages Function），不是 `comment.yadongw118.dpdns.org` 的 Worker；所有管理请求发 `/api/comments` 并用 `_action` 分发，发评论例外（`POST /api/comment`）。
7. **`_headers` 不要用 `/*` catch-all**（CF 会拼接而非覆盖），文件不能有 BOM。
8. **commit message 只能是 ASCII**（emoji / 中文破折号会让 wrangler 报 `8000111`）。
9. **部署后必须验证网站可访问**（HTTP 200 + 新内容命中）。
10. **交互式文章（含 `<style>` 或多行 JS）必须用 raw HTML 模式**（正文首字符 `<`）；inline onclick 的函数要挂到 `window`。
11. **不要加自动清缓存/版本检测**；只保留手动 🗑️ 清缓存按钮。也不要在 `<head>` 加 no-cache meta。
12. **手机端看不到新文章 = 缓存**，让用户点 🗑️ 清缓存，不要重新部署；服务端 curl 正常就别再翻代码。
13. **禁止改 hosts / DNS / 代理**（硬性）。GitHub push 不通时改用 `wrangler pages deploy`，不要反复重试。
14. **密钥不入库**：本文档及仓库任何文件里的 token 都写 `***`（GitHub Push Protection 会拦整个 push）。
15. **音乐文件只用 OGG（Opus 96k）**，不用 MP3；播放按钮用 `.gp-trigger`。
16. **合集**：frontmatter `collection: "合集名"`（现有：音乐 / 电脑浏览器使用 / 电脑优化 / 网页交互；顺序在 build.js 的 `COLLECTION_ORDER`）。
17. **文章必须是文章**（标题+正文+图文），不能只是跳转卡片；外部项目链接放文末。
18. **配图必须与主题强相关**（游戏就用游戏截图，产品就用产品界面），不要通用图库抽象图。
19. **别搞错站**：本站是「博客」；`yadongw.dpdns.org`（`workspace/yadong-site`）是「个人介绍主页」，独立项目，不要互改。
20. **备份优先**：改 `index.html` / `functions/api/comments.js` 前先 `cp` 一份到 `%LOCALAPPDATA%\Temp`（要求可回溯）。

## 4. 目录速查

| 路径 | 说明 |
|---|---|
| `content/posts/*.md` | 文章源文件（frontmatter + 正文） |
| `scripts/build.js` | 构建脚本：Markdown→HTML、注入元数据、生成 `content/*.json`、`sitemap.xml`、`rss.xml` |
| `index.html` | SPA 外壳：样式、列表/详情/评论/分享/音乐播放器等全部内联 JS（`ARTICLES_START/END` 之间由 build 注入，勿手改该区间） |
| `articles-content.json` | 全量正文 fallback（key = 标题） |
| `content/{slug}.json` | 单篇正文（slug = 标题的 md5 前 8 位） |
| `images/` | 图片（**必须在这里**）；`images/covers/` 音乐封面 |
| `music/` | 音频，仅 OGG |
| `functions/api/comments.js` | 评论/点赞/管理员 API（Pages Function） |
| `sw.js` / `_headers` / `robots.txt` | Service Worker / CF 缓存头 / 爬虫 |
| `tools/` `downloads/` `linkup/` `galaxy?` | 子页工具（如求职追踪）、下载页、小游戏 |
| `.wrangler/` `.hermes/` `node_modules/` `*.bak*` | 本地杂物，不要提交（提交时别用 `git add -A`） |

## 5. 遇到问题

先查 skill `blog-deploy` 的 `references/pitfalls.md`（按症状分类的全部踩坑记录），再看 `references/build-system.md`（构建/实体/slug）、`references/api-comments.md`（API）、`references/local-env-windows.md`（本机环境与 headless 验证）。
