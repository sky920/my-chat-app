import type { IncomingMessage, ServerResponse } from 'node:http'

/**
 * Vercel Serverless Function — 代理 DeepSeek API
 * API Key 存储在服务端环境变量中，不暴露给浏览器
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const API_KEY = process.env.DEEPSEEK_API_KEY
const BASE_URL = 'https://api.deepseek.com'
const MODEL = 'deepseek-v4-flash'

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  if (!API_KEY) {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'DEEPSEEK_API_KEY 未配置' }))
    return
  }

  try {
    // 读取请求体
    const chunks: Buffer[] = []
    for await (const chunk of req) {
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    const body = JSON.parse(Buffer.concat(chunks).toString())
    const messages: ChatMessage[] = body.messages

    // 转发到 DeepSeek API
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
    })

    const data = await response.text()
    res.writeHead(response.status, { 'Content-Type': 'application/json' })
    res.end(data)
  } catch {
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: '服务器内部错误' }))
  }
}
