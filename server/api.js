import { Hono } from "hono";
import { cors } from "hono/cors";
import { authHandler } from "./auth.js";

const app = new Hono();
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use("*", cors({ origin: clientOrigin, credentials: true }));

const cloneAuthRequest = (request, authPath) => {
    const url = new URL(request.url);
    url.pathname = authPath;
    return new Request(url.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
    });
};

app.get("/api/health", () =>
    new Response(JSON.stringify({ ok: true, message: "ElecZen auth API is running." }), {
        status: 200,
        headers: { "content-type": "application/json" },
    }),
);

app.post("/api/auth/register", async (c) => {
    const authRequest = cloneAuthRequest(c.req, "/api/auth/sign-up");
    return authHandler(authRequest);
});

app.post("/api/auth/login", async (c) => {
    const authRequest = cloneAuthRequest(c.req, "/api/auth/sign-in");
    return authHandler(authRequest);
});

app.post("/api/auth/logout", async (c) => {
    const authRequest = cloneAuthRequest(c.req, "/api/auth/sign-out");
    return authHandler(authRequest);
});

app.get("/api/auth/session", async (c) => authHandler(c.req));

app.all("/api/auth/*", async (c) => {
    return authHandler(c.req);
});

app.get("/api/auth/health", () =>
    new Response(JSON.stringify({ ok: true, auth: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
    }),
);

app.all("*", () =>
    new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
    }),
);

export default app;
