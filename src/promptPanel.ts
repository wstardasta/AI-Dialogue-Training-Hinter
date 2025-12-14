import * as vscode from 'vscode';
import { PromptManager, Prompt } from './promptManager';

export class PromptPanel {
    public static readonly viewType = 'promptHelperPanel';
    private _panel: vscode.WebviewPanel | undefined;
    private _disposables: vscode.Disposable[] = [];
    private _promptManager: PromptManager;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        promptManager: PromptManager
    ) {
        this._promptManager = promptManager;
    }

    public reveal() {
        if (this._panel) {
            this._panel.reveal();
        } else {
            this._createPanel();
        }
    }

    private _createPanel() {
        const panel = vscode.window.createWebviewPanel(
            PromptPanel.viewType,
            '提示词助手',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [this._extensionUri]
            }
        );

        this._panel = panel;
        this._update();

        panel.onDidDispose(() => this.dispose(), null, this._disposables);

        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'insertPrompt':
                        await this._insertPrompt(message.promptId);
                        break;
                    case 'deletePrompt':
                        await this._deletePrompt(message.promptId);
                        break;
                    case 'addPrompt':
                        await this._addPrompt(message.prompt);
                        break;
                    case 'incrementUseCount':
                        await this._promptManager.incrementUseCount(message.promptId);
                        this.refresh();
                        break;
                    case 'search':
                        await this._searchPrompts(message.keyword);
                        break;
                    case 'fetchPrompts':
                        await this._fetchPrompts();
                        break;
                    case 'toggleFavorite':
                        await this._toggleFavorite(message.promptId);
                        break;
                }
            },
            null,
            this._disposables
        );
    }

    private async _insertPrompt(promptId: string) {
        const prompts = await this._promptManager.getAllPrompts();
        const prompt = prompts.find(p => p.id === promptId);
        
        if (prompt) {
            // 复制到剪贴板供AI对话使用
            await vscode.env.clipboard.writeText(prompt.content);
            await this._promptManager.incrementUseCount(promptId);
            vscode.window.showInformationMessage(`提示词已复制到剪贴板: ${prompt.title}，请粘贴到AI聊天框中`);
            this.refresh();
        }
    }

    private async _deletePrompt(promptId: string) {
        const result = await vscode.window.showWarningMessage(
            '确定要删除这个提示词吗？',
            '确定',
            '取消'
        );
        
        if (result === '确定') {
            await this._promptManager.deletePrompt(promptId);
            vscode.window.showInformationMessage('提示词已删除');
            this.refresh();
        }
    }

    private async _addPrompt(prompt: Prompt) {
        prompt.id = Date.now().toString();
        prompt.useCount = 0;
        prompt.createdAt = new Date().toISOString();
        await this._promptManager.addPrompt(prompt);
        vscode.window.showInformationMessage(`提示词 "${prompt.title}" 已添加！`);
        this.refresh();
    }

    private async _searchPrompts(keyword: string) {
        const prompts = await this._promptManager.searchPrompts(keyword);
        this._updateWithPrompts(prompts);
    }

    private async _fetchPrompts() {
        // 调用扩展命令来获取提示词
        await vscode.commands.executeCommand('promptHelper.fetchPrompts');
        // 延迟刷新以确保数据已保存
        setTimeout(() => {
            this.refresh();
        }, 1000);
    }

    private async _toggleFavorite(promptId: string) {
        const isFavorite = await this._promptManager.toggleFavorite(promptId);
        const message = isFavorite ? '已收藏' : '已取消收藏';
        vscode.window.showInformationMessage(message);
        this.refresh();
    }

    public refresh() {
        if (this._panel) {
            this._update();
        }
    }

    private async _update() {
        if (!this._panel) {
            return;
        }

        const prompts = await this._promptManager.getSortedPrompts('useCount');
        // 收藏的提示词排在前面
        const sortedPrompts = prompts.sort((a, b) => {
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;
            return b.useCount - a.useCount;
        });
        this._updateWithPrompts(sortedPrompts);
    }

    private _updateWithPrompts(prompts: Prompt[]) {
        if (!this._panel) {
            return;
        }

        this._panel.webview.html = this._getHtmlForWebview(prompts);
    }

    private _getHtmlForWebview(prompts: Prompt[]): string {
        const categories = Array.from(new Set(prompts.map(p => p.category)));
        const categoriesHtml = categories.map(cat => 
            `<option value="${cat}">${cat}</option>`
        ).join('');

        const promptsHtml = prompts.map(prompt => {
            const favoriteIcon = prompt.isFavorite ? '★' : '☆';
            const favoriteClass = prompt.isFavorite ? 'favorite-active' : 'favorite-inactive';
            return `
            <div class="prompt-item" data-id="${prompt.id}">
                <div class="prompt-header">
                    <h3>
                        ${prompt.isFavorite ? '<span class="favorite-star">★</span>' : ''}
                        ${this._escapeHtml(prompt.title)}
                    </h3>
                    <div class="prompt-meta">
                        <span class="category">${this._escapeHtml(prompt.category)}</span>
                        <span class="use-count">使用 ${prompt.useCount} 次</span>
                    </div>
                </div>
                <div class="prompt-content">${this._escapeHtml(prompt.content)}</div>
                <div class="prompt-actions">
                    <button class="btn btn-primary" onclick="insertPrompt('${prompt.id}')">用于AI对话</button>
                    <button class="btn btn-secondary" onclick="copyPrompt('${prompt.id}')">复制</button>
                    <button class="btn-favorite ${favoriteClass}" onclick="toggleFavorite('${prompt.id}')" title="${prompt.isFavorite ? '取消收藏' : '收藏'}">
                        ${favoriteIcon}
                    </button>
                    <button class="btn btn-danger" onclick="deletePrompt('${prompt.id}')">删除</button>
                </div>
            </div>
        `;
        }).join('');

        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>提示词助手</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 20px;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        .header {
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 24px;
            margin-bottom: 15px;
        }
        .search-bar {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
        }
        .search-bar input,
        .search-bar select {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid var(--vscode-input-border);
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
        }
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: opacity 0.2s;
        }
        .btn:hover {
            opacity: 0.8;
        }
        .btn-primary {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        .btn-secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .btn-danger {
            background: #d32f2f;
            color: white;
        }
        .btn-favorite {
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 18px;
            background: transparent;
            transition: all 0.2s;
        }
        .btn-favorite:hover {
            transform: scale(1.2);
        }
        .favorite-active {
            color: #ffd700;
        }
        .favorite-inactive {
            color: var(--vscode-descriptionForeground);
        }
        .favorite-star {
            color: #ffd700;
            margin-right: 5px;
        }
        .add-prompt-btn {
            margin-bottom: 20px;
        }
        .prompts-list {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        .prompt-item {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            padding: 15px;
            background: var(--vscode-editor-background);
        }
        .prompt-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 10px;
        }
        .prompt-header h3 {
            font-size: 16px;
            margin-bottom: 5px;
        }
        .prompt-meta {
            display: flex;
            gap: 10px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }
        .category {
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            padding: 2px 8px;
            border-radius: 12px;
        }
        .prompt-content {
            margin: 10px 0;
            padding: 10px;
            background: var(--vscode-textBlockQuote-background);
            border-left: 3px solid var(--vscode-textBlockQuote-border);
            border-radius: 4px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .prompt-actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: var(--vscode-descriptionForeground);
        }
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1000;
        }
        .modal-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--vscode-editor-background);
            padding: 20px;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
        }
        .modal-header {
            margin-bottom: 15px;
        }
        .modal-body {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .modal-body input,
        .modal-body textarea,
        .modal-body select {
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
        }
        .modal-body textarea {
            min-height: 100px;
            resize: vertical;
        }
        .modal-footer {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>📝 提示词助手</h1>
        <div class="search-bar">
            <input type="text" id="searchInput" placeholder="搜索提示词..." />
            <select id="categoryFilter">
                <option value="">全部分类</option>
                ${categoriesHtml}
            </select>
            <select id="filterType">
                <option value="all">全部</option>
                <option value="favorites">仅收藏</option>
            </select>
        </div>
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
            <button class="btn btn-primary" onclick="showAddModal()">+ 添加新提示词</button>
            <button class="btn btn-secondary" onclick="fetchPrompts()">🌐 获取常用提示词</button>
        </div>
    </div>
    
    <div class="prompts-list" id="promptsList">
        ${prompts.length > 0 ? promptsHtml : '<div class="empty-state">暂无提示词，点击上方"获取常用提示词"按钮从网络获取，或点击"添加新提示词"手动添加</div>'}
    </div>

    <!-- 添加提示词模态框 -->
    <div id="addModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2>添加新提示词</h2>
            </div>
            <div class="modal-body">
                <input type="text" id="promptTitle" placeholder="提示词标题" />
                <textarea id="promptContent" placeholder="提示词内容"></textarea>
                <select id="promptCategory">
                    <option value="代码优化">代码优化</option>
                    <option value="代码生成">代码生成</option>
                    <option value="代码审查">代码审查</option>
                    <option value="Bug修复">Bug修复</option>
                    <option value="文档编写">文档编写</option>
                    <option value="测试用例">测试用例</option>
                    <option value="架构设计">架构设计</option>
                    <option value="其他">其他</option>
                </select>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeAddModal()">取消</button>
                <button class="btn btn-primary" onclick="submitPrompt()">添加</button>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', (e) => {
            const keyword = e.target.value;
            if (keyword.trim()) {
                vscode.postMessage({
                    command: 'search',
                    keyword: keyword
                });
            } else {
                location.reload();
            }
        });

        // 分类筛选
        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            applyFilters();
        });

        // 收藏筛选
        document.getElementById('filterType').addEventListener('change', (e) => {
            applyFilters();
        });

        function applyFilters() {
            const category = document.getElementById('categoryFilter').value;
            const filterType = document.getElementById('filterType').value;
            const items = document.querySelectorAll('.prompt-item');
            
            items.forEach(item => {
                const itemCategory = item.querySelector('.category').textContent;
                const isFavorite = item.querySelector('.favorite-star') !== null;
                
                let shouldShow = true;
                
                // 分类筛选
                if (category && itemCategory !== category) {
                    shouldShow = false;
                }
                
                // 收藏筛选
                if (filterType === 'favorites' && !isFavorite) {
                    shouldShow = false;
                }
                
                item.style.display = shouldShow ? 'block' : 'none';
            });
        }

        function insertPrompt(id) {
            vscode.postMessage({
                command: 'insertPrompt',
                promptId: id
            });
        }

        function copyPrompt(id) {
            const item = document.querySelector(\`[data-id="\${id}"]\`);
            const content = item.querySelector('.prompt-content').textContent;
            navigator.clipboard.writeText(content).then(() => {
                vscode.postMessage({
                    command: 'showMessage',
                    message: '已复制到剪贴板'
                });
            });
        }

        function deletePrompt(id) {
            vscode.postMessage({
                command: 'deletePrompt',
                promptId: id
            });
        }

        function toggleFavorite(id) {
            vscode.postMessage({
                command: 'toggleFavorite',
                promptId: id
            });
        }

        function showAddModal() {
            document.getElementById('addModal').style.display = 'block';
        }

        function closeAddModal() {
            document.getElementById('addModal').style.display = 'none';
            document.getElementById('promptTitle').value = '';
            document.getElementById('promptContent').value = '';
            document.getElementById('promptCategory').value = '其他';
        }

        function submitPrompt() {
            const title = document.getElementById('promptTitle').value;
            const content = document.getElementById('promptContent').value;
            const category = document.getElementById('promptCategory').value;

            if (!title || !content) {
                alert('请填写标题和内容');
                return;
            }

            vscode.postMessage({
                command: 'addPrompt',
                prompt: {
                    title,
                    content,
                    category,
                    author: '本地用户'
                }
            });

            closeAddModal();
        }

        function fetchPrompts() {
            vscode.postMessage({
                command: 'fetchPrompts'
            });
        }

        // 点击模态框外部关闭
        document.getElementById('addModal').addEventListener('click', (e) => {
            if (e.target.id === 'addModal') {
                closeAddModal();
            }
        });
    </script>
</body>
</html>`;
    }

    private _escapeHtml(text: string): string {
        const map: { [key: string]: string } = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m] || m);
    }

    public dispose() {
        if (this._panel) {
            this._panel.dispose();
        }

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}

