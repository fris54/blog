export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;
  const adminPassword = env.ADMIN_PASSWORD;

  if (request.method === "GET") {
    const { results } = await db.prepare("SELECT id, title FROM posts ORDER BY id DESC").all();
    return new Response(JSON.stringify(results));
  }

  const body = await request.json();
  if (body.password !== adminPassword) return new Response("Unauthorized", { status: 401 });

  if (body.action === "delete") {
    await db.prepare("DELETE FROM posts WHERE id = ?").bind(body.id).run();
    return new Response("OK");
  }

  if (body.action === "update") {
    await db.prepare("UPDATE posts SET title = ?, content = ? WHERE id = ?")
      .bind(body.title, body.content, body.id).run();
    return new Response("OK");
  }

  // Create
  await db.prepare("INSERT INTO posts (title, content, date) VALUES (?, ?, ?)")
    .bind(body.title, body.content, new Date().toISOString().split('T')[0]).run();
  return new Response("OK");
}
