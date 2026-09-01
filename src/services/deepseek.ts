import type { Message } from '../stores/chatStore'
import { fetchMockReply } from './mockChat'

const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined
const BASE_URL = import.meta.env.VITE_DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com'
const MODEL = 'deepseek-v4-flash'
const MAX_HISTORY = 20
const IS_PROD = import.meta.env.PROD

export function hasApiKey(): boolean {
  // 生产环境通过 Serverless Function 代理，Key 在服务端
  if (IS_PROD) return true
  return Boolean(API_KEY && API_KEY !== 'sk-your-key-here')
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

function buildMessages(systemPrompt: string, history: Message[], userMessage: string): ChatMessage[] {
  const recent = history
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-MAX_HISTORY)
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

  return [
    { role: 'system', content: systemPrompt },
    ...recent,
    { role: 'user', content: userMessage },
  ]
}

/** 一次性返回完整回复（非流式），像微信一样整句出现 */
export async function fetchChat(
  systemPrompt: string,
  history: Message[],
  userMessage: string,
  signal?: AbortSignal,
): Promise<string> {
  const messages = buildMessages(systemPrompt, history, userMessage)

  // 生产环境：通过 /api/chat 代理调用，API Key 不暴露给前端
  if (IS_PROD) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal,
    })
    return parseResponse(response)
  }

  // 本地开发：无 Key 时使用 mock 回复
  if (!hasApiKey()) {
    return fetchMockReply(userMessage, signal)
  }

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
