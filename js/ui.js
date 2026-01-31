/**
 * ui.js - UI渲染模块
 * 负责所有DOM操作和界面更新
 */

const UI = {
  // DOM元素缓存
  elements: {},

  /**
   * HTML转义，防止XSS攻击
   * @param {string} str - 需要转义的字符串
   * @returns {string} 转义后的字符串
   */
  escapeHtml(str) {
    if (str == null) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  /**
   * 初始化UI，缓存DOM元素
   */
  init() {
    this.elements = {
      // 登录界面
      loginScreen: document.getElementById('loginScreen'),
      usernameInput: document.getElementById('usernameInput'),
      practiceModeSelect: document.getElementById('practiceModeSelect'),
      wrongWordsCountDisplay: document.getElementById('wrongWordsCount'),
      practiceWrongBtn: document.getElementById('practiceWrongBtn'),

      // 游戏界面
      gameScreen: document.getElementById('gameScreen'),
      userNameDisplay: document.getElementById('userNameDisplay'),
      levelDisplay: document.getElementById('level'),
      streakDisplay: document.getElementById('streak'),
      modeBadge: document.getElementById('modeBadge'),
      wordDisplay: document.getElementById('word'),
      exampleSection: document.getElementById('exampleSection'),
      exampleText: document.getElementById('exampleText'),
      optionsContainer: document.getElementById('options'),
      levelSelect: document.getElementById('levelSelect'),

      // 弹窗
      endGameModal: document.getElementById('endGameModal'),
      settingsModal: document.getElementById('settingsModal'),
      wrongWordsModal: document.getElementById('wrongWordsModal'),
      gameCompleteModal: document.getElementById('gameCompleteModal'),
    };
  },

  /**
   * 显示登录界面
   */
  showLoginScreen() {
    this.elements.loginScreen.classList.remove('hidden');
    this.elements.gameScreen.classList.add('hidden');
  },

  /**
   * 显示游戏界面
   */
  showGameScreen() {
    this.elements.loginScreen.classList.add('hidden');
    this.elements.gameScreen.classList.remove('hidden');
  },

  /**
   * 更新练习模式选择器
   */
  updatePracticeModeSelector() {
    const select = this.elements.practiceModeSelect;
    if (!select) return;

    select.innerHTML = '';
    GameConfig.availableModes.forEach(mode => {
      const option = document.createElement('option');
      option.value = mode.id;
      option.textContent = mode.name;
      if (mode.id === GameConfig.practiceMode) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  },

  /**
   * 更新错词库数量显示
   * @param {string} username - 用户名
   */
  updateWrongWordsCount(username) {
    const display = this.elements.wrongWordsCountDisplay;
    const btn = this.elements.practiceWrongBtn;

    if (!username) {
      display.textContent = '';
      btn.disabled = true;
      return;
    }

    const count = Storage.getWrongWordsCount(username);

    if (count > 0) {
      display.textContent = `${username} 的错词库有 ${count} 个单词`;
      btn.disabled = false;
    } else {
      display.textContent = `${username} 的错词库是空的`;
      btn.disabled = true;
    }
  },

  /**
   * 更新用户名显示
   * @param {string} username - 用户名
   */
  updateUserDisplay(username) {
    this.elements.userNameDisplay.textContent = username;
  },

  /**
   * 更新等级显示
   * @param {number|string} level - 等级
   */
  updateLevelDisplay(level) {
    this.elements.levelDisplay.textContent = level;
    if (this.elements.levelSelect && typeof level === 'number') {
      this.elements.levelSelect.value = level;
    }
  },

  /**
   * 更新连胜显示
   * @param {number} streak - 连胜次数
   * @param {boolean} isWrongWordsPractice - 是否是错词库模式
   * @param {number} remainingCount - 剩余错词数量
   */
  updateStreakDisplay(streak, isWrongWordsPractice = false, remainingCount = 0) {
    const display = this.elements.streakDisplay;

    if (isWrongWordsPractice) {
      display.textContent = `剩${remainingCount}`;
      return;
    }

    let displayText = '';
    const maxStreak = GameConfig.rules.streakToLevelUp;
    for (let i = 0; i < maxStreak; i++) {
      displayText += i < streak ? '✓' : '○';
    }
    display.textContent = displayText;
  },

  /**
   * 显示/隐藏练习模式标识
   * @param {boolean} show - 是否显示
   * @param {string} text - 显示文本
   */
  updateModeBadge(show, text = '') {
    const badge = this.elements.modeBadge;
    if (show) {
      badge.classList.remove('hidden');
      badge.textContent = text;
    } else {
      badge.classList.add('hidden');
    }
  },

  /**
   * 显示单词
   * @param {object} word - 单词对象
   */
  displayWord(word) {
    const display = this.elements.wordDisplay;
    const reverse = isReverseMode();
    const definition = isDefinitionMode();

    // 根据模式决定显示什么
    // 正向(en-zh): 显示英文(source)，选中文
    // 反向(zh-en): 显示中文(target)，选英文
    // 释义(en-en): 显示英文(source)，选英文释义
    const textToShow = reverse ? word.target : word.source;

    // 构建显示内容
    let html = '';

    // 图标（仅正向模式和释义模式显示，反向模式看中文不需要图标提示）
    if (word.icon && GameConfig.display.showIcon && !reverse) {
      html += `<div class="word-icon">${this.escapeHtml(word.icon)}</div>`;
    }

    // 单词文本
    html += `<div class="word-text">${this.escapeHtml(textToShow)}</div>`;

    display.innerHTML = html;

    // 例句（仅正向模式显示英文例句，释义模式不显示例句）
    if (!reverse && !definition) {
      this.displayExample(word.example);
    } else {
      this.displayExample(null);
    }
  },

  /**
   * 显示例句
   * @param {string} example - 例句
   */
  displayExample(example) {
    const section = this.elements.exampleSection;
    const text = this.elements.exampleText;

    if (example && GameConfig.display.showExample) {
      text.textContent = example;
      section.classList.remove('hidden');
    } else {
      section.classList.add('hidden');
    }
  },

  /**
   * 生成选项按钮
   * @param {Array} options - 选项数组
   * @param {Function} onSelect - 选择回调
   */
  generateOptions(options, onSelect) {
    const container = this.elements.optionsContainer;
    container.innerHTML = '';

    // 释义模式使用较小字体的样式
    const isDefMode = isDefinitionMode();

    options.forEach(option => {
      const btn = document.createElement('button');
      btn.className = 'option-btn' + (isDefMode ? ' option-btn-definition' : '');
      btn.textContent = option;
      btn.onclick = () => onSelect(option, btn);
      container.appendChild(btn);
    });
  },

  /**
   * 禁用所有选项按钮
   */
  disableAllOptions() {
    const btns = this.elements.optionsContainer.querySelectorAll('.option-btn');
    btns.forEach(btn => {
      btn.style.pointerEvents = 'none';
    });
  },

  /**
   * 标记正确选项
   * @param {string} correctAnswer - 正确答案
   */
  markCorrectOption(correctAnswer) {
    const btns = this.elements.optionsContainer.querySelectorAll('.option-btn');
    btns.forEach(btn => {
      if (btn.textContent === correctAnswer) {
        btn.classList.add('show-correct');
      }
    });
  },

  /**
   * 标记选中的按钮状态
   * @param {HTMLElement} btn - 按钮元素
   * @param {boolean} isCorrect - 是否正确
   */
  markSelectedOption(btn, isCorrect) {
    btn.classList.add(isCorrect ? 'correct' : 'wrong');
  },

  /**
   * 显示反馈表情
   * @param {string} emoji - 表情
   */
  showFeedback(emoji) {
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.textContent = emoji;
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 800);
  },

  /**
   * 显示消息
   * @param {string} text - 消息文本
   * @param {string} type - 消息类型 ('level-up' | 'level-down')
   * @param {string} emoji - 表情
   */
  showMessage(text, type, emoji) {
    const msg = document.createElement('div');
    msg.className = `message ${type}`;
    msg.innerHTML = `<span class="emoji">${emoji}</span>${text}`;
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
  },

  /**
   * 显示结束游戏弹窗
   * @param {object} stats - 统计信息
   * @param {boolean} isWrongWordsPractice - 是否是错词库模式
   * @param {boolean} hasWrongWords - 是否有错词
   */
  showEndGameModal(stats, isWrongWordsPractice, hasWrongWords) {
    document.getElementById('totalCount').textContent = stats.total;
    document.getElementById('correctCount').textContent = stats.correct;
    document.getElementById('wrongCount').textContent = stats.wrong;

    // 错词库模式下隐藏保存错词选项
    const saveSection = document.getElementById('saveWrongWordsSection');
    if (isWrongWordsPractice || !hasWrongWords) {
      saveSection.classList.add('hidden');
    } else {
      saveSection.classList.remove('hidden');
      document.getElementById('saveWrongWords').checked = true;
    }

    this.elements.endGameModal.classList.remove('hidden');
  },

  /**
   * 隐藏结束游戏弹窗
   */
  hideEndGameModal() {
    this.elements.endGameModal.classList.add('hidden');
  },

  /**
   * 显示游戏完成弹窗（通关）
   * @param {object} stats - 统计信息
   */
  showGameCompleteModal(stats) {
    document.getElementById('completeTotalCount').textContent = stats.total;
    document.getElementById('completeCorrectCount').textContent = stats.correct;
    document.getElementById('completeWrongCount').textContent = stats.wrong;

    this.elements.gameCompleteModal.classList.remove('hidden');
  },

  /**
   * 隐藏游戏完成弹窗
   */
  hideGameCompleteModal() {
    this.elements.gameCompleteModal.classList.add('hidden');
  },

  /**
   * 显示设置弹窗
   */
  showSettingsModal() {
    this.updateSettingsUI();
    this.elements.settingsModal.classList.remove('hidden');
  },

  /**
   * 隐藏设置弹窗
   */
  hideSettingsModal() {
    this.elements.settingsModal.classList.add('hidden');
  },

  /**
   * 更新设置界面UI
   */
  updateSettingsUI() {
    // 更新各开关状态
    this.updateToggle('toggleShowIcon', GameConfig.display.showIcon);
    this.updateToggle('toggleShowExample', GameConfig.display.showExample);
    this.updateToggle('toggleAutoSpeak', GameConfig.display.autoSpeak);
    this.updateToggle('toggleSpeakWord', GameConfig.tts.speakWord);
    this.updateToggle('toggleSpeakExample', GameConfig.tts.speakExample);
  },

  /**
   * 更新开关状态
   * @param {string} id - 开关元素ID
   * @param {boolean} active - 是否激活
   */
  updateToggle(id, active) {
    const toggle = document.getElementById(id);
    if (toggle) {
      if (active) {
        toggle.classList.add('active');
      } else {
        toggle.classList.remove('active');
      }
    }
  },

  /**
   * 初始化级别选择器
   */
  initLevelSelector() {
    const select = this.elements.levelSelect;
    if (!select) return;

    select.innerHTML = '';
    for (let i = GameConfig.rules.minLevel; i <= GameConfig.rules.maxLevel; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = GameConfig.levelDescriptions[i]?.name || `Level ${i}`;
      select.appendChild(option);
    }
  },

  /**
   * 设置级别选择器是否可用
   * @param {boolean} enabled - 是否可用
   */
  setLevelSelectorEnabled(enabled) {
    if (this.elements.levelSelect) {
      this.elements.levelSelect.disabled = !enabled;
    }
  },

  /**
   * 显示错词库详情弹窗
   * @param {Array} words - 错词列表
   * @param {Function} onRemove - 移除回调
   */
  showWrongWordsModal(words, onRemove) {
    const modal = this.elements.wrongWordsModal;
    const listContainer = document.getElementById('wrongWordsList');

    if (words.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <div class="emoji">✨</div>
          <p>错词库是空的，继续加油！</p>
        </div>
      `;
    } else {
      listContainer.innerHTML = words.map((item, index) => `
        <div class="wrong-word-item" data-index="${index}">
          <div class="wrong-word-info">
            <div class="wrong-word-source">${this.escapeHtml(item.source)}</div>
            <div class="wrong-word-target">${this.escapeHtml(item.target)}</div>
            <div class="wrong-word-stats">
              错误${parseInt(item.stats?.errorCount) || 0}次 | 正确${parseInt(item.stats?.correctCount) || 0}次
            </div>
          </div>
          <div class="wrong-word-actions">
            <button class="btn-remove" onclick="Game.removeWrongWord(${parseInt(index)})">移除</button>
          </div>
        </div>
      `).join('');
    }

    modal.classList.remove('hidden');
  },

  /**
   * 隐藏错词库详情弹窗
   */
  hideWrongWordsModal() {
    this.elements.wrongWordsModal.classList.add('hidden');
  },

  /**
   * 显示确认对话框
   * @param {string} message - 消息
   * @returns {boolean} 是否确认
   */
  confirm(message) {
    return window.confirm(message);
  },

  /**
   * 显示提示信息
   * @param {string} message - 消息
   */
  alert(message) {
    window.alert(message);
  },

  // 存储详情面板的回调函数
  _wordDetailCallback: null,

  /**
   * 显示10级词汇详情面板
   * @param {object} word - 单词对象（包含morphology, etymology, examples等）
   * @param {Function} onClose - 关闭时的回调函数
   */
  showWordDetail(word, onClose) {
    const panel = document.getElementById('wordDetailPanel');
    if (!panel) return;

    // 存储回调
    this._wordDetailCallback = onClose || null;

    // 填充基本信息
    document.getElementById('detailEnglish').textContent = word.source || word.english || '';
    document.getElementById('detailChinese').textContent = word.target || word.chinese || '';

    // 词根分解
    const morphSection = document.getElementById('morphologySection');
    const morphContent = document.getElementById('detailMorphology');
    if (word.morphology && word.morphology.breakdown) {
      morphContent.textContent = word.morphology.breakdown;
      morphSection.classList.remove('hidden');
    } else {
      morphSection.classList.add('hidden');
    }

    // 词源
    const etymSection = document.getElementById('etymologySection');
    const etymContent = document.getElementById('detailEtymology');
    if (word.etymology) {
      let etymText = '';
      if (word.etymology.origin) etymText += word.etymology.origin + '语';
      if (word.etymology.root) etymText += ' ' + word.etymology.root;
      if (word.etymology.meaning) etymText += ' (' + word.etymology.meaning + ')';
      if (word.etymology.evolution) etymText += '\n' + word.etymology.evolution;
      etymContent.textContent = etymText;
      etymSection.classList.remove('hidden');
    } else {
      etymSection.classList.add('hidden');
    }

    // 例句
    const examplesSection = document.getElementById('examplesSection');
    const examplesContent = document.getElementById('detailExamples');
    if (word.examples && word.examples.length > 0) {
      examplesContent.innerHTML = word.examples.map((ex, i) => `
        <div class="example-item">
          <div class="example-en">${i + 1}. ${this.escapeHtml(ex.sentence)}</div>
          <div class="example-zh">${this.escapeHtml(ex.translation)}</div>
        </div>
      `).join('');
      examplesSection.classList.remove('hidden');
    } else {
      examplesSection.classList.add('hidden');
    }

    // 同义词/反义词
    const synAntSection = document.getElementById('synonymsAntonymsSection');
    const synContent = document.getElementById('detailSynonyms');
    const antContent = document.getElementById('detailAntonyms');
    const hasSyn = word.synonyms && word.synonyms.length > 0;
    const hasAnt = word.antonyms && word.antonyms.length > 0;
    if (hasSyn || hasAnt) {
      synContent.textContent = hasSyn ? word.synonyms.join(', ') : '-';
      antContent.textContent = hasAnt ? word.antonyms.join(', ') : '-';
      synAntSection.classList.remove('hidden');
    } else {
      synAntSection.classList.add('hidden');
    }

    // 隐藏其他元素，只显示详情面板
    const wordSection = document.querySelector('.word-section');
    const optionsSection = document.querySelector('.options-section');
    if (wordSection) wordSection.classList.add('hidden');
    if (optionsSection) optionsSection.classList.add('hidden');

    // 显示面板
    panel.classList.remove('hidden');

    // 绑定点击事件（点击面板任意位置关闭）
    panel.onclick = () => this.hideWordDetail();
  },

  /**
   * 隐藏10级词汇详情面板
   */
  hideWordDetail() {
    const panel = document.getElementById('wordDetailPanel');
    if (panel) {
      panel.classList.add('hidden');
      panel.onclick = null;
    }

    // 恢复其他元素显示
    const wordSection = document.querySelector('.word-section');
    const optionsSection = document.querySelector('.options-section');
    if (wordSection) wordSection.classList.remove('hidden');
    if (optionsSection) optionsSection.classList.remove('hidden');

    // 执行回调
    if (this._wordDetailCallback) {
      const callback = this._wordDetailCallback;
      this._wordDetailCallback = null;
      callback();
    }
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UI;
}
