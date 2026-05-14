export async function onRequestPost(context) {
  const { request, env } = context;
  const body = await request.json();
  const { password, title, content, id, action } = body;

  if (password !== env.ADMIN_PASSWORD) {
    return new Response("密码错误", { status: 403 });
  }

  try {
    if (action === 'delete') {
      await env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id).run();
      return new Response("已删除");
    } 
    
    if (id) {
      // 【修改逻辑】如果传了 id，就执行更新
      await env.DB.prepare(
        "UPDATE posts SET title = ?, content = ? WHERE id = ?"
      ).bind(title, content, id).run();
      return new Response("更新成功");
    } else {
      // 【发布逻辑】如果没有 id，就是新文章
      const date = new Date().toISOString().split('T')[0];
      await env.DB.prepare(
        "INSERT INTO posts (title, content, date) VALUES (?, ?, ?)"
      ).bind(title, content, date).run();
      return new Response("发布成功");
    }
  } catch (e) {
    return new Response("数据库错误: " + e.message, { status: 500 });
  }
}

// 别忘了也要支持 GET 请求来列出管理列表
export async function onRequestGet(context) {
  const { results } = await context.env.DB.prepare("SELECT * FROM posts ORDER BY id DESC").all();
  return new Response(JSON.stringify(results), { headers: { "Content-Type": "application/json" } });
}
