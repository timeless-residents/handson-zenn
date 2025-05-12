#!/usr/bin/env node
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { generateArticleWithBookReference } = require('../services/articleGenerator');
const { GEMINI_API_KEY } = require('../config/gemini');
const { OPENAI_API_KEY } = require('../config/openai');
const { AI_PROVIDER } = require('../config/ai');

// 環境変数を設定するためのヘルパー関数
function setAIProvider(provider) {
    process.env.AI_PROVIDER = provider;
    console.log(`🔄 AIプロバイダーを${provider}に切り替えました`);
}

// APIキー確認
function checkAPIKeys() {
    // 現在のAIプロバイダーを取得（環境変数が変更されている可能性がある）
    const currentProvider = process.env.AI_PROVIDER || AI_PROVIDER;

    // 両方のAPIキーをチェック
    const hasGeminiKey = !!GEMINI_API_KEY;
    const hasOpenAIKey = !!OPENAI_API_KEY;

    if (currentProvider === 'gemini' && !hasGeminiKey) {
        console.error('環境変数 GEMINI_API_KEY が設定されていません。');

        // OpenAI APIキーがあれば自動的に切り替え
        if (hasOpenAIKey) {
            console.log('OpenAI APIキーが利用可能なため、OpenAIに切り替えます。');
            setAIProvider('openai');
            return true;
        }

        console.error('.env ファイルに GEMINI_API_KEY を設定してください。');
        process.exit(1);
    } else if (currentProvider === 'openai' && !hasOpenAIKey) {
        console.error('環境変数 OPENAI_API_KEY が設定されていません。');

        // Gemini APIキーがあれば自動的に切り替え
        if (hasGeminiKey) {
            console.log('Gemini APIキーが利用可能なため、Geminiに切り替えます。');
            setAIProvider('gemini');
            return true;
        }

        console.error('.env ファイルに OPENAI_API_KEY を設定してください。');
        process.exit(1);
    }

    console.log(`🤖 AIプロバイダー: ${currentProvider}`);
    return true;
}

// 初期チェック
checkAPIKeys();

async function readBookConfig(bookDir) {
    try {
        const configPath = path.join(bookDir, 'config.yaml');
        const config = await fs.readFile(configPath, 'utf-8');
        
        // タイトルを抽出 (title: "書籍タイトル")
        const titleMatch = config.match(/title:\s*"(.+?)"/);
        const title = titleMatch ? titleMatch[1] : '';
        
        return { title };
    } catch (error) {
        console.error(`Error reading book config: ${error.message}`);
        process.exit(1);
    }
}

async function readChapters(bookDir) {
    try {
        // チャプターファイル（.md）を読み込む
        const files = await fs.readdir(bookDir);
        const chapterFiles = files.filter(file => 
            file.endsWith('.md') && file.startsWith('ch')
        );
        
        const chapters = [];
        
        for (const file of chapterFiles) {
            const content = await fs.readFile(path.join(bookDir, file), 'utf-8');
            
            // チャプタータイトルを抽出 (title: "チャプタータイトル")
            const titleMatch = content.match(/title:\s*"(.+?)"/);
            if (titleMatch) {
                const slug = file.replace('.md', '');
                chapters.push({
                    title: titleMatch[1],
                    slug
                });
            }
        }
        
        // チャプター番号順にソート
        return chapters.sort((a, b) => {
            const aNum = parseInt(a.slug.match(/ch(\d+)/)[1]);
            const bNum = parseInt(b.slug.match(/ch(\d+)/)[1]);
            return aNum - bNum;
        });
    } catch (error) {
        console.error(`Error reading chapters: ${error.message}`);
        process.exit(1);
    }
}

