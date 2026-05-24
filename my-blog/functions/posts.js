export async function onRequestGet(context) {
  const { request, env } = context;
  const { DB } = env;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id'); // 获取前端传来的文章ID

  try {
    if (id) {
      // 如果URL带了id参数，就去数据库查那篇具体的文章
      const post = await DB.prepare("SELECT * FROM posts WHERE id = ?").bind(id).first();
      if (!post) {
        return new Response(JSON.stringify({ error: "Post not found" }), { status: 404 });
      }
      // 获取全局底部附加信息
      const appendix = await DB.prepare("SELECT content, date as align FROM posts WHERE title = '__GLOBAL_APPENDIX__'").first();
      if (appendix && appendix.content) {
        post.appendix = { content: appendix.content, align: appendix.align };
      }
      return new Response(JSON.stringify(post), {
        headers: { "Content-Type": "application/json" }
      });
    } else {
      // 获取全文列表，排除设置项
      const { results } = await DB.prepare("SELECT * FROM posts WHERE title != '__GLOBAL_APPENDIX__' ORDER BY id DESC").all();
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" }
      });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
