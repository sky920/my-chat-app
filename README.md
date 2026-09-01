# LINE 风聊天 Web

仿 LINE 绿白风格的手机优先聊天 Web 应用，接入 DeepSeek `deepseek-v4-flash` 流式对话。

## 功能

- 消息列表页 + 聊天页（Hash 路由，适合静态部署）
- LINE 绿白视觉：品牌绿顶栏、自己绿色气泡、对方白色气泡
- 默认音效：点击、发送、接收（Web Audio 合成，无需额外文件）
- 单测试角色「小美」，聊天记录 localStorage 持久化
- DeepSeek 整句回复（非流式），像微信一样直接出现完整一句话
- **未配置 API Key 时**：自动加载 mock 初始对话，发送消息使用 mock 整句回复

## 快速开始（本地开发）

```bash
# 1. 安装依赖
npm install

# 2. 配置 API Key
cp .env.example .env
# 编辑 .env，填入 VITE_DEEPSEEK_API_KEY

# 3. 启动开发服务器
npm run dev
```

浏览器打开 `http://localhost:5173` 即可使用。

### 手机局域网访问（开发阶段）

```bash
npm run dev -- --host
```

手机与电脑同一 WiFi，访问终端显示的 `http://192.168.x.x:5173`。

## 构建与部署

```bash
npm run build
```

将 `dist/` 目录整个上传到静态服务器（Nginx、Apache、对象存储等），手机浏览器访问对应 URL 即可，无需运行 dev server。

> **注意**：构建时 API Key 会打包进 JS，仅限个人使用，请勿公开部署。

### CORS 问题

若浏览器直连 DeepSeek API 报 CORS 错误，请参考 [docs/nginx-proxy.conf](docs/nginx-proxy.conf) 配置 Nginx 反向代理。

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `VITE_DEEPSEEK_API_KEY` | 是 | DeepSeek API Key |
| `VITE_DEEPSEEK_BASE_URL` | 否 | 默认 `https://api.deepseek.com`，代理时改为 `/api/deepseek` |

## 技术栈

- React 18 + TypeScript + Vite
- React Router（HashRouter）
- Zustand + persist
- 原生 fetch SSE 流式解析
