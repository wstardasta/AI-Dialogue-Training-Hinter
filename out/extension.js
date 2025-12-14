"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const promptManager_1 = require("./promptManager");
const promptPanel_1 = require("./promptPanel");
const promptScraper_1 = require("./promptScraper");
const inputSuggestion_1 = require("./inputSuggestion");
const i18n_1 = require("./i18n");
const languageDetector_1 = require("./languageDetector");
const codeAnalyzer_1 = require("./codeAnalyzer");
const promptTemplates_1 = require("./promptTemplates");
const cloudShare_1 = require("./cloudShare");
const aiChatHelper_1 = require("./aiChatHelper");
let promptManager;
let promptPanel;
let inputSuggestionService;
function activate(context) {
    console.log('提示词助手插件已激活');
    // 初始化国际化
    i18n_1.I18n.initialize();
    // 初始化提示词管理器
    promptManager = new promptManager_1.PromptManager(context.globalStorageUri);
    // 初始化输入建议服务
    inputSuggestionService = new inputSuggestion_1.InputSuggestionService(promptManager);
    // 注册命令：打开面板
    const openPanelCommand = vscode.commands.registerCommand('promptHelper.openPanel', () => {
        if (!promptPanel) {
            promptPanel = new promptPanel_1.PromptPanel(context.extensionUri, promptManager);
        }
        promptPanel.reveal();
    });
    // 注册命令：添加新提示词
    const addPromptCommand = vscode.commands.registerCommand('promptHelper.addPrompt', async () => {
        const title = await vscode.window.showInputBox({
            prompt: '请输入提示词标题',
            placeHolder: '例如：优化代码性能'
        });
        if (!title) {
            return;
        }
        const content = await vscode.window.showInputBox({
            prompt: '请输入提示词内容',
            placeHolder: '例如：请帮我优化这段代码的性能，重点关注...'
        });
        if (!content) {
            return;
        }
        const category = await vscode.window.showQuickPick(['代码优化', '代码生成', '代码审查', 'Bug修复', '文档编写', '测试用例', '架构设计', '其他'], { placeHolder: '选择分类' });
        if (category) {
            await promptManager.addPrompt({
                id: Date.now().toString(),
                title,
                content,
                category,
                useCount: 0,
                createdAt: new Date().toISOString(),
                author: '本地用户'
            });
            vscode.window.showInformationMessage(`提示词 "${title}" 已添加！`);
            // 刷新面板
            if (promptPanel) {
                promptPanel.refresh();
            }
        }
    });
    // 注册命令：插入提示词
    const insertPromptCommand = vscode.commands.registerCommand('promptHelper.insertPrompt', async () => {
        const prompts = await promptManager.getAllPrompts();
        const sortedPrompts = prompts.sort((a, b) => b.useCount - a.useCount);
        const items = sortedPrompts.map(p => ({
            label: p.title,
            description: p.category,
            detail: p.content.substring(0, 100) + (p.content.length > 100 ? '...' : ''),
            prompt: p
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: '选择要插入的提示词'
        });
        if (selected && selected.prompt) {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const position = editor.selection.active;
                editor.edit(editBuilder => {
                    editBuilder.insert(position, selected.prompt.content);
                });
                // 增加使用次数
                await promptManager.incrementUseCount(selected.prompt.id);
                vscode.window.showInformationMessage(`已插入提示词: ${selected.prompt.title}`);
            }
        }
    });
    // 注册命令：从网络获取提示词
    const fetchPromptsCommand = vscode.commands.registerCommand('promptHelper.fetchPrompts', async () => {
        const scraper = new promptScraper_1.PromptScraper();
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: '正在获取常用提示词...',
            cancellable: false
        }, async (progress) => {
            try {
                progress.report({ increment: 0, message: '正在从网络获取提示词...' });
                const prompts = await scraper.fetchCommonPrompts();
                progress.report({ increment: 50, message: '正在保存提示词...' });
                // 检查并添加新提示词（避免重复）
                const existingPrompts = await promptManager.getAllPrompts();
                const existingIds = new Set(existingPrompts.map(p => p.title.toLowerCase()));
                let addedCount = 0;
                for (const prompt of prompts) {
                    // 只添加标题不重复的提示词
                    if (!existingIds.has(prompt.title.toLowerCase())) {
                        await promptManager.addPrompt(prompt);
                        existingIds.add(prompt.title.toLowerCase());
                        addedCount++;
                    }
                }
                progress.report({ increment: 100, message: '完成' });
                vscode.window.showInformationMessage(`成功获取 ${addedCount} 个新提示词！总共有 ${prompts.length} 个提示词可用。`);
                // 刷新面板
                if (promptPanel) {
                    promptPanel.refresh();
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`获取提示词失败: ${error}`);
            }
        });
    });
    // 注册命令：显示提示词建议
    const showSuggestionsCommand = vscode.commands.registerCommand('promptHelper.showSuggestions', async () => {
        if (inputSuggestionService) {
            await inputSuggestionService.showSuggestionPanel();
        }
    });
    // 注册命令：快速插入建议（快捷键触发）
    const quickInsertCommand = vscode.commands.registerCommand('promptHelper.quickInsert', async () => {
        if (inputSuggestionService) {
            await inputSuggestionService.showSuggestionPanel();
        }
    });
    // 注册命令：快速发送代码上下文到AI
    const quickSendToAICommand = vscode.commands.registerCommand('promptHelper.quickSendToAI', async () => {
        await aiChatHelper_1.AIChatHelper.sendContextToAI();
    });
    // 注册命令：查看收藏的提示词（用于AI对话）
    const viewFavoritesCommand = vscode.commands.registerCommand('promptHelper.viewFavorites', async () => {
        const favoritePrompts = await promptManager.getFavoritePrompts();
        if (favoritePrompts.length === 0) {
            vscode.window.showInformationMessage('您还没有收藏任何提示词');
            return;
        }
        await aiChatHelper_1.AIChatHelper.showPromptSelector(favoritePrompts);
    });
    // 注册命令：基于当前代码生成AI对话提示词（复制到剪贴板）
    const generateFromCodeCommand = vscode.commands.registerCommand('promptHelper.generateFromCode', async () => {
        const context = await codeAnalyzer_1.CodeAnalyzer.getCurrentCodeContext();
        // 获取推荐的模板
        const languageInfo = languageDetector_1.LanguageDetector.detectCurrentLanguage();
        const recommendedTemplates = promptTemplates_1.PromptTemplateManager.getRecommendedTemplates(languageInfo?.language, languageInfo?.category);
        if (context && context.selectedText && recommendedTemplates.length > 0) {
            const templateItems = recommendedTemplates.map(t => ({
                label: t.name,
                description: t.description,
                detail: t.template.substring(0, 100),
                template: t
            }));
            const selected = await vscode.window.showQuickPick(templateItems, {
                placeHolder: i18n_1.I18n.t('prompt.selectTemplate') || '选择AI对话模板'
            });
            if (selected) {
                const prompt = promptTemplates_1.PromptTemplateManager.templateToPrompt(selected.template, {
                    code: context.selectedText,
                    language: context.language,
                    functionName: context.functionName,
                    className: context.className
                });
                // 复制到剪贴板供AI对话使用
                await aiChatHelper_1.AIChatHelper.quickSendToAI(prompt);
                await promptManager.incrementUseCount(prompt.id);
            }
        }
        else {
            // 快速发送上下文到AI
            await aiChatHelper_1.AIChatHelper.sendContextToAI();
        }
    });
    // 注册命令：上传提示词到云端
    const uploadPromptCommand = vscode.commands.registerCommand('promptHelper.uploadPrompt', async () => {
        const prompts = await promptManager.getAllPrompts();
        const items = prompts.map(p => ({
            label: p.title,
            description: p.category,
            detail: p.content.substring(0, 100),
            prompt: p
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: i18n_1.I18n.t('prompt.selectUpload') || '选择要上传的提示词'
        });
        if (selected && selected.prompt) {
            const shareId = await cloudShare_1.CloudShareManager.uploadPrompt(selected.prompt);
            if (shareId) {
                vscode.window.showInformationMessage(i18n_1.I18n.t('message.uploaded') || '上传成功');
            }
        }
    });
    // 注册命令：从云端下载提示词
    const downloadPromptsCommand = vscode.commands.registerCommand('promptHelper.downloadPrompts', async () => {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: i18n_1.I18n.t('progress.downloading') || '正在下载提示词...',
            cancellable: false
        }, async (progress) => {
            try {
                const sharedPrompts = await cloudShare_1.CloudShareManager.downloadPrompts();
                const imported = await promptManager.addPromptsBatch(sharedPrompts);
                vscode.window.showInformationMessage(i18n_1.I18n.t('message.downloaded')?.replace('{count}', imported.toString()) || `成功下载 ${imported} 个提示词`);
                if (promptPanel) {
                    promptPanel.refresh();
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`下载失败: ${error}`);
            }
        });
    });
    // 注册命令：智能推荐AI对话提示词（复制到剪贴板）
    const smartRecommendCommand = vscode.commands.registerCommand('promptHelper.smartRecommend', async () => {
        const languageInfo = languageDetector_1.LanguageDetector.detectCurrentLanguage();
        const projectInfo = await languageDetector_1.LanguageDetector.detectProjectType();
        const recommendedCategories = languageDetector_1.LanguageDetector.recommendCategories(languageInfo, projectInfo);
        const allPrompts = await promptManager.getAllPrompts();
        const recommendedPrompts = allPrompts.filter(p => recommendedCategories.includes(p.category)).sort((a, b) => b.useCount - a.useCount).slice(0, 10);
        if (recommendedPrompts.length > 0) {
            await aiChatHelper_1.AIChatHelper.showPromptSelector(recommendedPrompts);
        }
        else {
            vscode.window.showInformationMessage(i18n_1.I18n.t('message.noRecommendations') || '暂无推荐');
        }
    });
    context.subscriptions.push(openPanelCommand, addPromptCommand, insertPromptCommand, fetchPromptsCommand, showSuggestionsCommand, quickInsertCommand, quickSendToAICommand, viewFavoritesCommand, generateFromCodeCommand, uploadPromptCommand, downloadPromptsCommand, smartRecommendCommand, inputSuggestionService);
    // 首次激活时，如果提示词库为空，提示用户获取提示词
    promptManager.getAllPrompts().then(prompts => {
        if (prompts.length === 0) {
            vscode.window.showInformationMessage('提示词库为空，是否要从网络获取常用提示词？', '是', '否').then(choice => {
                if (choice === '是') {
                    vscode.commands.executeCommand('promptHelper.fetchPrompts');
                }
            });
        }
    });
}
exports.activate = activate;
function deactivate() {
    if (promptPanel) {
        promptPanel.dispose();
    }
    if (inputSuggestionService) {
        inputSuggestionService.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map