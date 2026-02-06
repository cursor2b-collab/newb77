-- 创建游戏API Token存储表
CREATE TABLE IF NOT EXISTS game_api_tokens (
  id BIGSERIAL PRIMARY KEY,
  token TEXT NOT NULL,
  expiration BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_game_api_tokens_expiration ON game_api_tokens(expiration);
CREATE INDEX IF NOT EXISTS idx_game_api_tokens_created_at ON game_api_tokens(created_at DESC);

-- 添加注释
COMMENT ON TABLE game_api_tokens IS '存储游戏API的访问Token';
COMMENT ON COLUMN game_api_tokens.token IS 'Bearer Token';
COMMENT ON COLUMN game_api_tokens.expiration IS 'Token过期时间戳（秒）';
