export async function onRequestGet(context) {
  // context.env.DB 是我们在部署时绑定的数据库对象
  const { DB } = context.env;
  
  try {
    const { results } = await DB.prepare(
      "SELECT * FROM posts ORDER BY id DESC"
    ).all();
    
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
