---
title: "用 OpenClaw 搭建双站的一天"
date: 2026-05-16
tags: OpenClaw,Three.js,Cloudflare
summary: "从零搭建个人介绍站和博客站，包含 3D 樱花浮岛、匿名评论系统的完整过程。"
---

## 今天做了什么
一个下午 + 晚上，用 OpenClaw 从零搭建了两个网站。

## 个人介绍站：3D 樱花浮岛
- Three.js 低多边形浮岛- 点击树枝花瓣爆发 + 对白气泡- 月亮月相变化 + 音乐播放器- 深浅色模式 + 响应式适配
## 博客站：匿名评论系统
使用 Cloudflare Workers + KV 自建评论系统，完全匿名，任何人可评论。

```
// 评论 API\nPOST /api/comments\n{ slug, name, content }
```

> 这证明了一件事：有了 AI Agent，一个人也能做出看起来很专业的网站。
