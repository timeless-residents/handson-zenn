const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GEMINI_API_KEY } = require('../config/gemini');

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function generateArticleContent(title, chapters) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
技術記事「${title}」を13,000字を目安に書いてください。以下の要件に従ってください：

- Markdown形式で書く
- 技術的な正確性を重視
- コードサンプルを含める（該当する場合）
- 実践的で具体的な例を含める
- 段階的な説明で理解しやすくする
- 結論と次のステップを含める

構成素材情報: ${chapters}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

async function generateArticleEmoji(title, chapters) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
技術記事「${title}」に最適な絵文字を1つ選んでください。
構成素材情報: ${chapters}

以下の条件を考慮してください：
- 記事の内容を視覚的に表現できる
- 技術的なトピックに相応しい
- 分かりやすく親しみやすい

絵文字だけを返してください。説明は不要です。
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
}

async function generateArticleTopics(title, chapters) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().replace(/^-\s*/, '').replace(/\s+/g, '').split(",");
}

async function generateArticle(title, chapters) {
    const content = await generateArticleContent(title, chapters);
    const emoji = await generateArticleEmoji(title, chapters);
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
}

module.exports = {
    generateArticle
};
