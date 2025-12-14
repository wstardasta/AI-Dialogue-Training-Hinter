import * as vscode from 'vscode';
import { Prompt } from './promptManager';
import { CodeAnalyzer, CodeContext } from './codeAnalyzer';

/**
 * AI聊天助手 - 专门用于生成和管理AI对话提示词
 */
export class AIChatHelper {
    /**
     * 将提示词复制到剪贴板，供用户粘贴到AI聊天框
     */
    static async copyToClipboardForAI(prompt: string): Promise<void> {
        await vscode.env.clipboard.writeText(prompt);
        vscode.window.showInformationMessage('提示词已复制到剪贴板，请粘贴到AI聊天框中');
    }

    /**
     * 基于选中的代码生成AI对话提示词
     */
    static async generateAIPromptFromCode(context?: CodeContext | null): Promise<string | null> {
        if (!context) {
            context = await CodeAnalyzer.getCurrentCodeContext() || undefined;
        }

        if (!context || !context.selectedText) {
            vscode.window.showWarningMessage('请先选择代码片段');
            return null;
        }

        // 生成适合AI对话的提示词
        const prompt = await CodeAnalyzer.generatePromptFromCode(context);
        return prompt;
    }

    /**
     * 快速发送提示词到AI（复制到剪贴板）
     */
    static async quickSendToAI(prompt: Prompt | string): Promise<void> {
        const promptText = typeof prompt === 'string' ? prompt : prompt.content;
        await this.copyToClipboardForAI(promptText);
    }

    /**
     * 基于代码上下文生成并发送AI提示词
     */
    static async sendContextToAI(): Promise<void> {
        const context = await CodeAnalyzer.getCurrentCodeContext();
        
        if (!context || !context.selectedText) {
            // 如果没有选中代码，让用户选择操作
            const actions = [
                '解释这段代码',
                '优化这段代码',
                '生成测试用例',
                '查找Bug',
                '添加注释',
                '重构代码',
                '生成文档'
            ];

            const selected = await vscode.window.showQuickPick(actions, {
                placeHolder: '选择要对AI说什么'
            });

            if (selected) {
                const prompt = `请${selected}：\n\n${context?.selectedText || '（请先选择代码）'}`;
                await this.copyToClipboardForAI(prompt);
            }
            return;
        }

        // 如果有选中代码，生成智能提示词
        const prompt = await this.generateAIPromptFromCode(context);
        if (prompt) {
            await this.copyToClipboardForAI(prompt);
        }
    }

    /**
     * 显示提示词选择器，选择后复制到剪贴板
     */
    static async showPromptSelector(prompts: Prompt[]): Promise<void> {
        const items = prompts.map(p => ({
            label: p.title,
            description: p.category,
            detail: p.content.substring(0, 150) + (p.content.length > 150 ? '...' : ''),
            prompt: p
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: '选择要使用的提示词（将复制到剪贴板）'
        });

        if (selected && selected.prompt) {
            await this.quickSendToAI(selected.prompt);
        }
    }
}

