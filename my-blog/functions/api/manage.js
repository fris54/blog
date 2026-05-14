export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;
  const adminPassword = env.ADMIN_PASSWORD;

  // GET 请求：获取文章列表（管理用）
  if (request.method === "GET") {
    const { results } = await db.prepare("SELECT id, title FROM posts ORDER BY id DESC").all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  }

  // POST 请求：处理发布和删除
  if (request.method === "POST") {
    try {
      const body = await request.json();

      // 1. 校验密码
      if (!adminPassword || body.password !== adminPassword) {
        return new Response("Unauthorized", { status: 401 });
      }

      // 2. 删除逻辑
      if (body.action === "delete") {
        await db.prepare("DELETE FROM posts WHERE id = ?").bind(body.id).run();
        return new Response("Deleted", { status: 200 });
      }

      // 3. 发布逻辑 (注意这里字段名改成了 date)
      if (!body.title || !body.content) {
        return new Response("Missing fields", { status: 400 });
      }

      // 使用你数据库中真实的字段名 'date'
      await db.prepare(
        "INSERT INTO posts (title, content, date) VALUES (?, ?, ?)"
      )
      .bind(body.title, body.content, new Date().toISOString().split('T')[0])
      .run();

      return new Response("OK", { status: 200 });
    } catch (err) {
      return new Response(err.message, { status: 500 });
    }
  }
}
