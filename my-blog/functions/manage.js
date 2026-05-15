export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;
  const adminPassword = env.ADMIN_PASSWORD;

  if (request.method === "GET") {
    const { results } = await db.prepare("SELECT id, title FROM posts ORDER BY id DESC").all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  }

  if (request.method === "POST") {
    try {
      const body = await request.json();

      if (!adminPassword || body.password !== adminPassword) {
        return new Response("Unauthorized", { status: 401 });
      }

      // 删除逻辑
      if (body.action === "delete") {
        await db.prepare("DELETE FROM posts WHERE id = ?").bind(Number(body.id)).run();
        return new Response("Deleted", { status: 200 });
      }

      // 更新逻辑
      if (body.action === "update") {
        if (body.date) {
            await db.prepare("UPDATE posts SET title = ?, content = ?, date = ? WHERE id = ?")
              .bind(body.title, body.content, body.date, Number(body.id))
              .run();
        } else {
            await db.prepare("UPDATE posts SET title = ?, content = ? WHERE id = ?")
              .bind(body.title, body.content, Number(body.id))
              .run();
        }
        return new Response("Updated", { status: 200 });
      }

      // 发布逻辑
      const postDate = body.date || new Date().toISOString().split('T')[0];
      await db.prepare("INSERT INTO posts (title, content, date) VALUES (?, ?, ?)")
        .bind(body.title, body.content, postDate)
        .run();

      return new Response("Post Created", { status: 200 });

    } catch (err) {
      return new Response("Database Error: " + err.message, { status: 500 });
    }
  }
}
