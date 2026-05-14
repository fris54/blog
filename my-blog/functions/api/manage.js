export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;
  const adminPassword = env.ADMIN_PASSWORD;

  if (request.method === "POST") {
    const body = await request.json();
    if (body.password !== adminPassword) return new Response("Unauthorized", { status: 401 });

    if (body.action === "delete") {
      await db.prepare("DELETE FROM posts WHERE id = ?").bind(body.id).run();
      return new Response("OK");
    }

    await db.prepare("INSERT INTO posts (title, content, created_at) VALUES (?, ?, ?)")
            .bind(body.title, body.content, new Date().toISOString()).run();
    return new Response("OK");
  }

  const { results } = await db.prepare("SELECT id, title FROM posts ORDER BY created_at DESC").all();
  return new Response(JSON.stringify(results));
}
