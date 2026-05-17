export async function onRequest(context) {
  const { request, env } = context;
  const CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const url = new URL(request.url);

  if (request.method === 'GET') {
    const slug = url.searchParams.get('slug');
    if (!slug) return Response.json({ error: 'missing slug' }, { status: 400, headers: CORS });
    const data = await env.KV.get(`cmt:${slug}`, 'json');
    return Response.json({ ok: true, comments: data || [] }, { headers: CORS });
  }

  if (request.method === 'POST') {
    const body = await request.json();
    const { slug, name, content } = body;
    if (!slug || !content) return Response.json({ error: 'missing fields' }, { status: 400, headers: CORS });
    
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    const comment = { id, slug, name: (name||'匿名').slice(0,20), content: content.slice(0,2000), time: new Date().toISOString() };
    
    const key = `cmt:${slug}`;
    const existing = await env.KV.get(key, 'json') || [];
    existing.push(comment);
    await env.KV.put(key, JSON.stringify(existing));
    
    return Response.json({ ok: true, comment }, { headers: CORS });
  }

  return Response.json({ error: 'not found' }, { status: 404, headers: CORS });
}
