export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const db = env.DB;

  if (id) {
    const post = await db.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
    return new Response(JSON.stringify(post));
  }

  const { results } = await db.prepare("SELECT id, title, date FROM posts ORDER BY id DESC").all();
  return new Response(JSON.stringify(results));
}
