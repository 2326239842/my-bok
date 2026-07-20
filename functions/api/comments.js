// Pages Functions — 评论系统 + 管理员操作
// Token-based auth: 登录后获取 HMAC 签名 token，后续操作使用 token 认证

const ADMIN_PW = "wyd73199254110";
const TOKEN_SECRET = "blog-admin-2026-" + ADMIN_PW.slice(-6); // HMAC 签名密钥
const TOKEN_TTL = 86400000; // 24小时有效期

// 简单的 HMAC-SHA256 实现（Cloudflare Pages Functions 支持 crypto.subtle）
async function hmacSign(message, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/[+/=]/g, c => c === '+' ? '-' : c === '/' ? '_' : '');
}

async function verifyToken(token) {
  if (!token) return false;
  const parts = token.split(':');
  if (parts.length !== 2) return false;
  const [sig, ts] = parts;
  const timestamp = parseInt(ts);
  if (isNaN(timestamp)) return false;
  if (Date.now() - timestamp > TOKEN_TTL) return false; // 过期
  const expectedSig = await hmacSign(ts, TOKEN_SECRET);
  return sig === expectedSig;
}

export async function onRequest(context) {
  const { request, env } = context;
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const url = new URL(request.url);

  // GET /api/comments?slug=xxx — 获取评论
  if (request.method === 'GET') {
    const slug = url.searchParams.get('slug');
    if (!slug) return Response.json({ error: '缺少 slug' }, { status: 400, headers: CORS });
    const data = await env.KV.get(`comments:${slug}`, 'json');
    return Response.json({ ok: true, comments: data || [] }, { headers: CORS });
  }

  // POST /api/comments
  if (request.method === 'POST') {
    const body = await request.json();

    // 统一的认证检查函数
    const isAdmin = () => {
      if (body.password && body.password === ADMIN_PW) return true;
      if (body.token) return verifyToken(body.token);
      return false;
    };

    // 删除评论（管理员）
    if (body._action === 'delete') {
      if (!(await isAdmin())) return Response.json({ error: '未授权' }, { status: 403, headers: CORS });
      const key = `comments:${body.slug}`;
      let comments = await env.KV.get(key, 'json') || [];
      comments = comments.filter(c => c.id !== body.id);
      await env.KV.put(key, JSON.stringify(comments));
      return Response.json({ ok: true }, { headers: CORS });
    }

    // 验证管理员 + 返回 token
    if (body._action === 'verify') {
      if (body.password !== ADMIN_PW) return Response.json({ ok: false }, { headers: CORS });
      const ts = String(Date.now());
      const sig = await hmacSign(ts, TOKEN_SECRET);
      return Response.json({ ok: true, token: `${sig}:${ts}` }, { headers: CORS });
    }

    // 删除整篇文章（管理员）
    if (body._action === 'delete_article') {
      if (!(await isAdmin())) return Response.json({ error: '未授权' }, { status: 403, headers: CORS });
      const deleted = await env.KV.get('deleted_articles', 'json') || [];
      if (!deleted.includes(body.title)) {
        deleted.push(body.title);
        await env.KV.put('deleted_articles', JSON.stringify(deleted));
      }
      return Response.json({ ok: true }, { headers: CORS });
    }

    // 恢复文章（管理员）
    if (body._action === 'restore_article') {
      if (!(await isAdmin())) return Response.json({ error: '未授权' }, { status: 403, headers: CORS });
      let deleted = await env.KV.get('deleted_articles', 'json') || [];
      deleted = deleted.filter(t => t !== body.title);
      await env.KV.put('deleted_articles', JSON.stringify(deleted));
      return Response.json({ ok: true }, { headers: CORS });
    }

    // 获取已删除列表（管理员）
    if (body._action === 'get_deleted') {
      if (!(await isAdmin())) return Response.json({ error: '未授权' }, { status: 403, headers: CORS });
      const deleted = await env.KV.get('deleted_articles', 'json') || [];
      return Response.json({ ok: true, deleted }, { headers: CORS });
    }

    // 隐藏文章（管理员）
    if (body._action === 'hide_article') {
      if (!(await isAdmin())) return Response.json({ error: '未授权' }, { status: 403, headers: CORS });
      const hidden = await env.KV.get('hidden_articles', 'json') || [];
      if (!hidden.includes(body.title)) {
        hidden.push(body.title);
        await env.KV.put('hidden_articles', JSON.stringify(hidden));
      }
      return Response.json({ ok: true, hidden }, { headers: CORS });
    }

    // 取消隐藏文章（管理员）
    if (body._action === 'unhide_article') {
      if (!(await isAdmin())) return Response.json({ error: '未授权' }, { status: 403, headers: CORS });
      let hidden = await env.KV.get('hidden_articles', 'json') || [];
      hidden = hidden.filter(t => t !== body.title);
      await env.KV.put('hidden_articles', JSON.stringify(hidden));
      return Response.json({ ok: true, hidden }, { headers: CORS });
    }

    // 获取隐藏列表（公开，前端用来过滤）
    if (body._action === 'get_hidden') {
      const hidden = await env.KV.get('hidden_articles', 'json') || [];
      return Response.json({ ok: true, hidden }, { headers: CORS });
    }

    // 获取置顶列表（公开）
    if (body._action === 'get_pinned') {
      const pinned = await env.KV.get('pinned_articles', 'json') || [];
      return Response.json({ ok: true, pinned }, { headers: CORS });
    }

    // 批量获取所有文章评论数（公开）
    if (body._action === 'comment_counts') {
      const list = await env.KV.list({ prefix: 'comments:' });
      const counts = {};
      for (const key of list.keys) {
        const slug = key.name.replace('comments:', '');
        const value = await env.KV.get(key.name, 'json');
        if (value) counts[slug] = value.length;
        else counts[slug] = 0;
      }
      return Response.json({ ok: true, counts }, { headers: CORS });
    }

    // 文章编辑保存（管理员）
    if (body._action === 'article_edit_save') {
      if (!(await isAdmin())) return Response.json({ error: '未授权' }, { status: 403, headers: CORS });
      if (!body.title || body.content === undefined) return Response.json({ error: '缺少参数' }, { status: 400, headers: CORS });
      const edit = { title: body.title, content: body.content, updatedAt: new Date().toISOString() };
      await env.KV.put(`article_edit:${body.title}`, JSON.stringify(edit));
      return Response.json({ ok: true, edit }, { headers: CORS });
    }

    // 获取所有文章编辑列表（管理员）
    if (body._action === 'article_edits_list') {
      if (!(await isAdmin())) return Response.json({ error: '未授权' }, { status: 403, headers: CORS });
      const list = await env.KV.list({ prefix: 'article_edit:' });
      const edits = [];
      for (const key of list.keys) {
        const value = await env.KV.get(key.name, 'json');
        if (value) edits.push(value);
      }
      return Response.json({ ok: true, edits }, { headers: CORS });
    }

    // 切换置顶（管理员）
    if (body._action === 'toggle_pin') {
      if (!(await isAdmin())) return Response.json({ error: '未授权' }, { status: 403, headers: CORS });
      let pinned = await env.KV.get('pinned_articles', 'json') || [];
      const idx = pinned.indexOf(body.title);
      if (idx >= 0) {
        pinned.splice(idx, 1);
      } else {
        pinned.push(body.title);
      }
      await env.KV.put('pinned_articles', JSON.stringify(pinned));
      return Response.json({ ok: true, pinned }, { headers: CORS });
    }

    // ===== 点赞系统（公开） =====
    if (body._action === 'get_like') {
      const slug = body.slug;
      if (!slug) return Response.json({ error: '缺少 slug' }, { status: 400, headers: CORS });
      const count = parseInt(await env.KV.get(`likes:${slug}`) || '0');
      return Response.json({ ok: true, count }, { headers: CORS });
    }

    if (body._action === 'get_all_likes') {
      const list = await env.KV.list({ prefix: 'likes:' });
      const likes = {};
      for (const key of list.keys) {
        const slug = key.name.replace('likes:', '');
        likes[slug] = parseInt(await env.KV.get(key.name) || '0');
      }
      return Response.json({ ok: true, likes }, { headers: CORS });
    }

    if (body._action === 'like') {
      const slug = body.slug;
      if (!slug) return Response.json({ error: '缺少 slug' }, { status: 400, headers: CORS });
      const key = `likes:${slug}`;
      let count = parseInt(await env.KV.get(key) || '0');
      if (count < 100000) {
        count++;
        await env.KV.put(key, String(count));
      }
      return Response.json({ ok: true, count }, { headers: CORS });
    }

    if (body._action === 'unlike') {
      const slug = body.slug;
      if (!slug) return Response.json({ error: '缺少 slug' }, { status: 400, headers: CORS });
      const key = `likes:${slug}`;
      let count = parseInt(await env.KV.get(key) || '0');
      if (count > 0) {
        count--;
        await env.KV.put(key, String(count));
      }
      return Response.json({ ok: true, count }, { headers: CORS });
    }

    // 普通发表评论
    const { slug, name, content } = body;
    if (!slug || !content) return Response.json({ error: '缺少内容' }, { status: 400, headers: CORS });

    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const comment = {
      id, slug,
      name: (name || '匿名').slice(0, 20),
      content: content.slice(0, 2000),
      time: new Date().toISOString(),
    };

    const key = `comments:${slug}`;
    const existing = await env.KV.get(key, 'json') || [];
    existing.push(comment);
    await env.KV.put(key, JSON.stringify(existing));

    return Response.json({ ok: true, comment }, { headers: CORS });
  }

  return Response.json({ error: 'not found' }, { status: 404, headers: CORS });
}
