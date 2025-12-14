"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptTemplateManager = void 0;
/**
 * 提示词模板管理器
 */
class PromptTemplateManager {
    /**
     * 获取所有系统模板
     */
    static getSystemTemplates() {
        return [...this.systemTemplates];
    }
    /**
     * 根据语言和类别获取推荐的模板
     */
    static getRecommendedTemplates(language, category) {
        let templates = this.systemTemplates;
        if (language) {
            templates = templates.filter(t => !t.language || t.language.length === 0 || t.language.includes(language));
        }
        if (category) {
            templates = templates.filter(t => t.category === category);
        }
        return templates;
    }
    /**
     * 根据ID获取模板
     */
    static getTemplateById(id) {
        return this.systemTemplates.find(t => t.id === id);
    }
    /**
     * 将模板转换为提示词
     */
    static templateToPrompt(template, context) {
        let content = template.template;
        // 替换变量
        template.variables.forEach(variable => {
            const value = context[variable] || '';
            const regex = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
            content = content.replace(regex, value);
        });
        return {
            id: Date.now().toString(),
            title: template.name,
            content: content,
            category: template.category,
            useCount: 0,
            createdAt: new Date().toISOString(),
            author: template.author,
            tags: [template.name]
        };
    }
}
exports.PromptTemplateManager = PromptTemplateManager;
PromptTemplateManager.systemTemplates = [
    {
        id: 'api-doc-1',
        name: 'API文档生成',
        description: 'Generate API documentation',
        category: '文档编写',
        template: '请为以下API函数生成详细的文档：\n\n函数：{{functionName}}\n语言：{{language}}\n代码：\n```{{language}}\n{{code}}\n```\n\n请包括：\n1. 函数说明\n2. 参数说明\n3. 返回值说明\n4. 使用示例\n5. 异常情况',
        variables: ['functionName', 'code', 'language'],
        language: ['javascript', 'typescript', 'python', 'java'],
        isSystemTemplate: true,
        author: 'system',
        createdAt: new Date().toISOString()
    },
    {
        id: 'explain-code-1',
        name: '解释代码',
        description: 'Explain what this code does',
        category: '代码审查',
        template: '请详细解释以下{{language}}代码的功能和作用：\n\n```{{language}}\n{{code}}\n```\n\n请包括：\n1. 代码的整体功能\n2. 关键逻辑说明\n3. 变量和函数的作用\n4. 可能的改进建议',
        variables: ['code', 'language'],
        language: [],
        isSystemTemplate: true,
        author: 'system',
        createdAt: new Date().toISOString()
    },
    {
        id: 'optimize-code-1',
        name: '优化代码',
        description: 'Optimize this code',
        category: '代码优化',
        template: '请优化以下{{language}}代码，提高代码质量和性能：\n\n```{{language}}\n{{code}}\n```\n\n优化目标：\n1. 提高代码可读性\n2. 优化性能\n3. 遵循最佳实践\n4. 减少代码复杂度',
        variables: ['code', 'language'],
        language: [],
        isSystemTemplate: true,
        author: 'system',
        createdAt: new Date().toISOString()
    },
    {
        id: 'add-comments-1',
        name: '添加注释',
        description: 'Add comments to code',
        category: '文档编写',
        template: '请为以下{{language}}代码添加详细的注释：\n\n```{{language}}\n{{code}}\n```\n\n请包括：\n1. 函数/类的作用说明\n2. 参数说明\n3. 返回值说明\n4. 关键逻辑的行内注释',
        variables: ['code', 'language'],
        language: [],
        isSystemTemplate: true,
        author: 'system',
        createdAt: new Date().toISOString()
    },
    {
        id: 'unit-test-1',
        name: '单元测试生成',
        description: 'Generate unit tests',
        category: '测试用例',
        template: '请为以下{{language}}代码生成完整的单元测试：\n\n代码：\n```{{language}}\n{{code}}\n```\n\n请包括：\n1. 正常情况的测试用例\n2. 边界情况的测试用例\n3. 异常情况的测试用例\n4. 使用适当的测试框架',
        variables: ['code', 'language'],
        language: ['javascript', 'typescript', 'python', 'java'],
        isSystemTemplate: true,
        author: 'system',
        createdAt: new Date().toISOString()
    },
    {
        id: 'code-review-1',
        name: '代码审查',
        description: 'Code review',
        category: '代码审查',
        template: '请审查以下{{language}}代码，指出潜在问题：\n\n代码：\n```{{language}}\n{{code}}\n```\n\n请关注：\n1. 代码质量和可读性\n2. 性能问题\n3. 安全性问题\n4. 最佳实践\n5. 潜在的Bug',
        variables: ['code', 'language'],
        language: [],
        isSystemTemplate: true,
        author: 'system',
        createdAt: new Date().toISOString()
    },
    {
        id: 'bug-fix-1',
        name: 'Bug修复',
        description: 'Bug fixing',
        category: 'Bug修复',
        template: '以下{{language}}代码存在Bug，请帮我分析并修复：\n\n代码：\n```{{language}}\n{{code}}\n```\n\n请提供：\n1. 问题分析\n2. 修复方案\n3. 修复后的代码\n4. 测试建议',
        variables: ['code', 'language'],
        language: [],
        isSystemTemplate: true,
        author: 'system',
        createdAt: new Date().toISOString()
    },
    {
        id: 'refactor-1',
        name: '代码重构',
        description: 'Code refactoring',
        category: '代码优化',
        template: '请重构以下{{language}}代码，提高代码质量：\n\n代码：\n```{{language}}\n{{code}}\n```\n\n重构目标：\n1. 提高可读性\n2. 提高可维护性\n3. 优化性能\n4. 遵循最佳实践',
        variables: ['code', 'language'],
        language: [],
        isSystemTemplate: true,
        author: 'system',
        createdAt: new Date().toISOString()
    },
    {
        id: 'optimize-1',
        name: '性能优化',
        description: 'Performance optimization',
        category: '代码优化',
        template: '请优化以下{{language}}代码的性能：\n\n代码：\n```{{language}}\n{{code}}\n```\n\n优化方向：\n1. 时间复杂度优化\n2. 空间复杂度优化\n3. 算法优化\n4. 缓存策略',
        variables: ['code', 'language'],
        language: [],
        isSystemTemplate: true,
        author: 'system',
        createdAt: new Date().toISOString()
    }
];
//# sourceMappingURL=promptTemplates.js.map