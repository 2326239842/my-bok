# Yadong's Blog

纯静态个人博客，零依赖，单文件部署。

## 技术栈

- HTML5 + CSS3 + 原生 JavaScript
- 零 npm 依赖
- Cloudflare Pages 部署

## 本地预览

```bash
# 直接用浏览器打开
open index.html

# 或用简单 HTTP 服务
npx serve .
```

## 写新文章

在 `posts/` 目录下新建 `.md` 文件：

```markdown
---
title: 文章标题
date: 2026-05-20
tags: 技术,前端
summary: 文章摘要
---

正文内容...

```code block```
```

## 构建

```bash
node scripts/build.js
```

## 部署

推送到 GitHub，GitHub Actions 自动构建并部署到 Cloudflare Pages。

需要在 GitHub Secrets 中设置 `CLOUDFLARE_API_TOKEN`。

## 项目结构

```
├── index.html          # 博客主页面
├── posts/              # Markdown 文章
├── images/             # 图片资源
├── audio/              # 音频文件
├── scripts/
│   └── build.js        # 构建脚本
├── .github/
│   └── workflows/
│       └── deploy.yml  # 自动部署
└── README.md
```
