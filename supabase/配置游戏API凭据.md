# 配置游戏API凭据

## 接口凭据信息

- **CLIENT_ID**: `7072205891`
- **CLIENT_SECRET**: `DM1VQGKngVonjipb0LlJ7k4YQItIRLp4`
- **BASE_URL**: `https://dcyqv8f2id.com/api/v2`

## 快速配置命令

使用 Supabase CLI 快速配置：

```bash
# 确保已登录并链接项目
supabase login
supabase link --project-ref lfjvlypknjpheycqunyk

# 设置环境变量
supabase secrets set GAME_API_CLIENT_ID=7072205891
supabase secrets set GAME_API_CLIENT_SECRET=DM1VQGKngVonjipb0LlJ7k4YQItIRLp4
supabase secrets set GAME_API_BASE_URL=https://dcyqv8f2id.com/api/v2

# 重新部署 Edge Function（使环境变量生效）
supabase functions deploy game-api --project-ref lfjvlypknjpheycqunyk
```

## 通过 Dashboard 配置

1. 访问：https://supabase.com/dashboard/project/lfjvlypknjpheycqunyk/settings/functions
2. 在 **Secrets** 部分添加：
   - `GAME_API_CLIENT_ID` = `7072205891`
   - `GAME_API_CLIENT_SECRET` = `DM1VQGKngVonjipb0LlJ7k4YQItIRLp4`
   - `GAME_API_BASE_URL` = `https://dcyqv8f2id.com/api/v2`
3. 保存后重新部署 Edge Function

## 验证配置

```bash
# 测试 API 状态
curl https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api/status

# 测试获取供应商列表
curl -X GET https://lfjvlypknjpheycqunyk.supabase.co/functions/v1/game-api/vendors/list \
  -H "Content-Type: application/json"
```