async function extractTopics(chapters) {
    // チャプタータイトルからトピックを抽出するロジック
    // （単純な例として、よく出てくる技術用語をトピックとする）
    
    const allTexts = chapters.map(chapter => chapter.title).join(' ');
    const techTerms = [
        'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js',
        'Python', 'Java', 'PHP', 'Ruby', 'Go', 'Rust', 'C#', 'C++',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD',
        'GraphQL', 'REST', 'API', 'WebSocket', 'SQL', 'NoSQL',
        'HTML', 'CSS', 'SCSS', 'Tailwind', 'Bootstrap', 'Material-UI',
        'Git', 'GitHub', 'GitLab', 'Machine Learning', 'AI', 'Data Science'
    ];
    
    const topics = [];
    
    for (const term of techTerms) {
        if (allTexts.includes(term)) {
            // スペースを取り除いて小文字に変換
            topics.push(term.toLowerCase().replace(/\s+/g, ''));
        }
    }
    
    // 最大5つまでのトピックに制限
    return topics.slice(0, 5);
}

async function generateDateBasedSlug(prefix) {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${prefix}-${year}${month}${day}-${hours}${minutes}${seconds}`;
}

// API呼び出しを再試行する関数
async function retryAPICall(apiCallFn, maxRetries = 3, initialDelay = 60000) {
    let lastError;
    let delay = initialDelay;
    let currentProvider = process.env.AI_PROVIDER || AI_PROVIDER;
    const originalProvider = currentProvider;

    // Gemini APIキーとOpenAI APIキーの両方が設定されているか確認
    const hasGeminiKey = !!GEMINI_API_KEY;
    const hasOpenAIKey = !!OPENAI_API_KEY;
    const canSwitchProvider = hasGeminiKey && hasOpenAIKey;

    let providerSwitchAttempted = false;  // プロバイダー切り替えフラグ

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await apiCallFn();
        } catch (error) {
            lastError = error;

            // APIクォータエラーかどうかを確認
            const isQuotaError = error.message && (
                error.message.includes('429') ||
                error.message.includes('Too Many Requests') ||
                error.message.includes('quota') ||
                error.message.includes('rate limit')
            );

            if (!isQuotaError) {
                // クォータエラー以外はすぐに失敗
                throw error;
            }

            // AIプロバイダーの切り替えを試みる（まだ切り替えていない場合のみ）
            if (canSwitchProvider && !providerSwitchAttempted) {
                const newProvider = currentProvider === 'gemini' ? 'openai' : 'gemini';
                console.log(`⚠️ ${currentProvider}のAPIクォータ制限に達しました。${newProvider}に切り替えます...`);

                // プロバイダーを切り替え
                setAIProvider(newProvider);
                currentProvider = newProvider;
                providerSwitchAttempted = true;  // 切り替えフラグを立てる

                // すぐに再試行
                continue;
            }

            // プロバイダー切り替えができない場合は待機して再試行
            if (attempt < maxRetries) {
                // エラーメッセージから待機時間を抽出（もし含まれていれば）
                let retryDelay = delay;

                // エラーメッセージから待機時間を抽出（フォーマットが異なる場合がある）
                if (error.message) {
                    // 複数のパターンを試す
                    const patterns = [
                        /retryDelay:"(\d+)s"/,
                        /retryDelay[":]\s*["']?(\d+)s["']?/,
                        /retry[Aa]fter[":]\s*(\d+)/
                    ];

                    for (const pattern of patterns) {
                        const match = error.message.match(pattern);
                        if (match && match[1]) {
                            // 秒をミリ秒に変換して、少し余裕を持たせる
                            retryDelay = parseInt(match[1]) * 1000 + 5000;
                            break;
                        }
                    }
                }

                // エラー詳細から待機時間を抽出
                if (error.errorDetails && Array.isArray(error.errorDetails)) {
                    for (const detail of error.errorDetails) {
                        if (detail['@type']?.includes('RetryInfo') && detail.retryDelay) {
                            const secondsMatch = detail.retryDelay.match(/(\d+)s/);
                            if (secondsMatch && secondsMatch[1]) {
                                retryDelay = parseInt(secondsMatch[1]) * 1000 + 5000;
                                break;
                            }
                        }
                    }
                }

                console.log(`⏳ APIクォータ制限に達しました。${Math.ceil(retryDelay/1000)}秒後に再試行します (試行 ${attempt}/${maxRetries})...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));

                // 次の再試行では待機時間を2倍に（指数バックオフ）
                delay = delay * 2;
            }
        }
    }

    // 元のプロバイダーに戻す（複数回呼び出す場合に備えて）
    if (currentProvider !== originalProvider) {
        setAIProvider(originalProvider);
    }

    // 全ての再試行が失敗した場合
    throw lastError;
}

