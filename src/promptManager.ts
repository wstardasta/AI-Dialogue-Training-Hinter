import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface Prompt {
    id: string;
    title: string;
    content: string;
    category: string;
    useCount: number;
    createdAt: string;
    author: string;
    tags?: string[];
    isFavorite?: boolean; // 是否收藏
}

export class PromptManager {
    private storagePath: vscode.Uri;
    private prompts: Prompt[] = [];

    constructor(storageUri: vscode.Uri) {
        this.storagePath = vscode.Uri.joinPath(storageUri, 'prompts.json');
        this.loadPrompts();
    }

    private async ensureStorageDir(): Promise<void> {
        const dir = vscode.Uri.joinPath(this.storagePath, '..');
        try {
            await vscode.workspace.fs.createDirectory(dir);
        } catch (error) {
            // 目录可能已存在，忽略错误
        }
    }

    private async loadPrompts(): Promise<void> {
        try {
            await this.ensureStorageDir();
            const data = await vscode.workspace.fs.readFile(this.storagePath);
            const content = Buffer.from(data).toString('utf-8');
            this.prompts = JSON.parse(content);
        } catch (error) {
            // 文件不存在，使用默认提示词
            this.prompts = this.getDefaultPrompts();
            await this.savePrompts();
        }
    }

    private async savePrompts(): Promise<void> {
        try {
            await this.ensureStorageDir();
            const content = JSON.stringify(this.prompts, null, 2);
            await vscode.workspace.fs.writeFile(
                this.storagePath,
                Buffer.from(content, 'utf-8')
            );
        } catch (error) {
            console.error('保存提示词失败:', error);
            vscode.window.showErrorMessage('保存提示词失败');
        }
    }

    private getDefaultPrompts(): Prompt[] {
        return [
            {
                id: '1',
                title: '代码优化',
                content: '请帮我优化这段代码，重点关注性能、可读性和最佳实践。',
                category: '代码优化',
                useCount: 0,
                createdAt: new Date().toISOString(),
                author: '系统'
            },
            {
                id: '2',
                title: '生成单元测试',
                content: '请为以下代码生成完整的单元测试，包括正常情况和边界情况。',
                category: '测试用例',
                useCount: 0,
                createdAt: new Date().toISOString(),
                author: '系统'
            },
            {
                id: '3',
                title: '代码审查',
                content: '请审查这段代码，指出潜在的问题、安全漏洞和改进建议。',
                category: '代码审查',
                useCount: 0,
                createdAt: new Date().toISOString(),
                author: '系统'
            },
            {
                id: '4',
                title: '修复Bug',
                content: '这段代码存在Bug，请帮我分析问题原因并提供修复方案。',
                category: 'Bug修复',
                useCount: 0,
                createdAt: new Date().toISOString(),
                author: '系统'
            },
            {
                id: '5',
                title: '生成API文档',
                content: '请为以下API生成详细的文档，包括参数说明、返回值和使用示例。',
                category: '文档编写',
                useCount: 0,
                createdAt: new Date().toISOString(),
                author: '系统'
            }
        ];
    }

    async getAllPrompts(): Promise<Prompt[]> {
        return [...this.prompts];
    }

    async getPromptsByCategory(category: string): Promise<Prompt[]> {
        return this.prompts.filter(p => p.category === category);
    }

    async getSortedPrompts(sortBy: 'useCount' | 'createdAt' = 'useCount'): Promise<Prompt[]> {
        const sorted = [...this.prompts];
        if (sortBy === 'useCount') {
            return sorted.sort((a, b) => b.useCount - a.useCount);
        } else {
            return sorted.sort((a, b) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }
    }

    async addPrompt(prompt: Prompt): Promise<void> {
        this.prompts.push(prompt);
        await this.savePrompts();
    }

    async updatePrompt(id: string, updates: Partial<Prompt>): Promise<void> {
        const index = this.prompts.findIndex(p => p.id === id);
        if (index !== -1) {
            this.prompts[index] = { ...this.prompts[index], ...updates };
            await this.savePrompts();
        }
    }

    async deletePrompt(id: string): Promise<void> {
        this.prompts = this.prompts.filter(p => p.id !== id);
        await this.savePrompts();
    }

    async incrementUseCount(id: string): Promise<void> {
        const prompt = this.prompts.find(p => p.id === id);
        if (prompt) {
            prompt.useCount++;
            await this.savePrompts();
        }
    }

    async searchPrompts(keyword: string): Promise<Prompt[]> {
        const lowerKeyword = keyword.toLowerCase();
        return this.prompts.filter(p =>
            p.title.toLowerCase().includes(lowerKeyword) ||
            p.content.toLowerCase().includes(lowerKeyword) ||
            p.category.toLowerCase().includes(lowerKeyword)
        );
    }

    /**
     * 切换提示词的收藏状态
     */
    async toggleFavorite(id: string): Promise<boolean> {
        const prompt = this.prompts.find(p => p.id === id);
        if (prompt) {
            prompt.isFavorite = !prompt.isFavorite;
            await this.savePrompts();
            return prompt.isFavorite;
        }
        return false;
    }

    /**
     * 获取所有收藏的提示词
     */
    async getFavoritePrompts(): Promise<Prompt[]> {
        return this.prompts.filter(p => p.isFavorite === true);
    }

    /**
     * 检查提示词是否已收藏
     */
    async isFavorite(id: string): Promise<boolean> {
        const prompt = this.prompts.find(p => p.id === id);
        return prompt?.isFavorite === true;
    }

    /**
     * 批量添加提示词（用于从云端下载）
     */
    async addPromptsBatch(prompts: Prompt[]): Promise<number> {
        let addedCount = 0;
        const existingTitles = new Set(this.prompts.map(p => p.title.toLowerCase()));

        for (const prompt of prompts) {
            // 检查是否已存在（通过标题判断）
            if (!existingTitles.has(prompt.title.toLowerCase())) {
                // 确保ID唯一
                prompt.id = `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                this.prompts.push(prompt);
                existingTitles.add(prompt.title.toLowerCase());
                addedCount++;
            }
        }

        if (addedCount > 0) {
            await this.savePrompts();
        }

        return addedCount;
    }
}

