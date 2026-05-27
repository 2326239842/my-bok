// Pages Functions — 评论系统 + 管理员删除
// 管理员密码: wyd73199254110

const ADMIN_PW = "wyd73199254110";

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

  // POST /api/comments — 发表评论
  if (request.method === 'POST') {
    const body = await request.json();

    // 删除评论（管理员）
    if (body._action === 'delete') {
      if (body.password !== ADMIN_PW) return Response.json({ error: '密码错误' }, { status: 403, headers: CORS });
      const key = `comments:${body.slug}`;
      let comments = await env.KV.get(key, 'json') || [];
      comments = comments.filter(c => c.id !== body.id);
      await env.KV.put(key, JSON.stringify(comments));
      return Response.json({ ok: true }, { headers: CORS });
    }

    // 验证管理员
    if (body._action === 'verify') {
      return Response.json({ ok: body.password === ADMIN_PW }, { headers: CORS });
    }

    // 删除整篇文章（管理员）
    if (body._action === 'delete_article') {
      if (body.password !== ADMIN_PW) return Response.json({ error: '密码错误' }, { status: 403, headers: CORS });
      const deleted = await env.KV.get('deleted_articles', 'json') || [];
      if (!deleted.includes(body.title)) {
        deleted.push(body.title);
        await env.KV.put('deleted_articles', JSON.stringify(deleted));
      }
      return Response.json({ ok: true }, { headers: CORS });
    }

    // 恢复文章（管理员）
    if (body._action === 'restore_article') {
      if (body.password !== ADMIN_PW) return Response.json({ error: '密码错误' }, { status: 403, headers: CORS });
      let deleted = await env.KV.get('deleted_articles', 'json') || [];
      deleted = deleted.filter(t => t !== body.title);
      await env.KV.put('deleted_articles', JSON.stringify(deleted));
      return Response.json({ ok: true }, { headers: CORS });
    }

    // 获取已删除列表（管理员）
    if (body._action === 'get_deleted') {
      if (body.password !== ADMIN_PW) return Response.json({ error: '密码错误' }, { status: 403, headers: CORS });
      const deleted = await env.KV.get('deleted_articles', 'json') || [];
      return Response.json({ ok: true, deleted }, { headers: CORS });
    }

    // 获取置顶列表（公开）
    if (body._action === 'get_pinned') {
      const pinned = await env.KV.get('pinned_articles', 'json') || [];
      return Response.json({ ok: true, pinned }, { headers: CORS });
    }

    // 批量获取所有文章评论数（公开，无需密码）
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
      if (body.password !== ADMIN_PW) return Response.json({ error: '密码错误' }, { status: 403, headers: CORS });
      if (!body.title || body.content === undefined) return Response.json({ error: '缺少参数' }, { status: 400, headers: CORS });
      const edit = { title: body.title, content: body.content, updatedAt: new Date().toISOString() };
      await env.KV.put(`article_edit:${body.title}`, JSON.stringify(edit));
      return Response.json({ ok: true, edit }, { headers: CORS });
    }

    // 获取所有文章编辑列表（管理员）
    if (body._action === 'article_edits_list') {
      if (body.password !== ADMIN_PW) return Response.json({ error: '密码错误' }, { status: 403, headers: CORS });
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
      if (body.password !== ADMIN_PW) return Response.json({ error: '密码错误' }, { status: 403, headers: CORS });
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

    // ===== 点赞系统（公开，无需密码） =====
    // 获取单篇文章点赞数
    if (body._action === 'get_like') {
      const slug = body.slug;
      if (!slug) return Response.json({ error: '缺少 slug' }, { status: 400, headers: CORS });
      const count = parseInt(await env.KV.get(`likes:${slug}`) || '0');
      return Response.json({ ok: true, count }, { headers: CORS });
    }

    // 获取所有文章点赞数（批量）
    if (body._action === 'get_all_likes') {
      const list = await env.KV.list({ prefix: 'likes:' });
      const likes = {};
      for (const key of list.keys) {
        const slug = key.name.replace('likes:', '');
        likes[slug] = parseInt(await env.KV.get(key.name) || '0');
      }
      return Response.json({ ok: true, likes }, { headers: CORS });
    }

    // 点赞（上限 100000）
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

    // 取消点赞
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
