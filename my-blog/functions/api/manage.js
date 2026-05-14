export async function onRequest(context) {
  const { request, env } = context;
  
  // 核心：从 context.env 中读取，而不是直接用 env.ADMIN_PASSWORD
  const adminPassword = env.ADMIN_PASSWORD; 

  if (request.method === "POST") {
    const body = await request.json();
    
    // 增加一个简单的日志判断（可选，调试用）
    if (!adminPassword) {
      return new Response("服务器未配置密码变量", { status: 500 });
    }

    if (body.password !== adminPassword) {
      return new Response("密码不正确", { status: 401 });
    }
    
    // ... 后续逻辑
  }
  // ...
}
