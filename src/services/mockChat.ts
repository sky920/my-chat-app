const MOCK_REPLIES = [
  '嗯…让我想想呢',
  '哈哈，是这样啊～',
  '我也这么觉得呢…',
  '原来如此，听起来不错呢',
  '好呀～下次再聊吧，我要去赶稿了',
]

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(new DOMException('Aborted', 'AbortError'))
      },
      { once: true },
    )
  })
}

export function getMockReply(userMessage: string): string {
  const text = userMessage.trim().toLowerCase()

  if (/你好|嗨|hello|hi/.test(text)) {
    return '你好呀～很高兴收到你的消息呢'
  }
  if (/天气|下雨|晴/.test(text)) {
    return '东京今天有点阴呢…适合窝在家里画画'
  }
  if (/画|插画|工作/.test(text)) {
    return '嗯…最近在赶一个杂志的插画，有点忙呢'
  }
  if (/吃|饭|饿/.test(text)) {
    return '我刚吃了拉面…你要不要也去吃一点呢'
  }
  if (/谢谢|感谢/.test(text)) {
    return '不客气呢～能和你聊天我很开心'
  }
  if (/再见|拜拜|晚安/.test(text)) {
    return '晚安～做个好梦呢…'
  }

  const index =
    userMessage.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    MOCK_REPLIES.length
  return MOCK_REPLIES[index]!
}

export async function fetchMockReply(userMessage: string, signal?: AbortSignal): Promise<string> {
  await delay(500 + Math.random() * 400, signal)
  return getMockReply(userMessage)
}

const MOCK_MOMENTS = [
  '今天天气真好，出去走走～',
  '刚下班，好累但是很开心',
  '今天的咖啡拉花成功了一次！',
  '周末去了个新地方，人不多很安静',
  '突然下雨了…还好带了伞',
]

export async function fetchMockMoment(signal?: AbortSignal): Promise<string> {
  await delay(500 + Math.random() * 400, signal)
  return MOCK_MOMENTS[Math.floor(Math.random() * MOCK_MOMENTS.length)]!
}
