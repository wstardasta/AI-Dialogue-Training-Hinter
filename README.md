# 提示词助手 - Prompt Helper

一个为 Cursor/VSCode 开发的插件，帮助开发者更精准地表达开发想法，提供丰富的提示词库。

## 功能特性

- 📝 **丰富的提示词库** - 内置多种常用提示词，涵盖代码优化、代码生成、代码审查等多个场景
- 🔍 **智能搜索** - 支持按标题、内容、分类搜索提示词
- 📊 **使用统计** - 自动记录提示词使用次数，按热门程度排序
- ➕ **自定义提示词** - 支持添加、编辑、删除自己的提示词
- 🏷️ **分类管理** - 支持多种分类：代码优化、代码生成、代码审查、Bug修复、文档编写、测试用例、架构设计等
- 📋 **快速插入** - 一键插入提示词到编辑器，提高开发效率

## 安装方法

### 方法一：从源码安装

1. 克隆或下载本项目到本地
2. 在项目目录下运行：
   ```bash
   npm install
   ```
3. 按 `F5` 键在扩展开发宿主中运行插件

### 方法二：打包安装

1. 安装依赖：
   ```bash
   npm install
   ```
2. 编译项目：
   ```bash
   npm run compile
   ```
3. 打包扩展：
   ```bash
   npx vsce package
   ```
4. 在 Cursor/VSCode 中安装生成的 `.vsix` 文件

## 使用方法

### 打开提示词助手面板

- 按 `Ctrl+Shift+P` (Windows/Linux) 或 `Cmd+Shift+P` (Mac) 打开命令面板
- 输入 "提示词助手: 打开面板" 并选择

### 添加新提示词

1. 在提示词助手面板中点击 "+ 添加新提示词" 按钮
2. 填写提示词标题、内容和分类
3. 点击"添加"保存

### 插入提示词

1. 在编辑器中定位光标
2. 在提示词助手面板中选择要使用的提示词
3. 点击"插入"按钮，提示词将插入到光标位置

### 搜索提示词

- 在搜索框中输入关键词进行搜索
- 使用分类下拉框筛选特定分类的提示词

## 项目结构

```
prompt-helper-extension/
├── src/
│   ├── extension.ts      # 插件主入口
│   ├── promptManager.ts  # 提示词管理器
│   └── promptPanel.ts    # 提示词面板UI
├── package.json          # 插件配置
├── tsconfig.json         # TypeScript配置
└── README.md            # 说明文档
```

## 开发说明

### 技术栈

- TypeScript
- VS Code Extension API
- HTML/CSS/JavaScript (Webview)

### 数据存储

提示词数据存储在插件的全局存储目录中，路径为：
- Windows: `%APPDATA%\Cursor\User\globalStorage\prompt-helper\prompts.json`
- Mac: `~/Library/Application Support/Cursor/User/globalStorage/prompt-helper/prompts.json`
- Linux: `~/.config/Cursor/User/globalStorage/prompt-helper/prompts.json`

## 未来计划

- [ ] 支持提示词云端同步
- [ ] 支持提示词社区分享
- [ ] 支持提示词导入/导出
- [ ] 支持更多分类和标签
- [ ] 支持提示词模板变量
- [ ] 支持提示词评分和评论

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

