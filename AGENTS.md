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
CLOUDFLARE_API_TOKEN='your-token-here' / \
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

## 详见
完整交接文档在 `C:\Users\wang\Desktop\yadong-site\AGENTS.md`
