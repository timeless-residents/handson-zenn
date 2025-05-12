require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { GEMINI_API_KEY } = require('./config/gemini');
const { OPENAI_API_KEY } = require('./config/openai');
const { AI_PROVIDER, REASONING_EFFORT } = require('./config/ai');
const { getClipboardContent, parseClipboardContent } = require('./utils/clipboard');
const { generateDateBasedSlug } = require('./utils/slug');
const { generateBookCover } = require('./services/coverGenerator');
const { enhanceStructure } = require('./services/structureEnhancer');
const { generateChapterContent } = require('./services/contentGenerator');
const { generateBookConfig } = require('./services/bookConfigGenerator');
const { generateArticle, generateArticleWithBookReference } = require('./services/articleGenerator');

// 環境変数を設定するためのヘルパー関数
function setAIProvider(provider) {
    process.env.AI_PROVIDER = provider;
    console.log(`🔄 AIプロバイダーを${provider}に切り替えました`);
}

// APIキー確認（および自動切り替え）
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

    // 現在のプロバイダー情報を表示
    const currentActualProvider = process.env.AI_PROVIDER || AI_PROVIDER;
    console.log(`🤖 AIプロバイダー: ${currentActualProvider}`);
    console.log(`🧠 推論努力レベル: ${REASONING_EFFORT}`);
    return true;
}

