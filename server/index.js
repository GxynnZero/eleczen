import app from "./api.js";

const PORT = Number(process.env.PORT || 3001);

const server = Bun.serve({
    port: PORT,
    fetch: app.fetch,
    development: true,
});

console.log(`ElecZen auth server listening on http://localhost:${PORT}`);

export default server;
