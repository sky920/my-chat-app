/** 格式化为「YYYY年M月D日 HH:mm」 */
export function formatDateTime(date: Date, timeZone: string): string {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('zh-CN', {
      timeZone: timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  )

  return `${parts.year}年${parts.month}月${parts.day}日 ${parts.hour}:${parts.minute}`
}

const TIMEZONE_LABELS: Record<string, string> = {
  'Asia/Shanghai': '北京时间',
  'Asia/Tokyo': '东京时间',
  'Asia/Seoul': '首尔时间',
  'Europe/London': '伦敦时间',
}

function getTimezoneLabel(timeZone: string): string {
  return TIMEZONE_LABELS[timeZone] ?? timeZone
}

/** 供 system prompt 使用的时间感知说明 */
export function buildTimeContext(timeZone: string, now = new Date()): string {
  const formatted = formatDateTime(now, timeZone)
  const label = getTimezoneLabel(timeZone)
  return `【当前时间（${label}）】${formatted}
这是你所在地的当前时间。回复内容要符合此时段的日常情境（如作息、用餐、活动、问候），但不要主动报时或刻意提及日期时间，除非用户询问。`
}

/** 将时间上下文附加到角色 system prompt */
export function withTimeContext(systemPrompt: string, timeZone: string, now = new Date()): string {
  return `${systemPrompt}\n\n${buildTimeContext(timeZone, now)}`
}
