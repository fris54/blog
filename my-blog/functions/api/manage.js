export async function onRequest(context) {
  const { request, env } = context;
  const db = env.DB;
  const adminPassword = env.ADMIN_PASSWORD;

  // GET 请求：获取文章列表
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

      // 1. 严格校验密码
      if (!adminPassword || body.password !== adminPassword) {
        return new Response("Unauthorized", { status: 401 });
      }

      // 2. 执行删除逻辑
      // 注意：前端传来的可能是字符串类型的 ID，这里用 Number 强制转换一下确保安全
      if (body.action === "delete") {
        if (!body.id) return new Response("Missing ID", { status: 400 });
        
        await db.prepare("DELETE FROM posts WHERE id = ?")
                .bind(Number(body.id))
                .run();
                
        return new Response("Deleted Successfully", { status: 200 });
      }

      // 3. 执行发布逻辑
      if (!body.title || !body.content) {
        return new Response("Missing fields", { status: 400 });
      }

      await db.prepare(
        "INSERT INTO posts (title, content, date) VALUES (?, ?, ?)"
      )
      .bind(body.title, body.content, new Date().toISOString().split('T')[0])
      .run();

      return new Response("Post Created", { status: 200 });

    } catch (err) {
      // 如果数据库报错，返回具体错误信息，方便我们调试
      return new Response("Database Error: " + err.message, { status: 500 });
    }
  }
}
