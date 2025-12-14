"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18n = void 0;
const vscode = require("vscode");
const translations = {
    'extension.name': {
        'zh-CN': '提示词助手',
        'en-US': 'Prompt Helper',
        'ja-JP': 'プロンプトヘルパー',
        'ko-KR': '프롬프트 도우미'
    },
    'panel.title': {
        'zh-CN': '提示词助手',
        'en-US': 'Prompt Helper',
        'ja-JP': 'プロンプトヘルパー',
        'ko-KR': '프롬프트 도우미'
    },
    'button.add': {
        'zh-CN': '添加新提示词',
        'en-US': 'Add New Prompt',
        'ja-JP': '新しいプロンプトを追加',
        'ko-KR': '새 프롬프트 추가'
    },
    'button.fetch': {
        'zh-CN': '获取常用提示词',
        'en-US': 'Fetch Common Prompts',
        'ja-JP': '一般的なプロンプトを取得',
        'ko-KR': '일반 프롬프트 가져오기'
    },
    'button.insert': {
        'zh-CN': '插入',
        'en-US': 'Insert',
        'ja-JP': '挿入',
        'ko-KR': '삽입'
    },
    'button.copy': {
        'zh-CN': '复制',
        'en-US': 'Copy',
        'ja-JP': 'コピー',
        'ko-KR': '복사'
    },
    'button.delete': {
        'zh-CN': '删除',
        'en-US': 'Delete',
        'ja-JP': '削除',
        'ko-KR': '삭제'
    },
    'button.favorite': {
        'zh-CN': '收藏',
        'en-US': 'Favorite',
        'ja-JP': 'お気に入り',
        'ko-KR': '즐겨찾기'
    },
    'button.unfavorite': {
        'zh-CN': '取消收藏',
        'en-US': 'Unfavorite',
        'ja-JP': 'お気に入りから削除',
        'ko-KR': '즐겨찾기 제거'
    },
    'filter.all': {
        'zh-CN': '全部',
        'en-US': 'All',
        'ja-JP': 'すべて',
        'ko-KR': '전체'
    },
    'filter.favorites': {
        'zh-CN': '仅收藏',
        'en-US': 'Favorites Only',
        'ja-JP': 'お気に入りのみ',
        'ko-KR': '즐겨찾기만'
    },
    'search.placeholder': {
        'zh-CN': '搜索提示词...',
        'en-US': 'Search prompts...',
        'ja-JP': 'プロンプトを検索...',
        'ko-KR': '프롬프트 검색...'
    },
    'category.all': {
        'zh-CN': '全部分类',
        'en-US': 'All Categories',
        'ja-JP': 'すべてのカテゴリ',
        'ko-KR': '전체 카테고리'
    },
    'empty.noPrompts': {
        'zh-CN': '暂无提示词',
        'en-US': 'No prompts available',
        'ja-JP': 'プロンプトがありません',
        'ko-KR': '사용 가능한 프롬프트 없음'
    },
    'message.inserted': {
        'zh-CN': '已插入提示词',
        'en-US': 'Prompt inserted',
        'ja-JP': 'プロンプトが挿入されました',
        'ko-KR': '프롬프트 삽입됨'
    },
    'message.copied': {
        'zh-CN': '已复制到剪贴板',
        'en-US': 'Copied to clipboard',
        'ja-JP': 'クリップボードにコピーしました',
        'ko-KR': '클립보드에 복사됨'
    },
    'message.favorited': {
        'zh-CN': '已收藏',
        'en-US': 'Favorited',
        'ja-JP': 'お気に入りに追加しました',
        'ko-KR': '즐겨찾기에 추가됨'
    },
    'message.unfavorited': {
        'zh-CN': '已取消收藏',
        'en-US': 'Unfavorited',
        'ja-JP': 'お気に入りから削除しました',
        'ko-KR': '즐겨찾기에서 제거됨'
    },
    'message.noCodeSelected': {
        'zh-CN': '请先选择代码',
        'en-US': 'Please select code first',
        'ja-JP': 'コードを選択してください',
        'ko-KR': '코드를 먼저 선택하세요'
    },
    'message.generated': {
        'zh-CN': '提示词已生成',
        'en-US': 'Prompt generated',
        'ja-JP': 'プロンプトが生成されました',
        'ko-KR': '프롬프트 생성됨'
    },
    'message.uploaded': {
        'zh-CN': '上传成功',
        'en-US': 'Upload successful',
        'ja-JP': 'アップロード成功',
        'ko-KR': '업로드 성공'
    },
    'message.downloaded': {
        'zh-CN': '成功下载 {count} 个提示词',
        'en-US': 'Successfully downloaded {count} prompts',
        'ja-JP': '{count}個のプロンプトをダウンロードしました',
        'ko-KR': '{count}개의 프롬프트 다운로드 완료'
    },
    'message.noRecommendations': {
        'zh-CN': '暂无推荐',
        'en-US': 'No recommendations',
        'ja-JP': '推奨がありません',
        'ko-KR': '추천 없음'
    },
    'message.emptyLibrary': {
        'zh-CN': '提示词库为空，是否要从网络获取常用提示词？',
        'en-US': 'Prompt library is empty. Would you like to fetch common prompts?',
        'ja-JP': 'プロンプトライブラリが空です。一般的なプロンプトを取得しますか？',
        'ko-KR': '프롬프트 라이브러리가 비어 있습니다. 일반 프롬프트를 가져오시겠습니까?'
    },
    'prompt.selectTemplate': {
        'zh-CN': '选择模板',
        'en-US': 'Select template',
        'ja-JP': 'テンプレートを選択',
        'ko-KR': '템플릿 선택'
    },
    'prompt.selectUpload': {
        'zh-CN': '选择要上传的提示词',
        'en-US': 'Select prompt to upload',
        'ja-JP': 'アップロードするプロンプトを選択',
        'ko-KR': '업로드할 프롬프트 선택'
    },
    'prompt.recommended': {
        'zh-CN': '智能推荐的提示词',
        'en-US': 'Smart recommended prompts',
        'ja-JP': 'スマート推奨プロンプト',
        'ko-KR': '스마트 추천 프롬프트'
    },
    'progress.downloading': {
        'zh-CN': '正在下载提示词...',
        'en-US': 'Downloading prompts...',
        'ja-JP': 'プロンプトをダウンロード中...',
        'ko-KR': '프롬프트 다운로드 중...'
    },
    'button.yes': {
        'zh-CN': '是',
        'en-US': 'Yes',
        'ja-JP': 'はい',
        'ko-KR': '예'
    },
    'button.no': {
        'zh-CN': '否',
        'en-US': 'No',
        'ja-JP': 'いいえ',
        'ko-KR': '아니오'
    }
};
class I18n {
    static initialize() {
        // 获取系统语言
        const systemLanguage = vscode.env.language;
        if (systemLanguage.startsWith('zh')) {
            this.language = 'zh-CN';
        }
        else if (systemLanguage.startsWith('ja')) {
            this.language = 'ja-JP';
        }
        else if (systemLanguage.startsWith('ko')) {
            this.language = 'ko-KR';
        }
        else {
            this.language = 'en-US';
        }
    }
    static setLanguage(lang) {
        this.language = lang;
    }
    static getLanguage() {
        return this.language;
    }
    static t(key) {
        const translation = translations[key];
        if (!translation) {
            return key;
        }
        return translation[this.language] || translation['en-US'] || key;
    }
    static tWithFallback(key, fallback) {
        const translation = translations[key];
        if (!translation) {
            return fallback;
        }
        return translation[this.language] || translation['en-US'] || fallback;
    }
}
exports.I18n = I18n;
I18n.language = 'zh-CN';
//# sourceMappingURL=i18n.js.map