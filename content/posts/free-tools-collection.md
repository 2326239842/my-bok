---
title: "收藏夹大公开：19 个超实用的免费网站工具"
date: 2026-05-26
tags: ["工具推荐", "免费资源", "效率", "收藏夹"]
summary: "从 PDF 处理到论文下载，从格式转换到 AI 大模型——这 19 个免费网站每个都值得放进书签栏。"
---

<style>
.free-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: .8rem;
  margin: 1.5rem 0;
}
.free-card {
  background: var(--bg3);
  border: 1px solid var(--bdr);
  border-radius: 10px;
  padding: 1rem 1.1rem;
  transition: all .2s;
}
.free-card:hover { border-color: var(--ac); transform: translateY(-2px); }
.free-card-top {
  display: flex;
  align-items: flex-start;
  gap: .6rem;
  margin-bottom: .5rem;
}
.free-icon { font-size: 1.5rem; flex-shrink: 0; margin-top: 2px; }
.free-title {
  font-size: .95rem;
  font-weight: 600;
  color: var(--tx);
  line-height: 1.3;
}
.free-desc {
  font-size: .8rem;
  color: var(--tx2);
  line-height: 1.55;
  margin-bottom: .5rem;
}
.free-link {
  font-size: .72rem;
  color: var(--ac);
  word-break: break-all;
}
.free-link a { color: var(--ac); }
.free-link a:hover { text-decoration: underline; }
.free-tag {
  display: inline-block;
  font-size: .65rem;
  padding: .12rem .45rem;
  border-radius: 999px;
  background: var(--ac2);
  color: var(--ac);
  margin-right: .3rem;
  margin-top: .3rem;
}
.copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: .68rem;
  padding: .15rem .45rem;
  border-radius: 5px;
  border: 1px solid var(--bdr);
  background: transparent;
  color: var(--tx2);
  cursor: pointer;
  margin-top: .35rem;
  transition: all .2s;
  line-height: 1;
}
.copy-btn:hover {
  border-color: var(--ac);
  color: var(--ac);
  background: var(--ac2);
}
.copy-btn.copied {
  border-color: var(--ac);
  color: var(--ac);
  background: var(--ac2);
}
@media(max-width:768px){
  .free-grid { grid-template-columns: 1fr; }
}
</style>

<script>
function copyUrl(url) {
  navigator.clipboard.writeText(url).then(() => {
    document.querySelectorAll('.copy-btn').forEach(btn => {
      if (btn.dataset.url === url) {
        btn.textContent = '✅ 已复制';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '📋 复制';
          btn.classList.remove('copied');
        }, 1500);
      }
    });
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = url;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    document.querySelectorAll('.copy-btn').forEach(btn => {
      if (btn.dataset.url === url) {
        btn.textContent = '✅ 已复制';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = '📋 复制';
          btn.classList.remove('copied');
        }, 1500);
      }
    });
  });
}
</script>

> 整理了一份自己常用的免费工具清单。每一个都亲测可用，放心收藏。部分网站安全性未知已标注，请自行判断。

