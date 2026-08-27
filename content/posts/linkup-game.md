---
title: "头像连连看——朋友局小游戏"
date: 2026-08-05
collection: "网页交互"
draft: false
tags: ["游戏", "JavaScript", "连连看", "前端", "互动"]
categories: ["项目"]
summary: "用朋友头像做的连连看，打开文章就能玩"
---

点两个相同的头像，能用不超过 3 条直线连起来就能消除，全部消完即通关。手机电脑都能玩。

<iframe src="/linkup/" width="100%" height="720" frameborder="0" scrolling="no" style="border:1px solid var(--bdr);border-radius:14px;width:100%;max-width:760px;margin:0 auto;display:block;background:#1a1428"></iframe>

<details style="margin-top:1rem">
<summary style="cursor:pointer;color:var(--tx2);font-size:.85rem">玩法说明</summary>

- 8×7 网格，56 个头像，7 种各 8 个，无时间限制
- 💡 提示（5 次）、🔀 重排（3 次）、🔄 重开
- 2.5 秒内连续消除触发 **COMBO** 连击加分
- 每种头像最后消除时弹出**专属告别语**
- 场上无可消除组合时自动重排

</details>

---

参考 [gd4Ark/linkup](https://github.com/gd4Ark/linkup) 用原生 JS 实现，核心是路径判断（直连 → 一次拐角 → 两次拐角）和死锁检测。游戏独立放在 `linkup/` 目录，文章通过 iframe 嵌入，互不干扰。
