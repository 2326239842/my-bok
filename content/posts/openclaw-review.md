---
title: "OpenClaw 使用后感：从踩坑到真香，一个普通人的 AI Agent 之旅"
date: 2026-05-16
draft: false
tags: ["OpenClaw", "AI Agent", "大模型", "DeepSeek", "个人博客", "Cloudflare", "GitHub Pages", "AI 思考"]
categories: ["技术"]
summary: "从第一次满怀期待却铩羽而归，到如今将它作为日常生产力工具——聊聊我与 OpenClaw 的真实故事"
---

<style>
/* ========== 文章自定义样式 ========== */
.oc-review .oc-hero-quote {
    background: linear-gradient(135deg, #fff5f5, #fff0f0);
    border-left: 4px solid #e53935;
    padding: 20px 24px;
    margin: 24px 0;
    border-radius: 0 12px 12px 0;
    font-style: italic;
    color: #555;
    position: relative;
    animation: oc-fadeInRight 0.6s ease-out both;
}
.oc-review .oc-hero-quote::before {
    content: '"';
    position: absolute;
    top: -8px;
    left: 12px;
    font-size: 48px;
    color: #e53935;
    opacity: 0.2;
    font-style: normal;
}

/* 信息卡片 */
.oc-review .oc-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px 28px;
    margin: 24px 0;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    animation: oc-fadeInUp 0.6s ease-out both;
}
.oc-review .oc-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0,0,0,0.12);
}
.oc-review .oc-card.oc-warn { border-top: 3px solid #ff9800; }
.oc-review .oc-card.oc-ok { border-top: 3px solid #4caf50; }
.oc-review .oc-card.oc-info { border-top: 3px solid #2196f3; }
.oc-review .oc-card.oc-danger { border-top: 3px solid #e53935; }
.oc-review .oc-card-title {
    font-weight: 700;
    font-size: 15px;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
}
.oc-review .oc-card.oc-warn .oc-card-title { color: #e65100; }
.oc-review .oc-card.oc-ok .oc-card-title { color: #2e7d32; }
.oc-review .oc-card.oc-info .oc-card-title { color: #1565c0; }
.oc-review .oc-card.oc-danger .oc-card-title { color: #e53935; }
.oc-review .oc-card p { margin-bottom: 8px; }
.oc-review .oc-card p:last-child { margin-bottom: 0; }

/* 统计卡片网格 */
.oc-review .oc-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 16px;
    margin: 24px 0;
}
.oc-review .oc-stat {
    background: #fff;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    transition: transform 0.3s ease;
    animation: oc-fadeInUp 0.6s ease-out both;
}
.oc-review .oc-stat:hover { transform: translateY(-4px); }
.oc-review .oc-stat-num {
    font-size: 28px;
    font-weight: 800;
    color: #e53935;
    line-height: 1.2;
}
.oc-review .oc-stat-label {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
}

/* 时间线 */
.oc-review .oc-timeline {
    position: relative;
    padding-left: 32px;
    margin: 32px 0;
}
.oc-review .oc-timeline::before {
    content: '';
    position: absolute;
    left: 8px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(to bottom, #e53935, #ff8a65);
    border-radius: 2px;
}
.oc-review .oc-tl-item {
    position: relative;
    margin-bottom: 28px;
    animation: oc-fadeInLeft 0.6s ease-out both;
}
.oc-review .oc-tl-item::before {
    content: '';
    position: absolute;
    left: -28px;
    top: 8px;
    width: 12px;
    height: 12px;
    background: #e53935;
    border-radius: 50%;
    border: 3px solid #fff;
    box-shadow: 0 0 0 2px #e53935;
    animation: oc-pulseDot 2s ease-in-out infinite;
}
.oc-review .oc-tl-label {
    font-size: 13px;
    color: #e53935;
    font-weight: 600;
    margin-bottom: 4px;
}

/* 对比表格 */
.oc-review .oc-table-wrap {
    overflow-x: auto;
    margin: 24px 0;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    animation: oc-fadeInUp 0.6s ease-out both;
}
.oc-review table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 14px;
}
.oc-review table th {
    background: linear-gradient(135deg, #e53935, #ff6f60);
    color: #fff;
    padding: 14px 20px;
    text-align: left;
    font-weight: 600;
}
.oc-review table td {
    padding: 12px 20px;
    border-bottom: 1px solid #eee;
}
.oc-review table tr:last-child td { border-bottom: none; }
.oc-review table tr:nth-child(even) { background: #fafafa; }
.oc-review table tr { transition: background 0.3s ease; }
.oc-review table tr:hover td { background: #fff5f5; }

/* 图片容器 */
.oc-review .oc-img {
    margin: 32px 0;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    transition: transform 0.4s ease, box-shadow 0.4s ease;
    animation: oc-fadeInUp 0.8s ease-out both;
}
.oc-review .oc-img:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 24px rgba(0,0,0,0.12);
}
.oc-review .oc-img img {
    width: 100%;
    display: block;
    transition: transform 0.6s ease;
}
.oc-review .oc-img:hover img { transform: scale(1.02); }
.oc-review .oc-img-cap {
    background: #fff;
    padding: 14px 20px;
    font-size: 13px;
    color: #666;
    text-align: center;
    border-top: 1px solid #eee;
}

/* 分隔线 */
.oc-review .oc-divider {
    text-align: center;
    margin: 40px 0;
    position: relative;
}
.oc-review .oc-divider::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
    background: linear-gradient(to right, transparent, #eee, transparent);
}
.oc-review .oc-divider span {
    background: var(--bg, #fafafa);
    padding: 0 20px;
    position: relative;
    font-size: 20px;
    animation: oc-bounce 2s ease-in-out infinite;
}

/* 高亮引用 */
.oc-review .oc-quote {
    background: linear-gradient(135deg, #fff5f5, #fff0f0);
    border-left: 4px solid #e53935;
    padding: 20px 24px;
    margin: 24px 0;
    border-radius: 0 12px 12px 0;
    font-style: italic;
    color: #555;
    position: relative;
    animation: oc-fadeInRight 0.6s ease-out both;
}
.oc-review .oc-quote::before {
    content: '"';
    position: absolute;
    top: -8px;
    left: 12px;
    font-size: 48px;
    color: #e53935;
    opacity: 0.2;
    font-style: normal;
}

/* 内联代码 */
.oc-review code:not(pre code) {
    background: #f0f0f0;
    color: #e53935;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.9em;
}

/* 滚动触发动画 */
.oc-review .oc-anim {
    opacity: 0;
    transform: translateY(40px);
    transition: opacity 0.7s ease, transform 0.7s ease;
}
.oc-review .oc-anim.oc-visible {
    opacity: 1;
    transform: translateY(0);
}

/* ========== 动画关键帧 ========== */
@keyframes oc-fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes oc-fadeInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
}
@keyframes oc-fadeInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
}
@keyframes oc-bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}
@keyframes oc-pulseDot {
    0%, 100% { box-shadow: 0 0 0 2px #e53935; }
    50% { box-shadow: 0 0 0 6px rgba(229, 57, 53, 0.2); }
}
@keyframes oc-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

/* 阅读进度条 */
.oc-progress {
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #e53935, #ff8a65);
    z-index: 10000;
    transition: width 0.1s linear;
    border-radius: 0 2px 2px 0;
}

/* 回到顶部 */
.oc-top-btn {
    position: fixed;
    bottom: 32px;
    right: 32px;
    width: 44px;
    height: 44px;
    background: #e53935;
    color: #fff;
    border: none;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 4px 16px rgba(229, 57, 53, 0.3);
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.3s, transform 0.3s, background 0.3s;
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}
.oc-top-btn.oc-show {
    opacity: 1;
    transform: translateY(0);
}
.oc-top-btn:hover {
    background: #ff6f60;
    transform: translateY(-2px);
}

/* 响应式 */
@media (max-width: 640px) {
    .oc-review .oc-stats {
        grid-template-columns: repeat(2, 1fr);
    }
    .oc-review table th, .oc-review table td {
        padding: 10px 12px;
        font-size: 13px;
    }
}
</style>

<!-- 阅读进度条 -->
<div class="oc-progress" id="ocProgress"></div>
<!-- 回到顶部 -->
<button class="oc-top-btn" id="ocTopBtn" onclick="window.scrollTo({top:0,behavior:'smooth'})">↑</button>

<div class="oc-review">

<div class="oc-hero-quote oc-anim">
如果说 2024 年是 AI 大模型的元年，那么 2026 年就是 AI Agent 真正走入普通人生活的拐点。作为一名技术小白，我想聊聊我与 OpenClaw 的故事——从第一次满怀期待却铩羽而归，到如今将它作为日常生产力工具的真实体验。
</div>

## 🚀 一、初识 OpenClaw：满怀期待的第一次

<p class="oc-anim">时间回到去年，OpenClaw 刚刚发布的时候，我在社交平台上刷到了它的介绍——一个可以完全自主执行任务的 AI Agent，能写代码、管理文件、操作浏览器……这些描述对于一个对技术充满好奇但又毫无基础的人来说，简直是致命的吸引力。</p>

<p class="oc-anim">我第一时间就去下载了。然而，现实很快给了我当头一棒。</p>

<div class="oc-card oc-warn oc-anim">
<div class="oc-card-title">⚠️ 当时的困境</div>
<p>安装教程寥寥无几，而且 OpenClaw 优先适配的是 macOS 和 Linux 系统。作为一个 Windows 用户，我几乎找不到针对自己系统的详细指引。网上的教程大多一笔带过，仿佛 Windows 用户不配使用一样。</p>
</div>

## 🔧 二、Windows 上的艰难安装之路

<p class="oc-anim">第一次安装的时候，我连命令行都输错了——是的，作为一个纯小白，我对终端的认知还停留在电影里黑客敲键盘的画面。通读文档之后我才明白，在 Windows 上使用 OpenClaw，需要先安装两个关键依赖：</p>

<div class="oc-stats oc-anim">
<div class="oc-stat">
<div class="oc-stat-num">Node.js</div>
<div class="oc-stat-label">JavaScript 运行时环境<br>OpenClaw 的核心依赖</div>
</div>
<div class="oc-stat">
<div class="oc-stat-num">Git</div>
<div class="oc-stat-label">版本控制系统<br>用于拉取和更新代码</div>
</div>
</div>

<p class="oc-anim">Node.js 是 OpenClaw 运行的核心环境，而 Git 则是版本控制工具，两者缺一不可。安装好这两个依赖之后，还需要在 PowerShell 中解除脚本执行限制：</p>

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

<p class="oc-anim">然后运行一键安装脚本：</p>

```powershell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

<p class="oc-anim">当终端里终于出现安装成功的提示时，我几乎要从椅子上跳起来。但兴奋还没持续多久，新的问题就来了——</p>

<div class="oc-card oc-danger oc-anim">
<div class="oc-card-title">🚫 初始化配置缺失</div>
<p>安装完成后，并没有出现教程里提到的初始化配置向导。后来我才了解到，这是因为 Windows 的适配问题，需要手动启动 Gateway 服务后才能进行配置。</p>
</div>

## ⚙️ 三、第一次配置：手忙脚乱中摸索

<p class="oc-anim">找到更详细的教程后，我按照步骤依次执行了以下命令：</p>

```bash
# 1. 先运行健康检查（推荐第一步执行）
openclaw doctor

# 2. 启动 Gateway 网关服务
openclaw gateway start

# 3. 执行初始化配置
openclaw onboard
```

<div class="oc-timeline oc-anim">
<div class="oc-tl-item">
<div class="oc-tl-label">第一步：openclaw doctor</div>
<p>第一次运行时甚至报错说没有安装相关服务组件。Windows 的兼容性问题开始显现——很多在 macOS 和 Linux 上默认就有的东西，在 Windows 上需要手动处理。</p>
</div>
<div class="oc-tl-item">
<div class="oc-tl-label">第二步：openclaw gateway start</div>
<p>成功启动了 Gateway 服务。这个服务是 OpenClaw 的核心运行时，相当于控制入口和路由层，所有的会话、渠道和工具都通过它来连接。</p>
</div>
<div class="oc-tl-item">
<div class="oc-tl-label">第三步：openclaw onboard</div>
<p>终于进入了配置向导！第一次配置时很多地方都出错了，不过好在后来在网上找到了详细的教学视频，跟着一步步操作，最终顺利完成了配置。</p>
</div>
</div>

<p class="oc-anim">第一次使用时，我没有配置付费 API，而是选择了阿里云百炼平台的免费 Token。每个模型赠送了 100 万 Token 的免费额度，对于初次体验来说足够了。</p>

<div class="oc-img oc-anim">
<img src="/images/阿里云百炼大模型.png" alt="阿里云百炼大模型平台">
<div class="oc-img-cap">🖼️ 阿里云百炼大模型平台 —— 提供 155 个模型的免费额度，每个模型 100 万 Token</div>
</div>

<div class="oc-card oc-warn oc-anim">
<div class="oc-card-title">💡 浏览器界面打不开？</div>
<p>当我选择使用 UI（浏览器界面）时，页面显示"无法连接"。排查了很久才发现——我把 <code>openclaw gateway start</code> 的服务窗口给关了！Gateway 服务必须保持运行状态，浏览器界面才能正常访问。这个低级错误让我哭笑不得。</p>
</div>

## 💸 四、免费 Token 的甜蜜与苦涩

<p class="oc-anim">配置完成后，我迫不及待地开始体验。让 OpenClaw 整理文件、从网上爬取图片（效果嘛……全是免费小图片，质量一般），但确实挺方便的。</p>

<p class="oc-anim">然而甜蜜期很快就结束了——免费模型的 Token 开始限速了。每分钟只能处理很少的请求，做稍微复杂一点的任务就要等很久。</p>

<div class="oc-img oc-anim">
<img src="/images/小米百亿toekn计划.png" alt="小米百亿Token计划">
<div class="oc-img-cap">🖼️ 小米 MiMo 百亿 Token 计划 —— Standard 月度套餐提供 2 亿 Credits，支持 OpenClaw 等主流编程工具</div>
</div>

<p class="oc-anim">我试着自己配置 Token，但作为第一次使用的纯小白，我连 Token 配置在哪里都不知道。好在阿里云平台给每个模型都提供了 100 万的免费额度，我就用免费额度让 OpenClaw 自己帮我配置 Token——没错，用 AI 来配置 AI，这操作我自己都觉得离谱。</p>

<div class="oc-quote oc-anim">
坏处也很明显：每个模型只有 100 万 Token，很快就用完了。这点额度只够聊聊天、做做简单任务，完全无法支撑长任务的执行。于是，第一次的 OpenClaw 体验就这样不了了之，我最终选择了卸载。
</div>

<div class="oc-divider oc-anim"><span>🌊</span></div>

## 🔄 五、再次归来：大模型时代的必然选择

<p class="oc-anim">第二次开始使用 OpenClaw 是最近这段时间。短短一年间，AI 的发展速度远超我的想象。</p>

<p class="oc-anim">之前最大的痛点是<strong>AI 模型不够聪明</strong>和<strong>上下文对话量不够</strong>。但如今，新一代大模型已经彻底改变了这个局面：</p>

<div class="oc-table-wrap oc-anim">
<table>
<thead>
<tr>
<th>模型</th>
<th>厂商</th>
<th>核心优势</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>GPT-5.5</strong></td>
<td>OpenAI</td>
<td>综合能力之王，逻辑推理全面领先</td>
</tr>
<tr>
<td><strong>Claude Opus 4.6</strong></td>
<td>Anthropic</td>
<td>代码工程能力 SWE-bench 80.8%</td>
</tr>
<tr>
<td><strong>Gemini 3.1 Pro</strong></td>
<td>Google</td>
<td>多模态与搜索整合，长上下文处理</td>
</tr>
<tr>
<td><strong>DeepSeek V4</strong></td>
<td>深度求索</td>
<td>国产性价比之王，百万 Token 仅 0.02 元</td>
</tr>
<tr>
<td><strong>Grok 4</strong></td>
<td>xAI</td>
<td>实时信息获取与联网能力</td>
</tr>
<tr>
<td><strong>通义千问 Qwen3</strong></td>
<td>阿里云</td>
<td>中文理解能力出色，生态完善</td>
</tr>
<tr>
<td><strong>MiMo V2.5</strong></td>
<td>小米</td>
<td>高性价比 Token Plan，编程助手友好</td>
</tr>
</tbody>
</table>
</div>

<p class="oc-anim">尤其是 <strong>DeepSeek</strong>，它的定价策略堪称"价格屠夫"——V4-Flash 版本缓存命中场景下，百万 Token 低至 <strong>0.02 元</strong>，一亿 Token 才两块钱左右。这种极致性价比，完美适配了 AI Agent 的发展需求。</p>

<div class="oc-card oc-ok oc-anim">
<div class="oc-card-title">✅ 价格对比感受</div>
<p>以前用免费 Token，100 万很快就用完了，而且还会限速。现在用 DeepSeek，同样的价格可以买到几百倍的 Token 量，再也不用小心翼翼地"省着用"了。这才是 Agent 能够真正跑起来的基础设施。</p>
</div>

## 🌐 六、实战体验：从零搭建个人网站

<p class="oc-anim">就我个人使用 OpenClaw 的体验而言，最直观的感受就是——<strong>它真的能打破知识壁垒</strong>。</p>

<p class="oc-anim">比如我对于网站搭建是一窍不通的。DNS 解析、前端代码、GitHub 部署、Cloudflare 配置……这些名词对我来说就像是外星语言。但是有了 OpenClaw，我只需要告诉它"我需要搭建一个个人网站"，它就会帮我处理几乎所有的事情：</p>

<div class="oc-timeline oc-anim">
<div class="oc-tl-item">
<div class="oc-tl-label">📋 需求沟通</div>
<p>告诉 OpenClaw 我想要一个什么样的网站，包括页面设计、功能需求等</p>
</div>
<div class="oc-tl-item">
<div class="oc-tl-label">🎨 前端开发</div>
<p>OpenClaw 自动生成 HTML/CSS/JavaScript 代码，包括 3D 樱花浮岛、粒子效果等复杂交互</p>
</div>
<div class="oc-tl-item">
<div class="oc-tl-label">🌐 DNS 配置</div>
<p>帮我解决域名解析和 Cloudflare 上的 DNS 设置</p>
</div>
<div class="oc-tl-item">
<div class="oc-tl-label">🚀 GitHub 部署</div>
<p>通过 GitHub 仓库直接上传代码，配置 Cloudflare Pages 自动部署</p>
</div>
<div class="oc-tl-item">
<div class="oc-tl-label">✅ 上线运行</div>
<p>网站成功上线，包括个人介绍站和博客站</p>
</div>
</div>

<div class="oc-img oc-anim">
<img src="/images/openclaw实际使用.png" alt="OpenClaw 实际使用截图">
<div class="oc-img-cap">🖼️ OpenClaw 实际使用截图 —— 告诉它需求，它就帮你搞定一切，包括 3D 樱花浮岛、粒子花瓣飘落等复杂效果</div>
</div>

<div class="oc-img oc-anim">
<img src="/images/cloudflare主页配置网站 图.png" alt="Cloudflare 配置截图">
<div class="oc-img-cap">🖼️ Cloudflare 控制台 —— 网站部署后的管理界面，可以看到域名、Workers 和流量数据</div>
</div>

<div class="oc-img oc-anim">
<img src="/images/GitHub项目布置.png" alt="GitHub 项目截图">
<div class="oc-img-cap">🖼️ GitHub 仓库 —— 通过 OpenClaw 直接管理代码仓库，实现网站的版本控制和部署</div>
</div>

<p class="oc-anim">全程我只需要少量的知识基础就可以做到。很多东西——页面设计、代码编写、文件上传——OpenClaw 都可以很完美地实现。虽然有些时候结果不够完美，需要进行精雕细琢，但<strong>三四天时间就可以完成网站的搭建、运行和各种数据库配置</strong>。</p>

<p class="oc-anim">对于一个普通人而言，这在以前是无法想象的。</p>

## 📊 七、客观评价：打破知识壁垒的利器

<p class="oc-anim">使用 OpenClaw 期间，我查看了它的使用数据：</p>

<div class="oc-img oc-anim">
<img src="/images/openclaw使用记录.png" alt="OpenClaw 使用统计">
<div class="oc-img-cap">🖼️ OpenClaw 使用统计 —— 317 条消息，14.1M Token 消耗，202 次工具调用，缓存命中率 97.6%</div>
</div>

<div class="oc-stats oc-anim">
<div class="oc-stat">
<div class="oc-stat-num">317</div>
<div class="oc-stat-label">消息总数</div>
</div>
<div class="oc-stat">
<div class="oc-stat-num">14.1M</div>
<div class="oc-stat-label">Token 消耗</div>
</div>
<div class="oc-stat">
<div class="oc-stat-num">202</div>
<div class="oc-stat-label">工具调用次数</div>
</div>
<div class="oc-stat">
<div class="oc-stat-num">97.6%</div>
<div class="oc-stat-label">缓存命中率</div>
</div>
</div>

<p class="oc-anim">这些数据背后，是我从一个完全不懂网站搭建的小白，到拥有两个运行中的网站的过程。OpenClaw 调用了 140 次 <code>exec</code>（命令执行）、38 次 <code>process</code>（进程管理）、7 次 <code>write</code>（文件写入）和 7 次 <code>edit</code>（文件编辑）——这些原本需要我手动完成的操作，全部由 AI Agent 自动执行了。</p>

<div class="oc-quote oc-anim">
大模型加持下的全自动工程，最主要的优点是可以<strong>打破知识壁垒，加速普通人对于新事物的学习和使用</strong>。你不需要成为程序员才能搭建网站，不需要成为设计师才能做出漂亮的页面。AI Agent 让"想法"到"实现"之间的距离，缩短到了前所未有的程度。
</div>

## 🤔 八、大模型的问题与冲击

<p class="oc-anim">但每一次技术革命都伴随着阵痛。大模型的到来，我想百分之八十的人都没有做好准备。</p>

### 劳动方式的转变：从打工人到审核员

<p class="oc-anim">这几天搭建网站的过程中，我的工作模式变成了这样：把需求告诉 OpenClaw → 喝着水刷着抖音等待完成 → 检查结果 → 提出修改意见 → 再次等待。</p>

<p class="oc-anim">这种劳动方式，更像是从一个<strong>"打工人"</strong>变成了一个<strong>"审核员"</strong>。AI 的工作效率毋庸置疑——一个 AI 加一个人，就能做一个团队的活。</p>

<div class="oc-card oc-danger oc-anim">
<div class="oc-card-title">🔴 不可避免的冲击</div>
<p>像设计、编程、内容创作等职业，绝对会面临巨大的市场冲击。尤其是那些以机械重复为主的工作岗位，会被 AI 优先替代。这不是危言耸听，而是正在发生的现实。</p>
</div>

### 大模型能替代人类吗？

<p class="oc-anim">我的答案是：<strong>部分能，但不能全部</strong>。</p>

<p class="oc-anim">大模型终究只是按部就班的机器，程序是死的。就算学习能力再强，它也无法承担责任。因此，<strong>越依赖经验、越需要承担责任的行业，被替代率越低</strong>。</p>

<div class="oc-table-wrap oc-anim">
<table>
<thead>
<tr>
<th>类别</th>
<th>被替代风险</th>
<th>原因</th>
</tr>
</thead>
<tbody>
<tr>
<td>机械重复型工作</td>
<td style="color: #e53935; font-weight: 700;">极高 🔴</td>
<td>AI 擅长模式化和标准化任务</td>
</tr>
<tr>
<td>设计 / 编程 / 内容创作</td>
<td style="color: #ff9800; font-weight: 700;">较高 🟠</td>
<td>AI 效率远超个人，但顶级创意仍需人类</td>
</tr>
<tr>
<td>需要承担责任的工作</td>
<td style="color: #4caf50; font-weight: 700;">较低 🟢</td>
<td>法律、医疗决策等需要人类担责</td>
</tr>
<tr>
<td>依赖深度经验的工作</td>
<td style="color: #4caf50; font-weight: 700;">很低 🟢</td>
<td>复杂判断和人际互动难以被替代</td>
</tr>
</tbody>
</table>
</div>

### 失业问题的本质

<p class="oc-anim">未来的 AI 是"提出建议和执行建议的行为人"，而我们则是"审核员"和"对 AI 的监督员"。是的，很多岗位会被替代，失业人口会增加，生产力会极速提高。</p>

<p class="oc-anim">但我认为，失业的主要原因<strong>不是大模型在代替人类</strong>，而是<strong>生产力和需求的长期不平衡</strong>——需求少于生产力引起的结构性失业。</p>

<div class="oc-quote oc-anim">
解决 AI 和人类就业问题的最主要方式，不是阻止 AI 发展，而是<strong>增加需求、扩大消费</strong>，确保经济可以内外循环，让经济具备弹性。当生产力极大提升时，我们需要新的需求增长点来吸纳这些生产力。
</div>

<p class="oc-anim">不过这个问题在最近一段时间不必过度关心。目前的需求和算力资源都是富余的，大模型也没有大规模入场。大模型对于普通生产生活还需要一段时间的适配期。</p>

<div class="oc-divider oc-anim"><span>✨</span></div>

## 🌟 九、写在最后：未来已来

<p class="oc-anim">回顾我使用 OpenClaw 的这段经历，从第一次的满怀期待却铩羽而归，到如今的得心应手，我深刻感受到了 AI 技术的飞速进步。</p>

<p class="oc-anim">以前，搭建一个网站需要学习 HTML、CSS、JavaScript，需要了解服务器配置、域名解析、DNS 设置……现在，你只需要会"说话"就行。</p>

<p class="oc-anim">未来已来，大模型必将成为生产发展中不可或缺的力量。与其恐惧被替代，不如学会与 AI 协作，成为那个"审核员"和"监督员"。毕竟，<strong>淘汰你的不是 AI，而是会用 AI 的人</strong>。</p>

<div class="oc-card oc-info oc-anim">
<div class="oc-card-title">💡 写在最后的话</div>
<p>这篇文章本身就是我用 OpenClaw 辅助完成的。从内容梳理到排版优化，AI 帮了我很多忙。但最终的观点、感受和判断，都是我自己的。这或许就是未来人机协作的最佳模式——AI 负责执行，人类负责思考和决策。</p>
</div>

</div>

<script>
// 阅读进度条 + 回到顶部
(function(){
    var prog = document.getElementById('ocProgress');
    var btn = document.getElementById('ocTopBtn');
    if(!prog || !btn) return;
    window.addEventListener('scroll', function(){
        var st = document.documentElement.scrollTop || document.body.scrollTop;
        var sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        prog.style.width = (st/sh*100)+'%';
        if(st > 400) btn.classList.add('oc-show');
        else btn.classList.remove('oc-show');
    });
})();

// 滚动触发动画
(function(){
    var items = document.querySelectorAll('.oc-anim');
    if(!items.length) return;
    var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
            if(e.isIntersecting){
                e.target.classList.add('oc-visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    items.forEach(function(el){ obs.observe(el); });
})();
</script>
