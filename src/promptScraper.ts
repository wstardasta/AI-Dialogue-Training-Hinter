import * as https from 'https';
import * as http from 'http';
import { Prompt } from './promptManager';

/**
 * 提示词爬虫 - 从网络获取常用提示词
 */
export class PromptScraper {
    /**
     * 从多个来源获取常用提示词
     */
    async fetchCommonPrompts(): Promise<Prompt[]> {
        const prompts: Prompt[] = [];

        try {
            // 方法1: 使用内置的常用提示词（作为备用数据源）
            const builtInPrompts = this.getBuiltInPrompts();
            prompts.push(...builtInPrompts);

            // 方法2: 尝试从GitHub等公开资源获取（这里我们使用模拟数据）
            // 在实际环境中，可以解析GitHub上的提示词仓库
            const githubPrompts = await this.fetchFromGitHubRepos();
            prompts.push(...githubPrompts);

            // 方法3: 使用API获取提示词（如果有公开的API）
            // const apiPrompts = await this.fetchFromAPIs();
            // prompts.push(...apiPrompts);

        } catch (error) {
            console.error('获取提示词时出错:', error);
            // 如果获取失败，至少返回内置提示词
            prompts.push(...this.getBuiltInPrompts());
        }

        return prompts;
    }

    /**
     * 获取内置的常用提示词（基于社区常用提示词）
     */
    private getBuiltInPrompts(): Prompt[] {
        const now = new Date().toISOString();
        return [
            {
                id: `builtin-${Date.now()}-1`,
                title: '代码重构优化',
                content: '请帮我重构以下代码，提高代码质量、可读性和可维护性，同时保持原有功能不变。',
                category: '代码优化',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['重构', '优化', '代码质量']
            },
            {
                id: `builtin-${Date.now()}-2`,
                title: '性能优化建议',
                content: '请分析以下代码的性能瓶颈，并提供优化建议，重点关注时间复杂度和空间复杂度。',
                category: '代码优化',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['性能', '优化', '算法']
            },
            {
                id: `builtin-${Date.now()}-3`,
                title: '生成函数实现',
                content: '请根据以下函数签名和需求描述，生成完整的函数实现代码，包括错误处理和边界情况处理。',
                category: '代码生成',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['代码生成', '函数', '实现']
            },
            {
                id: `builtin-${Date.now()}-4`,
                title: '生成类结构',
                content: '请根据以下需求，设计并生成完整的类结构，包括属性、方法和必要的构造函数。',
                category: '代码生成',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['类设计', 'OOP', '架构']
            },
            {
                id: `builtin-${Date.now()}-5`,
                title: '代码审查',
                content: '请审查以下代码，指出潜在的问题、安全漏洞、性能问题和代码异味，并提供改进建议。',
                category: '代码审查',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['代码审查', '最佳实践', '安全性']
            },
            {
                id: `builtin-${Date.now()}-6`,
                title: '查找Bug',
                content: '以下代码存在Bug，请帮我分析问题原因，定位错误位置，并提供修复方案和测试用例。',
                category: 'Bug修复',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['Bug', '调试', '修复']
            },
            {
                id: `builtin-${Date.now()}-7`,
                title: '编写单元测试',
                content: '请为以下代码编写完整的单元测试，包括正常情况、边界情况和异常情况的测试用例。',
                category: '测试用例',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['测试', '单元测试', 'TDD']
            },
            {
                id: `builtin-${Date.now()}-8`,
                title: '生成API文档',
                content: '请为以下API接口生成详细的文档，包括接口说明、请求参数、响应格式和使用示例。',
                category: '文档编写',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['文档', 'API', '说明']
            },
            {
                id: `builtin-${Date.now()}-9`,
                title: '代码注释生成',
                content: '请为以下代码添加详细的注释，包括函数说明、参数说明、返回值说明和算法逻辑说明。',
                category: '文档编写',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['注释', '文档', '代码说明']
            },
            {
                id: `builtin-${Date.now()}-10`,
                title: '架构设计',
                content: '请根据以下需求，设计系统架构，包括模块划分、数据流、接口设计和关键技术选型。',
                category: '架构设计',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['架构', '设计', '系统设计']
            },
            {
                id: `builtin-${Date.now()}-11`,
                title: '数据库设计',
                content: '请根据以下业务需求，设计数据库表结构，包括表名、字段、索引和表之间的关系。',
                category: '架构设计',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['数据库', 'SQL', '设计']
            },
            {
                id: `builtin-${Date.now()}-12`,
                title: '代码翻译',
                content: '请将以下代码从一种编程语言翻译到另一种编程语言，保持相同的功能和逻辑。',
                category: '代码生成',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['翻译', '代码转换', '多语言']
            },
            {
                id: `builtin-${Date.now()}-13`,
                title: '正则表达式生成',
                content: '请根据以下需求，生成匹配的正则表达式，并提供详细的解释和测试用例。',
                category: '代码生成',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['正则表达式', '字符串匹配']
            },
            {
                id: `builtin-${Date.now()}-14`,
                title: '错误处理优化',
                content: '请优化以下代码的错误处理逻辑，添加适当的异常捕获和错误信息提示。',
                category: '代码优化',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['错误处理', '异常', '健壮性']
            },
            {
                id: `builtin-${Date.now()}-15`,
                title: '代码风格统一',
                content: '请将以下代码按照项目的编码规范进行格式化，确保代码风格统一。',
                category: '代码优化',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['代码风格', '格式化', '规范']
            },
            {
                id: `builtin-${Date.now()}-16`,
                title: '异步代码优化',
                content: '请优化以下异步代码，使用最佳实践处理异步操作，提高代码可读性和性能。',
                category: '代码优化',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['异步', 'Promise', 'async/await']
            },
            {
                id: `builtin-${Date.now()}-17`,
                title: '设计模式应用',
                content: '请分析以下代码场景，建议合适的设计模式，并重构代码应用该设计模式。',
                category: '代码优化',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['设计模式', '重构', '最佳实践']
            },
            {
                id: `builtin-${Date.now()}-18`,
                title: '生成README文档',
                content: '请为以下项目生成README.md文档，包括项目介绍、安装说明、使用方法和示例代码。',
                category: '文档编写',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['README', '文档', '项目说明']
            },
            {
                id: `builtin-${Date.now()}-19`,
                title: '安全漏洞检测',
                content: '请检查以下代码中可能存在的安全漏洞，包括SQL注入、XSS攻击、CSRF攻击等安全问题。',
                category: '代码审查',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['安全', '漏洞', '防护']
            },
            {
                id: `builtin-${Date.now()}-20`,
                title: '代码简化',
                content: '请简化以下代码，去除冗余逻辑，使代码更简洁易读，但保持功能完整。',
                category: '代码优化',
                useCount: 0,
                createdAt: now,
                author: '系统内置',
                tags: ['简化', '重构', '可读性']
            }
        ];
    }

    /**
     * 从GitHub仓库获取提示词（模拟实现）
     * 在实际应用中，可以解析GitHub上的提示词仓库JSON文件
     */
    private async fetchFromGitHubRepos(): Promise<Prompt[]> {
        // 这里可以添加实际的GitHub API调用
        // 例如：https://api.github.com/repos/username/prompt-repo/contents/prompts.json
        // 由于需要处理网络请求和可能的认证，这里先返回空数组
        // 实际使用时可以实现真实的HTTP请求
        return [];
    }

    /**
     * 从HTTP/HTTPS URL获取JSON数据
     */
    private async fetchJSON(url: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            
            protocol.get(url, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (error) {
                        reject(new Error('解析JSON失败'));
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });
    }
}

