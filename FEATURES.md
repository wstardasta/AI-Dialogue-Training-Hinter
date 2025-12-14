# 提示词助手 - 功能说明文档

## ✅ 已实现的功能

### 1. 云端共享功能
- ✅ 用户可以上传提示词到云端
- ✅ 所有用户都能下载和使用别人上传的提示词
- ✅ 支持搜索和筛选云端提示词
- 实现位置：`src/cloudShare.ts`
- API命令：`promptHelper.uploadPrompt`, `promptHelper.downloadPrompts`

### 2. 语言检测和项目分析
- ✅ 自动检测当前编辑的文件语言
- ✅ 自动识别项目类型（JavaScript/Python/Java/Rust/Go等）
- ✅ 检测项目框架（React/Vue/Angular等）
- ✅ 检测包管理器（npm/yarn/pnpm）
- 实现位置：`src/languageDetector.ts`

### 3. 智能推荐功能
- ✅ 根据当前代码语言推荐相关提示词
- ✅ 根据项目类型推荐提示词类别
- ✅ 基于使用频率排序推荐
- API命令：`promptHelper.smartRecommend`

### 4. 基于代码生成提示词
- ✅ 自动提取当前选中的代码片段
- ✅ 提取代码上下文信息
- ✅ 使用模板生成提示词
- ✅ 支持多种场景模板
- 实现位置：`src/codeAnalyzer.ts`
- API命令：`promptHelper.generateFromCode`

### 5. 场景模板系统
- ✅ 预定义多种场景模板：
  - API文档生成
  - 单元测试生成
  - 代码审查
  - Bug修复
  - 代码重构
  - 性能优化
- ✅ 模板支持变量替换（{{code}}, {{language}}, {{functionName}}等）
- ✅ 用户可自定义和分享模板
- 实现位置：`src/promptTemplates.ts`

### 6. 国际化支持（i18n）
- ✅ 支持多语言：
  - 中文 (zh-CN)
  - English (en-US)
  - 日本語 (ja-JP)
  - 한국어 (ko-KR)
- ✅ 自动检测系统语言
- ✅ 支持手动切换语言
- 实现位置：`src/i18n.ts`

### 7. Web应用
- ✅ 创建了完整的Web应用在 `C:\ProptPal-AIWeb`
- ✅ RESTful API服务器
- ✅ 前端界面（HTML/CSS/JavaScript）
- ✅ 支持云端共享
- ✅ 支持多语言
- ✅ 所有功能与插件版本一致

## 📁 项目结构

### VS Code 插件 (C:\ProptPal-AI)
```
src/
├── extension.ts           # 主入口文件
├── promptManager.ts       # 提示词管理器
├── promptPanel.ts         # UI面板
├── promptScraper.ts       # 爬虫/数据获取
├── inputSuggestion.ts     # 输入建议服务
├── i18n.ts               # 国际化支持
├── languageDetector.ts    # 语言检测
├── codeAnalyzer.ts        # 代码分析
├── promptTemplates.ts     # 模板系统
└── cloudShare.ts          # 云端共享
```

### Web应用 (C:\ProptPal-AIWeb)
```
ProptPal-AIWeb/
├── server.js              # Express服务器
├── package.json           # 项目配置
├── data/                  # 数据存储
│   └── prompts.json       # 提示词数据
└── public/                # 前端文件
    ├── index.html         # 主页面
    ├── app.js             # 前端逻辑
    ├── styles.css         # 样式
    └── i18n.js            # 国际化
```

## 🚀 使用方法

### VS Code 插件

1. **编译项目**：
   ```bash
   cd C:\ProptPal-AI
   npm run compile
   ```

2. **运行插件**：
   - 按 F5 在扩展开发宿主中运行

3. **主要命令**：
   - `promptHelper.openPanel` - 打开提示词助手面板
   - `promptHelper.generateFromCode` - 基于代码生成提示词
   - `promptHelper.smartRecommend` - 智能推荐提示词
   - `promptHelper.uploadPrompt` - 上传提示词到云端
   - `promptHelper.downloadPrompts` - 从云端下载提示词

### Web应用

1. **安装依赖**：
   ```bash
   cd C:\ProptPal-AIWeb
   npm install
   ```

2. **启动服务器**：
   ```bash
   npm start
   ```

3. **访问应用**：
   ```
   http://localhost:3000
   ```

## 🌍 国际化配置

插件会自动检测系统语言，也可以在代码中手动设置：

```typescript
import { I18n } from './i18n';

I18n.setLanguage('en-US'); // 切换到英文
```

Web应用会在浏览器中自动检测语言，也可以通过下拉菜单手动切换。

## 📝 API端点（Web应用）

- `GET /api/prompts` - 获取所有提示词
- `POST /api/prompts` - 创建新提示词
- `PUT /api/prompts/:id` - 更新提示词
- `DELETE /api/prompts/:id` - 删除提示词
- `POST /api/prompts/:id/use` - 增加使用次数
- `POST /api/prompts/:id/favorite` - 收藏/取消收藏

## 🔧 技术栈

### 插件
- TypeScript
- VS Code Extension API
- Node.js

### Web应用
- Node.js
- Express.js
- Vanilla JavaScript (无框架)
- HTML5/CSS3

## 📌 注意事项

1. **云端共享**：当前使用模拟数据，实际部署需要实现真实的API后端
2. **数据存储**：Web应用使用JSON文件存储，生产环境建议使用数据库
3. **安全性**：需要添加认证和授权机制
4. **CORS**：Web API需要配置适当的CORS策略

## 🔮 未来改进

- [ ] 实现真实的云端API后端
- [ ] 添加用户认证系统
- [ ] 使用数据库存储数据
- [ ] 添加提示词评分和评论功能
- [ ] 实现提示词版本管理
- [ ] 添加更多语言支持

