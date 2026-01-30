# 词汇学习游戏 v2.0

一个多语言词汇学习游戏，支持双向学习和智能错词库功能。

## 功能特点

- 多级别词汇（Level 0-10）
- 双向学习（英语->中文 / 中文->英语）
- 智能错词库
- 语音朗读
- 例句显示

## 在线访问

部署到 GitHub Pages 后，通过以下链接访问：
```
https://YOUR_USERNAME.github.io/vocab-game
```

## 部署步骤

### 1. 创建 GitHub 仓库

1. 登录 GitHub，创建新仓库 `vocab-game`
2. 推送代码到仓库

### 2. 启用 GitHub Pages

1. 进入仓库 Settings -> Pages
2. Source 选择 `main` 分支
3. 保存后等待部署完成

### 3. 配置 Giscus 留言功能

1. **启用 Discussions**：在仓库 Settings -> General -> Features 中勾选 Discussions

2. **安装 Giscus App**：访问 https://github.com/apps/giscus 并安装到你的仓库

3. **获取配置**：访问 https://giscus.app/zh-CN
   - 输入你的仓库名（如 `username/vocab-game`）
   - 选择 Discussion 分类（推荐使用 General）
   - 复制生成的配置代码

4. **更新 index.html**：找到 Giscus 脚本，替换以下属性：
   ```html
   data-repo="YOUR_GITHUB_USERNAME/vocab-game"
   data-repo-id="YOUR_REPO_ID"
   data-category-id="YOUR_CATEGORY_ID"
   ```

## 访问统计

使用 [不蒜子](https://busuanzi.ibruce.info/) 统计访问量，无需配置即可使用。

## 本地运行

直接用浏览器打开 `index.html` 即可运行。

## 技术栈

- HTML5
- CSS3
- 原生 JavaScript
- Web Speech API (语音朗读)

## 许可证

MIT License
