/**
 * story.js - 故事生成模块
 * 使用 Anthropic API 根据错词库生成双语故事
 */

const Story = {
  // 故事风格配置
  STYLES: {
    peppa: {
      id: 'peppa',
      name: '小猪佩奇',
      description: '温馨可爱的家庭故事，适合儿童',
      prompt: '请用小猪佩奇风格写一个温馨可爱的家庭故事。故事中应该有Peppa、George、Mummy Pig和Daddy Pig等角色。'
    },
    harry_potter: {
      id: 'harry_potter',
      name: '哈利波特',
      description: '魔法世界的冒险故事',
      prompt: '请用哈利波特魔法世界的风格写一个冒险故事。故事发生在霍格沃茨，可以包含魔法、咒语和奇幻元素。'
    },
    disney: {
      id: 'disney',
      name: '迪士尼',
      description: '梦幻浪漫的童话故事',
      prompt: '请用迪士尼童话风格写一个梦幻浪漫的故事。故事应该充满希望和正能量，适合全家观看。'
    },
    adventure: {
      id: 'adventure',
      name: '探险故事',
      description: '勇敢探索未知世界',
      prompt: '请写一个激动人心的探险故事。主角需要克服困难，探索未知领域，最终获得成长。'
    },
    science: {
      id: 'science',
      name: '科幻故事',
      description: '未来科技与太空探索',
      prompt: '请写一个科幻故事。可以涉及太空探索、未来科技、机器人或时间旅行等元素。'
    },
    funny: {
      id: 'funny',
      name: '幽默故事',
      description: '轻松搞笑的日常故事',
      prompt: '请写一个轻松幽默的故事。故事应该有趣好笑，让读者开心大笑。'
    }
  },

  // 可用模型
  MODELS: [
    { id: 'claude-sonnet-4-20250514', name: 'Sonnet (推荐)', description: '平衡速度与质量' },
    { id: 'claude-haiku-4-20250514', name: 'Haiku', description: '最快速度' },
    { id: 'claude-opus-4-20250514', name: 'Opus', description: '最高质量' }
  ],

  // API Key 存储键
  API_KEY_STORAGE_KEY: 'vocab_story_api_key',

  // 当前状态
  state: {
    isGenerating: false,
    isSpeaking: false,
    currentStory: null,
    englishText: '',
    chineseText: ''
  },

  /**
   * 保存 API Key 到 localStorage
   * @param {string} key - API Key
   */
  saveApiKey(key) {
    if (key && key.trim()) {
      localStorage.setItem(this.API_KEY_STORAGE_KEY, key.trim());
      return true;
    }
    return false;
  },

  /**
   * 从 localStorage 加载 API Key
   * @returns {string} API Key
   */
  loadApiKey() {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY) || '';
  },

  /**
   * 清除保存的 API Key
   */
  clearApiKey() {
    localStorage.removeItem(this.API_KEY_STORAGE_KEY);
  },

  /**
   * 获取掩码后的 API Key 用于显示
   * @returns {string} 掩码后的 key，如 "sk-...xxxx"
   */
  getMaskedKey() {
    const key = this.loadApiKey();
    if (!key) return '';
    if (key.length <= 8) return '****';
    return key.substring(0, 7) + '...' + key.substring(key.length - 4);
  },

  /**
   * 检查是否有保存的 API Key
   * @returns {boolean}
   */
  hasApiKey() {
    return !!this.loadApiKey();
  },

  /**
   * 从错词库提取单词
   * @param {Array} wordsList - 错词列表
   * @param {number} maxCount - 最大数量（默认10）
   * @returns {Array} 单词数组 [{source, target}]
   */
  extractWords(wordsList, maxCount = 10) {
    if (!wordsList || wordsList.length === 0) {
      return [];
    }

    let words = wordsList.map(item => ({
      source: item.source,
      target: item.target
    }));

    // 如果超过最大数量，随机选择
    if (words.length > maxCount) {
      words = this.shuffleArray(words).slice(0, maxCount);
    }

    return words;
  },

  /**
   * 随机打乱数组
   * @param {Array} array - 数组
   * @returns {Array} 打乱后的数组
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  /**
   * 构建故事生成的 prompt
   * @param {Array} words - 单词列表
   * @param {string} styleId - 风格ID
   * @returns {string} 完整的 prompt
   */
  buildPrompt(words, styleId) {
    const style = this.STYLES[styleId] || this.STYLES.peppa;
    const wordList = words.map(w => `${w.source} (${w.target})`).join(', ');

    return `你是一位儿童故事作家。${style.prompt}

请写一个 300-500 词的英语故事，故事中必须自然地使用以下单词：
${wordList}

输出格式要求（必须严格遵守）：
1. 先输出完整的英文故事
2. 然后输出一行 "---" 作为分隔线
3. 最后输出完整的中文翻译（尽量逐句对应翻译）
4. 在两个版本中都用 **粗体** 标注目标单词

注意：
- 故事要有趣、积极向上
- 语言要简单易懂，适合英语学习者
- 确保每个目标单词都在故事中出现至少一次
- 粗体标注必须使用 **单词** 格式`;
  },

  /**
   * 调用 Anthropic API 生成故事
   * @param {Array} words - 单词列表
   * @param {string} styleId - 风格ID
   * @param {string} modelId - 模型ID
   * @param {string} apiKey - API Key
   * @returns {Promise<string>} 生成的故事
   */
  async generateStory(words, styleId, modelId, apiKey) {
    if (this.state.isGenerating) {
      throw new Error('正在生成中，请稍候');
    }

    if (!words || words.length === 0) {
      throw new Error('没有可用的单词');
    }

    if (!apiKey) {
      throw new Error('请输入 API Key');
    }

    this.state.isGenerating = true;

    try {
      const prompt = this.buildPrompt(words, styleId);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: modelId,
          max_tokens: 2048,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      const storyText = data.content[0]?.text || '';

      // 解析双语内容
      this.parseStory(storyText);

      this.state.currentStory = storyText;
      return storyText;
    } finally {
      this.state.isGenerating = false;
    }
  },

  /**
   * 解析故事，分离英文和中文部分
   * @param {string} storyText - 完整故事文本
   */
  parseStory(storyText) {
    // 按 "---" 分隔
    const parts = storyText.split(/\n---\n|\n---|\n-{3,}\n/);

    if (parts.length >= 2) {
      this.state.englishText = parts[0].trim();
      this.state.chineseText = parts.slice(1).join('\n').trim();
    } else {
      // 如果没有分隔符，尝试检测中英文
      this.state.englishText = storyText;
      this.state.chineseText = '';
    }
  },

  /**
   * 简单的 Markdown 转 HTML
   * @param {string} md - Markdown 文本
   * @returns {string} HTML 文本
   */
  markdownToHtml(md) {
    if (!md) return '';

    let html = md
      // 转义 HTML 特殊字符
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // 粗体
      .replace(/\*\*(.+?)\*\*/g, '<strong class="highlight-word">$1</strong>')
      // 标题
      .replace(/^### (.+)$/gm, '<h4>$1</h4>')
      .replace(/^## (.+)$/gm, '<h3>$1</h3>')
      .replace(/^# (.+)$/gm, '<h2>$1</h2>')
      // 段落
      .replace(/\n\n/g, '</p><p>')
      // 换行
      .replace(/\n/g, '<br>');

    return '<p>' + html + '</p>';
  },

  /**
   * 获取英文故事 HTML
   * @returns {string}
   */
  getEnglishHtml() {
    return this.markdownToHtml(this.state.englishText);
  },

  /**
   * 获取中文故事 HTML
   * @returns {string}
   */
  getChineseHtml() {
    return this.markdownToHtml(this.state.chineseText);
  },

  /**
   * 获取纯文本版本（用于下载）
   * @returns {string}
   */
  getPlainText() {
    return this.state.currentStory || '';
  },

  /**
   * 朗读英文故事
   */
  speakEnglish() {
    if (!this.state.englishText) return;

    // 移除 markdown 标记
    const plainText = this.state.englishText.replace(/\*\*/g, '');

    // 分段朗读，避免 TTS 超时
    this.speakInChunks(plainText, 'en');
  },

  /**
   * 朗读中文故事
   */
  speakChinese() {
    if (!this.state.chineseText) return;

    // 移除 markdown 标记
    const plainText = this.state.chineseText.replace(/\*\*/g, '');

    // 分段朗读
    this.speakInChunks(plainText, 'zh');
  },

  /**
   * 分段朗读文本
   * @param {string} text - 文本
   * @param {string} lang - 语言代码
   */
  async speakInChunks(text, lang) {
    // 按段落分割
    const paragraphs = text.split(/\n\n|\n/).filter(p => p.trim());

    TTS.cancel();
    this.state.isSpeaking = true;

    for (const paragraph of paragraphs) {
      // 检查是否应该停止
      if (!this.state.isSpeaking) break;

      if (paragraph.trim()) {
        await TTS.speak(paragraph.trim(), lang);
        // 段落间短暂停顿
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }

    this.state.isSpeaking = false;
  },

  /**
   * 停止朗读
   */
  stopSpeaking() {
    this.state.isSpeaking = false;
    TTS.cancel();
  },

  /**
   * 复制故事到剪贴板
   * @returns {Promise<boolean>}
   */
  async copyStory() {
    const text = this.getPlainText();
    if (!text) return false;

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.error('复制失败:', e);
      return false;
    }
  },

  /**
   * 下载故事为文本文件
   */
  downloadStory() {
    const text = this.getPlainText();
    if (!text) return;

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `story_${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Story;
}