// API呼び出しを再試行する関数
async function retryAPICall(apiCallFn, errorHandlerFn = null, maxRetries = 3, initialDelay = 60000) {
    let lastError;
    let delay = initialDelay;
    let currentProvider = process.env.AI_PROVIDER || AI_PROVIDER;
    const originalProvider = currentProvider;

    // Gemini APIキーとOpenAI APIキーの両方が設定されているか確認
    const hasGeminiKey = !!GEMINI_API_KEY;
    const hasOpenAIKey = !!OPENAI_API_KEY;
    const canSwitchProvider = hasGeminiKey && hasOpenAIKey;

    let providerSwitchAttempted = false; // プロバイダーを切り替えたかどうかのフラグ

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await apiCallFn();
        } catch (error) {
            lastError = error;

            // エラーハンドラーが提供されている場合は実行
            if (errorHandlerFn) {
                errorHandlerFn(error, attempt);
            }

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

            // AIプロバイダーの切り替えを試みる（まだ試していない場合のみ）
            if (canSwitchProvider && !providerSwitchAttempted) {
                const newProvider = currentProvider === 'gemini' ? 'openai' : 'gemini';
                console.log(`⚠️ ${currentProvider}のAPIクォータ制限に達しました。${newProvider}に切り替えます...`);

                // プロバイダーを切り替え
                setAIProvider(newProvider);
                currentProvider = newProvider;
                providerSwitchAttempted = true;

                // すぐに再試行
                continue;
            }

            // プロバイダー切り替えができない場合や、すでに切り替えたが再度失敗した場合は待機して再試行
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

// メイン処理
async function main() {
    // APIキー確認と自動切り替え
    checkAPIKeys();

    // クリップボードの内容を取得して解析
    const clipboardContent = getClipboardContent();
    console.log('デバッグ: クリップボードの内容:', clipboardContent);

    // 書籍生成
    console.log('\n📚 書籍を生成中...');
    const { title: originalTitle, chapters: originalChapters } = parseClipboardContent(clipboardContent);

    // 構成を改善（APIクォータエラーに対応するため再試行メカニズム追加）
    console.log('📚 書籍の構成を改善中...');
    const enhanced = await retryAPICall(
        async () => enhanceStructure(originalTitle, originalChapters),
        (error, attempt) => console.error(`書籍構成の改善中にエラーが発生しました (試行 ${attempt}):`, error.message)
    );

    // Bookのスラッグを生成
    const bookSlug = generateDateBasedSlug('book');
    const bookDir = path.join(process.cwd(), 'books', bookSlug);
    fs.mkdirSync(bookDir, { recursive: true });

    // config.yaml を生成（再試行メカニズム追加）
    const configContent = await retryAPICall(
        async () => generateBookConfig(enhanced),
        (error, attempt) => console.error(`config.yaml生成中にエラーが発生しました (試行 ${attempt}):`, error.message)
    );

    fs.writeFileSync(path.join(bookDir, 'config.yaml'), configContent);

    // カバー画像を生成（再試行メカニズム追加）
    await retryAPICall(
        async () => generateBookCover(enhanced.title, bookDir),
        (error, attempt) => console.error(`カバー画像生成中にエラーが発生しました (試行 ${attempt}):`, error.message)
    );

    // 各チャプターのコンテンツを生成
    console.log('📝 チャプターのコンテンツを生成中...');
    for (const chapter of enhanced.chapters) {
        console.log(`  - ${chapter.title} を生成中...`);

        // チャプター生成に再試行メカニズムを追加
        const content = await retryAPICall(
            async () => generateChapterContent(chapter),
            (error, attempt) => console.error(`チャプター「${chapter.title}」生成中にエラーが発生しました (試行 ${attempt}):`, error.message)
        );

        const chapterContent = `---
title: "${chapter.title}"
---

${content}

## このチャプターの構成

${chapter.sections.map(section => `
### ${section.title}
${section.subsections.map(subsection => `- ${subsection}`).join('\n')}`).join('\n')}
`;
        fs.writeFileSync(path.join(bookDir, `${chapter.slug}.md`), chapterContent);

        // 生成成功を報告
        console.log(`    ✅ チャプター「${chapter.title}」を生成しました（${chapter.slug}）`);
    }

    // 完了報告
    console.log('\n✨ Zenn Book を生成しました！');
    console.log(`📗 タイトル: ${enhanced.title}`);
    console.log(`📁 Book スラッグ: ${bookSlug}`);
    console.log('\n📑 生成されたチャプター:');
    enhanced.chapters.forEach(chapter => {
        console.log(`\n🔖 ${chapter.title} (${chapter.slug})`);
        if (chapter.sections && chapter.sections.length > 0) {
            console.log('   セクション:');
            chapter.sections.forEach(section => {
                console.log(`   - ${section.title}`);
                if (section.subsections && section.subsections.length > 0) {
                    section.subsections.forEach(subsection => {
                        console.log(`     * ${subsection}`);
                    });
                }
            });
        }
    });
    console.log(`\n📂 保存先: ${bookDir}`);

    // 書籍を紹介する記事を生成
    console.log('\n📝 書籍を紹介する記事を生成中...');
    const { title, chapters } = parseClipboardContent(clipboardContent);

    // 書籍情報を作成
    const bookInfo = {
        title: enhanced.title,
        slug: bookSlug,
        chapters: enhanced.chapters,
        topics: enhanced.topics || []
    };

    // 書籍紹介記事を生成（再試行メカニズム追加）
    console.log(`📝 記事を ${process.env.AI_PROVIDER || AI_PROVIDER} で生成します...`);
    const article = await retryAPICall(
        async () => generateArticleWithBookReference(title, chapters, bookInfo),
        (error, attempt) => console.error(`記事生成中にエラーが発生しました (試行 ${attempt}):`, error.message)
    );

    const articleSlug = generateDateBasedSlug('article');
    const articlesDir = path.join(process.cwd(), 'articles');

    // articles ディレクトリの存在確認と作成
    if (!fs.existsSync(articlesDir)) {
        fs.mkdirSync(articlesDir, { recursive: true });
    }

    const articlePath = path.join(articlesDir, `${articleSlug}.md`);

    // 記事のフロントマターとコンテンツを作成
    const articleContent = `---
title: "${article.title}"
emoji: "${article.emoji}"
type: "${article.type}"
topics: ${JSON.stringify(article.topics)}
published: ${article.published}
---

${article.content}`;

    fs.writeFileSync(articlePath, articleContent);

    console.log('\n✨ Zenn Article を生成しました！');
    console.log(`📗 タイトル: ${article.title}`);
    console.log(`📁 Article スラッグ: ${articleSlug}`);
    console.log(`📂 保存先: ${articlePath}`);
    console.log(`📚 紹介されている書籍: ${enhanced.title} (${bookSlug})`);
}

main().catch(console.error);
