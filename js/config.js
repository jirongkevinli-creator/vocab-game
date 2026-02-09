/**
 * config.js - 游戏配置文件
 * 词汇学习游戏 v2.0
 */

const GameConfig = {
  // 版本号
  version: '2.0',

  // 练习模式
  // 格式: "源语言-目标语言" 即 "看什么-选什么"
  // 可选值: "en-zh", "zh-en", "ko-zh", "zh-ko", "ja-zh", "zh-ja"
  practiceMode: 'en-zh',

  // 可用的练习模式列表
  availableModes: [
    { id: 'en-zh', name: '英语 → 中文', source: 'en', target: 'zh' },
    { id: 'zh-en', name: '中文 → 英语', source: 'zh', target: 'en' },
    { id: 'en-en', name: '英语 → 英语释义', source: 'en', target: 'en-def' },
    // { id: 'ko-zh', name: '韩语 → 中文', source: 'ko', target: 'zh' },
    // { id: 'zh-ko', name: '中文 → 韩语', source: 'zh', target: 'ko' },
    // { id: 'ja-zh', name: '日语 → 中文', source: 'ja', target: 'zh' },
    // { id: 'zh-ja', name: '中文 → 日语', source: 'zh', target: 'ja' },
  ],

  // 显示设置
  display: {
    showIcon: true,           // 显示图标
    showExample: true,        // 显示例句
    autoSpeak: true,          // 自动朗读
    speakDelay: 300,          // 题目显示后延迟朗读(ms)
    correctDisplayTime: 1500, // 答对后停留时间(ms)
    wrongDisplayTime: 2000,   // 答错后停留时间(ms)（多500ms便于记忆）
  },

  // TTS语音合成设置
  tts: {
    speakWord: true,                    // 朗读单词
    speakExample: true,                 // 朗读例句
    speakOrder: 'word_then_example',    // 朗读顺序: 'word_then_example' | 'word_only' | 'example_only'
    pauseBetween: 500,                  // 单词和例句之间暂停时间(ms)
    rate: 0.8,                          // 语速 (0.5 - 2.0)
    pitch: 1.1,                         // 音调 (0.5 - 2.0)
    // 各语言TTS配置
    voices: {
      en: { lang: 'en-US', rate: 0.8, pitch: 1.1 },
      zh: { lang: 'zh-CN', rate: 0.75, pitch: 0.95, volume: 0.9 },  // 更慢更柔和
      ko: { lang: 'ko-KR', rate: 0.8, pitch: 1.0 },
      ja: { lang: 'ja-JP', rate: 0.8, pitch: 1.0 },
    }
  },

  // 游戏规则
  rules: {
    correctToLevelUp: 10,     // 累计答对多少次升级
    streakToLevelDown: 3,     // 连续答错多少次降级
    maxLevel: 10,             // 最高级别
    minLevel: 0,              // 最低级别
  },

  // 错词库设置
  wrongWords: {
    autoSave: true,           // 自动保存错词
    removeOnCorrect: true,    // 错词库练习时答对移除
    trackStats: true,         // 记录统计信息
    storageKeyPrefix: 'vocab_wrongWords_',  // localStorage键前缀
  },

  // 用户数据存储
  storage: {
    currentUserKey: 'vocab_currentUser',
    settingsKeyPrefix: 'vocab_settings_',
    progressKeyPrefix: 'vocab_progress_',
  },

  // 级别描述
  levelDescriptions: {
    0: { name: 'Level 0 - 最基础', description: '简单日常词汇' },
    1: { name: 'Level 1 - 常见名词', description: '常见事物名词' },
    2: { name: 'Level 2 - 简单动词', description: '日常动作词汇' },
    3: { name: 'Level 3 - 家庭身体', description: '家庭成员和身体部位' },
    4: { name: 'Level 4 - 日常用品', description: '生活用品和地点' },
    5: { name: 'Level 5 - 自然天气', description: '自然现象和时间' },
    6: { name: 'Level 6 - 小学低年级', description: '小学1-3年级词汇' },
    7: { name: 'Level 7 - 小学高年级', description: '小学4-6年级词汇 (带图标)' },
    8: { name: 'Level 8 - 初中词汇', description: '初中英语词汇 (带图标)' },
    9: { name: 'Level 9 - 高中词汇', description: '高中英语词汇 (带图标)' },
    10: { name: 'Level 10 - 托福词汇', description: '托福考试词汇 (带图标)' },
  }
};

// 获取当前模式配置
function getCurrentModeConfig() {
  const mode = GameConfig.availableModes.find(m => m.id === GameConfig.practiceMode);
  return mode || GameConfig.availableModes[0];
}

// 获取语言对的词库ID
function getWordDataId() {
  const mode = getCurrentModeConfig();
  // 返回标准化的词库ID (总是源语言在前)
  const langs = [mode.source, mode.target].sort();
  if (langs[0] === 'en') {
    return 'en-zh'; // 英中词库
  }
  return `${langs[0]}-${langs[1]}`;
}

// 判断是否是反向模式 (例如: zh-en 相对于 en-zh 词库是反向)
function isReverseMode() {
  return GameConfig.practiceMode.startsWith('zh-');
}

// 判断是否是英英释义模式
function isDefinitionMode() {
  return GameConfig.practiceMode === 'en-en';
}

// 导出配置（用于模块化环境）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GameConfig, getCurrentModeConfig, getWordDataId, isReverseMode, isDefinitionMode };
}