<div class="free-grid">

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">💻</span>
    <div class="free-title">freeCodeCamp</div>
  </div>
  <div class="free-desc">全球最大的免费编程学习平台，覆盖前端、后端、数据科学、计算机基础等。还支持西班牙语等多语种课程，学完还能拿认证证书。</div>
  <span class="free-tag">编程学习</span><span class="free-tag">免费证书</span>
  <div class="free-link">🔗 <a href="https://www.freecodecamp.org/" target="_blank">freecodecamp.org</a></div>
  <button class="copy-btn" data-url="https://www.freecodecamp.org/" onclick="copyUrl('https://www.freecodecamp.org/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">🎬</span>
    <div class="free-title">影视大全</div>
  </div>
  <div class="free-desc">追剧神器，海量影视资源在线观看。⚠️ 安全性未知，建议搭配广告拦截插件使用，不要输入个人信息。</div>
  <span class="free-tag">影视追剧</span><span class="free-tag">⚠️ 注意安全</span>
  <div class="free-link">🔗 <a href="https://www.yingshidaquantv.com/" target="_blank">yingshidaquantv.com</a></div>
  <button class="copy-btn" data-url="https://www.yingshidaquantv.com/" onclick="copyUrl('https://www.yingshidaquantv.com/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">🛠️</span>
    <div class="free-title">墨轩工具</div>
  </div>
  <div class="free-desc">功能丰富到离谱的工具箱。最大亮点：支持下载网易云音乐歌曲并脱码转成 MP3，下载后本地随便听，不受会员限制。</div>
  <span class="free-tag">音乐下载</span><span class="free-tag">格式转换</span>
  <div class="free-link">🔗 <a href="http://tool.moxuangenet.com/" target="_blank">tool.moxuangenet.com</a></div>
  <button class="copy-btn" data-url="http://tool.moxuangenet.com/" onclick="copyUrl('http://tool.moxuangenet.com/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">📄</span>
    <div class="free-title">Sci-Hub</div>
  </div>
  <div class="free-desc">学术界的"海盗湾"——输入论文 DOI 或标题，免费下载几乎任何付费学术论文。科研党和学生党的续命工具。</div>
  <span class="free-tag">学术论文</span><span class="free-tag">知识自由</span>
  <div class="free-link">🔗 <a href="https://www.sci-hub.in/" target="_blank">sci-hub.in</a></div>
  <button class="copy-btn" data-url="https://www.sci-hub.in/" onclick="copyUrl('https://www.sci-hub.in/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">🔄</span>
    <div class="free-title">FreeConvert</div>
  </div>
  <div class="free-desc">在线万能格式转换器。视频、音频、图片、文档、电子书……几乎所有格式互转都支持，完全免费，数据安全，不用装任何软件。</div>
  <span class="free-tag">格式转换</span><span class="free-tag">在线工具</span>
  <div class="free-link">🔗 <a href="https://www.freeconvert.com/" target="_blank">freeconvert.com</a></div>
  <button class="copy-btn" data-url="https://www.freeconvert.com/" onclick="copyUrl('https://www.freeconvert.com/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">✍️</span>
    <div class="free-title">手写体生成器</div>
  </div>
  <div class="free-desc">把电子文档变成逼真的手写笔迹效果。支持多种字体风格，做笔记、写信、交作业都能用。⚠️ 有免费次数限制。</div>
  <span class="free-tag">文档美化</span><span class="free-tag">免费有限</span>
  <div class="free-link">🔗 <a href="https://www.autohanding.com/" target="_blank">autohanding.com</a></div>
  <button class="copy-btn" data-url="https://www.autohanding.com/" onclick="copyUrl('https://www.autohanding.com/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">👍</span>
    <div class="free-title">赞 · 朋友圈互动生成</div>
  </div>
  <div class="free-desc">免费生成朋友圈点赞、评论、浏览记录等。纯粹好玩的小工具，偶尔整活用得上。</div>
  <span class="free-tag">趣味工具</span>
  <div class="free-link">🔗 <a href="http://zan.liflag.cn/" target="_blank">zan.liflag.cn</a></div>
  <button class="copy-btn" data-url="http://zan.liflag.cn/" onclick="copyUrl('http://zan.liflag.cn/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">🌐</span>
    <div class="free-title">FMHY</div>
  </div>
  <div class="free-desc">全称 Free Media Heck Yeah——全球最大的免费资源集合网站。从软件、影视、音乐到电子书、课程、AI 工具，应有尽有。一个链接打尽全网免费资源。</div>
  <span class="free-tag">资源导航</span><span class="free-tag">⭐ 强烈推荐</span>
  <div class="free-link">🔗 <a href="https://fmhy.net/" target="_blank">fmhy.net</a></div>
  <button class="copy-btn" data-url="https://fmhy.net/" onclick="copyUrl('https://fmhy.net/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">🎨</span>
    <div class="free-title">虚 · 设计软件集合</div>
  </div>
  <div class="free-desc">Adobe 全家桶、Sketch、Figma 等设计软件的免费资源集合站。⚠️ 需要通过第三方网盘下载，速度看运气。</div>
  <span class="free-tag">设计软件</span><span class="free-tag">网盘下载</span>
  <div class="free-link">🔗 <a href="https://www.xu5.cc/" target="_blank">xu5.cc</a></div>
  <button class="copy-btn" data-url="https://www.xu5.cc/" onclick="copyUrl('https://www.xu5.cc/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">🎲</span>
    <div class="free-title">奈斯工具</div>
  </div>
  <div class="free-desc">一个有趣的"百宝箱"——加密解密、二维码生成、emoji 表情、随机数、简繁转换……小工具种类极多，适合探索发现。</div>
  <span class="free-tag">百宝箱</span><span class="free-tag">探索型</span>
  <div class="free-link">🔗 <a href="http://www.nicetool.net/" target="_blank">nicetool.net</a></div>
  <button class="copy-btn" data-url="http://www.nicetool.net/" onclick="copyUrl('http://www.nicetool.net/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">📡</span>
    <div class="free-title">World Monitor</div>
  </div>
  <div class="free-desc">全球实时资讯聚合平台，覆盖各国新闻、热点事件、数据可视化。⚠️ 访问速度偏慢，建议在 Wi-Fi 下打开。</div>
  <span class="free-tag">新闻资讯</span><span class="free-tag">速度偏慢</span>
  <div class="free-link">🔗 <a href="https://world-monitor.com/" target="_blank">world-monitor.com</a></div>
  <button class="copy-btn" data-url="https://world-monitor.com/" onclick="copyUrl('https://world-monitor.com/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">📚</span>
    <div class="free-title">苔丝书库</div>
  </div>
  <div class="free-desc">完全免费的开源电子书搜索引擎，输入书名即可搜索下载。不过如果想找中文书籍，个人更推荐 olib。</div>
  <span class="free-tag">电子书</span><span class="free-tag">开源</span>
  <div class="free-link">🔗 <a href="https://tstrs.me/search" target="_blank">tstrs.me/search</a></div>
  <button class="copy-btn" data-url="https://tstrs.me/search" onclick="copyUrl('https://tstrs.me/search')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">🎥</span>
    <div class="free-title">FogSight</div>
  </div>
  <div class="free-desc">AI 驱动的科普短视频创作工具，输入主题就能自动生成有趣的科普小视频。适合做自媒体、教学演示的朋友，免费又好用。</div>
  <span class="free-tag">AI 视频</span><span class="free-tag">科普创作</span>
  <div class="free-link">🔗 <a href="https://fogsight.ai/app" target="_blank">fogsight.ai/app</a></div>
  <button class="copy-btn" data-url="https://fogsight.ai/app" onclick="copyUrl('https://fogsight.ai/app')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">📑</span>
    <div class="free-title">iLovePDF</div>
  </div>
  <div class="free-desc">最顺手的在线 PDF 工具箱——合并、拆分、压缩、转换、添加页码、水印、签名……几乎覆盖所有 PDF 操作需求，完全免费。</div>
  <span class="free-tag">PDF 工具</span><span class="free-tag">⭐ 每日必用</span>
  <div class="free-link">🔗 <a href="https://www.ilovepdf.com/" target="_blank">ilovepdf.com</a></div>
  <button class="copy-btn" data-url="https://www.ilovepdf.com/" onclick="copyUrl('https://www.ilovepdf.com/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">🤖</span>
    <div class="free-title">OpenRouter</div>
  </div>
  <div class="free-desc">全球最大的 LLM API 聚合平台，一个 API Key 接入 200+ 大模型。GLM-4.5-Air 等免费模型 Token 完全免费用，无需绑卡。GPT、Claude、Gemini、DeepSeek 全有，按量付费，随用随走。</div>
  <span class="free-tag">AI 大模型</span><span class="free-tag">免费 Token</span>
  <span class="free-tag">⭐ 开发者必备</span>
  <div class="free-link">🔗 <a href="https://openrouter.ai/" target="_blank">openrouter.ai</a></div>
  <button class="copy-btn" data-url="https://openrouter.ai/" onclick="copyUrl('https://openrouter.ai/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">🎮</span>
    <div class="free-title">小兔游戏 AI 模拟</div>
  </div>
  <div class="free-desc">AI 角色模拟互动平台，支持韩语爱豆模拟、嫂子模拟等热门角色扮演。沉浸式对话体验，角色性格鲜明，API 对接灵活。</div>
  <span class="free-tag">AI 模拟</span><span class="free-tag">角色扮演</span>
  <span class="free-tag">⭐ 热门</span>
  <div class="free-link">🔗 <a href="https://xiaotuyouxi.cn/" target="_blank">xiaotuyouxi.cn</a></div>
  <button class="copy-btn" data-url="https://xiaotuyouxi.cn/" onclick="copyUrl('https://xiaotuyouxi.cn/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">📝</span>
    <div class="free-title">论文格式自动排版</div>
  </div>
  <div class="free-desc">上传论文自动排版成符合学校模板的 Word 文件。没有论文还能让 AI 根据要求生成正文，选模板输出带水印 PDF 预览，确认后下载无水印 Word。毕业党救星。</div>
  <span class="free-tag">论文排版</span><span class="free-tag">AI 生成</span>
  <span class="free-tag">⭐ 学生必备</span>
  <div class="free-link">🔗 <a href="https://lunwenpaiban.online/" target="_blank">lunwenpaiban.online</a></div>
  <button class="copy-btn" data-url="https://lunwenpaiban.online/" onclick="copyUrl('https://lunwenpaiban.online/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">📋</span>
    <div class="free-title">VitaFlow 简历流</div>
  </div>
  <div class="free-desc">简洁好用的在线简历生成器，支持多种模板和样式，导出排版精美的简历 PDF。界面清爽，操作流畅，适合应届生和求职者快速制作专业简历。</div>
  <span class="free-tag">简历制作</span><span class="free-tag">在线工具</span>
  <span class="free-tag">求职必备</span>
  <div class="free-link">🔗 <a href="https://vita.cgz233.cn/" target="_blank">vita.cgz233.cn</a></div>
  <button class="copy-btn" data-url="https://vita.cgz233.cn/" onclick="copyUrl('https://vita.cgz233.cn/')">📋 复制</button>
