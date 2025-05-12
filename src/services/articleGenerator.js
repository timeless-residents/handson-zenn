const { getAICompletion } = require('../config/ai');

async function generateArticleContent(title, chapters, bookInfo = null) {
    let bookReference = '';
    if (bookInfo) {
        bookReference = `
また、この記事は『${bookInfo.title}』という書籍の内容を紹介しています。
以下の書籍情報を記事の最後に必ず含めてください：

- 書籍タイトル：${bookInfo.title}
- 書籍スラッグ：${bookInfo.slug}
- チャプター数：${bookInfo.chapters.length}
- 主なトピック：${bookInfo.topics ? bookInfo.topics.join(', ') : 'なし'}

記事の最後に、書籍へのリンクとして以下の形式で紹介してください：
\`\`\`
:::message
より詳しい内容は書籍『${bookInfo.title}』をご覧ください。
https://zenn.dev/books/${bookInfo.slug}
:::
\`\`\`
`;
    }

    // ショートバージョン（APIクォータエラーが発生する場合に使用）
    const shortPrompt = `
技術記事「${title}」について、日本語で簡潔に2000-3000字で執筆してください。
必ず日本語で記載してください。英語での出力は避けてください。
${chapters}
${bookReference}

形式：Markdown
出力言語：日本語
`;

    // 通常バージョン（クォータに余裕がある場合）
    const fullPrompt = `
技術記事「${title}」を日本語で10,000字を目安に書いてください。以下の要件に従ってください：

- 日本語でMarkdown形式で書く（必ず日本語で出力）
- 技術的な正確性を重視
- コードサンプルを含める（該当する場合）
- 実践的で具体的な例を含める
- 段階的な説明で理解しやすくする
- 結論と次のステップを含める

構成素材情報: ${chapters}
${bookReference}

出力言語：日本語
`;

    try {
        // 現在のAIプロバイダーに応じてプロンプトの長さを調整
        const currentProvider = process.env.AI_PROVIDER || 'gemini';
        const prompt = currentProvider === 'openai' ? shortPrompt : fullPrompt;

        // プロタイプのモデルを使用（Geminiの場合はpro、OpenAIの場合はgpt4に自動マッピング）
        return await getAICompletion(prompt, 'pro');
    } catch (error) {
        console.error('記事の本文生成中にエラーが発生しました:', error);

        // エラーの場合、より短いプロンプトで再試行
        if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
            console.log('📝 トークン制限に到達しました。より短いプロンプトで再試行します...');
            return await getAICompletion(shortPrompt, 'pro');
        }

        throw error;
    }
}

async function generateArticleEmoji(title, chapters) {
    // 短いプロンプト版（トークン節約）
    const shortPrompt = `技術記事「${title}」に最適な絵文字を1つだけ返してください。長い説明は不要です。（${chapters}）出力言語：日本語`;

    // 詳細なプロンプト版
    const fullPrompt = `
技術記事「${title}」に最適な絵文字を1つ選んでください。
構成素材情報: ${chapters}

以下の条件を考慮してください：
- 記事の内容を視覚的に表現できる
- 技術的なトピックに相応しい
- 分かりやすく親しみやすい

絵文字だけを返してください。説明は不要です。
出力言語：日本語
`;

    try {
        // AIプロバイダーによってプロンプトの長さを調整
        const currentProvider = process.env.AI_PROVIDER || 'gemini';
        const prompt = currentProvider === 'openai' ? shortPrompt : fullPrompt;

        const response = await getAICompletion(prompt, 'pro');
        return response.trim();
    } catch (error) {
        console.error('絵文字生成中にエラーが発生しました:', error);

        // エラー時は短いプロンプトで再試行
        if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
            return await getAICompletion(shortPrompt, 'pro');
        }

        // デフォルト絵文字（エラー時のフォールバック）
        console.log('⚠️ 絵文字の生成に失敗しました。デフォルト絵文字を使用します');
        return '📚';
    }
}

async function generateArticleTopics(title, chapters) {
    // 短いプロンプト版
    const shortPrompt = `技術記事「${title}」に最適な英語のタグを5つカンマ区切りで返してください。英語で回答してください。例：javascript,react,web,frontend,ui`;

    // 詳細なプロンプト版
    const fullPrompt = `
技術記事「${title}」に最適な
ハッシュタグ記号を取り除いた英語のハッシュタグリストを5つ選んでください。
構成素材情報: ${chapters}

以下の条件を考慮してください：
- 記事の内容を視覚的に表現できる
- 技術的なトピックに相応しい
- 分かりやすく親しみやすい

カンマ区切りで返してください。テキストに記号、空白は含めないでください。
ハッシュタグ記号、説明は不要です。
出力例： topic1,topic2,topic3,topic4,topic5
`;

    try {
        // AIプロバイダーによってプロンプトの長さを調整
        const currentProvider = process.env.AI_PROVIDER || 'gemini';
        const prompt = currentProvider === 'openai' ? shortPrompt : fullPrompt;

        const response = await getAICompletion(prompt, 'pro');
        return response.trim().replace(/^-\s*/, '').replace(/\s+/g, '').split(",");
    } catch (error) {
        console.error('トピック生成中にエラーが発生しました:', error);

        // エラー時は短いプロンプトで再試行
        if (error.message && (error.message.includes('429') || error.message.includes('quota'))) {
            try {
                return await getAICompletion(shortPrompt, 'pro')
                    .then(res => res.trim().replace(/^-\s*/, '').replace(/\s+/g, '').split(","));
            } catch (e) {
                // それでも失敗した場合はデフォルトトピックを返す
                console.log('⚠️ トピックの生成に失敗しました。デフォルトトピックを使用します');
                return ["tech", "programming", "development", "tutorial", "guide"];
            }
        }

        throw error;
    }
}

async function generateArticleWithBookReference(title, chapters, bookInfo = null) {
    try {
        // 大きな処理をまとめて行うより、個別に処理して失敗した場合の影響を最小限に
        console.log('- 記事の本文を生成中...');
        const content = await generateArticleContent(title, chapters, bookInfo);

        console.log('- 記事の絵文字を生成中...');
        const emoji = await generateArticleEmoji(title, chapters);

        console.log('- 記事のトピックを生成中...');
        const topic = await generateArticleTopics(title, chapters);

        const article = {
            title,
            emoji,
            type: "tech",
            topics: topic,
            published: false,
            content
        };

        return article;
    } catch (error) {
        console.error('記事生成中にエラーが発生しました:', error.message);
        throw error; // 再試行のためにエラーを再スロー
    }
}

async function generateArticle(title, chapters) {
    return generateArticleWithBookReference(title, chapters);
}

module.exports = {
    generateArticle,
    generateArticleWithBookReference
};
