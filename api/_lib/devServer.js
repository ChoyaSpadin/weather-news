import { run, weatherHandler, geoHandler, newsHandler } from "./handlers.js";
import { mockResponse } from "./mock.js";

const routes = { "/api/weather": weatherHandler, "/api/geo": geoHandler, "/api/news": newsHandler };

/**
 * Plugin do Vite que serve /api/* localmente com as mesmas funções da Vercel.
 * Com MOCK_API=1 (npm run dev:mock) devolve dados falsos e não precisa de chaves.
 */
export function devApi(env) {
  return {
    name: "dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://localhost");
        const handler = routes[url.pathname];
        if (!handler) return next();
        const query = Object.fromEntries(url.searchParams);
        const { status, body } =
          env.MOCK_API === "1"
            ? { status: 200, body: mockResponse(url.pathname, { ...query, code: env.MOCK_CODE }) }
            : await run(handler, query, env);
        res.statusCode = status;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.end(JSON.stringify(body));
      });
    },
  };
}
