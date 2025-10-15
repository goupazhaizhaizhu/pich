// src/types/express.d.ts

// 1. 引入 'express-session' 模块
// 这一步告诉 TypeScript 你正在增强这个模块
import 'express-session';
import 'express'

// 2. 声明一个模块，与你要增强的模块同名
declare module 'express-session' {
  // 3. 找到并扩展 SessionData 接口
  // SessionData 接口定义了存储在 session 对象中的数据结构
  interface SessionData {
    // 在这里添加你的自定义属性及其类型
    // 使用问号 (?) 表示属性是可选的，因为在 Session 刚创建时可能没有这些属性
    // views?: number;
    // userId?: string;
    // username?: string;
    // lastVisit?: string;
    // ... 你在 req.session 上设置的任何其他自定义属性
    // 比如，如果你用了 csurf，并且需要访问 csurf 的 token，虽然 csurf 会自动管理，
    // 但如果需要手动类型提示，可以加在这里（尽管 csurf 会把其 token 放在 req.csrfToken() 方法里，
    // 而不是直接在 req.session 里暴露给开发者访问）
    // csrfToken?: string; // 仅作示例，csurf token通常通过req.csrfToken()访问
  }

  interface Request { 
    user: any
  }
}

declare module 'express' {
  // 3. 找到并扩展 SessionData 接口
  // SessionData 接口定义了存储在 session 对象中的数据结构
  interface Request {
    user: any;
  }
}
