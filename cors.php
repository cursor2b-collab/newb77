<?php

return [

    /*

    |--------------------------------------------------------------------------

    | Cross-Origin Resource Sharing (CORS) Configuration

    |--------------------------------------------------------------------------

    |

    | Here you may configure your settings for cross-origin resource sharing

    | or "CORS". This determines what cross-origin operations may execute

    | in web browsers. You are free to adjust these settings as needed.

    |

    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

    |

    */

    'paths' => ['api/*'],

    'allowed_methods' => ['*'],

    // 允许的域名列表
    'allowed_origins' => [
        'https://www.xpj77777.com',           // 生产域名
        'https://www.xpj77777.com',       // 生产域名（www）
        'https://admin.xpj66666.com',
        'https://api.amjsvip.cc',
        'https://agent.xpj66666.com',
        'http://localhost:3000',         // 本地开发
        'http://localhost:5173',         // 本地开发（Vite）
        'http://127.0.0.1:3000',         // 本地开发
        'http://127.0.0.1:5173',         // 本地开发
    ],

    // 使用正则表达式匹配 Vercel 预览部署和其他常见开发域名
    'allowed_origins_patterns' => [
        '/^https:\/\/.*\.vercel\.app$/',  // 匹配所有 *.vercel.app 域名（预览部署）
        '/^http:\/\/localhost:\d+$/',     // 匹配本地开发服务器（任何端口）
        '/^http:\/\/127\.0\.0\.1:\d+$/',  // 匹配本地 IP（任何端口）
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // ⚠️ 重要：必须设置为 true，因为前端使用了 Authorization header
    // 如果为 false，浏览器会阻止携带 credentials 的请求
    'supports_credentials' => true,

];

