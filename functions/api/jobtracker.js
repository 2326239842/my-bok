// Pages Function — 求职追踪数据同步（私有数据，读写都需认证）
// 与评论系统共用 KV namespace 和密码，数据存在 KV key: jobtracker:data
// Token 机制与 comments.js 一致：密码换 HMAC token(24h)，后续带 token 访问

const ADMIN_PW = "wyd73199254110";
const TOKEN_SECRET = "jobtracker-2026-" + ADMIN_PW.slice(-6);
const TOKEN_TTL = 86400000; // 24小时
const KV_KEY = "jobtracker:data";

// HMAC-SHA256 签名（与评论系统同款实现）
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
  if (Date.now() - timestamp > TOKEN_TTL) return false;
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

  // GET /api/jobtracker?token=xxx — 读取全量数据（需认证）
  if (request.method === 'GET') {
    const token = url.searchParams.get('token');
    if (!(await verifyToken(token))) {
      return Response.json({ error: '未授权' }, { status: 403, headers: CORS });
    }
    const data = await env.KV.get(KV_KEY, 'json');
    return Response.json({ ok: true, records: data || [] }, { headers: CORS });
  }

  // POST /api/jobtracker
  if (request.method === 'POST') {
    const body = await request.json();

    // 密码换 token
    if (body._action === 'verify') {
      if (body.password !== ADMIN_PW) return Response.json({ ok: false }, { headers: CORS });
      const ts = String(Date.now());
      const sig = await hmacSign(ts, TOKEN_SECRET);
      return Response.json({ ok: true, token: `${sig}:${ts}` }, { headers: CORS });
    }

    // 保存全量数据（需认证）
    if (body._action === 'save') {
      if (!(await verifyToken(body.token))) {
        return Response.json({ error: '未授权' }, { status: 403, headers: CORS });
      }
      const records = body.records;
      if (!Array.isArray(records)) {
        return Response.json({ error: 'records 必须是数组' }, { status: 400, headers: CORS });
      }
      if (JSON.stringify(records).length > 1024 * 1024) {
        return Response.json({ error: '数据过大(>1MB)' }, { status: 413, headers: CORS });
      }
      await env.KV.put(KV_KEY, JSON.stringify(records));
      return Response.json({ ok: true, count: records.length, savedAt: new Date().toISOString() }, { headers: CORS });
    }
  }

  return Response.json({ error: 'not found' }, { status: 404, headers: CORS });
}
