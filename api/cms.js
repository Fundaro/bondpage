// Vercel port of src/index.js (the Cloudflare Worker).
// Framer's CMS client reads .framercms files with ?range=from-to[,from-to...]
// and expects exactly those bytes back. vercel.json routes only those requests here;
// everything else is served as static files from ./public.
export const config = { runtime: "edge" };

export default async function handler(request) {
  const url = new URL(request.url);
  const range = url.searchParams.get("range");
  const path = url.searchParams.get("p");
  if (!range || !path || !path.endsWith(".framercms") || path.includes("..")) {
    return new Response("Bad request", { status: 400 });
  }

  // Fetch the whole static file (no range param, so it is served from the filesystem).
  const res = await fetch(new URL("/framerusercontent.com/cms/" + path, url.origin), {
    cache: "no-store",
  });
  if (!res.ok) return new Response(res.body, { status: res.status });
  const bytes = new Uint8Array(await res.arrayBuffer());

  const parts = [];
  for (const r of range.split(",")) {
    const m = /^(\d+)-(\d+)$/.exec(r);
    if (!m) return new Response("Bad range", { status: 400 });
    parts.push(bytes.subarray(Number(m[1]), Number(m[2]) + 1));
  }
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return new Response(out, {
    headers: { "content-type": "application/octet-stream", "cache-control": "no-cache" },
  });
}
