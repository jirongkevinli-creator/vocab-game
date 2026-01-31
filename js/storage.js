/**
 * storage.js - 存储管理模块
 * 管理用户数据、错词库、设置等
 */

const Storage = {
  // 版本号，用于数据迁移
  VERSION: '2.0',

  /**
   * 获取当前用户
   */
  getCurrentUser() {
    return localStorage.getItem(GameConfig.storage.currentUserKey) || '';
  },

  /**
   * 设置当前用户
   */
  setCurrentUser(username) {
    localStorage.setItem(GameConfig.storage.currentUserKey, username);
  },

  /**
   * 获取错词库存储键
   * @param {string} username - 用户名
   * @param {string} practiceMode - 练习模式 (如 'en-zh')
   */
  getWrongWordsKey(username, practiceMode) {
    // 统一使用词库ID (如 en-zh)，不区分方向
    const wordDataId = getWordDataId();
    return `${GameConfig.wrongWords.storageKeyPrefix}${username}_${wordDataId}`;
  },

  /**
   * 加载错词库
   * @param {string} username - 用户名
   * @returns {object} 错词库数据
   */
  loadWrongWords(username) {
    const key = this.getWrongWordsKey(username, GameConfig.practiceMode);
    const data = localStorage.getItem(key);

    if (!data) {
      return this.createEmptyWrongWords();
    }

    try {
      const parsed = JSON.parse(data);
      // 数据迁移：旧格式兼容
      if (Array.isArray(parsed)) {
        return this.migrateOldWrongWords(parsed, username);
      }
      return parsed;
    } catch (e) {
      console.error('解析错词库失败:', e);
      return this.createEmptyWrongWords();
    }
  },

  /**
   * 创建空的错词库结构
   */
  createEmptyWrongWords() {
    return {
      version: this.VERSION,
      lastUpdated: new Date().toISOString(),
      words: []
    };
  },

  /**
   * 迁移旧版本错词库数据
   * @param {Array} oldData - 旧格式数据 (单词数组)
   * @param {string} username - 用户名
   */
  migrateOldWrongWords(oldData, username) {
    console.log('迁移旧版本错词库数据...');

    const newData = {
      version: this.VERSION,
      lastUpdated: new Date().toISOString(),
      words: oldData.map((word, index) => ({
        wordId: `migrated-${index}`,
        word: {
          source: word.english,
          target: word.chinese,
          wrongOptions: {
            target: word.wrongOptions || [],
            source: []
          },
          icon: word.icon || null,
          example: null
        },
        stats: {
          errorCount: 1,
          correctCount: 0,
          lastErrorTime: new Date().toISOString(),
          lastCorrectTime: null,
          lastPracticeTime: new Date().toISOString()
        },
        tags: [],
        note: '',
        addedTime: new Date().toISOString(),
        level: word.level || 0
      }))
    };

    // 保存迁移后的数据
    this.saveWrongWords(username, newData);

    return newData;
  },

  /**
   * 保存错词库
   * @param {string} username - 用户名
   * @param {object} data - 错词库数据
   */
  saveWrongWords(username, data) {
    const key = this.getWrongWordsKey(username, GameConfig.practiceMode);
    data.lastUpdated = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(data));
  },

  /**
   * 添加单词到错词库
   * @param {string} username - 用户名
   * @param {object} word - 单词对象
   * @param {number} level - 当前级别
   */
  addToWrongWords(username, word, level) {
    if (!GameConfig.wrongWords.autoSave) return;

    const data = this.loadWrongWords(username);

    // 检查是否已存在
    const existingIndex = data.words.findIndex(w =>
      w.word.source === word.source || w.wordId === word.id
    );

    if (existingIndex >= 0) {
      // 更新统计
      const existing = data.words[existingIndex];
      existing.stats.errorCount++;
      existing.stats.lastErrorTime = new Date().toISOString();
      existing.stats.lastPracticeTime = new Date().toISOString();
    } else {
      // 添加新词
      data.words.push({
        wordId: word.id || `word-${Date.now()}`,
        word: {
          source: word.source,
          target: word.target,
          wrongOptions: word.wrongOptions || { target: [], source: [] },
          icon: word.icon || null,
          example: word.example || null
        },
        stats: {
          errorCount: 1,
          correctCount: 0,
          lastErrorTime: new Date().toISOString(),
          lastCorrectTime: null,
          lastPracticeTime: new Date().toISOString()
        },
        tags: [],
        note: '',
        addedTime: new Date().toISOString(),
        level: level
      });
    }

    this.saveWrongWords(username, data);
  },

  /**
   * 从错词库移除单词（答对时）
   * @param {string} username - 用户名
   * @param {object} word - 单词对象
   */
  removeFromWrongWords(username, word) {
    if (!GameConfig.wrongWords.removeOnCorrect) return;

    const data = this.loadWrongWords(username);

    // 找到并移除
    const index = data.words.findIndex(w =>
      w.word.source === word.source || w.wordId === word.id
    );

    if (index >= 0) {
      // 如果配置跟踪统计，先更新统计再移除
      if (GameConfig.wrongWords.trackStats) {
        data.words[index].stats.correctCount++;
        data.words[index].stats.lastCorrectTime = new Date().toISOString();
      }
      data.words.splice(index, 1);
      this.saveWrongWords(username, data);
    }
  },

  /**
   * 更新错词统计（答对但不移除）
   * @param {string} username - 用户名
   * @param {object} word - 单词对象
   * @param {boolean} isCorrect - 是否答对
   */
  updateWrongWordStats(username, word, isCorrect) {
    if (!GameConfig.wrongWords.trackStats) return;

    const data = this.loadWrongWords(username);

    const index = data.words.findIndex(w =>
      w.word.source === word.source || w.wordId === word.id
    );

    if (index >= 0) {
      const now = new Date().toISOString();
      if (isCorrect) {
        data.words[index].stats.correctCount++;
        data.words[index].stats.lastCorrectTime = now;
      } else {
        data.words[index].stats.errorCount++;
        data.words[index].stats.lastErrorTime = now;
      }
      data.words[index].stats.lastPracticeTime = now;
      this.saveWrongWords(username, data);
    }
  },

  /**
   * 获取错词库单词数量
   * @param {string} username - 用户名
   */
  getWrongWordsCount(username) {
    const data = this.loadWrongWords(username);
    return data.words.length;
  },

  /**
   * 获取错词库单词列表（转换为游戏可用格式）
   * @param {string} username - 用户名
   */
  getWrongWordsList(username) {
    const data = this.loadWrongWords(username);
    return data.words.map(item => ({
      id: item.wordId,
      source: item.word.source,
      target: item.word.target,
      wrongOptions: item.word.wrongOptions,
      icon: item.word.icon,
      example: item.word.example,
      level: item.level,
      stats: item.stats
    }));
  },

  /**
   * 批量添加错词
   * @param {string} username - 用户名
   * @param {Array} words - 单词数组
   * @param {number} level - 级别
   */
  addBatchToWrongWords(username, words, level) {
    words.forEach(word => {
      this.addToWrongWords(username, word, level);
    });
  },

  /**
   * 清空用户错词库
   * @param {string} username - 用户名
   */
  clearWrongWords(username) {
    const key = this.getWrongWordsKey(username, GameConfig.practiceMode);
    localStorage.removeItem(key);
  },

  /**
   * 导出错词库为JSON
   * @param {string} username - 用户名
   */
  exportWrongWords(username) {
    const data = this.loadWrongWords(username);
    return JSON.stringify(data, null, 2);
  },

  /**
   * 验证错词数据项结构
   * @param {object} item - 错词项
   * @returns {boolean} 是否有效
   */
  validateWrongWordItem(item) {
    if (!item || typeof item !== 'object') return false;
    if (!item.word || typeof item.word !== 'object') return false;
    if (typeof item.word.source !== 'string' || !item.word.source) return false;
    if (typeof item.word.target !== 'string' || !item.word.target) return false;
    return true;
  },

  /**
   * 清理错词数据项，移除潜在的危险内容
   * @param {object} item - 错词项
   * @returns {object} 清理后的错词项
   */
  sanitizeWrongWordItem(item) {
    return {
      wordId: String(item.wordId || `imported-${Date.now()}`),
      word: {
        source: String(item.word.source).slice(0, 200),
        target: String(item.word.target).slice(0, 200),
        wrongOptions: item.word.wrongOptions || { target: [], source: [] },
        icon: item.word.icon ? String(item.word.icon).slice(0, 10) : null,
        example: item.word.example ? String(item.word.example).slice(0, 500) : null
      },
      stats: {
        errorCount: parseInt(item.stats?.errorCount) || 0,
        correctCount: parseInt(item.stats?.correctCount) || 0,
        lastErrorTime: item.stats?.lastErrorTime || null,
        lastCorrectTime: item.stats?.lastCorrectTime || null,
        lastPracticeTime: item.stats?.lastPracticeTime || null
      },
      tags: Array.isArray(item.tags) ? item.tags.map(t => String(t).slice(0, 50)).slice(0, 10) : [],
      note: item.note ? String(item.note).slice(0, 500) : '',
      addedTime: item.addedTime || new Date().toISOString(),
      level: parseInt(item.level) || 0
    };
  },

  /**
   * 导入错词库
   * @param {string} username - 用户名
   * @param {string} jsonString - JSON字符串
   * @returns {object} { success: boolean, message: string, imported: number }
   */
  importWrongWords(username, jsonString) {
    try {
      const data = JSON.parse(jsonString);

      if (!data || typeof data !== 'object') {
        return { success: false, message: '无效的JSON格式', imported: 0 };
      }

      if (!data.words || !Array.isArray(data.words)) {
        return { success: false, message: '缺少words数组', imported: 0 };
      }

      if (data.words.length > 10000) {
        return { success: false, message: '错词数量超过限制(最多10000)', imported: 0 };
      }

      const validWords = [];
      for (const item of data.words) {
        if (this.validateWrongWordItem(item)) {
          validWords.push(this.sanitizeWrongWordItem(item));
        }
      }

      if (validWords.length === 0) {
        return { success: false, message: '没有有效的错词数据', imported: 0 };
      }

      const sanitizedData = {
        version: this.VERSION,
        lastUpdated: new Date().toISOString(),
        words: validWords
      };

      this.saveWrongWords(username, sanitizedData);
      return { success: true, message: '导入成功', imported: validWords.length };
    } catch (e) {
      console.error('导入错词库失败:', e);
      return { success: false, message: '解析JSON失败: ' + e.message, imported: 0 };
    }
  },

  /**
   * 加载用户设置
   * @param {string} username - 用户名
   */
  loadUserSettings(username) {
    const key = `${GameConfig.storage.settingsKeyPrefix}${username}`;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return {};
      }
    }
    return {};
  },

  /**
   * 保存用户设置
   * @param {string} username - 用户名
   * @param {object} settings - 设置对象
   */
  saveUserSettings(username, settings) {
    const key = `${GameConfig.storage.settingsKeyPrefix}${username}`;
    localStorage.setItem(key, JSON.stringify(settings));
  },

  /**
   * 加载用户进度
   * @param {string} username - 用户名
   */
  loadUserProgress(username) {
    const key = `${GameConfig.storage.progressKeyPrefix}${username}`;
    const data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return { level: 0, totalAnswered: 0, totalCorrect: 0 };
      }
    }
    return { level: 0, totalAnswered: 0, totalCorrect: 0 };
  },

  /**
   * 保存用户进度
   * @param {string} username - 用户名
   * @param {object} progress - 进度对象
   */
  saveUserProgress(username, progress) {
    const key = `${GameConfig.storage.progressKeyPrefix}${username}`;
    localStorage.setItem(key, JSON.stringify(progress));
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
