# 将新游戏接口部署到Supabase指南

## 概述

本指南将帮助您将新游戏接口API部署到Supabase Edge Functions。Supabase Edge Functions是基于Deno运行时的无服务器函数，非常适合部署API代理服务。

## 前置要求

1. Supabase账户（免费版即可）
2. Node.js和npm已安装
3. Supabase CLI已安装

## 步骤1: 安装Supabase CLI

```bash
npm install -g supabase
```

或者使用其他包管理器：

```bash
# 使用Homebrew (macOS)
brew install supabase/tap/supabase

# 使用Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

## 步骤2: 登录Supabase

```bash
supabase login
```

这将打开浏览器让您登录Supabase账户。

## 步骤3: 初始化项目（如果还没有）

```bash
cd tongmeng-main
supabase init
```

## 步骤4: 链接到Supabase项目

```bash
# 列出您的项目
supabase projects list

# 链接到项目（替换为您的项目ID）
supabase link --project-ref your-project-ref
```

## 步骤5: 设置环境变量

在Supabase Dashboard中设置环境变量，或使用CLI：

```bash
# 设置游戏API配置
supabase secrets set GAME_API_CLIENT_ID=your_client_id
supabase secrets set GAME_API_CLIENT_SECRET=your_client_secret
supabase secrets set GAME_API_BASE_URL=https://dcyqv8f2id.com/api/v2
```

**重要**: 这些是敏感信息，请妥善保管。

## 步骤6: 运行数据库迁移

```bash
supabase db push
```

这将创建`game_api_tokens`表用于存储Token。

## 步骤7: 部署Edge Function

```bash
supabase functions deploy game-api
```

## 步骤8: 测试部署

部署成功后，您可以通过以下URL访问API：

```
https://your-project-ref.supabase.co/functions/v1/game-api/status
```

测试命令：

```bash
curl https://your-project-ref.supabase.co/functions/v1/game-api/status
```

## 使用示例

### 1. 获取游戏启动URL

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/game-api/game/launch-url \
  -H "Content-Type: application/json" \
  -d '{
    "vendorCode": "casino-evolution",
    "gameCode": "MonBigBaller0001",
    "userCode": "testuser",
    "language": "zh"
  }'
```

### 2. 获取用户余额

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/game-api/user/balance \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "testuser"
  }'
```

### 3. 存款

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/game-api/user/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "testuser",
    "balance": 1000,
    "orderNo": "ORDER123"
  }'
```

## 本地开发

### 启动本地Supabase

```bash
supabase start
```

### 运行Edge Function本地

```bash
# 创建.env.local文件
echo "GAME_API_CLIENT_ID=your_client_id" > .env.local
echo "GAME_API_CLIENT_SECRET=your_client_secret" >> .env.local
echo "GAME_API_BASE_URL=https://dcyqv8f2id.com/api/v2" >> .env.local

# 运行函数
supabase functions serve game-api --env-file .env.local
```

## 安全建议

### 1. 启用JWT验证（推荐）

修改`index.ts`，在函数开头添加JWT验证：

```typescript
// 验证JWT
const authHeader = req.headers.get("Authorization");
if (!authHeader || !authHeader.startsWith("Bearer ")) {
  return new Response(
    JSON.stringify({ success: false, errorCode: 401, message: "Unauthorized" }),
    { status: 401, headers: { "Content-Type": "application/json" } }
  );
}
```

### 2. 使用RLS策略保护数据库

在Supabase Dashboard中为`game_api_tokens`表设置RLS策略。

### 3. 限制CORS来源

修改CORS设置，只允许特定域名：

```typescript
const allowedOrigins = ["https://yourdomain.com"];
const origin = req.headers.get("Origin");
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "*",
  // ...
};
```

## 监控和日志

### 查看函数日志

```bash
supabase functions logs game-api
```

### 在Dashboard中查看

1. 登录Supabase Dashboard
2. 进入您的项目
3. 点击"Edge Functions"
4. 选择`game-api`函数
5. 查看日志和指标

## 更新部署

当您修改代码后，重新部署：

```bash
supabase functions deploy game-api
```

## 故障排除

### 问题1: Token创建失败

**原因**: ClientId或ClientSecret错误

**解决**: 检查环境变量是否正确设置

```bash
supabase secrets list
```

### 问题2: 数据库连接失败

**原因**: 数据库迁移未运行

**解决**: 运行数据库迁移

```bash
supabase db push
```

### 问题3: CORS错误

**原因**: 前端域名未在CORS白名单中

**解决**: 修改CORS设置或添加域名到白名单

### 问题4: 函数超时

**原因**: 外部API响应慢

**解决**: 
- 检查网络连接
- 增加函数超时时间（在Supabase Dashboard中设置）
- 优化代码逻辑

## 性能优化

1. **Token缓存**: Token已自动缓存，减少API调用
2. **连接池**: Supabase自动管理数据库连接
3. **CDN**: Supabase Edge Functions自动使用CDN加速

## 成本估算

Supabase免费版包括：
- 500MB数据库空间
- 2GB带宽
- 500K Edge Function调用/月

对于大多数中小型应用，免费版已足够使用。

## 下一步

1. 集成到您的前端应用
2. 设置监控和告警
3. 配置自动部署（CI/CD）
4. 添加更多安全措施

## 支持

如有问题，请查看：
- [Supabase文档](https://supabase.com/docs)
- [Edge Functions文档](https://supabase.com/docs/guides/functions)
- 项目README文件
