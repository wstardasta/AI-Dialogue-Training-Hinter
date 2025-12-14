"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputSuggestionService = void 0;
const vscode = require("vscode");
/**
 * 输入建议服务 - 在用户输入时提供提示词建议
 */
class InputSuggestionService {
    constructor(promptManager) {
        this._lastInput = '';
        this._suggestions = [];
        this._promptManager = promptManager;
        // 创建状态栏项用于显示建议
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this._statusBarItem.command = 'promptHelper.showSuggestions';
        this._statusBarItem.tooltip = '显示提示词建议';
        // 监听编辑器变化
        this.initialize();
    }
    initialize() {
        // 监听编辑器文本变化
        const editorChangeDisposable = vscode.window.onDidChangeActiveTextEditor(() => {
            this._currentEditor = vscode.window.activeTextEditor;
        });
        // 监听文档变化（用户输入）
        const documentChangeDisposable = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document === vscode.window.activeTextEditor?.document) {
                this.onTextChanged(e);
            }
        });
        // 监听光标位置变化
        const selectionChangeDisposable = vscode.window.onDidChangeTextEditorSelection(() => {
            this.updateSuggestions();
        });
        this._disposable = vscode.Disposable.from(editorChangeDisposable, documentChangeDisposable, selectionChangeDisposable, this._statusBarItem);
        // 初始化当前编辑器
        this._currentEditor = vscode.window.activeTextEditor;
    }
    /**
     * 文本变化时的处理
     */
    async onTextChanged(e) {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== e.document) {
            return;
        }
        // 只处理用户输入（排除程序自动修改）
        if (e.contentChanges.length === 0) {
            return;
        }
        // 获取当前行的文本
        const position = editor.selection.active;
        const lineText = editor.document.lineAt(position.line).text;
        const cursorPosition = position.character;
        // 获取光标前的文本（用于匹配提示词）
        const textBeforeCursor = lineText.substring(0, cursorPosition).trim();
        // 只在输入有意义的内容时才更新建议（至少2个字符）
        if (textBeforeCursor.length >= 2 && textBeforeCursor !== this._lastInput) {
            this._lastInput = textBeforeCursor;
            await this.updateSuggestionsBasedOnInput(textBeforeCursor);
        }
        else if (textBeforeCursor.length < 2) {
            this._suggestions = [];
            this.hideStatusBarItem();
        }
    }
    /**
     * 根据输入文本更新建议
     */
    async updateSuggestionsBasedOnInput(input) {
        if (!input || input.trim().length === 0) {
            this._suggestions = [];
            this.hideStatusBarItem();
            return;
        }
        // 获取所有提示词
        const allPrompts = await this._promptManager.getAllPrompts();
        // 根据输入文本匹配提示词
        const matched = this.matchPrompts(input, allPrompts);
        // 按使用次数排序，取前5个
        this._suggestions = matched
            .sort((a, b) => b.useCount - a.useCount)
            .slice(0, 5);
        // 显示状态栏提示
        if (this._suggestions.length > 0) {
            this.showStatusBarItem(this._suggestions.length);
        }
        else {
            this.hideStatusBarItem();
        }
    }
    /**
     * 匹配提示词
     */
    matchPrompts(input, prompts) {
        const lowerInput = input.toLowerCase().trim();
        if (lowerInput.length < 2) {
            return [];
        }
        return prompts.filter(prompt => {
            const title = prompt.title.toLowerCase();
            const content = prompt.content.toLowerCase();
            const category = prompt.category.toLowerCase();
            const tags = (prompt.tags || []).map(t => t.toLowerCase());
            // 匹配标题、内容、分类或标签
            return title.includes(lowerInput) ||
                content.includes(lowerInput) ||
                category.includes(lowerInput) ||
                tags.some(tag => tag.includes(lowerInput));
        });
    }
    /**
     * 更新建议（通用方法）
     */
    async updateSuggestions() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const position = editor.selection.active;
        const lineText = editor.document.lineAt(position.line).text;
        const textBeforeCursor = lineText.substring(0, position.character);
        await this.updateSuggestionsBasedOnInput(textBeforeCursor);
    }
    /**
     * 显示状态栏项
     */
    showStatusBarItem(count) {
        this._statusBarItem.text = `$(light-bulb) ${count} 个提示词建议`;
        this._statusBarItem.show();
    }
    /**
     * 隐藏状态栏项
     */
    hideStatusBarItem() {
        this._statusBarItem.hide();
    }
    /**
     * 获取当前建议
     */
    getSuggestions() {
        return this._suggestions;
    }
    /**
     * 显示建议面板
     */
    async showSuggestionPanel() {
        // 先更新建议（基于当前输入）
        await this.updateSuggestions();
        const suggestions = this.getSuggestions();
        if (suggestions.length === 0) {
            // 如果没有建议，显示所有提示词
            const allPrompts = await this._promptManager.getSortedPrompts('useCount');
            const items = allPrompts.slice(0, 10).map(s => ({
                label: s.title,
                description: s.category,
                detail: s.content.substring(0, 150) + (s.content.length > 150 ? '...' : ''),
                prompt: s
            }));
            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: '选择要插入的提示词',
                canPickMany: false
            });
            if (selected && selected.prompt) {
                await this.insertPrompt(selected.prompt);
            }
            return;
        }
        // 使用QuickPick显示建议
        const items = suggestions.map(s => ({
            label: `$(light-bulb) ${s.title}`,
            description: s.category,
            detail: s.content.substring(0, 150) + (s.content.length > 150 ? '...' : ''),
            prompt: s
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: '选择要插入的提示词（基于当前输入智能推荐）',
            canPickMany: false
        });
        if (selected && selected.prompt) {
            await this.insertPrompt(selected.prompt);
        }
    }
    /**
     * 插入提示词（用于AI对话 - 复制到剪贴板）
     */
    async insertPrompt(prompt) {
        // 复制到剪贴板供AI对话使用
        await vscode.env.clipboard.writeText(prompt.content);
        // 增加使用次数
        await this._promptManager.incrementUseCount(prompt.id);
        vscode.window.showInformationMessage(`提示词已复制到剪贴板: ${prompt.title}，请粘贴到AI聊天框中`);
    }
    /**
     * 显示建议下拉列表（在输入框附近）
     */
    async showInlineSuggestions() {
        const suggestions = this.getSuggestions();
        if (suggestions.length === 0) {
            return undefined;
        }
        // 创建一个自定义的QuickPick来显示建议
        const quickPick = vscode.window.createQuickPick();
        quickPick.placeholder = '选择一个提示词（输入时自动匹配）';
        quickPick.items = suggestions.map(s => ({
            label: s.title,
            description: s.category,
            detail: s.content.substring(0, 100) + (s.content.length > 100 ? '...' : ''),
            prompt: s
        }));
        return new Promise((resolve) => {
            quickPick.onDidAccept(() => {
                const selected = quickPick.selectedItems[0];
                if (selected && selected.prompt) {
                    resolve(selected.prompt);
                }
                else {
                    resolve(undefined);
                }
                quickPick.dispose();
            });
            quickPick.onDidHide(() => {
                resolve(undefined);
                quickPick.dispose();
            });
            quickPick.show();
        });
    }
    dispose() {
        if (this._disposable) {
            this._disposable.dispose();
        }
        if (this._statusBarItem) {
            this._statusBarItem.dispose();
        }
    }
}
exports.InputSuggestionService = InputSuggestionService;
//# sourceMappingURL=inputSuggestion.js.map