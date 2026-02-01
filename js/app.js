/**
 * app.js - 应用主入口
 * 初始化和事件绑定
 */

const App = {
  /**
   * 初始化应用
   */
  init() {
    // 初始化UI
    UI.init();

    // 初始化TTS（预加载声音）
    TTS.init();

    // 初始化游戏
    Game.init();

    // 初始化界面
    this.initUI();

    // 绑定事件
    this.bindEvents();

    // 检查并恢复上次登录用户
    this.restoreLastUser();
  },

  /**
   * 初始化界面
   */
  initUI() {
    // 更新练习模式选择器
    UI.updatePracticeModeSelector();

    // 初始化级别选择器
    UI.initLevelSelector();
  },

  /**
   * 绑定事件
   */
  bindEvents() {
    // 用户名输入变化时更新错词库数量
    const usernameInput = document.getElementById('usernameInput');
    if (usernameInput) {
      usernameInput.addEventListener('input', (e) => {
        UI.updateWrongWordsCount(e.target.value.trim());
      });

      // 回车键开始游戏
      usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.startGame();
        }
      });
    }

    // 练习模式选择变化
    const modeSelect = document.getElementById('practiceModeSelect');
    if (modeSelect) {
      modeSelect.addEventListener('change', (e) => {
        GameConfig.practiceMode = e.target.value;
        // 更新错词库显示（不同语言对有不同的错词库）
        const username = usernameInput?.value.trim();
        if (username) {
          UI.updateWrongWordsCount(username);
        }
      });
    }

    // 级别选择变化
    const levelSelect = document.getElementById('levelSelect');
    if (levelSelect) {
      levelSelect.addEventListener('change', (e) => {
        Game.changeLevel(parseInt(e.target.value));
      });
    }
  },

  /**
   * 恢复上次登录用户
   */
  restoreLastUser() {
    const savedUser = Storage.getCurrentUser();
    if (savedUser) {
      const usernameInput = document.getElementById('usernameInput');
      if (usernameInput) {
        usernameInput.value = savedUser;
        UI.updateWrongWordsCount(savedUser);
      }
    }
  },

  /**
   * 开始游戏（从登录界面调用）
   */
  startGame() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username) {
      UI.alert('请输入你的名字！');
      document.getElementById('usernameInput').focus();
      return;
    }

    Game.startNormalGame(username);
  },

  /**
   * 练习错词库（从登录界面调用）
   */
  practiceWrongWords() {
    const username = document.getElementById('usernameInput').value.trim();
    if (!username) {
      UI.alert('请输入你的名字！');
      document.getElementById('usernameInput').focus();
      return;
    }

    Game.startWrongWordsPractice(username);
  },

  /**
   * 朗读单词
   */
  speakWord() {
    Game.speakCurrentWord();
  },

  /**
   * 重新开始
   */
  restart() {
    Game.restart();
  },

  /**
   * 显示结束游戏弹窗
   */
  showEndGameModal() {
    Game.showEndGameModal();
  },

  /**
   * 隐藏结束游戏弹窗
   */
  hideEndGameModal() {
    UI.hideEndGameModal();
  },

  /**
   * 确认结束游戏
   */
  confirmEndGame() {
    const saveWrongWords = document.getElementById('saveWrongWords')?.checked ?? true;
    Game.confirmEndGame(saveWrongWords);
  },

  /**
   * 显示设置弹窗
   */
  showSettingsModal() {
    UI.showSettingsModal();
  },

  /**
   * 隐藏设置弹窗
   */
  hideSettingsModal() {
    UI.hideSettingsModal();
  },

  /**
   * 切换设置开关
   * @param {string} settingKey - 设置键
   * @param {HTMLElement} toggleElement - 开关元素
   */
  toggleSetting(settingKey, toggleElement) {
    const parts = settingKey.split('.');
    let obj = GameConfig;

    // 导航到最后一级的父对象
    for (let i = 0; i < parts.length - 1; i++) {
      obj = obj[parts[i]];
    }

    // 切换值
    const key = parts[parts.length - 1];
    obj[key] = !obj[key];

    // 更新UI
    toggleElement.classList.toggle('active', obj[key]);

    // 保存用户设置
    this.saveUserSettings();
  },

  /**
   * 保存用户设置
   */
  saveUserSettings() {
    const username = Game.state.currentUser || Storage.getCurrentUser();
    if (username) {
      Storage.saveUserSettings(username, {
        display: GameConfig.display,
        tts: GameConfig.tts
      });
    }
  },

  /**
   * 加载用户设置
   * @param {string} username - 用户名
   */
  loadUserSettings(username) {
    const settings = Storage.loadUserSettings(username);
    if (settings.display) {
      Object.assign(GameConfig.display, settings.display);
    }
    if (settings.tts) {
      Object.assign(GameConfig.tts, settings.tts);
    }
  },

  /**
   * 从第0级重新开始（通关后）
   */
  restartFromLevelZero() {
    Game.restartFromLevelZero();
  },

  /**
   * 通关后退出游戏
   */
  exitAfterComplete() {
    // 保存错词
    if (Game.state.sessionWrongWords.length > 0) {
      Game.state.sessionWrongWords.forEach(word => {
        Storage.addToWrongWords(Game.state.currentUser, word, Game.state.currentLevel);
      });
    }

    // 保存进度
    Storage.saveUserProgress(Game.state.currentUser, {
      level: Game.state.currentLevel,
      totalAnswered: Game.state.totalAnswered,
      totalCorrect: Game.state.totalCorrect
    });

    UI.hideGameCompleteModal();
    Game.backToLogin();
  },

  /**
   * 显示错词库详情
   */
  showWrongWordsDetail() {
    const username = Game.state.currentUser || Storage.getCurrentUser();
    if (username) {
      const words = Storage.getWrongWordsList(username);
      UI.showWrongWordsModal(words, (index) => Game.removeWrongWord(index));
    }
  },

  /**
   * 隐藏错词库详情
   */
  hideWrongWordsModal() {
    UI.hideWrongWordsModal();
  },

  /**
   * 导出错词库
   */
  exportWrongWords() {
    const username = Game.state.currentUser || Storage.getCurrentUser();
    if (!username) {
      UI.alert('请先登录');
      return;
    }

    const data = Storage.exportWrongWords(username);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `vocab_wrong_words_${username}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * 清空错词库
   */
  clearWrongWords() {
    const username = Game.state.currentUser || Storage.getCurrentUser();
    if (!username) {
      UI.alert('请先登录');
      return;
    }

    if (UI.confirm('确定要清空错词库吗？此操作不可恢复！')) {
      Storage.clearWrongWords(username);
      UI.updateWrongWordsCount(username);
      UI.hideWrongWordsModal();
      UI.alert('错词库已清空');
    }
  },

  /**
   * 隐藏词汇详情面板
   */
  hideWordDetail() {
    UI.hideWordDetail();
  },

  // ========== 故事生成功能 ==========

  /**
   * 显示故事生成弹窗
   */
  showStoryModal() {
    UI.showStoryModal();
  },

  /**
   * 隐藏故事生成弹窗
   */
  hideStoryModal() {
    UI.hideStoryModal();
  },

  /**
   * 保存故事 API Key
   */
  saveStoryApiKey() {
    const input = document.getElementById('apiKeyInput');
    const key = input?.value?.trim();

    if (!key) {
      UI.alert('请输入 API Key');
      return;
    }

    if (Story.saveApiKey(key)) {
      input.value = '';
      UI.updateApiKeyStatus();
      UI.alert('API Key 已保存');
    }
  },

  /**
   * 清除故事 API Key
   */
  clearStoryApiKey() {
    if (UI.confirm('确定要清除保存的 API Key 吗？')) {
      Story.clearApiKey();
      UI.updateApiKeyStatus();
    }
  },

  /**
   * 生成故事
   */
  async generateStory() {
    const username = Game.state.currentUser || Storage.getCurrentUser();
    if (!username) {
      UI.alert('请先登录');
      return;
    }

    // 获取错词列表
    const wordsList = Storage.getWrongWordsList(username);
    if (wordsList.length === 0) {
      UI.alert('错词库是空的，请先积累一些错词再来生成故事');
      return;
    }

    // 获取 API Key
    const apiKey = Story.loadApiKey();
    if (!apiKey) {
      UI.alert('请先输入并保存 API Key');
      return;
    }

    // 获取选择的风格和模型
    const styleId = document.querySelector('.style-option.selected')?.dataset?.style || 'peppa';
    const modelId = document.getElementById('modelSelect')?.value || Story.MODELS[0].id;

    // 提取单词
    const words = Story.extractWords(wordsList);

    // 显示加载状态
    UI.showStoryLoading();

    try {
      await Story.generateStory(words, styleId, modelId, apiKey);
      UI.showStoryResult();
    } catch (error) {
      UI.hideStoryLoading();
      UI.alert('生成失败: ' + error.message);
    }
  },

  /**
   * 显示故事设置（重新生成）
   */
  showStorySettings() {
    UI.showStorySettings();
  },

  /**
   * 朗读英文故事
   */
  speakStoryEnglish() {
    Story.speakEnglish();
  },

  /**
   * 朗读中文故事
   */
  speakStoryChinese() {
    Story.speakChinese();
  },

  /**
   * 停止故事朗读
   */
  stopStorySpeaking() {
    Story.stopSpeaking();
  },

  /**
   * 复制故事
   */
  async copyStory() {
    const success = await Story.copyStory();
    if (success) {
      UI.alert('已复制到剪贴板');
    } else {
      UI.alert('复制失败');
    }
  },

  /**
   * 下载故事
   */
  downloadStory() {
    Story.downloadStory();
  }
};

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
