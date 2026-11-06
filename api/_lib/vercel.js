import { run } from "./handlers.js";

/** Adapta um handler para o formato de função serverless da Vercel. */
export function toVercel(handler) {
  return async function vercelHandler(req, res) {
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return res.status(405).json({ error: "Método não permitido" });
    }
    const { status, cache, body } = await run(handler, req.query ?? {}, process.env);
    if (cache) res.setHeader("Cache-Control", `public, s-maxage=${cache}, stale-while-revalidate=${cache}`);
    return res.status(status).json(body);
  };
}
