// Static site served from ./public. The only dynamic part: Framer's CMS client reads
// .framercms files with ?range=from-to[,from-to...] and expects exactly those bytes back.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const range = url.searchParams.get("range");
    if (!range || !url.pathname.endsWith(".framercms")) return env.ASSETS.fetch(request);

    // Plain GET without the browser's conditional headers: a 304 here would hand back the
    // cached whole file instead of the requested slice.
    const res = await env.ASSETS.fetch(new URL(url.pathname, url.origin));
    if (!res.ok) return res;
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
  },
};
