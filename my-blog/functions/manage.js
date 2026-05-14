export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;
  const adminPassword = env.ADMIN_PASSWORD;

  // GET 请求：获取文章列表（管理用）
  if (request.method === "GET") {
    const { results } = await db.prepare("SELECT id, title, date FROM posts ORDER BY id DESC").all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // POST 请求：处理 发布、修改、删除
  if (request.method === "POST") {
    try {
      const body = await request.json();

      // 鉴权
      if (!adminPassword || body.password !== adminPassword) {
        return new Response("Unauthorized", { status: 401 });
      }

      // 1. 删除逻辑
      if (body.action === "delete") {
        if (!body.id) return new Response("Missing ID", { status: 400 });
        await db.prepare("DELETE FROM posts WHERE id = ?").bind(Number(body.id)).run();
        return new Response("Deleted Successfully", { status: 200 });
      }

      // 2. 修改逻辑 (UPDATE)
      if (body.action === "update") {
        if (!body.id || !body.title || !body.content) {
          return new Response("Missing fields", { status: 400 });
        }
        await db.prepare("UPDATE posts SET title = ?, content = ? WHERE id = ?")
          .bind(body.title, body.content, Number(body.id))
          .run();
        return new Response("Updated Successfully", { status: 200 });
      }

      // 3. 发布逻辑 (INSERT)
      if (!body.title || !body.content) {
        return new Response("Missing fields", { status: 400 });
      }
      await db.prepare("INSERT INTO posts (title, content, date) VALUES (?, ?, ?)")
        .bind(body.title, body.content, new Date().toISOString().split('T')[0])
        .run();
      
      return new Response("Post Created", { status: 200 });

    } catch (err) {
      return new Response("Database Error: " + err.message, { status: 500 });
    }
  }
}
