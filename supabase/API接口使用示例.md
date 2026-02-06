# 游戏API接口使用示例

## 基础信息

- **项目URL**: https://lfjvlypknjpheycqunyk.supabase.co
- **API基础路径**: `/functions/v1/game-api`
- **完整URL**: `https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api`

## 认证

所有API请求都需要在Supabase Dashboard中设置以下环境变量：
- `GAME_API_CLIENT_ID`
- `GAME_API_CLIENT_SECRET`

Token会自动管理，无需手动传递。

## API端点示例

### 1. 检查API状态

```bash
curl -X GET \
  https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api/status
```

**响应**:
```json
{
  "success": true,
  "message": "success",
  "errorCode": 0
}
```

### 2. 获取供应商列表

```bash
curl -X GET \
  https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api/vendors/list
```

**响应**:
```json
{
  "success": true,
  "message": [
    {
      "vendorCode": "slot-pragmatic",
      "type": 2,
      "name": "Pragmatic Slot"
    },
    {
      "vendorCode": "mini-crash",
      "type": 3,
      "name": "Crash"
    }
  ],
  "errorCode": 0
}
```

### 3. 获取游戏列表

```bash
curl -X POST \
  https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api/games/list \
  -H "Content-Type: application/json" \
  -d '{
    "vendorCode": "casino-evolution",
    "language": "zh"
  }'
```

### 4. 获取游戏启动URL

```bash
curl -X POST \
  https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api/game/launch-url \
  -H "Content-Type: application/json" \
  -d '{
    "vendorCode": "casino-evolution",
    "gameCode": "MonBigBaller0001",
    "userCode": "testuser",
    "language": "zh",
    "lobbyUrl": "https://yourdomain.com"
  }'
```

**响应**:
```json
{
  "success": true,
  "message": "https://evolution.dcyqv8f2id.com/entry?jsessionid=...",
  "errorCode": 0
}
```

### 5. 创建用户

```bash
curl -X POST \
  https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api/user/create \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "testuser123"
  }'
```

### 6. 获取用户余额

```bash
curl -X POST \
  https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api/user/balance \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "testuser123"
  }'
```

**响应**:
```json
{
  "success": true,
  "message": 1000.00,
  "errorCode": 0
}
```

### 7. 存款

```bash
curl -X POST \
  https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api/user/deposit \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "testuser123",
    "balance": 1000,
    "orderNo": "ORDER123456",
    "vendorCode": "casino-evolution"
  }'
```

### 8. 提款

```bash
curl -X POST \
  https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api/user/withdraw \
  -H "Content-Type: application/json" \
  -d '{
    "userCode": "testuser123",
    "balance": 500,
    "orderNo": "ORDER789012",
    "vendorCode": "casino-evolution"
  }'
```

### 9. 获取投注历史V2

```bash
curl -X POST \
  https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api/betting/history/by-date-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-04-21T01:00:00",
    "limit": 5000,
    "vendorCode": "slot-pragmatic"
  }'
```

**注意**: 此接口有速率限制（每秒1次）

### 10. 设置用户RTP

```bash
curl -X POST \
  https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api/game/user/set-rtp \
  -H "Content-Type: application/json" \
  -d '{
    "vendorCode": "slot-pragmatic",
    "userCode": "testuser123",
    "rtp": 90
  }'
```

### 11. 批量设置用户RTP

```bash
curl -X POST \
  https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api/game/users/batch-rtp \
  -H "Content-Type: application/json" \
  -d '{
    "vendorCode": "slot-pragmatic",
    "data": [
      {"userCode": "user1", "rtp": 90},
      {"userCode": "user2", "rtp": 85},
      {"userCode": "user3", "rtp": 95}
    ]
  }'
```

**注意**: 此接口有速率限制（每3秒1次），最多支持500个用户

## JavaScript/TypeScript 使用示例

### 使用 fetch

```typescript
// 获取游戏启动URL
async function getGameLaunchUrl(vendorCode: string, gameCode: string, userCode: string) {
  const response = await fetch(
    'https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api/game/launch-url',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendorCode,
        gameCode,
        userCode,
        language: 'zh',
      }),
    }
  );

  const data = await response.json();
  if (data.success) {
    return data.message; // 返回游戏URL
  } else {
    throw new Error(data.message || 'Failed to get launch URL');
  }
}

// 使用示例
const gameUrl = await getGameLaunchUrl('casino-evolution', 'MonBigBaller0001', 'user123');
window.location.href = gameUrl;
```

### 使用 Supabase Client

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lfjvlypknjpheycqunyk.supabase.co',
  'your-anon-key'
);

// 调用Edge Function
async function getUserBalance(userCode: string) {
  const { data, error } = await supabase.functions.invoke('game-api', {
    body: {
      endpoint: '/user/balance',
      method: 'POST',
      body: { userCode },
    },
  });

  if (error) throw error;
  return data;
}
```

## 错误处理

所有API响应都遵循以下格式：

**成功响应**:
```json
{
  "success": true,
  "message": "数据或消息",
  "errorCode": 0
}
```

**错误响应**:
```json
{
  "success": false,
  "message": "错误描述",
  "errorCode": 错误代码
}
```

### 常见错误代码

- `0`: 无错误
- `1`: 用户已存在
- `2`: 用户不存在
- `3`: 代理余额不足
- `4`: 用户余额不足
- `400`: 请求无效
- `401`: 未授权
- `429`: 速率限制超出
- `500`: 服务器错误

## 速率限制

以下接口有速率限制：

1. **创建Token**: 5次/30秒
2. **投注历史V2**: 1次/秒
3. **批量设置RTP**: 1次/3秒

超出限制会返回429错误。

## 监控和日志

所有API调用都会自动记录到`game_api_logs`表中，可以通过以下SQL查询：

```sql
-- 查看最近的API调用
SELECT * FROM game_api_logs 
ORDER BY created_at DESC 
LIMIT 20;

-- 查看API统计
SELECT * FROM game_api_stats;

-- 查看错误日志
SELECT * FROM game_api_logs 
WHERE status_code >= 400 
ORDER BY created_at DESC;
```

## 最佳实践

1. **错误处理**: 始终检查`success`字段
2. **重试机制**: 对于429错误，实现指数退避重试
3. **缓存**: 对于不经常变化的数据（如供应商列表），可以缓存
4. **监控**: 定期检查API日志，了解使用情况
5. **安全**: 不要在前端暴露ClientId和ClientSecret
