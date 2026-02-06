# 游戏API Edge Function

这是一个部署在Supabase Edge Functions上的游戏API代理服务，实现了新游戏接口文档（v2.15.2）的所有功能。

## 功能特性

- ✅ Token自动管理和缓存
- ✅ 所有游戏API端点支持
- ✅ CORS支持
- ✅ 错误处理
- ✅ 速率限制考虑

## 部署步骤

### 1. 安装Supabase CLI

```bash
npm install -g supabase
```

### 2. 登录Supabase

```bash
supabase login
```

### 3. 链接项目

```bash
supabase link --project-ref your-project-ref
```

### 4. 设置环境变量

在Supabase Dashboard中设置以下环境变量：

- `GAME_API_BASE_URL`: 游戏API基础URL（默认: https://dcyqv8f2id.com/api/v2）
- `GAME_API_CLIENT_ID`: 游戏API ClientId
- `GAME_API_CLIENT_SECRET`: 游戏API ClientSecret
- `SUPABASE_URL`: Supabase项目URL（自动设置）
- `SUPABASE_ANON_KEY`: Supabase匿名密钥（自动设置）

或者使用CLI设置：

```bash
supabase secrets set GAME_API_CLIENT_ID=your_client_id
supabase secrets set GAME_API_CLIENT_SECRET=your_client_secret
supabase secrets set GAME_API_BASE_URL=https://dcyqv8f2id.com/api/v2
```

### 5. 运行数据库迁移

```bash
supabase db push
```

### 6. 部署Edge Function

```bash
supabase functions deploy game-api
```

## API端点

部署后，可以通过以下URL访问：

```
https://your-project-ref.supabase.co/functions/v1/game-api/{endpoint}
```

### 可用端点

- `GET /vendors/list` - 获取供应商列表
- `POST /games/list` - 获取游戏列表
- `GET /games/mini/list` - 获取迷你游戏列表
- `POST /game/detail` - 获取游戏详情
- `POST /game/launch-url` - 获取启动URL
- `POST /user/create` - 创建用户
- `POST /user/balance` - 获取用户余额
- `POST /user/deposit` - 存款
- `POST /user/withdraw` - 提款
- `POST /user/withdraw-all` - 全部提款
- `POST /betting/history/by-date-v2` - 获取投注历史V2
- `POST /betting/history/by-id` - 获取投注历史（按ID）
- `POST /betting/history/detail` - 获取投注详情URL
- `GET /agent/balance` - 获取代理余额
- `POST /game/user/set-rtp` - 设置用户RTP
- `POST /game/user/get-rtp` - 获取用户RTP
- `POST /game/users/batch-rtp` - 批量设置用户RTP
- `GET /status` - API状态检查

## 使用示例

### 获取游戏启动URL

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/game-api/game/launch-url \
  -H "Content-Type: application/json" \
  -d '{
    "vendorCode": "casino-evolution",
    "gameCode": "MonBigBaller0001",
    "userCode": "user123",
    "language": "zh"
  }'
```

### 获取用户余额

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/game-api/user/balance \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "user123"
  }'
```

### 存款

```bash
curl -X POST https://your-project-ref.supabase.co/functions/v1/game-api/user/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "user123",
    "balance": 1000,
    "orderNo": "ORDER123",
    "vendorCode": "casino-evolution"
  }'
```

## Token管理

Token会自动缓存到Supabase数据库中，并在过期前5分钟自动刷新。无需手动管理。

## 注意事项

1. **速率限制**: 请遵守API文档中的速率限制
   - `/auth/createtoken`: 5次/30秒
   - `/betting/history/by-date-v2`: 1次/秒
   - `/game/users/batch-rtp`: 1次/3秒

2. **安全性**: 
   - 建议在生产环境中启用JWT验证
   - 使用Supabase RLS策略保护数据库

3. **监控**: 可以在Supabase Dashboard中查看函数日志和性能指标

## 本地开发

```bash
# 启动本地Supabase
supabase start

# 在本地运行函数
supabase functions serve game-api --env-file .env.local
```

## 故障排除

如果遇到问题：

1. 检查环境变量是否正确设置
2. 查看Supabase Dashboard中的函数日志
3. 确认数据库迁移已成功运行
4. 验证Token表是否存在
