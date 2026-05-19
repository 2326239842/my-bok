# Trae 博客写作完整指南

> 写给 Trae（或其他 AI 编辑器/助手），这是 Yadong 的个人博客系统。
> 🔗 博客地址: https://yadongw118.dpdns.org/
> 🗂️ 仓库: https://github.com/2326239842/my-bok

---

## 目录

1. [项目结构](#一项目结构)
2. [写新文章](#二写新文章)
3. [Front Matter 格式](#三front-matter-格式)
4. [正文写法](#四正文写法)
5. [图片与视频](#五图片与视频)
6. [可用的 CSS 变量（无脑用这些）](#六可用的-css-变量无脑用这些)
7. [排版设计规范（必须遵守）](#七排版设计规范必须遵守)
8. [构建与部署流程](#八构建与部署流程)
9. [🚫 踩坑记录（曾经犯过的错）](#九-踩坑记录曾经犯过的错)
10. [快速检查清单](#十快速检查清单)

---

## 一、项目结构

```
my-bok/                          # 仓库根目录
├── index.html                   # ⭐ 博客主页面（SPA 单页应用）
├── scripts/build.js             # 构建脚本（读取 .md → 注入 index.html）
├── content/posts/               # ⭐ 新文章放这里！(.md)
│   ├── survivor-bias-streaming-era.md
│   ├── ai-hand-drawn-journal.md
│   └── ...
├── posts/                       # 旧文章目录（不动）
├── images/                      # ⭐ 图片+视频放这里！（仓库根目录）
│   ├── cosmos-video.mp4
│   ├── 花朵.png
│   └── ...
├── static/images/               # ❌ 不要用这个！Hugo 专用，部署后路径不对
├── music/                       # 音频文件
├── functions/api/comments.js    # 评论系统（Cloudflare Pages Functions）
├── hugo.toml                    # Hugo 配置（仅用于生成独立页，主渲染靠 SPA）
├── .github/workflows/deploy.yml # GitHub Actions 自动部署
└── README.md
```

### 文章路径规则

| ✅ 正确路径 | ❌ 错误路径 |
|-------------|-------------|
| `content/posts/new-article.md` | `posts/new-article.md`（旧目录） |
| `images/my-photo.png` | `static/images/my-photo.png`（路径不对） |
| `/images/my-photo.png`（引用路径） | `images/my-photo.png`（缺少 `/` 前缀） |
| `/images/cosmos-video.mp4`（引用路径） | 任何不含 `/` 前缀的路径 |

---

## 二、写新文章

### 步骤

1. 在 `content/posts/` 下创建 `.md` 文件
2. 文件名用英文小写+连字符：`my-article.md`
3. 文件必须包含 Front Matter 和正文
4. 正文可以混用 **Markdown** 和 **标准 HTML**
5. 图片/视频文件放到 `images/` 目录
6. 完成后 commit & push → 自动部署

---

## 三、Front Matter 格式

```yaml
---
title: "文章标题"
date: "2026-05-19T20:41:00+08:00"
tags: ["标签1", "标签2", "标签3"]
summary: "文章摘要，显示在卡片上"
---
```

### ⚠️ 关键规则

| 字段 | 规则 |
|------|------|
| `title` | 字符串，引号可有可无，但**包含特殊字符时必须有引号** |
| `date` | **必须带时间和时区**！格式：`"2026-05-19T20:41:00+08:00"` |
| `tags` | **必须是 YAML 数组格式** `["a", "b"]`，不能用逗号字符串 |
| `summary` | 字符串，显示在文章列表卡片上 |

### 为什么 date 必须带时间？

`build.js` 按时间排序文章，如果多篇同一天的文章只写 `"2026-05-19"`，排序顺序是随机的。
正确写法：`"2026-05-19T20:41:00+08:00"`（带时区偏移）。

---

## 四、正文写法

### 两种模式

博客支持**纯 Markdown** 和 **HTML 混写**两种模式。

**推荐做法**：简单文章用 Markdown，长文/深度文章用 HTML+Markdown 混写。

### 📝 Markdown 语法

build.js 会将 Markdown 转换为 HTML 注入 SPA，支持的语法：

```markdown
## 二级标题（文章主标题）
### 三级标题（小节标题）

**粗体**  *斜体*

> 引用块

- 列表项1
- 列表项2

`行内代码`

```代码块（三个反引号，可指定语言）

[链接文字](https://example.com)

![图片说明](/images/图片.jpg)

---  （分隔线）
```

### 🎨 HTML 高级写法

**用 `<div>` + CSS 变量做各种视觉卡片**：

```html
<!-- 绿色高亮框 -->
<div style="background:var(--bg3);border:1px solid var(--ac3);border-radius:12px;padding:1.5rem;margin:1rem 0;">
  <p>内容...</p>
</div>

<!-- 红色警示框 -->
<div style="background:linear-gradient(135deg,rgba(244,67,54,0.08),transparent);border:1px solid rgba(244,67,54,0.2);border-radius:12px;padding:1.2rem;">
  ⚠️ 警示内容
</div>

<!-- 两列网格卡片 -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;">
  <div style="background:var(--bg4);border-radius:8px;padding:0.8rem;">卡片1</div>
  <div style="background:var(--bg4);border-radius:8px;padding:0.8rem;">卡片2</div>
</div>

<!-- 表格（用 HTML table 或 grid） -->
<div style="background:var(--bg2);border:1px solid var(--bdr);border-radius:12px;padding:1rem;">
  | 左列 | 右列 |
  |:---|:---|
  | 内容 | 内容 |
</div>

<!-- 视频嵌入 -->
<video controls width="100%" style="max-width:800px;border-radius:12px;">
  <source src="/images/你的视频.mp4" type="video/mp4">
</video>

<!-- 居中强调文字 -->
<p style="text-align:center;font-size:1.1rem;font-weight:700;">
  强调内容
</p>
```

### Markdown 与 HTML 混写注意事项

- `hugo.toml` 已开启 `goldmark.renderer.unsafe = true`，原生 HTML 不会被过滤
- build.js 检测到正文以 `<` 开头时会当作纯 HTML 直接注入（不做 MD 转换）
- build.js 检测到不以 `<` 开头时，会走 MD→HTML 转换流程
- **最佳实践**：先用 Markdown 写正文，然后用 HTML 做特殊排版

---

## 五、图片与视频

### 文件存放位置

```
images/                    ← 仓库根目录下的 images/
├── cosmos-video.mp4       ✅ 正确
├── 花朵.png               ✅ 正确（但推荐用英文名）
└── ...
```

### 引用路径

```markdown
<!-- 在文章正文中引用 -->
![图片说明](/images/花朵.png)

<!-- 视频 -->
<source src="/images/cosmos-video.mp4" type="video/mp4">
```

### 文件命名规则

- ✅ **推荐用英文小写+连字符**: `sunset-view.png`, `cosmos-video.mp4`
- ⚠️ 避免中文文件名（某些浏览器/CDN 处理可能有问题）
- 📏 视频控制在 10MB 以内（Git 推送和 Pages 部署会快很多）

### 为什么不能放 static/images/？

`static/images/` 是 Hugo 专用的源目录。Cloudflare Pages 从仓库根目录部署，`static/images/xxx.mp4` 会映射到 `/static/images/xxx.mp4` 而不是 `/images/xxx.mp4`。**所有可访问的资源必须放在仓库根目录下的 `images/` 文件夹。**

---

## 六、可用的 CSS 变量（无脑用这些）

博客使用暗色主题，所有颜色通过 CSS 变量定义。**任何 inline 样式必须用这些变量。**

| 变量名 | 值 | 用途 |
|--------|-----|------|
| `var(--bg)` | `#0a0a0f` | 页面主背景（最深） |
| `var(--bg2)` | `#12121a` | 卡片/面板背景 |
| `var(--bg3)` | `#1a1a25` | 强调背景、代码块 |
| `var(--bg4)` | `#222230` | 子卡片/小面板 |
| `var(--bdr)` | `#2a2a3a` | 普通边框 |
| `var(--bdr2)` | `#3a3a50` | 强调边框 |
| `var(--tx)` | `#eee` | **主文字颜色（最常用）** |
| `var(--tx2)` | `#aaa` | 次要文字 |
| `var(--tx3)` | `#666` | 最淡文字（注释、元信息） |
| `var(--ac)` | `#00e89d` | **主题色（绿色）** 链接、高亮 |
| `var(--ac2)` | `rgba(0,232,157,.12)` | 主题色透明（背景） |
| `var(--ac3)` | `rgba(0,232,157,.3)` | 主题色半透明（边框） |
| `var(--r)` | `12px` | 大圆角 |
| `var(--r2)` | `8px` | 小圆角 |

### 常用组合模板

```html
<!-- 卡片 -->
<div style="background:var(--bg2);border:1px solid var(--bdr);border-radius:var(--r);padding:1.5rem;">
  <p style="color:var(--tx);">正文</p>
  <p style="color:var(--tx2);">次要文字</p>
  <p style="color:var(--tx3);">注释文字</p>
</div>

<!-- 强调内容 -->
<strong style="color:var(--ac);">突出显示</strong>

<!-- 分隔线 -->
<hr style="border-color:var(--bdr);margin:2rem 0;">

<!-- 高亮框（主题色） -->
<div style="background:var(--ac2);border:1px solid var(--ac3);border-radius:var(--r);padding:1rem;">
  高亮内容
</div>
```

---

## 七、排版设计规范（必须遵守）

### ✅ 长文必备的视觉结构

纯文字段落 → 看起来像作文 ❌

**每篇文章需要有节奏感：**

1. **开头要有抓住眼球的东西**（视频/引用/卡片/关键问题）
2. **"太长不看版"摘要**（如果是 1000+ 字长文）
3. **分隔线 `---` 分割不同大段**
4. **每段用 emoji 标记** 让读者扫一眼就知道在说什么
5. **关键句用 blockquote 或高亮框标出**
6. **列表/表格对比代替大段描述**
7. **末尾有总结/金句**

### ✅ 对比模板

```
❌ 差：一大段文字没有结构

现在很多人都会感到焦虑，因为看到社交媒体上别人过得好，
而自己过得不好。这就是幸存者视角在起作用...

✅ 好：有节奏感

## 为什么幸存者视角值得注意

<div style="background:...">⚠️ 它正在摧毁普通人的内心秩序——以一种悄无声息的方式。</div>

**于是焦虑滋生了**——为什么别人的人生如此精彩，而我如此平庸？

**于是自我怀疑涌来**——是不是我不够努力、不够聪明？
```

### ❌ 禁止事项

#### 1. ❌ 不要硬编码颜色值

```html
<!-- ❌ 绝对禁止 -->
<div style="background: white; color: #333;">
<div style="background: #fff; color: black;">
<p style="color: red;">

<!-- ✅ 正确 -->
<div style="background: var(--bg3);">
<p style="color: var(--ac);">
```

**原因**：博客是暗色主题，`#0a0a0f` 背景。硬编码白色/亮色 → 字会看不见。

#### 2. ❌ 不要写裸 `</script>`

```
<!-- ❌ 不行，build.js 会出错 -->
</script>

<!-- ✅ 用 <\\/script> 或避免 -->
```

build.js 已经做了 `escapeForTemplateLiteral`，会转义 `</script>` → `<\\/script>`，
但最好在正文里不要出现 `</script>`。

#### 3. ❌ 不要用其他颜色或字体

- 只能用上面的 CSS 变量列表里的颜色
- 字体由全局 `var(--font)` 控制，不要修改

#### 4. ❌ 不要使用外边部的 CSS

- 所有样式必须内联在 HTML 中
- 不要引入外部 CSS 文件

---

## 八、构建与部署流程

### 流程概述

```
你提交 .md 文件到 GitHub main 分支
    ↓
🔍 blog-poller（服务器上运行）每 2 分钟检测新 commit
    ↓
检测到新 commit → git pull
    ↓
node scripts/build.js → 读取所有 .md，更新 index.html
    ↓
npx wrangler pages deploy . → 上传到 Cloudflare Pages
    ↓
🌐 博客更新（https://yadongw118.dpdns.org/）
```

### 两条部署路径

| 方式 | 触发条件 | 耗时 |
|------|---------|------|
| **blog-poller**（默认） | git push 到 main 后约 2 分钟内 | ~2-3 min |
| **GitHub Actions** | git push 到 main（后备方案） | ~2-5 min |
| **手动 wrangler** | 服务器上直接运行，用于紧急修复 | ~30 sec |

### build.js 做了什么

1. 读取 `content/posts/*.md` + `posts/*.md`
2. 解析 Front Matter 获取标题/日期/标签/摘要
3. 将正文 Markdown 转为 HTML 或直接注入纯 HTML
4. 按日期降序排列所有文章
5. 注入到 `index.html` 的 `// ===== ARTICLES_START =====` 和 `// ===== ARTICLES_END =====` 之间
6. 写入新的 `index.html`

---

## 九、🚫 踩坑记录（曾经犯过的错）

### 1. 文件位置错 ❌

**错误**：把视频放在 `static/images/cosmos-video.mp4`，引用 `/images/cosmos-video.mp4`
**结果**：Cloudflare 返回 200 但 content-type 是 `text/html`（因为路由到 index.html 了）
**原因**：`static/` 下的文件部署到 Pages 后映射到 `/static/images/`，不是 `/images/`
**正确做法**：放 `images/`（仓库根目录），引用 `/images/xxx`

### 2. 图片放错了路径 ❌

**错误**：图片放在 `images/` 但 Hugo 构建到 `public/images/`，然后 wrangler 从根部署
**结果**：个别用户访问 `/images/xxx` 没问题，因为 `images/` 在根目录

**规则**：所有图片/视频 → `images/`（根目录），所有引用 → `/images/xxx`

### 3. 日期没带时间 ❌

**错误**：`date: "2026-05-19"`（无时间）
**结果**：同一天的多篇文章排序随机
**正确做法**：`date: "2026-05-19T20:41:00+08:00"`

### 4. 文章纯文字无排版 ❌

**错误**：只用 Markdown 写了长篇文章，没有分隔线、高亮框、卡片
**结果**：用户反馈"看起来像作文"、"很单调、没有重点"
**正确做法**：长文必须用 HTML 组件增加视觉节奏

### 5. 硬编码颜色 ❌

**错误**：`style="color: #333; background: white;"`
**结果**：在暗色背景上文字看不见
**原因**：博客是 `#0a0a0f` 深色背景，浅色文字 `var(--tx): #eee`
**正确做法**：永远用 CSS 变量

### 6. tags 格式不对 ❌

**错误**：`tags: "思考, 流媒体, 幸存者偏差"`
**结果**：build.js 只解析 YAML 数组格式，逗号字符串不被识别
**正确做法**：`tags: ["思考", "流媒体", "幸存者偏差"]`

### 7. summary 里中文引号冲突 ❌

**错误**：`summary: "流媒体时代，关于"幸存者视角"的沉思"`
**结果**：Hugo 解析报错 `value is not allowed in this context`
**原因**：中文引号 `"` 和 `"` 在 YAML 字符串内被当作结束引号
**正确做法**：用中文书名号或方括号代替：`「幸存者视角」`

### 8. Hugo 构建时内容含中文引号 ❌

**错误**：同第 7 条，Hugo 的 TOML/YAML 解析器对引号敏感
**正确做法**：在 Front Matter 中避免混用中英文引号

---

## 十、快速检查清单

写完文章后逐项检查：

### Front Matter
- [ ] `title` 不含冲突引号
- [ ] `date` 带时间+时区: `"2026-05-19T20:41:00+08:00"`
- [ ] `tags` 是 YAML 数组: `["a", "b"]`
- [ ] `summary` 不含中文引号

### 文件路径
- [ ] `.md` 文件在 `content/posts/`
- [ ] 图片/视频在 `images/`（根目录）
- [ ] 引用路径以 `/images/` 开头

### 内容排版
- [ ] 长文有"太长不看版"总结
- [ ] 段落用 emoji 或分隔线 `---` 分区
- [ ] 关键句子用 blockquote 或高亮框
- [ ] 硬编码颜色？→ 必须用 CSS 变量
- [ ] 没有裸 `</script>`
- [ ] 没有 `<style>` 标签

### 字体颜色检查（关键！）
- [ ] 正文文字 → `var(--tx)` (#eee)
- [ ] 次要文字 → `var(--tx2)` (#aaa)
- [ ] 注释文字 → `var(--tx3)` (#666)
- [ ] 高亮/链接 → `var(--ac)` (#00e89d)
- [ ] 高亮框背景 → `var(--ac2)` (透明绿)
- [ ] 灰色卡片背景 → `var(--bg3)` / `var(--bg4)`
- [ ] 没有 `#fff`, `white`, `#333`, `#000` 等硬编码值

### 可读性检查
- [ ] 暗色背景上文字能看清
- [ ] 高亮框和背景有足够对比度
- [ ] 视频有 fallback 文字
- [ ] 图片有 alt 说明文字

---

## 附录：文章创建模板

### 纯 Markdown 短文模板

```markdown
---
title: "文章标题"
date: "2026-05-20T10:00:00+08:00"
tags: ["标签1"]
summary: "一句话摘要"
---

## 开头

正文内容...

### 小标题

- 列表项
- 列表项

> 引用

**粗体强调**
```

### 富 HTML 长文模板

```markdown
---
title: "文章标题"
date: "2026-05-20T20:00:00+08:00"
tags: ["思考", "生活"]
summary: "一句话摘要"
---

<div style="background:var(--bg3);border:1px solid var(--bdr2);border-radius:12px;padding:1.5rem;margin:1.5rem 0;">
**📌 太长不看版**
<div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem;margin-top:0.8rem;">
<div style="background:var(--bg4);border-radius:8px;padding:0.8rem;">...卡片1...</div>
<div style="background:var(--bg4);border-radius:8px;padding:0.8rem;">...卡片2...</div>
</div>
</div>

---

## 一、第一部分

正文内容...

> 关键引用

---

## 二、第二部分

<div style="background:linear-gradient(135deg,rgba(0,232,157,0.08),transparent);border:1px solid var(--ac3);border-radius:12px;padding:1.2rem;margin:1rem 0;">
高亮内容
</div>

---
```

---

> **最后提醒**：任何时候不确定颜色/样式，就多看一次上面的 CSS 变量表。暗色主题上硬编码亮色 = 文字消失。