</div>

<div class="free-card">
  <div class="free-card-top">
    <span class="free-icon">🏫</span>
    <div class="free-title">小黑课堂题库下载中心</div>
  </div>
  <div class="free-desc">计算机二级/三级考试题库下载，包含 MS Office、WPS、Python、C语言、网络技术等科目，还有四级网络工程师题库。考计算机等级的必备神器。</div>
  <span class="free-tag">考试题库</span><span class="free-tag">计算机等级</span>
  <div class="free-link">🔗 <a href="https://www.xhkts.com/DuiHuanMaWeb/admin/allsofts.htm" target="_blank">xhkts.com</a></div>
  <button class="copy-btn" data-url="https://www.xhkts.com/DuiHuanMaWeb/admin/allsofts.htm" onclick="copyUrl('https://www.xhkts.com/DuiHuanMaWeb/admin/allsofts.htm')">📋 复制</button>
</div>

</div>

---

<div style="background:var(--bg3);border:1px solid var(--bdr2);border-radius:12px;padding:1.2rem 1.5rem;margin:1.5rem 0;text-align:center;">
  <p style="margin:0;color:var(--tx2);font-size:.88rem;line-height:1.8;">
    💡 以上所有网站都是<b>免费使用</b>，个别有次数限制已标注。<br>
    标注 ⚠️ 的网站安全性未经确认，访问时请<b>不要输入个人敏感信息</b>。<br>
    如果有好用的免费工具，欢迎在评论区补充 👇
  </p>
</div>
