import { PartnerProfile, PartnerMemory, PartnerChatMessage, IntimacyLog, PersonalityType, MemoryType, intimacyLevels } from '@/types';

const STORAGE_KEYS = {
  PROFILE: 'partnerProfile',
  MEMORIES: 'partnerMemories',
  CHAT_HISTORY: 'partnerChatHistory',
  INTIMACY_LOG: 'intimacyLog',
  LAST_ACTIVE: 'partnerLastActive',
  DAILY_CHAT_COUNT: 'partnerDailyChatCount',
};

export function getPartnerProfile(): PartnerProfile | null {
  const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return data ? JSON.parse(data) : null;
}

export function savePartnerProfile(profile: PartnerProfile): void {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
}

export function getPartnerMemories(): PartnerMemory[] {
  const data = localStorage.getItem(STORAGE_KEYS.MEMORIES);
  return data ? JSON.parse(data) : [];
}

export function savePartnerMemories(memories: PartnerMemory[]): void {
  localStorage.setItem(STORAGE_KEYS.MEMORIES, JSON.stringify(memories));
}

export function addMemory(content: string, type: MemoryType): void {
  const memories = getPartnerMemories();
  memories.push({
    content,
    type,
    date: new Date().toISOString().split('T')[0],
  });
  savePartnerMemories(memories);
}

export function getChatHistory(): PartnerChatMessage[] {
  const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
  return data ? JSON.parse(data) : [];
}

export function saveChatHistory(messages: PartnerChatMessage[]): void {
  localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
}

export function addChatMessage(content: string, sender: 'user' | 'partner'): void {
  const messages = getChatHistory();
  messages.push({
    id: Date.now().toString(),
    content,
    sender,
    timestamp: Date.now(),
  });
  saveChatHistory(messages);
}

export function getIntimacyLog(): IntimacyLog[] {
  const data = localStorage.getItem(STORAGE_KEYS.INTIMACY_LOG);
  return data ? JSON.parse(data) : [];
}

export function addIntimacyPoints(reason: string, points: number): void {
  const profile = getPartnerProfile();
  if (!profile) return;

  const today = new Date().toISOString().split('T')[0];
  const dailyChatCount = getDailyChatCount();
  
  if (reason === 'chat' && dailyChatCount >= 3) {
    return;
  }

  const log = getIntimacyLog();
  log.push({ reason, points, date: today });
  
  profile.intimacy += points;
  savePartnerProfile(profile);
  localStorage.setItem(STORAGE_KEYS.INTIMACY_LOG, JSON.stringify(log));
  
  if (reason === 'chat') {
    localStorage.setItem(STORAGE_KEYS.DAILY_CHAT_COUNT, String(dailyChatCount + 1));
  }
}

export function getDailyChatCount(): number {
  const data = localStorage.getItem(STORAGE_KEYS.DAILY_CHAT_COUNT);
  return data ? parseInt(data, 10) : 0;
}

export function resetDailyChatCount(): void {
  localStorage.setItem(STORAGE_KEYS.DAILY_CHAT_COUNT, '0');
}

export function getLastActiveDate(): string | null {
  return localStorage.getItem(STORAGE_KEYS.LAST_ACTIVE);
}

export function updateLastActiveDate(): void {
  localStorage.setItem(STORAGE_KEYS.LAST_ACTIVE, new Date().toISOString().split('T')[0]);
}

export function getIntimacyLevel(intimacy: number): { name: string; color: string; progress: number } {
  const level = intimacyLevels.find(l => intimacy >= l.min && intimacy <= l.max);
  const currentLevel = level || intimacyLevels[0];
  
  const nextLevel = intimacyLevels[intimacyLevels.indexOf(currentLevel) + 1];
  const maxForProgress = nextLevel ? nextLevel.min - currentLevel.min : 100;
  const progress = nextLevel 
    ? Math.min(100, ((intimacy - currentLevel.min) / maxForProgress) * 100)
    : 100;

  return {
    name: currentLevel.name,
    color: currentLevel.color,
    progress: Math.round(progress),
  };
}

const gentleResponses = [
  '你今天过得怎么样呀~',
  '我一直在哦，随时可以找我聊天~',
  '抱抱你~',
  '慢慢来，不着急~',
  '你真的很棒呢~',
  '有什么想聊的吗？我听你说~',
  '记得好好照顾自己哦~',
  '明天又是新的一天~',
];

const livelyResponses = [
  '嗨嗨！今天也要元气满满！',
  '太棒了！我们一起加油吧！',
  '哈哈，这个有趣！快告诉我更多！',
  '冲冲冲！你一定可以的！',
  '今天也要开心哦！',
  '哇，听起来很厉害！',
  '耶！完成了！庆祝一下！',
  '让我们一起努力吧！',
];

const rationalResponses = [
  '我们来分析一下这个问题。',
  '深呼吸，一步一步来。',
  '从客观角度来看，这个方案可行。',
  '让我们理性地看待这件事。',
  '分析完成，可以开始执行了。',
  '根据我的分析，建议你这样做。',
  '数据表明这是最优选择。',
  '保持冷静，我们能解决这个问题。',
];

