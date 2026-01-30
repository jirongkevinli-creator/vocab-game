/**
 * tts.js - 语音合成模块
 * 支持多语言TTS
 */

const TTS = {
  // 当前是否正在朗读
  isSpeaking: false,

  // 待朗读队列
  queue: [],

  // 可用声音列表
  availableVoices: [],

  /**
   * 初始化TTS，预加载声音
   */
  init() {
    // 预加载声音列表
    this.loadVoices();

    // 某些浏览器需要监听 voiceschanged 事件
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  },

  /**
   * 加载可用声音
   */
  loadVoices() {
    this.availableVoices = speechSynthesis.getVoices();
  },

  /**
   * 获取语言配置
   * @param {string} langCode - 语言代码 (en, zh, ko, ja)
   */
  getVoiceConfig(langCode) {
    return GameConfig.tts.voices[langCode] || GameConfig.tts.voices['en'];
  },

  /**
   * 取消当前所有朗读
   */
  cancel() {
    speechSynthesis.cancel();
    this.isSpeaking = false;
    this.queue = [];
  },

  /**
   * 朗读文本
   * @param {string} text - 要朗读的文本
   * @param {string} langCode - 语言代码
   * @returns {Promise} 朗读完成的Promise
   */
  speak(text, langCode) {
    return new Promise((resolve, reject) => {
      if (!text) {
        resolve();
        return;
      }

      const config = this.getVoiceConfig(langCode);
      const utterance = new SpeechSynthesisUtterance(text);

      utterance.lang = config.lang;
      utterance.rate = config.rate || GameConfig.tts.rate;
      utterance.pitch = config.pitch || GameConfig.tts.pitch;
      utterance.volume = config.volume || 1.0;

      // 尝试选择更柔和的声音
      const voices = this.availableVoices.length > 0 ? this.availableVoices : speechSynthesis.getVoices();
      if (voices.length > 0) {
        const langPrefix = config.lang.split('-')[0];
        // 优先选择女声（通常更柔和）
        const preferredVoice = voices.find(v =>
          v.lang.startsWith(langPrefix) &&
          (v.name.includes('Xiaoxiao') || v.name.includes('Yunxi') ||  // 微软中文女声
           v.name.includes('Huihui') || v.name.includes('Yaoyao') ||   // 其他中文女声
           v.name.includes('Female') || v.name.includes('female'))
        ) || voices.find(v =>
          v.lang.startsWith(langPrefix) &&
          (v.name.includes('Google') || v.name.includes('Microsoft'))
        ) || voices.find(v => v.lang.startsWith(langPrefix));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        resolve();
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        // 不将cancel作为错误处理
        if (e.error !== 'canceled') {
          console.error('TTS错误:', e);
        }
        resolve(); // 即使出错也resolve，避免阻塞
      };

      this.isSpeaking = true;
      speechSynthesis.speak(utterance);
    });
  },

  /**
   * 延迟
   * @param {number} ms - 毫秒数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * 朗读单词（根据当前练习模式）
   * @param {object} word - 单词对象
   */
  async speakWord(word) {
    if (!GameConfig.tts.speakWord || !GameConfig.display.autoSpeak) {
      return;
    }

    this.cancel();

    // 根据练习模式确定朗读内容
    // 正向(en-zh): 显示英文，朗读英文
    // 反向(zh-en): 显示中文，朗读中文
    const reverse = isReverseMode();
    const textToSpeak = reverse ? word.target : word.source;
    const langCode = reverse ? 'zh' : 'en';

    await this.speak(textToSpeak, langCode);
  },

  /**
   * 朗读例句
   * @param {string} example - 例句文本
   * @param {string} langCode - 语言代码
   */
  async speakExample(example, langCode) {
    if (!GameConfig.tts.speakExample || !example) {
      return;
    }

    await this.speak(example, langCode);
  },

  /**
   * 朗读单词和例句
   * @param {object} word - 单词对象
   */
  async speakWordAndExample(word) {
    if (!GameConfig.display.autoSpeak) {
      return;
    }

    this.cancel();

    const reverse = isReverseMode();
    const wordText = reverse ? word.target : word.source;
    const langCode = reverse ? 'zh' : 'en';

    const speakOrder = GameConfig.tts.speakOrder;

    if (speakOrder === 'word_only') {
      await this.speakWord(word);
    } else if (speakOrder === 'example_only' && word.example && !reverse) {
      // 例句只在正向模式朗读（英文例句）
      await this.speakExample(word.example, 'en');
    } else if (speakOrder === 'word_then_example') {
      // 先朗读单词
      if (GameConfig.tts.speakWord) {
        await this.speak(wordText, langCode);
      }

      // 例句只在正向模式朗读
      if (word.example && GameConfig.tts.speakExample && !reverse) {
        await this.delay(GameConfig.tts.pauseBetween);
        await this.speakExample(word.example, 'en');
      }
    }
  },

  /**
   * 手动触发朗读当前单词
   * @param {object} word - 单词对象
   */
  manualSpeak(word) {
    if (!word) return;

    this.cancel();

    const reverse = isReverseMode();
    const textToSpeak = reverse ? word.target : word.source;
    const langCode = reverse ? 'zh' : 'en';
    this.speak(textToSpeak, langCode);
  },

  /**
   * 手动触发朗读当前单词和例句
   * @param {object} word - 单词对象
   */
  manualSpeakAll(word) {
    if (!word) return;
    this.speakWordAndExample(word);
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TTS;
}
