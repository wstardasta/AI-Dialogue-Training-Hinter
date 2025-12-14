import * as vscode from 'vscode';
import { LanguageDetector } from './languageDetector';

export interface CodeContext {
    selectedText: string;
    language: string;
    filePath: string;
    surroundingLines?: string[];
    functionName?: string;
    className?: string;
}

/**
 * 代码分析器 - 分析当前代码片段并生成提示词
 */
export class CodeAnalyzer {
    /**
     * 获取当前代码上下文
     */
    static async getCurrentCodeContext(): Promise<CodeContext | null> {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }

        const document = editor.document;
        const selection = editor.selection;
        const selectedText = document.getText(selection);

        // 获取选中的代码周围的内容
        const startLine = Math.max(0, selection.start.line - 5);
        const endLine = Math.min(document.lineCount - 1, selection.end.line + 5);
        const surroundingLines: string[] = [];
        for (let i = startLine; i <= endLine; i++) {
            surroundingLines.push(document.lineAt(i).text);
        }

        // 尝试提取函数名或类名
        let functionName: string | undefined;
        let className: string | undefined;

        if (selectedText) {
            // 简单的函数名提取（适用于常见语言）
            const functionMatch = selectedText.match(/(?:function|def|async\s+function)\s+(\w+)/);
            if (functionMatch) {
                functionName = functionMatch[1];
            }

            const classMatch = selectedText.match(/class\s+(\w+)/);
            if (classMatch) {
                className = classMatch[1];
            }
        }

        return {
            selectedText: selectedText || document.getText(),
            language: document.languageId,
            filePath: document.fileName,
            surroundingLines: surroundingLines.length > 0 ? surroundingLines : undefined,
            functionName,
            className
        };
    }

    /**
     * 基于代码上下文生成提示词
     */
    static async generatePromptFromCode(context: CodeContext, template?: string): Promise<string> {
        const languageInfo = LanguageDetector.detectCurrentLanguage();
        const projectInfo = await LanguageDetector.detectProjectType();

        let prompt = template || '';

        if (!prompt) {
            // 如果没有模板，根据上下文生成基础提示词
            if (context.selectedText) {
                prompt = this.generateDefaultPrompt(context);
            } else {
                prompt = `请帮我分析以下${languageInfo?.language || '代码'}代码：\n\n${context.selectedText}`;
            }
        } else {
            // 替换模板变量
            prompt = this.replaceTemplateVariables(prompt, context, languageInfo, projectInfo);
        }

        return prompt;
    }

    /**
     * 生成默认提示词
     */
    private static generateDefaultPrompt(context: CodeContext): string {
        const language = context.language;
        let action = '优化';

        // 根据代码特征决定操作
        if (context.selectedText.includes('TODO') || context.selectedText.includes('FIXME')) {
            action = '修复';
        } else if (context.selectedText.includes('test') || context.selectedText.includes('Test')) {
            action = '审查测试用例';
        } else if (context.selectedText.includes('function') || context.selectedText.includes('def')) {
            action = '优化函数';
        }

        let prompt = `请帮我${action}以下${language}代码：\n\n\`\`\`${language}\n${context.selectedText}\n\`\`\`\n\n`;

        if (context.functionName) {
            prompt += `函数名：${context.functionName}\n`;
        }

        if (context.className) {
            prompt += `类名：${context.className}\n`;
        }

        prompt += '请提供详细的建议和改进方案。';

        return prompt;
    }

    /**
     * 替换模板变量
     */
    private static replaceTemplateVariables(
        template: string,
        context: CodeContext,
        languageInfo: any,
        projectInfo: any
    ): string {
        let result = template;

        // 替换代码占位符
        result = result.replace(/\{\{code\}\}/g, context.selectedText);
        result = result.replace(/\{\{selectedText\}\}/g, context.selectedText);

        // 替换语言信息
        result = result.replace(/\{\{language\}\}/g, context.language);
        result = result.replace(/\{\{languageName\}\}/g, languageInfo?.language || context.language);

        // 替换文件路径
        result = result.replace(/\{\{filePath\}\}/g, context.filePath);

        // 替换函数名和类名
        if (context.functionName) {
            result = result.replace(/\{\{functionName\}\}/g, context.functionName);
        }
        if (context.className) {
            result = result.replace(/\{\{className\}\}/g, context.className);
        }

        // 替换项目信息
        if (projectInfo) {
            result = result.replace(/\{\{projectType\}\}/g, projectInfo.type || '');
            result = result.replace(/\{\{framework\}\}/g, projectInfo.framework || '');
        }

        return result;
    }

    /**
     * 提取代码的关键信息用于匹配提示词
     */
    static extractKeywords(context: CodeContext): string[] {
        const keywords: string[] = [];

        // 从代码中提取关键词
        const code = context.selectedText.toLowerCase();

        // 常见编程关键词
        const programmingKeywords = [
            'function', 'class', 'async', 'await', 'promise', 'callback',
            'error', 'exception', 'try', 'catch', 'test', 'spec',
            'api', 'route', 'endpoint', 'controller', 'service',
            'database', 'query', 'sql', 'orm', 'model',
            'component', 'props', 'state', 'hook', 'render'
        ];

        programmingKeywords.forEach(keyword => {
            if (code.includes(keyword)) {
                keywords.push(keyword);
            }
        });

        // 添加语言信息
        keywords.push(context.language);

        return keywords;
    }
}