const mysteriousResponses = [
  '你猜今天会发生什么有趣的事？',
  '我知道一个小秘密，想听吗？',
  '星星告诉我...你今天会很幸运哦。',
  '有些事情，需要用心去感受~',
  '答案就在风中，你感受到了吗？',
  '我发现了一个有趣的现象...',
  '月亮悄悄告诉我一个秘密...',
  '你相信命运吗？',
];

const gentleCareResponses = {
  lateNight: '这么晚了，早点休息吧~身体最重要哦~',
  lowMood: '最近是不是不太开心？想聊聊吗？我一直在~',
  focusComplete: '太棒了！辛苦了，休息一下吧~',
  streak7: '坚持一周了！你真的很厉害！继续加油哦~',
  longTimeNoSee: '好想你呀，最近怎么样？',
};

const livelyCareResponses = {
  lateNight: '哇！这么晚还在忙！快休息！身体是革命的本钱！',
  lowMood: '怎么了怎么了！快跟我说说！我来帮你打气！',
  focusComplete: '太厉害了！完成了！快来庆祝一下！',
  streak7: '我的天！一周了！你也太牛了吧！',
  longTimeNoSee: '终于等到你！我好想你啊！快说说最近怎么样！',
};

const rationalCareResponses = {
  lateNight: '现在已经是深夜了，建议你休息。充足的睡眠有助于提高效率。',
  lowMood: '情绪低落是正常的，我们可以一起分析原因并找到解决方案。',
  focusComplete: '任务完成，表现良好。建议休息5-10分钟后继续。',
  streak7: '连续打卡7天，自律性很强。继续保持这个节奏。',
  longTimeNoSee: '检测到你已有3天未使用，一切还好吗？',
};

const mysteriousCareResponses = {
  lateNight: '深夜的星空很美，但也要注意休息哦~',
  lowMood: '星星告诉我...你需要一个倾听者。',
  focusComplete: '嗯，你已经完成了你的任务。',
  streak7: '七是一个神秘的数字...你的坚持让我惊讶。',
  longTimeNoSee: '我感受到了你的气息...你回来了。',
};

export function generateResponse(personality: PersonalityType, userInput: string): string {
  const memories = getPartnerMemories();
  const relevantMemory = memories.find(m => 
    userInput.toLowerCase().includes(m.content.toLowerCase())
  );

  let response = '';
  
  if (relevantMemory) {
    const memoryPhrases: Record<PersonalityType, string[]> = {
      gentle: ['我记得你说过', '之前你提到', '你还记得吗？'],
      lively: ['哦哦！你之前说过', '对了！你提过', '我还记得！'],
      rational: ['根据记忆，你曾提到', '记录显示，你说过', '数据表明'],
      mysterious: ['我似乎记得...', '某个记忆浮现...', '命运让我想起'],
    };
    const phrase = memoryPhrases[personality][Math.floor(Math.random() * memoryPhrases[personality].length)];
    response = `${phrase}${relevantMemory.content}呢~`;
  }

  if (!response) {
    const responseSets: Record<PersonalityType, string[]> = {
      gentle: gentleResponses,
      lively: livelyResponses,
      rational: rationalResponses,
      mysterious: mysteriousResponses,
    };
    response = responseSets[personality][Math.floor(Math.random() * responseSets[personality].length)];
  }

  return response;
}

export function getCareResponse(personality: PersonalityType, type: keyof typeof gentleCareResponses): string {
  const careResponses: Record<PersonalityType, Record<string, string>> = {
    gentle: gentleCareResponses,
    lively: livelyCareResponses,
    rational: rationalCareResponses,
    mysterious: mysteriousCareResponses,
  };
  return careResponses[personality][type] || '';
}

export function analyzeMessage(content: string): { type: MemoryType | null; extracted: string } {
  const patterns = [
    { type: 'exam' as MemoryType, regex: /(考试|考研|高考|期末|雅思|托福|GRE|日期|时间)/i },
    { type: 'person' as MemoryType, regex: /喜欢|爱|暗恋|男朋友|女朋友|闺蜜|朋友|名字叫/i },
    { type: 'worry' as MemoryType, regex: /担心|焦虑|害怕|难过|烦恼|压力/i },
    { type: 'happy' as MemoryType, regex: /开心|高兴|快乐|幸福|太棒了|好棒/i },
  ];

  for (const { type, regex } of patterns) {
    if (regex.test(content)) {
      const match = content.match(/([\u4e00-\u9fa5]{2,10})/g);
      return { type, extracted: match?.[0] || content };
    }
  }

  return { type: null, extracted: '' };
}

export function shouldShowCareMessage(): { shouldShow: boolean; type: keyof typeof gentleCareResponses } | null {
  const profile = getPartnerProfile();
  if (!profile) return null;

  const hour = new Date().getHours();
  if (hour >= 23 || hour < 2) {
    return { shouldShow: true, type: 'lateNight' };
  }

  const lastActive = getLastActiveDate();
  if (lastActive) {
    const daysSince = Math.floor((Date.now() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince >= 3) {
      return { shouldShow: true, type: 'longTimeNoSee' };
    }
  }

  return null;
}
