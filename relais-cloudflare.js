/* Relais personnel Estimateur Auto — Cloudflare Worker (gratuit : 100 000 requêtes/jour).
   1) Remplacez CLE_SECRETE par un mot de passe de votre choix (le même dans l'application).
   2) Déployez (Workers & Pages > Create > Hello World > Edit code > collez > Deploy). */
const CLE = "CLE_SECRETE";
const HOTES = [/^www\.autoscout24\.(fr|de|be|es|it|nl|at|lu|pt)$/, /^www\.2dehands\.be$/, /^www\.2ememain\.be$/, /^www\.marktplaats\.nl$/, /^www\.standvirtual\.com$/, /^www\.nettiauto\.com$/, /^www\.donedeal\.ie$/];
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*", "Access-Control-Expose-Headers": "x-relay" };

export default {
  async fetch(req) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const u = new URL(req.url);
    if (u.searchParams.get("k") !== CLE) return new Response("cle", { status: 401, headers: CORS });
    let cible;
    try { cible = new URL(u.searchParams.get("url")); } catch (e) { return new Response("url", { status: 400, headers: CORS }); }
    if (cible.protocol !== "https:" || !HOTES.some((r) => r.test(cible.hostname)))
      return new Response("hote", { status: 403, headers: { ...CORS, "x-relay": "1" } });
    const r = await fetch(cible.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36",
        "Accept": "text/html,application/json;q=0.9,*/*;q=0.8",
        "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
      },
      cf: { cacheTtl: 600, cacheEverything: true },
    });
    const h = new Headers(CORS);
    h.set("Content-Type", r.headers.get("content-type") || "text/plain");
    return new Response(r.body, { status: r.status, headers: h });
  },
};
