/**
 * game.js - 游戏核心逻辑
 * 处理游戏流程、答题逻辑、升降级等
 */

const Game = {
  // 游戏状态
  state: {
    currentUser: '',
    currentLevel: 0,
    currentWord: null,
    correctStreak: 0,
    wrongStreak: 0,
    levelCorrectCount: 0,
    totalAnswered: 0,
    totalCorrect: 0,
    sessionWrongWords: [],
    sessionCorrectWords: [],  // 本次已答对的单词（不再重复）
    isWrongWordsPracticeMode: false,
    wrongWordsList: [],
    isProcessing: false,
  },

  /**
   * 初始化游戏
   */
  init() {
    this.resetState();
  },

  /**
   * 重置游戏状态
   */
  resetState() {
    this.state = {
      currentUser: '',
      currentLevel: 0,
      currentWord: null,
      correctStreak: 0,
      wrongStreak: 0,
      levelCorrectCount: 0,
      totalAnswered: 0,
      totalCorrect: 0,
      sessionWrongWords: [],
      sessionCorrectWords: [],  // 本次已答对的单词（不再重复）
      isWrongWordsPracticeMode: false,
      wrongWordsList: [],
      isProcessing: false,
    };
  },

  /**
   * 开始正常游戏
   * @param {string} username - 用户名
   */
  startNormalGame(username) {
    this.resetState();
    this.state.currentUser = username;
    this.state.isWrongWordsPracticeMode = false;

    Storage.setCurrentUser(username);

    // 加载用户进度
    const progress = Storage.loadUserProgress(username);
    this.state.currentLevel = progress.level || 1;

    // 更新UI
    UI.showGameScreen();
    UI.updateUserDisplay(username);
    UI.updateModeBadge(false);
    UI.setLevelSelectorEnabled(true);
    UI.updateLevelDisplay(this.state.currentLevel);
    UI.updateStreakDisplay(0);

    // 开始第一题
    this.nextQuestion();
  },

  /**
   * 开始错词库练习
   * @param {string} username - 用户名
   */
  startWrongWordsPractice(username) {
    const wrongWords = Storage.getWrongWordsList(username);

    if (wrongWords.length === 0) {
      UI.alert('你的错词库是空的！先去正常游戏积累一些错词吧～');
      return;
    }

    this.resetState();
    this.state.currentUser = username;
    this.state.isWrongWordsPracticeMode = true;
    this.state.wrongWordsList = wrongWords;

    Storage.setCurrentUser(username);

    // 更新UI
    UI.showGameScreen();
    UI.updateUserDisplay(username);
    UI.updateModeBadge(true, `错词库练习 (${wrongWords.length}词)`);
    UI.setLevelSelectorEnabled(false);
    UI.updateLevelDisplay('复习');
    UI.updateStreakDisplay(0, true, wrongWords.length);

    // 开始第一题
    this.nextQuestion();
  },

  /**
   * 获取下一个单词
   */
  getNextWord() {
    if (this.state.isWrongWordsPracticeMode) {
      // 错词库模式：随机从列表中选择
      if (this.state.wrongWordsList.length === 0) {
        return null;
      }
      const index = Math.floor(Math.random() * this.state.wrongWordsList.length);
      return this.state.wrongWordsList[index];
    } else {
      // 正常模式：从词库中选择
      return this.getRandomWordFromDatabase();
    }
  },

  /**
   * 从词库中随机获取单词（排除已答对的）
   */
  getRandomWordFromDatabase() {
    const wordData = this.getCurrentWordData();
    if (!wordData) return null;

    const levelWords = wordData.levels[this.state.currentLevel];
    if (!levelWords || levelWords.length === 0) return null;

    // 过滤掉本次已答对的单词
    let availableWords = levelWords.filter(word => {
      const wordId = word.source || word.english;
      return !this.state.sessionCorrectWords.includes(wordId);
    });

    // 英英释义模式：过滤掉没有释义的单词
    if (isDefinitionMode()) {
      availableWords = availableWords.filter(word => word.definition);
    }

    // 如果当前级别没有可用单词了
    if (availableWords.length === 0) {
      return null;  // 返回null，由nextQuestion处理升级或完成逻辑
    }

    const index = Math.floor(Math.random() * availableWords.length);
    return availableWords[index];
  },

  /**
   * 获取当前使用的词库数据
   */
  getCurrentWordData() {
    // 根据练习模式获取对应词库
    const wordDataId = getWordDataId();

    // 目前只支持 en-zh
    if (wordDataId === 'en-zh' && typeof wordData_en_zh !== 'undefined') {
      return wordData_en_zh;
    }

    // 后备：使用旧版wordDatabase
    if (typeof wordDatabase !== 'undefined') {
      return { levels: wordDatabase };
    }

    return null;
  },

  /**
   * 生成选项
   * @param {object} word - 单词对象
   */
  generateOptions(word) {
    // 英英释义模式
    if (isDefinitionMode()) {
      const correctAnswer = word.definition;
      const wrongOptions = word.wrongDefinitions || [];
      if (!correctAnswer) {
        console.warn('单词缺少释义:', word.source);
        return [];
      }
      return this.shuffle([correctAnswer, ...wrongOptions]);
    }

    const isReverse = isReverseMode();
    let correctAnswer, wrongOptions;

    if (isReverse) {
      // 反向模式：看中文选英文
      correctAnswer = word.source;
      wrongOptions = word.wrongOptions?.source || [];
    } else {
      // 正向模式：看英文选中文
      correctAnswer = word.target;
      wrongOptions = word.wrongOptions?.target || word.wrongOptions || [];
    }

    // 如果wrongOptions是数组而不是对象（旧格式兼容）
    if (Array.isArray(word.wrongOptions)) {
      wrongOptions = word.wrongOptions;
    }

    const options = [correctAnswer, ...wrongOptions];
    return this.shuffle(options);
  },

  /**
   * 随机打乱数组
   * @param {Array} array - 要打乱的数组
   */
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  /**
   * 获取正确答案
   * @param {object} word - 单词对象
   */
  getCorrectAnswer(word) {
    if (isDefinitionMode()) {
      return word.definition;
    }
    return isReverseMode() ? word.source : word.target;
  },

  /**
   * 进入下一题
   */
  nextQuestion() {
    // 检查错词库是否已空
    if (this.state.isWrongWordsPracticeMode && this.state.wrongWordsList.length === 0) {
      UI.alert('恭喜！你已经掌握了错词库中的所有单词！');
      this.endGame(false);
      return;
    }

    // 获取下一个单词
    this.state.currentWord = this.getNextWord();

    // 如果没有可用单词了（当前级别全部答对）
    if (!this.state.currentWord) {
      if (this.state.isWrongWordsPracticeMode) {
        UI.alert('没有可用的单词了！');
        this.endGame(false);
        return;
      }

      // 正常模式：当前级别完成
      if (this.state.currentLevel >= GameConfig.rules.maxLevel) {
        // 最高级别完成，显示祝贺
        this.showGameCompleteModal();
        return;
      } else {
        // 自动升级到下一级
        this.state.currentLevel++;
        this.state.correctStreak = 0;
        this.state.levelCorrectCount = 0;
        UI.updateLevelDisplay(this.state.currentLevel);
        UI.showMessage(`Level ${this.state.currentLevel - 1} 全部完成！升级到 Level ${this.state.currentLevel}`, 'level-up', '🎉');

        // 延迟后继续下一题
        setTimeout(() => {
          this.nextQuestion();
        }, 2000);
        return;
      }
    }

    // 转换单词格式（兼容旧格式）
    const word = this.normalizeWord(this.state.currentWord);

    // 显示单词
    UI.displayWord(word);

    // 生成选项
    const options = this.generateOptions(word);
    UI.generateOptions(options, (selected, btn) => this.checkAnswer(selected, btn));

    // 自动朗读
    if (GameConfig.display.autoSpeak) {
      setTimeout(() => {
        TTS.speakWordAndExample(word);
      }, GameConfig.display.speakDelay);
    }
  },

  /**
   * 标准化单词格式（兼容旧数据）
   * @param {object} word - 单词对象
   */
  normalizeWord(word) {
    // 如果已经是新格式
    if (word.source && word.target) {
      return word;
    }

    // 旧格式转换
    return {
      id: word.id || null,
      source: word.english,
      target: word.chinese,
      wrongOptions: {
        target: word.wrongOptions || [],
        source: []
      },
      icon: word.icon || null,
      example: word.example || null
    };
  },

  /**
   * 检查答案
   * @param {string} selected - 用户选择的答案
   * @param {HTMLElement} btn - 选中的按钮
   */
  checkAnswer(selected, btn) {
    if (this.state.isProcessing) return;
    this.state.isProcessing = true;

    const word = this.normalizeWord(this.state.currentWord);
    const correctAnswer = this.getCorrectAnswer(word);
    const isCorrect = selected === correctAnswer;

    this.state.totalAnswered++;

    // 禁用所有按钮
    UI.disableAllOptions();

    // 标记选中的按钮
    UI.markSelectedOption(btn, isCorrect);

    if (isCorrect) {
      this.handleCorrectAnswer(word);
    } else {
      this.handleWrongAnswer(word, correctAnswer);
    }

    // 更新显示
    this.updateDisplayAfterAnswer();

    // 10级词汇显示详情面板（用户点击后才进入下一题）
    const isLevel10 = this.state.currentLevel === 10 && !this.state.isWrongWordsPracticeMode;
    const rawWord = this.state.currentWord;
    const hasDetail = rawWord.morphology || rawWord.etymology || rawWord.examples;

    if (isLevel10 && hasDetail) {
      // 显示详情面板，等待用户点击
      UI.showWordDetail(rawWord, () => {
        this.state.isProcessing = false;
        this.nextQuestion();
      });
    } else {
      // 非10级或无详情，正常延迟后进入下一题
      const delay = isCorrect
        ? GameConfig.display.correctDisplayTime
        : GameConfig.display.wrongDisplayTime;

      setTimeout(() => {
        this.state.isProcessing = false;
        this.nextQuestion();
      }, delay);
    }
  },

  /**
   * 处理正确答案
   * @param {object} word - 单词对象
   */
  handleCorrectAnswer(word) {
    UI.showFeedback('🎉');
    this.state.totalCorrect++;

    // 记录已答对的单词（避免重复）
    const wordId = word.source || word.english;
    if (!this.state.sessionCorrectWords.includes(wordId)) {
      this.state.sessionCorrectWords.push(wordId);
    }

    if (this.state.isWrongWordsPracticeMode) {
      // 错词库模式：答对移除
      Storage.removeFromWrongWords(this.state.currentUser, word);

      // 从本地列表移除
      this.state.wrongWordsList = this.state.wrongWordsList.filter(w =>
        (w.source || w.english) !== word.source
      );

      UI.updateModeBadge(true, `错词库练习 (${this.state.wrongWordsList.length}词)`);
    } else {
      // 正常模式：处理升级
      this.state.correctStreak++;
      this.state.wrongStreak = 0;
      this.state.levelCorrectCount++;

      if (this.state.levelCorrectCount >= GameConfig.rules.correctToLevelUp &&
          this.state.currentLevel < GameConfig.rules.maxLevel) {
        setTimeout(() => {
          this.state.currentLevel++;
          this.state.levelCorrectCount = 0;
          this.state.correctStreak = 0;
          UI.updateLevelDisplay(this.state.currentLevel);
          UI.updateStreakDisplay(this.state.levelCorrectCount);
          UI.showMessage('升级啦！', 'level-up', '🚀');
        }, 600);
      }
    }
  },

  /**
   * 处理错误答案
   * @param {object} word - 单词对象
   * @param {string} correctAnswer - 正确答案
   */
  handleWrongAnswer(word, correctAnswer) {
    UI.showFeedback('😢');

    // 显示正确答案
    UI.markCorrectOption(correctAnswer);

    if (!this.state.isWrongWordsPracticeMode) {
      // 正常模式：记录错词并处理降级
      this.state.sessionWrongWords.push(word);
      this.state.wrongStreak++;
      this.state.correctStreak = 0;

      if (this.state.wrongStreak >= GameConfig.rules.streakToLevelDown &&
          this.state.currentLevel > GameConfig.rules.minLevel) {
        setTimeout(() => {
          this.state.currentLevel--;
          this.state.wrongStreak = 0;
          this.state.levelCorrectCount = 0;
          UI.updateLevelDisplay(this.state.currentLevel);
          UI.updateStreakDisplay(this.state.levelCorrectCount);
          UI.showMessage('别灰心，降一级再练练！', 'level-down', '💪');
        }, 600);
      }
    }
  },

  /**
   * 答题后更新显示
   */
  updateDisplayAfterAnswer() {
    if (this.state.isWrongWordsPracticeMode) {
      UI.updateStreakDisplay(0, true, this.state.wrongWordsList.length);
    } else {
      UI.updateStreakDisplay(this.state.levelCorrectCount);
      UI.updateLevelDisplay(this.state.currentLevel);
    }
  },

  /**
   * 更改级别
   * @param {number} level - 新级别
   */
  changeLevel(level) {
    if (this.state.isWrongWordsPracticeMode) return;

    this.state.currentLevel = level;
    this.state.correctStreak = 0;
    this.state.wrongStreak = 0;
    this.state.levelCorrectCount = 0;
    // 切换级别时清空已答对列表，允许重新练习
    this.state.sessionCorrectWords = [];

    UI.updateLevelDisplay(level);
    UI.updateStreakDisplay(0);

    this.nextQuestion();
  },

  /**
   * 重新开始
   */
  restart() {
    if (this.state.isWrongWordsPracticeMode) {
      // 错词库模式重新加载
      this.state.wrongWordsList = Storage.getWrongWordsList(this.state.currentUser);
      if (this.state.wrongWordsList.length === 0) {
        UI.alert('错词库已空，返回主界面');
        this.backToLogin();
        return;
      }
      UI.updateModeBadge(true, `错词库练习 (${this.state.wrongWordsList.length}词)`);
    }

    this.state.correctStreak = 0;
    this.state.wrongStreak = 0;
    this.state.levelCorrectCount = 0;
    this.state.sessionWrongWords = [];
    this.state.sessionCorrectWords = [];  // 清空已答对列表
    this.state.totalAnswered = 0;
    this.state.totalCorrect = 0;

    if (!this.state.isWrongWordsPracticeMode) {
      UI.updateLevelDisplay(this.state.currentLevel);
    }

    UI.updateStreakDisplay(0, this.state.isWrongWordsPracticeMode, this.state.wrongWordsList.length);
    this.nextQuestion();
  },

  /**
   * 显示结束游戏弹窗
   */
  showEndGameModal() {
    UI.showEndGameModal(
      {
        total: this.state.totalAnswered,
        correct: this.state.totalCorrect,
        wrong: this.state.totalAnswered - this.state.totalCorrect
      },
      this.state.isWrongWordsPracticeMode,
      this.state.sessionWrongWords.length > 0
    );
  },

  /**
   * 显示游戏完成弹窗（通关）
   */
  showGameCompleteModal() {
    UI.showGameCompleteModal({
      total: this.state.totalAnswered,
      correct: this.state.totalCorrect,
      wrong: this.state.totalAnswered - this.state.totalCorrect
    });
  },

  /**
   * 从第0级重新开始
   */
  restartFromLevelZero() {
    UI.hideGameCompleteModal();

    // 重置状态但保留用户
    const username = this.state.currentUser;
    this.state.currentLevel = 0;
    this.state.correctStreak = 0;
    this.state.wrongStreak = 0;
    this.state.levelCorrectCount = 0;
    this.state.sessionCorrectWords = [];  // 清空已答对列表
    this.state.sessionWrongWords = [];
    this.state.totalAnswered = 0;
    this.state.totalCorrect = 0;

    UI.updateLevelDisplay(0);
    UI.updateStreakDisplay(0);

    this.nextQuestion();
  },

  /**
   * 确认结束游戏
   * @param {boolean} saveWrongWords - 是否保存错词
   */
  confirmEndGame(saveWrongWords = true) {
    // 保存错词到错词库
    if (!this.state.isWrongWordsPracticeMode && saveWrongWords) {
      this.state.sessionWrongWords.forEach(word => {
        Storage.addToWrongWords(this.state.currentUser, word, this.state.currentLevel);
      });
    }

    // 保存用户进度
    if (!this.state.isWrongWordsPracticeMode) {
      Storage.saveUserProgress(this.state.currentUser, {
        level: this.state.currentLevel,
        totalAnswered: this.state.totalAnswered,
        totalCorrect: this.state.totalCorrect
      });
    }

    UI.hideEndGameModal();
    this.backToLogin();
  },

  /**
   * 结束游戏
   * @param {boolean} showModal - 是否显示弹窗
   */
  endGame(showModal = true) {
    if (showModal) {
      this.showEndGameModal();
    } else {
      this.backToLogin();
    }
  },

  /**
   * 返回登录界面
   */
  backToLogin() {
    TTS.cancel();
    UI.showLoginScreen();
    UI.updateWrongWordsCount(this.state.currentUser);
  },

  /**
   * 手动朗读当前单词
   */
  speakCurrentWord() {
    if (this.state.currentWord) {
      const word = this.normalizeWord(this.state.currentWord);
      TTS.manualSpeakAll(word);
    }
  },

  /**
   * 移除错词库中的单词
   * @param {number} index - 索引
   */
  removeWrongWord(index) {
    const wrongWords = Storage.getWrongWordsList(this.state.currentUser);
    if (index >= 0 && index < wrongWords.length) {
      const word = wrongWords[index];
      Storage.removeFromWrongWords(this.state.currentUser, word);

      // 重新加载并显示
      const updatedWords = Storage.getWrongWordsList(this.state.currentUser);
      UI.showWrongWordsModal(updatedWords, (i) => this.removeWrongWord(i));
    }
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}
