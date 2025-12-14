import * as vscode from 'vscode';

export interface LanguageInfo {
    language: string;
    extension: string;
    category: string;
}

export interface ProjectInfo {
    type: string;
    framework?: string;
    packageManager?: string;
}

/**
 * 语言检测器 - 检测当前编辑的文件语言和项目类型
 */
export class LanguageDetector {
    /**
     * 检测当前编辑器的语言
     */
    static detectCurrentLanguage(): LanguageInfo | null {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return null;
        }

        const languageId = editor.document.languageId;
        const fileName = editor.document.fileName;
        const extension = fileName.substring(fileName.lastIndexOf('.'));

        return {
            language: languageId,
            extension: extension,
            category: this.getCategoryFromLanguage(languageId)
        };
    }

    /**
     * 检测项目类型
     */
    static async detectProjectType(): Promise<ProjectInfo | null> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return null;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const projectInfo: ProjectInfo = {
            type: 'unknown'
        };

        try {
            // 检测 package.json (Node.js/JavaScript项目)
            const packageJsonPath = vscode.Uri.joinPath(workspaceFolders[0].uri, 'package.json');
            try {
                const packageJsonData = await vscode.workspace.fs.readFile(packageJsonPath);
                const packageJson = JSON.parse(Buffer.from(packageJsonData).toString());
                projectInfo.type = 'javascript';
                projectInfo.framework = this.detectFramework(packageJson);
                projectInfo.packageManager = await this.detectPackageManager(rootPath);
            } catch (e) {
                // package.json不存在
            }

            // 检测 requirements.txt (Python项目)
            const requirementsPath = vscode.Uri.joinPath(workspaceFolders[0].uri, 'requirements.txt');
            try {
                await vscode.workspace.fs.stat(requirementsPath);
                projectInfo.type = 'python';
            } catch (e) {
                // requirements.txt不存在
            }

            // 检测 pom.xml (Java Maven项目)
            const pomPath = vscode.Uri.joinPath(workspaceFolders[0].uri, 'pom.xml');
            try {
                await vscode.workspace.fs.stat(pomPath);
                projectInfo.type = 'java';
                projectInfo.framework = 'maven';
            } catch (e) {
                // pom.xml不存在
            }

            // 检测 build.gradle (Java Gradle项目)
            const gradlePath = vscode.Uri.joinPath(workspaceFolders[0].uri, 'build.gradle');
            try {
                await vscode.workspace.fs.stat(gradlePath);
                projectInfo.type = 'java';
                projectInfo.framework = 'gradle';
            } catch (e) {
                // build.gradle不存在
            }

            // 检测 Cargo.toml (Rust项目)
            const cargoPath = vscode.Uri.joinPath(workspaceFolders[0].uri, 'Cargo.toml');
            try {
                await vscode.workspace.fs.stat(cargoPath);
                projectInfo.type = 'rust';
            } catch (e) {
                // Cargo.toml不存在
            }

            // 检测 go.mod (Go项目)
            const goModPath = vscode.Uri.joinPath(workspaceFolders[0].uri, 'go.mod');
            try {
                await vscode.workspace.fs.stat(goModPath);
                projectInfo.type = 'go';
            } catch (e) {
                // go.mod不存在
            }
        } catch (error) {
            console.error('Error detecting project type:', error);
        }

        return projectInfo.type !== 'unknown' ? projectInfo : null;
    }

    /**
     * 根据语言ID获取分类
     */
    private static getCategoryFromLanguage(languageId: string): string {
        const categoryMap: { [key: string]: string } = {
            'javascript': '代码生成',
            'typescript': '代码生成',
            'python': '代码生成',
            'java': '代码生成',
            'csharp': '代码生成',
            'cpp': '代码生成',
            'c': '代码生成',
            'go': '代码生成',
            'rust': '代码生成',
            'php': '代码生成',
            'ruby': '代码生成',
            'swift': '代码生成',
            'kotlin': '代码生成',
            'html': '代码生成',
            'css': '代码生成',
            'json': '代码生成',
            'xml': '代码生成',
            'markdown': '文档编写',
            'yaml': '代码生成'
        };

        return categoryMap[languageId] || '其他';
    }

    /**
     * 检测JavaScript框架
     */
    private static detectFramework(packageJson: any): string | undefined {
        const dependencies = {
            ...packageJson.dependencies,
            ...packageJson.devDependencies
        };

        if (dependencies.react) return 'React';
        if (dependencies.vue) return 'Vue';
        if (dependencies.angular || dependencies['@angular/core']) return 'Angular';
        if (dependencies.next) return 'Next.js';
        if (dependencies.nuxt) return 'Nuxt.js';
        if (dependencies.svelte) return 'Svelte';
        if (dependencies.express) return 'Express';
        if (dependencies.koa) return 'Koa';
        if (dependencies.nestjs || dependencies['@nestjs/core']) return 'NestJS';

        return undefined;
    }

    /**
     * 检测包管理器
     */
    private static async detectPackageManager(rootPath: string): Promise<string | undefined> {
        const fs = require('fs');
        const path = require('path');

        if (fs.existsSync(path.join(rootPath, 'yarn.lock'))) {
            return 'yarn';
        }
        if (fs.existsSync(path.join(rootPath, 'pnpm-lock.yaml'))) {
            return 'pnpm';
        }
        if (fs.existsSync(path.join(rootPath, 'package-lock.json'))) {
            return 'npm';
        }

        return undefined;
    }

    /**
     * 根据语言和项目类型推荐提示词类别
     */
    static recommendCategories(languageInfo: LanguageInfo | null, projectInfo: ProjectInfo | null): string[] {
        const categories: string[] = [];

        if (languageInfo) {
            categories.push(languageInfo.category);
        }

        if (projectInfo) {
            switch (projectInfo.type) {
                case 'javascript':
                case 'python':
                case 'java':
                case 'rust':
                case 'go':
                    categories.push('代码优化', '代码审查', '测试用例');
                    break;
            }

            if (projectInfo.framework) {
                categories.push('架构设计');
            }
        }

        // 添加通用类别
        categories.push('Bug修复', '文档编写');

        // 去重
        return Array.from(new Set(categories));
    }
}

