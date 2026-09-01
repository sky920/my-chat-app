/** 规范化聊天文本，避免中文字体/弯引号导致 you've 显示成 you' ve */
export function normalizeChatText(text: string): string {
  return text
    .replace(/[\u2018\u2019\u201A\u2032\u00B4`]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/\u00A0/g, ' ')
    .replace(/[\u200B\u200C\u200D\uFEFF]/g, '')
    .replace(/(\w)'\s+(\w)/g, "$1'$2")
}
