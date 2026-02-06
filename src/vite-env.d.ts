/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_USE_NEW_GAME_API?: string;
  // 添加其他环境变量类型定义
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
