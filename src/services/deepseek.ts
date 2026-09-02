import type { Message } from '../stores/chatStore'
import { buildSystemPrompt } from '../utils/characterContext'
import { fetchMockReply } from './mockChat'

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined
const BASE_URL = import.meta.env.VITE_DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com'
const MODEL = 'deepseek-v4-flash'
const MAX_HISTORY = 20
const IS_PROD = import.meta.env.PROD

export function hasApiKey(): boolean {
  // 优先使用前端注入的 Key（本地开发 / GitHub Pages 等静态托管）
  if (API_KEY && API_KEY !== 'sk-your-key-here') return true
  // 生产环境降级：通过 /api/chat 服务端代理（仅 Vercel/Cloudflare 等支持）
  if (IS_PROD) return true
  return false
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

function buildMessages(
  systemPrompt: string,
  timezone: string,
  history: Message[],
  userMessage: string,
): ChatMessage[] {
  const recent = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-MAX_HISTORY)
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

  return [
    { role: 'system', content: buildSystemPrompt(systemPrompt, timezone) },
    ...recent,
    { role: 'user', content: userMessage },
  ]
}

/** 一次性返回完整回复（非流式），像微信一样整句出现 */
export async function fetchChat(
  systemPrompt: string,
  timezone: string,
  history: Message[],
  userMessage: string,
  signal?: AbortSignal,
): Promise<string> {
  const messages = buildMessages(systemPrompt, timezone, history, userMessage)

  // 策略 1：前端已注入 API Key → 直接调用 DeepSeek（适用于本地开发 / GitHub Pages 等静态托管）
  // 注：静态托管没有服务端，Key 会被打进 bundle；请仅在自己可信的私有仓库使用
  if (API_KEY && API_KEY !== 'sk-your-key-here') {
    return callDeepSeekDirect(messages, signal)
  }

  // 策略 2：生产环境且无前端 Key → 尝试通过 /api/chat 服务端代理
  // Vercel / Cloudflare Pages Functions 等支持此路由；GitHub Pages 纯静态会 404
  if (IS_PROD) {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal,
      })
      if (!response.ok && (response.status === 404 || response.status === 405)) {
        // 当前部署平台是纯静态托管（如 GitHub Pages），没有 /api/chat 服务端路由
        throw new Error(
          '当前部署平台不支持服务端代理。请在构建时设置环境变量 VITE_DEEPSEEK_API_KEY，' +
            '或使用 Vercel / Cloudflare Pages 等支持 Serverless Functions 的平台。',
        )
      }
      return parseResponse(response)
    } catch (err) {
      // 网络失败或 404，给用户一个更明确的错误提示
      if (err instanceof Error && err.message.includes('Failed to fetch')) {
        throw new Error(
          'API 请求失败：请确认已在部署时注入 VITE_DEEPSEEK_API_KEY 环境变量，' +
            '或使用支持 /api 代理的托管平台（Vercel / Cloudflare Pages）。',
        )
      }
      throw err
    }
  }

  // 本地开发，且未配置 Key → 使用 mock 回复
  return fetchMockReply(userMessage, signal)
}

/** 直连 DeepSeek API 发送请求（使用前端注入的 Bearer Token） */
async function callDeepSeekDirect(messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: false,
      thinking: { type: 'disabled' },
      temperature: 1.0,
      top_p: 1.0,
    }),
    signal,
  })
  return parseResponse(response)
}

/** 统一解析 DeepSeek API 响应 */
async function parseResponse(response: Response): Promise<string> {
  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`API 请求失败 (${response.status}): ${errText || response.statusText}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content?.trim()
  if (!content) {
    throw new Error('API 返回为空')
  }
  return content
}
