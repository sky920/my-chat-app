import type { Message } from '../stores/chatStore'

const baseTime = Date.now() - 1000 * 60 * 15

export const MOCK_SEED_BY_CHARACTER: Record<string, Omit<Message, 'id'>[]> = {
  xiaomei: [
    {
      role: 'assistant',
      content: '嗨～你来啦呢',
      timestamp: baseTime,
    },
    {
      role: 'user',
      content: '嗨，小美',
      timestamp: baseTime + 1000 * 60 * 2,
    },
    {
      role: 'assistant',
      content: '今天东京下雨了呢…你那边天气怎么样？',
      timestamp: baseTime + 1000 * 60 * 5,
    },
  ],
  xinning: [
    {
      role: 'assistant',
      content: '嗨，最近还好吗？',
      timestamp: baseTime - 1000 * 60 * 3,
    },
    {
      role: 'user',
      content: '还行吧，有点累',
      timestamp: baseTime + 1000 * 60,
    },
    {
      role: 'assistant',
      content: '累的时候先歇一歇也没关系。想聊聊的话，我在呢。',
      timestamp: baseTime + 1000 * 60 * 4,
    },
  ],
  boyuan: [
    {
      role: 'assistant',
      content: '嘿，你来啦。刚才又翻到一段挺有意思的史料。',
      timestamp: baseTime - 1000 * 60 * 8,
    },
    {
      role: 'user',
      content: '什么史料？',
      timestamp: baseTime - 1000 * 60 * 5,
    },
    {
      role: 'assistant',
      content: '唐代有人出差报销写得巨细无遗，连买一双草鞋都记上了——古人也挺会记账的。',
      timestamp: baseTime - 1000 * 60 * 2,
    },
  ],
  shuyi: [
    {
      role: 'assistant',
      content: '今晚窗外风很小，适合翻两页书。你还醒着吗？',
      timestamp: baseTime - 1000 * 60 * 12,
    },
    {
      role: 'user',
      content: '在呢，在看什么？',
      timestamp: baseTime - 1000 * 60 * 9,
    },
    {
      role: 'assistant',
      content: '重读《月亮与六便士》。有句很淡的话，大意是：多数人追逐六便士，少数人抬头看见了月亮。',
      timestamp: baseTime - 1000 * 60 * 6,
    },
  ],
  alex: [
    {
      role: 'assistant',
      content: 'Hey! Long time no chat — how’s your day going?',
      timestamp: baseTime - 1000 * 60 * 20,
    },
    {
      role: 'user',
      content: '还不错，你呢？',
      timestamp: baseTime - 1000 * 60 * 17,
    },
    {
      role: 'assistant',
      content: 'Pretty good! Just grabbed coffee and people-watching. Want to catch up later?',
      timestamp: baseTime - 1000 * 60 * 14,
    },
  ],
  jingchen: [
    {
      role: 'assistant',
      content: '刚刷到一组通胀数据，思路有点打开。你最近有空聊两句吗？',
      timestamp: baseTime - 1000 * 60 * 25,
    },
    {
      role: 'user',
      content: '怎么了？',
      timestamp: baseTime - 1000 * 60 * 22,
    },
    {
      role: 'assistant',
      content: '简单说：钱变“不值钱”时，大家会更想提前消费或换资产——所以物价和情绪是绑在一起的。',
      timestamp: baseTime - 1000 * 60 * 18,
    },
  ],
  wanqing: [
    {
      role: 'assistant',
      content: '刚剪完一条，眼睛要瞎了。你最近还想做号吗？',
      timestamp: baseTime - 1000 * 60 * 30,
    },
    {
      role: 'user',
      content: '有点想，但不知道做什么赛道',
      timestamp: baseTime - 1000 * 60 * 27,
    },
    {
      role: 'assistant',
      content: '别先纠结赛道。先问自己能坚持拍两周的是啥——兴趣撑不住更新，流量也留不住。',
      timestamp: baseTime - 1000 * 60 * 24,
    },
  ],
  muyuan: [
    {
      role: 'assistant',
      content: '在片场等一场晚霞，光总是不听话。你最近还好吗？',
      timestamp: baseTime - 1000 * 60 * 35,
    },
    {
      role: 'user',
      content: '还行，在拍新东西？',
      timestamp: baseTime - 1000 * 60 * 32,
    },
    {
      role: 'assistant',
      content: '一个短片。故事不复杂，就想把“错过”拍得克制一点——别煽情，让观众自己心口一紧就够了。',
      timestamp: baseTime - 1000 * 60 * 28,
    },
  ],
  linzhou: [
    {
      role: 'assistant',
      content: '刚杀青，脸都笑僵了。你最近忙啥？',
      timestamp: baseTime - 1000 * 60 * 40,
    },
    {
      role: 'user',
      content: '还行，你戏顺利吗？',
      timestamp: baseTime - 1000 * 60 * 37,
    },
    {
      role: 'assistant',
      content: '还行吧，配角戏份不多，但好歹是正剧。比当年站十小时等一个镜头强多了。',
      timestamp: baseTime - 1000 * 60 * 33,
    },
  ],
  qingci: [
    {
      role: 'assistant',
      content: '今晚月色很好，倒有点“月上柳梢头”的意思。你睡了吗？',
      timestamp: baseTime - 1000 * 60 * 45,
    },
    {
      role: 'user',
      content: '还没，在发呆',
      timestamp: baseTime - 1000 * 60 * 42,
    },
    {
      role: 'assistant',
      content: '发呆也好。有时候心静下来，比赶路更像回家。',
      timestamp: baseTime - 1000 * 60 * 38,
    },
  ],
}