async function retryArticleGeneration(bookPath) {
    try {
        // 絶対パスを取得
        const bookDir = path.resolve(process.cwd(), bookPath);

        // 書籍ディレクトリの存在確認
        try {
            await fs.access(bookDir);
        } catch (error) {
            console.error(`指定された書籍ディレクトリが存在しません: ${bookDir}`);
            process.exit(1);
        }

        // 書籍の設定とチャプターを読み込む
        const { title } = await readBookConfig(bookDir);
        const chapters = await readChapters(bookDir);
        const topics = await extractTopics(chapters);

        // 書籍のスラッグを抽出（ディレクトリ名の最後の部分）
        const bookSlug = path.basename(bookDir);

        console.log(`📚 書籍「${title}」から記事を生成します...`);
        console.log(`📁 Book スラッグ: ${bookSlug}`);
        console.log(`📑 チャプター数: ${chapters.length}`);
        console.log(`🏷️ トピック: ${topics.join(', ') || 'なし'}`);

        // 書籍情報を作成
        const bookInfo = {
            title,
            slug: bookSlug,
            chapters,
            topics
        };

        // Articleのコンテンツを生成（再試行メカニズム付き）
        console.log('\n📝 記事のコンテンツを生成中...');

        // 記事生成関数を再試行メカニズムでラップ
        console.log(`📝 記事を ${process.env.AI_PROVIDER || AI_PROVIDER} で生成します...`);
        const article = await retryAPICall(async () => {
            return await generateArticleWithBookReference(title, chapters.map(ch => ch.title).join(', '), bookInfo);
        });

        // 記事のスラッグを生成
        const articleSlug = await generateDateBasedSlug('article');
        const articlesDir = path.join(process.cwd(), 'articles');
        const articlePath = path.join(articlesDir, `${articleSlug}.md`);

        // articles ディレクトリの存在確認と作成
        try {
            await fs.access(articlesDir);
        } catch (error) {
            await fs.mkdir(articlesDir, { recursive: true });
        }

        // 記事のフロントマターとコンテンツを作成
        const articleContent = `---
title: "${article.title}"
emoji: "${article.emoji}"
type: "${article.type}"
topics: ${JSON.stringify(article.topics)}
published: ${article.published}
---

${article.content}`;

        // 記事を保存
        await fs.writeFile(articlePath, articleContent, 'utf-8');

        console.log('\n✨ Zenn Article を生成しました！');
        console.log(`📗 タイトル: ${article.title}`);
        console.log(`📁 Article スラッグ: ${articleSlug}`);
        console.log(`📂 保存先: ${articlePath}`);
        console.log(`📚 紹介されている書籍: ${title} (${bookSlug})`);

        return articlePath;
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

// コマンドライン引数を処理
if (require.main === module) {
    const bookPath = process.argv[2];
    
    if (!bookPath) {
        console.error('Usage: node retry-article.js <book-directory-path>');
        console.error('Example: node retry-article.js books/book-20250513-002839');
        process.exit(1);
    }
    
    retryArticleGeneration(bookPath).catch(error => {
        console.error('Error:', error.message);
        process.exit(1);
    });
}

module.exports = {
    retryArticleGeneration
};