# Yadong Blog - Codex 项目说明

## 项目信息
- **域名**：yadongw118.dpdns.org
- **部署**：Cloudflare Pages（blog-poller 自动部署）
- **构建**：`node scripts/build.js`（不是 Hugo）
- **GitHub**：github.com/2326239842/my-bok

## 快速操作

### 写文章
1. 创建 `content/posts/xxx.md`（含 frontmatter）
2. 图片放 `images/`（⚠️ 不是 static/images/）
3. `node scripts/build.js`
4. `git add -A && git commit -m "feat: xxx" && git push`

### 手动部署
```bash
cd ~/workspace/yadong-blog
git pull origin main && node scripts/build.js
CLOUDFLARE_API_TOKEN='***'
  npx wrangler pages deploy . --project-name=yadong-blog --branch main --commit-dirty=true
```

### 验证
```bash
curl -sS --max-time 10 -o /dev/null -w "%{http_code}" https://yadongw118.dpdns.org
```

## API
- 评论/点赞/管理：`functions/api/comments.js`（Pages Function）
- 管理员密码：`wyd73199254110`
- **⚠️ 改 API 改 Pages Function，不是 Worker**

## 关键规则
1. 图片放 `images/` 目录
2. `_headers` 不用 `/*` catch-all
3. 部署后必须验证网站可访问
4. 日期格式 `YYYY-MM-DD`
5. commit message 不含 emoji
6. 返回按钮用 `history.back()`
7. articles-content.json 用标题做 key
8. 不要在调查中循环（确认服务端正常后直接给方案）
9. **⚠️ HTML 实体转义**：文章正文中的 `&` 必须写成 `&amp;`（包括代码块内的 `R&B`、`Mail & Calendar`、`R&D` 等）。桌面 WebView2 会自动修正，但 Android System WebView 会中断 innerHTML 解析 → 手机端文章显示"加载失败"。构建后用 `python3 -c "import re,json; data=json.load(open('articles-content.json')); [print(f'❌ {t}') for t,c in data.items() if re.findall(r'&(?!(?:amp|lt|gt|quot|apos|#[0-9]+|#x[0-9a-fA-F]+);)', c)]"` 验证无未转义字符

## 详见
完整交接文档在 `C:\Users\wang\Desktop\yadong-site\AGENTS.md`
